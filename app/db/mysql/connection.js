var mysql = require('mysql');

var connection = mysql.createConnection({
    host: '4ed363a7-1093-4a78-a73a-a69600beaeb1.mysql.sequelizer.com',
    user: 'hfwpcdccqgetskpl',
    password: 'cHiZDBYhh4pfzx2nQoeLbXjYRQ43VuyPm6NHLDcd7MLxhrkhU3UxkAnmxriVF6tV',
    database: 'db4ed363a710934a78a73aa69600beaeb1',
    multipleStatements: true
});

module.exports = connection;