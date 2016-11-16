function ioConnect() {
    var socket = io.connect();

    socket.on('connect', function() {
        console.log('Connect to socket');
        socket.emit('auth', {
            token: myToken,
            userId: myUserId
        });    
    });
    
    socket.on('disconnect', function() {
        console.log('Disconnect socket');
    });

    socket.on('welcome', function() {
        console.log('Successfully authenticated socket'); 
    });    

    socket.on('like', function(data) {
        
    }); 

    socket.on('comment', function(data) {

    });

    socket.on('postOnWall', function(data) {
        
    });

    socket.on('friendRequest', function(data) {

    });

    socket.on('friendRequestAccepted', function(data) {
        
    });
}


