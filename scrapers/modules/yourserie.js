/*
 * yourserie.js
 * Get links from yourserie
 */

var Scraper = require('../scraper.js');
var KeeplinkScraper = require('../modules/keeplinks.js');
var Megalink = require('../../models/megalink');
var util = require('util');
var request = require("request");
var cheerio = require("cheerio");
var url = require('url');
var Q = require('q');
var spawn = require('child_process').spawn;

var YourserieScraper = function(searchTerm) {
  Scraper.apply(this);

  this.baseUrl = 'http://www.yourserie.com/';
  this.searchTerm = searchTerm; 
  this.keeplinkScraper = new KeeplinkScraper();
};
util.inherits(YourserieScraper, Scraper);

YourserieScraper.prototype.getSearchUrl = function() {
  return this.baseUrl + '?s=' + this.searchTerm + '&paged=1';
};
/*
 * Add megalinks 
 */
YourserieScraper.prototype.scrape = function() {
  return this.topLevelScrape()
    .then(function() {
      console.log('Adding keeplinks');
      return this.keeplinkScraper.scrape();
    }.bind(this), function(e) {
      console.trace();
      console.log(e);
    }.bind(this))
    .then(function() {
      console.log('Merging yourserie and keeplink lists');
      Array.prototype.push.apply(this.megalinks, this.keeplinkScraper.megalinks);
    }.bind(this));
};

/*
 * Gather links
 */
YourserieScraper.prototype.topLevelScrape = function() {
  var _this = this;

  var topUrl = this.searchTerm ? this.getSearchUrl() : this.baseUrl; 
  console.log(topUrl);

  var deferred = Q.defer();
  request(topUrl, function(err, response, body) {
    this.toExplore = {};
    var result = Q();
    try {
      var $ = cheerio.load(body);
      var els = $('.type-post').each(function(i, el) { 
        var name = $(this).find('.entry-title').text();
        var megalink = new Megalink(name, []);

        var links = $(this).find('a').filter(function(i, el) { 
          return $(this).text().trim() === 'MEGA'; 
        }); 
        links.slice(0,1).each(function(i, el) {
          var href = $(this).attr('href');
          console.log(name, href);

          result = result.then(function(redirectUrl) {
            console.log(redirectUrl);
            if (redirectUrl) {
              if (_this.isValidLink(redirectUrl)) {
                megalink.addLink(redirectUrl);
              } else if (_this.isKeeplink(redirectUrl)) {
                var parsedUrl = url.parse(redirectUrl);
                var hash = parsedUrl.pathname.split('/').slice(-1)[0];
                console.log(name, hash);
                _this.keeplinkScraper.addHash(name, hash);
              }
            }

            return _this.getRedirect(href);
          });

        });

        // May be one more in the pipe
        result.then(function(redirectUrl) {
          if (redirectUrl) {
            if (_this.isValidLink(redirectUrl)) {
              megalink.addLink(redirectUrl);
            } else if (_this.isKeeplink(redirectUrl)) {
              var parsedUrl = url.parse(redirectUrl);
              var hash = parsedUrl.pathname.split('/').slice(-1)[0];
                console.log(name, hash);
              _this.keeplinkScraper.addHash(name, hash);
            }
            _this.megalinks.push(megalink);
          }
          deferred.resolve();
        }.bind(this), function(e) {
          console.log(e); 
        }.bind(this));

      })
    } catch(e) {
      console.trace();
      console.log(e);
    }
  }.bind(this));
  return deferred.promise;
};

/*
 * Get redirect location from short-link headers
 */
YourserieScraper.prototype.getRedirect = function(uri) {
  var deferred = Q.defer();
  var options = { 
    uri: uri, 
    followRedirect: false 
  };
  request.head(options, function(err, res, body) { 
    if (err) {
      d.reject(err);
    }
    var redirectUrl = res.headers.location;
    if (!redirectUrl) {
      deferred.resolve();
    } else {
      deferred.resolve(redirectUrl);
    }
  }.bind(this));
  return deferred.promise;
};

module.exports = YourserieScraper;
