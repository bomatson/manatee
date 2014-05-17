var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var stage = new PIXI.Stage(0xEEFFFF);
var loader = new PIXI.AssetLoader(['/images/spritesheet.json'], true);
var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);
var manatee, delta, timer;
var controller = new Leap.Controller({frameEventName: 'animationFrame'})
var counter = 0;
var countingText = new PIXI.Text(counter);

controller.use('screenPosition', {scale: 0.25});
controller.connect()

document.body.appendChild(renderer.view);

loader.onComplete = loadGameArtifacts;
loader.load();

function loadGameArtifacts() {
  renderManatee();
  stage.addChild(new Lettuce().render());
  setupCounter();
  determineGameplay();
}

function setupCounter() {
  countingText.position.x = (WIDTH - 100);
  countingText.position.y = 30;
  countingText.anchor.x = 0.5;
  stage.addChild(countingText);
}

var Lettuce = function() {
  this.render =  function() {
    var image = PIXI.Sprite.fromFrame('ood.png');
    var randomY = (Math.floor((Math.random() * 300) + 1));

    image.anchor.x = 0.5;
    image.anchor.y = 0.5;
    image.position.x = 10;
    image.position.y = randomY;
    stage.addChild(image);

    image.updateMovement = this.updateMovement;
    image.checkBounds = this.checkBounds;
    image.checkEaten = this.checkEaten;
    speed = (Math.random() * 0.3) + 0.1;
    return image
  };

  var down = true;
  var speed = null;
  this.updateMovement = function() {
    this.position.x += 0.2 * delta * speed;
    var randomNumber = 0.2;
    if(down){
      if( this.position.y <= (HEIGHT - 100)){
        this.position.y += randomNumber * delta;
      }else{
        down  = false;
      }
    }else{
      if( this.position.y >= 10){
        this.position.y -= randomNumber * delta;
      }else{
        down  = true;
      }
    }
  };

  this.checkBounds = function() {
    if(this.x > (WIDTH - 10)) {
      stage.removeChild(this);
    };
  };

  this.checkEaten = function() {
    if(manatee.hitArea.contains(this.x, this.y)) {
      counter++;
      countingText.setText(counter);
      stage.removeChild(this);
    };
  }
}

function renderManatee() {
  manatee = PIXI.Sprite.fromFrame('anatee-main.png');

  manatee.anchor.x = 0.5;
  manatee.anchor.y = 0.5;

  manatee.position.x = WIDTH / 2;
  manatee.position.y = HEIGHT / 2;

  manatee.hitArea = new PIXI.Rectangle(30, 30, 100 ,100);

  stage.addChild(manatee);
}

function lettuceDetection() {
  for(i=0; i< stage.children.length; i++) {
    if(stage.children[i].updateMovement !== undefined && stage.children[i] !== undefined) {
      stage.children[i].updateMovement();
      stage.children[i].checkBounds();
      stage.children[i].checkEaten();
    }
  };

  if(stage.children.length < 100) {
    new Lettuce().render();
  };
}

function manateeDetection(point) {
  manatee.position.x = point.x;
  manatee.position.y = point.y;
  manatee.hitArea = manatee.getBounds();
}

var timer = window.performance.now();

function swimmingFriends() {

}
function updateFrame() {
  var now = window.performance.now();
  delta = Math.min(now - timer, 20);
  timer = now;

  lettuceDetection();
  swimmingFriends();
}

function determineGameplay() {

  if(controller.streaming()) {
    controller.on('frame', function(frame) {
      updateFrame();

      frame.hands.forEach(function(hand) {
        var point = hand.screenPosition()
        point = {x: point[0], y: point[1]};
        manateeDetection(point);
      });

      renderer.render(stage);
    });
  } else {
    requestAnimFrame(defaultGameLoop);
  }
}


function defaultGameLoop() {
  updateFrame();

  var point = stage.getMousePosition();
  manateeDetection(point);

  requestAnimFrame(defaultGameLoop);
  renderer.render(stage);
}
