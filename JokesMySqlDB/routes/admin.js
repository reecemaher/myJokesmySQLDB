var express = require('express');
var mysql = require('mysql');

var router = express.Router();

/* 
 * Create a JSON object to hold mysql connection information.
 * 
 * NOTE: You should change these to YOUR database information
 * 
 * I am getting all my code from https://github.com/mysqljs/mysql
 */

var dbConnectionInfo = {
  host : 'eu-cdbr-azure-west-d.cloudapp.net',
  user : 'b0786a207d48be',
  password : '1fce273f',
  database : 'acsm_99e72477affa087'
};

router.get('/createJoke', function(req, res, next) {
  res.render('jokeForm');
});

router.post('/newJoke', function(req, res, next) {
  // connect to the database
  var dbConnection = mysql.createConnection(dbConnectionInfo);
  dbConnection.connect();

  // If we receive an error event handle it. I have placed this here because of a
  // bug in the mysql package which causes a 'PROTOCOL_SEQUENCE_TIMEOUT' error
  dbConnection.on('error', function(err) {
    if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
      // Let's just ignore this
      console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
    } else {
      // I really should do something better here
      console.log('Got a DB Error: ', err);
    }
  });

  var joke = {};
  joke.date = new Date();
  joke.text = req.body.theJoke;
  
  var mysqlDate = joke.date.toISOString().slice(0, 19).replace('T', ' ');
  dbConnection.query('INSERT INTO jokes (text, date) VALUES(?,?)',[joke.text, mysqlDate], function(err, results,fields) {
    // error will be an Error if one occurred during the query
    // results will contain the results of the query
    // fields will contain information about the returned results fields (if any)
    if (err) {
      throw err;
    }

    // notice that results.insertId will give you the value of the AI (auto-increment) field
    joke.id = results.insertId;

    // Going to convert my joke object to a JSON string a print it out to the console
    console.log(JSON.stringify(joke));

    // Close the connection and make sure you do it BEFORE you redirect
    dbConnection.end();

    res.redirect('/');
  });
    
});

// Notice how the following matching url uses a url "parameter". That is, the url is
// /delete/:id  where :id stands for "something". For example, if the url was 
// /delete/hello then :id would be hello, if the url was /delete/4 then :id would be 4.
// 
// When we use url parameters, when a parameter is found it can be retrieved in
// req.params.<the-name-of-the-parameter> e.g. req.params.id.
// 
// We can have lots of url parameters if we wish e.g. /delete/:id/:msg/ then is we were
// to have the url /delete/4/hello - req.params.id == 4 and req.params.msg == hello
router.get('/delete/:id', function(req, res, next) {
  console.log("Deleting joke " + req.params.id);
  
  // I am wrapping the call to getJokeIndex in a if(req.params.id) condition
  // which checks to see if I really do have a parameter called id, that is,
  // a like something like /delete/4 has been clicked as apposed to
  // /delete/
  if (req.params.id) {
    // Connect to the database
    var dbConnection = mysql.createConnection(dbConnectionInfo);
    dbConnection.connect();

    // If we receive an error event handle it. I have placed this here because of a
    // bug in the mysql package which causes a 'PROTOCOL_SEQUENCE_TIMEOUT' error
    dbConnection.on('error', function(err) {
      if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
        // Let's just ignore this
        console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
      } else {
        // I really should do something better here
        console.log('Got a DB Error: ', err);
      }
    });

    dbConnection.query('DELETE FROM jokes WHERE id=?',[req.params.id], function(err,results, fields) {
      if (err) {
        console.log("Error deleting joke");
        throw err;
      }
       
       console.log("Joke deleted");
       dbConnection.end();
       res.redirect('/');
    });
  }

});

router.get('/edit', function(req, res, next) {
  console.log("Editing joke " + req.query.id);
  
  if (req.query.id) {
    // Connect to the database
    var dbConnection = mysql.createConnection(dbConnectionInfo);
    dbConnection.connect();

    // If we receive an error event handle it. I have placed this here because of a
    // bug in the mysql package which causes a 'PROTOCOL_SEQUENCE_TIMEOUT' error
    dbConnection.on('error', function(err) {
      if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
        // Let's just ignore this
        console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
      } else {
        // I really should do something better here
        console.log('Got a DB Error: ', err);
      }
    });

    dbConnection.query('SELECT * FROM jokes WHERE id=?',[req.query.id], function(err, results, fields){

      if (err) {
        throw err;
      }

      if (results.length == 1) {
        var aJoke = {};
        aJoke.id = results[0].id;
        aJoke.text = results[0].text;
        aJoke.date = new Date(results[0].date);
        
        dbConnection.end();

        res.render('jokeForm', {joke: aJoke});
      } else {

        dbConnection.end();
        res.redirect('/');
      }


    });

  }
  
});

router.post('/editJoke', function(req, res, next) {
  // Connect to the database
  var dbConnection = mysql.createConnection(dbConnectionInfo);
  dbConnection.connect();

  // If we receive an error event handle it. I have placed this here because of a
  // bug in the mysql package which causes a 'PROTOCOL_SEQUENCE_TIMEOUT' error
  dbConnection.on('error', function(err) {
    if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
      // Let's just ignore this
      console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
    } else {
      // I really should do something better here
      console.log('Got a DB Error: ', err);
    }
  });

  var joke = {};
  joke.id = req.body.id;
  joke.date = new Date();
  joke.text = req.body.theJoke;
    
  var mysqlDate = joke.date.toISOString().slice(0, 19).replace('T', ' ');
  
  dbConnection.query('UPDATE jokes SET text=?, date=? WHERE id=?',[joke.text, mysqlDate, joke.id], function(err, results,fields) {
    // error will be an Error if one occurred during the query
    // results will contain the results of the query
    // fields will contain information about the returned results fields (if any)
    if (err) {
      throw err;
    }

    dbConnection.end();

    res.redirect('/');
  });


});

module.exports = router;