var Game = Class.extend({
  init: function() {
    var loader = new PIXI.AssetLoader(['images/spritesheet.json'], true);
    loader.onComplete = this.loadGameArtifacts;
    document.body.appendChild(renderer.view);
    loader.load()
    this.stage = new PIXI.Stage(0xEEFFFF);
    // All sprites live in the world container, which carries the scale.
    // (PIXI 1.5 ignores scale set on the Stage itself.) HUD text sits on
    // the stage in screen pixels.
    this.world = new PIXI.DisplayObjectContainer();
    this.world.scale.x = SCALE;
    this.world.scale.y = SCALE;
    this.stage.addChild(this.world);
    this.countingText = new PIXI.Text(counter, { font: "26px Helvetica" });
    this.hintText = new PIXI.Text("Touch and drag to swim", {
      font: "bold 22px Helvetica", fill: "#1F3F4A"
    });
    this.hintText.anchor.x = 0.5;
  },
  loadGameArtifacts: function() {
    new Manatee();
    game.setupCounter();
    // Touch devices start frozen and wait for the first touch.
    game.started = !isTouchDevice();
    game.determineGameplay();
  },
  setupCounter: function() {
    this.countingText.anchor.x = 0.5;
    this.stage.addChild(this.countingText);
    if(isTouchDevice()) {
      this.stage.addChild(this.hintText);
    }
    this.layoutHud();
  },
  layoutHud: function() {
    // HUD positions are in screen pixels.
    this.countingText.position.x = window.innerWidth - 60;
    this.countingText.position.y = 20;
    this.hintText.position.x = window.innerWidth / 2;
    this.hintText.position.y = window.innerHeight - 80;
  },
  determineGameplay: function() {
    // The Leap controller (when a device streams) writes hand positions into
    // the shared input point. Mouse and touch write there too. One loop reads it.
    controller.on('frame', function(frame) {
      frame.hands.forEach(function(hand) {
        var point = hand.screenPosition()
        input.set(point[0], point[1]);
      });
    });
    requestAnimFrame(this.defaultGameLoop);
  },
  gameOver: function() {
    var size = Math.min(80, Math.round(window.innerWidth / 8));
    var caption = new PIXI.Text("Game Over", {
      font: size + "px Helvetica", fill: "red"
    });

    caption.x = window.innerWidth / 4;
    caption.y = window.innerHeight / 4;

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
  started: false,
  sceneReady: false,
  waitForTouch: function() {
    // Show a frozen scene: the manatee, the alligator, and the hint.
    if(!game.sceneReady) {
      new Alligator();
      game.sceneReady = true;
    }
    if(input.hasTouched) {
      game.started = true;
      game.stage.removeChild(game.hintText);
      timer = window.performance.now();
    }
    requestAnimFrame(game.defaultGameLoop);
    renderer.render(game.stage);
  },
  defaultGameLoop: function() {
    if(!game.started) {
      game.waitForTouch();
      return
    }
    game.updateFrame();
    game.manateeDetection(input.point);

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
    var manatee = this.world.children.filter(function(child) {
      return child.className == 'Manatee';
    }).pop();

    this.world.children.forEach(function(child) {
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

    if(this.world.children.length < MAX_CHILDREN) {
      new Food();
    };

    // Keep the manatee above the food and fish. Later children draw on top.
    if(manatee) {
      this.world.removeChild(manatee);
      this.world.addChild(manatee);
    }
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
    this.world.children.forEach(function(child) {
      if(child.className == 'Manatee') {
        child.updateMovement(point);
      }
    });
  }
});

function isTouchDevice() {
  return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
}
