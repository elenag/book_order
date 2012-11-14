// -----------------------------------------------------------------
// LOGIN
// -----------------------------------------------------------------

exports.checkLogin = function(user, pass, callback) {
    console.log('=> Checking Login [' + user + ']['+pass+']');

    // Connect to db
    var mysql = require('mysql');

	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: ''
	});

	connection.query('USE books_db');

	// request the seleted user
	connection.query("SELECT * from users", 
    function(err, results, fields) {
		console.log(results);
		//console.log(fields);
		if (err) throw err;

		if (results.length == 0) {
			console.log("Could not find user: " + user);
			callback(0, "CB: Could not find user: " + user);
		} else if (results[0].user === user && results[0].password === pass) {
			console.log("User " + user + " has been authenticated.");
			callback(1, "CB: User " + user + " has been authenticated");
		}
		else
		{
			console.log("Wrong pass: " + pass);
			callback(2, "CB: Wrong pass: " + pass);
		}
      }
	);
};

exports.sendPassword = function(email, res, callback) {
    console.log('=> Sending email ['+email+'] with forgotten password');

    // Connect to db
    var mysql = require('mysql');

	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: ''
	});

	connection.query('USE books_db');

	var theEmail = email;
	// request the seleted user
	connection.query("SELECT * from users", 
    function(err, results, fields) {
    	console.log('Results:');
		console.log(results);
		//console.log(fields);
		if (err) throw err;

		var found = false;
		for(var item in results) {
			console.log('Item:');
			console.log(results[item]);
			console.log(results[item] + ' ==' + theEmail);
			if (results[item].email == theEmail) {
				// found !
				found = true;
				var email   = require("emailjs");
				var server  = email.server.connect({
				   user:    "sancho.mila", 
				   password:"----", 
				   host:    "smtp.gmail.com", 
				   ssl:     true
				});

				console.log('Found: '+results[item].password);
				var textLink = 'http://localhost:3001/login';
				var textPass = 'Your password is:'+results[item].password;
				var theText = textPass + "\n Click in the following link to go to the login page: \n"+ textLink;
				console.log(theText);
				// send the message and get a callback with an error or details of the message that was sent
				server.send({
				   text:    theText, 
				   from:    "Worldreader Partner Program <username@gmail.com>", 
				   to:      "dario <" + theEmail +">",
				   cc:      "",
				   subject: "testing password retrival"
				}, function(err, message) { 
					console.log(err || message);
					callback(err, "done");
					return;

				});
			}
		}

		if (!found) {
			console.log('Email not found!!!: '+email);
			callback('NotFound', "done");
			return;
		}
	});

};

// -----------------------------------------------------------------
// BOOKS
// -----------------------------------------------------------------

// ----------------------------------------------------------
// Params: searchParams
// IN:  changes = 	[{'table' : 'books', 'field' : 'push_bucket_1', 'value' : '1', 'where' : 'books.id = 1'}]

exports.updateBooks = function(changes, callback) {
	// UPDATE  `db`.`table` SET  `field_name` =  '1' WHERE  `table`.`id` =2;
    console.log('==========> UPDATE Book'); 
    console.log(changes);

 // Connect to db
    var mysql = require('mysql');

	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: ''
	});

	connection.query('USE books_db');
	var syncCnt = changes.length;
    changes.forEach(function(change){
    	var UPDATE_STR = 	'UPDATE ' + change.table + 
							' SET ' + change.field + ' = ' + change.value +
							' WHERE ' + change.where;

		console.log('SQL: ' + UPDATE_STR);

		connection.query(UPDATE_STR, 
	    function(err, results, fields) {
			//console.log(results);
			//console.log(fields);
			if (err) throw err;
			syncCnt--;
			var done = (syncCnt === 0);
			callback(err, results, done, "Updating fields");
		});
    })
	

/*	var queryStr = 'UPDATE books \
					SET books.push_bucket_1, books.push_bucket_2 \
					WHERE books.cover = searchParams.key \
					LIMIT 1';*/

	
}

// --------------------------------------------------------------

var generateSelect = function(select) {
	var selStr = '';
	select.forEach(function(t) {
		selStr = selStr + t.table + '.' + t.name + ', ';
	});
	if (selStr.length > 1) {
		selStr = 'SELECT ' + selStr.slice(0, selStr.length-2);
	}		
	return selStr;
}

var generateFrom = function(from) {
	var fromStr = '';
	var set = {};
	var setLen = 0;
	from.forEach(function(t) {
		//console.log(t)
		if (!(t.table in set)) {
			//console.log(t)
			set[t.table] = true;
			setLen++;
			fromStr = fromStr + t.table + ', ';
		}
	});
	if (setLen > 0) {
		fromStr = ' FROM ' + fromStr.slice(0, fromStr.length-2);
	}		
	return fromStr;
}

