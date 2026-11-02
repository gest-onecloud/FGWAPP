/**
 * FGWAPP V12.3.6.4 - combustible.js - Filtros Excel con Buscar + Marcar/Desmarcar todos
 * (R)
 */
let COMB_CACHE = [];
let COMB_FILTERED = [];
let COMB_ACTIVE_FILTERS = {};

function initCombustible() { loadCombustibleData(); }

async function loadCombustibleData() {
  const tbody = document.getElementById('tbody-comb');
  if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;">Cargando v_combustible_con_placa 1600 LIVE...</td></tr>';
  try {
    const data = await fetchCombustible();
    COMB_CACHE = data;
    COMB_FILTERED = [...data];
    renderCombStats(COMB_CACHE);
    renderCombTable(COMB_FILTERED);
    buildCombPanels(COMB_CACHE);
    const info = document.getElementById('comb-info');
    if (info) info.textContent = `${COMB_FILTERED.length} de ${COMB_CACHE.length} - V12.3.6.4 Filtros con Buscar`;
  } catch (e) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#ef4444;">${e.message}</td></tr>`;
  }
}

function renderCombStats(data) {
  const totalEl = document.getElementById('comb-total');
  if (!totalEl) {
    const container = document.getElementById('comb-stats');
    if (!container) return;
    const totalLitros = data.reduce((s,d)=>s+(d.litros||0),0);
    const totalCosto = data.reduce((s,d)=>s+(d.costo||0),0);
    const prom = data.filter(d=>d.consumo>0).reduce((s,d)=>s+d.consumo,0)/(data.filter(d=>d.consumo>0).length||1);
    const unidades = new Set(data.map(d=>d.placa)).size;
    container.innerHTML = `
      <div class="stat-card"><label>TOTAL RECARGAS</label><span>${data.length}</span></div>
      <div class="stat-card"><label>TOTAL LITROS</label><span>${totalLitros.toLocaleString(undefined,{maximumFractionDigits:0})} L</span></div>
      <div class="stat-card"><label>COSTO TOTAL</label><span>$${totalCosto.toLocaleString(undefined,{maximumFractionDigits:2})}</span></div>
      <div class="stat-card"><label>CONSUMO PROM</label><span>${prom.toFixed(2)} km/l</span></div>
      <div class="stat-card"><label>UNIDADES</label><span>${unidades}</span></div>
    `;
    return;
  }
  const totalLitros = data.reduce((s,d)=>s+(d.litros||0),0);
  const totalCosto = data.reduce((s,d)=>s+(d.costo||0),0);
  const prom = data.filter(d=>d.consumo>0).reduce((s,d)=>s+d.consumo,0)/(data.filter(d=>d.consumo>0).length||1);
  const unidades = new Set(data.map(d=>d.placa)).size;
  document.getElementById('comb-total').textContent = data.length;
  document.getElementById('comb-litros').textContent = `${totalLitros.toLocaleString(undefined,{maximumFractionDigits:0})} L`;
  document.getElementById('comb-costo').textContent = `$${totalCosto.toLocaleString(undefined,{maximumFractionDigits:2})}`;
  document.getElementById('comb-prom').textContent = `${prom.toFixed(2)} km/l`;
  const unidadesEl = document.getElementById('comb-unidades');
  if (unidadesEl) unidadesEl.textContent = unidades;
}

