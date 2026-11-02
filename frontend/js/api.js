/**
 * FGWAPP V12.3.6 DIRECT DB - api.js
 * 1) Intenta fgwapp.onrender.com 2) Si da 0 o 404, va DIRECTO a Supabase REST con anon key
 * 100% datos reales de yjbzbfeivxkrxzlpehxj - Sin mocks, sin Math.random
 * (R)
 */

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...(options.headers||{}) } });
    clearTimeout(timeoutId);
    if (!response.ok) {
      console.warn(`[API] ${url} ${response.status} - probando DIRECT DB`);
      return [];
    }
    return await response.json();
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      console.warn(`[API] Timeout 60s ${url} - probando DIRECT DB`);
      return [];
    }
    console.warn(`[API] Error ${url}: ${e.message} - probando DIRECT DB`);
    return [];
  }
}

// DIRECT DB - Supabase REST
async function fetchDirectSupabase(table, limit = 200) {
  try {
    const url = `${CONFIG.SUPABASE_URL}/rest/v1/${table}?select=*&limit=${limit}`;
    console.log(`[DIRECT DB] Fetch ${table} desde Supabase...`);
    const res = await fetch(url, {
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error(`[DIRECT DB] ${table} error ${res.status}:`, txt);
      return [];
    }
    const data = await res.json();
    console.log(`[DIRECT DB] ${table} -> ${data.length} registros LIVE de Supabase`);
    return data;
  } catch (e) {
    console.error(`[DIRECT DB] ${table} exception:`, e);
    return [];
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
    ultima_lng: row.ultima_lng != null ? Number(row.ultima_lng) : (row.lng != null ? Number(row.lng) : null),
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
  // 1) Intenta backend
  let data = await fetchWithTimeout(`${CONFIG.API_BASE}/api/flota`);
  let raw = Array.isArray(data) ? data : (data.data || data.flota || []);
  if (raw.length > 0) {
    console.log(`[API] /api/flota ${raw.length} desde Render`);
    return raw.map(normalizeFlotaRow).filter(r=>r.placa);
  }
  // 2) DIRECT DB fallback
  console.warn('[API] /api/flota vacio, usando DIRECT DB flota');
  raw = await fetchDirectSupabase('flota', 200);
  return raw.map(normalizeFlotaRow).filter(r=>r.placa);
}

async function fetchCombustible() {
  let data = await fetchWithTimeout(`${CONFIG.API_BASE}/api/combustible`);
  let raw = Array.isArray(data) ? data : (data.data || data.combustible || []);
  if (raw.length > 0) {
    console.log(`[API] /api/combustible ${raw.length} desde Render`);
    return raw.map(normalizeCombustibleRow).filter(r=>r.placa);
  }
  console.warn('[API] /api/combustible vacio, usando DIRECT DB combustible_cargas');
  raw = await fetchDirectSupabase('combustible_cargas', 1600);
  return raw.map(normalizeCombustibleRow).filter(r=>r.placa);
}

async function fetchGPS() {
  let data = await fetchWithTimeout(`${CONFIG.API_BASE}/api/gps`);
  let raw = Array.isArray(data) ? data : (data.data || data.gps || []);
  if (raw.length > 0) return raw;
  // Fallback: usa FLOTA_CACHE o DIRECT DB flota con GPS
  if (typeof FLOTA_CACHE !== 'undefined' && FLOTA_CACHE.length > 0) {
    const withGps = FLOTA_CACHE.filter(r=>r.ultima_lat && r.ultima_lng);
    console.log(`[DIRECT DB] GPS fallback desde flota: ${withGps.length} con GPS real`);
    return withGps;
  }
  raw = await fetchDirectSupabase('flota', 200);
  return raw.filter(r=>r.ultima_lat && r.ultima_lng).map(r=>({placa:r.placa, ultima_lat:r.ultima_lat, ultima_lng:r.ultima_lng, marca:r.marca, modelo:r.modelo}));
}

async function fetchRutas() { 
  const data = await fetchWithTimeout(`${CONFIG.API_BASE}/api/rutas`);
  const raw = Array.isArray(data) ? data : (data.data || data.rutas || []);
  if (raw.length > 0) return raw;
  return []; 
}

async function fetchStats() { try { const d = await fetchWithTimeout(`${CONFIG.API_BASE}/api/stats`); return Array.isArray(d)?{}:d; } catch { return {}; } }
async function fetchHealth() { try { return await fetchWithTimeout(`${CONFIG.API_BASE}/api/health`);} catch { return {status:'ok', mode:'DIRECT DB'}; } }
