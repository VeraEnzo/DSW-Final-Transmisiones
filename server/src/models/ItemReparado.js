'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ItemReparado = sequelize.define(
  'ItemReparado',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_reparacion: { type: DataTypes.INTEGER, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, defaultValue: 1 },
    observacion: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: 'items_reparados',
    timestamps: false,
  }
);

module.exports = ItemReparado;
