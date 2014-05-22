var Alligator = SeaCreature.extend({
  init: function() {
    this._super('alligator', 500);
    this.image.eat = this.eat;
  },
  onStage: false,
  render: function(yPosition) {
    if(enemyPresent) { return };
    enemyPresent = true;
    return this._super(yPosition);
  },
  updateMovement: function() {
    return this._super();
  },
  checkBounds: function() {
    if(this.x < -this.width) {
      stage.removeChild(this);
      enemyPresent = false;
    }
  },
  eat: function() {
    if(this.getBounds().contains(manatee.x, manatee.y)) {
      gameOver();
    };
  }
});
