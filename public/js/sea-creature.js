var SeaCreature = Class.extend({
  init: function(type, yPosition) {
    this.render(type, yPosition);
  },
  render: function(type, yPosition){
    var image = PIXI.Sprite.fromFrame(type+ '.png');
    var randomY = (Math.floor((Math.random() * yPosition) + 1));

    image.anchor.x = 0.5;
    image.anchor.y = 0.5;
    image.position.x = (WIDTH - 10);
    image.position.y = (randomY + 100);
    stage.addChild(image);

    image.updateMovement = this.updateMovement;
    image.checkBounds = this.checkBounds;
  },
  updateMovement: function() {
    this.position.x -= 0.2 * delta;
  },
  checkBounds: function() {
    if(this.x < 0) {
      stage.removeChild(this);
    }
  }
});
