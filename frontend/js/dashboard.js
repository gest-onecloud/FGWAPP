// DASHBOARD V11.8 - FLOTA FILTROS EXCEL + HISTORIAL
import { fetchStats, fetchFlota } from './api.js';
let flotaData=[]; let filteredFlota=[];
let ACTIVE_FLOTA = { placa:'', marca:'', modelo:'', anio:'', sucursal:'', estado:'', consumo:'' };

async function init(){
  const stats=await fetchStats(); flotaData=await fetchFlota();
  document.getElementById("ver").textContent=`V11.8 FILTROS FLOTA`;
  document.getElementById("m-flota").textContent=`${stats.total} GDL ${stats.gdl} CLN ${stats.culiacan} Filtros Excel`;
  filteredFlota=[...flotaData];
  renderTabla(filteredFlota);
  setupClose();
}

function norm(f){ return {id:f.id, placa:f.placa||`FG-${String(f.id).padStart(4,'0')}`, marca:f.marca||'Scania', modelo:f.modelo||'R-450', anio:String(f.anio||2022), sucursal:f.sucursales?.clave||'SUC-GDL-01', estado:f.estado||'En Ruta', consumo:f.consumo_estado||'Normal', km:f.kilometraje||'24,532', kml:f.rendimiento||'7.58'}; }

function renderTabla(listaRaw){
  const lista=listaRaw.map(norm);
  const thead=document.getElementById("thead-flota");
  const tbody=document.getElementById("tbody");
  thead.innerHTML=`
    <tr>
      <th data-col="placa">PLACA <span class="filter-arrow">${ACTIVE_FLOTA.placa?'▲':'▼'}</span><div class="excel-panel-header" id="hdr-f-placa"></div></th>
      <th data-col="marca">MARCA <span class="filter-arrow">${ACTIVE_FLOTA.marca?'▲':'▼'}</span><div class="excel-panel-header" id="hdr-f-marca"></div></th>
      <th data-col="modelo">MODELO <span class="filter-arrow">${ACTIVE_FLOTA.modelo?'▲':'▼'}</span><div class="excel-panel-header" id="hdr-f-modelo"></div></th>
      <th data-col="anio">AÑO <span class="filter-arrow">${ACTIVE_FLOTA.anio?'▲':'▼'}</span><div class="excel-panel-header" id="hdr-f-anio"></div></th>
      <th data-col="sucursal">SUCURSAL <span class="filter-arrow">${ACTIVE_FLOTA.sucursal?'▲':'▼'}</span><div class="excel-panel-header" id="hdr-f-sucursal"></div></th>
      <th data-col="estado">ESTADO <span class="filter-arrow">${ACTIVE_FLOTA.estado?'▲':'▼'}</span><div class="excel-panel-header" id="hdr-f-estado"></div></th>
      <th data-col="consumo">CONSUMO <span class="filter-arrow">${ACTIVE_FLOTA.consumo?'▲':'▼'}</span><div class="excel-panel-header" id="hdr-f-consumo"></div></th>
      <th>KM</th><th>KM/L</th>
    </tr>
  `;
  tbody.innerHTML=lista.slice(0,120).map(f=>`<tr class="clickable" data-id="${f.id}"><td style="font-weight:900;color:var(--lime)">${f.placa}</td><td>${f.marca}</td><td>${f.modelo}</td><td>${f.anio}</td><td>${f.sucursal}</td><td>${f.estado}</td><td>${f.consumo}</td><td>${f.km}</td><td style="color:var(--green)">${f.kml}</td></tr>`).join("");
  document.getElementById("filtros-activos").textContent=`• ${lista.length} de ${flotaData.length} • Click header ▼ Excel • Click fila = ficha + historial`;
  // headers
  thead.querySelectorAll("th[data-col]").forEach(th=>{ th.addEventListener("click",(e)=>{ e.stopPropagation(); togglePanel(th.getAttribute("data-col")); }); });
  tbody.querySelectorAll("tr.clickable").forEach(tr=>{ tr.addEventListener("click",()=>{ const id=tr.getAttribute("data-id"); const raw=flotaData.find(x=>String(x.id)===String(id)); if(raw) openFicha(norm(raw)); }); });
  buildPanels();
}

function togglePanel(col){ const p=document.getElementById(`hdr-f-${col}`); if(!p) return; const open=p.classList.contains("open"); closeAll(); if(!open) p.classList.add("open"); }
function closeAll(){ document.querySelectorAll(".excel-panel-header").forEach(p=>p.classList.remove("open")); }
function setupClose(){ document.addEventListener("click",()=>closeAll()); }

