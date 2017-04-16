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
      db.close();
      callback({error:'error connecting to db.'});
      return;
    }

    // Get the links collection
    var collection = db.collection('links');

    // before we insert, make sure we dont already have the key
    collection.findOne({key: key}, function(error, result) {
      if (error) {
        db.close();
        callback({error: error});
        return;
      }

      if (result) {
        db.close();
        callback({error: 'key already exists'});
        return;
      }

      collection.insert({
        key: key,
        link: link
      }, function(error, result) {
        if (error) {
          db.close();
          callback({error:`error inserting ${link} to db.`});
          return;
        }

        db.close();
        callback(result);
      });
    })
  })
}

var getAllLinks = function(callback) {
  MongoClient.connect(url, function(err, db) {
    if (err) {
      db.close();
      callback({error: 'error connecting to db.'});
      return;
    }

    var collection = db.collection('links');

    collection.find({}).toArray(function(error, result) {
      if (error) {
        db.close();
        callback({error: 'error retrieving links'});
        return;
      }

      db.close();
      callback(result);
    })
  })
}

var getLink = function(key, callback) {
  // connec to db
  MongoClient.connect(url, function(err, db) {
    if (err) {
      db.close();
      callback({error:'error connecting to db.'});
      return;
    }

    // Get the documents collection
    var collection = db.collection('links');
    // Find some documents
    collection.findOne({key: key}, function(err, link) {
      if (err) {
        db.close();
        callback({error:'error finding link.'});
        return;
      }
      if (!link) {
        db.close();
        callback({error:`${key} does not exist`});
        return;
      }

      db.close();
      callback(link);
    });
  })
}

var removeLink = function(key, callback) {
  // connec to db
  MongoClient.connect(url, function(err, db) {
    if (err) {
      db.close();
      callback({error:'error connecting to db.'});
      return;
    }

    // Get the documents collection
    var collection = db.collection('links');
    // Find some documents
    collection.deleteOne({key: key}, function(err, link) {
      if (err) {
        db.close();
        callback({error:'error deleting key'});
        return;
      }

      db.close();
      callback(link);
    });
  })
}

module.exports = {
  insert: insertLink,
  get: getLink,
  remove: removeLink,
  getAll: getAllLinks
}
