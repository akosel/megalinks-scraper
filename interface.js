process.stdin.resume();
process.stdin.setEncoding('utf8');
var spawn = require('child_process').spawn;
var util = require('util');
var fs   = require('fs');

//console.log('Running update');
//var update = spawn('node', ['/home/pi/megalinks/scraper.js']);

console.log('Hi, the following is a list of links scraped from /r/megalinks. To download, type the number next to the link');

var links = fs.readFileSync('./megalinks.json');
var linksObj = JSON.parse(links);

var text = Object.keys(linksObj);
var options = [];
var i = 0;
text.forEach(function(t) {
  var active = linksObj[t];
  if (active.length) {
    console.log(['[' + i + ']', t, linksObj[t]].join('\t'));
    options.push(linksObj[t]);
    i += 1;
  }
});

process.stdin.on('data', function (text) {
  console.log('received data:', util.inspect(text));
  var choice = Number(text);
  if (choice && choice < options.length) {
    var link = options[choice]
    console.log(link);
    var megadl = spawn("/home/pi/megatools/megadl", ['--path=/home/pi/usbdrv', link[0]])
    megadl.stdout.on('data', function(data) {
      //console.log(data.toString());
    });
    megadl.stderr.on('data', function(data) {
      console.log(data.toString());
    });
    megadl.on('close', function(data) {
      console.log('All done! :)');
    });
  } else if (choice && choice >= options.length) {
    console.log('Choice is out of range. Please enter one of the numbers listed.');
  }
      
  if (text === 'q\n') {
    done();
  }
});

function done() {
  console.log('Now that process.stdin is paused, there is nothing more to do.');
  process.exit();
}
