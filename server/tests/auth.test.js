'use strict';

require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { cleanDB, pool } = require('./setup');

beforeEach(cleanDB);
afterAll(() => pool.end());

describe('POST /api/auth/register/public', () => {
  test('registra un usuario nuevo correctamente', async () => {
    const res = await request(app).post('/api/auth/register/public').send({
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.email).toBe('juan@test.com');
    expect(res.body.data.rol).toBe('tecnico');
  });

  test('rechaza email duplicado con mensaje claro', async () => {
    await request(app).post('/api/auth/register/public').send({
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
      password: 'password123',
    });
    const res = await request(app).post('/api/auth/register/public').send({
      nombre: 'Otro Juan',
      email: 'juan@test.com',
      password: 'otrapass123',
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Este email ya se encuentra registrado');
  });

  test('rechaza contraseña menor a 6 caracteres', async () => {
    const res = await request(app).post('/api/auth/register/public').send({
      nombre: 'Juan',
      email: 'juan@test.com',
      password: '123',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register/public').send({
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
      password: 'password123',
    });
  });

  test('login correcto devuelve token y datos de usuario', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'juan@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('juan@test.com');
  });

  test('password incorrecta devuelve 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'juan@test.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  test('email inexistente devuelve 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'noexiste@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  test('ruta protegida sin token devuelve 401', async () => {
    const res = await request(app).get('/api/clientes');
    expect(res.status).toBe(401);
  });
});