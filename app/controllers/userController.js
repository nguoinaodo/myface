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
                
                var userId = req.params.userId;
                var infoQuery = 'select * from user where userId = ?;',
                    
                    avatarQuery = 'select url, photo.photoId from photo, avatar' 
                        + ' where avatar.photoId = photo.photoId and userId = ?' 
                        + ' order by dateTime desc limit 1;',
                    
                    coverQuery = 'select url, photo.photoId from photo, cover' 
                        + ' where cover.photoId = photo.photoId and userId = ?' 
                        + ' order by dateTime desc limit 1;';
                
                var query = infoQuery + avatarQuery + coverQuery;
                    
                conn.query(query, [userId, userId, userId], function(err, results) {
                    if (err) {
                        conn.release();
                        throw err;
                    }
                    
                    conn.release();
                    res.json({
                        info: results[0][0],
                        avatar: results[1][0],
                        cover: results[2][0]
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
                
                var query = 'select postId from dang_bai where userId = ? order by dateTime desc';
                conn.query(query, [userId], function(err, rows) {
                    if (err) {
                        conn.release();
                        throw err;
                    }
                    
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
    }
    
    
    
    /*
    getPost: function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            pool.getConnection(function(err, conn) {
                if (err) throw err;
                
                var query = '';
                conn.query(query, function(err, rows) {
                    if (err) {
                        conn.release();
                        throw err;
                    }
                    
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

module.exports = UserController;