// DASHBOARD V12.3 HYBRID - Render no bloquea - Ficha 9 campos completa - Escalable Supabase
import { fetchFlota, wakeBackend } from './api.js';

let FLOTA_CACHE = [];
let IS_LIVE = false;

export async function initFlota(){
  console.log("[Flota V12.3] Init sin bloqueo - render inmediato + background fetch");
  const tbody=document.getElementById("tbody");
  const info=document.getElementById("filtros-activos");
  
  // 1. Render inmediato con estructura vacía para evitar pantalla negra
  if(tbody) tbody.innerHTML=`<tr><td colspan="9" style="text-align:center;padding:20px;color:var(--muted)">⏳ Conectando a Supabase/Render... (timeout 3.5s) - Si tarda, mostrará mock temporal y luego LIVE</td></tr>`;
  if(info) info.textContent="Conectando a backend Supabase...";

  // 2. Wake backend en background
  wakeBackend();

  // 3. Fetch con timeout 3.5s (no 5 min)
  try{
    const data = await fetchFlota();
    FLOTA_CACHE = data;
    IS_LIVE = data.some(f=>f.id && typeof f.id==='number' && f.created_at); // heurística si viene de Supabase real
    window.FLOTA_GLOBAL = FLOTA_CACHE;
    console.log(`[Flota] Cargada ${FLOTA_CACHE.length} ${IS_LIVE?'LIVE Supabase':'MOCK temporal'}`);
    renderFlota();
  }catch(e){
    console.error("[Flota] Error", e);
    // Fallback final
    FLOTA_CACHE = Array.from({length:200},(_,i)=>{
      const n=i+1; const isGDL=n<=120;
      return {id:n, placa:`FG-${String(n).padStart(4,'0')}`, marca:"Scania", modelo:"R-450", anio:2022, sucursal:isGDL?'SUC-GDL-01':'SUC-CLN-01', estado:'En Ruta', consumo_estado:'Normal', kilometraje:10000+n*1234, consumo_promedio:'10.80', mantenimiento:'Vigente'};
    });
    renderFlota();
  }
}

function renderFlota(){
  const tbody=document.getElementById("tbody");
  const thead=document.getElementById("thead-flota");
  if(!tbody) return;
  
  if(thead) thead.innerHTML=`<tr><th>PLACA</th><th>MARCA</th><th>MODELO</th><th>AÑO</th><th>SUCURSAL</th><th>ESTADO</th><th>CONSUMO</th><th>KM</th><th>ACCION</th></tr>`;

  const data = FLOTA_CACHE.slice(0,120);
  tbody.innerHTML=data.map(f=>`<tr><td><b style="color:var(--lime)">${f.placa}</b> ${IS_LIVE?'<span style="font-size:8px;color:var(--lime)">LIVE</span>':'<span style="font-size:8px;color:#8b9bb4">MOCK</span>'}</td><td>${f.marca||'Scania'}</td><td>${f.modelo||'R-450'}</td><td>${f.anio||2022}</td><td><span style="font-size:10px;padding:2px 6px;border-radius:999px;background:${(f.sucursal||'').includes('GDL')?'rgba(198,255,0,.15)':'rgba(56,189,248,.15)'};color:${(f.sucursal||'').includes('GDL')?'var(--lime)':'#38BDF8'}">${f.sucursal}</span></td><td>${f.estado||'En Ruta'}</td><td><span class="badge">${f.consumo_estado||'Normal'}</span></td><td>${Number(f.kilometraje||0).toLocaleString()}</td><td><button class="btn small active" onclick="window.abrirFicha('${f.placa}')">Ficha</button></td></tr>`).join('');

  const info=document.getElementById("filtros-activos");
  if(info) info.textContent=`Flota V12.3 ${IS_LIVE?'LIVE Supabase':'MOCK temporal 3.5s timeout'} - ${FLOTA_CACHE.length} unidades - ${IS_LIVE?'Conectado a Render':'Render despertando... recarga en 30s para LIVE'}`;

  // Reintento automático para pasar de MOCK a LIVE después de 15s
  if(!IS_LIVE){
    setTimeout(async()=>{
      console.log("[Flota] Reintentando LIVE...");
      try{
        const retry = await fetchFlota();
        if(retry.length>0 && retry[0].created_at){
          FLOTA_CACHE=retry; IS_LIVE=true; renderFlota();
          console.log("[Flota] Ahora LIVE!");
        }
      }catch(_){}
    }, 15000);
  }
}

