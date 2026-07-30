const { z } = require('zod');
const { ItemReparado } = require('../models');

const itemSchema = z.object({
  descripcion: z.string().min(1),
  cantidad: z.number().int().min(1).default(1),
  observacion: z.string().optional().nullable(),
});

const addItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = itemSchema.parse(req.body);
    const item = await ItemReparado.create({
      id_reparacion: id,
      descripcion: data.descripcion,
      cantidad: data.cantidad,
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

    const item = await ItemReparado.findByPk(id);
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
    const deleted = await ItemReparado.destroy({ where: { id } });
    if (deleted === 0) return res.status(404).json({ ok: false, error: 'Ítem no encontrado' });
    res.json({ ok: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

module.exports = { addItem, updateItem, deleteItem };
