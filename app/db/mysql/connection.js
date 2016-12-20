var mysql = require('mysql');

var connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true,
    connectionLimit: process.env.CONNECTION_LIMIT
});

module.exports = connection;