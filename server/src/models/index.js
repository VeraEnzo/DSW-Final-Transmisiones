'use strict';

// Punto central de los modelos: registra las asociaciones entre entidades
// y reexporta todo junto con la instancia de Sequelize.
const sequelize = require('../config/sequelize');

const Usuario = require('./Usuario');
const Cliente = require('./Cliente');
const Caja = require('./Caja');
const Reparacion = require('./Reparacion');
const ItemPresupuesto = require('./ItemPresupuesto');
const ItemReparado = require('./ItemReparado');
const Foto = require('./Foto');
const SolicitudReset = require('./SolicitudReset');

// ── Asociaciones ───────────────────────────────────────────────────────────

// Cliente 1—N Caja
Cliente.hasMany(Caja, { foreignKey: 'id_cliente', as: 'cajas' });
Caja.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });

// Caja 1—N Reparacion
Caja.hasMany(Reparacion, { foreignKey: 'id_caja', as: 'reparaciones' });
Reparacion.belongsTo(Caja, { foreignKey: 'id_caja', as: 'caja' });

// Reparacion 1—N ItemPresupuesto
Reparacion.hasMany(ItemPresupuesto, { foreignKey: 'id_reparacion', as: 'items_presupuesto' });
ItemPresupuesto.belongsTo(Reparacion, { foreignKey: 'id_reparacion', as: 'reparacion' });

// Reparacion 1—N ItemReparado
Reparacion.hasMany(ItemReparado, { foreignKey: 'id_reparacion', as: 'items_reparados' });
ItemReparado.belongsTo(Reparacion, { foreignKey: 'id_reparacion', as: 'reparacion' });

// Reparacion 1—N Foto
Reparacion.hasMany(Foto, { foreignKey: 'id_reparacion', as: 'fotos' });
Foto.belongsTo(Reparacion, { foreignKey: 'id_reparacion', as: 'reparacion' });

// Usuario 1—N SolicitudReset
Usuario.hasMany(SolicitudReset, { foreignKey: 'id_usuario', as: 'solicitudes_reset' });
SolicitudReset.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

module.exports = {
  sequelize,
  Usuario,
  Cliente,
  Caja,
  Reparacion,
  ItemPresupuesto,
  ItemReparado,
  Foto,
  SolicitudReset,
};
