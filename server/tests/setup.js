'use strict';

const { Pool } = require('pg');

// DATABASE_URL is already pointed at the test DB by jest.setup.env.js (Jest setupFiles).
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Limpia todas las tablas antes de cada test
async function cleanDB() {
  await pool.query(`
    TRUNCATE TABLE fotos, items_reparados, items_presupuesto, reparaciones, cajas, clientes, solicitudes_reset, usuarios
    RESTART IDENTITY CASCADE
  `);
}

// Crea un usuario admin y devuelve su token JWT
async function createAdminAndLogin(request, app) {
  await request(app).post('/api/auth/register/public').send({
    nombre: 'Admin Test',
    email: 'admin@test.com',
    password: 'admin123',
  });
  // Promovemos a admin directamente en DB
  await pool.query("UPDATE usuarios SET rol = 'admin' WHERE email = 'admin@test.com'");
  const res = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com',
    password: 'admin123',
  });
  return res.body.data.token;
}

// Crea un usuario técnico y devuelve su token JWT
async function createTecnicoAndLogin(request, app) {
  await request(app).post('/api/auth/register/public').send({
    nombre: 'Tecnico Test',
    email: 'tecnico@test.com',
    password: 'tecnico123',
  });
  const res = await request(app).post('/api/auth/login').send({
    email: 'tecnico@test.com',
    password: 'tecnico123',
  });
  return res.body.data.token;
}

module.exports = { pool, cleanDB, createAdminAndLogin, createTecnicoAndLogin };