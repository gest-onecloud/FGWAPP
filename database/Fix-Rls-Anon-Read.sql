-- FGWAPP V12.3.6.3 FIX RLS - Permitir anon key leer flota y combustible
-- Sin esto, fetchDirectSupabase retorna [] aunque tengas 200 y 1600

-- Habilita RLS si no está
ALTER TABLE flota ENABLE ROW LEVEL SECURITY;
ALTER TABLE combustible_cargas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;

-- Borra políticas viejas si existen
DROP POLICY IF EXISTS "Allow anon read flota" ON flota;
DROP POLICY IF EXISTS "Allow anon read combustible" ON combustible_cargas;
DROP POLICY IF EXISTS "Allow anon read sucursales" ON sucursales;
DROP POLICY IF EXISTS "Allow anon all flota" ON flota;
DROP POLICY IF EXISTS "Allow anon all combustible" ON combustible_cargas;

-- Crea políticas que permiten SELECT a anon (tu key eyJ...)
CREATE POLICY "Allow anon read flota" ON flota FOR SELECT USING (true);
CREATE POLICY "Allow anon read combustible" ON combustible_cargas FOR SELECT USING (true);
CREATE POLICY "Allow anon read sucursales" ON sucursales FOR SELECT USING (true);

-- Para vistas, no necesitan RLS, pero por si acaso
-- Verifica que las vistas existan y tengan datos
SELECT 'flota' as tabla, COUNT(*) FROM flota
UNION ALL
SELECT 'combustible_cargas', COUNT(*) FROM combustible_cargas
UNION ALL
SELECT 'sucursales', COUNT(*) FROM sucursales
UNION ALL
SELECT 'v_combustible_con_placa', COUNT(*) FROM v_combustible_con_placa;
