var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var stage = new PIXI.Stage(0xEEFFFF);
var loader = new PIXI.AssetLoader(['/images/spritesheet.json'], true);
var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);
var delta, timer, enemyPresent;
var controller = new Leap.Controller({frameEventName: 'animationFrame'})
var counter = 0;
var countingText = new PIXI.Text(counter);

controller.use('screenPosition', {scale: 0.25});
controller.connect()

document.body.appendChild(renderer.view);

loader.onComplete = loadGameArtifacts;
loader.load();

function loadGameArtifacts() {
  new Manatee();
  setupCounter();
  determineGameplay();
}

function setupCounter() {
  countingText.position.x = (WIDTH - 100);
  countingText.position.y = 30;
  countingText.anchor.x = 0.5;
  stage.addChild(countingText);
}

// objects (Alligator)
// functions (loadGameArtifacts)
// imperative (controller.use, etc)

function gameOver() {
  var caption = new PIXI.Text("Game Over", {
    font: "100px Helvetica", fill: "red"
  });

  caption.x = WIDTH / 2;
  caption.y = HEIGHT / 2;

  stage.addChild(caption);

  return renderer.render(stage);
}

function updateEnvironmentMovements() {
  var manatee = stage.children.filter(function(child) {
    return child.className == 'Manatee';
  }).pop();

  stage.children.forEach(function(child) {
    if(child instanceof SeaCreature) {
      child.updateMovement();
      child.checkBounds();
    };

    if(child.className == 'Alligator' || child.className == 'Food') {
      child.eat(manatee)
    }
  });

  if(stage.children.length < 100) {
    new Food();
  };
};

function manateeDetection(point) {
  stage.children.forEach(function(child) {
    if(child.className == 'Manatee') {
      child.updateMovement(point);
    }
  });
};

function createSwimmingFriends() {
  switch(true) {
    case(((counter % 39) == 0)):
      new SeaCreature('green_fishy', 300);
      break;
    case((counter % 100) == 0):
      new SeaCreature('orange_fishy', 500);
      break;
    case((counter % 101) == 0):
      new SeaCreature('pink_fishy', 300);
      break;
    case((counter % 107) == 0):
      new SeaCreature('long_fishy', 600);
      break;
    default:
      return;
  }
}

function createSwimmingEnemy() {
  if(counter % 105 == 0){
    new Alligator();
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
