function setAlarm(message, timeout) {
  
  // Define handle in the closure
  function handle() {
    console.log(message);
  }
  
  setTimeout(handle, timeout);
}

setAlarm("Wake UP!", 100);
