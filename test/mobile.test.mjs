// Drives the game in headless Chrome at phone and desktop sizes.
import { launchChrome, sleep, check } from './lib/cdp.mjs';

const URL = process.env.GAME_URL || 'http://127.0.0.1:3100/';
const PORT = 9333;

const STATE = `JSON.stringify((function () {
  var m = game.world.children.filter(function (c) { return c.className == 'Manatee'; })[0];
  var a = game.world.children.filter(function (c) { return c.className == 'Alligator'; })[0];
  return {
    inner: [innerWidth, innerHeight], SCALE: +SCALE.toFixed(3), WIDTH: Math.round(WIDTH), HEIGHT: Math.round(HEIGHT),
    worldScale: +game.world.scale.x.toFixed(3), started: game.started,
    manateeScreen: m ? [Math.round(m.worldTransform.tx), Math.round(m.worldTransform.ty)] : null,
    alligator: a ? [Math.round(a.position.x), Math.round(a.position.y)] : null,
    hintShown: !!game.hintText.parent, hintText: game.hintText.text,
    children: game.world.children.length, maxChildren: MAX_CHILDREN,
    manateeOnTop: game.world.children[game.world.children.length - 1].className == 'Manatee',
    countDownEnabled: game.countDownEnabled
  };
})())`;

// On desktop the manatee idles at the center until the mouse moves, and the
// alligator can eat it first, which reloads the page mid-test. That is game
// behavior, not a bug. The desktop scenario turns game over into a counter
// before the page loads. The collision test proves game over itself.
const NO_GAME_OVER = `(function poll() {
  if (window.game) { game.gameOver = function () { window.__gameOverCalls = (window.__gameOverCalls || 0) + 1; }; }
  else { setTimeout(poll, 5); }
})();`;

async function scenario(browser, name, metrics, touch) {
  const { send, evalJs, events, pageErrors } = browser;
  events.length = 0;
  await send('Emulation.setDeviceMetricsOverride', { ...metrics, deviceScaleFactor: 2 });
  await send('Emulation.setTouchEmulationEnabled', { enabled: touch, maxTouchPoints: 5 });
  let injected = null;
  if (!touch) injected = (await send('Page.addScriptToEvaluateOnNewDocument', { source: NO_GAME_OVER })).result.identifier;
  await send('Page.navigate', { url: URL });
  await sleep(1200);
  if (injected) await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: injected });
  const before = JSON.parse(await evalJs(STATE));
  await sleep(400);
  const before2 = JSON.parse(await evalJs(STATE));

  const tx = Math.round(metrics.width * 0.3), ty = Math.round(metrics.height * 0.6);
  if (touch) {
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tx - 40, y: ty - 40 }] });
    await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: tx, y: ty }] });
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: tx, y: ty });
  }
  await sleep(400);
  const after = JSON.parse(await evalJs(STATE));
  const scrollable = await evalJs('JSON.stringify([document.documentElement.scrollWidth > innerWidth, document.documentElement.scrollHeight > innerHeight])');

  console.log(`\n${name} (${metrics.width}x${metrics.height}, ${touch ? 'touch' : 'mouse'})`);
  const results = [];
  const drawnAtInput = after.manateeScreen && Math.abs(after.manateeScreen[0] - tx) <= 2 && Math.abs(after.manateeScreen[1] - ty) <= 2;
  results.push(check('manatee drawn at the input position', drawnAtInput, `expected [${tx},${ty}] got ${JSON.stringify(after.manateeScreen)}`));
  results.push(check('world scale applied', after.worldScale === after.SCALE));
  if (touch) {
    const frozen = !before.started && !before2.started && before.alligator !== null
      && JSON.stringify(before.alligator) === JSON.stringify(before2.alligator) && before.children === before2.children;
    results.push(check('frozen until the first touch', frozen));
    results.push(check('running after the first touch', after.started && after.children !== before2.children));
    results.push(check('hint shown before and hidden after touch', before.hintShown && !after.hintShown));
    results.push(check('hint wording', before.hintText === 'Touch and drag to swim', before.hintText));
  } else {
    results.push(check('desktop starts at once', before.started));
    results.push(check('no hint on a mouse device', !before.hintShown));
  }
  results.push(check('manatee drawn above food and fish', after.manateeOnTop));
  results.push(check('page does not scroll', scrollable === '[false,false]', scrollable));
  results.push(check('no page errors', pageErrors().length === 0, JSON.stringify(pageErrors())));
  return results.every(Boolean);
}

export async function run() {
  const browser = await launchChrome({ port: PORT });
  try {
    const results = [];
    results.push(await scenario(browser, 'portrait phone', { width: 390, height: 844, mobile: true }, true));
    results.push(await scenario(browser, 'landscape phone', { width: 844, height: 390, mobile: true }, true));
    results.push(await scenario(browser, 'desktop', { width: 1200, height: 700, mobile: false }, false));
    return results.every(Boolean);
  } finally {
    browser.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().then((ok) => process.exit(ok ? 0 : 1));
}
