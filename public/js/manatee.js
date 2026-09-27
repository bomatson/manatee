var Manatee = SeaCreature.extend({
  init: function() {
    this._super('manatee-main', 500);
    this.image.className = 'Manatee'
  },
  render: function(yPosition) {
    this._super(yPosition);
    this.image.position.x = WIDTH / 2;
    this.image.position.y = HEIGHT / 2;
    this.image.grow = this.grow;
    this.image.grow();
  },
  updateMovement: function(point) {
    if(point == undefined) { return }
    this.position.x = point.x;
    this.position.y = point.y;
    this.hitArea = worldBounds(this);
  },
  // Size follows the score. Runs once at spawn and after every lettuce.
  grow: function() {
    this.scale.x = manateeScale();
    this.scale.y = manateeScale();
    this.hitArea = worldBounds(this);
  }
});
