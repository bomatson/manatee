var Game = Class.extend({
  init: function() {
    var loader = new PIXI.AssetLoader(['/images/spritesheet.json'], true);
    loader.onComplete = this.loadGameArtifacts;
    document.body.appendChild(renderer.view);
    loader.load()
    this.stage = new PIXI.Stage(0xEEFFFF);
    this.countingText = new PIXI.Text(counter);
  },
  loadGameArtifacts: function() {
    new Manatee();
    game.setupCounter();
    game.determineGameplay();
  },
  setupCounter: function() {
    this.countingText.position.x = (WIDTH - 100);
    this.countingText.position.y = 30;
    this.countingText.anchor.x = 0.5;
    this.stage.addChild(this.countingText);
  },
  determineGameplay: function() {
    if(controller.streaming()) {
      controller.on('frame', function(frame) {
        this.updateFrame();

        frame.hands.forEach(function(hand) {
          var point = hand.screenPosition()
          point = {x: point[0], y: point[1]};
          manateeDetection(point);
        });

        renderer.render(this.stage);
      });
    } else {
      requestAnimFrame(this.defaultGameLoop);
    }
  },
  gameOver: function() {
    var caption = new PIXI.Text("Game Over", {
      font: "80px Helvetica", fill: "red"
    });

    caption.x = renderer.width / 4;
    caption.y = renderer.height / 4;

    this.caption = caption;
    this.countDownEnabled = true
    this.stage.addChild(caption);
  },
  countDownEnabled: false,
  countDown: 3,
  count: 0,
  sayings: ['Oh, the Hu-Manatee!', 'No More Manatea for you!', 'Not Our Manatee!', 'God Damn Florida Gators!', 'Stupid Alligator!', 'MANNNYYYYY!!!'],
  endLoop: function() {
    var saying = game.sayings[Math.floor(Math.random()*game.sayings.length)];
    var newText = saying + '\nRestarting in ' + game.countDown;
    if(game.countDown == 0) {
      document.location.reload(true);
      return
    }
    if(game.count > 50) {
      game.count = 0
      game.caption.setText(newText)
      game.countDown--
    }
    game.count++
    requestAnimFrame(game.endLoop);
    renderer.render(game.stage);
  },
  defaultGameLoop: function() {
    game.updateFrame();

    var point = game.stage.getMousePosition();
    game.manateeDetection(point);

    if (game.countDownEnabled){
      game.endLoop();
      return
    }
    game.count++
    requestAnimFrame(game.defaultGameLoop);
    renderer.render(game.stage);
  },
  updateFrame: function() {
    var now = window.performance.now();
    delta = Math.min(now - timer, 20);
    timer = now;

    this.updateEnvironmentMovements();
    if(counter > 100) {
      this.createSwimmingFriends();
    }
    this.createSwimmingEnemy();
  },
  updateEnvironmentMovements: function() {
    var manatee = this.stage.children.filter(function(child) {
      return child.className == 'Manatee';
    }).pop();

    this.stage.children.forEach(function(child) {
      if(child.className == 'Alligator' || child.className == 'Food') {
        child.updateMovement();
        child.checkBounds();
        child.eat(manatee)
      };

      if(child.className == 'SeaCreature') {
        child.updateMovement();
        child.checkBounds();
      }
    });

    if(this.stage.children.length < 150) {
      new Food();
    };
  },
  createSwimmingFriends: function() {
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
  },
  createSwimmingEnemy: function() {
    if(counter % 105 == 0 || enemyPresent == false){
      new Alligator();
    }
  },
  manateeDetection: function(point) {
    this.stage.children.forEach(function(child) {
      if(child.className == 'Manatee') {
        child.updateMovement(point);
      }
    });
  }
});
