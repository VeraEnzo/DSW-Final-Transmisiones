'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Cliente = sequelize.define(
  'Cliente',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(150), allowNull: false },
    empresa: { type: DataTypes.STRING(150), allowNull: true },
    telefono: { type: DataTypes.STRING(30), allowNull: true },
    email: { type: DataTypes.STRING(150), allowNull: true },
    cuit: { type: DataTypes.STRING(20), allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'clientes',
    timestamps: false,
  }
);

module.exports = Cliente;
