const bcrypt = require('bcryptjs');
const { z } = require('zod');
const pool = require('../config/db');

const updateSchema = z.object({
  nombre: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  rol: z.enum(['admin', 'tecnico']).optional(),
});

const list = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, rol, created_at FROM usuarios ORDER BY nombre'
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateSchema.parse(req.body);
    const updates = {};
    if (data.nombre) updates.nombre = data.nombre;
    if (data.email) updates.email = data.email;
    if (data.rol) updates.rol = data.rol;
    if (data.password) updates.password_hash = await bcrypt.hash(data.password, 10);

    const fields = Object.keys(updates);
    if (fields.length === 0) return res.status(400).json({ ok: false, error: 'Sin campos' });

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [...fields.map((f) => updates[f]), id];

    const { rows } = await pool.query(
      `UPDATE usuarios SET ${setClause} WHERE id = $${fields.length + 1}
       RETURNING id, nombre, email, rol, created_at`,
      values
    );
    if (!rows[0]) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ ok: false, error: 'No podés eliminarte a vos mismo' });
    }
    const { rowCount } = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    res.json({ ok: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, update, remove };
