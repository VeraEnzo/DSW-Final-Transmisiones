'use strict';

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

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

app.use(errorHandler);

module.exports = app;