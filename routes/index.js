
/*
 * GET home page.
 */

// Expects param :name
exports.show = function(req, res){
	// Look for the `name` parameter, and use a default
	// it it's not set.
	var name = req.param('name');
	if (name === null)
		name = 'Unknown User';

    console.log('=> Accessed / for user: ' + name);
	res.render('index.ejs' , {title: 'Books Central : ' + name});
};

exports.help = function(req, res){
    console.log('=> Accessed /help ');
	res.render('help.ejs' , {title: 'Help'});
};

exports.test = function(req, res){
	var http = require('http');
    console.log('=> Accessed /test ');
	//res.render('test.ejs' , {title: 'Test'});
	var options = {
		host: 'search.twitter.com',
		port: 80,
		path: '/search.json?q=sitepoint&rpp=10'
	};
	http.get(options, function(response) {
		var tweets = '';
		response.on('data', function(data) {
			tweets += data;
		}).on('end', function() {
			var tmp = JSON.parse(tweets),
			topTen = tmp.results;
			res.render('test', { title: 'Latest from Twitter', tweets: topTen });
		});
	}).on('error', function(e) {
	res.writeHead(500);
	res.write('Error: ' + e);
	});
};

exports.db = function(req, res){
    console.log('=> Accessed /db ');

    var http = require('http'), mysql = require('mysql');

	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: ''
	});

	connection.query('USE books');
	//connection.connect();

/*	client.query("SELECT * from author", 
      function(err, results, fields) {
          console.log(results);
          console.log(fields);
          if (err) throw err;

          res.render('db.ejs' , {title: 'DB', data: results});

         // res.writeHead(200, {'Content-Type': 'text/html'});
         // res.end(output);
      }
	); */

	var id_ = 3;
	var queryStr = "SELECT title.data, author.name, cover.path, description.data FROM title, author, cover, description ";
	//queryStr = queryStr + "WHERE title.id = " + id_ + " AND author.id =" + id_ + " AND cover.id = " + id_ + " AND description.id =" + id_;
	queryStr = queryStr + "WHERE title.id >= " + id_ + " AND author.id >= " + id_ + " AND cover.id >= " + id_ + " AND description.id >=" + id_;
	//queryStr = queryStr + " WHERE title.id = ? AND author.id = ? AND cover.id = ? AND description.id = ? , [2]";
	var options = {sql: queryStr, nestTables: true};
	console.log(options);
	connection.query(options,
	function(err, results, fields) {
        if (err) throw err;
        console.log(results);
        res.render('db.ejs' , {title: 'DB', data: results});
        //res.writeHead(200, {'Content-Type': 'text/html'});
         //res.end('Done');
	});

};

exports.dbform = function(req, res){
    console.log('=> Accessed /query ');

    var http = require('http'), mysql = require('mysql');

	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: ''
	});

	connection.query('USE books');
	//connection.connect();

/*	client.query("SELECT * from author", 
      function(err, results, fields) {
          console.log(results);
          console.log(fields);
          if (err) throw err;

          res.render('db.ejs' , {title: 'DB', data: results});

         // res.writeHead(200, {'Content-Type': 'text/html'});
         // res.end(output);
      }
	); */

	var id_ = 4;
	var queryStr = "SELECT title.data, author.name, cover.path, description.data FROM title, author, cover, description ";
	//queryStr = queryStr + "WHERE title.id = " + id_ + " AND author.id =" + id_ + " AND cover.id = " + id_ + " AND description.id =" + id_;
	queryStr = queryStr + "WHERE title.id >= " + id_ + " AND author.id >= " + id_ + " AND cover.id >= " + id_ + " AND description.id >=" + id_;
	//queryStr = queryStr + " WHERE title.id = ? AND author.id = ? AND cover.id = ? AND description.id = ? , [2]";
	var options = {sql: queryStr, nestTables: true};
	console.log(options);
	connection.query(options,
	function(err, results, fields) {
        if (err) throw err;
        console.log(results);
        res.render('query.ejs' , {title: 'The query POST', data: results});
        //res.writeHead(200, {'Content-Type': 'text/html'});
         //res.end('Done');
	});

};


exports.dbformGet = function(req,res) {
	console.log('GET db! : ' + req.query.length);
	console.log(req.query);

	    var http = require('http'), mysql = require('mysql');

	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: ''
	});

	var isQueryEmpty = (Object.keys(req.query).length === 0);

	if (!isQueryEmpty) {
		console.log('query.title: ' + req.query.title);
		connection.query('USE books');
		var id_ = 4;
		var queryStr = "SELECT title.data, author.name, cover.path, description.data FROM title, author, cover, description ";
		//queryStr = queryStr + "WHERE title.id = " + id_ + " AND author.id =" + id_ + " AND cover.id = " + id_ + " AND description.id =" + id_;
		queryStr = queryStr + "WHERE title.id >= " + id_ + " AND author.id >= " + id_ + " AND cover.id >= " + id_ + " AND description.id >=" + id_;
		//queryStr = queryStr + " WHERE title.id = ? AND author.id = ? AND cover.id = ? AND description.id = ? , [2]";
		var options = {sql: queryStr, nestTables: true};
		console.log(options);
		connection.query(options,
		function(err, results, fields) {
	        if (err) throw err;
	        console.log(results);
	        //res.render('query.ejs' , {title: 'The query POST', data: results});
	        res.render('query.ejs', {title: "the query GET w data", data : results, urlQuery : req.query});

		});
	}
	else
	{
		console.log('query.length == 0');
		 res.render('query.ejs', {title: "the query GET", data : [], urlQuery : req.query});
	}

}