var program = require('commander');

program
  .version('0.0.1')
  .option('-s, --search-term [value]', 'Scrape links from search result')
  .option('-t, --type [type]', 'Scraper type. Defaults to reddit.', 'reddit')
  .parse(process.argv);

var Scraper = require('./scrapers/modules/' + program.type);

var scraper = new Scraper();
scraper.scrape().then(function() {
  console.log(scraper.megalinks);
}, function(e) {
  console.log(e); 
});
