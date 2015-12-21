#!/usr/bin/env node
var program = require('commander');
var store = require('./models/store');


program
  .version('0.0.1')
  .option('-s, --search-term [value]', 'Scrape links from search result')
  .option('-t, --type [type]', 'Scraper type. Defaults to reddit.', 'reddit')
  .parse(process.argv);

var Scraper = require('./scrapers/modules/' + program.type);

var searchTerm = program.searchTerm ? program.searchTerm : undefined;
var scraper = new Scraper(searchTerm);
scraper.scrape().then(function() {
  console.log('Scrape complete', scraper.megalinks);
  scraper.megalinks.forEach(function(megalink) {
    store.add(megalink); 
  });
  store.save();
}, function(e) {
  console.log(e); 
});
