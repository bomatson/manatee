var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var manatee, delta;
var stage = new PIXI.Stage(0xEEFFFF);
var lettuce = [];

var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);

document.body.appendChild(renderer.view);

var loader = new PIXI.AssetLoader(['/images/spritesheet.json'], true);

loader.onComplete = loadGameArtifacts;
loader.load();

function loadGameArtifacts() {
  renderManatee();
  stage.addChild(new Lettuce().render());
  requestAnimFrame(gameLoop);
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
    if(this.x > (WIDTH - 10) || this.getBounds().contains(manatee.x, manatee.y)) {
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

var timer = window.performance.now();

function gameLoop() {
  var now = window.performance.now();
  delta = Math.min(now - timer, 20);
  timer = now;
  for(i=0; i< stage.children.length; i++) {
    if(stage.children[i].updateMovement !== undefined) {
      stage.children[i].updateMovement();
      stage.children[i].checkBounds();
    }
  };
  if(stage.children.length < 100) {
    new Lettuce().render();
  };
  var point = stage.getMousePosition();
  manatee.position.x = point.x;
  manatee.position.y = point.y;
  requestAnimFrame(gameLoop);
  renderer.render(stage);
}
