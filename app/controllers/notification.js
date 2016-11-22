var conn = require('../db/mysql/connection');

var notiController = function(io) {
	this.getNotiCount = function(req, res) {
		var auth = req.isAuthenticated();
		if (auth) {
			var userId = req.user.userId;
			var query = 'SELECT count(*) AS count FROM (SELECT `postId` FROM notification WHERE `to` = ?'
				+ ' AND `read` = 0) AS distinctified';

			conn.query(query, [userId], function(err, rows) {
				if (err) return console.error(err);

				if (rows[0]) {
					res.json({
						data: {
							count: rows[0]['count']
						}
					});
				}
			});
		} else {
			res.redirect('/');
		}
	};

	this.getFriendReqNotiCount = function(req, res) {
		var auth = req.isAuthenticated();
		if (auth) {
			var userId = req.user.userId;
			var query = 'SELECT count(*) AS count FROM (SELECT `from` FROM friend_request WHERE `to` = ?'
				+ ' AND `read` = 0) AS distinctified';

			conn.query(query, [userId], function(err, rows) {
				if (err) return console.error(err);

				if (rows[0]) {
					res.json({
						data: {
							count: rows[0]['count']
						}
					});
				}
			});
		} else {
			res.redirect('/');
		}
	};

	this.getNotis = function(req, res) {
		var auth = req.isAuthenticated();
		if (auth) {
			const NOTIS_PER_PAGE = 6;
			var userId = req.user.userId;
			var page = Number(req.query.page);
			var query = 'SELECT noti_info.*, CASE actionCode'
				+ ' WHEN 0 THEN (SELECT count(DISTINCT yeu_thich.userId) FROM yeu_thich WHERE yeu_thich.postId = noti_info.postId)'
				+ ' WHEN 1 THEN (SELECT count(DISTINCT binh_luan.userId) FROM binh_luan WHERE binh_luan.postId = noti_info.postId)'
				+ ' WHEN 2 THEN (SELECT count(DISTINCT dang_len_tuong.userId1) FROM dang_len_tuong WHERE dang_len_tuong.postId = noti_info.postId)'
				+ ' END AS `count`'
				+ ' FROM (SELECT notification.*, `user`.displayName, photo.url AS avatarUrl FROM notification, `user`, avatar, photo'
					+ ' WHERE notification.lastFrom = `user`.userId AND avatar.userId = notification.lastFrom'
					+ ' AND avatar.photoId = photo.photoId AND `to`= ?) AS noti_info'
				+ ' ORDER BY `dateTime` DESC LIMIT ? OFFSET ?';

			conn.query(query, [userId, NOTIS_PER_PAGE, page*NOTIS_PER_PAGE], function(err, rows) {
				if (err) return console.error(err);

				if(!rows[0]) {
					return res.json({
						data: {
							notis: []
						}
					});
				}
				
				var notis = [];
				var n = rows.length;
				rows.forEach(function(row, i) {
					notis[i] = Object.assign({}, row);
					delete notis[i].to;
				});
				res.json({
					data: {
						notis: notis
					}
				});
			});
		} else {
			res.redirect('/');
		}
	};

	this.getFriendReqNotis = function(req, res) {
		var auth = req.isAuthenticated();
		if (auth) {
			const REQ_PER_PAGE = 8;
			var userId = req.user.userId;
			var page = Number(req.query.page);
			var query = 'SELECT * FROM friend_request WHERE `to` = ?'
				+ ' ORDER BY `dateTime` DESC LIMIT ? OFFSET ?';

			conn.query(query, [userId, REQ_PER_PAGE, page*REQ_PER_PAGE], function(err, rows) {
				if (err) return console.error(err);

				if (!rows[0]) {
					return res.json({
						data: {
							friendReqNotis: []
						}
					});
				}
				var friendReqNotis = [];
				var n = rows.length;
				var count = 0;
				rows.forEach(function(row, i) {
					friendReqNotis[i] = Object.assign({}, row);
					delete friendReqNotis[i].to;
					query = 'SELECT displayName FROM user WHERE userId = ?;'
						+ 'SELECT url FROM photo, avatar' 
                    	+ ' WHERE avatar.photoId = photo.photoId AND userId = ?' 
                    	+ ' ORDER BY `dateTime` DESC LIMIT 1;';;
					conn.query(query, [friendReqNotis[i].from, friendReqNotis[i].from], function(err, results) {
						if (err) return console.error(err);

						friendReqNotis[i].displayName = results[0][0]? results[0][0]['displayName']: '';
						friendReqNotis[i].avatarUrl = results[1][0]? results[1][0]['url']: '';
						count++;
						if (count === n) {
							res.json({
								data: {
									friendReqNotis: friendReqNotis
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
};

module.exports = notiController;