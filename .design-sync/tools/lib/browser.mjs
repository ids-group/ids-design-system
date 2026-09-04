// One long-lived Chrome, driven over CDP, instead of a process per page.
//
// Both card tools used to spawn `chrome --dump-dom` once per card. That is 410 browser launches
// plus 410 cold boots of the 2.12 MB bundle, and the launches were most of the wall clock — the
// render itself is fast. Here the browser starts once and each card is a TAB: the isolation that
// made lanes safe is still there (a hung page closes with its target and cannot reach another),
// but nothing pays for a process start.
//
// `--virtual-time-budget` is a process-level flag and cannot come with it, but CDP has the same
// thing per target: `Emulation.setVirtualTimePolicy`. It is not an optimisation, it is required —
// the page scripts wait on `setTimeout` chains of up to 20s, and on a real clock a run that took
// three minutes took twenty-five instead.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const DEVTOOLS_LINE = /DevTools listening on (ws:\/\/\S+)/;

export async function launchBrowser({
  chrome,
  width,
  height,
  startupTimeout = 30000,
}) {
  if (typeof WebSocket === 'undefined') {
    throw new Error(
      'This Node has no global WebSocket, so CDP is unreachable — Node 22.4+ is needed.',
    );
  }

  const profile = mkdtempSync(join(tmpdir(), 'ds-cdp-'));
  const child = spawn(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      `--user-data-dir=${profile}`,
      `--window-size=${width},${height}`,
      '--remote-debugging-port=0',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );

  const endpoint = await new Promise((resolve, reject) => {
    let buffered = '';
    const giveUp = setTimeout(
      () =>
        reject(
          new Error(
            `Chrome printed no DevTools endpoint in ${startupTimeout}ms`,
          ),
        ),
      startupTimeout,
    );
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      buffered += chunk;
      const found = buffered.match(DEVTOOLS_LINE);
      if (!found) return;
      clearTimeout(giveUp);
      resolve(found[1]);
    });
    child.on('exit', (code) => {
      clearTimeout(giveUp);
      reject(new Error(`Chrome exited with ${code} before it was reachable`));
    });
  });

  const socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener(
      'error',
      () => reject(new Error('Could not open the CDP socket')),
      { once: true },
    );
  });

  let nextId = 0;
  const pending = new Map();
  // Keyed by session so two tabs waiting on the same event name do not wake each other.
  const waiters = [];

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id !== undefined) {
      const settle = pending.get(message.id);
      if (!settle) return;
      pending.delete(message.id);
      if (message.error)
        settle.reject(new Error(`${message.error.message} (${settle.method})`));
      else settle.resolve(message.result);

      return;
    }
    for (let index = waiters.length - 1; index >= 0; index -= 1) {
      const waiter = waiters[index];
      if (
        waiter.method !== message.method ||
        waiter.sessionId !== message.sessionId
      )
        continue;
      waiters.splice(index, 1);
      waiter.resolve(message.params);
    }
  });

  const send = (method, params, sessionId) =>
    new Promise((resolve, reject) => {
      const id = (nextId += 1);
      pending.set(id, { resolve, reject, method });
      socket.send(
        JSON.stringify(
          sessionId
            ? { id, method, params, sessionId }
            : { id, method, params },
        ),
      );
    });

  const once = (method, sessionId, timeout) =>
    new Promise((resolve, reject) => {
      const waiter = { method, sessionId, resolve };
      waiters.push(waiter);
      setTimeout(() => {
        const index = waiters.indexOf(waiter);
        if (index < 0) return;
        waiters.splice(index, 1);
        reject(new Error(`${method} never fired within ${timeout}ms`));
      }, timeout).unref?.();
    });

  return {
    /** Opens a tab on `url`, runs its scripts under a virtual clock until `budget` virtual ms have
     *  passed, then evaluates `expression` and closes the tab. `expression` is read AFTER time has
     *  stopped, so it must be synchronous — a Promise on a paused clock never settles. */
    async render(url, expression, { timeout = 60000, budget = 25000 } = {}) {
      const { targetId } = await send('Target.createTarget', {
        url: 'about:blank',
      });
      let sessionId = null;
      try {
        ({ sessionId } = await send('Target.attachToTarget', {
          targetId,
          flatten: true,
        }));
        await send('Page.enable', {}, sessionId);
        // Paused BEFORE the navigation so the page's first frame already runs on the virtual clock;
        // granting the budget after it is what starts time moving.
        await send(
          'Emulation.setVirtualTimePolicy',
          { policy: 'pause' },
          sessionId,
        );
        const expired = once(
          'Emulation.virtualTimeBudgetExpired',
          sessionId,
          timeout,
        );
        await send('Page.navigate', { url }, sessionId);
        await send(
          'Emulation.setVirtualTimePolicy',
          {
            policy: 'pauseIfNetworkFetchesPending',
            budget,
          },
          sessionId,
        );
        await expired;
        const { result, exceptionDetails } = await send(
          'Runtime.evaluate',
          {
            expression,
            returnByValue: true,
          },
          sessionId,
        );
        // Never quiet: a page-side throw returns the same empty string as a card that simply did
        // not settle, and one unterminated string literal in the expression cost a whole run of
        // 377 identical silent failures before anyone saw the reason.
        if (exceptionDetails) {
          console.error(
            `  page threw on ${url}: ${exceptionDetails.exception?.description ?? exceptionDetails.text}`,
          );

          return '';
        }

        return result.value ?? '';
      } catch (error) {
        // An empty string is what the callers treat as "this card did not render", but a silent one
        // is unreadable: set DS_CDP_DEBUG to see which CDP call refused and why.
        if (process.env.DS_CDP_DEBUG)
          console.error(`  cdp: ${url} — ${error.message}`);

        return '';
      } finally {
        await send('Target.closeTarget', { targetId }).catch(() => {});
      }
    },

    async close() {
      await send('Browser.close').catch(() => {});
      socket.close();
      await new Promise((resolve) => {
        child.once('exit', resolve);
        setTimeout(() => {
          child.kill();
          resolve();
        }, 5000).unref?.();
      });
      rmSync(profile, { recursive: true, force: true });
    },
  };
}
