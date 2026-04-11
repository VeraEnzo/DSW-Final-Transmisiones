const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const pool = require('../config/db');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

const registerSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.enum(['admin', 'tecnico']).default('tecnico'),
});

const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      ok: true,
      data: {
        token,
        user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
      },
    });
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = registerSchema.parse(req.body);
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1,$2,$3,$4) RETURNING id, nombre, email, rol',
      [nombre, email, hash, rol]
    );
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ ok: false, error: 'Este email ya se encuentra registrado' });
    }
    next(err);
  }
};

const registerPublic = async (req, res, next) => {
  try {
    const schema = z.object({
      nombre: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
    });
    const { nombre, email, password } = schema.parse(req.body);
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1,$2,$3,$4) RETURNING id, nombre, email, rol',
      [nombre, email, hash, 'tecnico']
    );
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ ok: false, error: 'Este email ya se encuentra registrado' });
    }
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = $1',
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, registerPublic, me };
