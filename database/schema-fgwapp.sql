
-- FGWAPP V8 PYTHON - SCHEMA ESCALABLE A MILES
-- Supabase Nuevo: https://yjbzbfeivxkrxzlpehxj.supabase.co
-- Sucursales: Guadalajara y Culiacán (expansible)
-- Capacidad: miles de unidades, indices optimizados

-- LIMPIEZA PREVIA (si existe algo)
DROP VIEW IF EXISTS v_fraude_combustible CASCADE;
DROP VIEW IF EXISTS v_flota_dashboard CASCADE;
DROP TABLE IF EXISTS combustible_cargas CASCADE;
DROP TABLE IF EXISTS gps_tracking CASCADE;
DROP TABLE IF EXISTS mantenimiento CASCADE;
DROP TABLE IF EXISTS rutas_asignadas CASCADE;
DROP TABLE IF EXISTS rutas CASCADE;
DROP TABLE IF EXISTS conductores CASCADE;
DROP TABLE IF EXISTS flota CASCADE;
DROP TABLE IF EXISTS sucursales CASCADE;

-- 1. SUCURSALES (2 actuales: GDL y Culiacán, expansible a N)
CREATE TABLE sucursales (
  id SERIAL PRIMARY KEY,
  clave TEXT UNIQUE NOT NULL, -- Ej: SUC-GDL-01, SUC-CLN-01
  nombre TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  estado TEXT NOT NULL,
  direccion TEXT,
  lat NUMERIC(10,6),
  lng NUMERIC(10,6),
  responsable TEXT,
  telefono TEXT,
  capacidad_max INTEGER DEFAULT 500, -- Capacidad maxima por sucursal (escalable)
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO sucursales (clave, nombre, ciudad, estado, direccion, lat, lng, capacidad_max) VALUES
('SUC-GDL-01', 'Matriz Guadalajara', 'Guadalajara', 'Jalisco', 'Av. Vallarta 1234, Guadalajara, Jal', 20.6597, -103.3496, 1000),
('SUC-CLN-01', 'Sucursal Culiacán', 'Culiacán', 'Sinaloa', 'Blvd. Sinaloa 567, Culiacán, Sin', 24.8091, -107.3940, 1000);

-- Sucursales futuras se agregan con: INSERT INTO sucursales (clave, nombre, ciudad, estado) VALUES ('SUC-MTY-01','Monterrey','Monterrey','Nuevo León');

-- 2. FLOTA - ESCALABLE A MILES (indices para 10k+ unidades)
CREATE TABLE flota (
  id SERIAL PRIMARY KEY, -- SERIAL soporta hasta 2B, suficiente para miles. Si necesitas >2B usa BIGSERIAL
  placa TEXT UNIQUE NOT NULL,
  numero_economico TEXT UNIQUE, -- Ej: FG-0001
  marca TEXT NOT NULL,
  modelo TEXT,
  anio INTEGER,
  vin TEXT UNIQUE, -- NIV
  tipo TEXT DEFAULT 'Tractocamión' CHECK (tipo IN ('Tractocamión','Torton','Rabón','Sprinter','Pickup','Utilitario')),
  estado TEXT NOT NULL DEFAULT 'Disponible' CHECK (estado IN ('En Ruta','En Base','En Taller','Disponible','Baja')),
  sucursal_id INTEGER REFERENCES sucursales(id) ON DELETE SET NULL,
  -- GPS Telcel
  gps_id TEXT UNIQUE,
  telcel_sim TEXT,
  -- Odometro y rendimiento
  odometro_actual INTEGER DEFAULT 0,
  odometro_ultimo_servicio INTEGER DEFAULT 0,
  rendimiento_promedio NUMERIC(5,2) DEFAULT 10.80,
  rendimiento_ultimo NUMERIC(5,2),
  consumo_estado TEXT DEFAULT 'Normal' CHECK (consumo_estado IN ('Bajo','Normal','Excedido','Sospechoso','Critico')),
  -- Mantenimiento
  mantenimiento_km INTEGER DEFAULT 0, -- km desde ultimo servicio
  mantenimiento_estado TEXT DEFAULT 'Preventivo' CHECK (mantenimiento_estado IN ('Agendado','No agendado','Vencido','Próx 1000km','Próx 5000km','Preventivo','Completado')),
  proximo_servicio_km INTEGER DEFAULT 10000,
  -- Ubicacion actual
  ultima_lat NUMERIC(10,6),
  ultima_lng NUMERIC(10,6),
  ultima_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  -- Metadata
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDICES PARA MILES DE UNIDADES (performance)
CREATE INDEX idx_flota_estado ON flota(estado);
CREATE INDEX idx_flota_sucursal ON flota(sucursal_id);
CREATE INDEX idx_flota_consumo ON flota(consumo_estado);
CREATE INDEX idx_flota_mant ON flota(mantenimiento_estado);
CREATE INDEX idx_flota_placa ON flota(placa);
CREATE INDEX idx_flota_activa ON flota(activa) WHERE activa = true;
CREATE INDEX idx_flota_gps ON flota(gps_id);

-- 3. CONDUCTORES (20 como demo, escalable)
CREATE TABLE conductores (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  licencia TEXT UNIQUE,
  telefono TEXT,
  sucursal_id INTEGER REFERENCES sucursales(id),
  estado TEXT DEFAULT 'Activo' CHECK (estado IN ('Activo','Inactivo','Vacaciones','Incapacitado')),
  flota_asignada_id INTEGER REFERENCES flota(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMBUSTIBLE_CARGAS - HISTORICO PARA MILES DE CARGAS (millones de filas)
CREATE TABLE combustible_cargas (
  id BIGSERIAL PRIMARY KEY, -- BIGSERIAL para millones de cargas
  flota_id INTEGER NOT NULL REFERENCES flota(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  litros NUMERIC(10,2) NOT NULL,
  costo NUMERIC(10,2),
  odometro INTEGER,
  km_recorridos INTEGER,
  rendimiento_km_l NUMERIC(5,2),
  estado_combustible TEXT DEFAULT 'Normal' CHECK (estado_combustible IN ('Bajo','Normal','Excedido','Sospechoso','Critico')),
  ubicacion TEXT,
  tipo_combustible TEXT DEFAULT 'Diesel',
  ticket TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDICES PARA MILLONES DE CARGAS
CREATE INDEX idx_comb_flota ON combustible_cargas(flota_id);
CREATE INDEX idx_comb_fecha ON combustible_cargas(fecha DESC);
CREATE INDEX idx_comb_estado ON combustible_cargas(estado_combustible);
CREATE INDEX idx_comb_flota_fecha ON combustible_cargas(flota_id, fecha DESC);

-- 5. GPS_TRACKING - HISTORICO UBICACIONES (millones)
CREATE TABLE gps_tracking (
  id BIGSERIAL PRIMARY KEY,
  flota_id INTEGER NOT NULL REFERENCES flota(id) ON DELETE CASCADE,
  lat NUMERIC(10,6) NOT NULL,
  lng NUMERIC(10,6) NOT NULL,
  velocidad INTEGER,
  direccion TEXT,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_gps_flota ON gps_tracking(flota_id);
CREATE INDEX idx_gps_fecha ON gps_tracking(fecha DESC);
CREATE INDEX idx_gps_flota_fecha ON gps_tracking(flota_id, fecha DESC);

-- 6. MANTENIMIENTO
CREATE TABLE mantenimiento (
  id SERIAL PRIMARY KEY,
  flota_id INTEGER NOT NULL REFERENCES flota(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- Ej: Preventivo 10k, Correctivo, Llantas
  descripcion TEXT,
  km_programado INTEGER,
  km_actual INTEGER,
  estado TEXT DEFAULT 'Agendado' CHECK (estado IN ('Agendado','Vencido','Próx 1000km','En Proceso','Completado')),
  fecha_programada DATE,
  fecha_realizada DATE,
  costo NUMERIC(10,2),
  taller TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_mant_flota ON mantenimiento(flota_id);
CREATE INDEX idx_mant_estado ON mantenimiento(estado);

-- 7. RUTAS
CREATE TABLE rutas (
  id SERIAL PRIMARY KEY,
  clave TEXT UNIQUE NOT NULL,
  origen TEXT NOT NULL,
  destino TEXT NOT NULL,
  distancia_km INTEGER,
  tiempo_estimado_h NUMERIC(5,2),
  activa BOOLEAN DEFAULT true
);
INSERT INTO rutas (clave, origen, destino, distancia_km) VALUES
('RUT-GDL-CLN', 'Guadalajara, Jal', 'Culiacán, Sin', 520),
('RUT-GDL-MEX', 'Guadalajara, Jal', 'CDMX', 540),
('RUT-CLN-MXL', 'Culiacán, Sin', 'Mexicali, BC', 1200);

-- 8. VISTA DASHBOARD 200 LIVE (como tu demo definitivo)
CREATE OR REPLACE VIEW v_flota_dashboard AS
SELECT 
  f.id, f.placa, f.numero_economico, f.marca, f.modelo, f.estado,
  s.clave as sucursal_clave, s.nombre as sucursal_nombre, s.ciudad,
  f.rendimiento_promedio, f.consumo_estado, f.mantenimiento_estado, f.mantenimiento_km,
  f.odometro_actual, f.gps_id, f.telcel_sim, f.ultima_lat, f.ultima_lng,
  c.nombre as conductor_nombre
FROM flota f
LEFT JOIN sucursales s ON s.id = f.sucursal_id
LEFT JOIN conductores c ON c.flota_asignada_id = f.id
WHERE f.activa = true;

-- 9. VISTA FRAUDE
CREATE OR REPLACE VIEW v_fraude_combustible AS
SELECT f.placa, f.marca, s.ciudad as sucursal, c.fecha, c.litros, c.rendimiento_km_l, c.estado_combustible, c.notas
FROM combustible_cargas c
JOIN flota f ON f.id = c.flota_id
LEFT JOIN sucursales s ON s.id = f.sucursal_id
WHERE c.estado_combustible IN ('Sospechoso','Critico')
ORDER BY c.fecha DESC;

-- RLS OFF (desarrollo)
ALTER TABLE sucursales DISABLE ROW LEVEL SECURITY;
ALTER TABLE flota DISABLE ROW LEVEL SECURITY;
ALTER TABLE conductores DISABLE ROW LEVEL SECURITY;
ALTER TABLE combustible_cargas DISABLE ROW LEVEL SECURITY;
ALTER TABLE gps_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE mantenimiento DISABLE ROW LEVEL SECURITY;
ALTER TABLE rutas DISABLE ROW LEVEL SECURITY;

-- SEED 200 UNIDADES DEMO (distribuidas en GDL y Culiacán)
INSERT INTO flota (placa, numero_economico, marca, modelo, anio, estado, sucursal_id, odometro_actual, gps_id, telcel_sim, rendimiento_promedio, consumo_estado, mantenimiento_km, mantenimiento_estado, ultima_lat, ultima_lng)
SELECT
  'FG-' || LPAD(s::TEXT, 4, '0'),
  'FG-' || LPAD(s::TEXT, 4, '0'),
  (ARRAY['Scania','Volvo','Kenworth','Mercedes','Freightliner'])[1+floor(random()*5)::int],
  (ARRAY['R-450','FH-540','T680','Sprinter','Cascadia'])[1+floor(random()*5)::int],
  2020 + floor(random()*5)::int,
  CASE WHEN s <= 114 THEN 'En Ruta' WHEN s <= 114+57 THEN 'En Base' WHEN s <= 114+57+14 THEN 'En Taller' ELSE 'Disponible' END,
  CASE WHEN s <= 120 THEN 1 ELSE 2 END, -- 120 en GDL, 80 en Culiacán
  10000 + floor(random()*90000)::int,
  'TELCEL-' || (9000+s)::TEXT,
  '8952 001012 ' || LPAD((2000+s)::TEXT, 4, '0'),
  8.0 + random()*5, -- 8-13 para promedio 10.80 como demo
  CASE WHEN random()<0.06 THEN 'Sospechoso' WHEN random()<0.10 THEN 'Excedido' WHEN random()<0.15 THEN 'Bajo' ELSE 'Normal' END,
  floor(random()*15000)::int,
  CASE WHEN random()<0.345 THEN 'Vencido' WHEN random()<0.5 THEN 'Próx 1000km' ELSE 'Preventivo' END,
  CASE WHEN s <= 120 THEN 20.6597 + (random()-0.5)*0.5 ELSE 24.8091 + (random()-0.5)*0.5 END,
  CASE WHEN s <= 120 THEN -103.3496 + (random()-0.5)*0.5 ELSE -107.3940 + (random()-0.5)*0.5 END
FROM generate_series(1,200) s;

-- Conductores 20 (10 por sucursal)
INSERT INTO conductores (nombre, licencia, telefono, sucursal_id)
SELECT 'Conductor ' || s::TEXT, 'LIC-' || LPAD(s::TEXT,5,'0'), '33' || LPAD((10000000+floor(random()*90000000)::int)::TEXT,8,'0'), CASE WHEN s<=10 THEN 1 ELSE 2 END
FROM generate_series(1,20) s;

-- Verificacion - Debe dar 200 como tu demo definitivo
SELECT 'SUCURSALES' as tabla, COUNT(*) as total, 'GDL y CLN' as nota FROM sucursales
UNION ALL SELECT 'FLOTA TOTAL', COUNT(*), '200 LIVE como demo' FROM flota
UNION ALL SELECT 'EN RUTA', COUNT(*), '114 como demo' FROM flota WHERE estado='En Ruta'
UNION ALL SELECT 'EN BASE', COUNT(*), '57 como demo' FROM flota WHERE estado='En Base'
UNION ALL SELECT 'EN TALLER', COUNT(*), '14 como demo' FROM flota WHERE estado='En Taller'
UNION ALL SELECT 'SOSPECHOSO', COUNT(*), '12 como demo' FROM flota WHERE consumo_estado='Sospechoso'
UNION ALL SELECT 'VENCIDOS', COUNT(*), '69 como demo' FROM flota WHERE mantenimiento_estado='Vencido'
UNION ALL SELECT 'GDL', COUNT(*), '120 unidades' FROM flota WHERE sucursal_id=1
UNION ALL SELECT 'CULIACAN', COUNT(*), '80 unidades' FROM flota WHERE sucursal_id=2;

SELECT 'FGWAPP V8 - DB LISTA - 200 UNIDADES - ESCALABLE A MILES - GDL + CLN' as status;
