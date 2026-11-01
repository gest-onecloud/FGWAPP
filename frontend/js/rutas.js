/**
 * FGWAPP Fleet Management SPA - V12.3 CLEAN
 * rutas.js - GPS real Supabase ultima_lat/lng, Leaflet OSM sin API KEY
 * Sin Math.random, sin mocks - Pins reales
 * Orden vertical: mapa arriba 500px, derecha Rutas Registradas, abajo tabla Vehiculos en Ruta
 * (R)
 */

let MAP = null;
let MARKERS = {};
let GPS_CACHE = [];
let RUTAS_CACHE = [];

function initRutas() {
  console.log('[RUTAS] initRutas V12.3 CLEAN - OSM sin API KEY');
  initMap();
  loadRutasData();
}

function initMap() {
  const mapEl = document.getElementById('mapa-rutas');
  if (!mapEl) {
    console.warn('[RUTAS] mapa-rutas no encontrado');
    return;
  }
  
  if (MAP) {
    MAP.invalidateSize();
    return;
  }
  
  // Leaflet OSM libre - SIN API KEY
  MAP = L.map('mapa-rutas').setView([20.6597, -103.3496], 11); // GDL centro
  
  L.tileLayer(CONFIG.MAP_TILES, {
    attribution: CONFIG.MAP_ATTRIBUTION,
    maxZoom: 18
  }).addTo(MAP);
  
  console.log('[RUTAS] Mapa OSM iniciado - CartoDB voyager REMOVIDO por API KEY REQUIRED');
}

async function loadRutasData() {
  const tbody = document.getElementById('tbody-rutas');
  const lista = document.getElementById('rutas-lista');
  const kpis = document.getElementById('rutas-kpis');
  
  if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;">Despertando Render, espera 1 min... Cargando GPS LIVE (R)</td></tr>';
  
  try {
    const [gpsData, flotaData, rutasData] = await Promise.all([
      fetchGPS().catch(() => []),
      fetchFlota().catch(() => []),
      fetchRutas().catch(() => [])
    ]);
    
    GPS_CACHE = gpsData;
    RUTAS_CACHE = rutasData;
    
    // Merge flota con gps - ultima_lat/lng real de Supabase
    const flotaConGPS = flotaData.map(f => {
      const gps = gpsData.find(g => g.placa === f.placa || g.placa === f.placa?.toUpperCase());
      return {
        ...f,
        ultima_lat: gps?.ultima_lat || gps?.lat || f.ultima_lat || null,
        ultima_lng: gps?.ultima_lng || gps?.lng || gps?.longitud || f.ultima_lng || null,
        ultima_actualizacion: gps?.ultima_actualizacion || gps?.fecha || gps?.timestamp || f.ultima_actualizacion
      };
    });
    
    const conGPS = flotaConGPS.filter(f => f.ultima_lat && f.ultima_lng);
    const sinGPS = flotaConGPS.filter(f => !f.ultima_lat || !f.ultima_lng);
    
    console.log(`[RUTAS] ${conGPS.length} con GPS real, ${sinGPS.length} sin GPS - TOTAL ${flotaConGPS.length} LIVE`);
    
    renderMapMarkers(conGPS);
    renderRutasKPIs(conGPS, sinGPS, rutasData);
    renderRutasLista(rutasData, conGPS);
    renderRutasTable(conGPS);
    
  } catch (error) {
    console.error('[RUTAS] Error:', error);
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#ef4444;padding:40px;">${error.message}<br><small>GPS real Supabase, no random</small></td></tr>`;
  }
}

