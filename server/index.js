require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/clientes', require('./src/routes/clientes'));
app.use('/api/cajas', require('./src/routes/cajas'));
app.use('/api/reparaciones', require('./src/routes/reparaciones'));
app.use('/api/presupuesto', require('./src/routes/presupuesto'));
app.use('/api/items', require('./src/routes/items'));
app.use('/api/fotos', require('./src/routes/fotos'));
app.use('/api/usuarios', require('./src/routes/usuarios'));

app.get('/api/health', (req, res) => res.json({ ok: true, status: 'running' }));

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
