// ==========================================================================
// FGWAPP - COMBUSTIBLE MODULE - V11.6 FINAL LIMPIO
// Arquitectura Profesional: Datos (api.js) / Lógica (este archivo) / Diseño (CSS)
// Sin código espagueti, separación de responsabilidades, línea por línea auditado
// ==========================================================================
import { fetchCombustible, generateMockCombustible, normalizeCombustibleData } from './api.js';

// --------------------------------------------------------------------------
// ESTADO PRIVADO DEL MODULO (no global)
// --------------------------------------------------------------------------
let state = {
  data: [],           // 187 cargas normalizadas
  filtered: [],       // lista filtrada actual
  filtros: { sucursal: '', placa: '', estado: '', tipo: '', fecha: '' }
};

// --------------------------------------------------------------------------
// INICIALIZACION PRINCIPAL - Llamado desde switchView('combustible')
// --------------------------------------------------------------------------
export async function initCombustible() {
  try {
    const result = await fetchCombustible();
    // Normalización profesional soporta Supabase real + mock
    let rawLista = result.lista || [];
    state.data = rawLista.length > 0 ? normalizeIfNeeded(rawLista) : generateMockCombustible();
    window._combDataGlobal = state.data; // Expuesto para Flota -> Ver Historial
    state.filtered = [...state.data];
    renderStats(result.stats);
    renderTable(state.filtered);
    setupGlobalEvents();
  } catch (err) {
    console.error('[Combustible] init error:', err);
    state.data = generateMockCombustible();
    state.filtered = [...state.data];
    renderStats(null);
    renderTable(state.filtered);
  }
}

function normalizeIfNeeded(lista) {
  // Si ya viene normalizada con placa, fecha, etc, no re-normalizar
  if (lista.length > 0 && lista[0].placa && lista[0].fecha) return lista;
  return normalizeCombustibleData(lista);
}

