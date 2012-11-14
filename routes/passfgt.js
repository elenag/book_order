// -----------------------------------------------------------------
// LOGIN SHOW
// -----------------------------------------------------------------

exports.show = function(req, res){
    console.log('=> Accessed /passfgt ');
    // Get params
	var q = req.param("q");
	console.log("q="+q);

	// Check params
	var msg = "Please enter the e-mail associated with your Partner Account";
	if (typeof(q) != 'undefined') {
		console.log(q);
		if (q=='sp') {
			msg = "Password need to have 6 characters or more";
		} else if (q=='easy') {
			msg = "Password was too simple";
		} else if (q=='wrong') {
			msg = "Wrong Username / Password. Please try again";
		}
	}
	
	console.log(msg);

	req.session.user = null;
	console.log(req.session);
	res.render('passfgt.ejs' , {title: 'Retriever Password', msg: msg, pos: {'x': -130, 'y': -150}});
};

// -----------------------------------------------------------------
// LOGIN POST
// -----------------------------------------------------------------

exports.post = function(req, res){
	var dbAcemailcess = require('../modules/db-access');
	var email = req.param("email");
	var dbAccess = require('../modules/db-access');
	dbAccess.sendPassword(email, res, function(err, txt) {
		console.log(txt);
		res.redirect('/login?q=pwsent');
		console.log('redirected');
	});
};
