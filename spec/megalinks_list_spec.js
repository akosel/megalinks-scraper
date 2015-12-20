var MegalinkList = require('../models/megalink_list');
var fs = require('fs');


describe('Initialize', function() {
  var path = '/tmp/test.json';
  var list = new MegalinkList(path);
  
  it('should have same path', function() {
    expect(list.path).toEqual(path);
  });
});

describe('First time opening file', function() {
  var path = '/tmp/test.json';
  var list = new MegalinkList(path);
  list.fetch();
  
  it('should equal empty object', function() {
    expect(list.collection).toEqual({});
  });
});

describe('Adding megalink', function() {
  var path = '/tmp/test.json';
  var list = new MegalinkList(path);
  list.fetch();
  list.add({
    name: 'test',
    links: []
  });
  
  it('should have a megalink in collection', function() {
    expect(list.collection).toEqual({ test: [] });
  });
});

describe('Saving megalink', function() {
  var path = '/tmp/test.json';
  var list = new MegalinkList(path);
  list.fetch();
  list.add({
    name: 'test',
    links: []
  });
  list.save();

  it('should have written a file', function() {
    expect(fs.readFileSync(path)).toBeTruthy();    
  });

  it('should reload same file', function() {
    var newList = new MegalinkList(path);
    newList.fetch();
    expect(newList.collection).toEqual({ test: [] });
    fs.unlinkSync(path);
  });
});
