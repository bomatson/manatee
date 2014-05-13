manatees = {};

Leap.loop(function(frame) {

  frame.hands.forEach(function(hand, index) {
    var manatee = ( manatees[index] || (manatees[index] = new Manatee()) );
    manatee.setTransform(hand.screenPosition());
  });

}).use('screenPosition', {scale: 0.25});

var Manatee = function() {
  var manatee = this;
  var img = document.createElement('img');
  img.src = 'http://projects-ext.s3.amazonaws.com/personal/manatee-main.png';
  img.style.position = 'absolute';
  img.onload = function () {
    manatee.setTransform(
        [
        window.innerWidth/2,
        window.innerHeight/2
        ],
        0 );
    document.body.appendChild(img);
  }

  manatee.setTransform = function(position) {

    img.style.left = position[0] - img.width  / 2 + 'px';
    img.style.top  = position[1] - img.height / 2 + 'px';

    currentXPos = position[0] - img.width  / 2;
    currentYPosTop = position[1] - img.height / 2;
    currentYPosBottom = position[1] + img.height / 2;

    var lettuceYPos = (yPos + 100)
    if ((currentXPos < xPos) && (lettuceYPos < currentYPosBottom) && (lettuceYPos > currentYPosTop)) {
      manatee.eat()
    };

    img.style.webkitTransform = img.style.MozTransform = img.style.msTransform =
      img.style.OTransform = img.style.transform;

  };

  manatee.hasEaten = 0;

  manatee.eat = function() {
    img.src = 'http://projects-ext.s3.amazonaws.com/personal/manatee-munch.png';
    catchLettuce();
    document.getElementById('chirp').play()
    manatee.hasEaten++;
    updateCounter(manatee.hasEaten);
  }

  manatee.reset  = function() {
    img.src = 'http://projects-ext.s3.amazonaws.com/personal/manatee-main.png';
  }
};

manatees[0] = new Manatee();
