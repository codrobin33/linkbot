var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var config = require('./config.js');

// Connection URL
var url = config.url;
// Use connect method to connect to the Server
/*MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  db.close();
});*/

var insertLink = function(key, link, callback) {
  // connec to db
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    //console.log(arguments, {[key] : link});

    // Get the documents collection
    var collection = db.collection('links');
    // Insert some documents
    collection.insert({
      key: key,
      link: link
    }, function(err, result) {
      assert.equal(err, null);
      //assert.equal(3, result.result.n);
      //assert.equal(3, result.ops.length);
      console.log("Inserted key into the links collection");
      callback(result);
    });
  })
}

var getLink = function(key, callback) {
  // connec to db
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);

    // Get the documents collection
    var collection = db.collection('links');
    // Find some documents
    collection.find({key: key}).toArray(function(err, links) {
      assert.equal(err, null);
      //assert.equal(2, docs.length);
      //console.log("Found the following links");
      //console.dir(links);
      callback(links);
    });
  })
}

module.exports = {
  insert: insertLink,
  get: getLink
}
