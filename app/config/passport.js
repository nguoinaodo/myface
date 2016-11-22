'use strict';

var LocalStrategy = require('passport-local').Strategy;
var conn = require('../db/mysql/connection');
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.userId);
	});

	passport.deserializeUser(function (id, done) {
		var query = 'SELECT * FROM `user` WHERE userId = ?'; 
		conn.query(query, [id], function(err, rows) {
			if (err) return done(err);

			done(err, rows[0]);
		});
	});
	// sign up
	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, function(req, email, password, done) {
		process.nextTick(function() {
			var query = 'SELECT * FROM `user` WHERE email = ?'; 
			conn.query(query, [email], function(err, rows) {
				if (err) return done(err);
				// email exists
				if (rows.length) { 
					return done(null, false);
				}
				// else create new user
				var newUser = {};
				
				newUser.email = email;
				newUser.displayName = req.body.displayName;
				newUser.from = req.body.from;
				newUser.livesIn = req.body.livesIn;
				newUser.birthday = req.body.birthday;
				newUser.sex = req.body.sex;
				newUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
				
				query = 'INSERT INTO `user` SET ?;';
				conn.query(query, newUser, function(err, result) {
					if (err) return done(err);
					
					newUser.userId = result.insertId;
					var avatar = {
						userId: newUser.userId,
						dateTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
					};
					if (newUser.sex == 'male') {
						avatar.photoId = 1;
					} else if (newUser.sex = 'female') {
						avatar.photoId = 2;
					} else {
						avatar.photoId = 3;
					}
					query = 'INSERT INTO avatar SET ?';
					conn.query(query, avatar, function(err, result) {
						if (err) return done(err);

						return done(null, newUser);	
					});
				});
			});
		});
	}));
	
	// login
	passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, function(req, email, password, done) {
		conn.query('SELECT * FROM `user` WHERE email = "' + email + '"', function(err, rows) {
			if (err) return done(err);
			// no user found
			if (!rows.length) {
				return done(null, false);
			}
			// wrong password
			if (!bcrypt.compareSync(password, rows[0].password)) {
				return done(null, false);
			}
			// all is well
			return done(null, rows[0]);
		});
	}));
};
