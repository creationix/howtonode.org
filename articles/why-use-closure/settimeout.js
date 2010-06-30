var sys = require('sys');

function handle() {
  sys.puts(message);
}

function setAlarm(message, timeout) {
  setTimeout(handle, timeout);
}

setAlarm("Wake UP!", 100);