function renderMapMarkers(data) {
  if (!MAP) return;
  
  // Limpiar markers previos
  Object.values(MARKERS).forEach(m => MAP.removeLayer(m));
  MARKERS = {};
  
  if (data.length === 0) {
    console.warn('[RUTAS] Sin pins reales para mostrar');
    return;
  }
  
  const group = [];
  
  data.forEach(row => {
    const lat = Number(row.ultima_lat);
    const lng = Number(row.ultima_lng);
    
    if (isNaN(lat) || isNaN(lng)) return;
    
    const marker = L.marker([lat, lng], {
      title: row.placa
    }).addTo(MAP);
    
    marker.bindPopup(`
      <div style="min-width:180px;">
        <strong>${row.placa}</strong><br>
        ${row.marca} ${row.modelo}<br>
        <small>${row.sucursal} - ${row.estado_operativo}</small><br>
        <small>Km: ${row.kilometraje?.toLocaleString() || '-'} - ${row.consumo_promedio?.toFixed(2) || '-'} km/l</small><br>
        <div style="margin-top:6px;display:flex;gap:4px;">
          <button onclick="verHistorialDesdeMapa('${row.placa}')" style="padding:4px 8px;background:#0f172a;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:11px;">Historial</button>
          <button onclick="abrirFichaDesdeMapa('${row.placa}')" style="padding:4px 8px;background:#fff;border:1px solid #e2e8f0;border-radius:4px;cursor:pointer;font-size:11px;">Ficha</button>
        </div>
      </div>
    `);
    
    MARKERS[row.placa] = marker;
    group.push([lat, lng]);
  });
  
  if (group.length > 0) {
    MAP.fitBounds(group, { padding: [40, 40], maxZoom: 14 });
  }
}

function renderRutasKPIs(conGPS, sinGPS, rutas) {
  const kpis = document.getElementById('rutas-kpis');
  if (!kpis) return;
  
  kpis.innerHTML = `
    <div class="stat-card"><label>En Ruta GPS</label><span>${conGPS.length}</span></div>
    <div class="stat-card"><label>Sin GPS</label><span>${sinGPS.length}</span></div>
    <div class="stat-card"><label>Rutas Registradas</label><span>${rutas.length || conGPS.length}</span></div>
    <div class="stat-card"><label>Total Flota</label><span>${conGPS.length + sinGPS.length}</span></div>
  `;
}

function renderRutasLista(rutas, conGPS) {
  const lista = document.getElementById('rutas-lista');
  if (!lista) return;
  
  const data = rutas.length > 0 ? rutas : conGPS.slice(0, 20).map(r => ({
    id: r.placa,
    placa: r.placa,
    origen: r.sucursal,
    destino: 'En Ruta',
    estado: r.estado_operativo,
    ultima_lat: r.ultima_lat,
    ultima_lng: r.ultima_lng
  }));
  
  if (data.length === 0) {
    lista.innerHTML = '<div style="padding:20px;text-align:center;color:#64748b;">No hay rutas con GPS real - Verifique Supabase gps_tracking</div>';
    return;
  }
  
  lista.innerHTML = data.map(r => `
    <div class="ruta-item" onclick="centrarEnPin('${r.placa}')" style="cursor:pointer;padding:10px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <strong>${r.placa || r.id}</strong> - <small>${r.origen || ''} → ${r.destino || 'En Ruta'}</small><br>
        <small style="color:#64748b;">${r.estado || ''} ${r.ultima_lat ? `📍 ${Number(r.ultima_lat).toFixed(4)}, ${Number(r.ultima_lng).toFixed(4)}` : ''}</small>
      </div>
      <span style="font-size:16px;">📍</span>
    </div>
  `).join('');
}

function renderRutasTable(data) {
  const tbody = document.getElementById('tbody-rutas');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  data.slice(0, 200).forEach(row => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.innerHTML = `
      <td><strong>${row.placa}</strong></td>
      <td>${row.marca} ${row.modelo}</td>
      <td>${row.sucursal}</td>
      <td>${row.estado_operativo}</td>
      <td>${row.ultima_lat ? `${Number(row.ultima_lat).toFixed(5)}, ${Number(row.ultima_lng).toFixed(5)}` : 'Sin GPS'}</td>
      <td>${row.kilometraje?.toLocaleString() || '-'} km</td>
      <td><button onclick="centrarEnPin('${row.placa}')" style="padding:4px 8px;background:#0f172a;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:11px;">Ver en Mapa</button></td>
    `;
    tr.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') centrarEnPin(row.placa);
    });
    tbody.appendChild(tr);
  });
  
  // Build filtros Excel rutas
  buildRutasFilterPanels(data);
}

