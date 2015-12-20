/*
 * store.js
 * Singleton data store for the application
 */
var MegalinkList = require('./megalink_list');

var store = new MegalinkList('/home/pi/megalinks/megalinks.json');
store.fetch();

module.exports = store;
