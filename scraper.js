var request = require("request");
var cheerio = require("cheerio");
var url = require('url');
var fs  = require('fs');

// if we have a file to work with, use it
try {
  var previousMegaLinks = fs.readFileSync('megalinks.json');
  collection = JSON.parse(previousMegaLinks);
} catch(e) {
  collection = {};

} 

function isGoodHref(href) {
  var urlObj;
  if (href) {
    urlObj = url.parse(href);
  }
  if (urlObj && urlObj.host === 'mega.co.nz') {
    console.log('Grabbing href', href);
    return true;
  }
  return false;
}

function writeCollection() {
  // Sanity check to avoid data loss
  if (!Object.keys(collection).length) {
    console.log('ERROR: The collection does not seem to have anything in it. Not writing to file to avoid overwriting.');
    return;
  }
  fs.writeFile('megalinks.json', JSON.stringify(collection), function(err) {
    if (err) throw err;
    console.log('File saved!');
  });
}

function getAll(links, text) {
  if (!links.length) {
    console.log('Empty list. Noop.');
    return;
  }

  var key = text.pop();
  if (Object.keys(collection).indexOf(key) > -1) {
    console.log('updating: ', key);
  } else {
    console.log('found something new: ', key);
  }

  request(links.pop(), function(err, response, body) {
    var newMegaLinks = [];
    console.log(this.href);
    if (isGoodHref(this.href)) {
      newMegaLinks.push([this.href]);
    } else {

      var $ = cheerio.load(body);
      $('a').each(function(a, el) {
        var newHref = $(this).attr('href');
        if (isGoodHref(newHref)) {
          newMegaLinks.push(newHref);
        }
      });

    }

    collection[key] = newMegaLinks;
    if (links.length) {
      getAll(links, text);
    } else {
      writeCollection();
    } 
    
  });
}

request("https://www.kimonolabs.com/api/cu120lfy?apikey=6c54a2b70184eb0cd3bb5fd61ed2da74", function(err, response, json) {
  var resp = JSON.parse(json);
  var hrefs = resp.results.collection1.map(function(v) { return v.property1.href; });
  var text = resp.results.collection1.map(function(v) { return v.property1.text; });

  getAll(hrefs.reverse(), text.reverse());
});
