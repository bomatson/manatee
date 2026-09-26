// A sprite's box in world units. Sprites are anchored at their center.
// (getBounds() returns screen units after the stage scale, so it is not
// safe for hit tests against world positions.)
function worldBounds(sprite) {
  return new PIXI.Rectangle(
    sprite.position.x - sprite.width / 2,
    sprite.position.y - sprite.height / 2,
    sprite.width,
    sprite.height
  );
}

var SeaCreature = Class.extend({
  init: function(type, yPosition) {
    this.image = PIXI.Sprite.fromFrame(type + '.png'),
    this.image.updateMovement = this.updateMovement;
    this.image.checkBounds = this.checkBounds;
    this.image.className = 'SeaCreature'
    this.render(yPosition);
  },
  render: function(yPosition){
    var randomY = (Math.floor((Math.random() * yPosition) + 1));

    this.image.anchor.x = 0.5;
    this.image.anchor.y = 0.5;
    this.image.position.x = (WIDTH - 10);
    this.image.position.y = (randomY + 100);

    game.world.addChild(this.image);
  },
  updateMovement: function() {
    this.position.x -= 0.2 * delta;
  },
  checkBounds: function() {
    if(this.x < -this.width) {
      game.world.removeChild(this);
    }
  }
});
