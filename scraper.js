#!/usr/bin/env node
var program = require('commander');
var store = require('./models/store');


program
  .version('0.0.1')
  .option('-s, --search-term [value]', 'Scrape links from search result')
  .option('-t, --type [type]', 'Scraper type. Defaults to reddit.', 'reddit')
  .option('-a, --run-all', 'Run all scrapers.')
  .option('--start [n]', 'Page Start', parseInt)
  .option('--end [n]', 'Page End', parseInt)
  .parse(process.argv);

var Scraper = require('./scrapers/modules/' + program.type);

console.log(program);
var searchTerm = program.searchTerm ? program.searchTerm : undefined;
var scraper = new Scraper(searchTerm, program.start || 1, program.end || program.start + 1);
scraper.scrape().then(function() {
  console.log('Scrape complete', scraper.megalinks);
  scraper.save();
}, function(e) {
  console.log(e); 
});
