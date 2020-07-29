let Sequelize = require('sequelize');
let appConfig = require('./appConfig');
let env       = appConfig.environment;
let dbConfig    = require('./dbConfig.json')[env];


console.log('Database Configuration:',dbConfig);
let sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

module.exports= sequelize;