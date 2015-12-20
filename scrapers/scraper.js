/*
 * scraper.js
 * Scraping tool for finding megalinks
 */

var request = require("request");
var cheerio = require("cheerio");
var url = require('url');
var store = require('../models/store');

var Scraper = function(url) {
  this.baseUrl = url;
  this.megalinks = [];
};

/*
 * Saves scraper megalinks to store
 */
Scraper.prototype.save = function() {
  this.megalinks.forEach(function(megalink) {
    store.add(megalink);
  });

  store.save();
};

/*
 * Validates whether href is valid
 */
Scraper.prototype.isValidLink = function(href) {
  var urlObj;
  if (href) {
    try {
      urlObj = url.parse(href);
    } catch(e) {
      console.log('Parse Error: ', e);
    }
  }
  if (urlObj && (urlObj.host === 'mega.co.nz' || urlObj.host === 'mega.nz')) {
    console.log('Grabbing href', href);
    return true;
  }
  return false;
};

/*
 * Gathers megalinks
 */
Scraper.prototype.scrape = function() {
  // Implemented by child class
};

module.exports = Scraper;
