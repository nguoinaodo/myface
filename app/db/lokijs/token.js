var db = require('./db');
var token = db.addCollection('token');

/*
    {
        token: String,
        userId: Number,
        socketId: String
    }
*/

module.exports = token;