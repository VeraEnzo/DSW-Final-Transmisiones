const { z } = require('zod');
const pool = require('../config/db');

const clienteSchema = z.object({
  nombre: z.string().min(2),
  empresa: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  cuit: z.string().optional().nullable(),
});

const list = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM clientes';
    const params = [];
    if (search) {
      query += ` WHERE unaccent(nombre) ILIKE unaccent($1) OR unaccent(empresa) ILIKE unaccent($1)`;
      params.push(`%${search}%`);
    }
    query += ' ORDER BY nombre';
    const { rows } = await pool.query(query, params);
    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = clienteSchema.parse(req.body);
    const { rows } = await pool.query(
      'INSERT INTO clientes (nombre, empresa, telefono, email, cuit) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [data.nombre, data.empresa || null, data.telefono || null, data.email || null, data.cuit || null]
    );
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });

    const cajas = await pool.query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM reparaciones r WHERE r.id_caja = c.id) as total_reparaciones,
        (SELECT estado FROM reparaciones r WHERE r.id_caja = c.id ORDER BY created_at DESC LIMIT 1) as ultimo_estado
       FROM cajas c WHERE c.id_cliente = $1 ORDER BY c.created_at DESC`,
      [id]
    );

    res.json({ ok: true, data: { ...rows[0], cajas: cajas.rows } });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = clienteSchema.partial().parse(req.body);
    const fields = Object.keys(data);
    if (fields.length === 0) return res.status(400).json({ ok: false, error: 'Sin campos' });

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => data[f]);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE clientes SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cajas = await pool.query('SELECT COUNT(*) FROM cajas WHERE id_cliente = $1', [id]);
    if (parseInt(cajas.rows[0].count) > 0) {
      return res.status(409).json({ ok: false, error: 'No se puede eliminar: el cliente tiene cajas asociadas' });
    }
    const { rowCount } = await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
    res.json({ ok: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, getById, update, remove };
