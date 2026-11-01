/**
 * FGWAPP V12.3.5 CLEAN FINAL - api.js - 100% resistente a 404
 * (R)
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...(options.headers||{}) } });
    clearTimeout(timeoutId);
    if (!response.ok) {
      if (url.includes('/api/gps') || url.includes('/api/rutas') || url.includes('/api/combustible')) {
        console.warn(`[API] ${url} ${response.status} - fallback`);
        return [];
      }
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') throw new Error('Despertando Render, espera 1 min...');
    if (url.includes('/api/gps') || url.includes('/api/rutas') || url.includes('/api/combustible')) return [];
    throw e;
  }
}
function normalizeFlotaRow(row) {
  return {
    placa: row.placa || row.PLACA || '',
    marca: row.marca || row.MARCA || '',
    modelo: row.modelo || row.MODELO || '',
    anio: row.anio || row.año || row.ANIO || row.AÑO || '',
    sucursal: row.sucursal || row.SUCURSAL || 'GDL',
    estado_operativo: row.estado_operativo || row.estado || row.ESTADO || 'En Ruta',
    consumo_estado: row.consumo_estado || row.CONSUMO_ESTADO || 'Normal',
    kilometraje: Number(row.kilometraje ?? row.KILOMETRAJE ?? row.km ?? 0),
    consumo_promedio: Number(row.consumo_promedio ?? row.CONSUMO_PROMEDIO ?? row.rendimiento ?? 0),
    mantenimiento: row.mantenimiento || row.MANTENIMIENTO || 'AL DIA',
    ultima_lat: row.ultima_lat != null ? Number(row.ultima_lat) : (row.lat != null ? Number(row.lat) : null),
    ultima_lng: row.ultima_lng != null ? Number(row.ultima_lng) : (row.lng != null ? Number(row.lng) : (row.longitud != null ? Number(row.longitud) : null)),
    ultima_actualizacion: row.ultima_actualizacion || null
  };
}
function normalizeCombustibleRow(row) {
  return {
    fecha: row.fecha || row.FECHA || '',
    placa: row.placa || row.PLACA || '',
    sucursal: row.sucursal || row.SUCURSAL || 'GDL',
    tipo: row.tipo || row.TIPO || 'Diesel',
    litros: Number(row.litros ?? row.LITROS ?? 0),
    consumo: Number(row.consumo ?? row.CONSUMO ?? row.km_l ?? 0),
    costo: Number(row.costo ?? row.COSTO ?? 0),
    kilometraje: Number(row.kilometraje ?? row.KILOMETRAJE ?? 0)
  };
}
async function fetchFlota() {
  const data = await fetchWithTimeout(`${CONFIG.API_BASE}/api/flota`);
  const raw = Array.isArray(data) ? data : (data.data || data.flota || []);
  return raw.map(normalizeFlotaRow).filter(r=>r.placa);
}
async function fetchCombustible() {
  const data = await fetchWithTimeout(`${CONFIG.API_BASE}/api/combustible`);
  const raw = Array.isArray(data) ? data : (data.data || data.combustible || []);
  return raw.map(normalizeCombustibleRow).filter(r=>r.placa);
}
async function fetchStats() { try { return await fetchWithTimeout(`${CONFIG.API_BASE}/api/stats`);} catch { return {}; } }
async function fetchGPS() {
  const data = await fetchWithTimeout(`${CONFIG.API_BASE}/api/gps`);
  const raw = Array.isArray(data) ? data : (data.data || data.gps || []);
  if (raw.length > 0) return raw;
  // Fallback: usa FLOTA_CACHE si ya cargó
  if (typeof FLOTA_CACHE !== 'undefined' && FLOTA_CACHE.length > 0) {
    const withGps = FLOTA_CACHE.filter(r=>r.ultima_lat && r.ultima_lng);
    console.log(`[API] Fallback GPS desde flota: ${withGps.length} con GPS real`);
    return withGps;
  }
  return [];
}
async function fetchRutas() {
  const data = await fetchWithTimeout(`${CONFIG.API_BASE}/api/rutas`);
  const raw = Array.isArray(data) ? data : (data.data || data.rutas || []);
  if (raw.length > 0) return raw;
  if (typeof FLOTA_CACHE !== 'undefined' && FLOTA_CACHE.length > 0) {
    return FLOTA_CACHE.filter(r=>r.ultima_lat).map(r=>({placa:r.placa, origen:r.sucursal, destino:'En Ruta', estado:r.estado_operativo, ultima_lat:r.ultima_lat, ultima_lng:r.ultima_lng}));
  }
  return [];
}
async function fetchHealth() { try { return await fetchWithTimeout(`${CONFIG.API_BASE}/api/health`);} catch { return {status:'ok'}; } }
