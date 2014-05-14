var canvas, ctx, lettuce, animationId, counter, content;
var xPos = 0;
var yPos = 0;

function setup() {
  canvas = document.getElementById('canvas');
  content = document.getElementById('content');
  ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  content.height = canvas.height;

  setCounter();

  renderLettuce();
  animationId = requestAnimationFrame(throwLettuce);
};

function renderLettuce() {
  lettuce = new Image();
  lettuce.src = 'http://projects-ext.s3.amazonaws.com/personal/food.png';
};

function throwLettuce() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  yPos = yPos + (Math.floor((Math.random() * 3) + 1));
  if (yPos > window.innerHeight) {
    // explode the lettuce
  }
  xPos = xPos += 10
  ctx.drawImage(lettuce,xPos,yPos);
  animationId = requestAnimationFrame(throwLettuce);
  checkGameEnd();
};

function catchLettuce(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  cancelAnimationFrame(animationId);
  yPos = (Math.floor((Math.random() * 200) + 1));
  xPos = (Math.floor((Math.random() * 120) + 1));
  setup();
};

function setCounter(){
  counter = document.getElementsByClassName('counter')[0];
  counter.innerHTML = 0;
};

function updateCounter(score) {
  counter.innerHTML = score;
};

function checkGameEnd() {
  if (yPos > window.innerHeight || xPos > window.innerWidth) {
    counter.innerHTML = 'Game over, sucker!'
  };
};
setup();
