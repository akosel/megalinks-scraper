/*
 * reddit.js
 * Module for grabbing megalinks from /r/megalinks
 *
 */

var Scraper = require('../scraper.js');
var util = require('util');
var request = require("request");
var cheerio = require("cheerio");
var url = require('url');
var Q = require('q');

var RedditScraper = function(searchTerm) {

  Scraper.apply(this);
  
  this.baseUrl = 'http://www.reddit.com/'
  this.searchTerm = searchTerm;
};
util.inherits(RedditScraper, Scraper);

/*
 * Use reddit search to only look for links matching a search term
 */
RedditScraper.prototype.getSearchUrl = function() {
  return this.baseUrl + 'r/megalinks/search?restrict_sr=on&q=' + this.searchTerm; 
};

/*
 * Set value
 */
RedditScraper.prototype.set = function(prop, value) {
  this[prop] = value;
};

/*
 * Finds megalinks on reddit pages
 */
RedditScraper.prototype.scrape = function() {
  return this.topLevelScrape().then(this.commentsPageScrape.bind(this), function(e) {
        // TODO Improve error handling
        console.log(e);
      });
};

/*
 * Finds all valid megalinks and queues comment page links 
 */
RedditScraper.prototype.topLevelScrape = function() {
  var _this = this;
  var deferred = Q.defer();
  var url = this.searchTerm ? this.getSearchUrl() : this.baseUrl + 'r/megalinks'; 
  request(url, function(err, response, body) {
    this.toExplore = {};
    try {
      var $ = cheerio.load(body);
      $('a.title,a.search-title').each(function(a, el) {
        var newHref = $(this).attr('href');
        var text = $(this).text();
        if (_this.isValidLink(newHref)) {
          _this.addLink(text, newHref);
        } else {
          var commentPageUrl = _this.baseUrl + newHref;
          _this.toExplore[commentPageUrl] = text;
        }
      });
      deferred.resolve();
    } catch(e) {
      console.trace();
      deferred.reject(e);
    }
  }.bind(this));

  return deferred.promise;
};

/*
 * Finds valid megalinks
 */
RedditScraper.prototype.commentsPageScrape = function() {
  var _this = this;

  var links = Object.keys(this.toExplore);

  var result = Q();
  links.forEach(function(link) {
    result = result.then(function() {
      var deferred = Q.defer();
      var name = _this.toExplore[link];

      request(link, function(err, response, body) {
        console.log('Requested', link);

        if (_this.isValidLink(this.href)) {
          _this.addLink(name, this.href);
        } else {

          try {
            var $ = cheerio.load(body);

            // Sometimes the links are links
            $('a').each(function(a, el) {
              var newHref = $(this).attr('href');
              if (_this.isValidLink(newHref)) {
                _this.addLink(name, newHref);
              }
            });

            // Sometimes the links are in plain text
            var re = /mega:#![\w\!-]+/;
            $('p').each(function(p, el) {
              var text = $(this).text();
              if (text.match(re)) {
                var megaTag = text.match(re)[0];
                link = megaTag.replace(/mega:/, "https://mega.co.nz/");
                _this.addLink(name, link);
              }
            });

          } catch(e) {
            console.log('Page Read Error: ', e);
          }

          deferred.resolve();
        } 
      });
      return deferred.promise;
    });
  });

  result.then(function() {
    deferred.resolve();
  });
    
  return result;
};

module.exports = RedditScraper;
