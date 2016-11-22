'use strict';

var UserController = require(process.cwd() + '/app/controllers/user.js');
var PostController = require(process.cwd() + '/app/controllers/post.js');
var RelationshipController = require(process.cwd() + '/app/controllers/relationship.js');
var NotificationController = require('../controllers/notification');
var randToken = require('rand-token');
var tokenCollection = require('../db/lokijs/token');

module.exports = function (app, upload, passport, io) {
	var userController = new UserController(io);
	var postController = new PostController(io);
	var relationshipController = new RelationshipController(io);
	var notificationController = new NotificationController(io);
	
	//// home 
	app.route('/')
		.get(userController.getHomePage);
	//// profile
	app.route('/user/:userId')
		.get(userController.getProfilePage);
	//// post
	app.route('/post/:postId')
		.get(postController.getFullPost);
	//// api
	// get my info 
	app.route('/api/myInfo')
		.get(userController.getMyInfo);
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
	// notification
	app.route('/api/getNotiCount')
		.get(notificationController.getNotiCount);

	app.route('/api/getFriendReqNotiCount')
		.get(notificationController.getFriendReqNotiCount);
	
	app.route('/api/getNotis')
		.get(notificationController.getNotis);
	
	app.route('/api/getFriendReqNotis')
		.get(notificationController.getFriendReqNotis);
	// photo upload
	app.post('/upload', upload.array('files', 12), function (req, res, next) {
	  	// req.files is array of `photos` files 
	  	// req.body will contain the text fields, if there were any 
	  	console.log(req.files);
	  	next();
	});
	
	//// test
	
	app.get('/upload', function(req, res, next) {
		res.sendFile(process.cwd() + '/public/testUpload.html');
	});
	
	//// authentication
	app.route('/login')
		.get(function (req, res) {
			res.render('login');
		})
		.post(function(req, res, next) {
			passport.authenticate('local-login', function(err, user, info) {
				if (err) return console.error(err);
				if (!user) {
					return res.redirect('/');
				}
				// delete old token 
				var oldToken = tokenCollection.findOne({userId: user.userId});
				
				if (oldToken) {
					tokenCollection.remove(oldToken);
				}
				// generate new random token for socket authentication
				var token = randToken.generate(32);
				tokenCollection.insert({
					token: token,
					userId: user.userId
				});
				user.token = token;
				// assign req.user 
				req.logIn(user, function(err) {
					if (err) return console.error(err);
					
					res.redirect('/');
				});
			})(req, res, next);
		});
	
	app.route('/signup')
		.get(function(req, res) {
			res.render('signup');  
		})
		.post(function(req, res, next) {
			passport.authenticate('local-signup', function(err, user, info) {
				if (err) return console.error(err);
				
				if (!user) {
					return res.redirect('/');
				}
				// generate new random token for socket authentication
				var token = randToken.generate(32);
				tokenCollection.insert({
					token: token,
					userId: user.userId
				});
				user.token = token;
				
				req.logIn(user, function(err) {
					if (err) return console.err(err);
					
					res.redirect('/');
				});
			}) (req, res, next);
		});

	app.route('/logout')
		.get(function (req, res) {
			var tokenDoc = tokenCollection.findOne({userId: req.user.userId});
			tokenCollection.remove(tokenDoc);
			req.logout();
			res.redirect('/login');
		});
	
};
