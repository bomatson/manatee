var express = require("express");
var logfmt = require("logfmt");
var leapPlugins = require('leapjs-plugins');
var controller = new Leap.Controller()

var app = express();

app.use(logfmt.requestLogger());

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

var streaming = controller.connected();
console.log(streaming);

app.get('/', function(req, res) {
  res.render('root', { title: 'Manatees!', streaming: streaming });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log("Listening on " + port);
});
