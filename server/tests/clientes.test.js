'use strict';

require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { cleanDB, pool, createAdminAndLogin, createTecnicoAndLogin } = require('./setup');

let adminToken;
let tecnicoToken;

beforeEach(async () => {
  await cleanDB();
  adminToken = await createAdminAndLogin(request, app);
  tecnicoToken = await createTecnicoAndLogin(request, app);
});
afterAll(() => pool.end());

describe('POST /api/clientes', () => {
  test('crea cliente solo con nombre', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${tecnicoToken}`)
      .send({ nombre: 'Pedro Logística' });
    expect(res.status).toBe(201);
    expect(res.body.data.nombre).toBe('Pedro Logística');
    expect(res.body.data.cuit).toBeNull();
  });

  test('crea cliente con todos los campos incluyendo CUIT', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Empresa SA',
        empresa: 'Transporte del Norte',
        telefono: '3411234567',
        email: 'empresa@test.com',
        cuit: '30-12345678-9',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.cuit).toBe('30-12345678-9');
    expect(res.body.data.empresa).toBe('Transporte del Norte');
  });

  test('rechaza cliente sin nombre', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${tecnicoToken}`)
      .send({ empresa: 'Sin nombre' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/clientes', () => {
  beforeEach(async () => {
    await request(app).post('/api/clientes').set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Pedro Logística', empresa: 'Logística SA' });
    await request(app).post('/api/clientes').set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Carlos Transportes' });
  });

  test('lista todos los clientes', async () => {
    const res = await request(app).get('/api/clientes').set('Authorization', `Bearer ${tecnicoToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  test('busca por nombre sin tildes', async () => {
    const res = await request(app)
      .get('/api/clientes?search=logistica')
      .set('Authorization', `Bearer ${tecnicoToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].nombre).toBe('Pedro Logística');
  });

  test('busca por empresa', async () => {
    const res = await request(app)
      .get('/api/clientes?search=Logística SA')
      .set('Authorization', `Bearer ${tecnicoToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});

describe('PUT /api/clientes/:id', () => {
  test('actualiza CUIT de cliente existente', async () => {
    const created = await request(app).post('/api/clientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Cliente CUIT' });
    const id = created.body.data.id;

    const res = await request(app).put(`/api/clientes/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ cuit: '20-99887766-5' });
    expect(res.status).toBe(200);
    expect(res.body.data.cuit).toBe('20-99887766-5');
  });
});

describe('DELETE /api/clientes/:id', () => {
  test('admin puede eliminar cliente sin cajas', async () => {
    const created = await request(app).post('/api/clientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'A Eliminar' });
    const id = created.body.data.id;

    const res = await request(app).delete(`/api/clientes/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  test('técnico no puede eliminar clientes', async () => {
    const created = await request(app).post('/api/clientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'No Borrable' });
    const id = created.body.data.id;

    const res = await request(app).delete(`/api/clientes/${id}`)
      .set('Authorization', `Bearer ${tecnicoToken}`);
    expect(res.status).toBe(403);
  });

  test('no puede eliminar cliente con cajas asociadas', async () => {
    const cliente = await request(app).post('/api/clientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Con Cajas' });
    const clienteId = cliente.body.data.id;

    await request(app).post('/api/cajas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numero_serie: 'ABC-001', id_cliente: clienteId });

    const res = await request(app).delete(`/api/clientes/${clienteId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });
});