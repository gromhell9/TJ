// Board Setup
var board = new five.Board({port: "COM5"});

board.on("ready", function() {

  var led = new five.Led(11);

  led.pulse(1500);
});
