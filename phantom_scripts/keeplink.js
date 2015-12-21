/*
 * keeplink.js
 * Get megalink from keeplink
 */
var page = require('webpage').create();
var system = require('system');
var args = system.args;

var url;
if (args && args.length <= 1) {
  console.log('No url provided. Exiting...');
  phantom.exit();
} else {
  url = args[1];
  //console.log(url);
  main(url);
}

function main(url) {
  page.open(url, function(status) {
    var ua = page.evaluate(function() {
      var form = document.querySelector('#frmprotect');
      form.onsubmit = '';
      form.submit();
      return form.innerHTML;
    });
  });

  // Wait until page load and then return link
  var loaded;
  page.onLoadFinished = function(status) {
    loaded = true;
  };
  var id = setInterval(function() {
    if (loaded === true) {
      var link = page.evaluate(function() {
        if (document.querySelector('a.live')) {
          return document.querySelector('a.live').href;
        }
      });
      if (link) {
        console.log(link);
        clearInterval(id);
        phantom.exit();
      }
    }
  }, 1000);
}
