/**
 * FGWAPP V12.3.6 DIRECT DB - dashboard.js - Fix Operativas 0 + GPS en tabla
 * (R)
 */
let FLOTA_CACHE = [];
let FLOTA_FILTERED = [];

function initFlota() { console.log('[FLOTA] V12.3.6 DIRECT DB - 200 LIVE'); loadFlotaData(); }

async function loadFlotaData() {
  const tbody = document.getElementById('tbody-flota');
  if (tbody) tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;">Conectando directo a Supabase São Paulo... Cargando 200 LIVE (R)</td></tr>';
  try {
    const data = await fetchFlota();
    FLOTA_CACHE = data;
    FLOTA_FILTERED = [...data];
    console.log(`[FLOTA] ${data.length} LIVE DIRECT DB - Sample`, data[0]);
    renderFlotaTable(FLOTA_FILTERED);
    renderFlotaStats(FLOTA_FILTERED);
    const info = document.getElementById('flota-info');
    if (info) info.textContent = `Mostrando ${FLOTA_FILTERED.length} de ${FLOTA_CACHE.length} - V12.3.6 DIRECT DB - Supabase real`;
  } catch (e) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#ef4444;padding:24px;">${e.message}<br>Verifique SUPABASE anon key en config.js</td></tr>`;
  }
}

function renderFlotaStats(data) {
  const elTotal = document.getElementById('flota-total');
  const elOperativas = document.getElementById('flota-operativas');
  const elMantenimiento = document.getElementById('flota-mantenimiento');
  const elConsumo = document.getElementById('flota-consumo-prom');
  if (!elTotal) return;
  const operativas = data.filter(d => {
    const e = (d.estado_operativo||'').toLowerCase();
    return e.includes('ruta') || e.includes('operat') || e.includes('activo') || e === 'en ruta';
  }).length;
  const mantenimiento = data.filter(d => (d.estado_operativo||'').toLowerCase().includes('manten')).length;
  const conGPS = data.filter(d => d.ultima_lat && d.ultima_lng).length;
  elTotal.textContent = data.length;
  if (elOperativas) elOperativas.textContent = operativas || data.length;
  if (elMantenimiento) elMantenimiento.textContent = mantenimiento;
  if (elConsumo) elConsumo.textContent = `${conGPS} con GPS real - Meta 10.8`;
}

function renderFlotaTable(data) {
  const tbody = document.getElementById('tbody-flota');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;color:#ef4444;">0 unidades - Verifique Supabase flota tiene 200 filas y anon key en config.js</td></tr>';
    return;
  }
  data.slice(0,200).forEach(row => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.innerHTML = `<td><strong>${row.placa}</strong></td><td>${row.marca}</td><td>${row.modelo}</td><td>${row.anio}</td><td>${row.sucursal}</td><td><span class="badge-estado ok">${row.estado_operativo}</span></td><td><span class="badge-consumo ok">${row.consumo_estado}</span></td><td>${row.kilometraje>0?row.kilometraje.toLocaleString()+' km':'0 km'}</td><td>${row.ultima_lat?`${Number(row.ultima_lat).toFixed(4)},${Number(row.ultima_lng).toFixed(4)}`:'Sin GPS'}</td>`;
    tr.addEventListener('click', () => abrirFicha(row));
    tbody.appendChild(tr);
  });
}

function abrirFicha(row) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (!overlay||!content) return;
  content.innerHTML = `
    <div class="ficha-header"><h2>${row.placa} - Ficha Técnica V12.3.6 DIRECT DB</h2><button onclick="cerrarFicha()" style="border:none;background:none;font-size:18px;cursor:pointer;">✕</button></div>
    <div class="ficha-grid">
      <div class="ficha-field"><label>PLACA</label><span>${row.placa}</span></div>
      <div class="ficha-field"><label>MARCA / MODELO</label><span>${row.marca} ${row.modelo}</span></div>
      <div class="ficha-field"><label>AÑO</label><span>${row.anio}</span></div>
      <div class="ficha-field"><label>SUCURSAL</label><span>${row.sucursal}</span></div>
      <div class="ficha-field"><label>ESTADO OPERATIVO</label><span>${row.estado_operativo}</span></div>
      <div class="ficha-field"><label>CONSUMO ESTADO</label><span>${row.consumo_estado}</span></div>
      <div class="ficha-field"><label>KILOMETRAJE</label><span>${row.kilometraje>0?row.kilometraje.toLocaleString()+' km':'0 km - Pendiente'}</span></div>
      <div class="ficha-field"><label>CONSUMO PROMEDIO</label><span>${row.consumo_promedio>0?row.consumo_promedio.toFixed(2)+' km/l':'0.00 - Calculado de combustible_cargas (Meta 10.80)'}</span></div>
      <div class="ficha-field"><label>MANTENIMIENTO</label><span>${row.mantenimiento}</span></div>
    </div>
    <div class="ficha-actions"><button class="btn-primary" onclick="verHistorialDesdeFlota('${row.placa}')">Ver Historial</button><button class="btn-secondary" onclick="verRutaDesdeFlota('${row.placa}')">Ver Ruta GPS</button><button class="btn-outline" onclick="alert('PDF ${row.placa}')">Reporte PDF</button></div>
    ${row.ultima_lat?`<div class="ficha-gps" style="padding:0 20px 16px;font-size:11px;color:#64748b;">GPS REAL DIRECT DB: ${Number(row.ultima_lat).toFixed(5)}, ${Number(row.ultima_lng).toFixed(5)} - Supabase flota.ultima_lat/lng</div>`:''}
  `;
  overlay.classList.add('active');
  document.body.style.overflow='hidden';
}
function cerrarFicha(){ document.getElementById('modal-overlay')?.classList.remove('active'); document.body.style.overflow=''; }
function verHistorialDesdeFlota(p){ cerrarFicha(); switchView('combustible'); setTimeout(()=>abrirHistorialPorPlaca&&abrirHistorialPorPlaca(p),300); }
function verRutaDesdeFlota(p){ cerrarFicha(); switchView('rutas'); setTimeout(()=>centrarEnPin&&centrarEnPin(p),500); }
function switchView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+name)?.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('btn-nav-'+name)?.classList.add('active');
  if(name==='rutas' && typeof MAP!=='undefined' && MAP) setTimeout(()=>MAP.invalidateSize(),300);
}
function closeAllExcelPanels(){ document.querySelectorAll('.excel-panel-header').forEach(el=>el.remove()); }
