function ioConnect() {
    socket = io.connect();

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

    // notification
    var notiCountSpan = document.getElementById('noti-count');
    var friendReqCountSpan = document.getElementById('friend-req-count');

    socket.on('like', function(data) {
        getNotiCount();
    }); 

    socket.on('comment', function(data) {
        getNotiCount();
    }); 

    socket.on('postOnWall', function(data) {
        getNotiCount();    
    });

    socket.on('friendRequest', function(data) {
        getFriendReqNotiCount();
    });

    socket.on('friendRequestAccepted', function(data) {
        getFriendReqNotiCount();
    });
}


