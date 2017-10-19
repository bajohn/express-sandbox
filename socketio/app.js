var exports = module.exports = {};

var express = require('express');
var bodyParser = require('body-parser');
var serverhome = require('./lib/serverhome');
var cookieParser = require('cookie-parser');

var app = express();
app.use(bodyParser());
app.use(cookieParser());

app.get('/', function (req, res) {
 console.log(res);
  res.send('Hello World!' + serverhome.testVal)
})

app.post('/posttest', function (req, res) {
	var response = "node body: ";
	for(x in req.body)
	{
		response+=x + ":" + req.body[x] + "\n";
	}
	response+="node query params: ";
	for(x in req.query)
	{
		response+=x + ":" + req.query[x] + "\n";

	}
	res.cookie('cookie1', 'yada');
	res.cookie('cookie2', 'yadayada', { httpOnly: true, secure: true }); //need https for this to work
	

  res.send(response);
})


exports.app = app;

var insertDocuments = function(db, callback) {
  // Get the documents collection 
  var collection = db.collection('documents');
  // Insert some documents 
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the document collection");
    callback(result);
  });
}

// var MongoClient = require('mongodb').MongoClient
  // , assert = require('assert');
 
// Connection URL 
var url = 'mongodb://localhost:27017/myproject';
// Use connect method to connect to the Server 
// MongoClient.connect(url, function(err, db) {
  // assert.equal(null, err);
  // console.log("Connected correctly to server");
 
  // insertDocuments(db, function() {
    // db.close();
  // });
// });