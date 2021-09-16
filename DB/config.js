const { Sequelize } = require('sequelize');

require('dotenv').config();

exports.sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
  });


  