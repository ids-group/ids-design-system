// One long-lived Chrome, driven over CDP, instead of a process per page.
//
// Both card tools used to spawn `chrome --dump-dom` once per card. That is 410 browser launches
// plus 410 cold boots of the 2.12 MB bundle, and the launches were most of the wall clock — the
// render itself is fast. Here the browser starts once and each lane is a WINDOW: the isolation that
// made lanes safe is still there (a page that fails closes with its window and cannot reach
// another), but nothing pays for a process start.
//
// The clock is the real one, and each lane is its own window rather than a tab. Virtual time ran
// timers far ahead of rendering and froze it at the budget, and a background tab gets no frames at
// all, so whether a ResizeObserver or IntersectionObserver had delivered by the read was a race
// between lanes. The read is the caller's Promise instead: it resolves when the page says it has
// settled.
import { spawn, spawnSync } from 'node:child_process';
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

  // A run that throws or is interrupted before `close()` would leave Chrome and its profile
  // behind. Synchronous because an `exit` handler gets no turn of the loop, and on Windows the
  // renderer processes keep the profile locked unless the whole tree goes first. Even then the
  // lock outlives taskkill by a moment, and `rmSync` does not retry an EPERM, hence the loop.
  const abandon = () => {
    if (child.exitCode === null && child.signalCode === null) {
      if (process.platform === 'win32')
        spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
          stdio: 'ignore',
        });
      else child.kill('SIGKILL');
    }
    const pause = new Int32Array(new SharedArrayBuffer(4));
    for (let attempt = 0; attempt < 50; attempt++) {
      try {
        rmSync(profile, { recursive: true, force: true });
        return;
      } catch {
        Atomics.wait(pause, 0, 0, 100);
      }
    }
  };
  const interrupted = (signal) => {
    abandon();
    process.exit(signal === 'SIGINT' ? 130 : 143);
  };
  process.once('exit', abandon);
  process.once('SIGINT', interrupted);
  process.once('SIGTERM', interrupted);

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

  // A command is only ever settled by a reply carrying its id, so a browser that dies mid-run left
  // every lane awaiting a reply that can no longer come: the queue stopped, the HTTP server held the
  // event loop, and the process hung until CI timed the step out — indistinguishable from slow.
  let dead = null;
  const die = (reason) => {
    if (dead) return;
    dead = new Error(reason);
    for (const [, settle] of pending) settle.reject(dead);
    pending.clear();
    for (const waiter of waiters.splice(0)) waiter.reject(dead);
  };
  socket.addEventListener('close', () => die('the CDP socket closed'), {
    once: true,
  });
  socket.addEventListener('error', () => die('the CDP socket errored'), {
    once: true,
  });
  child.on('exit', (code) => die(`Chrome exited with ${code}`));

  // A command carries its own deadline, because `die()` only fires when the socket closes or the
  // process exits. A chrome that is still up but has stopped answering — a wedged renderer, a
  // half-open connection with no FIN — would otherwise leave every lane waiting on a reply forever,
  // which is the original hang by another route.
  const COMMAND_TIMEOUT = 90000;
  const send = (method, params, sessionId) =>
    new Promise((resolve, reject) => {
      if (dead) {
        reject(dead);

        return;
      }
      const id = (nextId += 1);
      const timer = setTimeout(() => {
        if (!pending.delete(id)) return;
        reject(new Error(`${method} got no reply in ${COMMAND_TIMEOUT}ms`));
      }, COMMAND_TIMEOUT);
      pending.set(id, {
        method,
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
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
      const waiter = { method, sessionId, resolve, reject };
      waiters.push(waiter);
      setTimeout(() => {
        const index = waiters.indexOf(waiter);
        if (index < 0) return;
        waiters.splice(index, 1);
        reject(new Error(`${method} never fired within ${timeout}ms`));
      }, timeout).unref?.();
    });

  // A window per lane, navigated card to card. A window per card is a fresh renderer per card, and
  // five of them starting at once contend for the CPU: 48 s against 13 s for 60 cards, measured
  // 2026-10-22. A window that failed is closed rather than reused.
  const idle = [];
  const openWindow = async () => {
    const { targetId } = await send('Target.createTarget', {
      url: 'about:blank',
      newWindow: true,
    });
    const { sessionId } = await send('Target.attachToTarget', {
      targetId,
      flatten: true,
    });
    await send('Page.enable', {}, sessionId);

    return { targetId, sessionId };
  };

  return {
    /** Navigates a window to `url` and evaluates `expression` once its DOM is parsed. A Promise it
     *  returns is awaited, so the page decides when it is ready to be read. */
    async render(url, expression, { timeout = 60000 } = {}) {
      // Inside the try with everything else: opening the tab used to throw past the caller, which
      // rejected its lane and tore the browser down under the four still rendering — losing the
      // whole run and the tool's own report of what failed.
      let target = null;
      let reusable = false;
      try {
        target = idle.pop() ?? (await openWindow());
        const { sessionId } = target;
        // The catch is on the WAITER, not on the await below: if navigating rejects first, control
        // leaves before `await loaded`, and its own timeout then rejects a promise nobody is
        // holding — an unhandled rejection, which Node turns into a dead process a minute later,
        // in the middle of an otherwise fine run.
        const loaded = once('Page.domContentEventFired', sessionId, timeout);
        loaded.catch(() => {});
        await send('Page.navigate', { url }, sessionId);
        await loaded;
        const { result, exceptionDetails } = await send(
          'Runtime.evaluate',
          {
            expression,
            returnByValue: true,
            awaitPromise: true,
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
        reusable = true;

        return result.value ?? '';
      } catch (error) {
        // An empty string is what the callers treat as "this card did not render", but a silent one
        // is unreadable: set DS_CDP_DEBUG to see which CDP call refused and why.
        if (process.env.DS_CDP_DEBUG)
          console.error(`  cdp: ${url} — ${error.message}`);

        return '';
      } finally {
        if (target && reusable) {
          idle.push(target);
        } else if (target) {
          await send('Target.closeTarget', {
            targetId: target.targetId,
          }).catch(() => {});
        }
      }
    },

    async close() {
      await send('Browser.close').catch(() => {});
      socket.close();
      // A chrome that already exited will never emit `exit` again, and the fallback timer was
      // unref'd, so nothing held the loop: the await never settled, Node bailed with code 13, and
      // the caller's own report — which cards failed, and the file it was about to write — was
      // never reached. That is the case this whole module exists to survive.
      if (child.exitCode === null && child.signalCode === null) {
        await new Promise((resolve) => {
          const timer = setTimeout(() => {
            child.kill();
            resolve();
          }, 5000);
          child.once('exit', () => {
            clearTimeout(timer);
            resolve();
          });
        });
      }
      rmSync(profile, { recursive: true, force: true });
      process.off('exit', abandon);
      process.off('SIGINT', interrupted);
      process.off('SIGTERM', interrupted);
    },
  };
}
