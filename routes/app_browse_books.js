

var mUtils = require('../modules/utils');

// --------------------------------------------------
// Helper Functions
// --------------------------------------------------

//----------------------------------------------------------------------------

var readAndDisplayBooksFromDB = function (par) {
	//var searchParams = { _title: par.title, _author: par.author, fromRecordIdx: par.fromRec, numRecords: par.numRec };
    //par.dbAccess.queryDB(par.queryData, par.searchParams, function(qRes, qFields, txt) {
    par.dbAccess.mainBrowseQuery("", function (qRes,qFields,txt) {
		console.log(txt);		
		var range = { first: par.searchParams.fromRecordIdx, number: par.searchParams.numRecords };
		//var filterArray = [ par.searchParams._lang, par.searchParams._origins];
		//var layoutData = { title: "Main Page (POST)" };
		console.log(qFields);
		console.log("###############################################");
		console.log("###############################################");
		qFilterRes = par.qFilterRes;
		par.res.render('app_browse_books.ejs' , par = { title : 'App Browse', filters: qFilterRes, queryResult: qRes, fields: qFields, range: range });
	});
}

//----------------------------------------------------------------------------
exports.show = function(req, res) {
    console.log('=> Accessed / App_Browser (GET)');

	if (mUtils.ValidSession(req.session) === false) {
		res.redirect('/login');
		return;
	}

	var cnt = 2;
	var qFilterResuts = {}

	    // db access methods
    var dbAccess = require('../modules/db-access');

	dbAccess.selectAll("origins", 
		function(err, results, fields) {
			if (results.length > 0) {
				console.log("Hurray! there are results");
			}
			console.log(results);
			qFilterResuts["origins"] = results;
			
			dbAccess.selectAll("languages", 
			function(err, results, fields) {
				if (results.length > 0) {
					console.log("Hurray! there are results");
				}
				qFilterResuts["lang"] = results;

				dbAccess.selectAll("read_levels", 
				function(err, results, fields) {
					if (results.length > 0) {
						console.log("Hurray! there are results");
					}
					qFilterResuts["levels"] = results;


					// Check params
				    var fromRes = 0; //req.param("from");
					var toRes = 100; //req.param("to");

					console.log("from="+fromRes+" to="+toRes);

					var from_ = -1;
					var to_ = -1;
					if (typeof(fromRes) != 'undefined') {
						from_ = parseInt(fromRes);
						if (typeof(toRes) != 'undefined') {
							to_ = parseInt(toRes);
						}
					}

					// Access DB
					var searchParams = { _lang: '', _origin: '', _free:'', _rlevels:'', fromRecordIdx: 0, numRecords: -1 };
					var par = { 'queryData' : searchParams, 'page_title' : 'GET',
								'dbAccess' : dbAccess, 'res' : res,
								'searchParams' : searchParams, qFilterRes: qFilterResuts };



					readAndDisplayBooksFromDB(par);

					//res.render('app_browse_books.ejs' , par = { title : 'App Browse', filters : qResuts });
				}
				);
			}
			);
		}
	);

    
	
	
}

//----------------------------------------------------------------------------
exports.post = function(req, res) {
    console.log('=> Accessed / App_Browser (POST)');

	if (mUtils.ValidSession(req.session) === false) {
		res.redirect('/login');
		return;
	}

	var cnt = 2;
	var qFilterResuts = {}

	    // db access methods
    var dbAccess = require('../modules/db-access');

	dbAccess.selectAll("origins", 
		function(err, results, fields) {
			if (results.length > 0) {
				console.log("Hurray! there are results");
			}
			console.log(results);
			qFilterResuts["origins"] = results;
			
			dbAccess.selectAll("languages", 
			function(err, results, fields) {
				if (results.length > 0) {
					console.log("Hurray! there are results");
				}
				qFilterResuts["lang"] = results;

				dbAccess.selectAll("read_levels", 
				function(err, results, fields) {
					if (results.length > 0) {
						console.log("Hurray! there are results");
					}
					qFilterResuts["levels"] = results;


					// Check params
				    var fromRes = 0; //req.param("from");
					var toRes = 100; //req.param("to");

					console.log("from="+fromRes+" to="+toRes);

					var from_ = -1;
					var to_ = -1;
					if (typeof(fromRes) != 'undefined') {
						from_ = parseInt(fromRes);
						if (typeof(toRes) != 'undefined') {
							to_ = parseInt(toRes);
						}
					}

					// Access DB
					var searchParams = { _lang: '', _origin: '', _free:'', _rlevels:'', fromRecordIdx: 0, numRecords: -1 };
					var par = { 'queryData' : searchParams, 'page_title' : 'GET',
								'dbAccess' : dbAccess, 'res' : res,
								'searchParams' : searchParams, qFilterRes: qFilterResuts };



					readAndDisplayBooksFromDB(par);
				}
				);
			}
			);
		}
	);

    
	
	
}