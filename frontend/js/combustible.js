/**
 * FGWAPP V12.3.4 CLEAN FIX - combustible.js
 * Fix 0 recargas LIVE - Reintento y fallback
 * (R)
 */

let COMB_CACHE = [];
let COMB_FILTERED = [];

function initCombustible() {
  console.log('[COMB] V12.3.4 CLEAN FIX');
  loadCombustibleData();
}

async function loadCombustibleData() {
  const tbody = document.getElementById('tbody-comb');
  const info = document.getElementById('comb-info');
  
  if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;">Cargando 1600 recargas LIVE de Supabase... (R)</td></tr>';
  
  try {
    let data = await fetchCombustible();
    
    // Si viene vacio, reintenta 1 vez despues de 5s (Render cold start)
    if (data.length === 0) {
      console.warn('[COMB] 0 recargas, reintentando en 5s - posible cold start');
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;">0 recargas por ahora, reintentando...<br><small>Backend despertando, espera 1 min (R)</small></td></tr>';
      await new Promise(r => setTimeout(r, 5000));
      data = await fetchCombustible();
    }
    
    COMB_CACHE = data;
    COMB_FILTERED = [...data];
    
    console.log(`[COMB] ${data.length} recargas LIVE`);
    renderStats(COMB_CACHE);
    renderTable(COMB_FILTERED);
    buildPanels(COMB_CACHE);
    
    if (info) info.textContent = data.length > 0 ? `Mostrando ${Math.min(200, COMB_FILTERED.length)} de ${COMB_CACHE.length} - V12.3.4 CLEAN` : `0 recargas - Verifique /api/combustible en backend - V12.3.4`;
  } catch (error) {
    console.error('[COMB] Error:', error);
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#ef4444;padding:24px;">${error.message}<br><small>Reintentando...</small></td></tr>`;
  }
}

function renderStats(data) {
  const container = document.getElementById('comb-stats');
  if (!container) return;
  
  if (data.length === 0) {
    container.innerHTML = `<div class="stat-card"><label>Total Recargas</label><span>0</span></div><div class="stat-card"><label>Estado</label><span style="font-size:14px;">Sin datos - Revisar /api/combustible</span></div>`;
    return;
  }
  
  const totalLitros = data.reduce((s, d) => s + (d.litros || 0), 0);
  const totalCosto = data.reduce((s, d) => s + (d.costo || 0), 0);
  const consumoProm = data.filter(d => d.consumo > 0).reduce((s, d) => s + d.consumo, 0) / (data.filter(d => d.consumo > 0).length || 1);
  const placasUnicas = new Set(data.map(d => d.placa)).size;
  
  container.innerHTML = `
    <div class="stat-card"><label>Total Recargas</label><span>${data.length}</span></div>
    <div class="stat-card"><label>Total Litros</label><span>${totalLitros.toLocaleString(undefined,{maximumFractionDigits:1})} L</span></div>
    <div class="stat-card"><label>Costo Total</label><span>$${totalCosto.toLocaleString(undefined,{maximumFractionDigits:2})}</span></div>
    <div class="stat-card"><label>Consumo Prom</label><span>${consumoProm.toFixed(2)} km/l</span></div>
    <div class="stat-card"><label>Unidades</label><span>${placasUnicas}</span></div>
  `;
}

function renderTable(data) {
  const tbody = document.getElementById('tbody-comb');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#64748b;">No hay recargas LIVE en Supabase<br><small>Tabla combustible_cargas vacia o /api/combustible retorna []</small></td></tr>';
    return;
  }
  
  data.slice(0, 200).forEach(row => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.innerHTML = `
      <td>${formatFecha(row.fecha)}</td>
      <td><strong>${row.placa}</strong></td>
      <td>${row.sucursal}</td>
      <td>${row.tipo}</td>
      <td>${row.litros.toFixed(1)} L</td>
      <td>${row.consumo ? row.consumo.toFixed(2) + ' km/l' : '-'}</td>
      <td>${row.costo ? '$' + row.costo.toFixed(2) : '-'}</td>
    `;
    tr.addEventListener('click', () => abrirHistorialPorPlaca(row.placa));
    tbody.appendChild(tr);
  });
}

function formatFecha(fechaStr) {
  if (!fechaStr) return '-';
  try {
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return String(fechaStr).slice(0, 10);
    return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' });
  } catch { return String(fechaStr).slice(0, 10); }
}

