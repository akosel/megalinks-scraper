/*
 * tumovie.js
 * Get links from tumovie 
 */

var YourserieScraper = require('../modules/yourserie.js');
var util = require('util');

var TumovieScraper = function(searchTerm) {
  YourserieScraper.apply(this);

  this.baseUrl = 'http://www.tumovie.net/';
  this.searchTerm = searchTerm; 
};
util.inherits(TumovieScraper, YourserieScraper);

module.exports = TumovieScraper;
