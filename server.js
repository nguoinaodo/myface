'use strict';

var http = require('http');

var express = require('express');
var app = express();
var server = http.Server(app);
var routes = require('./app/routes/index.js');
// authenticate
var passport = require('passport');
var session = require('express-session');
// post body parser
var bodyParser = require('body-parser');
// io
var io = require('socket.io')(server);
var ioInit = require('./app/io/ioInit');
// upload file
var multer = require('multer');
var storage = multer.diskStorage({
     destination : function(req,file,cb){
    	 cb(null,'./upload');
     },
     filename : function(req,file,cb){
    	 cb(null,file.originalname);
     }
});
var upload = multer({storage: storage});

ioInit(io);
require('dotenv').load();
require('./app/config/passport')(passport);

app.set('view engine', 'jade');
app.set('views', process.cwd() + '/templates');

app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(process.cwd() + '/public'));
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