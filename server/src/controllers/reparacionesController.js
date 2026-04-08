const { z } = require('zod');
const pool = require('../config/db');

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
    const { rows } = await pool.query(
      `INSERT INTO reparaciones (id_caja, fecha_ingreso, tecnico, falla_declarada)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.id_caja, data.fecha_ingreso || new Date().toISOString().split('T')[0], data.tecnico, data.falla_declarada]
    );
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rep = await pool.query(
      `SELECT r.*,
              c.numero_serie, c.tipo_vehiculo, c.marca, c.modelo,
              cl.nombre as cliente_nombre, cl.empresa as cliente_empresa,
              cl.telefono as cliente_telefono, cl.email as cliente_email
       FROM reparaciones r
       JOIN cajas c ON c.id = r.id_caja
       LEFT JOIN clientes cl ON cl.id = c.id_cliente
       WHERE r.id = $1`,
      [id]
    );
    if (!rep.rows[0]) return res.status(404).json({ ok: false, error: 'Reparación no encontrada' });

    const [presupuesto, items, fotos] = await Promise.all([
      pool.query('SELECT * FROM items_presupuesto WHERE id_reparacion = $1 ORDER BY id', [id]),
      pool.query('SELECT * FROM items_reparados WHERE id_reparacion = $1 ORDER BY id', [id]),
      pool.query('SELECT * FROM fotos WHERE id_reparacion = $1 ORDER BY fecha_subida', [id]),
    ]);

    res.json({
      ok: true,
      data: {
        ...rep.rows[0],
        items_presupuesto: presupuesto.rows,
        items_reparados: items.rows,
        fotos: fotos.rows,
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

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map((f) => data[f]), id];

    const { rows } = await pool.query(
      `UPDATE reparaciones SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ ok: false, error: 'Reparación no encontrada' });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM fotos WHERE id_reparacion = $1', [id]);
    await pool.query('DELETE FROM items_presupuesto WHERE id_reparacion = $1', [id]);
    await pool.query('DELETE FROM items_reparados WHERE id_reparacion = $1', [id]);
    const { rowCount } = await pool.query('DELETE FROM reparaciones WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ ok: false, error: 'Reparación no encontrada' });
    res.json({ ok: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getById, update, remove };