function buildPanels(data) {
  const thead = document.getElementById('thead-comb');
  if (!thead || data.length === 0) return;
  const campos = [
    { key: 'fecha', label: 'FECHA', getVal: (d) => formatFecha(d.fecha) },
    { key: 'placa', label: 'PLACA', getVal: (d) => d.placa },
    { key: 'sucursal', label: 'SUCURSAL', getVal: (d) => d.sucursal },
    { key: 'tipo', label: 'TIPO', getVal: (d) => d.tipo },
    { key: 'consumo', label: 'CONSUMO', getVal: (d) => d.consumo ? `${d.consumo.toFixed(1)} km/l` : 'Sin dato' }
  ];
  document.querySelectorAll('.excel-panel-header.comb-panel').forEach(el => el.remove());
  const tr = thead.querySelector('tr');
  if (!tr) return;
  const ths = tr.querySelectorAll('th');
  campos.forEach((campo, idx) => {
    if (!ths[idx]) return;
    const th = ths[idx];
    th.style.cursor = 'pointer';
    th.innerHTML = `${campo.label} <span style="font-size:10px;">▼</span>`;
    th.onclick = (e) => { e.stopPropagation(); toggleCombExcelPanel(campo, data, th); };
  });
}

function toggleCombExcelPanel(campo, data, anchorTh) {
  closeAllExcelPanels();
  const valores = [...new Set(data.map(d => campo.getVal(d)).filter(Boolean))].sort();
  const panel = document.createElement('div');
  panel.className = 'excel-panel-header comb-panel';
  panel.style.cssText = 'position:absolute;min-width:220px;max-height:340px;overflow-y:auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 10px 25px rgba(0,0,0,0.15);z-index:100;padding:8px;';
  const rect = anchorTh.getBoundingClientRect();
  panel.style.top = `${rect.bottom + window.scrollY + 4}px`;
  panel.style.left = `${rect.left + window.scrollX}px`;
  panel.innerHTML = `<div style="display:flex;justify-content:space-between;padding:4px 8px;border-bottom:1px solid #e2e8f0;"><strong style="font-size:12px;">${campo.label}</strong><button onclick="closeAllExcelPanels()" style="border:none;background:none;cursor:pointer;">✕</button></div><div style="padding:4px;max-height:200px;overflow-y:auto;">${valores.slice(0,100).map(v => `<label><input type="checkbox" value="${v}" checked class="comb-filter-cb"> ${v}</label>`).join('')}</div>`;
  document.body.appendChild(panel);
}

function abrirHistorialPorPlaca(placa) {
  let overlay = document.getElementById('timeline-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'timeline-overlay';
    overlay.className = 'timeline-overlay';
    overlay.innerHTML = '<div class="timeline-modal-inner" id="timeline-modal-inner"></div>';
    document.body.appendChild(overlay);
  }
  let inner = document.getElementById('timeline-modal-inner');
  if (!inner) {
    inner = document.createElement('div');
    inner.id = 'timeline-modal-inner';
    inner.className = 'timeline-modal-inner';
    overlay.innerHTML = '';
    overlay.appendChild(inner);
  }
  const historial = COMB_CACHE.filter(r => r.placa === placa).sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
  if (historial.length === 0) {
    inner.innerHTML = `<div class="timeline-header"><h3>Historial - ${placa}</h3><button onclick="cerrarHistorial()">✕</button></div><div style="padding:40px;text-align:center;">No hay recargas para ${placa}</div><div class="timeline-footer"><button class="btn-secondary" onclick="cerrarHistorial()">Volver a tabla</button></div>`;
  } else {
    const totalLitros = historial.reduce((s,d) => s + d.litros, 0);
    inner.innerHTML = `<div class="timeline-header"><h3>Historial - ${placa} - ${historial.length} recargas</h3><button onclick="cerrarHistorial()">✕</button></div><div class="timeline-summary"><span>Total: ${totalLitros.toFixed(1)} L</span></div><div class="timeline-list">${historial.map(r => `<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><div class="timeline-date">${formatFecha(r.fecha)}</div><div class="timeline-details"><strong>${r.litros.toFixed(1)} L - ${r.tipo}</strong><br><small>${r.sucursal} - ${r.consumo ? r.consumo.toFixed(2) + ' km/l' : ''}</small></div></div></div>`).join('')}</div><div class="timeline-footer"><button class="btn-secondary" onclick="cerrarHistorial()">Volver a tabla</button></div>`;
  }
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cerrarHistorial() {
  const overlay = document.getElementById('timeline-overlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}
