// COMBUSTIBLE V11.8 - Copia de V11.7 funcionando
import { fetchCombustible, genMock, genHistorial } from './api.js';
let DATA=[]; let FILTERED=[]; 
let ACTIVE_FILTERS = { fecha:'', placa:'', sucursal:'', tipo:'', consumo:'' };
export async function initCombustible(){
  const res=await fetchCombustible();
  DATA=res.lista && res.lista.length>0 ? res.lista : genMock();
  FILTERED=[...DATA];
  window._combDataGlobal=DATA;
  renderStats(res.stats);
  renderTable(FILTERED);
  setupGlobalClose();
}
function renderStats(s){
  const stats=s||{total_cargas:DATA.length, promedio_km_l:6.24, por_optimizar:22, costo_mes:145800};
  const el=document.getElementById("comb-stats");
  el.innerHTML=`<div class="comb-kpi"><div class="lbl">Cargas</div><div class="val">${stats.total_cargas} LIVE</div></div><div class="comb-kpi"><div class="lbl">Promedio</div><div class="val" style="color:var(--green)">${stats.promedio_km_l} km/l</div></div><div class="comb-kpi"><div class="lbl">Por Optimizar</div><div class="val" style="color:var(--orange)">${stats.por_optimizar}</div></div><div class="comb-kpi"><div class="lbl">Costo Mes</div><div class="val">$${Number(stats.costo_mes).toLocaleString()}</div></div>`;
}
function renderTable(lista){
  FILTERED=lista;
  const thead=document.getElementById("thead-comb");
  const tbody=document.getElementById("tbody-comb");
  thead.innerHTML=`<tr><th data-col="fecha">FECHA <span class="filter-arrow">${ACTIVE_FILTERS.fecha?'▲':'▼'}</span><div class="excel-panel-header" id="hdr-c-fecha"></div></th><th data-col="placa">PLACA <span class="filter-arrow">${ACTIVE_FILTERS.placa?'▲':'▼'}</span><div class="excel-panel-header" id="hdr-c-placa"></div></th><th data-col="sucursal">SUCURSAL <span class="filter-arrow">${ACTIVE_FILTERS.sucursal?'▲':'▼'}</span><div class="excel-panel-header" id="hdr-c-sucursal"></div></th><th>LITROS</th><th>KM</th><th>KM/L</th><th data-col="tipo">TIPO <span class="filter-arrow">${ACTIVE_FILTERS.tipo?'▲':'▼'}</span><div class="excel-panel-header" id="hdr-c-tipo"></div></th><th data-col="consumo">CONSUMO <span class="filter-arrow">${ACTIVE_FILTERS.consumo?'▲':'▼'}</span><div class="excel-panel-header" id="hdr-c-consumo"></div></th><th>COSTO</th></tr>`;
  tbody.innerHTML=lista.slice(0,150).map(c=>`<tr class="clickable" data-placa="${c.placa}"><td>${c.fecha}</td><td style="font-weight:900;color:var(--lime)">${c.placa}</td><td>${c.sucursal}</td><td>${c.litros} L</td><td>${c.km_recorridos}</td><td style="color:var(--green);font-weight:800">${c.rendimiento}</td><td>${c.tipo}</td><td><span class="badge b-lime">${c.consumo_estado}</span></td><td>$${c.costo}</td></tr>`).join("");
  document.getElementById("comb-info").textContent=`• ${lista.length} de ${DATA.length} • Header ▼ Excel`;
  thead.querySelectorAll("th[data-col]").forEach(th=>{ th.addEventListener("click",(e)=>{ e.stopPropagation(); togglePanel(th.getAttribute("data-col")); }); });
  tbody.querySelectorAll("tr.clickable").forEach(tr=>{ tr.addEventListener("click",()=>{ const placa=tr.getAttribute("data-placa"); abrirHistorialPorPlaca(placa); }); });
  buildPanels();
}
function badge(e){ return "b-lime"; }
function togglePanel(col){ const p=document.getElementById(`hdr-c-${col}`); if(!p) return; const open=p.classList.contains("open"); closeAll(); if(!open) p.classList.add("open"); }
function closeAll(){ document.querySelectorAll(".excel-panel-header").forEach(p=>p.classList.remove("open")); }
function buildPanels(){
  const fechas=[...new Set(DATA.map(c=>c.fecha))].sort().reverse().slice(0,20);
  const placas=[...new Set(DATA.map(c=>c.placa))].sort();
  const sucs=[...new Set(DATA.map(c=>c.sucursal))];
  const tipos=[...new Set(DATA.map(c=>c.tipo))];
  const consumos=["Eficiente","Optimo","Por Revisar","Atencion","Oportunidad Mejora"];
  const map={fecha:fechas, placa:placas, sucursal:sucs, tipo:tipos, consumo:consumos};
  Object.entries(map).forEach(([col, vals])=>{
    const panel=document.getElementById(`hdr-c-${col}`);
    if(!panel) return;
    const active=ACTIVE_FILTERS[col];
    panel.innerHTML=`<input class="excel-search" placeholder="Buscar ${col}..." oninput="window.filtrarPanelTexto('${col}', this.value)"><div style="max-height:240px;overflow-y:auto" id="list-c-${col}">${vals.map(v=>`<div class="excel-item" onclick="window.aplicarFiltroExcel('${col}','${v}')"><input type="checkbox" ${active===v?'checked':''}> ${v}</div>`).join("")}</div><div class="excel-actions"><button class="btn" onclick="window.aplicarFiltroExcel('${col}','')">Limpiar</button><button class="btn active" onclick="window.cerrarPanelesExcel()">Cerrar</button></div>`;
    panel.addEventListener("click",(e)=>e.stopPropagation());
  });
}
window.filtrarPanelTexto=function(col, txt){ const list=document.getElementById(`list-c-${col}`); if(!list) return; const lower=txt.toLowerCase(); list.querySelectorAll(".excel-item").forEach(item=>{ item.style.display=item.textContent.toLowerCase().includes(lower)?"flex":"none"; }); };
window.aplicarFiltroExcel=function(col, val){ ACTIVE_FILTERS[col]=ACTIVE_FILTERS[col]===val?'':val; closeAll(); let lista=[...DATA]; if(ACTIVE_FILTERS.fecha) lista=lista.filter(c=>c.fecha===ACTIVE_FILTERS.fecha); if(ACTIVE_FILTERS.placa) lista=lista.filter(c=>c.placa===ACTIVE_FILTERS.placa); if(ACTIVE_FILTERS.sucursal) lista=lista.filter(c=>c.sucursal===ACTIVE_FILTERS.sucursal); if(ACTIVE_FILTERS.tipo) lista=lista.filter(c=>c.tipo===ACTIVE_FILTERS.tipo); if(ACTIVE_FILTERS.consumo) lista=lista.filter(c=>c.consumo_estado===ACTIVE_FILTERS.consumo); renderTable(lista); };
window.cerrarPanelesExcel=function(){ closeAll(); };
function setupGlobalClose(){ document.addEventListener("click",()=>closeAll()); }
function abrirHistorialPorPlaca(placa){ let lista=DATA.filter(c=>c.placa===placa); if(lista.length===0) lista=genHistorial(placa); abrirModalHistorial(lista, placa); }
function abrirModalHistorial(lista, placa){
  let overlay=document.getElementById("timeline-overlay");
  if(!overlay){ overlay=document.createElement("div"); overlay.id="timeline-overlay"; overlay.className="timeline-overlay"; overlay.innerHTML='<div class="timeline-modal" id="timeline-modal-inner"></div>'; document.body.appendChild(overlay); }
  const inner=document.getElementById("timeline-modal-inner");
  inner.innerHTML=`<div class="timeline-modal-header"><div><div style="font-size:18px;font-weight:950">⛽ Historial Recargas • ${placa} • ${lista.length} recargas</div></div><button class="close-btn" onclick="window.cerrarHistorial()">✕</button></div><div class="timeline-modal-body"><div class="timeline">${lista.map(c=>`<div class="tl-item"><div style="display:flex;justify-content:space-between"><b>${c.fecha} • ${c.rendimiento} km/l • ${c.litros} L</b></div><div style="font-size:11px;color:var(--muted);margin-top:4px">${c.km_recorridos} km • ${c.tipo} • $${c.costo}</div></div>`).join("")}</div><div style="display:flex;gap:8px;margin-top:16px"><button class="btn active" style="background:var(--lime);color:#000;font-weight:900" onclick="window.cerrarHistorial()">← Volver</button></div></div>`;
  overlay.classList.add("open");
}
function cerrarHistorial(){ const o=document.getElementById("timeline-overlay"); if(o) o.classList.remove("open"); }
window.abrirHistorialPorPlaca=abrirHistorialPorPlaca;
window.cerrarHistorial=cerrarHistorial;
window.limpiarFiltrosComb=function(){ ACTIVE_FILTERS={fecha:'',placa:'',sucursal:'',tipo:'',consumo:''}; renderTable(DATA); };
