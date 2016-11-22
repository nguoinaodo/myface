var tokenCollection = require('../db/lokijs/token');
var conn = require('../db/mysql/connection.js');

module.exports = function(io, socket) {
	
	socket.on('notiIsRead', function(data) {
		var query = 'UPDATE `notification` SET `read` = 1 WHERE `notiId` = ?';
		conn.query(query, [data.notiId], function(err, result) {
			if (err) return console.error(err);

			console.log('=== Update notification id ' + data.notiId + ': read = true');
		});	
	});

	socket.on('friendReqNotiIsRead', function(data) {
		var query = 'UPDATE `friend_request` SET `read` = 1 WHERE `friendReqId` = ?';
		conn.query(query, [data.friendReqId], function(err, result) {
			if (err) return console.error(err);

			console.log('=== Update friend request notification id ' + data.friendReqId + ': read = true');
		});	
	});
}