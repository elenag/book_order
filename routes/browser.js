

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

	var imgs = ['./img/data/book1.jpg','./img/data/book2.jpg' ,'./img/data/book3.jpg' ,'./img/data/book4.jpg' ]
	res.render('browser.ejs' , {title: 'Loging', data: imgs , pos: {'x': -130, 'y': -150}});
 
};

