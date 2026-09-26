// World scale: on screens narrower than the design width, shrink the whole
// stage so the sprites fit. Positions in the game are in world units.
var DESIGN_WIDTH = 1100;
var SCALE = 1;
var WIDTH, HEIGHT;

function computeWorldSize() {
  SCALE = Math.min(1, window.innerWidth / DESIGN_WIDTH);
  WIDTH = window.innerWidth / SCALE;
  HEIGHT = window.innerHeight / SCALE;
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
  if (window.game && game.stage) {
    game.stage.scale.x = SCALE;
    game.stage.scale.y = SCALE;
    game.layoutHud();
  }
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);

var controller = new Leap.Controller({frameEventName: 'animationFrame'})
controller.use('screenPosition', {scale: 0.25});
controller.connect()
var game = new Game();
