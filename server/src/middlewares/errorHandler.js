const errorHandler = (err, req, res, next) => {
  // En los tests hay casos que provocan errores a propósito (ej. validación que
  // debe fallar), así que no se loguean para no ensuciar la salida de Jest.
  if (process.env.NODE_ENV !== 'test') console.error(err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      ok: false,
      error: 'Datos inválidos',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // Errores de validación de Sequelize (ej. enum inválido en un modelo).
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      ok: false,
      error: 'Datos inválidos',
      details: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // Restricción UNIQUE: Sequelize (por nombre) o PostgreSQL crudo (código 23505).
  if (err.name === 'SequelizeUniqueConstraintError' || err.code === '23505') {
    return res.status(409).json({ ok: false, error: 'Registro duplicado' });
  }

  // Foreign key inválida: Sequelize o PostgreSQL crudo (código 23503).
  if (err.name === 'SequelizeForeignKeyConstraintError' || err.code === '23503') {
    return res.status(400).json({ ok: false, error: 'Referencia inválida' });
  }

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ ok: false, error: message });
};

module.exports = errorHandler;