function renderCombTable(data) {
  const tbody = document.getElementById('tbody-comb');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;">No hay recargas con filtros actuales</td></tr>';
    return;
  }
  data.slice(0,300).forEach(row=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${formatFecha(row.fecha)}</td><td><strong>${row.placa}</strong></td><td>${row.sucursal}</td><td>${row.tipo||'Diesel'}</td><td>${(row.litros||0).toFixed(1)} L</td><td>${(row.consumo||0).toFixed(2)} km/l</td><td>$${(row.costo||0).toFixed(2)}</td>`;
    tbody.appendChild(tr);
  });
}

function formatFecha(f) {
  if (!f) return '-';
  try { const d=new Date(f); if(isNaN(d.getTime())) return String(f).slice(0,10); return d.toLocaleDateString('es-MX',{year:'numeric',month:'short',day:'2-digit'}); } catch { return String(f).slice(0,10); }
}

function buildCombPanels(data) {
  const thead = document.getElementById('thead-comb');
  if (!thead) return;
  const campos = [
    { key:'fecha', label:'FECHA', getVal:d=>formatFecha(d.fecha) },
    { key:'placa', label:'PLACA', getVal:d=>d.placa },
    { key:'sucursal', label:'SUCURSAL', getVal:d=>d.sucursal },
    { key:'tipo', label:'TIPO', getVal:d=>d.tipo||'Diesel' },
    { key:'consumo', label:'CONSUMO', getVal:d=>d.consumo?`${d.consumo.toFixed(0)} km/l`:'' },
    { key:'consumo_estado', label:'CONSUMO ESTADO', getVal:d=>d.consumo_estado||'' },
    { key:'costo', label:'COSTO', getVal:d=>d.costo?`$${Math.floor(d.costo/500)*500}`:'' }
  ];
  document.querySelectorAll('.excel-panel-header.comb-panel').forEach(el=>el.remove());
  const tr = thead.querySelector('tr');
  if (!tr) return;
  const ths = tr.querySelectorAll('th');
  campos.forEach((campo,idx)=>{
    if (!ths[idx]) return;
    const th = ths[idx];
    th.style.cursor='pointer';
    const active = COMB_ACTIVE_FILTERS[campo.key] && COMB_ACTIVE_FILTERS[campo.key].size>0;
    th.innerHTML = `${campo.label} <span style="font-size:10px;">▼</span>${active?'<span style="color:#0f172a;"> ●</span>':''}`;
    th.onclick = (e)=>{ e.stopPropagation(); toggleCombExcelPanel(campo, data, th); };
  });
}

function toggleCombExcelPanel(campo, data, anchorTh) {
  closeAllExcelPanels();
  const valores = [...new Set(data.map(d=>campo.getVal(d)).filter(Boolean))].sort();
  const panel = document.createElement('div');
  panel.className = 'excel-panel-header comb-panel';
  panel.style.cssText = 'position:absolute;min-width:280px;max-width:380px;max-height:420px;overflow:hidden;background:#fff;border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 10px 25px rgba(0,0,0,0.15);z-index:100;display:flex;flex-direction:column;';
  const rect = anchorTh.getBoundingClientRect();
  panel.style.top = `${rect.bottom + window.scrollY + 4}px`;
  panel.style.left = `${rect.left + window.scrollX}px`;
  
  const activeSet = COMB_ACTIVE_FILTERS[campo.key] || new Set(valores);
  
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #e2e8f0;background:#f8fafc;">
      <strong style="font-size:12px;">${campo.label}</strong>
      <button onclick="closeAllExcelPanels()" style="border:none;background:none;cursor:pointer;font-size:14px;">✕</button>
    </div>
    <div style="padding:8px;border-bottom:1px solid #f1f5f9;">
      <input type="text" placeholder="Buscar..." id="excel-search-${campo.key}" style="width:100%;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;" />
      <div style="display:flex;gap:6px;margin-top:6px;">
        <button id="btn-marcar-${campo.key}" style="flex:1;padding:4px 8px;font-size:11px;border:1px solid #e2e8f0;border-radius:4px;background:#fff;cursor:pointer;">Marcar todos</button>
        <button id="btn-desmarcar-${campo.key}" style="flex:1;padding:4px 8px;font-size:11px;border:1px solid #e2e8f0;border-radius:4px;background:#fff;cursor:pointer;">Desmarcar todos</button>
      </div>
    </div>
    <div id="excel-list-${campo.key}" style="padding:8px;max-height:240px;overflow-y:auto;flex:1;">
      ${valores.map(v=>`<label class="excel-item" data-val="${String(v).toLowerCase()}" style="display:flex;align-items:center;gap:6px;font-size:12px;padding:3px 0;cursor:pointer;"><input type="checkbox" value="${String(v).replace(/"/g,'&quot;')}" ${activeSet.has(v)?'checked':''} class="excel-cb"> <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${v}</span></label>`).join('')}
    </div>
    <div style="padding:8px;border-top:1px solid #e2e8f0;display:flex;gap:6px;background:#f8fafc;">
      <button id="btn-aplicar-${campo.key}" style="flex:1;padding:6px 12px;font-size:12px;background:#0f172a;color:#fff;border:none;border-radius:6px;cursor:pointer;">Aplicar</button>
      <button id="btn-limpiar-${campo.key}" style="flex:1;padding:6px 12px;font-size:12px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;">Limpiar</button>
    </div>
  `;
  document.body.appendChild(panel);
  
  // Buscador
  const searchInput = panel.querySelector(`#excel-search-${campo.key}`);
  searchInput.addEventListener('input', ()=>{
    const q = searchInput.value.toLowerCase();
    panel.querySelectorAll('.excel-item').forEach(label=>{
      const val = label.getAttribute('data-val');
      label.style.display = val.includes(q) ? 'flex' : 'none';
    });
  });
  searchInput.focus();
  
  // Marcar/desmarcar
  panel.querySelector(`#btn-marcar-${campo.key}`).onclick = ()=>{
    panel.querySelectorAll('.excel-item:not([style*="display: none"]) .excel-cb').forEach(cb=>cb.checked=true);
  };
  panel.querySelector(`#btn-desmarcar-${campo.key}`).onclick = ()=>{
    panel.querySelectorAll('.excel-item:not([style*="display: none"]) .excel-cb').forEach(cb=>cb.checked=false);
  };
  
  // Aplicar
  panel.querySelector(`#btn-aplicar-${campo.key}`).onclick = ()=>{
    const selected = new Set([...panel.querySelectorAll('.excel-cb:checked')].map(cb=>cb.value));
    if (selected.size === valores.length || selected.size === 0) {
      delete COMB_ACTIVE_FILTERS[campo.key];
    } else {
      COMB_ACTIVE_FILTERS[campo.key] = selected;
    }
    applyCombFilters();
    closeAllExcelPanels();
  };
  
  panel.querySelector(`#btn-limpiar-${campo.key}`).onclick = ()=>{
    delete COMB_ACTIVE_FILTERS[campo.key];
    applyCombFilters();
    closeAllExcelPanels();
  };
}

