
function delay_color(mins) {
    var min = parseInt(mins);
    if (min <= -15) return 'green';
    else if (min <= 0) return 'green';
    else if (min <= 15) return 'orange';
    else return 'red';
}

function delay_name(mins) {
    var min = parseInt(mins);
    if (min <= 0) return 'On-Time';
    else return 'Delayed';
}

var ws;
var connect = function() {
    if (!window['WebSocket']) {
        alert("No WebSocket support.");
        return;
    }

    ws = new WebSocket('ws://' + window.location.host);
    ws.onmessage = function(evt) {
        try { var flight = JSON.parse(evt.data); }
        catch (SyntaxError) { return false; }

        $('table.flight-updates > tbody').prepend(
            '<tr>' +
                '<td>' + flight.airline.icao + ' ' + flight.number + '</td>' +
                '<td>' + flight.origin.iata + '</td>' +
                '<td>' + flight.destination.iata + '</td>' +
                '<td>' +
                    '<div class="tag ' + delay_color(flight.destination.gate_delay) + '">' +
                        delay_name(flight.destination.gate_delay) +
                        '<span>' + flight.destination.gate_delay + ' min</span>' +
                    '</div>'+
                '</td>'+
                '<td>' + flight.destination.gate + '</td>' +
            '</tr>');
    };
};

$(document).ready( function() {
    connect();
});
