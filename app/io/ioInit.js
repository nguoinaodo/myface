var tokenCollection = require('../db/lokijs/token');
var handleSocket = require('./handleSocket');
var conn = require('../db/mysql/connection')

module.exports = function(io) {
    
    io.on('connection', function(socket) {
        console.log('A socket connect ' + socket.id);
        
        var authTimeout = setTimeout(function() {
            if (!tokenCollection.findOne({socketId: socket.id})) {
                console.log('Disconnect socket ' + socket.id + ': not authenticate in 10s'); 
                socket.disconnect();
            }
        }, 20000);
        
        socket.on('auth', function(data) {
            console.log(data);
            var tokenDoc = tokenCollection.findOne({'$and': [{token: data.token}, {userId: data.userId}]}); 
            if (!tokenDoc) {
                console.log('Decline socket ' + socket.id);
                socket.disconnect();
            } else {
                tokenDoc.socketId = socket.id;
                console.log('Accept socket ' + socket.id);
                socket.emit('welcome');
                handleSocket(io, socket);
                // notify online friends
                var userId = tokenDoc.userId;
                var onlineFriends = [];
                var query = 'SELECT userId2 AS friendId FROM relationship WHERE userId1 = ? AND `statusCode` = 1';
                conn.query(query, [userId], (err, rows) => {
                    if (err) return console.error(err);
                    rows.forEach((row, i) => {
                        var friendDoc = tokenCollection.findOne({userId: row.friendId});
                        if (friendDoc) {
                            if (friendDoc.socketId) {
                                onlineFriends.push(friendDoc.socketId);
                            }    
                        }
                    });
                    query = 'SELECT userId1 AS friendId FROM relationship WHERE userId2 = ? AND `statusCode` = 1';
                    conn.query(query, [userId], (err, rows) => {
                        if (err) return console.error(err);
                        rows.forEach((row, i) => {
                            var friendDoc = tokenCollection.findOne({userId: row.friendId});
                            if (friendDoc) {
                                if (friendDoc.socketId) {
                                    onlineFriends.push(friendDoc.socketId);
                                }    
                            }         
                        });
                        // notify
                        onlineFriends.forEach((socketId) => {
                            query = 'SELECT displayName, (SELECT url FROM avatar, photo WHERE avatar.photoId = photo.photoId' +
                                ' AND avatar.userId = ? ORDER BY avatar.`dateTime` DESC LIMIT 1) AS avatarUrl' +
                                ' FROM `user` WHERE userId = ?';
                            conn.query(query, [userId, userId], (err, rows) => {
                                if (err) return console.error(err);

                                if (rows[0]) {
                                    io.sockets.connected[socketId].emit('goOnline', {
                                        socketId: socket.id,
                                        userId: userId,
                                        displayName: rows[0].displayName,
                                        avatarUrl: rows[0].avatarUrl
                                    });
                                }   
                            });
                        });     
                    });
                });
            }
        });
        
        socket.on('disconnect', function() {
            clearTimeout(authTimeout);
            console.log('A socket disconnect ' + socket.id);
            var tokenDoc = tokenCollection.findOne({socketId: socket.id});
            if (tokenDoc) {
                var userId = tokenDoc.userId;
                // notify online friends
                var onlineFriends = [];
                var query = 'SELECT userId2 AS friendId FROM relationship WHERE userId1 = ? AND `statusCode` = 1';
                conn.query(query, [userId], (err, rows) => {
                    if (err) return console.error(err);
                    rows.forEach((row, i) => {
                        var friendDoc = tokenCollection.findOne({userId: row.friendId});
                        if (friendDoc) {
                            if (friendDoc.socketId) {
                                onlineFriends.push(friendDoc.socketId);
                            }    
                        }
                    });
                    query = 'SELECT userId1 AS friendId FROM relationship WHERE userId2 = ? AND `statusCode` = 1';
                    conn.query(query, [userId], (err, rows) => {
                        if (err) return console.error(err);
                        rows.forEach((row, i) => {
                            var friendDoc = tokenCollection.findOne({userId: row.friendId});
                            if (friendDoc) {
                                if (friendDoc.socketId) {
                                    onlineFriends.push(friendDoc.socketId);
                                }    
                            }    
                        });
                        // notify
                        onlineFriends.forEach((socketId) => {
                            io.sockets.connected[socketId].emit('goOffline', {
                                socketId: socket.id,
                                userId: userId
                            });
                            console.log('send goOffline')
                        });
                        //
                        delete tokenDoc.socketId;                        
                    });
                });
            }
        });
    });
};