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

	var mLocalSettings = require('../local_settings/localSettings');
	connection.query('USE ' + mLocalSettings.GetNameDB());

	// request the seleted user
	var query = "SELECT * FROM admin_users WHERE email='" + user + "' AND encrypted_password='" + pass+"'";
	console.log(query);
	connection.query(query, 
    function(err, results, fields) {
		console.log(results);
		//console.log(fields);
		if (err) throw err;

		if (results.length == 0) {
			console.log("Could not find user/password match: " + user + "/" + pass);
			callback(0, "CB: Could not find user/password match: " + user + "/" + pass);
		}
		else {
			console.log("Login successful for user: " + user);
			callback(1, "CB: Login successful for user: " + user);
		}
		return;
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

	var mLocalSettings = require('../local_settings/localSettings');
	connection.query('USE ' + mLocalSettings.GetNameDB());

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

	var mLocalSettings = require('../local_settings/localSettings');
	connection.query('USE ' + mLocalSettings.GetNameDB());

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

	var mLocalSettings = require('../local_settings/localSettings');
	connection.query('USE ' + mLocalSettings.GetNameDB());


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

	var options = {sql: queryStr, nestTables: true};
	connection.query(options, 
    function(err, results, fields) {
		//console.log(results); console.log(fields);
		if (err) throw err;

		console.log("===== results ===="); console.log(results);
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

	var mLocalSettings = require('../local_settings/localSettings');
	connection.query('USE ' + mLocalSettings.GetNameDB());

	// Build query string
	var queryStr =  "SELECT \
    b.id, b.asin, b.title, b.origin_id, o.name, p.name, l.name, g.name, rl.name, a.id, a.name\
  FROM \
    books b\
    INNER JOIN authors_books ON b.id = authors_books.book_id\
    INNER JOIN authors a ON authors_books.author_id = a.id \
    LEFT JOIN origins o ON b.origin_id = o.id\
    LEFT JOIN publishers p ON b.publisher_id = p.id\
    LEFT JOIN languages l ON b.language_id = l.id\
    LEFT JOIN genres g ON b.genre_id = g.id\
    LEFT JOIN read_levels rl ON b.read_level_id = rl.id\
  WHERE\
    l.name = \"Ewe\"\
  ORDER BY\
    title ASC";

    var options = {sql: queryStr, nestTables: true};

	console.log('SQL: ' + queryStr);

	connection.query(options, 
    function(err, results, fields) {
		//console.log(results); console.log(fields);
		if (err) throw err;

		// update result fileds with selected display names and extra table params
		console.log(results);

		//console.log("FIELDS"); console.log(fields);
		callback(results, fields, "QueryDB finished. Callback done");
	});
};

// --------------------------------------------------------------
// * queryData will include the drop-menu selections, the search bar and
// the current page (pagination)
exports.mainBrowseQuery = function(queryData, callback) {
    console.log('=============> mainBrowseQuery');
    
    // Connect to db
    var mysql = require('mysql');

	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: ''
	});

	var mLocalSettings = require('../local_settings/localSettings');
	connection.query('USE ' + mLocalSettings.GetNameDB());

	// Build query string
	var queryStr =  "SELECT \
    		books.id, books.asin, books.title, origins.name, publishers.name, languages.name, genres.name, read_levels.name, authors.name\
  		FROM \
  			books \
		    INNER JOIN authors_books ON books.id = authors_books.book_id\
		    INNER JOIN authors ON authors_books.author_id = authors.id \
		    LEFT JOIN origins ON books.origin_id = origins.id\
		    LEFT JOIN publishers ON books.publisher_id = publishers.id\
		    LEFT JOIN languages ON books.language_id = languages.id\
		    LEFT JOIN genres ON books.genre_id = genres.id\
		    LEFT JOIN read_levels ON books.read_level_id = read_levels.id\
		WHERE\
		   languages.name='English' \
		ORDER BY\
			books.title ASC;"

	console.log('SQL: ' + queryStr);
    
    var options = {sql: queryStr, nestTables: true};
	connection.query(options, 
    function(err, results, fields) {
		//console.log(results); console.log(fields);
		if (err) throw err;

		// update result fileds with selected display names and extra table params
		console.log(results);

		//console.log("FIELDS"); console.log(fields);
		callback(results, fields, "mainBrowseQuery finished. Callback done");
	});
};

// -----------------------------------------------------------------
// APP_BROWSE_FILTERS
// -----------------------------------------------------------------

// ----------------------------------------------------------
// Params: searchParams
// IN:  tableName

exports.selectAll = function(tableName, callback) {
    console.log('==========> select ALL from ' + tableName);

 // Connect to db
    var mysql = require('mysql');

	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: ''
	});

	var mLocalSettings = require('../local_settings/localSettings');
	connection.query('USE ' + mLocalSettings.GetNameDB());

	// request the seleted user
	var query = "SELECT * FROM " + tableName;
	console.log("SQL:" + query);
	connection.query(query, 
    function(err, results, fields) {
		//console.log(results);
		//console.log(fields);
		if (err) throw err;
		console.log("selectAll returned " + results.length + " elements");
		callback(err, results, fields);
		return;
      }
	);

	
}
