import { CONFIG } from './config.js';

export async function fetchJSON(path){
  const r = await fetch(CONFIG.API_BASE + path);
  if(!r.ok) throw new Error(`API ${path} ${r.status}`);
  return r.json();
}

export async function loadDashboardData(){
  const [stats, sucursales, flota] = await Promise.all([
    fetchJSON("/api/stats"),
    fetchJSON("/api/sucursales"),
    fetchJSON("/api/flota")
  ]);
  return { stats, sucursales, flota };
}

export function mapEficiencia(estado){
  return CONFIG.LENGUAJE_AMIGABLE[estado] || estado;
}
