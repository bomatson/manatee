// World scale: on screens narrower than the design width, shrink the whole
// stage so the sprites fit. Positions in the game are in world units.
// A portrait phone uses a slightly wider design width so the sprites take
// about the same share of the screen width as on a desktop window.
var DESIGN_WIDTH_LANDSCAPE = 1100;
var DESIGN_WIDTH_PORTRAIT = 1200;
var DESKTOP_AREA = 1200 * 700;
var SCALE = 1;
var WIDTH, HEIGHT, MAX_CHILDREN;

function computeWorldSize() {
  var portrait = window.innerHeight > window.innerWidth;
  var designWidth = portrait ? DESIGN_WIDTH_PORTRAIT : DESIGN_WIDTH_LANDSCAPE;
  SCALE = Math.min(1, window.innerWidth / designWidth);
  WIDTH = window.innerWidth / SCALE;
  HEIGHT = window.innerHeight / SCALE;
  // Cap the number of sprites in proportion to the screen area so a phone
  // screen is not packed as densely as a desktop window.
  var areaRatio = (window.innerWidth * window.innerHeight) / DESKTOP_AREA;
  MAX_CHILDREN = Math.max(30, Math.min(150, Math.round(150 * areaRatio)));
}
computeWorldSize();

var timer = window.performance.now();
var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
var delta, enemyPresent;
var counter = 0;

// Unified pointer input: mouse, touch, and pointer events all land here in
// world units. The Leap controller writes here too when it streams frames.
var input = {
  point: undefined,
  hasTouched: false,
  set: function(clientX, clientY) {
    this.point = { x: clientX / SCALE, y: clientY / SCALE };
  }
};

function onMouseMove(event) {
  input.set(event.clientX, event.clientY);
}

function onTouch(event) {
  if (event.touches.length === 0) { return; }
  var touch = event.touches[0];
  input.hasTouched = true;
  input.set(touch.clientX, touch.clientY);
  event.preventDefault();
}

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('touchstart', onTouch, { passive: false });
window.addEventListener('touchmove', onTouch, { passive: false });

function onResize() {
  computeWorldSize();
  renderer.resize(window.innerWidth, window.innerHeight);
  if (window.game && game.world) {
    game.world.scale.x = SCALE;
    game.world.scale.y = SCALE;
    game.layoutHud();
  }
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);

var controller = new Leap.Controller({frameEventName: 'animationFrame'})
controller.use('screenPosition', {scale: 0.25});
controller.connect()
var game = new Game();