// Parameter parsing nomenclature:
// %%_PARAM_NAME = matches substrings
//       i.e. generates:  'LOCATE(\''+searchParam+'\',db_field) != 0'; 
var generateWhere = function(where, params) {
	var whereStr = '';
	where.forEach(function(t) {
		//console.log(params);
		//console.log(t);// e.g. t = { "eq" : "authors.name = %%_author"}
		var matchSubStr = false;
		var paramFound = false;
		var s = t.eq.split('%%');
		// s = ['authors.name = ', '_author']
		if (s.length == 1) {
			// No substring matching
			s = t.eq.split('%=');
			if (s.length == 1) {
				// no parameter
				whereStr = whereStr + t.eq + ' AND ';
			} else { paramFound = true; }
		} else { paramFound = true; matchSubStr = true;}
		
		if (paramFound) {
			if (s[1].length > 0) {
				lhsField = (s[0]).split('=')[0];
				// lhsField = 'authors.name '
				//console.log(lhsField);
				var paramValue = lhsField.trim();
				// paramValue = 'authors.name'
				if (paramValue.length > 0){
					if (matchSubStr == true) {
						// LOCATE (search string,string,[position])
						whereStr = whereStr + 'LOCATE(\''+params[s[1]]+'\' , ' + paramValue + ') != 0  AND ';
					}else {
						whereStr = whereStr + s[0] + paramValue + ' AND ';
					}
				}
			}
		}
	});
	if (whereStr.length > 1) {
		// Add WHERE and remove trailing 'AND '
		whereStr = ' WHERE ' + whereStr.slice(0, whereStr.length-5);
	}		
	return whereStr;
}

// -------------------------------------------------
var IsDefined = function(resource) {
	return  (typeof(resource) != 'undefined');
}

var updateFields = function(fields, queryData) {
	queryData.select.forEach (function(selEntry) {
		fields.forEach(function(field) {
			if (selEntry.table === field.orgTable && 
				selEntry.name === field.orgName) {
				field.tableElemType = selEntry.type;
				if (selEntry.display != '') {
					field.name = selEntry.display;
				}
				if (IsDefined(selEntry.uniqueId) &&  selEntry.uniqueId == "true") {
					field.__uniqueId = 1;
				} else {
					field.__uniqueId = 0;
				}
				if (IsDefined(selEntry.url) &&  selEntry.url.length > 0) {
					field.__url = selEntry.url;
				}
			}
		});
	});
}

// --------------------------------------------------------------
exports.queryDB = function(queryData, searchParams, callback) {
    console.log('=============> QueryDB');
    console.log(searchParams);

    //console.log(queryData.select);
    var SELECT_STR = generateSelect(queryData.select);
    var FROM_STR   = generateFrom(queryData.select);
    var WHERE_STR  = generateWhere(queryData.where, searchParams);
    console.log(">>>>>>> SELECT <<<<<<<<");
    console.log(SELECT_STR);
    console.log(FROM_STR);
    console.log(WHERE_STR);

    // Connect to db
    var mysql = require('mysql');

	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: ''
	});

	connection.query('USE books_db');


	// Calculate limits
	var limitStr = '';
	if (searchParams.fromRecordIdx >= 0 ) {
		limitStr = ' LIMIT ' + searchParams.fromRecordIdx;
		if (searchParams.numRecords > 0) {
			limitStr = limitStr + ',' + searchParams.numRecords;
		} else {
			limitStr = limitStr + ',100000000'; //simply ALL
		}
	}

	// Build query string
	var queryStr =  SELECT_STR + 
					FROM_STR + 
					WHERE_STR +
					limitStr;
					//' WHERE books.author_id = authors.id ' + whereStr + 
					//limitStr;

	console.log('SQL: ' + queryStr);

	connection.query(queryStr, 
    function(err, results, fields) {
		//console.log(results); console.log(fields);
		if (err) throw err;

		// update result fileds with selected display names and extra table params
		updateFields(fields, queryData);
		//console.log("FIELDS"); console.log(fields);
		callback(results, fields, "QueryDB finished. Callback done");
	});
};

// --------------------------------------------------------------
exports.test = function(queryData, searchParams, callback) {
    console.log('=============> TEST');
    
    // Connect to db
    var mysql = require('mysql');

	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: ''
	});

	connection.query('USE books_db');

	// Build query string
	var queryStr =  "SELECT * FROM books;"

	console.log('SQL: ' + queryStr);

	connection.query(queryStr, 
    function(err, results, fields) {
		//console.log(results); console.log(fields);
		if (err) throw err;

		// update result fileds with selected display names and extra table params
		console.log(results);

		//console.log("FIELDS"); console.log(fields);
		callback(results, fields, "QueryDB finished. Callback done");
	});
};

