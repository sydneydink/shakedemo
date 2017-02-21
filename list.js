var serialport = require('serialport');
var SerialPort = serialport;
portName = process.argv[2];

// list serial ports:
serialport.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
  });
});