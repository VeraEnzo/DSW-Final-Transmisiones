const pool = require('../config/db');

const getDashboard = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT estado, COUNT(*) as total
       FROM reparaciones
       GROUP BY estado`
    );

    const counts = {
      ingresada: 0,
      presupuestada: 0,
      aprobada: 0,
      terminada: 0,
      entregada: 0,
      rechazada: 0,
    };
    rows.forEach((r) => { counts[r.estado] = parseInt(r.total); });

    // Recent entries per state (last 10 of active ones)
    const [ingresadas, presupuestadas, aprobadas, terminadas] = await Promise.all([
      pool.query(
        `SELECT r.id, r.fecha_ingreso, r.tecnico, c.numero_serie, c.marca, c.modelo,
                cl.nombre as cliente_nombre
         FROM reparaciones r JOIN cajas c ON c.id = r.id_caja
         LEFT JOIN clientes cl ON cl.id = c.id_cliente
         WHERE r.estado = 'ingresada' ORDER BY r.created_at DESC LIMIT 10`
      ),
      pool.query(
        `SELECT r.id, r.fecha_ingreso, r.tecnico, c.numero_serie, c.marca, c.modelo,
                cl.nombre as cliente_nombre
         FROM reparaciones r JOIN cajas c ON c.id = r.id_caja
         LEFT JOIN clientes cl ON cl.id = c.id_cliente
         WHERE r.estado = 'presupuestada' ORDER BY r.created_at DESC LIMIT 10`
      ),
      pool.query(
        `SELECT r.id, r.fecha_ingreso, r.tecnico, c.numero_serie, c.marca, c.modelo,
                cl.nombre as cliente_nombre
         FROM reparaciones r JOIN cajas c ON c.id = r.id_caja
         LEFT JOIN clientes cl ON cl.id = c.id_cliente
         WHERE r.estado = 'aprobada' ORDER BY r.created_at DESC LIMIT 10`
      ),
      pool.query(
        `SELECT r.id, r.fecha_ingreso, r.tecnico, c.numero_serie, c.marca, c.modelo,
                cl.nombre as cliente_nombre
         FROM reparaciones r JOIN cajas c ON c.id = r.id_caja
         LEFT JOIN clientes cl ON cl.id = c.id_cliente
         WHERE r.estado = 'terminada' ORDER BY r.created_at DESC LIMIT 10`
      ),
    ]);

    res.json({
      ok: true,
      data: {
        counts,
        ingresadas: ingresadas.rows,
        presupuestadas: presupuestadas.rows,
        aprobadas: aprobadas.rows,
        terminadas: terminadas.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
