var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var config = require('./config.js');

// Connection URL
var url = config.url;

var insertLink = function(key, link, callback) {
  // connec to db
  MongoClient.connect(url, function(err, db) {
    //assert.equal(null, err);
    if (err) {
      callback({error:'error connecting to db.'});
      return;
    }

    // Get the links collection
    var collection = db.collection('links');

    // before we insert, make sure we dont already have the key
    collection.findOne({key: key}, function(error, result) {
      if (error) {
        callback({error: error});
        return;
      }

      if (result) {
        callback({error: 'key already exists'});
        return;
      }

      collection.insert({
        key: key,
        link: link
      }, function(error, result) {
        if (error) {
          callback({error:`error inserting ${link} to db.`});
          return;
        }

        callback(result);
      });
    })
  })
}

var getLink = function(key, callback) {
  // connec to db
  MongoClient.connect(url, function(err, db) {
    if (err) {
      callback({error:'error connecting to db.'});
      return;
    }

    // Get the documents collection
    var collection = db.collection('links');
    // Find some documents
    collection.findOne({key: key}, function(err, link) {
      if (err) {
        callback({error:'error finding link.'});
        return;
      }
      if (!link) {
        callback({error:`${key} does not exist`});
        return;
      }
      callback(link);
    });
  })
}

var removeLink = function(key, callback) {
  // connec to db
  MongoClient.connect(url, function(err, db) {
    if (err) {
      callback({error:'error connecting to db.'});
    }

    // Get the documents collection
    var collection = db.collection('links');
    // Find some documents
    collection.deleteOne({key: key}, function(err, link) {
      if (err) {
        callback({error:'error deleting key'});
        return;
      }
      callback(link);
    });
  })
}

module.exports = {
  insert: insertLink,
  get: getLink,
  remove: removeLink
}
