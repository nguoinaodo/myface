'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');


require('dotenv').load();
var app = express();
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

routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});