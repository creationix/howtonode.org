db.subscribeTo("flight_stream", function(channel, message, pattern) {
    try { var flight = JSON.parse(message); }
    catch (SyntaxError) { return false; }

    if ( flight.origin.iata == "BOS" || flight.destination.iata == "BOS") {
        server.broadcast(message);
    }
});