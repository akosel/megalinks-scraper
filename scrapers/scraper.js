/*
 * scraper.js
 * Scraping tool for finding megalinks
 */

var request = require("request");
var cheerio = require("cheerio");
var Megalink = require('../models/megalink');
var url = require('url');
var store = require('../models/store');

var Scraper = function(url) {
  this.baseUrl = url;
  this.megalinks = {};
};

/*
 * Saves scraper megalinks to store
 */
Scraper.prototype.save = function() {
  console.log('Saving', this.megalinks);
  Object.keys(this.megalinks).forEach(function(name) {
    var toSave = this.megalinks[name].toSave;
    var megalink = new Megalink(name, toSave);
    store.add(megalink);
  }.bind(this));

  store.save();
};

/*
 * Return false by default. May be implemented by child.
 */
Scraper.prototype.shouldUsePhantom = function(href) {
  return false;
};

/*
 * Return false by default. May be implemented by child.
 */
Scraper.prototype.shouldExplore = function(href) {
  return false;
};

Scraper.prototype.addLink = function(name, href) {
  console.log('Adding lint', href);
  if (!this.megalinks[name]) {
    this.megalinks[name] = { toExplore: [], toPhantom: [], toSave: [] };
  }

  if (this.isValidLink(href)) {
    this.megalinks[name].toSave.push(href);
  } else if (this.shouldUsePhantom(href)) {
    this.megalinks[name].toPhantom.push(href);
  } else if (this.shouldExplore(href)) {
    this.megalinks[name].toExplore.push(href);
  } else {
    console.log('No action for this link');
  }
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
