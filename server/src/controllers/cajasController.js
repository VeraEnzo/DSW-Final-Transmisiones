const { z } = require('zod');
const pool = require('../config/db');

const cajaSchema = z.object({
  numero_serie: z.string().min(1),
  tipo_vehiculo: z.enum(['camion', 'colectivo', 'tractor', 'pulverizadora', 'otro']).optional().nullable(),
  marca: z.string().optional().nullable(),
  modelo: z.string().optional().nullable(),
  id_cliente: z.number().int().optional().nullable(),
  observaciones_generales: z.string().optional().nullable(),
});

const list = async (req, res, next) => {
  try {
    const { numero_serie, id_cliente, tipo_vehiculo } = req.query;
    let query = `
      SELECT c.*, cl.nombre as cliente_nombre, cl.empresa as cliente_empresa,
        (SELECT COUNT(*) FROM reparaciones r WHERE r.id_caja = c.id) as total_reparaciones,
        (SELECT estado FROM reparaciones r WHERE r.id_caja = c.id ORDER BY created_at DESC LIMIT 1) as ultimo_estado
      FROM cajas c
      LEFT JOIN clientes cl ON cl.id = c.id_cliente
      WHERE 1=1
    `;
    const params = [];
    let i = 1;
    if (numero_serie) { query += ` AND c.numero_serie ILIKE $${i++}`; params.push(`%${numero_serie}%`); }
    if (id_cliente) { query += ` AND c.id_cliente = $${i++}`; params.push(id_cliente); }
    if (tipo_vehiculo) { query += ` AND c.tipo_vehiculo = $${i++}`; params.push(tipo_vehiculo); }
    query += ' ORDER BY c.created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = cajaSchema.parse(req.body);
    const { rows } = await pool.query(
      `INSERT INTO cajas (numero_serie, tipo_vehiculo, marca, modelo, id_cliente, observaciones_generales)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [data.numero_serie, data.tipo_vehiculo, data.marca, data.modelo, data.id_cliente, data.observaciones_generales]
    );
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cajaResult = await pool.query(
      `SELECT c.*, cl.nombre as cliente_nombre, cl.empresa as cliente_empresa,
              cl.telefono as cliente_telefono, cl.email as cliente_email
       FROM cajas c LEFT JOIN clientes cl ON cl.id = c.id_cliente WHERE c.id = $1`,
      [id]
    );
    if (!cajaResult.rows[0]) return res.status(404).json({ ok: false, error: 'Caja no encontrada' });

    const reparaciones = await pool.query(
      'SELECT * FROM reparaciones WHERE id_caja = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({ ok: true, data: { ...cajaResult.rows[0], reparaciones: reparaciones.rows } });
  } catch (err) {
    next(err);
  }
};

const getBySerie = async (req, res, next) => {
  try {
    const { numero_serie } = req.params;
    const { rows } = await pool.query(
      `SELECT c.*, cl.nombre as cliente_nombre, cl.empresa as cliente_empresa
       FROM cajas c LEFT JOIN clientes cl ON cl.id = c.id_cliente
       WHERE c.numero_serie = $1`,
      [numero_serie]
    );
    if (!rows[0]) return res.status(404).json({ ok: false, error: 'Caja no encontrada' });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = cajaSchema.partial().parse(req.body);
    const fields = Object.keys(data);
    if (fields.length === 0) return res.status(400).json({ ok: false, error: 'Sin campos' });

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map((f) => data[f]), id];

    const { rows } = await pool.query(
      `UPDATE cajas SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ ok: false, error: 'Caja no encontrada' });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reps = await pool.query('SELECT COUNT(*) FROM reparaciones WHERE id_caja = $1', [id]);
    if (parseInt(reps.rows[0].count) > 0) {
      return res.status(409).json({ ok: false, error: 'No se puede eliminar: la caja tiene reparaciones asociadas' });
    }
    const { rowCount } = await pool.query('DELETE FROM cajas WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ ok: false, error: 'Caja no encontrada' });
    res.json({ ok: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, getById, getBySerie, update, remove };
