'use strict';

var pool = require(process.cwd() + '/app/db/pool.js');

var postController = {
    getPost: function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var postId = req.params.postId;
            
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                var contentQuery = 'select user.userId, displayName, dateTime, text from user, dang_bai, post'
                    + ' where user.userId = dang_bai.userId and post.postId = dang_bai.postId and post.postId = "' + postId + '";'
                    + ' select count(userId) from yeu_thich '
                    + ' where postId = "' + postId + '";'
                    + ' select url from photo where postId = "' + postId + '";';
                
                conn.query(contentQuery, function(err, results) {
                    if (err) {
                        conn.release();
                        throw err;
                    }
            
                    var userId = results[0][0]['userId'];
                    var photoUrls = [];
                    
                    results[2].forEach(function(row) {
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
                            avatarUrl: rows[0]? rows[0]['url']: '',
                            content: results[0][0],
                            likes: results[1][0]['count(userId)'],
                            photoUrls: photoUrls
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
                        res.json([]);
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
                                res.json({comments: results});
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
                                    liked: true,
                                    likes: results[1][0]['count(userId)']
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
                                    liked: false,
                                    likes: results[1][0]['count(userId)']
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
                    var dateTime = new Date().toJSON().substring(0, 19).replace(/T/, ' ');
                    
                    conn.query('insert into binh_luan set ?',
                        [{userId: userId, postId: postId, commentId: commentId, dateTime: dateTime}], function(err, result) {
                            if (err) {
                                conn.release();
                                throw err;
                            }
                            
                            res.json({
                                userId: userId,
                                displayName: req.user.displayName,
                                dateTime: dateTime,
                                commentId: commentId
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
            var userId = req.user.userId;
            var text = req.body.text;
            
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                conn.query('insert into post set ?;', [{text: text}], function(err, result) {
                    if (err) {
                        conn.release();
                        throw err;
                    }
                    
                    var postId = result.insertId;
                    var dateTime = new Date().toJSON().substring(0, 19).replace(/T/, ' ');
                    
                    conn.query('insert into dang_bai set ?', [{postId: postId, userId: userId, dateTime: dateTime}],
                        function(err, result) {
                            if (err) {
                                conn.release();
                                throw err;
                            } 
                            
                            conn.release();
                            res.json({
                                userId: userId,
                                displayName: req.user.displayName,
                                dateTime: dateTime,
                                postId: postId
                            }); 
                        });
                });
            });
        } else {
            res.redirect('/');
        }
    }
};

module.exports = postController;