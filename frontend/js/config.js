/**
 * FGWAPP Fleet Management SPA - V12.3 CLEAN
 * config.js - Configuración única sin mocks
 * (R) Respeto - Sin prisa, datos reales
 */
const CONFIG = {
  API_BASE: "https://fgwapp.onrender.com",
  SUPABASE_URL: "https://yjbzbfeivxkrxzlpehxj.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqYnpiZmVpdnhrcnh6bHBlaHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NjQ3MTYsImV4cCI6MjA0OTM0MDcxNn0.placeholder", // No se usa directo, backend lo gestiona
  VERSION: "V12.3 CLEAN - RUTAS GPS 200 LIVE",
  TIMEOUT_MS: 60000,
  FLOTA_ESPERADA: 200,
  COMBUSTIBLE_ESPERADO: 1600,
  MAP_TILES: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  MAP_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  CONSUMO_META: 10.80
};

Object.freeze(CONFIG);
