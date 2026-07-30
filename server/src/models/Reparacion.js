'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Reparacion = sequelize.define(
  'Reparacion',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_caja: { type: DataTypes.INTEGER, allowNull: false },
    fecha_ingreso: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    fecha_egreso: { type: DataTypes.DATEONLY, allowNull: true },
    tecnico: { type: DataTypes.STRING(100), allowNull: true },
    falla_declarada: { type: DataTypes.TEXT, allowNull: true },
    diagnostico_tecnico: { type: DataTypes.TEXT, allowNull: true },
    estado: {
      type: DataTypes.STRING(30),
      defaultValue: 'ingresada',
      validate: {
        isIn: [['ingresada', 'presupuestada', 'aprobada', 'terminada', 'entregada', 'rechazada']],
      },
    },
    observaciones_finales: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'reparaciones',
    timestamps: false,
  }
);

module.exports = Reparacion;
