'use strict';

var tokenCollection = require('../db/lokijs/token');
var conn = require(process.cwd() + '/app/db/mysql/connection.js');

var UserController  = function(io) {
    // get my info
    this.getMyInfo = function(req, res) {
        var auth = req.isAuthenticated();
        if (auth) {
            var tokenDoc = tokenCollection.findOne({userId: req.user.userId});
            if (!tokenDoc) {
                return res.redirect('/logout');
            } else {
                res.json({
                    data: {
                        userId: req.user.userId,
                        token: tokenDoc.token
                    } 
                });
            }
        } else {
            res.render('home', {
                auth: auth
            });
        }
    };
    //
    this.getHomePage = function(req, res) {
            var auth = req.isAuthenticated();
			
			if (auth) {
			    var userId = req.user.userId;
			    var query = 'SELECT url FROM avatar, photo'
		            + ' WHERE avatar.photoId = photo.photoId'
		            + ' AND userId = ?'
		            + ' ORDER BY dateTime DESC LIMIT 1;';
			     
		        conn.query(query, [userId], function(err, rows) {
		            if (err) return console.error(err);
		            
		            res.render('home', {
    					auth: auth,
    					displayName: req.user.displayName,
    					myId: userId,
    					avatarUrl: rows[0]? rows[0].url: ''
    				});
		        });
			} else {
				res.render('home', {
					auth: auth
				});
			}    
    };
    
    this.getNewsfeed = function(req, res) {
        res.json({});  
    };
    
    this.getProfilePage = function(req, res) {
        var auth = req.isAuthenticated();
		
		if (auth) {
		    var userId = req.user.userId;
		    var query = 'SELECT url FROM avatar, photo'
	            + ' WHERE avatar.photoId = photo.photoId'
	            + ' AND userId = ?'
	            + ' ORDER BY dateTime DESC LIMIT 1;';
		     
	        conn.query(query, [userId], function(err, rows) {
	            if (err) return console.error(err);
	            
	            res.render('profile', {
					auth: auth,
					displayName: req.user.displayName,
					myId: userId,
					avatarUrl: rows[0]? rows[0].url: ''
				});
	        });
		} else {
			res.render('home', {
				auth: auth
			});
		}    
    };
    
    this.getUserInfo =  function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var userId = Number(req.params.userId);
            var myId = req.user.userId;
            var userId1, userId2;
            var data = {};
            var infoQuery = 'SELECT * FROM user WHERE userId = ?;',
                avatarQuery = 'SELECT url, photo.photoId FROM photo, avatar' 
                    + ' WHERE avatar.photoId = photo.photoId AND userId = ?' 
                    + ' ORDER BY dateTime DESC LIMIT 1;',
                coverQuery = 'SELECT url, photo.photoId FROM photo, cover' 
                    + ' WHERE cover.photoId = photo.photoId AND userId = ?' 
                    + ' ORDER BY dateTime DESC LIMIT 1;',
                relationshipQuery = 'SELECT statusCode, actionId FROM relationship'
                    + ' WHERE userId1 = ? AND userId2 = ?;';
            var query = infoQuery + avatarQuery + coverQuery;
                
            conn.query(query, [userId, userId, userId], function(err, results) {
                if (err) return console.error(err);
                
                data.info =  results[0][0];
                delete data.info.password;
                data.avatar =  results[1][0];
                data.cover = results[2][0];
                // relationship
                if (myId == userId) {
                    data.relationship = {statusCode: -1, msg: 'is me'};
                    return res.json({data: data});
                } else if (myId < userId) {
                    userId1 = myId;
                    userId2 = userId;
                } else {
                    userId1 = userId;
                    userId2 = myId;
                } 
                
                conn.query(relationshipQuery, [userId1, userId2], function(err, rows) {
                    if (err) return console.error(err);
                    
                    if (!rows[0]) {
                        data.relationship = {statusCode: -2, msg: 'Relationship not found'};
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
        } else {
            res.redirect('/');
        }
    };
    
    this.getProfilePostIds =  function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var userId = Number(req.params.userId);
            var queryMyPosts = 'SELECT postId FROM dang_bai WHERE userId = ?;';
            var queryOtherPosts = 'SELECT postId FROM dang_len_tuong WHERE userId2 = ?;'; 
            
            conn.query(queryMyPosts + queryOtherPosts, [userId, userId], function(err, results) {
                if (err) return console.error(err);
                
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
                
                return res.json({
                    data: {
                        postIds: postIds
                    }
                });
            });
        } else {
            res.redirect('/');
        }
    };
    
};

module.exports = UserController;