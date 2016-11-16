'use strict';

var LocalStrategy = require('passport-local').Strategy;
var conn = require('../db/mysql/connection');
var bcrypt = require('bcrypt-nodejs');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.userId);
	});

	passport.deserializeUser(function (id, done) {
		conn.query('select * from user where userId = "' + id + '"', function(err, rows) {
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
			conn.query('select * from user where email ="' + email + '"', function(err, rows) {
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
				conn.query('insert into user set ?;', newUser, function(err, result) {
					if (err) return done(err);
					
					newUser.userId = result.insertId;
					return done(null, newUser);
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
		conn.query('select * from user where email = "' + email + '"', function(err, rows) {
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
