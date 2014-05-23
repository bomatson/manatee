var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var timer = window.performance.now();
var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);
var delta, enemyPresent;
var counter = 0;
var controller = new Leap.Controller({frameEventName: 'animationFrame'})
controller.use('screenPosition', {scale: 0.25});
controller.connect()
var game = new Game();
