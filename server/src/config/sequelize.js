'use strict';

const { Sequelize } = require('sequelize');

// Instancia única de Sequelize: ORM usado por todos los controllers.
// Misma DATABASE_URL y misma lógica SSL condicional que el pool de pg
// (config/db.js), que queda reservado para el script de seed.
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions:
    process.env.NODE_ENV === 'production'
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
});

module.exports = sequelize;
