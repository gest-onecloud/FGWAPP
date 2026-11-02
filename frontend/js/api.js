/**
 * FGWAPP V12.3.6.2 FINAL - api.js - Lee v_combustible_con_placa con 1600 LIVE
 * (R)
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...(options.headers||{}) } });
    clearTimeout(timeoutId);
    if (!response.ok) return [];
    return await response.json();
  } catch (e) {
    clearTimeout(timeoutId);
    return [];
  }
}

async function fetchDirectSupabase(table, limit = 200) {
  try {
    const url = `${CONFIG.SUPABASE_URL}/rest/v1/${table}?select=*&limit=${limit}&order=fecha.desc`;
    const res = await fetch(url, {
      headers: { 'apikey': CONFIG.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    console.log(`[DIRECT DB] ${table} -> ${data.length} LIVE`);
    return data;
  } catch (e) { return []; }
}

function normalizeFlotaRow(row) {
  return {
    placa: row.placa || row.PLACA || '',
    marca: row.marca || row.MARCA || '',
    modelo: row.modelo || row.MODELO || '',
    anio: row.anio || row.año || '',
    sucursal: row.sucursal || 'GDL',
    estado_operativo: row.estado_operativo || row.estado || 'En Ruta',
    consumo_estado: row.consumo_estado || 'Normal',
    kilometraje: Number(row.kilometraje ?? 0),
    consumo_promedio: Number(row.consumo_promedio ?? 0),
    mantenimiento: row.mantenimiento || 'AL DIA',
    ultima_lat: row.ultima_lat != null ? Number(row.ultima_lat) : null,
    ultima_lng: row.ultima_lng != null ? Number(row.ultima_lng) : null,
  };
}

function normalizeCombustibleRow(row) {
  // Ya viene con placa desde v_combustible_con_placa
  return {
    fecha: row.fecha || '',
    placa: row.placa || '',
    sucursal: row.sucursal || 'GDL',
    tipo: row.tipo || 'Diesel',
    litros: Number(row.litros ?? 0),
    consumo: Number(row.consumo ?? row.rendimiento_km_l ?? 0),
    costo: Number(row.costo ?? 0),
    kilometraje: Number(row.kilometraje ?? row.odometro ?? 0)
  };
}

async function fetchFlota() {
  let data = await fetchWithTimeout(`${CONFIG.API_BASE}/api/flota`);
  let raw = Array.isArray(data) ? data : (data.data || data.flota || []);
  if (raw.length > 0) return raw.map(normalizeFlotaRow).filter(r=>r.placa);
  raw = await fetchDirectSupabase('v_flota_dashboard', 200);
  if (raw.length === 0) raw = await fetchDirectSupabase('flota', 200);
  return raw.map(normalizeFlotaRow).filter(r=>r.placa);
}

async function fetchCombustible() {
  let data = await fetchWithTimeout(`${CONFIG.API_BASE}/api/combustible`);
  let raw = Array.isArray(data) ? data : (data.data || data.combustible || []);
  if (raw.length > 0) return raw.map(normalizeCombustibleRow).filter(r=>r.placa);
  // DIRECT DB - lee la vista con 1600 que acabas de crear
  raw = await fetchDirectSupabase('v_combustible_con_placa', 1600);
  if (raw.length === 0) {
    // Fallback a tabla cruda y luego join en memoria con flota
    raw = await fetchDirectSupabase('combustible_cargas', 1600);
    // Si es cruda, no tiene placa, pero la tabla flota la tiene
    const flota = await fetchDirectSupabase('flota', 200);
    const mapFlota = Object.fromEntries(flota.map(f=>[f.id, f]));
    return raw.map(r=>{
      const f = mapFlota[r.flota_id] || {};
      return normalizeCombustibleRow({ ...r, placa: f.placa || `FG-${String(r.flota_id).padStart(4,'0')}`, sucursal: f.sucursal_id || 'GDL' });
    });
  }
  return raw.map(normalizeCombustibleRow).filter(r=>r.placa);
}

async function fetchGPS() {
  if (typeof FLOTA_CACHE !== 'undefined' && FLOTA_CACHE.length > 0) {
    return FLOTA_CACHE.filter(r=>r.ultima_lat && r.ultima_lng);
  }
  const raw = await fetchDirectSupabase('flota', 200);
  return raw.filter(r=>r.ultima_lat && r.ultima_lng);
}
async function fetchRutas() { return []; }
async function fetchStats() { return {}; }
async function fetchHealth() { return {status:'ok', version:'V12.3.6.2 DIRECT DB 1600 LIVE'}; }
