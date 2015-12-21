/*
 * keeplinks.js 
 * Get link from a keeplink url
 */

var Scraper = require('../scraper.js');
var Megalink = require('../../models/megalink');
var util = require('util');
var request = require("request");
var cheerio = require("cheerio");
var url = require('url');
var Q = require('q');
var spawn = require('child_process').spawn;

var KeeplinkScraper = function(hashes) {
  Scraper.apply(this);

  this.baseUrl = 'http://www.keeplinks.eu/p/';
  this.hashes = hashes || {};
};
util.inherits(KeeplinkScraper, Scraper);

/*
 * Builds the full url
 */
KeeplinkScraper.prototype.getFullUrl = function(hash) {
  return this.baseUrl + hash;
};

/*
 * Add new hash
 */
KeeplinkScraper.prototype.addHash = function(name, hash) {
  if (this.hashes[name]) {
    this.hashes[name].push(hash);
  } else {
    this.hashes[name] = [hash];
  }
};

/*
 * Add megalinks
 */
KeeplinkScraper.prototype.scrape = function() {

  var all = Q();
  console.log(this.hashes);
  Object.keys(this.hashes).forEach(function(name) {

    var result = Q();
    var hashes = this.hashes[name]; 
    var megalink = new Megalink(name, []);
    hashes.forEach(function(hash) {
      var url = this.getFullUrl(hash); 
      console.log(name, url);
      result = result.then(function(resultUrl) { 
        console.log(name, resultUrl);
        if (resultUrl && this.isValidLink(resultUrl)) {
          megalink.addLink(resultUrl);
        }
        return this.getMegalink(url);
      }.bind(this));
    }.bind(this));
    result = result.then(function(resultUrl) { 
      console.log(name, resultUrl);
      if (resultUrl && this.isValidLink(resultUrl)) {
        megalink.addLink(resultUrl);
      }
      return this.getMegalink(url);
    }.bind(this));
    this.megalinks.push(megalink);

    all = all.then(function() { return result; });
  }.bind(this));

  return all;
};

/*
 * Get megalink from keeplink url
 */
KeeplinkScraper.prototype.getMegalink = function(url) {
  var deferred = Q.defer();

  var phantom = spawn('/home/pi/phantomjs', ['/home/pi/megalinks/phantom_scripts/keeplink.js', url]);

  phantom.stdout.on('data', function(data) {
    if (this.isValidLink(data.toString())) {

      // A valid megalink
      console.log(data.toString(), url);
      deferred.resolve(data.toString());
    } else {

      // It may still be a short link
      //console.log(data.toString());
      //this.getRedirect(data.toString()).done(function(url) {
      //  if (url) {
      //    deferred.resolve(url);
      //  }
      //});
      deferred.resolve();
    }
  }.bind(this));

  phantom.stderr.on('data', function(e) { 
    // TODO
  });
  return deferred.promise;
};

/*
 * Get redirect location from short-link headers
 */
KeeplinkScraper.prototype.getRedirect = function(uri) {
  var deferred = Q.defer();
  var options = { 
    uri: uri, 
    followRedirect: false 
  };
  request.head(options, function(err, res, body) { 
    if (err) {
      console.log(err);
      deferred.reject(err);
    }
    var url = res.headers.location;
    if (!url) {
      deferred.resolve();
    } else {
      if (this.isValidLink(url)) {
        // TODO
        deferred.resolve(url);
      } else {
        deferred.resolve();
      }
    }
  }.bind(this));
  return deferred.promise;
};

module.exports = KeeplinkScraper;
