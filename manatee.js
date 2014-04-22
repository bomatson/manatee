manatees = {};

Leap.loop(function(frame) {

  frame.pointables.forEach(function(pointable, index) {
    var manatee = ( manatees[index] || (manatees[index] = new Manatee()) );
    manatee.setTransform(pointable.screenPosition());
  });

}).use('screenPosition', {scale: 0.25});

var Manatee = function() {
  var manatee = this;
  var img = document.createElement('img');
  var pictures = Array(
      'http://ian.umces.edu/imagelibrary/albums/userpics/12789/normal_ian-symbol-trichechus-spp.png',
      'http://projects-ext.s3.amazonaws.com/personal/manatee2.jpg',
      'http://projects-ext.s3.amazonaws.com/personal/manatee.jpg');
  img.src = pictures[Math.floor(Math.random()*pictures.length)];
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

    img.style.webkitTransform = img.style.MozTransform = img.style.msTransform =
      img.style.OTransform = img.style.transform;

  };
};

manatees[0] = new Manatee();