window.abrirFicha=function(placa){
  const f = FLOTA_CACHE.find(x=>x.placa===placa) || {placa, marca:'Scania', modelo:'R-450', anio:2022, sucursal:'SUC-GDL-01', estado:'En Ruta', consumo_estado:'Normal', kilometraje:45230, consumo_promedio:'10.80', mantenimiento:'Vigente'};
  const modal=document.getElementById("modal-content");
  if(!modal) return;
  modal.innerHTML=`
  <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid rgba(255,255,255,.08)">
    <div><div style="font-size:22px;font-weight:950">${f.placa} <span class="badge" style="background:rgba(198,255,0,.15);color:#C6FF00">${f.consumo_estado}</span> ${IS_LIVE?'<span style="font-size:9px;background:rgba(198,255,0,.2);padding:2px 6px;border-radius:999px;color:#C6FF00">LIVE Supabase</span>':'<span style="font-size:9px;background:rgba(139,155,180,.15);padding:2px 6px;border-radius:999px">MOCK temporal</span>'}</div><div style="font-size:11px;color:#8b9bb4">${f.marca} ${f.modelo} • ${f.sucursal} • ${f.estado}</div></div>
    <button class="close-btn" onclick="window.closeFlotaFicha()" style="background:rgba(255,255,255,.1);border:none;width:32px;height:32px;border-radius:50%;cursor:pointer">✕</button>
  </div>
  <div class="modal-body" style="display:grid;gap:14px;padding:16px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="ficha-field"><div class="lbl" style="font-size:9px;color:#8b9bb4">PLACA</div><div class="val" style="color:#C6FF00;font-weight:900">${f.placa}</div></div>
      <div class="ficha-field"><div class="lbl" style="font-size:9px;color:#8b9bb4">MARCA / MODELO</div><div class="val">${f.marca} / ${f.modelo}</div></div>
      <div class="ficha-field"><div class="lbl" style="font-size:9px;color:#8b9bb4">AÑO</div><div class="val">${f.anio}</div></div>
      <div class="ficha-field"><div class="lbl" style="font-size:9px;color:#8b9bb4">SUCURSAL</div><div class="val">${f.sucursal==='SUC-GDL-01'?'Matriz Guadalajara SUC-GDL-01':'Culiacán SUC-CLN-01'}</div></div>
      <div class="ficha-field"><div class="lbl" style="font-size:9px;color:#8b9bb4">ESTADO</div><div class="val">${f.estado}</div></div>
      <div class="ficha-field"><div class="lbl" style="font-size:9px;color:#8b9bb4">CONSUMO ESTADO</div><div class="val">${f.consumo_estado}</div></div>
      <div class="ficha-field"><div class="lbl" style="font-size:9px;color:#8b9bb4">KILOMETRAJE</div><div class="val">${Number(f.kilometraje||0).toLocaleString()} km</div></div>
      <div class="ficha-field"><div class="lbl" style="font-size:9px;color:#8b9bb4">CONSUMO PROMEDIO</div><div class="val">Meta ${f.consumo_promedio||'10.80'} km/l</div></div>
      <div class="ficha-field"><div class="lbl" style="font-size:9px;color:#8b9bb4">MANTENIMIENTO</div><div class="val" style="color:${f.mantenimiento==='Vencido'?'#EF4444':'#C6FF00'}">${f.mantenimiento||'Vigente'}</div></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn active" style="background:#C6FF00;color:#000;font-weight:900;padding:8px 14px;border-radius:999px;border:none;cursor:pointer" onclick="window.verHistorialDesdeFlota('${f.placa}')">⛽ Ver Historial</button>
      <button class="btn" style="padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);cursor:pointer" onclick="window.verRutaDesdeFlota('${f.placa}')">🗺️ Ver Ruta</button>
    </div>
  </div>`;
  document.getElementById("modal-overlay").classList.add("open");
};

window.closeFlotaFicha=function(){ document.getElementById("modal-overlay")?.classList.remove("open"); };
window.verHistorialDesdeFlota=function(placa){ window.closeFlotaFicha(); setTimeout(()=>{ document.querySelectorAll("[id^='view-']").forEach(v=>v.style.display="none"); document.getElementById("view-combustible").style.display="block"; },100); };
window.verRutaDesdeFlota=function(placa){ window.closeFlotaFicha(); setTimeout(()=>{ document.querySelectorAll("[id^='view-']").forEach(v=>v.style.display="none"); document.getElementById("view-rutas").style.display="block"; if(window.centrarEnPin) window.centrarEnPin(placa); },100); };
window.limpiarFlotaFiltros=function(){ renderFlota(); };

initFlota();
