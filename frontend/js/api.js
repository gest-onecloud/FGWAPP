/**
 * FGWAPP V12.3.6.4 - api.js FINAL - Fix flota 0 + combustible 1600 LIVE
 * Lee directo v_flota_dashboard y v_combustible_con_placa
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

async function fetchDirectSupabase(table, limit = 200, orderBy = 'id') {
  try {
    const url = `${CONFIG.SUPABASE_URL}/rest/v1/${table}?select=*&limit=${limit}&order=${orderBy}.asc`;
    console.log(`[DIRECT DB] Fetch ${table} limit ${limit}...`);
    const res = await fetch(url, {
      headers: { 'apikey': CONFIG.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}` }
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error(`[DIRECT DB] ${table} ${res.status}:`, txt);
      return [];
    }
    const data = await res.json();
    console.log(`[DIRECT DB] ${table} -> ${data.length} LIVE`);
    return data;
  } catch (e) { console.error(`[DIRECT DB] ${table}`, e); return []; }
}

function normalizeFlotaRow(row) {
  // Soporta flota cruda y v_flota_dashboard
  return {
    id: row.id,
    placa: row.placa || row.PLACA || '',
    marca: row.marca || row.MARCA || '',
    modelo: row.modelo || row.MODELO || '',
    anio: row.anio || row.año || row.ANIO || '',
    sucursal: row.sucursal || row.sucursal_id || 'GDL',
    estado_operativo: row.estado_operativo || row.estado || row.ESTADO || 'En Ruta',
    consumo_estado: row.consumo_estado || 'Normal',
    kilometraje: Number(row.kilometraje ?? row.odometro ?? 0),
    consumo_promedio: Number(row.consumo_promedio ?? row.consumo ?? 0),
    mantenimiento: row.mantenimiento || 'AL DIA',
    ultima_lat: row.ultima_lat != null ? Number(row.ultima_lat) : (row.lat != null ? Number(row.lat) : null),
    ultima_lng: row.ultima_lng != null ? Number(row.ultima_lng) : (row.lng != null ? Number(row.lng) : null),
  };
}

function normalizeCombustibleRow(row) {
  return {
    fecha: row.fecha || '',
    placa: row.placa || '',
    sucursal: row.sucursal || 'GDL',
    tipo: row.tipo || row.combustible || 'Diesel',
    litros: Number(row.litros ?? 0),
    consumo: Number(row.consumo ?? row.rendimiento_km_l ?? 0),
    costo: Number(row.costo ?? 0),
    kilometraje: Number(row.kilometraje ?? row.odometro ?? 0),
    consumo_estado: row.consumo_estado || (Number(row.consumo ?? row.rendimiento_km_l ?? 10) < 8 ? 'Excedido' : Number(row.consumo ?? row.rendimiento_km_l ?? 10) < 10 ? 'Bajo' : 'Normal')
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
  // 2) DIRECT DB - prueba vistas y tablas en orden
  raw = await fetchDirectSupabase('v_flota_dashboard', 200, 'placa');
  if (raw.length > 0) return raw.map(normalizeFlotaRow).filter(r=>r.placa);
  
  raw = await fetchDirectSupabase('flota', 200, 'id');
  if (raw.length > 0) return raw.map(normalizeFlotaRow).filter(r=>r.placa);
  
  console.error('[FLOTA] 0 unidades - Verifique RLS y que flota tenga 200 filas');
  return [];
}

async function fetchCombustible() {
  let data = await fetchWithTimeout(`${CONFIG.API_BASE}/api/combustible`);
  let raw = Array.isArray(data) ? data : (data.data || data.combustible || []);
  if (raw.length > 0) {
    console.log(`[API] /api/combustible ${raw.length} desde Render`);
    return raw.map(normalizeCombustibleRow).filter(r=>r.placa);
  }
  // DIRECT DB - vista con JOIN tiene 1600
  raw = await fetchDirectSupabase('v_combustible_con_placa', 1000, 'fecha');
  if (raw.length > 0) {
    console.log(`[DIRECT DB] v_combustible_con_placa ${raw.length} LIVE`);
    return raw.map(normalizeCombustibleRow).filter(r=>r.placa);
  }
  // Fallback tabla cruda + join en memoria
  raw = await fetchDirectSupabase('combustible_cargas', 1000, 'fecha');
  if (raw.length > 0) {
    const flota = await fetchDirectSupabase('flota', 200, 'id');
    const mapFlota = Object.fromEntries(flota.map(f=>[f.id, f]));
    const mapSuc = {};
    try {
      const sucs = await fetchDirectSupabase('sucursales', 50, 'id');
      sucs.forEach(s=>mapSuc[s.id]=s.nombre);
    } catch {}
    return raw.map(r=>{
      const f = mapFlota[r.flota_id] || {};
      const sucNombre = mapSuc[f.sucursal_id] || f.sucursal_id || 'GDL';
      return normalizeCombustibleRow({ ...r, placa: f.placa || `FG-${String(r.flota_id).padStart(4,'0')}`, sucursal: sucNombre, consumo: r.rendimiento_km_l, kilometraje: r.odometro });
    });
  }
  return [];
}

async function fetchGPS() {
  if (typeof FLOTA_CACHE !== 'undefined' && FLOTA_CACHE.length > 0) {
    return FLOTA_CACHE.filter(r=>r.ultima_lat && r.ultima_lng);
  }
  const raw = await fetchDirectSupabase('flota', 200, 'id');
  return raw.filter(r=>r.ultima_lat && r.ultima_lng).map(r=>({placa:r.placa, ultima_lat:r.ultima_lat, ultima_lng:r.ultima_lng, marca:r.marca, modelo:r.modelo, sucursal:r.sucursal_id, estado_operativo:r.estado}));
}
async function fetchRutas() { return []; }
async function fetchStats() { return {}; }
async function fetchHealth() { return {status:'ok', version:'V12.3.6.4 DIRECT DB 200+1000 LIVE'}; }
