'use strict';

require('dotenv').load();
var http = require('http');

var express = require('express');
var app = express();
var server = http.Server(app);
var routes = require('./app/routes/index.js');
var passport = require('passport');
var session = require('express-session');
var multer = require('multer');
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var ioInit = require('./app/io/ioInit');

ioInit(io);
require('./app/config/passport')(passport);

app.set('view engine', 'jade');
app.set('views', process.cwd() + '/templates');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        var arr = file.mimetype.split('/');
        if (arr[0] == 'image') {
            return cb(null, process.cwd() + '/upload/image');
        } 
        cb(null, process.cwd() + '/upload');
    },
    filename: function(req, file, cb) {
        var arr = file.mimetype.split('/');
        if (arr[0] == 'image') {
            return cb(null, 'image-' + Date.now() + '.' + arr[1]);
        }
        cb(null, 'file-' + Date.now() + '-' + file.originalname);
    }
});
var upload = multer({storage: storage});

app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/upload', express.static(process.cwd() + '/upload'));
app.use(session({
	secret: 'myface',
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
// test socket
app.get('/test', function(req, res) {
	res.sendFile(process.cwd() + '/public/test.html');	
});

routes(app, upload, passport, io);

var port = process.env.PORT || 8080;
server.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});