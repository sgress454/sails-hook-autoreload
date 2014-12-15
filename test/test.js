/**
 * Module dependencies
 */

var Sails = require('sails').Sails;

describe('Basic tests ::', function() {

	var sails;

	before(function (done) {
		
		// Hook will timeout in 10 seconds
		this.timeout(11000);

		// Attempt to lift sails
	    Sails().lift({
	      hooks: {
	        // Load the hook
	        "autoreload": require('../'),
	        // Skip grunt
	        "grunt": false
	      },
	      log: {level: "error"}
	    },function (err, _sails) {
	      if (err) return done(err);
	      sails = _sails;
	      return done();
	    });
	});

	after(function (done) {
		if (sails) {
			return sails.lower(done);
		}
		return done();
	});

	it ('sails does not crash', function() {
		return true;
	});

});