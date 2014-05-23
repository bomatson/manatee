var Food = SeaCreature.extend({
  init: function() {
    this._super('food', 300);
    this.image.eat = this.eat;
    this.image.down = true;
    this.image.speed = ((Math.random() * 0.3) + 0.1);
    this.image.className = 'Food'
  },
  render: function(yPosition) {
    this._super(yPosition);
    this.image.position.x = 10;
  },
  updateMovement: function() {
    this.position.x += 0.2 * delta * this.speed;
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
      stage.removeChild(this);
    }
  },
  eat: function(manatee) {
    if(manatee.hitArea.contains(this.x, this.y)) {
      counter++;
      countingText.setText(counter);
      stage.removeChild(this);
    };
  }
});
