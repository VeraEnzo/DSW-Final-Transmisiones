const { z } = require('zod');
const { Op } = require('sequelize');
const { Caja, Cliente, Reparacion, sequelize } = require('../models');

const cajaSchema = z.object({
  numero_serie: z.string().min(1),
  tipo_vehiculo: z.enum(['camion', 'colectivo', 'tractor', 'pulverizadora', 'otro']).optional().nullable(),
  marca: z.string().optional().nullable(),
  modelo: z.string().optional().nullable(),
  id_cliente: z.number().int().optional().nullable(),
  observaciones_generales: z.string().optional().nullable(),
});

// Subqueries de total de reparaciones y último estado (reutilizadas en list).
const cajaExtraAttributes = [
  [
    sequelize.literal('(SELECT COUNT(*) FROM reparaciones r WHERE r.id_caja = "Caja".id)'),
    'total_reparaciones',
  ],
  [
    sequelize.literal(
      '(SELECT estado FROM reparaciones r WHERE r.id_caja = "Caja".id ORDER BY created_at DESC LIMIT 1)'
    ),
    'ultimo_estado',
  ],
];

// Aplana el cliente incluido a cliente_nombre / cliente_empresa (forma original).
function flattenCliente(caja, extra = {}) {
  const json = caja.toJSON();
  const cliente = json.cliente || null;
  delete json.cliente;
  return {
    ...json,
    cliente_nombre: cliente ? cliente.nombre : null,
    cliente_empresa: cliente ? cliente.empresa : null,
    ...extra,
  };
}

const list = async (req, res, next) => {
  try {
    const { numero_serie, id_cliente, tipo_vehiculo } = req.query;
    const where = {};
    if (numero_serie) where.numero_serie = { [Op.iLike]: `%${numero_serie}%` };
    if (id_cliente) where.id_cliente = id_cliente;
    if (tipo_vehiculo) where.tipo_vehiculo = tipo_vehiculo;

    const cajas = await Caja.findAll({
      where,
      order: [['created_at', 'DESC']],
      attributes: { include: cajaExtraAttributes },
      include: [{ association: 'cliente', attributes: ['nombre', 'empresa'] }],
    });

    res.json({ ok: true, data: cajas.map((c) => flattenCliente(c)) });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = cajaSchema.parse(req.body);
    const caja = await Caja.create(data);
    res.status(201).json({ ok: true, data: caja });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const caja = await Caja.findByPk(id, {
      include: [
        { association: 'cliente', attributes: ['nombre', 'empresa', 'telefono', 'email'] },
      ],
    });
    if (!caja) return res.status(404).json({ ok: false, error: 'Caja no encontrada' });

    const reparaciones = await Reparacion.findAll({
      where: { id_caja: id },
      order: [['created_at', 'DESC']],
    });

    const json = caja.toJSON();
    const cliente = json.cliente || null;
    delete json.cliente;
    res.json({
      ok: true,
      data: {
        ...json,
        cliente_nombre: cliente ? cliente.nombre : null,
        cliente_empresa: cliente ? cliente.empresa : null,
        cliente_telefono: cliente ? cliente.telefono : null,
        cliente_email: cliente ? cliente.email : null,
        reparaciones,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getBySerie = async (req, res, next) => {
  try {
    const { numero_serie } = req.params;
    const caja = await Caja.findOne({
      where: { numero_serie },
      include: [{ association: 'cliente', attributes: ['nombre', 'empresa'] }],
    });
    if (!caja) return res.status(404).json({ ok: false, error: 'Caja no encontrada' });
    res.json({ ok: true, data: flattenCliente(caja) });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = cajaSchema.partial().parse(req.body);
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ ok: false, error: 'Sin campos' });
    }

    const caja = await Caja.findByPk(id);
    if (!caja) return res.status(404).json({ ok: false, error: 'Caja no encontrada' });

    await caja.update(data);
    res.json({ ok: true, data: caja });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const repsCount = await Reparacion.count({ where: { id_caja: id } });
    if (repsCount > 0) {
      return res.status(409).json({ ok: false, error: 'No se puede eliminar: la caja tiene reparaciones asociadas' });
    }
    const deleted = await Caja.destroy({ where: { id } });
    if (deleted === 0) return res.status(404).json({ ok: false, error: 'Caja no encontrada' });
    res.json({ ok: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, getById, getBySerie, update, remove };
