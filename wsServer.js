/*
Serial-to-websocket Server
using serialport.js
To call this type the following on the command line:
node wsServer.js portName
where portname is the name of your serial port, e.g. /dev/tty.usbserial-xxxx (on OSX)
created 28 Aug 2015
by Tom Igoe
*/

// include the various libraries that you'll use:
var serialport = require('serialport');       // include the serialport library
var WebSocketServer = require('ws').Server;   // include the webSocket library

// configure the webSocket server:
var SERVER_PORT = 8081;                 // port number for the webSocket server
var wss = new WebSocketServer({port: SERVER_PORT}); // the webSocket server
var connections = new Array;            // list of connections to the server

// configure the serial port:
SerialPort = serialport.SerialPort,             // make a local instance of serialport
    portName = process.argv[2],                 // get serial port name from the command line
    delimiter = process.argv[3];                // serial parser to use, from command line
var serialOptions = {                           // serial communication options
      baudRate: 9600,                           // data rate: 9600 bits per second
      parser: delimiter // newline generates a data event
    };

/*******************************************/
/* Define hardcoded codes for sending data */
/*******************************************/

// delay in miliseconds
var delay1 = 10000 
var delay2 = 15000  // delay2 includes the time for delay1 (e.g. 10 sec + 5 sec = 15 sec)

var buffer1 = new Buffer(10);
// dispense 12, multiple dispense
buffer1[0] = 0x02;   
buffer1[1] = 0x06;  
buffer1[2] = 0x02;  
buffer1[3] = 0x00;   
buffer1[4] = 0x0C;   
buffer1[5] = 0x02;
buffer1[6] = 0x00;
buffer1[7] = 0x0E;
buffer1[8] = 0x03;
buffer1[9] = 0x05;

var buffer2 = new Buffer(10);
// dispense 12, multiple dispense
buffer2[0] = 0x02;   
buffer2[1] = 0x06;  
buffer2[2] = 0x02;  
buffer2[3] = 0x00;   
buffer2[4] = 0x2A;   
buffer2[5] = 0x02;
buffer2[6] = 0x00;
buffer2[7] = 0x2C;
buffer2[8] = 0x03;
buffer2[9] = 0x01;

var buffer3 = new Buffer(10);
// dispense 12, multiple dispense
buffer3[0] = 0x02;   
buffer3[1] = 0x06;  
buffer3[2] = 0x02;  
buffer3[3] = 0x00;   
buffer3[4] = 0x35;   
buffer3[5] = 0x06;
buffer3[6] = 0x00;
buffer3[7] = 0x3B;
buffer3[8] = 0x03;
buffer3[9] = 0x0D;


var buffer4 = new Buffer(10);
// dispense 53, one dispense
buffer4[0] = 0x02;   
buffer4[1] = 0x06;  
buffer4[2] = 0x02;  
buffer4[3] = 0x00;   
buffer4[4] = 0x35;   
buffer4[5] = 0x00;
buffer4[6] = 0x00;
buffer4[7] = 0x35;
buffer4[8] = 0x03;
buffer4[9] = 0x05;



// if the delimiter is n, use readline as the parser:
if (delimiter === 'n' ) {
  serialOptions.parser = serialport.parsers.readline('\n');
}

if (typeof delimiter === 'undefined') {
  serialOptions.parser = null;
}

// If the user didn't give a serial port name, exit the program:
if (typeof portName === "undefined") {
  console.log("You need to specify the serial port when you launch this script, like so:\n");
  console.log("    node wsServer.js <portname>");
  console.log("\n Fill in the name of your serial port in place of <portname> \n");
  process.exit(1);
}
// open the serial port:
var myPort = new SerialPort(portName, function(){

});

// set up event listeners for the serial events:
myPort.on('open', showPortOpen);
myPort.on('data', sendSerialData);
myPort.on('close', showPortClose);
myPort.on('error', showError);

// ------------------------ Serial event functions:
// this is called when the serial port is opened:
function showPortOpen() {
  console.log('port open. Data rate: ' + myPort.options.baudRate);
}

// this is called when new data comes into the serial port:
function sendSerialData(data) {
  // if there are webSocket connections, send the serial data
  // to all of them:
  console.log(Number(data));
  if (connections.length > 0) {
    broadcast(data);
  }
}

function showPortClose() {
   console.log('port closed.');
}
// this is called when the serial port has an error:
function showError(error) {
  console.log('Serial port error: ' + error);
}

function sendToSerial(data) {
  console.log("sending to serial: " + data);
  
  // actual call for item 1
  dispenseCall(buffer1);

  // call for item2
  setTimeout(function(){
    dispenseCall(buffer2);
  }, delay1);

  // call for item3
  setTimeout(function(){
    dispenseCall(buffer3);
  }, delay2);
}

function dispenseCall(buffer){

  myPort.write(buffer, function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log(buffer + ' is written');
  }); 

}

// ------------------------ webSocket Server event functions
wss.on('connection', handleConnection);

function handleConnection(client) {
  console.log("New Connection");        // you have a new client
  connections.push(client);             // add this client to the connections array

  client.on('message', sendToSerial);      // when a client sends a message,

  client.on('close', function() {           // when a client closes its connection
    console.log("connection closed");       // print it out
    var position = connections.indexOf(client); // get the client's position in the array
    connections.splice(position, 1);        // and delete it from the array
  });
}
// This function broadcasts messages to all webSocket clients
function broadcast(data) {
  for (c in connections) {     // iterate over the array of connections
    connections[c].send(JSON.stringify(data)); // send the data to each connection
  }
}