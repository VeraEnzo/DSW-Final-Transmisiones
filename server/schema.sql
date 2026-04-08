-- Cajas Automáticas — PostgreSQL Schema

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol VARCHAR(20) DEFAULT 'tecnico' CHECK (rol IN ('admin', 'tecnico')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  empresa VARCHAR(150),
  telefono VARCHAR(30),
  email VARCHAR(150),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cajas (
  id SERIAL PRIMARY KEY,
  numero_serie VARCHAR(100) UNIQUE NOT NULL,
  tipo_vehiculo VARCHAR(30) CHECK (tipo_vehiculo IN ('camion','colectivo','tractor','otro')),
  marca VARCHAR(100),
  modelo VARCHAR(100),
  id_cliente INTEGER REFERENCES clientes(id),
  observaciones_generales TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reparaciones (
  id SERIAL PRIMARY KEY,
  id_caja INTEGER REFERENCES cajas(id) NOT NULL,
  fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_egreso DATE,
  tecnico VARCHAR(100),
  falla_declarada TEXT,
  diagnostico_tecnico TEXT,
  estado VARCHAR(30) DEFAULT 'ingresada' CHECK (estado IN (
    'ingresada',
    'presupuestada',
    'aprobada',
    'terminada',
    'entregada',
    'rechazada'
  )),
  observaciones_finales TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items_presupuesto (
  id SERIAL PRIMARY KEY,
  id_reparacion INTEGER REFERENCES reparaciones(id) NOT NULL,
  descripcion TEXT NOT NULL,
  cantidad INTEGER DEFAULT 1,
  precio_unitario DECIMAL(10,2),
  observacion TEXT
);

CREATE TABLE IF NOT EXISTS items_reparados (
  id SERIAL PRIMARY KEY,
  id_reparacion INTEGER REFERENCES reparaciones(id) NOT NULL,
  descripcion TEXT NOT NULL,
  cantidad INTEGER DEFAULT 1,
  observacion TEXT
);

CREATE TABLE IF NOT EXISTS fotos (
  id SERIAL PRIMARY KEY,
  id_reparacion INTEGER REFERENCES reparaciones(id) NOT NULL,
  url_cloudinary TEXT NOT NULL,
  public_id_cloudinary TEXT,
  etiqueta VARCHAR(30) CHECK (etiqueta IN ('ingreso','proceso','terminado','detalle_falla')),
  fecha_subida TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cajas_numero_serie ON cajas(numero_serie);
CREATE INDEX IF NOT EXISTS idx_reparaciones_id_caja ON reparaciones(id_caja);
