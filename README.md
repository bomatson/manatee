#Launching a LeapMotion Manatee App

The LeapMotion, a small usb device used to gather motion sensing data, has a variety of applications in science, medicine, and the arts. Previously, I worked on a Leap DrumKit using Ruby and MIDI and it was a great experience. For the next Leap app, I opted to get a little more sophisticated. This time, I wanted to create a game where swimming manatees are controlled with your fingertips. You can see a demonstration of the app here: VIDEO 

###How the LeapMotion uses Websockets

Since I wanted to get my manatees to swim on the live web, I did a little research on how the LeapMotion handles the websocket handshake. As it turns out, every time you connect the device, it broadcasts tracking information in JSON format via a web socket server accessible at ws://127.0.0.1:6437. This makes it pretty simple to talk the server’s stream:

````
var webSocket = require('ws’);

ws = new WebSocket("ws://localhost:6437/v5.json");

````

The server itself is provided by the `leapd` process, which runs as a daemon on OS X and Linux.

Once we are connected to the socket, we can hook into existing listeners, such as `onopen` and `onclose`. This example illustrates the `onmessage` capability for getting frame data:

````
ws.onmessage = function(event) {
      var frame = JSON.parse(event.data);

      if(frame.id){
          console.log("Frame data for " + frame.id);
      } else {
          console.log("message " + event.data);
      }
  };
````

Each of these events, called deviceEvents, has a state and tracking data associated with it. For instance, if you were looking for data on specific finger (named Pointables by the Leap team), the server would respond to the client in the following format:

````
"pointables": array of Pointable objects
   "direction": array of floats (vector)
   "handId": integer
   "id": integer
   "length": float
   "stabilizedTipPosition": array of floats (vector)
   "timeVisible": float
   "tipPosition":  array of floats (vector)
   "tipVelocity":  array of floats (vector)
   "tool": boolean (true or false)
   "touchDistance": float
   "touchZone": string - one of "none", "hovering", "touching"
````

LeapJS, the javascript library for the LeapMotion, does an impressive job of handling this websocket connection. Taking a peak, I noticed that the library used EventEmitter to broadcast connection event types when handling each frame:

````
BaseConnection.prototype.handleData = function(data) {
  var message = JSON.parse(data);

  var messageEvent;
  if (this.protocol === undefined) {
    messageEvent = this.protocol = chooseProtocol(message);
    this.protocolVersionVerified = true;
    this.emit('ready');
  } else {
    messageEvent = this.protocol(message);
  }
  this.emit(messageEvent.type, messageEvent);
}
````

We can also see that there is a base connection that sets up the socket differently based on whether it has been detected as being in a browser vs. node:

````
BrowserConnection.prototype.setupSocket = function() {
  var connection = this;
  var socket = new WebSocket(this.getUrl());
  socket.onopen = function() { connection.handleOpen(); };
  socket.onclose = function(data) { connection.handleClose(data['code'], data['reason']); };
  socket.onmessage = function(message) { connection.handleData(message.data) };
  return socket;
}
````

There’s our friendly `onmessage` handler from earlier!

After reading more into the source, it became clear that I would not even need to enable websockets when deploying to Heroku. As we can see, the LeapJS exposes data from the controller to the user’s browser, which persists to the local, lightweight server that is already running. Since there is no remote connection needed (unless you are saving the frame data), deploying an app is a pretty simple task. 

###Using LeapJS to Make Manatees

Okay, back to manatees! LeapJS It provides a variety of really helpful namespaces for using the LeapMotion API. After loading the CDN in the head script tags, I immediately had access to the Leap object. The most important function for gathering frames is `Leap.loop`, which we can pass options (such as frameEventName to use requestAnimationFrame) and a callback function:


````
Leap.loop(function(frame) {

  frame.pointables.forEach(function(pointable, index) {
  var manatee = ( manatees[index] || (manatees[index] = new Manatee()) );
  manatee.setTransform(pointable.screenPosition());
  });
}).use('screenPosition', {scale: 0.25});
````

I referenced the LeapJS examples when figuring out the best way to simulate Manatees swimming. LeapJS just released a few great plugins that extend the functionality of the LeapMotion in the browser. As you can see in the example, I used screenPosition, allowing me to access the on-screen position of “any point in Leap-space.”

Next, I created the Manatee and gave it some properties:

````
var Manatee = function() {
  var manatee = this;
  var img = document.createElement('img');
  img.src = 'http://projects-ext.s3.amazonaws.com/personal/manatee2.jpg';
  img.style.position = 'absolute';

  manatee.setTransform = function(position) {

    img.style.left = position[0] - img.width  / 2 + 'px';
    img.style.top  = position[1] - img.height / 2 + 'px';

    img.style.webkitTransform = img.style.MozTransform = img.style.msTransform =
      img.style.OTransform = img.style.transform;

  };
};
````

The real interesting part is setTransform, which uses the image height and width to determine positioning. On every frame, the app passes each finger’s screenPosition to that manatee’s setTransform function, which will update the image’s location on the screen. 

This was my first draft of the app, where all I used were two files (manatee.html & manatee.js) to get up to 10 manatees swimming together! You can see the code in a spike branch on github https://github.com/bomatson/manatee/tree/spike/minimalist

###Deploying the Manatees

Next, I used Node.js, Express.js and the Jade tempting engine to setup a bit of structure around the manatees:

````
var express = require("express");
var logfmt = require("logfmt");
var leapPlugins = require('leapjs-plugins');
var controller = new Leap.Controller()

var app = express();

app.use(logfmt.requestLogger());

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

var streaming = controller.connected();
console.log(streaming)

app.get('/', function(req, res) {
  res.render('root', { title: 'Manatees!', streaming: streaming });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log("Listening on " + port);
});
````

I had planned on using the npm packages for LeapJS & its plugins, but struggled when trying to get frame data to the view. Eventually I landed on just loading up the the CDN directly in the view:

````
head
  script(type='text/javascript' src='http://js.leapmotion.com/leap-0.4.3.min.js')
  script(type='text/javascript' src='http://js.leapmotion.com/leap-plugins-0.1.3.js')
````

Once I could get the manatees swimming locally again, I created a Procfile with `web node web.js` and a package.json file. From there, I ran `heroku create` and `git push heroku master`. Before I knew it, I could swim with manatees over the live web! You can see the app running on heroku here: http://manatee-swim.herokuapp.com/

###Next Steps

For this experiment, it would be fun to add collision detection and a bit of side scrolling in ocean. Right now, the poor thing just floats in air. As part of this improvement, I want to figure out a better structure to deploying LeapJs applications. I would prefer to send frame data with express.js somehow and setup routes that are bound to certain Leap events. If that is too heavy, I could at least set up listeners that interact with the html elements directly, and most likely use canvas if I end up doing more intense drawing on the DOM. 


