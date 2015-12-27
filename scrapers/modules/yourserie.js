/*
 * yourserie.js
 * Get links from yourserie
 */

var Scraper = require('../scraper.js');
var KeeplinkScraper = require('../modules/keeplinks.js');
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
    .then(this.explore.bind(this), function(e) {
      console.trace();
      console.log(e);
    }.bind(this))
    .then(this.phantom.bind(this), function(e) {
      console.trace();
      console.log(e);
    }.bind(this))
    .then(function() {
      console.log('final step', this);
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

        var links = $(this).find('a').filter(function(i, el) { 
          return $(this).text().trim() === 'MEGA'; 
        }); 
        links.slice(0,1).each(function(i, el) {
          var href = $(this).attr('href');
          if (href) {
            _this.addLink(name, href);
          }
        });

      })
      console.log(_this);
      deferred.resolve();
    } catch(e) {
      console.trace();
      console.log(e);
    }
  }.bind(this));
  return deferred.promise;
};

/*
 * Use phantomjs to better scrape page
 * NOTE: Purposefully synchronous. Running a lot of phantomjs processes at once
 *       is intensive. May want to add some batching later.
 */
YourserieScraper.prototype.phantom = function() {
  var _this = this;
  var result;
  Object.keys(this.megalinks).forEach(function(name) {
    var keeplinks = _this.megalinks[name].toPhantom;

    while (keeplinks.length) {
      if (!result) {
        result = Q(keeplinks.pop());
      } else {
        var nextLink = keeplinks.pop();
      }
      result = result.then(function(link) {
        link = link || nextLink;
        return _this.keeplinkScraper.getMegalink(link).then(function(link) {
          if (link) {
            _this.addLink(name, link);
          }
        });
      });
    }
  });

  return result;
};

YourserieScraper.prototype.explore = function() {
  var _this = this;

  var deferreds = [];
  Object.keys(this.megalinks).forEach(function(name) {
    var toExplore = _this.megalinks[name].toExplore;
    console.log('toExplore', name, toExplore);

    // XXX Remove from list here. Could treat toExplore as queue/stack
    toExplore.forEach(function(link) {
      deferreds.push(_this.getRedirect(link).then(function(redirectUrl) {
        console.log('from redirect', name, redirectUrl);
        _this.addLink(name, redirectUrl);
      }));
    });
  });
  return Q.all(deferreds);
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
    console.log('redirect', redirectUrl);
    if (!redirectUrl) {
      deferred.resolve();
    } else {
      deferred.resolve(redirectUrl);
    }
  }.bind(this));
  return deferred.promise;
};

YourserieScraper.prototype.shouldUsePhantom = function(href) {
  console.log('phant check', href);
  if (href.indexOf('keeplink') > -1) {
    return true;
  } else {
    return false;
  }
};

YourserieScraper.prototype.shouldExplore = function(href) {
  var urlObj = url.parse(href);
  if (urlObj.host === 'sh.st') {
    return true;
  }
  return false;
};

module.exports = YourserieScraper;
