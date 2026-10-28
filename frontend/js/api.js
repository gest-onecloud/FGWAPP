import { CONFIG } from './config.js';
export async function fetchStats(){
  try{ const r = await fetch(CONFIG.API_BASE+"/api/stats"); if(!r.ok) throw new Error(); return await r.json(); }catch(e){ return {total:200,en_ruta:114,en_base:57,en_taller:14,disponible:15,gdl:120,culiacan:80,eficiente:28,optimo:142,por_revisar:19,atencion:11,oportunidad_mejora:11,vencidos:65}; }
}
export async function fetchFlota(){
  try{ const r = await fetch(CONFIG.API_BASE+"/api/flota"); if(!r.ok) throw new Error(); const data = await r.json(); return Array.isArray(data)?data:(data.data||[]); }catch(e){ return generateMockFlota(); }
}
export async function fetchCombustible(){
  try{
    const r1 = await fetch(CONFIG.API_BASE+"/api/combustible");
    const listaRaw = r1.ok?await r1.json():[];
    const listaParsed = Array.isArray(listaRaw)?listaRaw:(listaRaw.data||[]);
    const listaFinal = listaParsed.length>0 ? listaParsed : generateMockCombustible();
    return {lista: listaFinal, stats: mockCombStats()};
  }catch(e){ return {lista: generateMockCombustible(), stats: mockCombStats()}; }
}
export function generateMockFlota(){
  const marcas=["Freightliner","Volvo","Scania","Mercedes","Kenworth"], modelos=["T680","VNL 760","Sprinter","Cascadia","R-450"];
  const arr=[]; for(let i=1;i<=200;i++){ arr.push({id:i, placa:`FG-${String(i).padStart(4,'0')}`, marca:marcas[i%5], modelo:modelos[i%7], anio:2020+(i%5), sucursal_id:i<=120?1:2, estado:i<=114?"En Ruta":i<=171?"En Base":i<=185?"En Taller":"Disponible", consumo_estado:i<=28?"Bajo":i<=170?"Normal":i<=189?"Excedido":i<=200-11?"Sospechoso":"Critico", kilometraje:`24,532`, km:`24,532`, rendimiento:`7.58`, km_l:`7.58`, mantenimiento_estado:i%4==0?"Vencido":i%5==0?"Preventivo":"Próx 1000km", sucursales:{clave:i<=120?"SUC-GDL-01":"SUC-CLN-01"}});} return arr;
}
export function generateMockCombustible(){
  const placas=["FG-0002","FG-0005","FG-0012","FG-0020","FG-0034","FG-0080"]; const tipos=["Diesel","Diesel UBA"]; const estados=["Eficiente","Óptimo","Por Revisar","Atención","Oportunidad Mejora"]; const suc=["SUC-GDL-01","SUC-CLN-01"];
  const arr=[]; let id=1; for(let d=1;d<=30;d++){ for(let p of placas){ arr.push({id:id++, fecha:`2026-05-${String(10+(d%18)).padStart(2,'0')}`, placa:p, sucursal:suc[id%2], litros:80+Math.floor(Math.random()*120), km_recorridos:350+Math.floor(Math.random()*450), rendimiento:(6.5+Math.random()*3).toFixed(2), tipo:tipos[id%2], consumo_estado:estados[id%5], costo:(2500+Math.random()*2000).toFixed(2), estacion:"GAS-GDL-01"});}} return arr;
}
export function mockCombStats(){ return {total_cargas:187, promedio_km_l:6.24, total_litros:2143.5, por_optimizar:22, costo_mes:145800}; }
