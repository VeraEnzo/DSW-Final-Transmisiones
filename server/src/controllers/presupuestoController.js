const { z } = require('zod');
const { ItemPresupuesto, Reparacion } = require('../models');
const { generatePresupuestoPDF } = require('../utils/pdf');

const itemSchema = z.object({
  descripcion: z.string().min(1),
  cantidad: z.number().int().min(1).default(1),
  precio_unitario: z.number().min(0).optional().nullable(),
  observacion: z.string().optional().nullable(),
});

const addItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = itemSchema.parse(req.body);
    const item = await ItemPresupuesto.create({
      id_reparacion: id,
      descripcion: data.descripcion,
      cantidad: data.cantidad,
      precio_unitario: data.precio_unitario,
      observacion: data.observacion,
    });
    res.status(201).json({ ok: true, data: item });
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = itemSchema.partial().parse(req.body);
    const fields = Object.keys(data).filter((k) => data[k] !== undefined);
    if (fields.length === 0) return res.status(400).json({ ok: false, error: 'Sin campos' });

    const item = await ItemPresupuesto.findByPk(id);
    if (!item) return res.status(404).json({ ok: false, error: 'Ítem no encontrado' });

    const updates = {};
    fields.forEach((f) => { updates[f] = data[f]; });
    await item.update(updates);
    res.json({ ok: true, data: item });
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await ItemPresupuesto.destroy({ where: { id } });
    if (deleted === 0) return res.status(404).json({ ok: false, error: 'Ítem no encontrado' });
    res.json({ ok: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

const getPDF = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reparacion = await Reparacion.findByPk(id, {
      include: [
        {
          association: 'caja',
          attributes: ['numero_serie', 'tipo_vehiculo', 'marca', 'modelo'],
          include: [
            { association: 'cliente', attributes: ['nombre', 'empresa', 'telefono', 'cuit'] },
          ],
        },
      ],
    });
    if (!reparacion) return res.status(404).json({ ok: false, error: 'Reparación no encontrada' });

    const items = await ItemPresupuesto.findAll({
      where: { id_reparacion: id },
      order: [['id', 'ASC']],
    });

    // Aplanar caja + cliente al formato que espera el generador de PDF.
    const json = reparacion.toJSON();
    const caja = json.caja || {};
    const cliente = caja.cliente || {};
    delete json.caja;
    const repData = {
      ...json,
      numero_serie: caja.numero_serie ?? null,
      tipo_vehiculo: caja.tipo_vehiculo ?? null,
      marca: caja.marca ?? null,
      modelo: caja.modelo ?? null,
      cliente_nombre: cliente.nombre ?? null,
      cliente_empresa: cliente.empresa ?? null,
      cliente_telefono: cliente.telefono ?? null,
      cliente_cuit: cliente.cuit ?? null,
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=presupuesto-${id}.pdf`);
    await generatePresupuestoPDF(repData, items.map((i) => i.toJSON()), res);
  } catch (err) {
    next(err);
  }
};

module.exports = { addItem, updateItem, deleteItem, getPDF };
