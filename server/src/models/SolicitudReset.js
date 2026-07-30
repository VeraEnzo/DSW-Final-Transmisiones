'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const SolicitudReset = sequelize.define(
  'SolicitudReset',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_usuario: { type: DataTypes.INTEGER, allowNull: true },
    estado: {
      type: DataTypes.STRING(20),
      defaultValue: 'pendiente',
      validate: { isIn: [['pendiente', 'completada']] },
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'solicitudes_reset',
    timestamps: false,
  }
);

module.exports = SolicitudReset;