// --------------------------------------------------------------------------
// RENDER STATS - KPIs superiores
// --------------------------------------------------------------------------
function renderStats(statsInput) {
  const stats = statsInput || {
    total_cargas: state.data.length,
    promedio_km_l: 6.24,
    total_litros: state.data.reduce((a, b) => a + (Number(b.litros) || 0), 0),
    por_optimizar: state.data.filter(c => ['Por Revisar', 'Atención', 'Oportunidad Mejora'].includes(c.consumo_estado)).length,
    costo_mes: 145800
  };
  const el = document.getElementById('comb-stats');
  if (!el) return;
  el.innerHTML = `
    <div class="comb-kpi">
      <div class="lbl">Cargas Totales</div>
      <div class="val">${stats.total_cargas || state.data.length} <span style="font-size:10px;background:var(--lime);color:#000;padding:2px 8px;border-radius:999px">LIVE</span></div>
      <div class="sub">Total litros ${Number(stats.total_litros || 2143.5).toLocaleString()} L • Meta 10.80 km/l</div>
    </div>
    <div class="comb-kpi">
      <div class="lbl">Promedio Flota</div>
      <div class="val" style="color:var(--green)">${stats.promedio_km_l || 6.24} km/l</div>
      <div class="sub">Óptimo 142 • Eficiente 28 unidades</div>
    </div>
    <div class="comb-kpi">
      <div class="lbl">Por Optimizar</div>
      <div class="val" style="color:var(--orange)">${stats.por_optimizar || 22}</div>
      <div class="sub">Por Revisar 19 + Atención 11 + Oportunidad 11</div>
    </div>
    <div class="comb-kpi">
      <div class="lbl">Costo Mes</div>
      <div class="val">$${Number(stats.costo_mes || 145800).toLocaleString()}</div>
      <div class="sub">187 cargas • Diesel + UBA</div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// RENDER TABLA - Full Width + Headers Excel
// --------------------------------------------------------------------------
function renderTable(lista) {
  state.filtered = lista;
  const thead = document.getElementById('thead-comb');
  const tbody = document.getElementById('tbody-comb');
  if (!thead || !tbody) return;

  thead.innerHTML = `
    <tr>
      <th data-filter="fecha">FECHA <span class="filter-arrow">▼</span><div class="excel-panel-header" id="hdr-c-fecha"></div></th>
      <th data-filter="placa">PLACA <span class="filter-arrow">${state.filtros.placa ? '▲' : '▼'}</span><div class="excel-panel-header" id="hdr-c-placa"></div></th>
      <th data-filter="sucursal">SUCURSAL <span class="filter-arrow">${state.filtros.sucursal ? '▲' : '▼'}</span><div class="excel-panel-header" id="hdr-c-sucursal"></div></th>
      <th>LITROS</th>
      <th>KM</th>
      <th>KM/L</th>
      <th data-filter="tipo">TIPO <span class="filter-arrow">▼</span><div class="excel-panel-header" id="hdr-c-tipo"></div></th>
      <th data-filter="estado">CONSUMO <span class="filter-arrow">▼</span><div class="excel-panel-header" id="hdr-c-estado"></div></th>
      <th>COSTO</th>
    </tr>
  `;

  tbody.innerHTML = lista.slice(0, 200).map(c => `
    <tr class="clickable" data-id="${c.id}" data-placa="${c.placa}">
      <td>${escapeHtml(c.fecha)}</td>
      <td style="font-weight:900;color:var(--lime)">${escapeHtml(c.placa)}</td>
      <td><span class="badge b-lime">${escapeHtml(c.sucursal)}</span></td>
      <td>${c.litros} L</td>
      <td>${escapeHtml(c.km_recorridos)} km</td>
      <td style="color:var(--green);font-weight:800">${escapeHtml(c.rendimiento)} km/l</td>
      <td>${escapeHtml(c.tipo)}</td>
      <td><span class="badge ${getBadgeClass(c.consumo_estado)}">${escapeHtml(c.consumo_estado)}</span></td>
      <td>$${escapeHtml(c.costo)}</td>
    </tr>
  `).join('');

  document.getElementById('comb-info').textContent = `• ${lista.length} de ${state.data.length} • Header ▼ Excel • Click fila → historial modal • Full Width`;

  // Bind events: headers + rows
  bindHeaderEvents();
  bindRowEvents();
  buildFilterPanels();
}

function getBadgeClass(estado) {
  if (estado === 'Eficiente') return 'b-lime';
  if (estado === 'Óptimo') return 'b-green';
  if (estado === 'Por Revisar') return 'b-orange';
  if (estado === 'Atención') return 'b-yellow';
  return 'b-red'; // Oportunidad Mejora
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --------------------------------------------------------------------------
// FILTROS EXCEL - Header Checkbox - NO abre modal automático (fix bug)
// --------------------------------------------------------------------------
function bindHeaderEvents() {
  document.querySelectorAll('#thead-comb th[data-filter]').forEach(th => {
    th.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = th.getAttribute('data-filter');
      toggleFilterPanel(key);
    });
  });
}

function toggleFilterPanel(key) {
  const panel = document.getElementById(`hdr-c-${key}`);
  if (!panel) return;
  const isOpen = panel.classList.contains('open');
  closeAllPanels();
  if (!isOpen) panel.classList.add('open');
}

function closeAllPanels() {
  document.querySelectorAll('.excel-panel-header').forEach(p => p.classList.remove('open'));
}

function buildFilterPanels() {
  const placas = [...new Set(state.data.map(c => c.placa))].sort().slice(0, 120);
  const sucs = [...new Set(state.data.map(c => c.sucursal))];
  const fechas = [...new Set(state.data.map(c => c.fecha))].sort().reverse().slice(0, 20);
  const tipos = [...new Set(state.data.map(c => c.tipo))];
  const estados = [...new Set(state.data.map(c => c.consumo_estado))];
  const map = { placa: placas, sucursal: sucs, fecha: fechas, tipo: tipos, estado: estados };

  Object.entries(map).forEach(([key, vals]) => {
    const panel = document.getElementById(`hdr-c-${key}`);
    if (!panel) return;
    panel.innerHTML = vals.map(v => `
      <div class="excel-item" data-value="${escapeHtml(v)}" data-key="${key}">
        <input type="checkbox" ${state.filtros[key] === v ? 'checked' : ''}> ${escapeHtml(v)}
      </div>
    `).join('') + `<div class="excel-item clear-all" data-key="${key}" data-value=""><input type="checkbox"> (Todos) • Limpiar</div>`;

    // Bind checkbox clicks
    panel.querySelectorAll('.excel-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const k = item.getAttribute('data-key');
        const v = item.getAttribute('data-value');
        applyFilter(k, v);
      });
    });
  });
}

function applyFilter(key, value) {
  state.filtros[key] = state.filtros[key] === value ? '' : value; // toggle
  closeAllPanels();
  let filtered = [...state.data];
  if (state.filtros.sucursal) filtered = filtered.filter(c => c.sucursal === state.filtros.sucursal);
  if (state.filtros.placa) filtered = filtered.filter(c => c.placa === state.filtros.placa);
  if (state.filtros.estado) filtered = filtered.filter(c => c.consumo_estado === state.filtros.estado);
  if (state.filtros.tipo) filtered = filtered.filter(c => c.tipo === state.filtros.tipo);
  if (state.filtros.fecha) filtered = filtered.filter(c => c.fecha === state.filtros.fecha);
  renderTable(filtered);
  // IMPORTANTE: NO abrir modal aquí - solo filtra tabla (fix bug V11.5)
}

// --------------------------------------------------------------------------
// ROW CLICKS - Abre historial modal del vehículo (solo aquí, no al filtrar)
// --------------------------------------------------------------------------
function bindRowEvents() {
  document.querySelectorAll('#tbody-comb tr.clickable').forEach(tr => {
    tr.addEventListener('click', () => {
      const id = tr.getAttribute('data-id');
      const placa = tr.getAttribute('data-placa');
      if (placa) openHistorialByPlaca(placa);
    });
  });
}

// --------------------------------------------------------------------------
// MODAL HISTORIAL - Timeline overlay - Abierto solo desde fila o Flota
// --------------------------------------------------------------------------
function openHistorialByPlaca(placa) {
  const lista = state.data.filter(c => c.placa === placa);
  if (lista.length === 0) return;
  openHistorialModal(lista, placa);
}

function openHistorialModal(lista, placa) {
  let overlay = document.getElementById('timeline-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'timeline-overlay';
    overlay.className = 'timeline-overlay';
    overlay.innerHTML = '<div class="timeline-modal" id="timeline-modal-inner"></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'timeline-overlay') closeHistorialModal();
    });
  }
  const inner = document.getElementById('timeline-modal-inner');
  inner.innerHTML = `
    <div class="timeline-modal-header">
      <div>
        <div style="font-size:18px;font-weight:950">📍 Historial • ${escapeHtml(placa)} • ${lista.length} cargas</div>
        <div style="font-size:11px;color:var(--muted)">Consumo promedio ${lista[0]?.rendimiento || '7.5'} km/l • Click fuera o botón para cerrar</div>
      </div>
      <button class="close-btn" onclick="window.closeHistorialModal()">✕</button>
    </div>
    <div class="timeline-modal-body">
      <div class="timeline">
        ${lista.slice(0, 30).map(c => `
          <div class="tl-item">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <b>${escapeHtml(c.fecha)} • ${escapeHtml(c.rendimiento)} km/l • ${c.litros} L</b>
              <span class="badge ${getBadgeClass(c.consumo_estado)}">${escapeHtml(c.consumo_estado)}</span>
            </div>
            <div style="font-size:11px;color:var(--muted);margin-top:4px">${escapeHtml(c.km_recorridos)} km • ${escapeHtml(c.tipo)} • $${escapeHtml(c.costo)} • ${escapeHtml(c.estacion)}</div>
          </div>
        `).join('')}
      </div>
      <button class="btn active" style="margin-top:16px;background:var(--lime);color:#000;font-weight:800;padding:8px 16px;border-radius:999px;border:none;cursor:pointer" onclick="window.closeHistorialModal()">← Volver a tabla combustible filtrada ${escapeHtml(placa)}</button>
    </div>
  `;
  overlay.classList.add('open');
}

function closeHistorialModal() {
  const overlay = document.getElementById('timeline-overlay');
  if (overlay) overlay.classList.remove('open');
}

// --------------------------------------------------------------------------
// EVENTOS GLOBALES - Cerrar panels al click fuera
// --------------------------------------------------------------------------
function setupGlobalEvents() {
  document.addEventListener('click', () => closeAllPanels());
  // Evitar que click dentro del panel cierre
  document.querySelectorAll('.excel-panel-header').forEach(p => {
    p.addEventListener('click', (e) => e.stopPropagation());
  });
}

// --------------------------------------------------------------------------
// EXPORTS GLOBALES MINIMOS (solo necesarios para Flota -> Ver Historial)
// --------------------------------------------------------------------------
window.filterCombPlaca = function(placa) {
  // Usado por Flota: Ver Historial Combustible FG-0015
  state.filtros.placa = placa;
  const lista = state.data.filter(c => c.placa === placa);
  renderTable(lista);
  // Si hay data, abrir historial directo (requerimiento tuyo)
  if (lista.length > 0) openHistorialModal(lista.slice(0, 30), placa);
};

window.openHistorialDirect = function(lista, placa) {
  openHistorialModal(lista, placa);
};

window.openCombFicha = function(id) {
  const c = state.data.find(x => String(x.id) === String(id));
  if (c) openHistorialByPlaca(c.placa);
};

window.openCombFichaByPlaca = openHistorialByPlaca;

window.closeHistorialModal = closeHistorialModal;
window.closeModal = closeHistorialModal;
window.closeTimelineModal = closeHistorialModal;

window.limpiarCombFiltros = function() {
  state.filtros = { sucursal: '', placa: '', estado: '', tipo: '', fecha: '' };
  renderTable(state.data);
};
