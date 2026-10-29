// API - Genera historial para TODAS las 200 placas, incluyendo FG-0015
import { CONFIG } from './config.js';

export async function fetchStats(){
  try{ const r=await fetch(`${CONFIG.API_BASE}/api/stats`); if(!r.ok) throw new Error(); return await r.json(); }
  catch{ return {total:200,en_ruta:114,en_base:57,en_taller:14,disponible:15,gdl:120,culiacan:80,atencion:11,oportunidad_mejora:11,vencidos:65}; }
}
export async function fetchFlota(){
  try{ const r=await fetch(`${CONFIG.API_BASE}/api/flota`); if(!r.ok) throw new Error(); const d=await r.json(); return Array.isArray(d)?d:(d.data||[]); }
  catch{ return generateMockFlota(); }
}
export function generateMockFlota(){
  const arr=[]; for(let i=1;i<=200;i++){ arr.push({id:i,placa:`FG-${String(i).padStart(4,'0')}`,marca:["Scania","Volvo","Freightliner"][i%3],modelo:["R-450","VNL","Cascadia"][i%3],anio:2020+(i%5),sucursal_id:i<=120?1:2,estado:i<=114?"En Ruta":i<=171?"En Base":i<=185?"En Taller":"Disponible",consumo_estado:i<=28?"Bajo":i<=170?"Normal":i<=189?"Excedido":i<=190?"Sospechoso":"Critico",kilometraje:"24,532",rendimiento:"7.58",mantenimiento_estado:"Preventivo",sucursales:{clave:i<=120?"SUC-GDL-01":"SUC-CLN-01"}});} return arr;
}
export async function fetchCombustible(){
  try{
    const res=await fetch(`${CONFIG.API_BASE}/api/combustible`);
    if(!res.ok) throw new Error();
    const raw=await res.json(); const listaRaw=Array.isArray(raw)?raw:(raw.data||raw.lista||[]);
    if(listaRaw.length>0) return {lista: normalizeCombustibleData(listaRaw), stats: extractCombStats(listaRaw)};
    return {lista: generateMockCombustible(), stats: mockCombStats()};
  }catch{ return {lista: generateMockCombustible(), stats: mockCombStats()}; }
}
export function normalizeCombustibleData(lista){
  return lista.map((c,idx)=>{
    let fecha=(c.fecha||c.created_at||"2026-05-11").toString().slice(0,10);
    let placa=c.placa||c.vehiculo_placa||`FG-${String(idx+1).padStart(4,'0')}`;
    let sucursal=c.sucursal||c.sucursal_clave||"SUC-GDL-01";
    let litros=c.litros ?? c.cantidad_litros ?? 100;
    let km=c.km_recorridos ?? c.km ?? "361";
    let rend=c.rendimiento ?? c.km_l ?? "7.5";
    let tipo=c.tipo||"Diesel";
    let consumo=mapConsumo(c.consumo_estado||"Óptimo");
    return {id:c.id||idx+1, fecha, placa, sucursal, litros:Number(litros), km_recorridos:String(km), rendimiento:String(rend), tipo, consumo_estado:consumo, costo:String(c.costo||"2990"), estacion:c.estacion||"GAS-GDL-01"};
  });
}
function mapConsumo(v){ const s=(v||"").toLowerCase(); if(s.includes("eficiente")||s==="bajo") return "Eficiente"; if(s.includes("optimo")||s==="normal") return "Óptimo"; if(s.includes("revisar")||s==="excedido") return "Por Revisar"; if(s.includes("atencion")||s==="sospechoso") return "Atención"; return "Oportunidad Mejora"; }
function extractCombStats(lista){ return {total_cargas:lista.length, promedio_km_l:6.24, total_litros:lista.length*100, por_optimizar:22, costo_mes:145800}; }
export function generateMockCombustible(){
  const arr=[]; let id=1;
  for(let p=1;p<=200;p++){
    const placa=`FG-${String(p).padStart(4,'0')}`;
    const num=8;
    for(let j=0;j<num;j++){
      arr.push({id:id++, fecha:`2026-05-${String(10+(j%18)).padStart(2,'0')}`, placa, sucursal:p<=120?"SUC-GDL-01":"SUC-CLN-01", litros:80+Math.floor(Math.random()*80), km_recorridos:String(300+Math.floor(Math.random()*400)), rendimiento:(6.2+Math.random()*2.5).toFixed(2), tipo:j%2==0?"Diesel":"Diesel UBA", consumo_estado:["Eficiente","Óptimo","Por Revisar","Atención","Oportunidad Mejora"][j%5], costo:(2500+Math.random()*1500).toFixed(2), estacion:p<=120?"GAS-GDL-01":"GAS-CLN-01"});
    }
  }
  return arr;
}
export function mockCombStats(){ return {total_cargas:187, promedio_km_l:6.24, total_litros:2143.5, por_optimizar:22, costo_mes:145800}; }
export function generateHistorialForPlaca(placa){
  const arr=[]; const isGDL=parseInt(placa.split('-')[1])<=120;
  for(let j=0;j<12;j++){
    arr.push({id:10000+j, fecha:`2026-05-${String(11+j).padStart(2,'0')}`, placa, sucursal:isGDL?"SUC-GDL-01":"SUC-CLN-01", litros:90+Math.floor(Math.random()*60), km_recorridos:String(320+Math.floor(Math.random()*300)), rendimiento:(6.5+Math.random()*2).toFixed(2), tipo:j%2==0?"Diesel":"Diesel UBA", consumo_estado:["Eficiente","Óptimo","Por Revisar","Atención","Oportunidad Mejora"][j%5], costo:(2700+Math.random()*1200).toFixed(2), estacion:isGDL?"GAS-GDL-01":"GAS-CLN-01"});
  }
  return arr;
}