function buildRutasFilterPanels(data) {
  const thead = document.getElementById('thead-rutas');
  if (!thead) return;
  
  const campos = [
    { key: 'placa', label: 'PLACA' },
    { key: 'marca', label: 'MARCA' },
    { key: 'sucursal', label: 'SUCURSAL' },
    { key: 'estado_operativo', label: 'ESTADO' }
  ];
  
  document.querySelectorAll('.excel-panel-header.rutas-panel').forEach(el => el.remove());
  
  const tr = thead.querySelector('tr');
  if (!tr) return;
  const ths = tr.querySelectorAll('th');
  
  campos.forEach((campo, idx) => {
    if (!ths[idx]) return;
    const th = ths[idx];
    th.style.cursor = 'pointer';
    th.innerHTML = `${campo.label} <span style="font-size:10px;">▼</span>`;
    th.onclick = (e) => {
      e.stopPropagation();
      toggleRutasExcelPanel(campo, data, th);
    };
  });
}

function toggleRutasExcelPanel(campo, data, anchorTh) {
  closeAllExcelPanels();
  
  const valores = [...new Set(data.map(d => d[campo.key]).filter(Boolean))].sort();
  const panel = document.createElement('div');
  panel.className = 'excel-panel-header rutas-panel';
  panel.style.cssText = 'position:absolute;min-width:220px;max-height:340px;overflow-y:auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 10px 25px rgba(0,0,0,0.15);z-index:100;padding:8px;';
  
  const rect = anchorTh.getBoundingClientRect();
  panel.style.top = `${rect.bottom + window.scrollY + 4}px`;
  panel.style.left = `${rect.left + window.scrollX}px`;
  
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border-bottom:1px solid #e2e8f0;">
      <strong style="font-size:12px;">${campo.label}</strong>
      <button onclick="closeAllExcelPanels()" style="border:none;background:none;cursor:pointer;">✕</button>
    </div>
    <div style="padding:4px;">
      ${valores.map(v => `<label style="display:flex;gap:6px;font-size:12px;padding:3px 0;"><input type="checkbox" value="${v}" checked class="rutas-filter-cb"> ${v}</label>`).join('')}
    </div>
  `;
  
  document.body.appendChild(panel);
}

// ACCIONES MAPA
function centrarEnPin(placa) {
  const marker = MARKERS[placa];
  if (marker && MAP) {
    MAP.setView(marker.getLatLng(), 15);
    marker.openPopup();
    console.log(`[RUTAS] Centrado en ${placa} - GPS real`);
  } else {
    console.warn(`[RUTAS] Pin ${placa} no encontrado - Sin GPS real`);
    // Intentar buscar en cache
    const row = GPS_CACHE.find(g => g.placa === placa) || {};
    if (row.ultima_lat && MAP) {
      MAP.setView([Number(row.ultima_lat), Number(row.ultima_lng)], 15);
    }
  }
}

function verHistorialDesdeMapa(placa) {
  switchView('combustible');
  setTimeout(() => {
    if (typeof abrirHistorialPorPlaca === 'function') {
      abrirHistorialPorPlaca(placa);
    }
  }, 300);
}

function abrirFichaDesdeMapa(placa) {
  const row = (typeof FLOTA_CACHE !== 'undefined' ? FLOTA_CACHE : []).find(r => r.placa === placa);
  if (row && typeof abrirFicha === 'function') {
    abrirFicha(row);
  } else {
    // Fallback buscar en GPS cache
    const gpsRow = GPS_CACHE.find(g => g.placa === placa);
    if (gpsRow) {
      alert(`Ficha ${placa}\nGPS: ${gpsRow.ultima_lat}, ${gpsRow.ultima_lng}\nDatos completos en vista Flota`);
      switchView('flota');
    }
  }
}
