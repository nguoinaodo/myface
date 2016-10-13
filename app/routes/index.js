'use strict';

var userController = require(process.cwd() + '/app/controllers/userController.js');
var postController = require(process.cwd() + '/app/controllers/postController.js');

module.exports = function (app, passport) {
	// home 
	app.route('/')
		.get(userController.getHomePage);
	
	// profile
	app.route('/user/:userId')
		.get(userController.getProfilePage);
	
	// api
	app.route('/api/getUserInfo/:userId')
		.get(userController.getUserInfo);
	
	app.route('/api/getUserPostIds/:userId')
		.get(userController.getUserPostIds);
	
	app.route('/api/getPost/:postId')
		.get(postController.getPost);
	
	app.route('/api/getPostComments/:postId')
		.get(postController.getPostComments);
	
	app.route('/api/like/:postId')
		.post(postController.like);
	
	app.route('/api/comment/:postId')
		.post(postController.comment);
	
	app.route('/api/addPost')
		.post(postController.addPost);
	
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
