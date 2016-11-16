var conn = require('../db/mysql/connection');

var notiController = function(io) {
	this.getNotification = function(req, res) {
		var auth = req.isAuthenticated();
		if (auth) {
			const NOTIS_PER_PAGE = 6;
			var userId = req.user.userId;
			var page = Number(req.query.page);
			var query = 'SELECT * FROM notification WHERE to = ? AND actionCode < 3'
				+ ' ORDER BY dateTime DESC LIMIT ? OFFSET ?';

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
				rows.forEach(function(row, i) {
					notis[i] = Object.assign({}, row);
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

	this.getFriendRequest = function(req, res) {
		var auth = req.isAuthenticated();
		if (auth) {
			const REQ_PER_PAGE = 8;
			var userId = req.user.userId;
			var page = Number(req.query.page);
			var query = 'SELECT * FROM notification WHERE to = ? AND actionCode > 2'
				+ ' ORDER BY dateTime DESC LIMIT ? OFFSET ?';

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
				rows.forEach(function(row, i) {
					friendReqNotis[i] = Object.assign({}, row);
				});
				res.json({
					data: {
						friendReqNotis: friendReqNotis
					}
				});
			});
		} else {
			res.redirect('/');
		}
	};
};

module.exports = notiController;