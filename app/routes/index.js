'use strict';

var userController = require(process.cwd() + '/app/controllers/user.js');
var postController = require(process.cwd() + '/app/controllers/post.js');
var relationshipController = require(process.cwd() + '/app/controllers/relationship.js');

module.exports = function (app, passport) {
	//// home 
	app.route('/')
		.get(userController.getHomePage);
	
	//// profile
	app.route('/user/:userId')
		.get(userController.getProfilePage);
	
	//// api
	// homepage
	app.route('/api/getNewsfeed')
		.get(userController.getNewsfeed);
	// user
	app.route('/api/getUserInfo/:userId')
		.get(userController.getUserInfo);
	
	app.route('/api/getProfilePostIds/:userId')
		.get(userController.getProfilePostIds);
	
	// friend
	app.route('/api/addFriend')
		.post(relationshipController.addFriend);
	
	app.route('/api/unfriend')
		.post(relationshipController.unfriend);
	
	app.route('/api/cancelRequest')
		.post(relationshipController.cancelRequest);
	
	app.route('/api/acceptRequest')
		.post(relationshipController.acceptRequest);
		
	app.route('/api/deleteRequest')
		.post(relationshipController.deleteRequest);
		
	// post
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
	
	//// authentication
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
