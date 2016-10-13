var mysql = require('mysql');
/*
var pool = mysql.createPool({
    connectionLimit: 100,
    host: '4ed363a7-1093-4a78-a73a-a69600beaeb1.mysql.sequelizer.com',
    user: 'hfwpcdccqgetskpl',
    password: '2KLVBE7aDP33adZyZCojVStCk3mMWQtB7sVK2n2Tn3gyomfHwS3ojANhrhJGtskW',
    database: 'db4ed363a710934a78a73aa69600beaeb1',
    multipleStatements: true
});
*/

var pool = mysql.createPool({
    connectionLimit: 100,
    multipleStatements: true,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

module.exports = pool;