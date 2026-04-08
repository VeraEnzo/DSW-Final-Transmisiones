require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Apply schema
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);

    // Clear existing data (in order)
    await client.query('DELETE FROM fotos');
    await client.query('DELETE FROM items_reparados');
    await client.query('DELETE FROM items_presupuesto');
    await client.query('DELETE FROM reparaciones');
    await client.query('DELETE FROM cajas');
    await client.query('DELETE FROM clientes');
    await client.query('DELETE FROM usuarios');

    // Reset sequences
    await client.query(`
      SELECT setval('usuarios_id_seq', 1, false);
      SELECT setval('clientes_id_seq', 1, false);
      SELECT setval('cajas_id_seq', 1, false);
      SELECT setval('reparaciones_id_seq', 1, false);
    `);

    // Usuarios
    const hash = (pwd) => bcrypt.hash(pwd, 10);
    const [h1, h2, h3, h4] = await Promise.all([
      hash('admin1234'),
      hash('tecnico1234'),
      hash('ana1234'),
      hash('cinthia1234'),
    ]);

    await client.query(`
      INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
      ('Administrador', 'admin@taller.com', $1, 'admin'),
      ('Carlos Técnico', 'tecnico@taller.com', $2, 'tecnico'),
      ('Ana García', 'ana@taller.com', $3, 'tecnico'),
      ('Cinthia Rodríguez', 'cinthia@taller.com', $4, 'tecnico')
    `, [h1, h2, h3, h4]);

    // Clientes
    const clientes = await client.query(`
      INSERT INTO clientes (nombre, empresa, telefono, email) VALUES
      ('Juan Transportes', 'Transportes JR S.A.', '011-4444-1234', 'juan@transportesjr.com'),
      ('María González', 'Empresa de Colectivos Norte', '011-5555-9876', 'maria@colectivosnorte.com'),
      ('Roberto Agro', 'Agropecuaria El Campo', '011-3333-4567', 'roberto@elcampo.com')
      RETURNING id
    `);
    const [c1, c2, c3] = clientes.rows;

    // Cajas
    const cajas = await client.query(`
      INSERT INTO cajas (numero_serie, tipo_vehiculo, marca, modelo, id_cliente) VALUES
      ('ZF-6HP-2023-001', 'camion', 'ZF', '6HP600', $1),
      ('ALLISON-3000-002', 'colectivo', 'Allison', '3000 Series', $2),
      ('ZF-4WG-2022-003', 'tractor', 'ZF', '4WG260', $3),
      ('VOITH-D864-004', 'camion', 'Voith', 'D864', $1)
      RETURNING id
    `, [c1.id, c2.id, c3.id]);
    const [box1, box2, box3, box4] = cajas.rows;

    // Reparaciones en distintos estados
    const hoy = new Date().toISOString().split('T')[0];
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const semanaAtras = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    const reps = await client.query(`
      INSERT INTO reparaciones (id_caja, fecha_ingreso, tecnico, falla_declarada, diagnostico_tecnico, estado) VALUES
      ($1, $5, 'Carlos Técnico', 'No entra en marcha atrás', NULL, 'ingresada'),
      ($2, $6, 'Ana García', 'Saltos al cambiar de 2da a 3ra', 'Desgaste en embragues C2 y C3, requiere overhaul completo', 'presupuestada'),
      ($3, $6, 'Cinthia Rodríguez', 'Ruidos en velocidades bajas', 'Rodamientos delanteros desgastados + sello de entrada roto', 'aprobada'),
      ($4, $7, 'Carlos Técnico', 'Pierde aceite por el colector', 'Junta de colector rota, aceite contaminado - cambio completo', 'terminada')
      RETURNING id
    `, [box1.id, box2.id, box3.id, box4.id, hoy, ayer, semanaAtras]);

    const [r1, r2, r3, r4] = reps.rows;

    // Presupuesto para r2 (presupuestada)
    await client.query(`
      INSERT INTO items_presupuesto (id_reparacion, descripcion, cantidad, precio_unitario, observacion) VALUES
      ($1, 'Kit de embragues C2 completo', 1, 45000.00, 'Incluye discos y platos'),
      ($1, 'Kit de embragues C3 completo', 1, 48000.00, 'Incluye discos y platos'),
      ($1, 'Mano de obra - Overhaul completo', 1, 35000.00, 'Aprox. 8hs de trabajo'),
      ($1, 'Aceite ATF Dexron VI 20L', 1, 12000.00, NULL)
    `, [r2.id]);

    // Items reparados para r3 (aprobada, en proceso)
    await client.query(`
      INSERT INTO items_reparados (id_reparacion, descripcion, cantidad, observacion) VALUES
      ($1, 'Rodamiento delantero lado izquierdo', 1, 'Reemplazado por SKF'),
      ($1, 'Sello de entrada principal', 1, 'Sello OEM reemplazado')
    `, [r3.id]);

    // Presupuesto y items reparados para r4 (terminada)
    await client.query(`
      INSERT INTO items_presupuesto (id_reparacion, descripcion, cantidad, precio_unitario) VALUES
      ($1, 'Junta de colector', 1, 8500.00),
      ($1, 'Aceite ATF Allison C4 20L', 1, 14000.00),
      ($1, 'Mano de obra', 1, 15000.00)
    `, [r4.id]);

    await client.query(`
      INSERT INTO items_reparados (id_reparacion, descripcion, cantidad) VALUES
      ($1, 'Junta de colector reemplazada', 1),
      ($1, 'Aceite drenado y cambiado', 1),
      ($1, 'Limpieza de filtro interno', 1)
    `, [r4.id]);

    await client.query('COMMIT');
    console.log('✓ Seed completado con éxito');
    console.log('  admin@taller.com / admin1234');
    console.log('  tecnico@taller.com / tecnico1234');
    console.log('  ana@taller.com / ana1234');
    console.log('  cinthia@taller.com / cinthia1234');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en seed:', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
