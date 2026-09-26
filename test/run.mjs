// Test runner: syntax-check every script, start the server, run the browser
// tests against it, and exit non-zero on any failure.
import { spawn, spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { sleep } from './lib/cdp.mjs';

const PORT = process.env.PORT || '3100';
let ok = true;

console.log('syntax check');
for (const f of readdirSync('public/js').filter((f) => f.endsWith('.js'))) {
  const r = spawnSync(process.execPath, ['--check', `public/js/${f}`], { encoding: 'utf8' });
  const pass = r.status === 0;
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${f}${pass ? '' : '\n' + r.stderr}`);
  ok = ok && pass;
}

const server = spawn(process.execPath, ['web.js'], { env: { ...process.env, PORT }, stdio: 'ignore' });
let up = false;
for (let i = 0; i < 40 && !up; i++) {
  try { up = (await fetch(`http://127.0.0.1:${PORT}/`)).status === 200; } catch {}
  if (!up) await sleep(250);
}
if (!up) { console.log('FAIL  server did not start'); server.kill(); process.exit(1); }
process.env.GAME_URL = `http://127.0.0.1:${PORT}/`;

try {
  for (const name of ['./collision.test.mjs', './mobile.test.mjs']) {
    const mod = await import(name);
    ok = (await mod.run()) && ok;
  }
} catch (error) {
  console.log('FAIL  ' + (error.stack || error));
  ok = false;
} finally {
  server.kill();
}
console.log(`\n${ok ? 'ALL PASS' : 'FAILURES'}`);
process.exit(ok ? 0 : 1);
