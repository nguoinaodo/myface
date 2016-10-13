'use strict';

var LocalStrategy = require('passport-local').Strategy;
var pool = require('../db/pool');
var bcrypt = require('bcrypt-nodejs');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		console.log('serializeUser');
		console.log(user);
		done(null, user.userId);
	});

	passport.deserializeUser(function (id, done) {
		pool.getConnection(function(err, conn) {
			if (err) throw err;
			
			console.log('deserializeUser');
			conn.query('select * from user where userId = "' + id + '"', function(err, rows) {
				conn.release();
				done(err, rows[0]);
			});
		});
	});
	// sign up
	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, function(req, email, password, done) {
		process.nextTick(function() {
			pool.getConnection(function(err, conn) {
				if (err) throw err;
				
				console.log('connect as id ' + conn.threadId);
				conn.query('select * from user where email ="' + email + '"', function(err, rows) {
					if (err) return done(err);
					
					// email exists
					if (rows.length) { 
						console.log('email exists');
						return done(null, false);
					}
					// else create new user
					var newUser = {};
					
					newUser.email = email;
					newUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
					conn.query("insert into user (email, password) value ('" + email + "', '" + newUser.password + "')", 
						function(err, result) {
							if (err) throw err;
							
							conn.release();
							newUser.userId = result.insertId;
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
		pool.getConnection(function(err, conn) {
			if (err) throw err;
			
			console.log('login');
			conn.query('select * from user where email = "' + email + '"', function(err, rows) {
				if (err) return done(err);
				
				// no user found
				if (!rows.length) {
					console.log('no user found');
					conn.release();
					return done(null, false);
				}
				// wrong password
				if (!bcrypt.compareSync(password, rows[0].password)) {
					console.log('wrong pass');
					conn.release();
					return done(null, false);
				}
				// all is well
				conn.release();
				return done(null, rows[0]);
			});
		});
	}));
};
