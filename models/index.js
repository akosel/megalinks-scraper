var Sequelize = require('sequelize');

var sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: '/media/exthd/test.db' 
});

var models = [
  'Megalink'
];

models.forEach(function(model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
});

module.exports.sequelize = sequelize;
