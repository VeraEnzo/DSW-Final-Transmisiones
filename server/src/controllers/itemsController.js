const { z } = require('zod');
const pool = require('../config/db');

const itemSchema = z.object({
  descripcion: z.string().min(1),
  cantidad: z.number().int().min(1).default(1),
  observacion: z.string().optional().nullable(),
});

const addItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = itemSchema.parse(req.body);
    const { rows } = await pool.query(
      `INSERT INTO items_reparados (id_reparacion, descripcion, cantidad, observacion)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [id, data.descripcion, data.cantidad, data.observacion]
    );
    res.status(201).json({ ok: true, data: rows[0] });
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

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map((f) => data[f]), id];

    const { rows } = await pool.query(
      `UPDATE items_reparados SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ ok: false, error: 'Ítem no encontrado' });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM items_reparados WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ ok: false, error: 'Ítem no encontrado' });
    res.json({ ok: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

module.exports = { addItem, updateItem, deleteItem };
