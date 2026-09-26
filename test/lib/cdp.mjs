// Small Chrome DevTools Protocol client. No dependencies: Node 22+ has
// fetch and WebSocket built in.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome',
  ];
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error('Chrome not found. Set CHROME_PATH.');
  return found;
}

export async function launchChrome({ port }) {
  const userDataDir = mkdtempSync(join(tmpdir(), 'manatee-chrome-'));
  const chrome = spawn(findChrome(), [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--enable-unsafe-swiftshader',
    '--hide-scrollbars', '--no-first-run', '--disable-dev-shm-usage',
    `--remote-debugging-port=${port}`, `--user-data-dir=${userDataDir}`, 'about:blank',
  ], { stdio: 'ignore' });

  let targets;
  for (let i = 0; i < 60; i++) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      if (targets.length) break;
    } catch {}
    await sleep(250);
  }
  if (!targets || !targets.length) { chrome.kill(); throw new Error('Chrome did not start'); }

  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

  let id = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id) { pending.get(d.id)(d); pending.delete(d.id); } else events.push(d);
  };
  const send = (method, params = {}) => new Promise((resolve) => {
    const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params }));
  });
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
    return r.result?.result?.value;
  };
  const pageErrors = () => events
    .filter((e) => e.method === 'Runtime.exceptionThrown' || (e.method === 'Log.entryAdded' && e.params.entry.level === 'error'))
    .map((e) => e.params.exceptionDetails?.exception?.description || e.params.exceptionDetails?.text || e.params.entry?.text)
    // The Leap daemon is never present in tests; its socket refusal is expected.
    .filter((t) => !/6437/.test(t));
  const close = () => { try { ws.close(); } catch {} chrome.kill(); };

  await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable');
  return { send, evalJs, events, pageErrors, close };
}

export function check(name, ok, detail = '') {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
  return ok;
}
