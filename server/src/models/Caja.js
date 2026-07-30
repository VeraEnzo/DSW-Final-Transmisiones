'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Caja = sequelize.define(
  'Caja',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero_serie: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    tipo_vehiculo: {
      type: DataTypes.STRING(30),
      allowNull: true,
      validate: { isIn: [['camion', 'colectivo', 'tractor', 'pulverizadora', 'otro']] },
    },
    marca: { type: DataTypes.STRING(100), allowNull: true },
    modelo: { type: DataTypes.STRING(100), allowNull: true },
    id_cliente: { type: DataTypes.INTEGER, allowNull: true },
    observaciones_generales: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'cajas',
    timestamps: false,
  }
);

module.exports = Caja;