function applyCombFilters() {
  let filtered = [...COMB_CACHE];
  Object.entries(COMB_ACTIVE_FILTERS).forEach(([key, set])=>{
    const campo = { fecha:{getVal:d=>formatFecha(d.fecha)}, placa:{getVal:d=>d.placa}, sucursal:{getVal:d=>d.sucursal}, tipo:{getVal:d=>d.tipo||'Diesel'}, consumo:{getVal:d=>d.consumo?`${d.consumo.toFixed(0)} km/l`:''}, consumo_estado:{getVal:d=>d.consumo_estado||''}, costo:{getVal:d=>d.costo?`$${Math.floor(d.costo/500)*500}`:''} }[key];
    if (!campo) return;
    filtered = filtered.filter(d=>set.has(campo.getVal(d)));
  });
  COMB_FILTERED = filtered;
  renderCombTable(COMB_FILTERED);
  renderCombStats(COMB_FILTERED);
  buildCombPanels(COMB_CACHE);
}

function abrirHistorialPorPlaca(placa) {
  const filtered = COMB_CACHE.filter(r=>r.placa===placa);
  alert(`Historial ${placa}: ${filtered.length} recargas\nTotal: ${filtered.reduce((s,d)=>s+d.litros,0).toFixed(1)} L\nProm: ${(filtered.reduce((s,d)=>s+d.consumo,0)/(filtered.length||1)).toFixed(2)} km/l`);
}
function cerrarHistorial(){ document.getElementById('timeline-overlay')?.classList.remove('active'); document.body.style.overflow=''; }
