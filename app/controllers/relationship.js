'use strict';

var conn = require('../db/mysql/connection.js');
var tokenCollection = require('../db/lokijs/token.js');

module.exports = function(io) {
    this.addFriend = function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var myId = req.user.userId;
            var userId = Number(req.body.userId);
            var userId1, userId2;
            
            if (myId < userId) {
                userId1 = myId;
                userId2 = userId;
            } else {
                userId1 = userId;
                userId2 = myId;
            }
            var query = 'INSERT INTO relationship (userId1, userId2, statusCode, actionId)'
                + ' VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE ?';
            
            conn.query(query, [userId1, userId2, 0, myId, {statusCode: 0, actionId: myId}], function(err, result) {
                if (err) return console.error(err);
                
                res.json({errCode: 0, msg: 'Friend request sent'});
                // send notification to user who friend request sent to
                var tokenDoc = tokenCollection.findOne({userId: userId2});
                if (tokenDoc) {
                    io.sockets.connected[tokenDoc.socketId].emit('friendRequest', {
                        from: userId1
                    });
                }
            });
        } else {
            res.redirect('/');
        }
    };
    
    this.unfriend = function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var myId = req.user.userId;
            var userId = Number(req.body.userId);
            var userId1, userId2;
            
            if (myId < userId) {
                userId1 = myId;
                userId2 = userId;
            } else {
                userId1 = userId;
                userId2 = myId;
            }
            
            var query = 'DELETE FROM relationship WHERE userId1 = ? AND userId2 = ?'; 
            conn.query(query, [userId1, userId2], function(err, result) {
                if (err) return console.error(err);
                
                res.json({errCode: 0, msg: 'Successfully unfriend'});
            });
        } else {
            res.redirect('/');
        }
    };
    
    this.cancelRequest = function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var myId = req.user.userId;
            var userId = Number(req.body.userId);
            var userId1, userId2;
            
            if (myId < userId) {
                userId1 = myId;
                userId2 = userId;
            } else {
                userId1 = userId;
                userId2 = myId;
            }
            
            var query = 'DELETE FROM relationship WHERE userId1 = ? AND userId2 = ?'; 
            conn.query(query, [userId1, userId2], function(err, result) {
                if (err) return console.error(err);
                
                res.json({errCode: 0, msg: 'Successfully cancel request'});
            });
        } else {
            res.redirect('/');
        }
    };
    
    this.deleteRequest = function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var myId = req.user.userId;
            var userId = Number(req.body.userId);
            var userId1, userId2;
            
            if (myId < userId) {
                userId1 = myId;
                userId2 = userId;
            } else {
                userId1 = userId;
                userId2 = myId;
            }
            var query = 'DELETE FROM relationship WHERE userId1 = ? AND userId2 = ?'; 
            conn.query(query, [userId1, userId2], function(err, result) {
                if (err) return console.error(err);
                
                res.json({errCode: 0, msg: 'Successfully delete request'});
            });
        } else {
            res.redirect('/');
        }
    };
    
    this.acceptRequest = function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var myId = req.user.userId;
            var userId = Number(req.body.userId);
            var userId1, userId2;
            
            if (myId < userId) {
                userId1 = myId;
                userId2 = userId;
            } else {
                userId1 = userId;
                userId2 = myId;
            }
            
            var query = 'UPDATE relationship SET ? WHERE userId1 = ? AND userId2 = ?';
            conn.query(query, [{statusCode: 1, actionId: myId}, userId1, userId2], function(err, result) {
                if (err) return console.error(err);
                
                res.json({errCode: 0, msg: 'Successfully accept request'});
                // send notification
                var tokenDoc = tokenCollection.findOne({userId: userId2});
                if (tokenDoc) {
                    io.sockets.connected[tokenDoc.socketId].emit('friendRequestAccepted', {
                        from: userId1 
                    });
                }
            });
        } else {
            res.redirect('/');
        }
    };
};
