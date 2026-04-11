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

// Cambiar contraseña propia
const cambiarPassword = async (req, res, next) => {
  try {
    const schema = z.object({
      password_actual: z.string().min(1),
      password_nuevo: z.string().min(6),
    });
    const { password_actual, password_nuevo } = schema.parse(req.body);

    const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password_actual, rows[0].password_hash);
    if (!valid) return res.status(400).json({ ok: false, error: 'La contraseña actual es incorrecta' });

    const hash = await bcrypt.hash(password_nuevo, 10);
    await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);

    res.json({ ok: true, data: { updated: true } });
  } catch (err) {
    next(err);
  }
};

// Solicitar reset (público, desde login)
const solicitarReset = async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const { rows } = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);

    // Siempre responder ok para no revelar si el email existe
    if (rows[0]) {
      // Eliminar solicitudes previas pendientes del mismo usuario
      await pool.query(
        "DELETE FROM solicitudes_reset WHERE id_usuario = $1 AND estado = 'pendiente'",
        [rows[0].id]
      );
      await pool.query(
        'INSERT INTO solicitudes_reset (id_usuario) VALUES ($1)',
        [rows[0].id]
      );
    }

    res.json({ ok: true, data: { mensaje: 'Solicitud enviada. El administrador va a resetear tu contraseña.' } });
  } catch (err) {
    next(err);
  }
};

// Listar solicitudes pendientes (admin)
const listarSolicitudes = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT sr.id, sr.estado, sr.created_at,
             u.id as usuario_id, u.nombre, u.email
      FROM solicitudes_reset sr
      JOIN usuarios u ON u.id = sr.id_usuario
      WHERE sr.estado = 'pendiente'
      ORDER BY sr.created_at ASC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// Resetear contraseña (admin)
const resetearPassword = async (req, res, next) => {
  try {
    const { id } = req.params; // id de la solicitud
    const { rows } = await pool.query(
      "SELECT * FROM solicitudes_reset WHERE id = $1 AND estado = 'pendiente'",
      [id]
    );
    if (!rows[0]) return res.status(404).json({ ok: false, error: 'Solicitud no encontrada' });

    // Generar contraseña temporal
    const temporal = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(temporal, 10);

    await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [hash, rows[0].id_usuario]);
    await pool.query("UPDATE solicitudes_reset SET estado = 'completada' WHERE id = $1", [id]);

    res.json({ ok: true, data: { password_temporal: temporal } });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, update, remove, cambiarPassword, solicitarReset, listarSolicitudes, resetearPassword };
