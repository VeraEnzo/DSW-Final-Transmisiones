'use strict';

require('dotenv').config();

// @react-pdf/renderer es ESM-only y pdf.js lo carga con import() dinámico, que
// Jest no intercepta vía moduleNameMapper. Mockeamos el generador para que
// escriba un Buffer PDF válido al stream, igual que el real, sin cargar el ESM.
jest.mock('../src/utils/pdf', () => ({
  generatePresupuestoPDF: jest.fn(async (reparacion, items, outputStream) => {
    outputStream.end(Buffer.from('%PDF-1.4 stub'));
  }),
}));

const request = require('supertest');
const app = require('../src/app');
const { cleanDB, pool, createAdminAndLogin, createTecnicoAndLogin } = require('./setup');

let adminToken;
let tecnicoToken;
let reparacionId;

beforeEach(async () => {
  await cleanDB();
  adminToken = await createAdminAndLogin(request, app);
  tecnicoToken = await createTecnicoAndLogin(request, app);

  // Crear cliente, caja y reparación base para los tests
  const cliente = await request(app).post('/api/clientes')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ nombre: 'Cliente Test' });

  const caja = await request(app).post('/api/cajas')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ numero_serie: 'SER-001', id_cliente: cliente.body.data.id });

  const rep = await request(app).post('/api/reparaciones')
    .set('Authorization', `Bearer ${tecnicoToken}`)
    .send({ id_caja: caja.body.data.id });

  reparacionId = rep.body.data.id;
});

afterAll(() => pool.end());

describe('POST /api/reparaciones/:id/presupuesto', () => {
  test('agrega ítem con descripción y precio', async () => {
    const res = await request(app)
      .post(`/api/reparaciones/${reparacionId}/presupuesto`)
      .set('Authorization', `Bearer ${tecnicoToken}`)
      .send({ descripcion: 'Reparación de placa', cantidad: 1, precio_unitario: 5000 });
    expect(res.status).toBe(201);
    expect(res.body.data.descripcion).toBe('Reparación de placa');
    expect(Number(res.body.data.precio_unitario)).toBe(5000);
  });

  test('agrega ítem sin precio (precio nulo)', async () => {
    const res = await request(app)
      .post(`/api/reparaciones/${reparacionId}/presupuesto`)
      .set('Authorization', `Bearer ${tecnicoToken}`)
      .send({ descripcion: 'Limpieza', cantidad: 1 });
    expect(res.status).toBe(201);
    expect(res.body.data.precio_unitario).toBeNull();
  });

  test('rechaza ítem sin descripción', async () => {
    const res = await request(app)
      .post(`/api/reparaciones/${reparacionId}/presupuesto`)
      .set('Authorization', `Bearer ${tecnicoToken}`)
      .send({ cantidad: 2, precio_unitario: 1000 });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/presupuesto/:id', () => {
  test('actualiza precio de un ítem', async () => {
    const created = await request(app)
      .post(`/api/reparaciones/${reparacionId}/presupuesto`)
      .set('Authorization', `Bearer ${tecnicoToken}`)
      .send({ descripcion: 'Revisión', cantidad: 1, precio_unitario: 2000 });
    const itemId = created.body.data.id;

    const res = await request(app)
      .put(`/api/presupuesto/${itemId}`)
      .set('Authorization', `Bearer ${tecnicoToken}`)
      .send({ precio_unitario: 3500 });
    expect(res.status).toBe(200);
    expect(Number(res.body.data.precio_unitario)).toBe(3500);
  });

  test('devuelve 404 para ítem inexistente', async () => {
    const res = await request(app)
      .put('/api/presupuesto/99999')
      .set('Authorization', `Bearer ${tecnicoToken}`)
      .send({ precio_unitario: 100 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/presupuesto/:id', () => {
  test('elimina un ítem existente', async () => {
    const created = await request(app)
      .post(`/api/reparaciones/${reparacionId}/presupuesto`)
      .set('Authorization', `Bearer ${tecnicoToken}`)
      .send({ descripcion: 'A Eliminar', cantidad: 1 });
    const itemId = created.body.data.id;

    const res = await request(app)
      .delete(`/api/presupuesto/${itemId}`)
      .set('Authorization', `Bearer ${tecnicoToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  test('devuelve 404 para ítem inexistente', async () => {
    const res = await request(app)
      .delete('/api/presupuesto/99999')
      .set('Authorization', `Bearer ${tecnicoToken}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/reparaciones/:id/presupuesto/pdf', () => {
  test('genera PDF con content-type correcto', async () => {
    await request(app)
      .post(`/api/reparaciones/${reparacionId}/presupuesto`)
      .set('Authorization', `Bearer ${tecnicoToken}`)
      .send({ descripcion: 'Reparación placa', cantidad: 1, precio_unitario: 8000 });

    const res = await request(app)
      .get(`/api/reparaciones/${reparacionId}/presupuesto/pdf`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.body).toBeDefined();
  });

  test('devuelve 404 para reparación inexistente', async () => {
    const res = await request(app)
      .get('/api/reparaciones/99999/presupuesto/pdf')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});