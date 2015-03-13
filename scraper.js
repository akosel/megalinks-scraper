var util = require('./util.js')('/home/pi/megalinks/megalinks.json');
util.readCollection();

var url = process.argv[2] ? util.getSearchQuery(process.argv[2]) : 'http://www.reddit.com/r/megalinks';
console.log(url);
util.getMegalinks(url);
