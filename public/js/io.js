function ioConnect() {
    var socket = io.connect();

    socket.on('connect', function() {
        console.log('Connect to socket');
        socket.emit('auth', {
            token: myToken,
            userId: myUserId
        });    
    });
    
    socket.on('welcome', function() {
        console.log('Successfully authenticated socket'); 
    });    
}


