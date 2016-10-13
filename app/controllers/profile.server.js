'use strict';

var pool = require(process.cwd() + '/app/db/pool.js');

var ProfileController  = {
    
    getUser: function(req, res) {
            var auth = req.isAuthenticated();
			
			if (auth) {
			    var userId = req.user.userId;
			    
			    pool.getConnection(function(err, conn) {
			        if (err) throw err;
			        
			        var query = 'select url from avatar, photo'
			            + ' where avatar.photoId = photo.photoId'
			            + ' and userId = "' + userId + '"'
			            + ' order by dateTime desc limit 1;';
			     
			        conn.query(query, function(err, rows) {
			            if (err) throw err;
			            
			            conn.release();
			            res.render('profile', {
        					auth: auth,
        					displayName: req.user.displayName,
        					myId: userId,
        					avatarUrl: rows[0]? rows[0].url: ''
        				});
			        });
			    });
			} else {
				res.render('home', {
					auth: auth
				});
			}    
    }, 
    
    getUserInfo: function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                var query = 'select * from user where userId = "' + req.params.userId + '"';
                
                conn.query(query, function(err, rows) {
                    if (err) throw err;
                    
                    conn.release();
                    res.json(rows[0]);
                });
            });
        } else {
            res.redirect('/');
        }
    },
    
    getUserCoverAndAvatar: function(req, res) {
        var auth = req.isAuthenticated();
        
        console.log('haii');
        if (auth) {
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                var userId = req.params.userId;
                var queryAvatar = 'select url, photo.photoId from photo, avatar' 
                    +' where avatar.photoId = photo.photoId and userId = "' + userId + '" order by dateTime desc limit 1';
                var queryCover = 'select url, photo.photoId from photo, cover' 
                    + ' where cover.photoId = photo.photoId and userId = "' + userId + '" order by dateTime desc limit 1';
                var result = {
                    avatar: {},
                    cover: {}
                };
                
                conn.query(queryAvatar, function(err, rows) {
                    if (err) throw err;
                    
                    result.avatar = rows[0];
                    conn.query(queryCover, function(err, rows) {
                        if (err) throw err;
                        
                        conn.release();
                        result.cover = rows[0];
                        res.json(result);
                    });
                    
                });
            });
        } else {
            res.redirect('/');
        }
    },
    
    getUserPostIds: function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var userId = req.params.userId;
            
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                var query = 'select postId from dang_bai where userId ="' + userId + '" order by dateTime desc';
                conn.query(query, function(err, rows) {
                    if (err) throw err;
                    
                    console.log(rows);
                    conn.release();
                    var postIds = [];
                    rows.forEach(function(row) {
                        postIds.push(row.postId); 
                    });
                    res.json({postIds: postIds});
                });
            });
        } else {
            res.redirect('/');
        }
    },
    
    getPost: function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var postId = req.params.postId;
            
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                var query = 'select user.userId, displayName, dateTime, text from user, dang_bai, post'
                    + ' where user.userId = dang_bai.userId and post.postId = dang_bai.postId and post.postId = "' + postId + '";'
                    + 'select count(userId) from yeu_thich '
                    + 'where postId = "' + postId + '";';
                    
                conn.query(query, function(err, results) {
                    if (err) throw err;
                    
                    var userId = results[0][0]['userId'];
                    var query = 'select url from avatar, photo '
                        + 'where avatar.photoId = photo.photoId and userId = "' + userId + '" '
                        + 'order by dateTime desc limit 1';
                    
                    conn.query(query, function(err, rows) {
                        if (err) throw err;
                        
                        conn.release();
                    
                        res.json({
                            avatarUrl: rows[0]? rows[0]['url']: '',
                            content: results[0][0],
                            likes: results[1][0]['count(userId)']
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
                    if (err) throw err;
                    
                    console.log(rows);
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
                            if (err) throw err;
                            
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
    }
    
    /*
    getPost: function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                var query = '';
                conn.query(query, function(err, rows) {
                    if (err) throw err;
                    
                    conn.release();
                    res.json(rows[0]);
                });
            });
        } else {
            res.redirect('/');
        }
    }
    */
    
    
};

module.exports = ProfileController;