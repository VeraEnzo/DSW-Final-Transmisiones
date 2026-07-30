const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { Usuario, SolicitudReset } = require('../models');

const updateSchema = z.object({
  nombre: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  rol: z.enum(['admin', 'tecnico']).optional(),
});

const list = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rol', 'created_at'],
      order: [['nombre', 'ASC']],
    });
    res.json({ ok: true, data: usuarios });
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

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ ok: false, error: 'Sin campos' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });

    await usuario.update(updates);
    res.json({
      ok: true,
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        created_at: usuario.created_at,
      },
    });
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
    const deleted = await Usuario.destroy({ where: { id } });
    if (deleted === 0) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
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

    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password_actual, usuario.password_hash);
    if (!valid) return res.status(400).json({ ok: false, error: 'La contraseña actual es incorrecta' });

    const hash = await bcrypt.hash(password_nuevo, 10);
    await usuario.update({ password_hash: hash });

    res.json({ ok: true, data: { updated: true } });
  } catch (err) {
    next(err);
  }
};

// Solicitar reset (público, desde login)
const solicitarReset = async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const usuario = await Usuario.findOne({ where: { email }, attributes: ['id'] });

    // Siempre responder ok para no revelar si el email existe
    if (usuario) {
      // Eliminar solicitudes previas pendientes del mismo usuario
      await SolicitudReset.destroy({ where: { id_usuario: usuario.id, estado: 'pendiente' } });
      await SolicitudReset.create({ id_usuario: usuario.id });
    }

    res.json({ ok: true, data: { mensaje: 'Solicitud enviada. El administrador va a resetear tu contraseña.' } });
  } catch (err) {
    next(err);
  }
};

// Listar solicitudes pendientes (admin)
const listarSolicitudes = async (req, res, next) => {
  try {
    const solicitudes = await SolicitudReset.findAll({
      where: { estado: 'pendiente' },
      include: [{ association: 'usuario', attributes: ['id', 'nombre', 'email'] }],
      order: [['created_at', 'ASC']],
    });

    // Mantener la forma de respuesta original (campos planos)
    const data = solicitudes.map((s) => ({
      id: s.id,
      estado: s.estado,
      created_at: s.created_at,
      usuario_id: s.usuario?.id,
      nombre: s.usuario?.nombre,
      email: s.usuario?.email,
    }));
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

// Resetear contraseña (admin)
const resetearPassword = async (req, res, next) => {
  try {
    const { id } = req.params; // id de la solicitud
    const solicitud = await SolicitudReset.findOne({ where: { id, estado: 'pendiente' } });
    if (!solicitud) return res.status(404).json({ ok: false, error: 'Solicitud no encontrada' });

    // Generar contraseña temporal
    const temporal = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(temporal, 10);

    await Usuario.update({ password_hash: hash }, { where: { id: solicitud.id_usuario } });
    await solicitud.update({ estado: 'completada' });

    res.json({ ok: true, data: { password_temporal: temporal } });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, update, remove, cambiarPassword, solicitarReset, listarSolicitudes, resetearPassword };
