var Alligator = SeaCreature.extend({
  init: function() {
    this._super('alligator', 500);
    this.image.eat = this.eat;
    this.image.className = 'Alligator'
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
      game.stage.removeChild(this);
      enemyPresent = false;
    }
  },
  eat: function(manatee) {
    if(this.getBounds().contains(manatee.x, manatee.y)) {
      game.gameOver();
    };
  }
});
