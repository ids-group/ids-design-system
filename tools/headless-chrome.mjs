// Headless Chrome over CDP: one page, a throwaway profile, and the handful of helpers the visual and
// performance tools here need. No dependency on Puppeteer.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

export function findChrome() {
  const found = CANDIDATES.find((path) => path && existsSync(path));
  if (!found)
    throw new Error('Chrome not found. Set CHROME_PATH to its executable.');
  return found;
}

// CDP_BROWSER_URL (e.g. http://127.0.0.1:9223) attaches to a running Chrome instead of launching one:
// the page opens as a tab of that browser and close() closes only that tab.
export async function open(
  url,
  {
    throttle = 1,
    initScript = '',
    chromePath,
    args = [],
    browserUrl = process.env.CDP_BROWSER_URL,
  } = {},
) {
  let chrome = null;
  let profile = null;
  let endpoint;
  if (browserUrl) {
    const version = await fetch(`${browserUrl}/json/version`).then((response) =>
      response.json(),
    );
    endpoint = version.webSocketDebuggerUrl;
  } else {
    profile = mkdtempSync(join(tmpdir(), 'ds-headless-'));
    chrome = spawn(
      chromePath ?? findChrome(),
      [
        '--headless=new',
        `--user-data-dir=${profile}`,
        '--window-size=1440,900',
        '--remote-debugging-port=0',
        ...args,
        'about:blank',
      ],
      { stdio: ['ignore', 'ignore', 'pipe'] },
    );
    endpoint = await new Promise((resolve, reject) => {
      let buffer = '';
      chrome.stderr.on('data', (chunk) => {
        buffer += chunk;
        const match = buffer.match(/DevTools listening on (ws:\/\/\S+)/);
        if (match) resolve(match[1]);
      });
      chrome.once('exit', (code) =>
        reject(
          new Error(`Chrome exited with ${code} before listening:\n${buffer}`),
        ),
      );
    });
  }

  const socket = new WebSocket(endpoint);
  await new Promise((resolve) =>
    socket.addEventListener('open', resolve, { once: true }),
  );
  let nextId = 0;
  const waiting = new Map();
  const listeners = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && waiting.has(message.id)) {
      waiting.get(message.id)(message);
      waiting.delete(message.id);
    } else if (message.method) {
      listeners
        .get(message.method)
        ?.forEach((callback) => callback(message.params));
    }
  });
  const on = (method, callback) =>
    listeners.set(method, [...(listeners.get(method) ?? []), callback]);
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      waiting.set(id, (message) =>
        message.error
          ? reject(new Error(`${method}: ${message.error.message}`))
          : resolve(message.result),
      );
      socket.send(JSON.stringify({ id, method, params, sessionId }));
    });

  // A tab in somebody's running browser opens behind their current one.
  const { targetId } = await send('Target.createTarget', {
    url: 'about:blank',
    background: Boolean(browserUrl),
  });
  const { sessionId } = await send('Target.attachToTarget', {
    targetId,
    flatten: true,
  });
  const s = (method, params) => send(method, params, sessionId);
  await s('Page.enable');
  if (browserUrl) {
    // A background tab produces no frames: animation frames stall and a screenshot waits forever.
    await s('Emulation.setFocusEmulationEnabled', { enabled: true });
    await s('Page.setWebLifecycleState', { state: 'active' });
  }
  await s('Emulation.setCPUThrottlingRate', { rate: Number(throttle) });
  if (initScript)
    await s('Page.addScriptToEvaluateOnNewDocument', { source: initScript });
  await s('Page.navigate', { url });

  const evaluate = async (fn) => {
    const result = await s('Runtime.evaluate', {
      expression: `(${typeof fn === 'string' ? fn : fn.toString()})()`,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ??
          result.exceptionDetails.text,
      );
    }
    return result.result.value;
  };

  // Chrome keeps the profile open for a moment after Browser.close, so removing it once fails; each one left
  // behind is about 60 MB.
  const close = async () => {
    if (!chrome) {
      await send('Target.closeTarget', { targetId }).catch(() => {});
      socket.close();
      return;
    }
    await send('Browser.close').catch(() => {});
    await new Promise((resolve) => {
      chrome.once('exit', resolve);
      setTimeout(resolve, 3000);
    });
    chrome.kill();
    let lastError = null;
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        rmSync(profile, { recursive: true, force: true });
        return;
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    console.error(
      `headless-chrome: could not remove ${profile}: ${lastError?.code ?? lastError}`,
    );
  };

  return { s, evaluate, close, on };
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
