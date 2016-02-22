/*
 * megalink_list.js
 * List of megalinks 
 */
var url = require('url');
var fs  = require('fs');

var MegalinkList = function(path) {
  this.path = path || '../megalinks.json';
};

/*
 * Loads data into collection
 */
MegalinkList.prototype.fetch = function() {
  try {
    var previousMegalinks = fs.readFileSync(this.path);
    this.collection = JSON.parse(previousMegalinks);
  } catch(e) {
    this.collection = {};
  } 
};

/*
 * Add a megalink to the list collection
 */
MegalinkList.prototype.add = function(megalink) {
  var name = megalink.name;
  var links = megalink.links;

  if (this.collection[name]) {
    links.forEach(function(link) {
      if (this.collection[name].indexOf(link) === -1) {
        this.collection[name].push(link);
      }
    }.bind(this));
  } else {
    this.collection[name] = links;
  }
};

/*
 * Save link list
 */
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
