var tokenCollection = require('../db/lokijs/token');
var conn = require('../db/mysql/connection.js');
var moment = require('moment');

module.exports = function(io, socket) {
	// notification was read
	socket.on('notiIsRead', function(data) {
		var query = 'UPDATE `notification` SET `read` = 1 WHERE `notiId` = ?';
		conn.query(query, [data.notiId], function(err, result) {
			if (err) return console.error(err);

			console.log('=== Update notification id ' + data.notiId + ': read = true');
		});	
	});
	// friend request notification was read
	socket.on('friendReqNotiIsRead', function(data) {
		var query = 'UPDATE `friend_request` SET `read` = 1 WHERE `friendReqId` = ?';
		conn.query(query, [data.friendReqId], function(err, result) {
			if (err) return console.error(err);

			console.log('=== Update friend request notification id ' + data.friendReqId + ': read = true');
		});	
	});
	// message was read
	socket.on('messageIsRead', (data) => {
		var query = 'UPDATE conversation SET `read` = 1 WHERE conId = ?';
		conn.query(query, [data.conId], (err, result) => {
			if (err) return console.error(err);

			console.log('=== Update conversation id %d: read = true', data.conId);
		});
	});
	// user requests chat list
	socket.on('requestChatList', (data) => {
		console.log('requestChatList')
		// send chat list 
		// var tokenDocs = tokenCollection.find({});
		var myUserId = tokenCollection.findOne({socketId: socket.id}).userId;
		var result = [];
		var query = 'SELECT (CASE userId1 WHEN ? THEN userId2 ELSE userId1 END) AS friendId FROM relationship' +
			' WHERE (userId1 = ? OR userId2 = ?) AND statusCode = 1';
		conn.query(query, [myUserId, myUserId, myUserId], (err, rows) => {
			if (err) return console.error(err);

			rows.forEach((row, i) => {
				var friendDoc = tokenCollection.findOne({userId: row.friendId});
				if (friendDoc) {
					result.push({
						userId: row.friendId,
						socketId: friendDoc.socketId
					});	
				}
			});
			
			var count = 0;
			var n = result.length;
			if (n === 0) {
				return socket.emit('chatList', {
					online: []
				});
			}
			result.forEach((user, i) => {
				query = 'SELECT displayName, (SELECT url FROM avatar, photo WHERE avatar.photoId = photo.photoId' +
					' AND avatar.userId = ? ORDER BY avatar.`dateTime` DESC LIMIT 1) AS avatarUrl' +
					' FROM `user` WHERE userId = ?';

				conn.query(query, [user.userId, user.userId], (err, rows) => {
					if (err) return console.error(err);

					if (rows[0]) {
						result[i].displayName = rows[0].displayName;
						result[i].avatarUrl = rows[0].avatarUrl;
					}
					count++;			
					if (count == n) {
						socket.emit('chatList', {
							online: result
						});
					}
				});
			});
		});
	});
	// user's message
	socket.on('message', (data) => {
		// if this is the first chat, init conversation
		// else add reply to database
		// send immediately to receiver if receiver is online
		var from = tokenCollection.findOne({socketId: socket.id}).userId;
		var to = data.to;
		var conId = data.conId;
		var dateTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

		if (!conId) {
			console.log('Send msg by receiver id')
			var query = 'SELECT conId' +
				' FROM conversation WHERE (userId1 = ? AND userId2 = ?) OR (userId1 = ? AND userId2 = ?)';
			conn.query(query, [from, to, to, from], (err, rows) => {
				if (err) return console.error(err);
				
				if (!rows[0]) {
					// init conversation
					query = 'INSERT INTO conversation SET ?';
					conn.query(query, [{
						userId1: from,
						userId2: to,
						lastFrom: from,
						read: 0,
						dateTime: dateTime
					}], (err, result) => {
						if (err) return console.error(err);
						
						var conId = result.insertId;
						// add reply
						query = 'INSERT INTO conversation_reply SET ?';
						conn.query(query, [{content: data.content}], (err, result) => {
							if (err) return console.error(err);
							
							var replyId = result.insertId;
							
							query = 'INSERT INTO reply SET ?';
							conn.query(query, [{
								replyId: replyId,
								conId: conId, 
								userId: from,
								dateTime: dateTime
							}], (err, result) => {
								if (err) return console.error(err);

								// send succes msg
								socket.emit('sent', {
									conId: conId
								});
								// send to receiver if online								
								var receiverDoc = tokenCollection.findOne({userId: to});
								if (receiverDoc && receiverDoc.socketId) {
									query = 'SELECT url FROM avatar, photo WHERE avatar.photoId = photo.photoId' +
										' AND avatar.userId = ? ORDER BY avatar.`dateTime` DESC LIMIT 1'
									conn.query(query, [from], (err, rows) => {
										if (err) return console.error(err);

										if (rows[0]) {
											io.sockets.connected[receiverDoc.socketId].emit('message', {
												from: from,
												content: data.content,
												conId: conId, 
												avatarUrl: rows[0].url
											});
										}	
									});
								}
							});	
						});
					});
				} else {
					var conId = rows[0].conId;
					// add reply
					query = 'INSERT INTO conversation_reply SET ?';
					conn.query(query, [{content: data.content}], (err, result) => {
						if (err) return console.error(err);
						
						var replyId = result.insertId;
						
						query = 'INSERT INTO reply SET ?';
						conn.query(query, [{
							replyId: replyId, 
							conId: conId, 
							userId: from,
							dateTime: dateTime
						}], (err, result) => {
							if (err) return console.error(err);

							query = 'UPDATE conversation SET ? WHERE conId = ?';
							conn.query(query, [{
								lastFrom: from, 
								read: 0,
								dateTime: dateTime
							}, conId], (err, result) => {
								if (err) return console.error(err);

								// send succes msg
								socket.emit('sent');
								// send to receiver if online
								var receiverDoc = tokenCollection.findOne({userId: to});
								if (receiverDoc && receiverDoc.socketId) {
									query = 'SELECT url FROM avatar, photo WHERE avatar.photoId = photo.photoId' +
										' AND avatar.userId = ? ORDER BY avatar.`dateTime` DESC LIMIT 1'
									conn.query(query, [from], (err, rows) => {
										if (err) return console.error(err);

										if (rows[0]) {
											io.sockets.connected[receiverDoc.socketId].emit('message', {
												from: from,
												content: data.content,
												conId: conId, 
												avatarUrl: rows[0].url
											});
										}	
									});
								}	
							});
						});	
					});
				}
			});
		} else {
			console.log('Send message by conId')
			// add reply
			query = 'INSERT INTO conversation_reply SET ?';
			conn.query(query, [{content: data.content}], (err, result) => {
				if (err) return console.error(err);
				
				var replyId = result.insertId;
				
				query = 'INSERT INTO reply SET ?';
				conn.query(query, [{
					replyId: replyId, 
					conId: conId, 
					userId: from,
					dateTime: dateTime
				}], (err, result) => {
					if (err) return console.error(err);

					query = 'UPDATE conversation SET ? WHERE conId = ?';
					conn.query(query, [{
						lastFrom: from, 
						read: 0,
						dateTime: dateTime
					}, conId], (err, result) => {
						if (err) return console.error(err);

						// send succes msg
						socket.emit('sent');
						// send to receiver if online
						query = 'SELECT (CASE userId1 WHEN ? THEN userId2 ELSE userId1 END) AS `to`,' +
							' (SELECT url FROM avatar, photo WHERE avatar.photoId = photo.photoId' +
							' AND avatar.userId = ? ORDER BY avatar.`dateTime` DESC LIMIT 1) AS avatarUrl' +
							' FROM conversation WHERE conId = ?';
						conn.query(query, [from, from, conId], (err, rows) => {
							if (err) return console.error(err);

							if (rows[0]) {
								var receiverDoc = tokenCollection.findOne({userId: rows[0].to});
								if (receiverDoc) {
									if (receiverDoc.socketId) {
										io.sockets.connected[receiverDoc.socketId].emit('message', {
											from: from,
											content: data.content,
											conId: conId,
											avatarUrl: rows[0].avatarUrl
										});
										console.log('Send to receiver')
									}	
								}		
							}
						});
					});
				});	
			});
		}
	});

}