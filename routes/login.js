// -----------------------------------------------------------------
// LOGIN SHOW
// -----------------------------------------------------------------

exports.show = function(req, res){
    console.log('=> Accessed /login ');
    // Get params
	var q = req.param("q");
	console.log("q="+q);

	// Check params
	var msg = "Type your username and password";
	if (typeof(q) != 'undefined') {
		console.log(q);
		if (q=='pwsent') {
			msg = 'Your password has been sent to the email address associated to your account';
		} else if (q=='sp') {
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
	res.render('login.ejs' , {title: 'Loging', msg: msg, pos: {'x': -130, 'y': -150}});
};

// -----------------------------------------------------------------
// LOGIN POST
// -----------------------------------------------------------------

exports.post = function(req, res){
	//console.log(req);
	var dbAccess = require('../modules/db-access');
	var user = req.param("user");
	var pass = req.param("password");
	dbAccess.checkLogin(user, pass, function(code, txt) {
		console.log(txt);
		if (code == 1) {
			// successfuly loggoed
			// make the username persistent until logged out
			console.log(req.session);
			req.session.user = user;
			req.session.reange = { from: 0, to: -1 };
			console.log(req.session);
			res.redirect('/queryDb');
		}
		else
		{
			res.redirect('/login?q=wrong');
		}
	});
};