var sys = require('sys');

function setAlarm(message, timeout) {
  
  // Define handle in the closure
  function handle() {
    sys.puts(message);
  }
  
  setTimeout(handle, timeout);
}

setAlarm("Wake UP!", 100);
