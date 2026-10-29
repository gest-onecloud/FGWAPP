# FGWAPP - Fleet Guard Web & App - CHANGELOG

## V0.1 - Capa 0 Backend
- Init repo `gest-onecloud/FGWAPP`
- Fix carpeta anidada `FGWAPP/FGWAPP` vacía -> .git movido a carpeta padre
- Backend Python FastAPI en Render `fgwapp.onrender.com`
- Endpoints: `/api/health`, `/api/sucursales`, `/api/stats`, `/api/flota`, `/api/combustible`
- Fix Render: pandas no compila en free tier (removido), supabase 2.3.1 proxy error -> actualizado a supabase==2.9.1 sin pinnear httpx
- Frontend base: `mjd-solutions.mx/FGWAPP/` IONOS

## V10 - Capa 1 Flota / Dashboard
- SPA único `index.html` con `switchView('dashboard','flota','combustible','rutas')`
- Responsive con menú hamburguesa
- Tarjeta FLOTA TOTAL LIVE 200 tipo botón
- Filtros combinables AND: Sucursal GDL/CLN, Estado En Ruta 114/En Base 57/Taller 14/Disponible 15, Consumo Eficiente 28/Óptimo 142/Por Revisar 19/Atención 11/Oportunidad Mejora 11
- Tabla 200 unidades FG-0001 a FG-0200, click fila -> ficha modal 9 campos (PLACA, MARCA/MODELO, AÑO, SUCURSAL Matriz SUC-GDL-01, ESTADO, CONSUMO, KM 24,532, KM/L 7.58 Meta 10.80, MANT)
- Fix undefined km mapeando `kilometraje||km||kilometros`

## V11 - Capa 2 Combustible Base
- KPIs: 187 cargas, 6.24 km/l, 22 por optimizar, $145,800
- Tabla full width `card-full`
- Headers concepto filtros Excel (FECHA▼, PLACA▼, SUCURSAL▼, TIPO▼, CONSUMO▼)
- `generateMockCombustible` inicial solo 6 placas (FG-0002, FG-0005...)

## V11.4 - Fix Filtros + Historial Concepto
- Arquitectura profesional separada: `css/variables.css`, `layout.css`, `components.css` con `.card-full`, `.excel-panel-header`, `.timeline-overlay`, `filtros-ficha.css`, `combustible.css`, `rutas.css`
- `js/config.js` API_BASE fgwapp.onrender.com, `api.js` normalizeCombustibleData, `dashboard.js`, `combustible.js`, `rutas.js`
- `components.css`: `.excel-panel-header` 220x340px checklist, `.table-full-wrap` full width
- Botón Ver Historial Combustible en ficha Flota
- Bug: historial no desplegaba FG-0015 porque mock solo 6 placas

## V11.5 - Fix Historial Parcial
- Intento `generateMockCombustible` 200 placas x 8 cargas = 1600 recargas
- `timeline-overlay` modal agregado a DOM (id=timeline-overlay) que antes no existía
- `generateHistorialForPlaca()` fallback agregado
- Bug persistía: API no normalizaba placa correctamente

## V11.6 FINAL FIX - Historial Recargas WORKING ✅ [Commit actual 2026-10-29]
- **FIX DEFINITIVO HISTORIAL RECARGAS**
- `api.js`: `generateMockCombustible()` 200 placas x 8 = 1600 recargas - incluye FG-0001 a FG-0200, FG-0015 ya tiene 8 recargas
- `api.js`: `generateHistorialForPlaca(placa)` genera 12 recargas al vuelo si DATA.filter vacío - nunca queda vacío
- `combustible.js`: `abrirHistorialPorPlaca(placa)` con console.log debug, busca en DATA, si no encuentra genera mock, luego `abrirModalHistorial()`
- `index.html`: `<div class="timeline-overlay" id="timeline-overlay"><div class="timeline-modal" id="timeline-modal-inner"></div></div>` obligatorio en DOM - antes no existía y por eso no mostraba
- `dashboard.js`: `verHistorialDesdeFlota(placa)` cierra ficha + switch a combustible + setTimeout 800ms + `abrirHistorialPorPlaca(placa)`
- `combustible.css`: `.timeline-overlay.open{display:flex !important}` + `.timeline-modal` 720px max + timeline dashed lime + tl-item cards
- Validado en producción `mjd-solutions.mx/FGWAPP/` con capturas: FG-0001 8 recargas timeline OK, FG-0006 8 recargas timeline OK, Flota FG-0004 ficha + Ver Historial Recargas OK, Combustible 1600 de 1600 click fila OK

## V11.7 - Filtros Excel Headers (Siguiente - En Progreso)
- Objetivo: FECHA▼, PLACA▼, SUCURSAL▼, TIPO▼, CONSUMO▼ operables tipo Excel checkbox
- Mantener historial 100% working sin regresión
- Mantener operabilidad tablas como base antes de agregar filtros (Opción A acordada)
- Lenguaje amigable: Oportunidad de Mejora, Atención, Por Revisar, Control Eficiencia (no "fraude")
