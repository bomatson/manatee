var SeaCreature = Class.extend({
  init: function(type, yPosition) {
    this.image = PIXI.Sprite.fromFrame(type + '.png'),
    this.image.updateMovement = this.updateMovement;
    this.image.checkBounds = this.checkBounds;
    this.render(yPosition);
  },
  render: function(yPosition){
    var randomY = (Math.floor((Math.random() * yPosition) + 1));

    this.image.anchor.x = 0.5;
    this.image.anchor.y = 0.5;
    this.image.position.x = (WIDTH - 10);
    this.image.position.y = (randomY + 100);

    stage.addChild(this.image);
  },
  updateMovement: function() {
    this.position.x -= 0.2 * delta;
  },
  checkBounds: function() {
    if(this.x < -this.width) {
      stage.removeChild(this);
    }
  }
});
