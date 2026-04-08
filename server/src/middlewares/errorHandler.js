const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      ok: false,
      error: 'Datos inválidos',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({ ok: false, error: 'Registro duplicado' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ ok: false, error: 'Referencia inválida' });
  }

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ ok: false, error: message });
};

module.exports = errorHandler;
