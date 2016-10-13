'use strict';

var path = process.cwd();
// var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var pool = require(process.cwd() + '/app/db/pool.js');
var profileController = require(process.cwd() + '/app/controllers/profile.server.js');
var homeController = require(process.cwd() + '/app/controllers/home.server.js');

module.exports = function (app, passport) {
	

	/*
	app.route('/')
		.get(isLoggedIn, function (req, res) {
			
			res.sendFile(path + '/public/index.html');
		});
	*/
	// testdb
	app.route('/testdb')
		.get(function(req, res) {
			pool.getConnection(function(err, conn) {
				if (err) throw err;
				
				console.log('connect as id ' + conn.threadId);
				conn.query('select postId, count(userId) from yeu_thich'
					+ ' group by postId', function(err, rows) {
					if (err) throw err;
					
					console.log('db connected');
					res.json(rows);
					conn.release();
				});
			}); 
		});
	// 
	app.route('/')
		.get(homeController.getHome);
	
	app.route('/user/:userId')
		.get(profileController.getUser);
	// api
	app.route('/api/getUserInfo/:userId')
		.get(profileController.getUserInfo);
	
	app.route('/api/getUserCoverAndAvatar/:userId')
		.get(profileController.getUserCoverAndAvatar);
	
	app.route('/api/getUserPostIds/:userId')
		.get(profileController.getUserPostIds);
	
	app.route('/api/getPost/:postId')
		.get(profileController.getPost);
	
	app.route('/api/getPostComments/:postId')
		.get(profileController.getPostComments);
	
	// authentication
	app.route('/login')
		.get(function (req, res) {
			res.render('login');
		})
		.post(passport.authenticate('local-login', {
			successRedirect: '/',
			failureRedirect: '/login',
			failureFlash: true
		}));
	
	app.route('/signup')
		.get(function(req, res) {
			res.render('signup');  
		})
		.post(passport.authenticate('local-signup', {
			successRedirect: '/',
			failureRedirect: '/signup',
			failureFlash: true
		}));

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});
	
};
