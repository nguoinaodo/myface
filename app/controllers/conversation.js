var conn = require('../db/mysql/connection');
var moment = require('moment');

var conversationController = function(io) {
	const REPLIES_PER_PAGE = 30;
	const CONVERSATION_PER_PAGE = 8;

	this.getNewMessageCount = function(req, res) {
		if (req.isAuthenticated()) {
			var userId = req.user.userId;
			var query = 'SELECT count(conId) AS newMessageCount FROM conversation WHERE (userId1 = ? OR userId2 = ?) AND lastFrom != ?' + 
				' AND `read` = 0';
			conn.query(query, [userId, userId, userId], (err, rows) => {
				if (err) return console.error(err);

				if (rows[0]) {
					return res.json({
						data: {
							count: rows[0].newMessageCount
						}
					});
				} else {
					return res.json({data: {}});
				}
			});
		} else {
			res.redirect('/');
		}
	},

	this.getConversations = function(req, res) {
		if (req.isAuthenticated()) {
			var userId = req.user.userId;
			var page = Number(req.query.page);
			var query = 'SELECT conversation.*, displayName, (SELECT content FROM conversation_reply, reply' +
				' WHERE conversation_reply.replyId = reply.replyId AND reply.conId = conversation.conId' +
				' ORDER BY reply.`dateTime` DESC LIMIT 1) AS content,' +
				' (SELECT url FROM avatar, photo WHERE avatar.photoId = photo.photoId' +
				' AND avatar.userId = `user`.userId ORDER BY avatar.`dateTime` DESC LIMIT 1) AS avatarUrl' +
				' FROM conversation, `user` WHERE (userId1 = ? OR userId2 = ?)' + 
				' AND (CASE userId1 WHEN ? THEN conversation.userId2 = `user`.userId' +
				' ELSE conversation.userId1 = `user`.userId END)' +
				' ORDER BY conversation.`dateTime` DESC LIMIT ? OFFSET ?';
			conn.query(query, [userId, userId, userId, CONVERSATION_PER_PAGE, page], (err, rows) => {
				if (err) return console.error(err);

				var conversations = [];
				rows.forEach((row, i) => {
					conversations.push({
						conId: row.conId,
						lastFrom: row.lastFrom,
						dateTime: moment(row.dateTime).format('MMM Do YYYY HH:mm:ss'),
						read: row.read,
						displayName: row.displayName,
						content: row.content, 
						avatarUrl: row.avatarUrl
					});
				});

				return res.json({
					data: {
						conversations: conversations
					}
				});
			});	


			// select conversation.*, displayName, 
			//  (select avatar.photoId from avatar, photo 
			//   where avatar.photoId = photo.photoId and avatar.userId = `user`.userId
			//   order by avatar.`dateTime` desc limit 1) as avatarUrl, 
			// 	(select content from conversation_reply, reply 
			//      where conversation_reply.replyId = reply.replyId 
			// 		and reply.conId = conversation.conId order by reply.`dateTime` desc limit 1) as content
			// from conversation, `user`
			// where (userId1 =2 or userId2 =2) and (case userId1 when 2 then conversation.userId2 = `user`.userId 
			// 	else conversation.userId1 = `user`.userId end) 
			// order by conversation.`dateTime` desc limit 10 offset 0;
		} else {
			res.redirect('/');
		}
	},

	this.getConversationByUserId = function(req, res) {
		// use when click on online friend list
		if (req.isAuthenticated()) {
			var myId = req.user.userId;
			var userId = Number(req.params.userId);

			var query = 'SELECT conId FROM conversation WHERE (userId1 = ? AND userId2 = ?)' +
				' OR (userId1 = ? AND userId2 = ?)';
			conn.query(query, [myId, userId, userId, myId], (err, rows) => {
				if (err) return console.error(err);

				if (rows[0]) {
					var conId = rows[0].conId;

					// query = 'SELECT content, userId, `dateTime` FROM conversation_reply, reply' +
					// 	' WHERE reply.replyId = conversation_reply.replyId AND reply.conId = ?' +
					// 	' ORDER BY `dateTime` DESC LIMIT ? OFFSET 0';
					// conn.query(query, [conId, REPLIES_PER_PAGE], (err, rows) => {
					// 	if (err) return console.error(err);

					// 	var replies = [];
					// 	rows.forEach((row, i) => {
					// 		replies.push({
					// 			userId: row.userId,
					// 			content: row.content,
					// 			dateTime: moment(row.dateTime).format('MMM Do YYYY HH:mm:ss')
					// 		});
					// 	});
					// 	return res.json({
					// 		data: {
					// 			conId: conId,
					// 			replies: replies
					// 		}
					// 	})
					// });
					return res.json({
						data: {
							conId: conId
						}
					});
				} else {
					res.json({data: {}});
				}
			});
		} else {
			res.redirect('/');
		}
	},

	this.getConversationByConId = function(req, res) {
		// use when click on message list
		if (req.isAuthenticated()) {
			var conId = Number(req.params.conId);
			var page = Number(req.query.page);
			var query = 'SELECT content, userId, `dateTime` FROM conversation_reply, reply' +
				' WHERE reply.replyId = conversation_reply.replyId AND reply.conId = ?' +
				' ORDER BY `dateTime` DESC LIMIT ? OFFSET ?';
			conn.query(query, [conId, REPLIES_PER_PAGE, page*REPLIES_PER_PAGE], (err, rows) => {
				if (err) return console.error(err);

				var replies = [];
				rows.forEach((row, i) => {
					replies.push({
						userId: row.userId,
						content: row.content,
						dateTime: moment(row.dateTime).format('MMM Do YYYY HH:mm:ss')
					});
				});
				return res.json({
					data: {
						replies: replies
					}
				})
			});
		} else {
			res.redirect('/');
		}
	}
};

module.exports = conversationController;