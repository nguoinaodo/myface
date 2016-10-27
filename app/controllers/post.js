'use strict';

var pool = require(process.cwd() + '/app/db/pool.js');

var postController = {
    getPost: function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var postId = req.params.postId;
            
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                var infoQuery = 'SELECT user.userId, displayName, dateTime, text FROM user, dang_bai, post'
                    + ' WHERE user.userId = dang_bai.userId AND post.postId = dang_bai.postId AND post.postId = ?;'
                    + 'SELECT user.userId, displayName, dateTime, text FROM user, dang_len_tuong, post'
                    + ' WHERE user.userId = dang_len_tuong.userId1 AND post.postId = dang_len_tuong.postId AND post.postId = ?;';
                var likeQuery =  'SELECT count(userId) FROM yeu_thich '
                    + ' WHERE postId = ?;';
                var photoQuery = 'SELECT url FROM photo WHERE postId = ?;';
                
                conn.query(infoQuery + likeQuery + photoQuery, [postId, postId, postId, postId], function(err, results) {
                    if (err) {
                        conn.release();
                        throw err;
                    }
                    
                    var content = results[0][0]? results[0][0]: results[1][0];
                    var userId = content['userId'];
                    var photoUrls = [];
                    
                    results[3].forEach(function(row) {
                        photoUrls.push(row.url); 
                    });
                    
                    var avatarQuery = 'select url from avatar, photo '
                        + 'where avatar.photoId = photo.photoId and userId = "' + userId + '" '
                        + 'order by dateTime desc limit 1';
                    
                    conn.query(avatarQuery, function(err, rows) {
                        if (err) {
                            conn.release();
                            throw err;
                        }
                        
                        conn.release();
                    
                        res.json({
                            data: {
                                avatarUrl: rows[0]? rows[0]['url']: '',
                                content: content,
                                likes: results[2][0]['count(userId)'],
                                photoUrls: photoUrls
                            }
                        });  
                    });
                });
            });
        } else {
            res.redirect('/');
        }
    },
    
    getPostComments: function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var postId = req.params.postId;
            
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                var query = 'select user.userId, displayName, dateTime, text, comment.commentId' 
                    + ' from user, binh_luan, comment'
                    + ' where user.userId = binh_luan.userId and comment.commentId = binh_luan.commentId'
                    + ' and postId = "' + postId + '"'
                    + ' order by dateTime desc;';
                conn.query(query, function(err, rows) {
                    if (err) {
                        conn.release();
                        throw err;
                    }
                    
                    var results = [];
                    var count = rows.length;
                    
                    if (count === 0) {
                        conn.release();
                        res.json({data: []});
                    }
                    
                    rows.forEach(function(row, i) {
                        var userId = row.userId;
                        var query = 'select url from avatar, photo'
                            + ' where avatar.photoId = photo.photoId'
                            + ' and userId = "' + userId + '"'
                            + ' order by dateTime desc limit 1;';
                        
                        conn.query(query, function(err, rows) {
                            if (err) {
                                conn.release();
                                throw err;
                            }
                            
                            row.avatarUrl = rows[0]? rows[0].url: '';
                            results[i] = row;
                            count--;
                            
                            if (count === 0) {
                            
                                conn.release();
                                res.json({
                                    data: {
                                        comments: results
                                    }
                                });
                            }
                        });
                    });
                    
                    
                });
            });
        } else {
            res.redirect('/');
        }
    },
    
    like: function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var postId = req.params.postId;
            var userId = req.user.userId;
            
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                var query = 'select * from yeu_thich'
                    + ' where userId = "' + userId + '" and postId = "' + postId + '";';
                conn.query(query, function(err, rows) {
                    if (err) {
                        conn.release();
                        throw err;
                    }
                    
                    if (rows.length === 0) {
                        // like
                        conn.query('insert into yeu_thich set ?;'
                            + ' select count(userId) from yeu_thich'
                            + ' where postId = ?;', [{userId: userId, postId: postId}, postId], 
                            function(err, results) {
                                if (err) {
                                    conn.release();
                                    throw err;
                                }
                                
                                conn.release();
                                res.json({
                                    data: {
                                        liked: true,
                                        likes: results[1][0]['count(userId)']
                                    }
                                });
                            });
                    } else {
                        // unlike
                        conn.query('delete from yeu_thich'
                            + ' where userId = ? and postId = ?;'
                            + ' select count(userId) from yeu_thich'
                            + ' where postId = ?;', [userId, postId, postId],
                            function(err, results) {
                                if (err) {
                                    conn.release();
                                    throw err;
                                }
                                
                                conn.release();
                                res.json({
                                    data: {
                                        liked: false,
                                        likes: results[1][0]['count(userId)']   
                                    }
                                });
                            });
                    }
                });
            });
        } else {
            res.redirect('/');
        }
    },
    
    comment: function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var postId = req.params.postId;
            var userId = req.user.userId;
            var text = req.body.text;
            
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                conn.query('insert into comment set ?', [{text: text}], function(err, result) {
                    if (err) {
                        conn.release();
                        throw err;
                    }
                    
                    var commentId = result.insertId;
                    var dateTime = new Date().toJSON().substring(0, 19).replace(/T|Z/, ' ');
                    
                    conn.query('insert into binh_luan set ?',
                        [{userId: userId, postId: postId, commentId: commentId, dateTime: dateTime}], function(err, result) {
                            if (err) {
                                conn.release();
                                throw err;
                            }
                            
                            res.json({
                                data: {
                                    userId: userId,
                                    displayName: req.user.displayName,
                                    dateTime: dateTime,
                                    commentId: commentId
                                }
                            });
                        });
                });
            });
        } else {
            res.redirect('/');
        }
    },
    
    addPost: function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var myId = req.user.userId;
            var userId = Number(req.body.to);
            var text = req.body.text;
            
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                conn.query('INSERT INTO post SET ?;', [{text: text}], function(err, result) {
                    if (err) {
                        conn.release();
                        throw err;
                    }
                    
                    var postId = result.insertId;
                    var dateTime = new Date().toJSON().substring(0, 19).replace(/T|Z/, ' ');
                    
                    if (myId === userId || userId === -1) {
                        // post 
                        conn.query('INSERT INTO dang_bai SET ?', [{postId: postId, userId: myId, dateTime: dateTime}],
                            function(err, result) {
                                if (err) {
                                    conn.release();
                                    throw err;
                                } 
                                
                                conn.release();
                                res.json({
                                    errCode: 0,
                                    msg: 'Successfully posted',
                                    data: {
                                        postId: postId
                                    }
                                }); 
                            });
                    } else {
                        // post onto other's wall
                        // check friendship
                        var userId1, userId2;
                        
                        if (myId < userId) {
                            userId1 = myId;
                            userId2 = userId;
                        } else {
                            userId1 = userId;
                            userId2 = myId;
                        }
                        
                        conn.query('SELECT * FROM relationship WHERE userId1 = ? AND userId2 = ?;',
                            [userId1, userId2], function(err, rows) {
                                if (err) {
                                    conn.release();
                                    throw err;
                                } 
                                
                                if (!rows[0] || rows[0].statusCode !== 1) {
                                    return res.json({errCode: -1, msg: 'Not friend'});
                                }
                                
                                conn.query('INSERT INTO dang_len_tuong SET ?', 
                                    [{postId: postId, userId1: myId, userId2: userId, dateTime: dateTime}],
                                    function(err, result) {
                                        if (err) {
                                            conn.release();
                                            throw err;
                                        } 
                                        
                                        conn.release();
                                        res.json({
                                            errCode: 0,
                                            msg: 'Successfully posted on this user wall',
                                            data: {
                                                postId: postId
                                            }
                                        }); 
                                    });
                            });
                    }
                });
            });
        } else {
            res.redirect('/');
        }
    }
};

module.exports = postController;