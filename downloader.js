#!/usr/bin/env node
var program = require('commander');
var store = require('./models/store');
var Megalink = require('./models/megalink');
process.stdin.resume();
process.stdin.setEncoding('utf8');

program
  .version('0.0.1')
  .option('-l, --link [value]', 'A particular megalink')
  .parse(process.argv);

var megalinks = []; 

if (!program.link) {
  Object.keys(store.collection).forEach(function(name, i) {
    var links = store.collection[name];
    var megalink = new Megalink(name, links); 
    if (links && links.length) {
      console.log(megalinks.length, megalink.name);
      megalinks.push(megalink);
    }
  });

  process.stdin.on('data', function (text) {

    var number = Number(text);
    if (number && number > 0 && number < megalinks.length) {
      var megalink = megalinks[number];
      console.log('Downloading', megalink.name);
      megalinks[number].download();
    }
    if (text === 'q\n') {
      console.log('See ya\n');
      process.exit();
    }

  });
} else {
  var megalink = new Megalink(program.link, program.link);
  console.log('Downloading', program.link);
  megalink.download();
}
