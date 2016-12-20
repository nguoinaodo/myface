'use strict';

var conn = require('../db/mysql/connection.js');
var tokenCollection = require('../db/lokijs/token.js');
var moment = require('moment');

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
                var noti = {
                    dateTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                    actionCode: 3, // friend request
                    read: false,
                    from: myId,
                    to: userId
                };

                query = 'INSERT INTO friend_request SET ? ON DUPLICATE KEY UPDATE ?';
                conn.query(query, [noti, {dateTime: noti.dateTime}], function(err, result) {
                    if (err) return console.error(err);

                    var tokenDoc = tokenCollection.findOne({userId: userId});
                    if (tokenDoc) {
                        noti.displayName = req.user.displayName;
                        delete noti.to;
                        io.sockets.connected[tokenDoc.socketId].emit('friendRequest', noti);
                    }
                });
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
            
            var query = 'DELETE FROM relationship WHERE userId1 = ? AND userId2 = ?;';
            conn.query(query, [userId1, userId2], function(err, result) {
                if (err) return console.error(err);
                
                query = 'DELETE FROM friend_request WHERE (`to` = ? AND `from` = ?) OR (`to` = ? AND `from` = ?) AND actionCode = 4;'; 
                conn.query(query, [myId, userId, userId, myId], function(err, result) {
                    if (err) return console.error(err);

                    res.json({errCode: 0, msg: 'Successfully unfriend'});
                });
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
            
            var query = 'DELETE FROM relationship WHERE userId1 = ? AND userId2 = ?;';
            conn.query(query, [userId1, userId2], function(err, result) {
                if (err) return console.error(err);
                query = 'DELETE FROM friend_request WHERE `from` = ? AND `to` = ? AND actionCode = 3;'; // delete friend request notification
                conn.query(query, [myId, userId], function(err, result) {
                    if (err) return console.error(err);

                    res.json({errCode: 0, msg: 'Successfully cancel request'});
                });  
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
            var query = 'DELETE FROM relationship WHERE userId1 = ? AND userId2 = ?;';
            conn.query(query, [userId1, userId2], function(err, result) {
                if (err) return console.error(err);
                
                query = 'DELETE FROM friend_request WHERE `from` = ? AND `to` = ? AND actionCode = 3;'; // delete friend request notification
                conn.query(query, [userId, myId], function(err, result) {
                    if (err) return console.error(err);
                    
                    res.json({errCode: 0, msg: 'Successfully delete request'});
                });
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
                var noti = {
                    dateTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                    actionCode: 4, // friend request accepted
                    read: false,
                    from: myId,
                    to: userId
                };

                query = 'DELETE FROM friend_request WHERE `to` = ? AND `from` = ? AND actionCode = 3;' /* delete friend request notification */
                conn.query(query, [myId, userId], function(err, result) {
                    if (err) return console.error(err);

                    query = 'INSERT INTO friend_request SET ?'; /* friend request accepted notification to requester */
                    conn.query(query, [noti], function(err, result) {
                        if (err) return console.error(err);

                        var tokenDoc = tokenCollection.findOne({userId: userId});
                        if (tokenDoc) {
                            noti.displayName = req.user.displayName;
                            delete noti.to;
                            io.sockets.connected[tokenDoc.socketId].emit('friendRequestAccepted', noti);
                        }    
                    });
                });
            });
        } else {
            res.redirect('/');
        }
    };
};
