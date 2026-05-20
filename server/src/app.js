'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : true;
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Serve frontend static build in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
}

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/dashboard',   require('./routes/dashboard'));
app.use('/api/clientes',    require('./routes/clientes'));
app.use('/api/cajas',       require('./routes/cajas'));
app.use('/api/reparaciones',require('./routes/reparaciones'));
app.use('/api/presupuesto', require('./routes/presupuesto'));
app.use('/api/items',       require('./routes/items'));
app.use('/api/fotos',       require('./routes/fotos'));
app.use('/api/usuarios',    require('./routes/usuarios'));

app.get('/api/health', (req, res) => res.json({ ok: true, status: 'running' }));

// Catch-all: serve React app for any non-API route (needed for client-side routing)
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(errorHandler);

module.exports = app;