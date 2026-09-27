// Checks the progression rules with the game loop stopped: the manatee grows
// as it eats, the sea speeds up with the score, and a score that sits on a
// spawn multiple spawns one fish, not one per frame.
import { launchChrome, sleep, check } from './lib/cdp.mjs';

const URL = process.env.GAME_URL || 'http://127.0.0.1:3100/';
const PORT = 9335;

export async function run() {
  const browser = await launchChrome({ port: PORT });
  try {
    const { send, evalJs } = browser;
    await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 700, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: URL });
    await sleep(1500);
    const out = JSON.parse(await evalJs(`(function () {
      window.requestAnimFrame = function () {};  // stop the loop
      game.gameOver = function () {};
      var world = game.world;
      function count(name) { return world.children.filter(function (c) { return c.className == name; }).length; }
      var m = world.children.filter(function (c) { return c.className == 'Manatee'; })[0];
      var out = { startScaleConst: MANATEE_START_SCALE, maxScaleConst: MANATEE_MAX_SCALE, speedMaxConst: SPEED_MAX };
      out.startScale = m.scale.x;
      out.startWidth = m.width;
      out.startHitBoxFits = m.hitArea.width === m.width && m.hitArea.height === m.height;
      out.startSpeed = speedFactor();

      // Eat one lettuce: put it on the manatee and run its eat check.
      new Food();
      var food = world.children.filter(function (c) { return c.className == 'Food'; }).pop();
      food.position.x = m.x; food.position.y = m.y;
      var before = counter;
      food.eat(m);
      out.ateOne = counter === before + 1;
      out.scaleAfterOne = m.scale.x;
      out.speedAfterOne = speedFactor();

      // A huge score hits both caps.
      counter = 100000; m.grow();
      out.capScale = m.scale.x;
      out.capSpeed = speedFactor();
      out.capHitBoxFits = m.hitArea.width === m.width && m.hitArea.height === m.height;
      out.capWidth = m.width;

      // Fish and lettuce move by the speed factor.
      var fish = new SeaCreature('green_fishy', 300).image;
      delta = 10;
      counter = 0;
      var x0 = fish.position.x; fish.updateMovement(); out.slowFishStep = x0 - fish.position.x;
      x0 = food.position.x; food.updateMovement(); out.slowFoodStep = food.position.x - x0;
      counter = 100000;
      x0 = fish.position.x; fish.updateMovement(); out.fastFishStep = x0 - fish.position.x;
      x0 = food.position.x; food.updateMovement(); out.fastFoodStep = food.position.x - x0;

      // A score on a spawn multiple spawns one fish over ten frames, not ten.
      world.children.slice().forEach(function (c) { if (c.className == 'SeaCreature') world.removeChild(c); });
      counter = 39 * 10;
      game.lastSpawnCounter = -1;
      for (var i = 0; i < 10; i++) { game.updateFrame(); }
      out.fishAfterTenFrames = count('SeaCreature');
      return JSON.stringify(out);
    })()`));
    console.log('\nprogression rules');
    const near = (a, b) => Math.abs(a - b) < 1e-9;
    const results = [
      check('manatee starts tiny', near(out.startScale, out.startScaleConst) && out.startScale < 1, `scale ${out.startScale}`),
      check('hit box matches the tiny size', out.startHitBoxFits),
      check('one lettuce grows the manatee', out.ateOne && out.scaleAfterOne > out.startScale, `${out.startScale} -> ${out.scaleAfterOne}`),
      check('growth stops at the max size', near(out.capScale, out.maxScaleConst) && out.capWidth > out.startWidth, `scale ${out.capScale}`),
      check('hit box matches the grown size', out.capHitBoxFits),
      check('speed starts at 1x', out.startSpeed === 1),
      check('one lettuce speeds up the sea', out.speedAfterOne > 1, `${out.speedAfterOne}`),
      check('speed stops at the max', near(out.capSpeed, out.speedMaxConst), `${out.capSpeed}`),
      check('fish move faster at a high score', near(out.fastFishStep, out.slowFishStep * out.speedMaxConst), `${out.slowFishStep} -> ${out.fastFishStep}`),
      check('lettuce moves faster at a high score', near(out.fastFoodStep, out.slowFoodStep * out.speedMaxConst), `${out.slowFoodStep} -> ${out.fastFoodStep}`),
      check('a score on a spawn multiple spawns one fish, not one per frame', out.fishAfterTenFrames === 1, `${out.fishAfterTenFrames} fish`),
    ];
    return results.every(Boolean);
  } finally {
    browser.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().then((ok) => process.exit(ok ? 0 : 1));
}
