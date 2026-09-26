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
      game.world.removeChild(this);
      enemyPresent = false;
    }
  },
  eat: function(manatee) {
    // The alligator image is half empty space, so a box test ends the game
    // while the manatee floats in clear water. Test points on the manatee's
    // body against the alligator's drawn pixels instead.
    if(!worldBounds(this).contains(manatee.x, manatee.y)) { return }
    var points = bodyPoints(manatee);
    for(var i = 0; i < points.length; i++) {
      if(spriteHitsPixel(this, points[i].x, points[i].y)) {
        game.gameOver();
        return
      }
    }
  }
});

// Sample points across a sprite's body (center, sides, top, bottom) in
// world units. Sprites are anchored at their center.
function bodyPoints(sprite) {
  var dx = sprite.width * 0.35;
  var dy = sprite.height * 0.3;
  return [
    {x: sprite.x,      y: sprite.y},
    {x: sprite.x - dx, y: sprite.y},
    {x: sprite.x + dx, y: sprite.y},
    {x: sprite.x,      y: sprite.y - dy},
    {x: sprite.x,      y: sprite.y + dy}
  ];
}

// True when the world point lands on a drawn (non-transparent) pixel of the
// sprite. The alpha mask is read from the spritesheet once per frame name.
var alphaMasks = {};
function spriteHitsPixel(sprite, worldX, worldY) {
  var frame = sprite.texture.frame;
  var localX = Math.floor(worldX - (sprite.x - sprite.width / 2));
  var localY = Math.floor(worldY - (sprite.y - sprite.height / 2));
  if(localX < 0 || localY < 0 || localX >= frame.width || localY >= frame.height) {
    return false;
  }
  var mask = alphaMaskFor(sprite);
  if(!mask) { return true }  // mask unavailable: fall back to the box test
  return mask[localY * frame.width + localX] > 40;
}

function alphaMaskFor(sprite) {
  var frame = sprite.texture.frame;
  var key = frame.x + ',' + frame.y + ',' + frame.width + ',' + frame.height;
  if(alphaMasks[key] !== undefined) { return alphaMasks[key] }
  try {
    var source = sprite.texture.baseTexture.source;
    var canvas = document.createElement('canvas');
    canvas.width = frame.width;
    canvas.height = frame.height;
    var context = canvas.getContext('2d');
    context.drawImage(source, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
    var data = context.getImageData(0, 0, frame.width, frame.height).data;
    var mask = new Uint8Array(frame.width * frame.height);
    for(var i = 0; i < mask.length; i++) { mask[i] = data[i * 4 + 3]; }
    alphaMasks[key] = mask;
  } catch(error) {
    alphaMasks[key] = null;
  }
  return alphaMasks[key];
}
