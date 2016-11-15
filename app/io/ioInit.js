var tokenCollection = require('../db/lokijs/token');
var handleSocket = require('./handleSocket');

module.exports = function(io) {
    
    io.on('connection', function(socket) {
        console.log('A socket connect ' + socket.id);
        
        var authTimeout = setTimeout(function() {
            if (!tokenCollection.findOne({socketId: socket.id})) {
                console.log('Disconnect socket ' + socket.id + ': not authenticate in 10s'); 
                socket.disconnect();
            }
        }, 10000);
        
        socket.on('auth', function(data) {
            console.log(data);
            var tokenDoc = tokenCollection.findOne({
                userId: data.userId, 
                token: data.token
            }); 
            if (!tokenDoc) {
                console.log('Decline socket ' + socket.id);
                socket.disconnect();
            } else {
                tokenDoc.socketId = socket.id;
                handleSocket(io);
                console.log('Accept socket ' + socket.id);
                socket.emit('welcome');
            }
        });
        
        socket.on('disconnect', function() {
            clearTimeout(authTimeout);
            console.log('A socket disconnect ' + socket.id);
            var tokenDoc = tokenCollection.findOne({socketId: socket.id});
            if (tokenDoc) {
                delete tokenDoc.socketId;
            }
        });
        
    });
};