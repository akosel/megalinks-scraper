/*
 * tumovie.js
 * Get links from tumovie 
 * WARNING: THIS DOESN'T WORK AFTER THE CHANGES MADE ON 12/30/2015
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
