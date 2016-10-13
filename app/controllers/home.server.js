'use strict';

var pool = require(process.cwd() + '/app/db/pool.js');

var HomeController = {
    getHome: function(req, res) {
            var auth = req.isAuthenticated();
			
			if (auth) {
			    var userId = req.user.userId;
			    
			    pool.getConnection(function(err, conn) {
			        if (err) throw err;
			        
			        var query = 'select url from avatar, photo'
			            + ' where avatar.photoId = photo.photoId'
			            + ' and userId = "' + userId + '"'
			            + ' order by dateTime desc limit 1;';
			     
			        conn.query(query, function(err, rows) {
			            if (err) throw err;
			            
			            conn.release();
			            console.log(rows[0]);
			            res.render('home', {
        					auth: auth,
        					displayName: req.user.displayName,
        					myId: userId,
        					avatarUrl: rows[0]? rows[0].url: ''
        				});
			        });
			    });
			} else {
				res.render('home', {
					auth: auth
				});
			}    
    } 
};

module.exports = HomeController;