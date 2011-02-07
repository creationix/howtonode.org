/* On load we create our web socket (or flash socket if your browser doesn't support it ) and
   send the d script we wish to be tracing. This extremely powerful and *insecure*. */
function heat_tracer() { 

    //Global vars
    setup();

    var socket = new io.Socket('localhost'); //connect to localhost presently
    socket.connect();

    socket.on('connect', function(){ 
	    console.log('on connection');
	    var dscript = "syscall:::entry\n{\nself->syscall_entry_ts[probefunc] = vtimestamp;\n}\nsyscall:::return\n/self->syscall_entry_ts[probefunc]/\n{\n\n@time[probefunc] = lquantize((vtimestamp - self->syscall_entry_ts[probefunc] ) / 1000, 0, 63, 2);\nself->syscall_entry_ts[probefunc] = 0;\n}";
	    socket.send( { 'dscript' : dscript } );
	});


    /* The only messages we recieve should contain contain the dtrace aggregation data we requested
       on connection. */
    socket.on('message', function(message){ 
	    //console.log( message );
	    draw(message);
	    
	    /* for ( key in message ) {
	       val = message[key];
	       console.log( 'key: ' + key + ', interval: ' + val[0][0] + '-' + val[0][1], ', count ' + val[1] );
	       }  
	    */
	});

    socket.on('disconnect', function(){ 
	});
        
}


/* Take the aggregation data and update the heatmap */
function draw(message) {  

    /* Latest data goes in the right most column, initialize it */
    var syscalls_by_latency = [];
    for ( var index = 0; index < 32; index++ ) {
	syscalls_by_latency[index] = 0;
    }
    
    /* Presently we have the latency for each system call quantized in our message. Merge the data
       such that we have all the system call latency quantized together. This gives us the number
       of syscalls made with latencies in each particular band. */
    for ( var syscall in message ) {
	var val = message[syscall];
	for ( result_index in val ) {
	    var latency_start = val[result_index][0][0];
	    var count =  val[result_index][1];
	    /* The d script we're using lquantizes from 0 to 63 in steps of two. So dividing by 2 
	       tells us which row this result belongs in */
	    syscalls_by_latency[Math.floor(latency_start/2)] += count;					  
	}
    }
    
    
    /* We just created a new column, shift the console to the left and add it. */
    console_columns.shift();
    console_columns.push(syscalls_by_latency);
    drawArray(console_columns);
}



/* Draw the columns and rows that map up the heatmap on to the canvas element */
function drawArray(console_columns) {
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
	var ctx = canvas.getContext('2d');  
	for ( var column_index in console_columns ) {
	    var column = console_columns[column_index];			      
	    for ( var entry_index in column ) {
		entry = column[entry_index];

		/* We're using a logarithmic scale for the brightness. This was all arrived at by
		   trial and error and found to work well on my Mac.  In the future this 
		   could all be adjustable with controls */
		var red_value = 0; 			      
		if ( entry != 0 ) {
		    red_value = Math.floor(Math.log(entry)/Math.log(2));			      
		}
		//console.log(red_value);			      
		ctx.fillStyle = 'rgb(' + (red_value * 25) + ',0,0)';
		ctx.fillRect(column_index*16, 496-(entry_index*16), 16, 16);
	    } 
	}
    }
}


/* The heatmap is is really a 64x32 grid. Initialize the array which contains the grid data. */
function setup() {
    console_columns = [];
    
    for ( var column_index = 0; column_index < 64; column_index++ ) {
	var column = [];
	for ( var entry_index = 0; entry_index < 32; entry_index++ ) { 
	    column[entry_index] = 0;
	}
	console_columns.push(column);
    }

}

