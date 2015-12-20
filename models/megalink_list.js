/*
 * megalist_link.js
 * List of megalinks 
 */
var url = require('url');
var fs  = require('fs');

var MegalinkList = function(path) {
  this.path = path || '/tmp/megalinks.json';
};

MegalinkList.prototype.fetch = function() {
  try {
    var previousMegalinks = fs.readFileSync(this.path);
    this.collection = JSON.parse(previousMegalinks);
  } catch(e) {
    this.collection = {};
  } 
};

MegalinkList.prototype.add = function(megalink) {
  var name = megalink.name;
  var links = megalink.links;

  this.collection[name] = links;
};

MegalinkList.prototype.save = function(list) {
  // TODO save to file/db
  // Sanity check to avoid data loss
  if (!Object.keys(this.collection).length) {
    console.log('ERROR: The self.collection does not seem to have anything in it. Not writing to file to avoid overwriting.');
    return;
  }
  fs.writeFileSync(this.path, JSON.stringify(this.collection));
};

module.exports = MegalinkList;
