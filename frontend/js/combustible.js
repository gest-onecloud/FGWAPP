import { fetchCombustible, generateMockCombustible } from './api.js';
let combData=[], combFiltros={sucursal:'',placa:'',estado:'',tipo:'',fecha:''};
export async function initCombustible(){
 const res=await fetchCombustible(); combData=res.lista&&res.lista.length>0?normalize(res.lista):generateMockCombustible();
 window._combDataGlobal=combData; renderStats(res.stats); renderTabla(combData);
}
function normalize(lista){
 return lista.map((c,i)=>({ id:c.id||i+1, fecha:(c.fecha||c.created_at||'2026-05-11').toString().slice(0,10), placa:c.placa||c.vehiculo_placa||`FG-${String(c.vehiculo_id||i+1).padStart(4,'0')}`, sucursal:c.sucursal||'SUC-GDL-01', litros:c.litros||c.cantidad_litros||100, km_recorridos:c.km_recorridos||c.km||'361', rendimiento:c.rendimiento||c.km_l||'7.5', tipo:c.tipo||'Diesel', consumo_estado:mapCons(c.consumo_estado||'Óptimo'), costo:c.costo||'2990' }));
}
function mapCons(v){ const s=(v||'').toLowerCase(); if(s.includes('eficiente')||s==='bajo') return 'Eficiente'; if(s.includes('optimo')||s==='normal') return 'Óptimo'; if(s.includes('revisar')||s.includes('excedido')) return 'Por Revisar'; if(s.includes('atencion')||s.includes('sospechoso')) return 'Atención'; if(s.includes('oportunidad')||s.includes('critico')) return 'Oportunidad Mejora'; return v||'Óptimo'; }
function renderStats(s){ if(!s) s={total_cargas:combData.length, promedio_km_l:6.24, total_litros:2143.5, por_optimizar:22, costo_mes:145800}; const el=document.getElementById("comb-stats"); el.innerHTML=`<div class="comb-kpi"><div class="lbl">CARGAS TOTALES</div><div class="val">${s.total_cargas||combData.length} LIVE</div></div><div class="comb-kpi"><div class="lbl">PROMEDIO FLOTA</div><div class="val" style="color:var(--green)">${s.promedio_km_l||6.24} km/l</div></div><div class="comb-kpi"><div class="lbl">POR OPTIMIZAR</div><div class="val" style="color:var(--orange)">${s.por_optimizar||22}</div></div><div class="comb-kpi"><div class="lbl">COSTO MES</div><div class="val">$${(s.costo_mes||145800).toLocaleString()}</div></div>`; }
function renderTabla(lista){
 const thead=document.getElementById("thead-comb");
 thead.innerHTML=`<tr><th onclick="toggleCombHeader(event,'fecha')">FECHA <span class="filter-arrow">▼</span><div class="excel-panel-header" id="hdr-c-fecha"></div></th><th onclick="toggleCombHeader(event,'placa')">PLACA <span class="filter-arrow">${combFiltros.placa?'▲':'▼'}</span><div class="excel-panel-header" id="hdr-c-placa"></div></th><th onclick="toggleCombHeader(event,'sucursal')">SUCURSAL <span class="filter-arrow">▼</span><div class="excel-panel-header" id="hdr-c-sucursal"></div></th><th>LITROS</th><th>KM</th><th>KM/L</th><th onclick="toggleCombHeader(event,'tipo')">TIPO <span class="filter-arrow">▼</span><div class="excel-panel-header" id="hdr-c-tipo"></div></th><th onclick="toggleCombHeader(event,'estado')">CONSUMO <span class="filter-arrow">▼</span><div class="excel-panel-header" id="hdr-c-estado"></div></th><th>COSTO</th></tr>`;
 const tb=document.getElementById("tbody-comb"); tb.innerHTML=lista.slice(0,200).map(c=>`<tr class="clickable" onclick="window.openCombFicha(${c.id})"><td>${c.fecha}</td><td style="font-weight:900;color:var(--lime)">${c.placa}</td><td><span class="badge b-lime">${c.sucursal}</span></td><td>${c.litros} L</td><td>${c.km_recorridos} km</td><td style="color:var(--green)">${c.rendimiento} km/l</td><td>${c.tipo}</td><td><span class="badge b-green">${c.consumo_estado}</span></td><td>$${c.costo}</td></tr>`).join("");
 document.getElementById("comb-info").textContent=`• ${lista.length} de ${combData.length} • Header ▼ Excel`;
 buildPanels();
}
function buildPanels(){
 const placas=[...new Set(combData.map(c=>c.placa))].sort().slice(0,120);
 const sucs=[...new Set(combData.map(c=>c.sucursal))];
 const fechas=[...new Set(combData.map(c=>c.fecha))].sort().reverse().slice(0,20);
 const tipos=[...new Set(combData.map(c=>c.tipo))];
 const estados=[...new Set(combData.map(c=>c.consumo_estado))];
 const map={placa:placas, sucursal:sucs, fecha:fechas, tipo:tipos, estado:estados};
 Object.entries(map).forEach(([k,vals])=>{
  const p=document.getElementById(`hdr-c-${k}`); if(!p) return;
  p.innerHTML=vals.map(v=>`<div class="excel-item" onclick="setCombHeaderFilter('${k}','${v}')"><input type="checkbox" ${combFiltros[k]===v?'checked':''}> ${v}</div>`).join("")+`<div class="excel-item" style="border-top:1px solid var(--border)" onclick="setCombHeaderFilter('${k}','')">(Todos)</div>`;
 });
}
window.toggleCombHeader=function(e,k){ e.stopPropagation(); const p=document.getElementById(`hdr-c-${k}`); const o=p.classList.contains("open"); document.querySelectorAll(".excel-panel-header").forEach(x=>x.classList.remove("open")); if(!o) p.classList.add("open"); }
// NO abrir modal al filtrar, solo filtrar
window.setCombHeaderFilter=function(k,v){
 combFiltros[k]=combFiltros[k]===v?'':v;
 document.querySelectorAll(".excel-panel-header").forEach(p=>p.classList.remove("open"));
 let l=[...combData];
 if(combFiltros.sucursal) l=l.filter(c=>c.sucursal===combFiltros.sucursal);
 if(combFiltros.placa) l=l.filter(c=>c.placa===combFiltros.placa);
 if(combFiltros.estado) l=l.filter(c=>c.consumo_estado===combFiltros.estado);
 if(combFiltros.tipo) l=l.filter(c=>c.tipo===combFiltros.tipo);
 if(combFiltros.fecha) l=l.filter(c=>c.fecha===combFiltros.fecha);
 renderTabla(l);
}
window.filterCombPlaca=function(placa){ combFiltros.placa=placa; const l=combData.filter(c=>c.placa===placa); renderTabla(l); }
// Funciones globales para abrir historial desde Flota
window.openHistorialDirect=function(lista, placa){
 let o=document.getElementById("timeline-overlay");
 if(!o){ o=document.createElement("div"); o.id="timeline-overlay"; o.className="timeline-overlay"; o.innerHTML=`<div class="timeline-modal" id="timeline-modal-inner"></div>`; document.body.appendChild(o); o.addEventListener("click",e=>{ if(e.target.id==="timeline-overlay") closeModal(); }); }
 const inner=document.getElementById("timeline-modal-inner");
 inner.innerHTML=`<div class="timeline-modal-header"><div><div style="font-size:18px;font-weight:950">📍 Historial • ${placa} • ${lista.length} cargas</div><div style="font-size:11px;color:var(--muted)">Desde ficha Flota ${placa} • Modal encima</div></div><button class="close-btn" onclick="closeModal()">✕</button></div><div class="timeline-modal-body"><div class="timeline">${lista.map(c=>`<div class="tl-item"><div style="display:flex;justify-content:space-between"><b>${c.fecha} • ${c.rendimiento} km/l • ${c.litros} L</b><span class="badge b-green">${c.consumo_estado}</span></div><div style="font-size:11px;color:var(--muted)">${c.km_recorridos} km • ${c.tipo} • $${c.costo}</div></div>`).join("")}</div><button class="btn active" style="margin-top:12px" onclick="closeModal()">← Volver a tabla combustible filtrada ${placa}</button></div>`;
 o.classList.add("open");
}
window.openCombFichaByPlaca=function(placa){
 const data=window._combDataGlobal||[]; const lista=data.filter(c=>c.placa===placa); if(lista.length>0) window.openHistorialDirect(lista, placa);
}
window.openCombFicha=function(id){
 const c=combData.find(x=>x.id===id); if(c){ const lista=combData.filter(x=>x.placa===c.placa); window.openHistorialDirect(lista.slice(0,20), c.placa); }
}
window.closeModal=function(){ const o=document.getElementById("timeline-overlay"); if(o) o.classList.remove("open"); }
window.closeTimelineModal=window.closeModal;
window.limpiarCombFiltros=function(){ combFiltros={sucursal:'',placa:'',estado:'',tipo:'',fecha:''}; renderTabla(combData); }
document.addEventListener("click",()=>{ document.querySelectorAll(".excel-panel-header").forEach(p=>p.classList.remove("open")); });
