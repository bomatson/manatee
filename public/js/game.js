var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var stage = new PIXI.Stage(0xEEFFFF);
var loader = new PIXI.AssetLoader(['/images/spritesheet.json'], true);
var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);
var manatee, delta, timer, enemyPresent;
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

function gameOver() {
  var caption = new PIXI.Text("Game Over", {
    font: "100px Helvetica", fill: "red"
  });

  caption.x = WIDTH / 2;
  caption.y = HEIGHT / 2;

  stage.addChild(caption);

  return renderer.render(stage);
}

var Fishy = function() {
  this.render =  function(type) {
    var image = PIXI.Sprite.fromFrame(type + '_fishy.png');
    var randomY = (Math.floor((Math.random() * 300) + 1));

    image.anchor.x = 0.5;
    image.anchor.y = 0.5;
    image.position.x = (WIDTH - 10);
    image.position.y = (randomY + 100);
    stage.addChild(image);

    image.updateMovement = this.updateMovement;
    image.checkBounds = this.checkBounds;
    return image
  };
  this.updateMovement = function() {
    this.position.x -= 0.2 * delta
  };
  this.checkBounds = function() {
    if(this.x < 0) {
      stage.removeChild(this);
    };
  };
}

var Alligator = function() {
  this.render = function() {
    if(enemyPresent) { return };
    var image = PIXI.Sprite.fromFrame('alligator.png');
    var randomY = (Math.floor((Math.random() * 500) + 1));

    image.anchor.x = 0.5;
    image.anchor.y = 0.5;
    image.position.x = (WIDTH - 10);
    image.position.y = (randomY + 100);
    stage.addChild(image);
    enemyPresent = true;
    hitArea = image.getBounds();

    image.updateMovement = this.updateMovement;
    image.checkBounds = this.checkBounds;
    image.checkEaten = this.checkEaten;
    return image
  };
  var hitArea = null;
  this.updateMovement = function() {
    this.position.x -= 0.2 * delta
  };
  this.checkBounds = function() {
    hitArea = this.getBounds();
    if(this.x < -this.width) {
      stage.removeChild(this);
      enemyPresent = false;
    };
  };
  this.checkEaten = function() {
    if(hitArea.contains(manatee.x, manatee.y)) {
      gameOver();
    };
  }
}

var Lettuce = function() {
  this.render =  function() {
    var image = PIXI.Sprite.fromFrame('food.png');
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
  manatee = PIXI.Sprite.fromFrame('manatee-main.png');

  manatee.anchor.x = 0.5;
  manatee.anchor.y = 0.5;

  manatee.position.x = WIDTH / 2;
  manatee.position.y = HEIGHT / 2;

  manatee.hitArea = new PIXI.Rectangle(30, 30, 100 ,100);

  stage.addChild(manatee);
}

function updateEnvironmentMovements() {

  for(i=0; i< stage.children.length; i++) {
    if(stage.children[i].updateMovement !== undefined && stage.children[i] !== undefined) {
      stage.children[i].updateMovement();
      stage.children[i].checkBounds();
    };

    if(stage.children[i].checkEaten !== undefined) {
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

function createSwimmingFriends() {
  switch(true) {
    case(((counter % 39) == 0)):
      new Fishy().render('green');
      break;
    case((counter % 100) == 0):
      new Fishy().render('orange');
      break;
    case((counter % 101) == 0):
      new Fishy().render('pink');
      break;
    default:
      return;
  }
}

function createSwimmingEnemy() {
  if(counter % 105 == 0){
    new Alligator().render();
  }
}

var timer = window.performance.now();

function updateFrame() {
  var now = window.performance.now();
  delta = Math.min(now - timer, 20);
  timer = now;

  updateEnvironmentMovements();
  if(counter > 100) {
    createSwimmingFriends();
  }
  createSwimmingEnemy();
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
