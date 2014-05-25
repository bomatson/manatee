var Food = SeaCreature.extend({
  init: function() {
    this._super('food', 300);
    this.image.eat = this.eat;
    this.image.down = true;
    this.image.speed = ((Math.random() * 0.5) + 0.2);
    this.image.className = 'Food'
  },
  render: function(yPosition) {
    this._super(500);
    this.image.position.x = 10;
  },
  updateMovement: function() {
    this.position.x += 0.3 * delta * this.speed;
    if(this.down){
      if( this.position.y <= (HEIGHT - 100)){
        this.position.y += 0.2 * delta;
      }else{
        this.down  = false;
      }
    }else{
      if( this.position.y >= 10){
        this.position.y -= 0.2 * delta;
      }else{
        this.down  = true;
      }
    }
  },
  checkBounds: function() {
    if(this.x > (WIDTH - 10)) {
      game.gameOver();
      game.stage.removeChild(this);
    }
  },
  eat: function(manatee) {
    if(manatee.hitArea.contains(this.x, this.y)) {
      counter++;
      game.countingText.setText(counter);
      game.stage.removeChild(this);
    };
  }
});
