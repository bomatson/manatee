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
  img.src = 'http://projects-ext.s3.amazonaws.com/personal/manateeee.png';
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

    if (position[1] > (window.innerHeight/2)) {
      document.getElementById('chirp').play()
    };

    img.style.webkitTransform = img.style.MozTransform = img.style.msTransform =
      img.style.OTransform = img.style.transform;

  };
};

manatees[0] = new Manatee();
