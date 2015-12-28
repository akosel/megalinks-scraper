/*
 * megalink.js
 * Megalink: name and valid mega url
 */
var spawn = require('child_process').spawn;
var fs = require('fs');
var out = fs.openSync('/tmp/out.log', 'a');
var err = fs.openSync('/tmp/out.log', 'a');

var Megalink = function(name, links, src) {
  this.name = name;

  if (typeof(links) === 'string') {
    links = [links];
  }
  this.links = links || [];
  this.src = src;
};

Megalink.prototype.get = function() {
  return { name: this.name, links: this.links, src: this.src };
};

Megalink.prototype.set = function(obj) {
  this.name = obj.name ? obj.name : this.name;
  this.links = obj.links ? obj.links : this.links;
  this.src = obj.src ? obj.src : this.src;
};

Megalink.prototype.addLink = function(link) {
  this.links.push(link);
};

Megalink.prototype.validate = function() {
  var isValid = true;

  isValid = this.links.every(function(link) {
    return this.isValidLink(link); 
  }.bind(this));

  isValid = typeof(this.name) === 'string';

  return isValid;
};

Megalink.prototype.isValidLink = function(href) {
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

Megalink.prototype.fetch = function() {
  // TODO Should retrieve a specific megalink
};

Megalink.prototype.save = function() {
  // TODO Should update the collection
};

/*
 * Attempts to download from megalink links
 */
Megalink.prototype.download = function() {
  this.links.forEach(function(link) {  
    var megadl = spawn("megadl", ['--path=/media/exthd', link], [], { detached: true, stdio: ['ignore', out, err] }); 

    megadl.stdout.on('data', function(data) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(data.toString());
    });
    megadl.stderr.on('data', function(data) {
      console.error(data.toString());
    });
    megadl.on('close', function(data) {
      console.log('All done! :)');
    });
  });
};

module.exports = Megalink;
