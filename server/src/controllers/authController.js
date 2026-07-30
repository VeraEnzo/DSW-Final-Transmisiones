const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { Usuario } = require('../models');

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
    const user = await Usuario.findOne({ where: { email } });
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
    const user = await Usuario.create({ nombre, email, password_hash: hash, rol });
    res.status(201).json({
      ok: true,
      data: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
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
    const user = await Usuario.create({ nombre, email, password_hash: hash, rol: 'tecnico' });
    res.status(201).json({
      ok: true,
      data: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ ok: false, error: 'Este email ya se encuentra registrado' });
    }
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await Usuario.findByPk(req.user.id, {
      attributes: ['id', 'nombre', 'email', 'rol', 'created_at'],
    });
    if (!user) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    res.json({ ok: true, data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, registerPublic, me };
