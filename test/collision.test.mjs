// Checks the two loss rules directly with the game loop stopped.
import { launchChrome, sleep, check } from './lib/cdp.mjs';

const URL = process.env.GAME_URL || 'http://127.0.0.1:3100/';
const PORT = 9334;

export async function run() {
  const browser = await launchChrome({ port: PORT });
  try {
    const { send, evalJs } = browser;
    await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 700, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: URL });
    await sleep(1500);
    const out = JSON.parse(await evalJs(`(function () {
      window.requestAnimFrame = function () {};  // stop the loop
      var calls = 0; game.gameOver = function () { calls++; };
      var world = game.world;
      var manatee = world.children.filter(function (c) { return c.className == 'Manatee'; })[0];
      var gator = world.children.filter(function (c) { return c.className == 'Alligator'; })[0];
      if (!gator) { new Alligator(); gator = world.children.filter(function (c) { return c.className == 'Alligator'; })[0]; }
      gator.position.x = 600; gator.position.y = 350;
      var frame = gator.texture.frame, mask = alphaMaskFor(gator);
      var left = gator.x - gator.width / 2, top = gator.y - gator.height / 2;
      function allClear(px, py) {
        return bodyPoints({ x: px, y: py, width: manatee.width, height: manatee.height })
          .every(function (p) { return !spriteHitsPixel(gator, p.x, p.y); });
      }
      var clearSpot = null, opaqueSpot = null;
      for (var y = 0; y < frame.height && !clearSpot; y += 4) for (var x = 0; x < frame.width && !clearSpot; x += 4) {
        if (mask[y * frame.width + x] <= 40 && allClear(left + x, top + y)) clearSpot = { x: left + x, y: top + y };
      }
      for (var y2 = Math.floor(frame.height / 2); y2 < frame.height && !opaqueSpot; y2++) for (var x2 = Math.floor(frame.width / 2); x2 < frame.width && !opaqueSpot; x2++) {
        if (mask[y2 * frame.width + x2] > 200) opaqueSpot = { x: left + x2, y: top + y2 };
      }
      var out = { maskBuilt: !!mask, clearSpot: clearSpot, opaqueSpot: opaqueSpot };
      manatee.position.x = clearSpot.x; manatee.position.y = clearSpot.y;
      out.clearInsideBox = worldBounds(gator).contains(manatee.x, manatee.y);
      calls = 0; gator.eat(manatee); out.clearCalls = calls;
      manatee.position.x = opaqueSpot.x; manatee.position.y = opaqueSpot.y;
      calls = 0; gator.eat(manatee); out.bodyCalls = calls;
      var food = world.children.filter(function (c) { return c.className == 'Food'; })[0];
      if (!food) { new Food(); food = world.children.filter(function (c) { return c.className == 'Food'; })[0]; }
      food.position.x = WIDTH + 5; calls = 0; var before = world.children.length; food.checkBounds();
      out.escapeCalls = calls; out.escapeRemoved = world.children.length === before - 1;
      return JSON.stringify(out);
    })()`));
    console.log('\ncollision rules');
    const results = [
      check('alpha mask built from the spritesheet', out.maskBuilt),
      check('clear water inside the alligator box does not end the game', out.clearInsideBox && out.clearCalls === 0),
      check('touching the alligator body ends the game', out.bodyCalls === 1),
      check('escaped lettuce is removed and does not end the game', out.escapeCalls === 0 && out.escapeRemoved),
    ];
    return results.every(Boolean);
  } finally {
    browser.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().then((ok) => process.exit(ok ? 0 : 1));
}
