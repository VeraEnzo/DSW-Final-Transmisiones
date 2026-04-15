const { z } = require('zod');
const pool = require('../config/db');
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
    const { rows } = await pool.query(
      `INSERT INTO items_presupuesto (id_reparacion, descripcion, cantidad, precio_unitario, observacion)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id, data.descripcion, data.cantidad, data.precio_unitario, data.observacion]
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
      `UPDATE items_presupuesto SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
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
    const { rowCount } = await pool.query('DELETE FROM items_presupuesto WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ ok: false, error: 'Ítem no encontrado' });
    res.json({ ok: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

const getPDF = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rep = await pool.query(
      `SELECT r.*,
              c.numero_serie, c.tipo_vehiculo, c.marca, c.modelo,
              cl.nombre as cliente_nombre, cl.empresa as cliente_empresa,
              cl.telefono as cliente_telefono, cl.cuit as cliente_cuit
       FROM reparaciones r
       JOIN cajas c ON c.id = r.id_caja
       LEFT JOIN clientes cl ON cl.id = c.id_cliente
       WHERE r.id = $1`,
      [id]
    );
    if (!rep.rows[0]) return res.status(404).json({ ok: false, error: 'Reparación no encontrada' });

    const items = await pool.query(
      'SELECT * FROM items_presupuesto WHERE id_reparacion = $1 ORDER BY id',
      [id]
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=presupuesto-${id}.pdf`);
    await generatePresupuestoPDF(rep.rows[0], items.rows, res);
  } catch (err) {
    next(err);
  }
};

module.exports = { addItem, updateItem, deleteItem, getPDF };
