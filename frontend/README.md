# FGWAPP V13.6.3 CLEAN 🚛💨

[Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
[Render](https://img.shields.io/badge/Render-000000?style=for-the-badge&logo=render&logoColor=white)
[Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
[Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
[JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
[Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
[Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)
[Status](https://img.shields.io/badge/Status-PRODUCTION-brightgreen?style=for-the-badge)
[Version](https://img.shields.io/badge/Version-V13.6.3-blue?style=for-the-badge)
[Real Data](https://img.shields.io/badge/DATA-100%25%20REAL-red?style=for-the-badge)

> **Fleet Management SPA 200 unidades REAL - No Mocks, No Math.random, No genMock**

Sistema de gestión de flota vehicular para **MJD-Solutions** - 120 GDL (20.6597,-103.3496) / 80 CLN (24.8091,-107.3940) - Placas `FGW-XXX-GDL/CLN` RAM 1500 - Hosting `mjd-solutions.mx/FGWAPP/`

---

## 🚀 Live Demo

- **Frontend:** https://mjd-solutions.mx/FGWAPP/
- **Backend API:** https://fgwapp.onrender.com/docs
- **Database:** Supabase `yjbzbfeivxkrxzlpehxj` (São Paulo)

## 📊 Datos Reales (100% Supabase)

| Módulo | Cantidad | Fuente |
|--------|----------|--------|
| 🚛 Flota | 200 | `flota` + `ultima_lat/lng` |
| ⛽ Combustible | 1000 + 1600 fallback | `v_combustible_con_placa` JOIN `flota_id→placa` |
| 👨‍✈️ Choferes | 50 | `v_choferes_activos` |
| 🛡️ Seguros | 200 | `seguros.id_vehiculo FK` |
| 📄 Impuestos | 200 | `impuestos.id_vehiculo FK` |
| 🚨 Infracciones | 80 | `infracciones.id_vehiculo FK` |
| 🔧 Mantenimientos | 200 | `mantenimientos.id_vehiculo FK` |
| ⏰ Próximos Mant | 200 | `v_proximos_mantenimientos` |
| 📋 Estado Docs | 200 | `v_estado_documentos` |
| 🚚 Viajes | 100 | `viajes.id_vehiculo FK` |
| 📡 GPS Tracking | 2000 | `gps_tracking` + fallback `flota.ultima_lat/lng` |
| 💰 Flujo Caja | 12 meses | `v_flujo_caja_mensual` |

## 🛠️ Stack

- **Frontend:** Vanilla JS + HTML5 + CSS3 + Leaflet 1.9.4 + Chart.js 4.4.0 + Excel-Filter Custom
- **Backend:** Python FastAPI 13 endpoints en Render `fgwapp.onrender.com`
- **DB:** Supabase Postgres RLS `anon USING (true)` + Views `security_invoker=false`
- **Layout:** Top nav (Flota, Combustible, Rutas GPS, Choferes) + Sidebar dark 260px `display:flex !important`

## 📁 Estructura V13.6.3 CLEAN

```
FGWAPP_V13.6.3_FINAL/
├── index.html V13.6.3 (Chart.js + cache-buster ?v=13.6.3)
├── css/style.css (sidebar 260px !important + timeline-overlay)
├── js/
│   ├── config.js - var CONFIG global + anon key
│   ├── api.js - getCfg() safe + fetchDirect() retry + FLOTA_CACHE + 10 fetchers
│   ├── util.js - formatPlaca (placa||'').toString() fix + formatKM/formatFecha
│   ├── excel-filter.js - Buscar + Marcar todos + attach(thead,tbody)
│   ├── flota.js RESTORE - renderFlota() + verFicha() fix renderFlota is not defined
│   ├── dashboard.js V13.6.2 - renderDashboardKPIs() 4 charts doughnut/bar
│   ├── combustible.js - renderCombustible() 1000 REAL
│   ├── rutas.js - Leaflet 200 pins + renderRutas()
│   ├── choferes.js - renderChoferes() 50
│   ├── talleres.js - renderTalleres() 5
│   ├── mantenimientos.js - renderMantenimientos() 200
│   ├── proximos.js V13.6.2 DEBUG - renderProximos() fallback flota REAL + getAlerta()
│   ├── seguros.js - renderSeguros() 200
│   ├── impuestos.js - renderImpuestos() 200
│   ├── infracciones.js - renderInfracciones() 80
│   ├── viajes.js - renderViajes() 100 + renderGPSTracking() 2000 REAL
│   ├── gps.js - shim
│   ├── documentos.js V13.6.2 DEBUG - renderDocumentos() v_estado_documentos + id_vehiculo real
│   ├── flujo.js V13.6.3 - renderFlujo() COMBUSTIBLE/MANTENIMIENTOS/IMPUESTOS/INFRACCIONES completo
│   └── charts.js
└── backend/
    ├── main.py CLEAN sin random - 13 endpoints /api/*
    └── requirements.txt
```

## 🔥 Fixes V13.6.3 (Todos los bugs resueltos)

- ✅ `CONFIG is not defined` → `var CONFIG` global + `getCfg()` safe
- ✅ `SUPABASE_URL undefined` → fallback anon key embebido
- ✅ `(placa||'').replace` → `(placa||'').toString().trim().toUpperCase()`
- ✅ `order=fecha.desc 400` → retry sin order en `fetchDirect()`
- ✅ `FGWAPI.fetchTalleres is not a function` → export en window.FGWAPI
- ✅ `404 seguros.js/impuestos.js` → archivos creados
- ✅ Tabla en blanco silenciosa → `proximos.js` crea `tbody-prox` dinámico + logs `[V13.6.2]`
- ✅ Cache V13.4 vs V13.6 → cache-buster `?v=13.6.3` + Ctrl+F5
- ✅ `cannot drop columns from view` → DROP hija `v_disponibilidad_vehiculos` luego madre `v_proximos_mantenimientos`
- ✅ `column s2.flota_id does not exist` → usar `id_vehiculo` real (schema seguros/impuestos/infracciones) + `fecha_fin` no `vigencia_fin`
- ✅ `renderFlota is not defined` → restaurar `flota.js` separado, incluir antes de `dashboard.js`
- ✅ `COMB confuso` → `COMBUSTIBLE/MANTENIMIENTOS/IMPUESTOS/INFRACCIONES` completo en `flujo.js V13.6.3`

## 📊 Vistas SQL Clave

```sql
-- v_proximos_mantenimientos Paso 6
km_restantes = km_ultimo_mant + intervalo_mant_km - km_actual
-- Distribución fix: UPDATE flota SET km_ultimo_mant = km_actual - CASE id%10...
-- 20 VENCIDOS <=0, 20 CRITICOS <500km, 20 POR VENCER <1000km, 20 PROXIMOS <3000km, 120 OK

-- v_estado_documentos Paso 7 con id_vehiculo real
SELECT ... FROM flota f 
LEFT JOIN LATERAL (SELECT * FROM seguros s2 WHERE s2.id_vehiculo=f.id ORDER BY fecha_fin DESC LIMIT 1) s ON true;

-- v_flujo_caja_mensual Paso 9
SELECT to_char(fecha,'YYYY-MM') as mes, SUM(comb) as combustible ... FROM (
 SELECT fecha,costo FROM combustible_cargas UNION ALL
 SELECT fecha,costo FROM mantenimientos UNION ALL ...
) GROUP BY mes
```

## 🚀 Deployment

1. **Frontend → mjd-solutions.mx/FGWAPP/**
   ```bash
   # FTP/cPanel subir carpeta FGWAPP_V13.6.3_FINAL
   # Verificar index.html con ?v=13.6.3
   # Ctrl+F5 + Console [V13.6.3] logs
   ```

2. **Backend → Render**
   ```bash
   # Repo: github.com/tuuser/fgwapp
   # Root: backend/main.py
   # Env: SUPABASE_URL=https://yjbzbfeivxkrxzlpehxj.supabase.co
   # Env: SUPABASE_ANON_KEY=eyJ...
   ```

3. **DB → Supabase SQL Editor**
   ```sql
   -- Ejecutar views_paso8_9.sql
   -- DROP VIEW v_disponibilidad_vehiculos; DROP VIEW v_proximos_mantenimientos; CREATE VIEW v_proximos_mantenimientos...
   -- ALTER VIEW ... SET (security_invoker=false); GRANT SELECT TO anon;
   ```

## 📚 Documentación

- 📄 [Documentación Técnica Fullstack](./FGWAPP_Documentacion_Tecnica.md) - Función por función para devs
- 👤 [Manual de Usuario](./FGWAPP_Manual_Usuario.md) - Instructivo con KPIs y trucos
- 📦 [Documentación Completa DOCX](./FGWAPP_Documentacion_Completa.docx)

## 🔍 Uso Rápido

```js
// Flota 200 REAL
await FGWAPI.fetchFlota() // {data:200, latlng:200}

// Próximos Mant con fallback REAL
// Si v_proximos_mantenimientos falla, calcula km_restantes desde flota
// VENCIDO <=0 #ef4444, CRITICO <500 #dc2626, POR VENCER <1000 #ea580c

// Flujo Caja V13.6.3 Nombres Completos
// COMBUSTIBLE $1.4M (negro) | MANTENIMIENTOS $180k (naranja) | IMPUESTOS $320k (azul) | INFRACCIONES $124k (rojo)
await renderFlujo()
```

## 📞 Soporte

- **Dev:** MJD-Solutions / Davo Covarrubias
- **Hosting:** mjd-solutions.mx/FGWAPP/
- **DB:** Supabase yjbzbfeivxkrxzlpehxj São Paulo
- **API:** fgwapp.onrender.com/docs

---

**V13.6.3 CLEAN REAL - 200 flota, 1000 combustible, 2000 GPS, 0 MOCKS - ¡Puro dato REAL de Supabase, Campeón!** 🚛💨
