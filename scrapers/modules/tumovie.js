/*
 * tumovie.js
 * Get links from tumovie 
 */

var YourserieScraper = require('../modules/yourserie.js');
var util = require('util');

var TumovieScraper = function(searchTerm, start, end) {
  YourserieScraper.apply(this, arguments);

  this.baseUrl = 'http://www.tumovie.net/';
};
util.inherits(TumovieScraper, YourserieScraper);

module.exports = TumovieScraper;
