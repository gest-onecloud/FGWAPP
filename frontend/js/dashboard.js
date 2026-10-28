import { fetchStats, fetchFlota } from './api.js';
let flotaData=[], filtros={sucursal:'',estado:'',consumo:'',marca:'',placa:''};
async function init(){
 const stats=await fetchStats(); let flota=await fetchFlota(); flotaData=flota;
 document.getElementById("ver").textContent=`✅ LIVE ${stats.total} • ${stats.en_ruta} Ruta • GPS Telcel`;
 document.getElementById("m-flota").textContent=`${stats.total} unidades • GDL ${stats.gdl} CLN ${stats.culiacan}`;
 document.getElementById("m-comb").textContent=`${stats.atencion+stats.oportunidad_mejora} por optimizar • 187 cargas`;
 renderTabla(flotaData); setupModal();
}
function normalizeFlota(f){
 return { id:f.id, placa:f.placa||`FG-${String(f.id).padStart(4,'0')}`, marca:f.marca||'Scania', modelo:f.modelo||'Sprinter', anio:f.anio||f.año||2023, sucursal_id:f.sucursal_id||1, sucursal_clave:f.sucursales?.clave||(f.sucursal_id==1?'SUC-GDL-01':'SUC-CLN-01'), estado:f.estado||'En Ruta', consumo_estado:f.consumo_estado||'Normal', km:f.kilometraje||f.km||'24,532', km_l:f.rendimiento||f.km_l||'7.58', mant:f.mantenimiento_estado||'Próx 1000km' };
}
function applyF(){
 let l=[...flotaData].map(normalizeFlota);
 if(filtros.sucursal) l=l.filter(f=>f.sucursal_clave===filtros.sucursal);
 if(filtros.estado) l=l.filter(f=>f.estado===filtros.estado);
 if(filtros.consumo){ l=l.filter(f=>{ const ce=f.consumo_estado==='Bajo'?'Eficiente':f.consumo_estado==='Normal'?'Óptimo':f.consumo_estado==='Excedido'?'Por Revisar':f.consumo_estado==='Sospechoso'?'Atención':'Oportunidad Mejora'; return ce===filtros.consumo; }); }
 if(filtros.placa) l=l.filter(f=>f.placa===filtros.placa);
 if(filtros.marca) l=l.filter(f=>f.marca===filtros.marca);
 return l;
}
function renderTabla(listaRaw){
 const lista=listaRaw.map(normalizeFlota);
 const tb=document.getElementById("tbody"); const thead=document.getElementById("thead-flota");
 thead.innerHTML=`<tr><th onclick="toggleHeaderFilter(event,'placa')">PLACA <span class="filter-arrow">${filtros.placa?'▲':'▼'}</span><div class="excel-panel-header" id="hdr-placa"></div></th><th onclick="toggleHeaderFilter(event,'marca')">MARCA <span class="filter-arrow">▼</span><div class="excel-panel-header" id="hdr-marca"></div></th><th>MODELO</th><th>AÑO</th><th onclick="toggleHeaderFilter(event,'sucursal')">SUCURSAL <span class="filter-arrow">▼</span><div class="excel-panel-header" id="hdr-sucursal"></div></th><th onclick="toggleHeaderFilter(event,'estado')">ESTADO <span class="filter-arrow">▼</span><div class="excel-panel-header" id="hdr-estado"></div></th><th onclick="toggleHeaderFilter(event,'consumo')">CONSUMO <span class="filter-arrow">▼</span><div class="excel-panel-header" id="hdr-consumo"></div></th><th>KM</th><th>KM/L</th><th>MANT</th></tr>`;
 tb.innerHTML=lista.slice(0,200).map(f=>`<tr class="clickable" data-id="${f.id}"><td style="font-weight:900;color:var(--lime)">${f.placa}</td><td>${f.marca}</td><td>${f.modelo}</td><td>${f.anio}</td><td><span class="badge b-lime">${f.sucursal_clave}</span></td><td><span class="badge b-lime">${f.estado}</span></td><td><span class="badge b-green">${f.consumo_estado==='Bajo'?'Eficiente':f.consumo_estado==='Normal'?'Óptimo':f.consumo_estado==='Excedido'?'Por Revisar':f.consumo_estado==='Sospechoso'?'Atención':'Oportunidad Mejora'}</span></td><td>${f.km} km</td><td style="color:var(--green);font-weight:800">${f.km_l} km/l</td><td>${f.mant}</td></tr>`).join("");
 document.getElementById("tabla-info").textContent=`• ${lista.length} de ${flotaData.length} • Header ▼ Excel • Click fila → ficha completa`;
 document.getElementById("filtros-activos").textContent=`• ${Object.values(filtros).filter(Boolean).length} filtros • ${lista.length} resultados`;
 tb.querySelectorAll("tr.clickable").forEach(tr=>{ tr.addEventListener("click",()=>{ const f=flotaData.map(normalizeFlota).find(x=>String(x.id)===String(tr.dataset.id)); if(f) openFicha(f); }); });
 buildPanels();
}
function buildPanels(){
 const norm=flotaData.map(normalizeFlota);
 const placas=[...new Set(norm.map(f=>f.placa))].sort().slice(0,100);
 const marcas=[...new Set(norm.map(f=>f.marca))];
 const sucs=[...new Set(norm.map(f=>f.sucursal_clave))];
 const estados=[...new Set(norm.map(f=>f.estado))];
 const consumos=['Eficiente','Óptimo','Por Revisar','Atención','Oportunidad Mejora'];
 const map={placa:placas, marca:marcas, sucursal:sucs, estado:estados, consumo:consumos};
 Object.entries(map).forEach(([k,vals])=>{
  const p=document.getElementById(`hdr-${k}`); if(!p) return;
  p.innerHTML=vals.map(v=>`<div class="excel-item" onclick="setFlotaFilter('${k}','${v}')"><input type="checkbox" ${filtros[k]===v?'checked':''}> ${v}</div>`).join("")+`<div class="excel-item" style="border-top:1px solid var(--border)" onclick="setFlotaFilter('${k}','')">(Todos)</div>`;
 });
}
window.toggleHeaderFilter=function(e,k){ e.stopPropagation(); const p=document.getElementById(`hdr-${k}`); const o=p.classList.contains("open"); document.querySelectorAll(".excel-panel-header").forEach(x=>x.classList.remove("open")); if(!o) p.classList.add("open"); }
window.setFlotaFilter=function(k,v){ filtros[k]=filtros[k]===v?'':v; document.querySelectorAll(".excel-panel-header").forEach(p=>p.classList.remove("open")); renderTabla(applyF()); }
function openFicha(f){
 const c=document.getElementById("modal-content");
 c.innerHTML=`<div class="modal-header"><div><div style="font-size:24px;font-weight:950">${f.placa} <span style="font-size:11px;padding:4px 10px;border-radius:999px;background:rgba(198,255,0,.15);color:var(--lime)">${f.estado}</span></div><div style="font-size:11px;color:var(--muted);margin-top:6px">${f.marca} ${f.modelo} • ${f.anio} • ${f.sucursal_clave} • Guadalajara</div></div><button class="close-btn" onclick="closeFicha()">✕</button></div><div class="modal-body"><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px"><span class="badge b-lime">${f.sucursal_clave}</span><span class="badge b-green">Matriz Guadalajara</span><span class="badge b-lime">${f.estado}</span><span class="badge b-green">${f.consumo_estado}</span></div><div class="modal-grid"><div class="modal-field"><div class="k">PLACA</div><div class="v" style="color:var(--lime)">${f.placa}</div></div><div class="modal-field"><div class="k">MARCA / MODELO</div><div class="v">${f.marca} ${f.modelo}</div></div><div class="modal-field"><div class="k">AÑO</div><div class="v">${f.anio}</div></div><div class="modal-field"><div class="k">SUCURSAL</div><div class="v">Matriz Guadalajara (${f.sucursal_clave})<br><span style="font-size:11px;color:var(--muted)">Capacidad 1000 - Escalable miles</span></div></div><div class="modal-field"><div class="k">ESTADO OPERATIVO</div><div class="v">${f.estado}<br><span style="font-size:11px;color:var(--muted)">GDL 120 • CLN 80</span></div></div><div class="modal-field"><div class="k">CONSUMO ESTADO</div><div class="v">${f.consumo_estado}<br><span style="font-size:11px;color:var(--green)">Óptimo • Continuar operación</span></div></div><div class="modal-field"><div class="k">KILOMETRAJE</div><div class="v">${f.km} km<br><span style="font-size:11px;color:var(--muted)">Ciclo preventivo</span></div></div><div class="modal-field"><div class="k">CONSUMO PROMEDIO</div><div class="v">${f.km_l} km/l<br><span style="font-size:11px;color:var(--muted)">Meta 10.80 km/l</span></div></div><div class="modal-field"><div class="k">MANTENIMIENTO</div><div class="v">${f.mant}<br><span style="font-size:11px;color:var(--orange)">65 vencidos en flota</span></div></div></div><div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap"><button class="btn active" style="background:var(--lime);color:#000;font-weight:900" onclick="verHistorialCombustible('${f.placa}')">⛽ Ver Historial Combustible</button><button class="btn">🟢 Ver Ruta GPS Telcel</button><button class="btn" onclick="closeFicha()">Cerrar</button></div><div style="margin-top:12px;background:rgba(198,255,0,.06);border:1px solid rgba(198,255,0,.15);border-radius:12px;padding:10px;font-size:10px"><b style="color:var(--lime)">Backend:</b> ${f.id} • ${f.sucursal_clave} • API fgwapp.onrender.com • Supabase São Paulo</div></div>`;
 document.getElementById("modal-overlay").classList.add("open");
}
function setupModal(){ document.getElementById("modal-overlay")?.addEventListener("click",e=>{ if(e.target.id==="modal-overlay") closeFicha(); }); document.addEventListener("click",()=>{ document.querySelectorAll(".excel-panel-header").forEach(p=>p.classList.remove("open")); }); }
window.closeFicha=function(){ document.getElementById("modal-overlay").classList.remove("open"); }
// FIX V11.6: Ver Historial -> abre modal timeline directo, no solo filtra
window.verHistorialCombustible=function(placa){
 closeFicha();
 setTimeout(()=>{
  window.switchView('combustible');
  setTimeout(()=>{
   // Asegura que combustible data esté cargada
   const tryOpen=()=>{
    const data=window._combDataGlobal||[];
    if(data.length===0){ setTimeout(tryOpen,300); return; }
    const lista=data.filter(c=>c.placa===placa);
    if(lista.length>0){
     // Si existe función directa de historial, usarla
     if(window.openHistorialDirect){ window.openHistorialDirect(lista, placa); }
     else if(window.openCombFichaByPlaca){ window.openCombFichaByPlaca(placa); }
     else {
      // Fallback: filtrar y luego abrir primer registro
      if(window.filterCombPlaca) window.filterCombPlaca(placa);
      setTimeout(()=>{
       const first=data.find(c=>c.placa===placa);
       if(first && window.openCombFicha) window.openCombFicha(first.id);
      },400);
     }
    } else {
     // Sin cargas para esa placa, mostrar mensaje pero con filtro aplicado
     if(window.filterCombPlaca) window.filterCombPlaca(placa);
     alert(`Sin cargas registradas para ${placa} en combustible_cargas. Mostrando filtro vacío.`);
    }
   };
   tryOpen();
  },600);
 },100);
}
init();
