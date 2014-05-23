var Manatee = SeaCreature.extend({
  init: function() {
    this._super('manatee-main', 500);
    this.image.className = 'Manatee'
  },
  render: function(yPosition) {
    this._super(yPosition);
    this.image.position.x = WIDTH / 2;
    this.image.position.y = HEIGHT / 2;
    this.hitArea = new PIXI.Rectangle(30, 30, 100 ,100);
  },
  updateMovement: function(point) {
    if(point == undefined) { return }
    this.position.x = point.x;
    this.position.y = point.y;
    this.hitArea = this.getBounds();
  }
});
