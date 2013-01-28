

var mUtils = require('../modules/utils');

// --------------------------------------------------
// Helper Functions
// --------------------------------------------------


//----------------------------------------------------------------------------
exports.show = function(req, res) {
    console.log('=> Accessed /Browser (GET)');
    console.log('=> Accessed /Browser (GET)');

	if (mUtils.ValidSession(req.session) === false) {
		res.redirect('/login');
		return;
	}

	res.render('portal.ejs' , {title: 'Partner\'s Portal'} );
 
};

