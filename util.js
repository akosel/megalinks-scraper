var request = require("request");
var cheerio = require("cheerio");
var url = require('url');
var fs  = require('fs');


module.exports = function(path) {
  var path = path || '/tmp/megalinks.json';
  return {
    isGoodHref: function(href) {
      var urlObj;
      if (href) {
        try {
          urlObj = url.parse(href);
        } catch(e) {
          console.log('Error: ', e);
        }
      }
      if (urlObj && (urlObj.host === 'mega.co.nz' || urlObj.host === 'mega.nz')) {
        console.log('Grabbing href', href);
        return true;
      }
      return false;
    },

    readCollection: function() {
      // if we have a file to work with, use it
      try {
        var previousMegaLinks = fs.readFileSync(path);
        this.collection = JSON.parse(previousMegaLinks);
      } catch(e) {
        this.collection = {};
      } 
    },

    writeCollection: function() {
      // Sanity check to avoid data loss
      if (!Object.keys(this.collection).length) {
        console.log('ERROR: The self.collection does not seem to have anything in it. Not writing to file to avoid overwriting.');
        return;
      }
      fs.writeFile(path, JSON.stringify(this.collection), function(err) {
        if (err) throw err;
        console.log('File saved!');
      });
    },

    getSearchQuery: function(movie) {
      var movieStr = movie.split(' ').join('+');
      var url = ['http://www.reddit.com/r/megalinks/search?restrict_sr=on&q=', movieStr].join('');

      return url;
    },

    getMegalinks: function(url) {
      var self = this;
      request(url, function(err, response, body) {
        var newLinks = [];
        var newTexts = [];
        try {
          var $ = cheerio.load(body);
          $('a.title').each(function(a, el) {
            var newHref = $(this).attr('href');
            var text = $(this).text();
            if (self.isGoodHref(newHref)) {
              self.collection[text] = newHref;
            } else {
              newLinks.push('http://www.reddit.com' + newHref);
              newTexts.push($(this).text());
            }
          });
        } catch(e) {
          console.log('Error: ', e);
        }

        if (newLinks.length) {
          self.getAll(newLinks, newTexts);
        }
      });
    },

    getAll: function(links, text) {
      var self = this;
      if (!links.length) {
        console.log('Empty list. Noop.');
        return;
      }

      var key = text.pop();
      if (Object.keys(self.collection).indexOf(key) > -1) {
        console.log('Updating: ', key);
      } else {
        console.log('Found something new: ', key);
      }

      request(links.pop(), function(err, response, body) {
        var newMegaLinks = [];
        if (self.isGoodHref(this.href)) {
          newMegaLinks.push(this.href);
        } else {

          try {
            var $ = cheerio.load(body);
            $('a').each(function(a, el) {
              var newHref = $(this).attr('href');
              if (self.isGoodHref(newHref)) {
                newMegaLinks.push(newHref);
              }
            });

            var re = /mega:#![\w\!-]+/;
            $('p').each(function(p, el) {
              var text = $(this).text();
              if (text.match(re)) {
                var megaTag = text.match(re)[0];
                link = megaTag.replace(/mega:/, "https://mega.co.nz/");
                newMegaLinks.push(link);
              }
            });

          } catch(e) {
            console.log('Error: ', e);
          }

          self.collection[key] = newMegaLinks;
        } 
        if (links.length) {
          self.getAll(links, text);
        } else {
          self.writeCollection();
        } 
        
      });
    }
  };
};
