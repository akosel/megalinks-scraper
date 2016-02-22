/*
 * store.js
 * Singleton data store for the application
 */
var MegalinkList = require('./megalink_list');

var store = new MegalinkList(process.env.MEGALINK_PATH);
store.fetch();

module.exports = store;
