const { z } = require('zod');
const {
  Reparacion,
  Caja,
  Cliente,
  ItemPresupuesto,
  ItemReparado,
  Foto,
} = require('../models');

const createSchema = z.object({
  id_caja: z.number().int(),
  fecha_ingreso: z.string().optional(),
  tecnico: z.string().optional().nullable(),
  falla_declarada: z.string().optional().nullable(),
});

const updateSchema = z.object({
  fecha_ingreso: z.string().optional().nullable(),
  fecha_egreso: z.string().optional().nullable(),
  tecnico: z.string().optional().nullable(),
  falla_declarada: z.string().optional().nullable(),
  diagnostico_tecnico: z.string().optional().nullable(),
  estado: z.enum(['ingresada','presupuestada','aprobada','terminada','entregada','rechazada']).optional(),
  observaciones_finales: z.string().optional().nullable(),
});

const create = async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const reparacion = await Reparacion.create({
      id_caja: data.id_caja,
      fecha_ingreso: data.fecha_ingreso || new Date().toISOString().split('T')[0],
      tecnico: data.tecnico,
      falla_declarada: data.falla_declarada,
    });
    res.status(201).json({ ok: true, data: reparacion });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reparacion = await Reparacion.findByPk(id, {
      include: [
        {
          association: 'caja',
          attributes: ['numero_serie', 'tipo_vehiculo', 'marca', 'modelo'],
          include: [
            {
              association: 'cliente',
              attributes: ['id', 'nombre', 'empresa', 'telefono', 'email'],
            },
          ],
        },
      ],
    });
    if (!reparacion) return res.status(404).json({ ok: false, error: 'Reparación no encontrada' });

    const [items_presupuesto, items_reparados, fotos] = await Promise.all([
      ItemPresupuesto.findAll({ where: { id_reparacion: id }, order: [['id', 'ASC']] }),
      ItemReparado.findAll({ where: { id_reparacion: id }, order: [['id', 'ASC']] }),
      Foto.findAll({ where: { id_reparacion: id }, order: [['fecha_subida', 'ASC']] }),
    ]);

    // Aplanar caja + cliente al mismo formato que devolvía el JOIN original.
    const json = reparacion.toJSON();
    const caja = json.caja || {};
    const cliente = caja.cliente || {};
    delete json.caja;

    res.json({
      ok: true,
      data: {
        ...json,
        numero_serie: caja.numero_serie ?? null,
        tipo_vehiculo: caja.tipo_vehiculo ?? null,
        marca: caja.marca ?? null,
        modelo: caja.modelo ?? null,
        id_cliente: cliente.id ?? null,
        cliente_nombre: cliente.nombre ?? null,
        cliente_empresa: cliente.empresa ?? null,
        cliente_telefono: cliente.telefono ?? null,
        cliente_email: cliente.email ?? null,
        items_presupuesto,
        items_reparados,
        fotos,
      },
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateSchema.parse(req.body);
    const fields = Object.keys(data).filter((k) => data[k] !== undefined);
    if (fields.length === 0) return res.status(400).json({ ok: false, error: 'Sin campos' });

    const reparacion = await Reparacion.findByPk(id);
    if (!reparacion) return res.status(404).json({ ok: false, error: 'Reparación no encontrada' });

    const updates = {};
    fields.forEach((f) => { updates[f] = data[f]; });
    await reparacion.update(updates);
    res.json({ ok: true, data: reparacion });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Borrado en cascada manual (no hay ON DELETE CASCADE en el schema).
    await Foto.destroy({ where: { id_reparacion: id } });
    await ItemPresupuesto.destroy({ where: { id_reparacion: id } });
    await ItemReparado.destroy({ where: { id_reparacion: id } });
    const deleted = await Reparacion.destroy({ where: { id } });
    if (deleted === 0) return res.status(404).json({ ok: false, error: 'Reparación no encontrada' });
    res.json({ ok: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

const porEstado = async (req, res, next) => {
  try {
    const estado = req.query.estado || 'ingresada';
    const reparaciones = await Reparacion.findAll({
      where: { estado },
      attributes: ['id', 'estado', 'fecha_ingreso', 'tecnico'],
      order: [['created_at', 'DESC']],
      include: [
        {
          association: 'caja',
          attributes: ['numero_serie', 'marca', 'modelo'],
          include: [{ association: 'cliente', attributes: ['nombre'] }],
        },
      ],
    });

    const data = reparaciones.map((r) => {
      const json = r.toJSON();
      const caja = json.caja || {};
      const cliente = caja.cliente || {};
      delete json.caja;
      return {
        ...json,
        numero_serie: caja.numero_serie ?? null,
        marca: caja.marca ?? null,
        modelo: caja.modelo ?? null,
        cliente_nombre: cliente.nombre ?? null,
      };
    });

    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getById, update, remove, porEstado };
