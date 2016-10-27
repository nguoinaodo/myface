'use strict';

var pool = require('../db/pool.js');

module.exports = {
    addFriend: function(req, res) {
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
            
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                conn.query('INSERT INTO relationship (userId1, userId2, statusCode, actionId)'
                    + ' VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE ?;', 
                    [userId1, userId2, 0, myId, {statusCode: 0, actionId: myId}],
                    function(err, result) {
                        
                        if (err) {
                            conn.release();
                            throw err;
                        }
                        
                        conn.release();
                        res.json({errCode: 0, msg: 'Friend request sent'});
                    });
            });
        } else {
            res.redirect('/');
        }
    },
    
    unfriend: function(req, res) {
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
            
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                conn.query('DELETE FROM relationship WHERE userId1 = ? AND userId2 = ?',
                    [userId1, userId2],
                    function(err, result) {
                    
                        if (err) {
                            conn.release();
                            throw err;
                        }
                        
                        conn.release();
                        res.json({errCode: 0, msg: 'Successfully unfriend'});
                    });
            });
        } else {
            res.redirect('/');
        }
    },
    
    cancelRequest: function(req, res) {
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
            
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                conn.query('DELETE FROM relationship WHERE userId1 = ? AND userId2 = ?',
                    [userId1, userId2],
                    function(err, result) {
                        if (err) {
                            conn.release();
                            throw err;
                        }
                        
                        conn.release();
                        res.json({errCode: 0, msg: 'Successfully cancel request'});
                    });
            });
        } else {
            res.redirect('/');
        }
    },
    
    deleteRequest: function(req, res) {
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
            
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                conn.query('DELETE FROM relationship WHERE userId1 = ? AND userId2 = ?',
                    [userId1, userId2],
                    function(err, result) {
                        if (err) {
                            conn.release();
                            throw err;
                        }
                        
                        conn.release();
                        res.json({errCode: 0, msg: 'Successfully delete request'});
                    });
            });
        } else {
            res.redirect('/');
        }
    },
    
    acceptRequest: function(req, res) {
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
            
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                conn.query('UPDATE relationship SET ? WHERE userId1 = ? AND userId2 = ?;',
                    [{statusCode: 1, actionId: myId}, userId1, userId2],
                    function(err, result) {
                        if (err) {
                            conn.release();
                            throw err;
                        }
                        
                        conn.release();
                        res.json({errCode: 0, msg: 'Successfully accept request'});
                    });
            });
        } else {
            res.redirect('/');
        }
    }
};
