'use strict';

var conn = require(process.cwd() + '/app/db/mysql/connection.js');
var tokenCollection = require('../db/lokijs/token');
var moment = require('moment');
var multiparty = require('multiparty');

var postController = function(io) {
	this.getFullPost = function(req, res) {
		var auth = req.isAuthenticated();
        
        if (auth) {
            var userId = req.user.userId;
            var query = 'SELECT url FROM avatar, photo'
                + ' WHERE avatar.photoId = photo.photoId'
                + ' AND userId = ?'
                + ' ORDER BY dateTime DESC LIMIT 1;';
             
            conn.query(query, [userId], function(err, rows) {
                if (err) return console.error(err);
                
                res.render('post', {
                    auth: auth,
                    displayName: req.user.displayName,
                    myId: userId,
                    avatarUrl: rows[0]? rows[0].url: ''
                });
            });
        } else {
            res.redirect('/');
        }
	};

    this.getPost = function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
        	var pathArray = req.path.split('/');
        	var postId = Number(req.params.postId);

            // SELECT user.userId, displayName, `dateTime`, `text`, (select count(userId) from yeu_thich where postId=2) as likes,
            //     (select url from avatar, photo where avatar.photoId = photo.photoId and avatar.userId = user.userId) as avatarUrl 
            // FROM `user`, dang_bai, post
            // WHERE user.userId = dang_bai.userId AND post.postId = dang_bai.postId AND post.postId = 2
            
            var infoQuery = 'SELECT user.userId, displayName, dateTime, text FROM user, dang_bai, post'
                + ' WHERE user.userId = dang_bai.userId AND post.postId = dang_bai.postId AND post.postId = ?;'
                + 'SELECT user.userId, dang_len_tuong.userId2 AS receiverId, displayName, (SELECT displayName FROM `user` WHERE userId = dang_len_tuong.userId2) AS receiverName, '
                + ' dateTime, text FROM user, dang_len_tuong, post'
                + ' WHERE user.userId = dang_len_tuong.userId1 AND post.postId = dang_len_tuong.postId AND post.postId = ?;';
            var likeQuery =  'SELECT count(userId) FROM yeu_thich '
                + ' WHERE postId = ?;';
            var photoQuery = 'SELECT url FROM photo WHERE postId = ?;';
                
            conn.query(infoQuery + likeQuery + photoQuery, [postId, postId, postId, postId], function(err, results) {
                if (err) return console.error(err);
                
                var content = results[0][0]? results[0][0]: results[1][0];
                content = Object.assign({}, content);
                var userId = content['userId'];
                var photoUrls = [];
                
                results[3].forEach(function(row) {
                    photoUrls.push(row.url); 
                });
                
                var avatarQuery = 'SELECT url FROM avatar, photo '
                    + ' WHERE avatar.photoId = photo.photoId AND userId = "' + userId + '" '
                    + ' ORDER BY dateTime DESC LIMIT 1';
                
                conn.query(avatarQuery, function(err, rows) {
                    if (err) return console.error(err);
                    
                    content.dateTime = moment(content.dateTime).format('MMM Do YYYY HH:mm:ss');
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
        } else {
            res.redirect('/');
        }
    };
    
    this.getPostComments = function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var postId = Number(req.params.postId);
            var query = 'SELECT user.userId, displayName, dateTime, text, comment.commentId' 
                + ' FROM user, binh_luan, comment'
                + ' WHERE user.userId = binh_luan.userId AND comment.commentId = binh_luan.commentId'
                + ' AND postId = "' + postId + '"'
                + ' ORDER BY dateTime DESC';
            conn.query(query, function(err, rows) {
                if (err) return console.error(err);
                
                var results = [];
                var count = rows.length;
                if (count === 0) {
                    res.json({data: {comments: []}});
                }
                
                rows.forEach(function(row, i) {
                    var userId = row.userId;
                    var query = 'SELECT url FROM avatar, photo'
                        + ' WHERE avatar.photoId = photo.photoId'
                        + ' AND userId = "' + userId + '"'
                        + ' ORDER BY dateTime DESC LIMIT 1';
                    
                    conn.query(query, function(err, rows) {
                        if (err) return console.error(err);
                        
                        row.avatarUrl = rows[0]? rows[0].url: '';
                        results[i] = Object.assign({}, row);
                        results[i].dateTime = moment(row.dateTime).format('MMM Do YYYY HH:mm:ss');
                        count--;
                        if (count === 0) {
                            res.json({
                                data: {
                                    comments: results
                                }
                            });
                        }
                    });
                });
            });
        } else {
            res.redirect('/');
        }
    };
    
    this.like = function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var postId = Number(req.params.postId);
            var userId = req.user.userId;
            var query = 'SELECT * FROM yeu_thich'
                + ' WHERE userId = "' + userId + '" AND postId = "' + postId + '";';
            
            conn.query(query, function(err, rows) {
                if (err) return console.error(err);
                
                if (!rows[0]) {
                    // like
                    query = 'INSERT INTO yeu_thich SET ?;';
                    var dateTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                    conn.query(query, [{userId: userId, postId: postId, dateTime: dateTime}], function(err, results) {
                        if (err) return console.error(err);
                        
                        query = ' SELECT count(userId) FROM yeu_thich WHERE postId = ?;';
                        conn.query(query, [postId], function(err, rows) {
                            if (err) return console.error(err);

                            if (rows[0]) {
                                res.json({
                                    data: {
                                        liked: true,
                                        likes: rows[0]['count(userId)']
                                    }
                                });
                                // send notification
                                query = 'SELECT userId FROM dang_bai WHERE postId = ?;'
                                    + 'SELECT userId1 FROM dang_len_tuong WHERE postId = ?;';
                                conn.query(query, [postId, postId], function(err, results) {
                                    if (err) return console.error(err);
                                    
                                    var receiverId = results[0][0]? results[0][0]['userId']: results[1][0]['userId1'];
                                    if (receiverId != userId) {
                                        // if not my post
                                        var noti = {
                                            dateTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                            actionCode: 0, // like
                                            read: false,
                                            lastFrom: userId,
                                            to: receiverId, 
                                            postId: postId
                                        };
                                        // insert or update if exists 
                                        query = "INSERT INTO notification SET ?" 
                                            + " ON DUPLICATE KEY UPDATE `dateTime` = ?, lastFrom = ?, `read`=0";
                                        conn.query(query, [noti, noti.dateTime, userId], function(err, result) {
                                            if (err) return console.error(err);

                                            var tokenDoc = tokenCollection.findOne({userId: receiverId});
                                            if (tokenDoc) {
                                                delete noti.to;
                                                noti.displayName = req.user.displayName;
                                                io.sockets.connected[tokenDoc.socketId].emit('like', noti);
                                                console.log('User id ' + userId + ' like post id ' + postId + ' of user id ' + receiverId);
                                            }
                                        });    
                                    } 
                                });
                            }
                        });
                    });
                } else {
                    // unlike
                    query = 'DELETE FROM yeu_thich'
                        + ' WHERE userId = ? AND postId = ?;';
                    conn.query(query, [userId, postId, userId], function(err, results) {
                        if (err) return console.error(err);
                        
                        query = ' SELECT count(userId) AS `count` FROM yeu_thich WHERE postId = ?;';
                        conn.query(query, [postId], function(err, rows) {
                            if (err) return console.error(err);

                            var likeCount = rows[0]['count'];
                            // update notification if it is other's post
                            query = 'SELECT userId FROM dang_bai WHERE postId = ?;'
                                + 'SELECT userId1 FROM dang_len_tuong WHERE postId = ?;';
                            conn.query(query, [postId, postId], function(err, results) {
                                if (err) return console.error(err);

                                var receiverId = results[0][0]? results[0][0]['userId']: results[1][0]['userId1'];
                                if (receiverId != userId) {
                                    // if not my post
                                    if (likeCount == 0) {
                                        // 1 like: unlike -> 0 like -> delete notification
                                        query = 'DELETE FROM notification WHERE postId = ? AND actionCode = 0';
                                        conn.query(query, [postId], function(err, result) {
                                            if (err) return console.error(err); 
                                        });
                                    } else {
                                        // update notification(`count`)
                                        query = 'SELECT userId, dateTime FROM yeu_thich WHERE postId = ? ORDER BY `dateTime` DESC LIMIT 1';
                                        conn.query(query, [postId], function(err, rows) {
                                            if (err) return console.error(err);

                                            if (rows[0]) {
                                                query = "UPDATE notification SET `dateTime` = ?, lastFrom = ?"
                                                    + " WHERE postId = ? AND actionCode = 0";
                                                conn.query(query, [rows[0].dateTime, rows[0].userId, postId], function(err, result) {
                                                    if (err) return console.error(err);
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                            
                            res.json({
                                data: {
                                    liked: false,
                                    likes: likeCount
                                }
                            });
                        }); 
                    });
                }
            });
        } else {
            res.redirect('/');
        }
    };
    
    this.comment = function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var postId = Number(req.params.postId);
            var userId = req.user.userId;
            var text = req.body.text;
            
            conn.query('INSERT INTO comment SET ?', [{text: text}], function(err, result) {
                if (err) return console.error(err);
                
                var commentId = result.insertId;
                var dateTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                var query  = 'INSERT INTO binh_luan SET ?';
                conn.query(query, [{userId: userId, postId: postId, commentId: commentId, dateTime: dateTime}], function(err, result) {
                    if (err) return console.error(err);
                    
                    res.json({
                        data: {
                            userId: userId,
                            displayName: req.user.displayName,
                            dateTime: dateTime,
                            commentId: commentId
                        }
                    });
                    // send notification
                    query = 'SELECT userId FROM dang_bai WHERE postId = ?;'
                        + 'SELECT userId1 FROM dang_len_tuong WHERE postId = ?';
                    conn.query(query, [postId, postId], function(err, results) {
                        if (err) return console.error(err);
                        
                        var receiverId = results[0][0]? results[0][0]['userId']: results[1][0]['userId1'];
                        if (receiverId != userId) {
                            // if not my post
                            var noti = {
                                dateTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                actionCode: 1, // comment
                                read: false,
                                lastFrom: userId,
                                to: receiverId,
                                postId: postId
                            };

                            query = 'INSERT INTO notification SET ? ON DUPLICATE KEY UPDATE ?';
                            conn.query(query, [noti, {dateTime: noti.dateTime, lastFrom: userId, read: 0}], function(err, result) {
                                if (err) return console.error(err);

                                var tokenDoc = tokenCollection.findOne({userId: receiverId});
                                if (tokenDoc) {
                                    noti.displayName = req.user.displayName;
                                    delete noti.to;    
                                    io.sockets.connected[tokenDoc.socketId].emit('comment', noti);  
                                    console.log('User id ' + userId + ' comment on post id ' + postId + ' of user id ' + receiverId);
                                }
                            });    
                        }
                    });
                });
            });
        } else {
            res.redirect('/');
        }
    };
    
    this.addPost = function(req, res, next) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            var myId = req.user.userId;
            var userId = Number(req.body.to);
            var text = req.body.text;
            var query = 'INSERT INTO post SET ?';
            conn.query(query, [{text: text}], function(err, result) {
                if (err) return console.error(err);
                
                var postId = result.insertId;
                var dateTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                
                // save photos
                var photos = [];
                query = 'SELECT * FROM `user` WHERE userId < 0;';
                req.files.forEach(function(file, i) {
                    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
                        query += 'INSERT INTO photo SET ?;';
                        photos.push({
                            url: file.path.replace(process.cwd(), ''),
                            postId: postId
                        });    
                    }
                });
                conn.query(query, photos, function(err, results) {
                    if (err) return console.error(err);

                    if (myId === userId || userId === -1) {
                        // post 
                        query = 'INSERT INTO dang_bai SET ?';
                        conn.query(query, [{postId: postId, userId: myId, dateTime: dateTime}], function(err, result) {
                            if (err) return console.error(err);

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
                        query = 'SELECT * FROM relationship WHERE userId1 = ? AND userId2 = ?';
                        conn.query(query, [userId1, userId2], function(err, rows) {
                            if (err) return console.error(err);    
                            
                            if (!rows[0] || rows[0].statusCode !== 1) {
                                return res.json({errCode: -1, msg: 'Not friend'});
                            }
                            query = 'INSERT INTO dang_len_tuong SET ?';
                            conn.query(query, [{postId: postId, userId1: myId, userId2: userId, dateTime: dateTime}], function(err, result) {
                                if (err) return console.error(err);    
                                res.json({
                                    errCode: 0,
                                    msg: 'Successfully posted on this user wall',
                                    data: {
                                        postId: postId
                                    }
                                }); 
                                // send notification
                                var noti = {
                                    dateTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                    actionCode: 2, // post on wall
                                    read: false,
                                    lastFrom: myId,
                                    to: userId,
                                    postId: postId
                                };

                                query = 'INSERT INTO notification SET ? ON DUPLICATE KEY UPDATE ?';
                                conn.query(query, [noti, {dateTime: noti.dateTime, read: 0}], function(err, result) {
                                    if (err) return console.error(err);

                                    var tokenDoc = tokenCollection.findOne({userId: userId});
                                    if (tokenDoc) {
                                        noti.displayName = req.user.displayName;
                                        delete noti.to;
                                        io.sockets.connected[tokenDoc.socketId].emit('postOnWall', noti);
                                        console.log('User id ' + myId + ' post a post id ' + postId + ' of user id ' + userId);
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
    };
};

module.exports = postController;