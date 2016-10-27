'use strict';

var pool = require(process.cwd() + '/app/db/pool.js');

var UserController  = {
    //
    getHomePage: function(req, res) {
            var auth = req.isAuthenticated();
			
			if (auth) {
			    var userId = req.user.userId;
			    
			    pool.getConnection(function(err, conn) {
			        if (err) throw err;
			        
			        var query = 'select url from avatar, photo'
			            + ' where avatar.photoId = photo.photoId'
			            + ' and userId = ?'
			            + ' order by dateTime desc limit 1;';
			     
			        conn.query(query, [userId], function(err, rows) {
			            if (err) {
                            conn.release();
                            throw err;
                        }
			            
			            conn.release();
			            
			            res.render('home', {
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
    
    getNewsfeed: function(req, res) {
        res.json({});  
    },
    
    getProfilePage: function(req, res) {
            var auth = req.isAuthenticated();
			
			if (auth) {
			    var userId = req.user.userId;
			    
			    pool.getConnection(function(err, conn) {
			        if (err) throw err;
			        
			        var query = 'select url from avatar, photo'
			            + ' where avatar.photoId = photo.photoId'
			            + ' and userId = ?'
			            + ' order by dateTime desc limit 1;';
			     
			        conn.query(query, [userId], function(err, rows) {
			            if (err) {
                            conn.release();
                            throw err;
                        }
			            
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
                
                var userId = Number(req.params.userId);
                var myId = req.user.userId;
                var userId1, userId2;
                var data = {};
                var infoQuery = 'select * from user where userId = ?;',
                    
                    avatarQuery = 'select url, photo.photoId from photo, avatar' 
                        + ' where avatar.photoId = photo.photoId and userId = ?' 
                        + ' order by dateTime desc limit 1;',
                    
                    coverQuery = 'select url, photo.photoId from photo, cover' 
                        + ' where cover.photoId = photo.photoId and userId = ?' 
                        + ' order by dateTime desc limit 1;',
                    relationshipQuery = 'select statusCode, actionId from relationship'
                        + ' where userId1 = ? and userId2 = ?;';
                    
                    
                var query = infoQuery + avatarQuery + coverQuery;
                    
                conn.query(query, [userId, userId, userId], function(err, results) {
                    if (err) {
                        conn.release();
                        throw err;
                    }
                
                    data.info =  results[0][0];
                    delete data.info.password;
                    data.avatar =  results[1][0];
                    data.cover = results[2][0];
            
                    // relationship
                    if (myId == userId) {
                        data.relationship = {statusCode: -1, msg: 'is me'};
                        conn.release();
                        return res.json({data: data});
                    } else if (myId < userId) {
                        userId1 = myId;
                        userId2 = userId;
                    } else {
                        userId1 = userId;
                        userId2 = myId;
                    } 
                    
                    conn.query(relationshipQuery, [userId1, userId2], function(err, rows) {
                        if (err) {
                            conn.release();
                            throw err;
                        }
                        
                        conn.release();
                        
                        if (!rows[0]) {
                            data.relationship = {statusCode: -2, msg: 'not found'};
                        } else {
                            data.relationship = {
                                statusCode: rows[0].statusCode, 
                                actionId: rows[0].actionId,
                                msg: rows[0].statusCode === 0? 'Pending friend request': 'Accepted friend request'
                            }; 
                        }
                        
                        return res.json({data: data});
                    });
                });
            });
        } else {
            res.redirect('/');
        }
    },
    
    getProfilePostIds: function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var userId = Number(req.params.userId);
            
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                var queryMyPosts = 'select postId from dang_bai where userId = ?;';
                var queryOtherPosts = 'SELECT postId FROM dang_len_tuong WHERE userId2 = ?;'; 
                
                conn.query(queryMyPosts + queryOtherPosts, [userId, userId], function(err, results) {
                    if (err) {
                        conn.release();
                        throw err;
                    }
                    
                    conn.release();
                    var postIds = [];
                    
                    // my posts
                    results[0].forEach(function(row) {
                        postIds.push(Number(row.postId)); 
                    });
                    // other posts
                    results[1].forEach(function(row) {
                        postIds.push(Number(row.postId)); 
                    });
                    // sort
                    postIds.sort(function (a, b) {
                        return a - b;
                    });
                    postIds.reverse();
                    
                    return res.json({
                        data: {
                            postIds: postIds
                        }
                    });
                });
            });
        } else {
            res.redirect('/');
        }
    }
    
};

module.exports = UserController;