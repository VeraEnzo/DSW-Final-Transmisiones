'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Foto = sequelize.define(
  'Foto',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_reparacion: { type: DataTypes.INTEGER, allowNull: false },
    url_cloudinary: { type: DataTypes.TEXT, allowNull: false },
    public_id_cloudinary: { type: DataTypes.TEXT, allowNull: true },
    etiqueta: {
      type: DataTypes.STRING(30),
      allowNull: true,
      validate: { isIn: [['ingreso', 'proceso', 'terminado', 'detalle_falla']] },
    },
    fecha_subida: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'fotos',
    timestamps: false,
  }
);

module.exports = Foto;
