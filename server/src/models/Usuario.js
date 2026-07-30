'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Usuario = sequelize.define(
  'Usuario',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.TEXT, allowNull: false },
    rol: {
      type: DataTypes.STRING(20),
      defaultValue: 'tecnico',
      validate: { isIn: [['admin', 'tecnico']] },
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'usuarios',
    timestamps: false,
  }
);

module.exports = Usuario;