function buildPanels(){
  const all=flotaData.map(norm);
  const vals={
    placa:[...new Set(all.map(f=>f.placa))].sort(),
    marca:[...new Set(all.map(f=>f.marca))],
    modelo:[...new Set(all.map(f=>f.modelo))],
    anio:[...new Set(all.map(f=>f.anio))].sort(),
    sucursal:[...new Set(all.map(f=>f.sucursal))],
    estado:[...new Set(all.map(f=>f.estado))],
    consumo:[...new Set(all.map(f=>f.consumo))]
  };
  Object.entries(vals).forEach(([col, list])=>{
    const panel=document.getElementById(`hdr-f-${col}`);
    if(!panel) return;
    const active=ACTIVE_FLOTA[col];
    panel.innerHTML=`
      <input class="excel-search" placeholder="Buscar ${col}..." oninput="window.filtrarFlotaTexto('${col}', this.value)">
      <div style="max-height:240px;overflow-y:auto" id="list-f-${col}">
        ${list.slice(0,80).map(v=>`<div class="excel-item" onclick="window.aplicarFlotaFiltro('${col}','${v}')"><input type="checkbox" ${active===v?'checked':''}> ${v}</div>`).join("")}
      </div>
      <div class="excel-actions"><button class="btn" onclick="window.aplicarFlotaFiltro('${col}','')">Limpiar</button><button class="btn active" onclick="window.cerrarFlotaPaneles()">Cerrar</button></div>
    `;
    panel.addEventListener("click",(e)=>e.stopPropagation());
  });
}

window.filtrarFlotaTexto=function(col, txt){
  const list=document.getElementById(`list-f-${col}`);
  if(!list) return;
  const lower=txt.toLowerCase();
  list.querySelectorAll(".excel-item").forEach(it=>{ it.style.display=it.textContent.toLowerCase().includes(lower)?"flex":"none"; });
};
window.aplicarFlotaFiltro=function(col, val){
  ACTIVE_FLOTA[col]=ACTIVE_FLOTA[col]===val?'':val;
  closeAll();
  let lista=[...flotaData];
  if(ACTIVE_FLOTA.placa) lista=lista.filter(c=>(c.placa||`FG-${String(c.id).padStart(4,'0')}`)===ACTIVE_FLOTA.placa);
  if(ACTIVE_FLOTA.marca) lista=lista.filter(c=>c.marca===ACTIVE_FLOTA.marca);
  if(ACTIVE_FLOTA.modelo) lista=lista.filter(c=>c.modelo===ACTIVE_FLOTA.modelo);
  if(ACTIVE_FLOTA.anio) lista=lista.filter(c=>String(c.anio)===ACTIVE_FLOTA.anio);
  if(ACTIVE_FLOTA.sucursal) lista=lista.filter(c=>(c.sucursales?.clave||'SUC-GDL-01')===ACTIVE_FLOTA.sucursal);
  if(ACTIVE_FLOTA.estado) lista=lista.filter(c=>c.estado===ACTIVE_FLOTA.estado);
  if(ACTIVE_FLOTA.consumo) lista=lista.filter(c=>c.consumo_estado===ACTIVE_FLOTA.consumo);
  filteredFlota=lista;
  renderTabla(lista);
};
window.cerrarFlotaPaneles=function(){ closeAll(); };
window.limpiarFlotaFiltros=function(){ ACTIVE_FLOTA={placa:'',marca:'',modelo:'',anio:'',sucursal:'',estado:'',consumo:''}; filteredFlota=[...flotaData]; renderTabla(filteredFlota); };

function openFicha(f){
  const modal=document.getElementById("modal-content");
  modal.innerHTML=`
    <div class="modal-header"><div><div style="font-size:22px;font-weight:950">${f.placa} <span style="font-size:11px;background:rgba(198,255,0,.15);color:var(--lime);padding:4px 10px;border-radius:999px">${f.estado}</span></div><div style="font-size:11px;color:var(--muted)">${f.marca} ${f.modelo} • ${f.anio} • ${f.sucursal}</div></div><button class="close-btn" onclick="closeFlotaFicha()">✕</button></div>
    <div class="modal-body">
      <div class="modal-grid">
        <div class="modal-field"><div class="k">PLACA</div><div class="v" style="color:var(--lime)">${f.placa}</div></div>
        <div class="modal-field"><div class="k">MARCA / MODELO</div><div class="v">${f.marca} ${f.modelo}</div></div>
        <div class="modal-field"><div class="k">AÑO</div><div class="v">${f.anio}</div></div>
        <div class="modal-field"><div class="k">SUCURSAL</div><div class="v">${f.sucursal}</div></div>
        <div class="modal-field"><div class="k">ESTADO</div><div class="v">${f.estado}</div></div>
        <div class="modal-field"><div class="k">CONSUMO</div><div class="v">${f.consumo}</div></div>
        <div class="modal-field"><div class="k">KILOMETRAJE</div><div class="v">${f.km} km</div></div>
        <div class="modal-field"><div class="k">KM/L</div><div class="v">${f.kml} km/l</div></div>
      </div>
      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn active" style="background:var(--lime);color:#000;font-weight:900" onclick="verHistorialDesdeFlota('${f.placa}')">⛽ Ver Historial Recargas</button>
        <button class="btn" onclick="closeFlotaFicha()">Cerrar</button>
      </div>
    </div>
  `;
  document.getElementById("modal-overlay").classList.add("open");
}
window.closeFlotaFicha=function(){ document.getElementById("modal-overlay").classList.remove("open"); }
window.verHistorialDesdeFlota=function(placa){
  closeFlotaFicha();
  setTimeout(()=>{
    document.getElementById("view-flota").style.display="none";
    document.getElementById("view-combustible").style.display="block";
    document.getElementById("view-dashboard").style.display="none";
    setTimeout(()=>{ if(window.abrirHistorialPorPlaca) window.abrirHistorialPorPlaca(placa); },800);
  },200);
}
init();
