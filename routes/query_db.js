

var mUtils = require('../modules/utils');

// --------------------------------------------------
// Helper Functions
// --------------------------------------------------


// -------------------------------------------------
var GetParamFromURL = function(req, theParam, initValue, callback) {
	var p = '';
	if (mUtils.IsDefined(req.param(theParam))) {
		p = req.param(theParam).trim();

		if (callback) {
			console.log('callback: ' + theParam + ' --> '+ p);

			p = callback(p)
			console.log('post callback: ' + theParam + ' --> '+ p);
		}
	} else if (mUtils.IsDefined(initValue)) {
		p = initValue;
		console.log('no callback: init value:' + theParam + ' --> '+ p);
	}
	console.log('---init value:' + theParam + ' --> '+ initValue);
	return p;
}

// -------------------------------------------------
var GetCheckBoxedInfo = function(req) {
	// we could do it using req.param(theParam)
	// IN: [qCheckBox!books!push_bucket_1!books!1, HIDDEN!qCheckBox!books!push_bucket_1!books!1]
	// OUT:  { 'changes' : [{'table' : 'books', 'field' : 'push_bucket_1', 'value' : '1', 'where' : 'books.id = 1'}]}
	var changes = new Array();
	
	var hidden = new Array();
	var checkboxes = new Array();

	// Split into hidden / checkbox 
	for(var propt in req.body) {
		var tokens = propt.split('!');
		if (tokens.length > 0) {
			if (tokens[0] === 'qCheckbox') { 
				checkboxes.push(propt);
				console.log('>>>> CHECKBOX received: table[' + tokens[1] + '] - col[' + tokens[2] + '] - uId table[' + tokens[3] + '] - uId filed[' + tokens[4] + ']- uId value[' + tokens[5] + ']');
			}
			else if (tokens[0] === 'HIDDEN') { 
				// remove the HIDDEN token
				hidden.push(propt.substring(propt.indexOf('!')+1));
				console.log('>>>> CHECKBOX HIDDEN received: table[' + tokens[2] + '] - col[' + tokens[3] + '] - uId table[' + tokens[4] + '] - uId filed[' + tokens[5] + ']- uId value[' + tokens[6] + ']');
			}
		}
	}

	// Rules: 
	// 1) if a checkbox if found in the checkbox list and inthe hidden list: DO NOTHING (it was already selected)
	// 2) if a checkbox is only found in the hidden list: It has been unselected
	// 3) if a checkbox is only found in the checkbox list: It has been selected

	checkboxes.forEach(function(t){
		if (hidden.indexOf(t) === -1) {
			// To be selected
			var tokens = t.split('!');
			thisChange = {	'table' : tokens[1],
							'field' : tokens[2],
							'value' : 1,
							'where' : tokens[3] + '.' + tokens[4] + ' = ' + tokens[5] };
			changes.push(thisChange);
		}
	});

	hidden.forEach(function(t){
		if (checkboxes.indexOf(t) === -1) {
			// To be unselected
			var tokens = t.split('!');
			console.log(tokens);
			thisChange = {	'table' : tokens[1],
							'field' : tokens[2],
							'value' : 0,
							'where' : tokens[3] + '.' + tokens[4] + ' = ' + tokens[5] };
			changes.push(thisChange);
		}
	});

	console.log('Changes--------------');
	console.log(changes);
    return changes;
}

//----------------------------------------------------------------------------

var readAndDisplayBooksFromDB = function (par) {
	//var searchParams = { _title: par.title, _author: par.author, fromRecordIdx: par.fromRec, numRecords: par.numRec };
    par.dbAccess.queryDB(par.queryData, par.searchParams, function(qRes, qFields, txt) {
		console.log(txt);		
		var range = { first: par.searchParams.fromRecordIdx, number: par.searchParams.numRecords };
		var filterArray = [ par.searchParams._title, par.searchParams._author];
		//var layoutData = { title: "Main Page (POST)" };
		console.log(range);
		par.res.render('query_db.ejs', params = { filters: filterArray, layout: false, title: par.page_title, queryResult: qRes, fields: qFields, range: range });
	});
}

//----------------------------------------------------------------------------
exports.post = function(req, res){
    console.log('=> Accessed /queryDb (POST) ');

	if (mUtils.ValidSession(req.session) === false) {
		res.redirect('/login');
		return;
	}

    // Parse Parameters
	console.log(req.body);
	var pAction = GetParamFromURL(req, "pAction");
	var qTitle  = GetParamFromURL(req, "qTitle"); 
	var qAuthor = GetParamFromURL(req, "qAuthor");
	var qFrom   =  GetParamFromURL(req, "qFrom", 0, function(value) { return parseInt(value); });
	var qNumRecords = GetParamFromURL(req, "qNumRecords", 0, function(value) { return parseInt(value); });
	console.log('Title [' + qTitle + "] Author [" + qAuthor + "]" + " pAction [" + pAction + "]" + " qFrom [" + qFrom + "]");

	// db access methods
    var dbAccess = require('../modules/db-access');
    // view data 
    var queryData = require('../modules/book_query'); //console.log(queryData);

    var bRefreshView = false;
	// Marked rows?

	if (pAction === "true") {
		// Apply mark changes button pressed
		var changes = GetCheckBoxedInfo(req);
		if (changes.length > 0) {
			// There are changes
			dbAccess.updateBooks(changes, function(upErr, upRes, upDone, upCustomMsg) {
				console.log(upErr);
				console.log(upRes);
				console.log(upDone);
				console.log(upCustomMsg);

				if (upDone)
				{
					var searchParams = { _title: qTitle, _author: qAuthor, fromRecordIdx: qFrom, numRecords: qNumRecords };
					var par = { 'queryData' : queryData, 'page_title' : 'PUT',
						'dbAccess' : dbAccess, 'res' : res,
						'searchParams' : searchParams };
			
					readAndDisplayBooksFromDB(par);
				}

			});
		}
		else { bRefreshView = true; } // no changes
	} 	else { bRefreshView = true; } // no post from APPLY button

	if (bRefreshView) {
		var searchParams = { _title: qTitle, _author: qAuthor, fromRecordIdx: qFrom, numRecords: qNumRecords };
			var par = { 'queryData' : queryData, 'page_title' : 'PUT (no post)',
				'dbAccess' : dbAccess, 'res' : res,
				'searchParams' : searchParams };
	
			readAndDisplayBooksFromDB(par);
	}
};

//----------------------------------------------------------------------------
exports.show = function(req, res){
    console.log('=> Accessed /queryDb (GET)');

	if (mUtils.ValidSession(req.session) === false) {
		res.redirect('/login');
		return;
	}

    // db access methods
    var dbAccess = require('../modules/db-access');
    // view data 
    var queryData = require('../modules/book_query'); //console.log(queryData);

    // Check params
    var fromRes = req.param("from");
	var toRes = req.param("to");

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
	var searchParams = { _title: '', _author: '', fromRecordIdx: 0, numRecords: -1 };
	var par = { 'queryData' : queryData, 'page_title' : 'GET',
				'dbAccess' : dbAccess, 'res' : res,
				'searchParams' : searchParams };
	
	readAndDisplayBooksFromDB(par);
};

