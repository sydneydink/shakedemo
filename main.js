var serialport = require('serialport');
var SerialPort = serialport;
portName = process.argv[2];

var serialData = 0;


var myPort = new SerialPort(portName, function(err){
		myPort.write('hello');
	}
);



// these are the definitions for the serial events:
myPort.on('open', showPortOpen);
myPort.on('data', saveLatestData);
myPort.on('close', showPortClose);
myPort.on('error', showError);

// these are the functions called when the serial events occur:
function showPortOpen() {
  console.log('port open. Data rate: ' + myPort.options.baudRate);
  
}

function saveLatestData(data) {
  console.log(data);
  serialData = data;
}

function showPortClose() {
  console.log('port closed.');
}

function showError(error) {
  console.log('Serial port error: ' + error);
}

// ------------------------ Server function
function sendData(request) {
  // print out the fact that a client HTTP request came in to the server:
  console.log("Got a client request, sending them the data.");
  // respond to the client request with the latest serial string:
  request.respond(serialData);
}