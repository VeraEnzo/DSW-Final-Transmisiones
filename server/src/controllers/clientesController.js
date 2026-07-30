const { z } = require('zod');
const { Op } = require('sequelize');
const { Cliente, Caja, sequelize } = require('../models');

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
    const options = { order: [['nombre', 'ASC']] };

    if (search) {
      // Búsqueda sin tildes (unaccent es específico de PostgreSQL),
      // replicando el OR sobre nombre y empresa del query original.
      options.where = {
        [Op.or]: [
          sequelize.where(
            sequelize.fn('unaccent', sequelize.col('nombre')),
            { [Op.iLike]: sequelize.fn('unaccent', `%${search}%`) }
          ),
          sequelize.where(
            sequelize.fn('unaccent', sequelize.col('empresa')),
            { [Op.iLike]: sequelize.fn('unaccent', `%${search}%`) }
          ),
        ],
      };
    }

    const clientes = await Cliente.findAll(options);
    res.json({ ok: true, data: clientes });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = clienteSchema.parse(req.body);
    const cliente = await Cliente.create({
      nombre: data.nombre,
      empresa: data.empresa || null,
      telefono: data.telefono || null,
      email: data.email || null,
      cuit: data.cuit || null,
    });
    res.status(201).json({ ok: true, data: cliente });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });

    // Cajas del cliente con total de reparaciones y último estado (subqueries).
    const cajas = await Caja.findAll({
      where: { id_cliente: id },
      order: [['created_at', 'DESC']],
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM reparaciones r WHERE r.id_caja = "Caja".id)'
            ),
            'total_reparaciones',
          ],
          [
            sequelize.literal(
              '(SELECT estado FROM reparaciones r WHERE r.id_caja = "Caja".id ORDER BY created_at DESC LIMIT 1)'
            ),
            'ultimo_estado',
          ],
        ],
      },
    });

    res.json({ ok: true, data: { ...cliente.toJSON(), cajas } });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = clienteSchema.partial().parse(req.body);
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ ok: false, error: 'Sin campos' });
    }

    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });

    await cliente.update(data);
    res.json({ ok: true, data: cliente });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cajasCount = await Caja.count({ where: { id_cliente: id } });
    if (cajasCount > 0) {
      return res.status(409).json({ ok: false, error: 'No se puede eliminar: el cliente tiene cajas asociadas' });
    }
    const deleted = await Cliente.destroy({ where: { id } });
    if (deleted === 0) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
    res.json({ ok: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, getById, update, remove };
