'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ItemPresupuesto = sequelize.define(
  'ItemPresupuesto',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_reparacion: { type: DataTypes.INTEGER, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, defaultValue: 1 },
    precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    observacion: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: 'items_presupuesto',
    timestamps: false,
  }
);

module.exports = ItemPresupuesto;
