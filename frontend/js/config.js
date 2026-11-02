/**
 * FGWAPP V12.3.6 DIRECT DB - config.js
 * Trae directo de Supabase São Paulo - 200 LIVE + GPS REAL
 * (R)
 */
const CONFIG = {
  API_BASE: 'https://fgwapp.onrender.com',
  SUPABASE_URL: 'https://yjbzbfeivxkrxzlpehxj.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqYnpiZmVpdnhrcnh6bHBlaHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMTg0MDcsImV4cCI6MjEwODY5NDQwN30.LCrwlV_Wr41JBidY6IlsZg6Pflzg6CvKFcoYo3XexqU',
  CONSUMO_META: 10.80,
  TIMEOUT_MS: 60000,
  VERSION: 'V12.3.6 DIRECT DB - 200 LIVE + GPS REAL + anon key',
  MAP_TILES: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  MAP_ATTRIBUTION: '© OpenStreetMap contributors - OSM libre sin API KEY'
};
console.log(`%c[CONFIG] ${CONFIG.VERSION} (R)`, 'color:#0f172a;font-weight:bold;');
