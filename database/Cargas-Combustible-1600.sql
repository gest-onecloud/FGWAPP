-- FGWAPP V12.3.6.2 FIX FINAL - columnas reales: anio sin ñ, sucursal_id
-- Ya tienes 1600 registros en combustible_cargas, ahora solo vistas

DROP VIEW IF EXISTS v_combustible_con_placa;
DROP VIEW IF EXISTS v_flota_dashboard;
DROP VIEW IF EXISTS v_fraude_combustible;

-- Vista combustible con placa + sucursal
CREATE OR REPLACE VIEW v_combustible_con_placa AS
SELECT 
  cc.id,
  f.placa,
  COALESCE(s.nombre, s.id::text, f.sucursal_id::text, 'GDL') as sucursal,
  cc.fecha,
  cc.litros,
  cc.costo,
  cc.odometro as kilometraje,
  cc.km_recorridos,
  cc.rendimiento_km_l as consumo,
  CASE 
    WHEN cc.rendimiento_km_l < 8 THEN 'Excedido'
    WHEN cc.rendimiento_km_l < 10 THEN 'Bajo'
    ELSE 'Normal'
  END as consumo_estado
FROM combustible_cargas cc
JOIN flota f ON f.id = cc.flota_id
LEFT JOIN sucursales s ON s.id = f.sucursal_id
ORDER BY cc.fecha DESC;

-- Vista flota dashboard - usando anio sin ñ y sin acentos
CREATE OR REPLACE VIEW v_flota_dashboard AS
SELECT 
  f.id,
  f.placa,
  f.marca,
  f.modelo,
  f.anio,
  COALESCE(s.nombre, f.sucursal_id::text) as sucursal,
  f.estado as estado_operativo,
  f.ultima_lat,
  f.ultima_lng,
  COALESCE(AVG(cc.rendimiento_km_l), 0) as consumo_promedio,
  COALESCE(MAX(cc.odometro), 0) as kilometraje,
  COUNT(cc.id) as total_cargas
FROM flota f
LEFT JOIN sucursales s ON s.id = f.sucursal_id
LEFT JOIN combustible_cargas cc ON cc.flota_id = f.id
GROUP BY f.id, s.nombre, f.placa, f.marca, f.modelo, f.anio, f.sucursal_id, f.estado, f.ultima_lat, f.ultima_lng
ORDER BY f.placa;

-- Verifica que si existen
SELECT 'v_combustible_con_placa' as vista, COUNT(*) as registros FROM v_combustible_con_placa;
