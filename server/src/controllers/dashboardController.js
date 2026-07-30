const { fn, col } = require('sequelize');
const { Reparacion } = require('../models');

// Trae las reparaciones recientes de un estado, aplanando caja + cliente.
async function recientesPorEstado(estado) {
  const reparaciones = await Reparacion.findAll({
    where: { estado },
    attributes: ['id', 'fecha_ingreso', 'tecnico'],
    order: [['created_at', 'DESC']],
    limit: 10,
    include: [
      {
        association: 'caja',
        attributes: ['numero_serie', 'marca', 'modelo'],
        required: true,
        include: [{ association: 'cliente', attributes: ['nombre'] }],
      },
    ],
  });

  return reparaciones.map((r) => {
    const json = r.toJSON();
    const caja = json.caja || {};
    const cliente = caja.cliente || {};
    delete json.caja;
    return {
      ...json,
      numero_serie: caja.numero_serie ?? null,
      marca: caja.marca ?? null,
      modelo: caja.modelo ?? null,
      cliente_nombre: cliente.nombre ?? null,
    };
  });
}

const getDashboard = async (req, res, next) => {
  try {
    // Conteo por estado (GROUP BY).
    const grouped = await Reparacion.findAll({
      attributes: ['estado', [fn('COUNT', col('id')), 'total']],
      group: ['estado'],
      raw: true,
    });

    const counts = {
      ingresada: 0,
      presupuestada: 0,
      aprobada: 0,
      terminada: 0,
      entregada: 0,
      rechazada: 0,
    };
    grouped.forEach((r) => { counts[r.estado] = parseInt(r.total); });

    const [ingresadas, presupuestadas, aprobadas, terminadas] = await Promise.all([
      recientesPorEstado('ingresada'),
      recientesPorEstado('presupuestada'),
      recientesPorEstado('aprobada'),
      recientesPorEstado('terminada'),
    ]);

    res.json({
      ok: true,
      data: { counts, ingresadas, presupuestadas, aprobadas, terminadas },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
