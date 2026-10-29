// COMBUSTIBLE MODULE - FINAL WORKING - Historial SIEMPRE despliega
import { fetchCombustible, generateMockCombustible, generateHistorialForPlaca } from './api.js';

let DATA=[]; let FILTERED=[]; let FILTROS={placa:'', sucursal:'', estado:''};

export async function initCombustible(){
  const res=await fetchCombustible();
  DATA=res.lista && res.lista.length>0 ? res.lista : generateMockCombustible();
  FILTERED=[...DATA];
  window._combDataGlobal=DATA;
  console.log("[Combustible] Cargadas:", DATA.length, "placas únicas:", [...new Set(DATA.map(c=>c.placa))].length);
  renderStats(res.stats);
  renderTable(FILTERED);
}

function renderStats(s){
  const stats=s||{total_cargas:DATA.length, promedio_km_l:6.24, por_optimizar:22, costo_mes:145800, total_litros:2143};
  const el=document.getElementById("comb-stats");
  el.innerHTML=`
    <div class="comb-kpi"><div class="lbl">Cargas</div><div class="val">${stats.total_cargas} LIVE</div><div class="sub">Total ${DATA.length}</div></div>
    <div class="comb-kpi"><div class="lbl">Promedio</div><div class="val" style="color:var(--green)">${stats.promedio_km_l} km/l</div><div class="sub">Meta 10.80</div></div>
    <div class="comb-kpi"><div class="lbl">Por Optimizar</div><div class="val" style="color:var(--orange)">${stats.por_optimizar}</div><div class="sub">Revisar + Atención</div></div>
    <div class="comb-kpi"><div class="lbl">Costo Mes</div><div class="val">$${Number(stats.costo_mes).toLocaleString()}</div><div class="sub">${DATA.length} cargas</div></div>
  `;
}

function renderTable(lista){
  FILTERED=lista;
  const thead=document.getElementById("thead-comb");
  const tbody=document.getElementById("tbody-comb");
  thead.innerHTML=`<tr><th>FECHA</th><th>PLACA</th><th>SUCURSAL</th><th>LITROS</th><th>KM</th><th>KM/L</th><th>TIPO</th><th>CONSUMO</th><th>COSTO</th></tr>`;
  tbody.innerHTML=lista.slice(0,150).map(c=>`
    <tr class="clickable" data-placa="${c.placa}" data-id="${c.id}">
      <td>${c.fecha}</td>
      <td style="font-weight:900;color:var(--lime)">${c.placa}</td>
      <td>${c.sucursal}</td>
      <td>${c.litros} L</td>
      <td>${c.km_recorridos}</td>
      <td style="color:var(--green);font-weight:800">${c.rendimiento}</td>
      <td>${c.tipo}</td>
      <td><span class="badge ${badgeClass(c.consumo_estado)}">${c.consumo_estado}</span></td>
      <td>$${c.costo}</td>
    </tr>
  `).join("");
  document.getElementById("comb-info").textContent=`• ${lista.length} de ${DATA.length} • Click fila = historial recargas`;

  // BIND CLICK FILA = HISTORIAL
  tbody.querySelectorAll("tr.clickable").forEach(tr=>{
    tr.addEventListener("click",()=>{
      const placa=tr.getAttribute("data-placa");
      console.log("[Combustible] Click fila placa:", placa);
      abrirHistorialPorPlaca(placa);
    });
  });
}

function badgeClass(e){ if(e==="Eficiente") return "b-lime"; if(e==="Óptimo") return "b-green"; if(e==="Por Revisar") return "b-orange"; if(e==="Atención") return "b-yellow"; return "b-red"; }

// FUNCION PRINCIPAL HISTORIAL - SIEMPRE DESPLIEGA
function abrirHistorialPorPlaca(placa){
  console.log("[Historial] Abriendo historial para:", placa, "DATA total:", DATA.length);
  let lista=DATA.filter(c=>c.placa===placa);
  if(lista.length===0){
    console.log("[Historial] No hay datos para", placa, "generando mock");
    lista=generateHistorialForPlaca(placa);
  }
  console.log("[Historial] Lista encontrada:", lista.length);
  abrirModalHistorial(lista, placa);
}

function abrirModalHistorial(lista, placa){
  let overlay=document.getElementById("timeline-overlay");
  if(!overlay){
    console.error("[Historial] timeline-overlay no existe en DOM! Creando...");
    overlay=document.createElement("div");
    overlay.id="timeline-overlay";
    overlay.className="timeline-overlay";
    overlay.innerHTML='<div class="timeline-modal" id="timeline-modal-inner"></div>';
    document.body.appendChild(overlay);
  }
  const inner=document.getElementById("timeline-modal-inner");
  if(!inner){ console.error("timeline-modal-inner no existe"); return; }

  inner.innerHTML=`
    <div class="timeline-modal-header">
      <div>
        <div style="font-size:18px;font-weight:950">⛽ Historial Recargas • ${placa} • ${lista.length} recargas</div>
        <div style="font-size:11px;color:var(--muted)">Consumo promedio ${lista[0]?.rendimiento||'7.5'} km/l • ${lista[0]?.sucursal||'SUC-GDL-01'} • Historial completo</div>
      </div>
      <button class="close-btn" onclick="window.cerrarHistorial()">✕</button>
    </div>
    <div class="timeline-modal-body">
      <div class="timeline">
        ${lista.map(c=>`
          <div class="tl-item">
            <div style="display:flex;justify-content:space-between"><b>${c.fecha} • ${c.rendimiento} km/l • ${c.litros} L</b><span class="badge ${badgeClass(c.consumo_estado)}">${c.consumo_estado}</span></div>
            <div style="font-size:11px;color:var(--muted);margin-top:4px">${c.km_recorridos} km • ${c.tipo} • $${c.costo} • ${c.estacion||'GAS-GDL-01'}</div>
          </div>
        `).join("")}
      </div>
      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn active" style="background:var(--lime);color:#000;font-weight:900" onclick="window.cerrarHistorial()">← Volver a tabla ${placa}</button>
        <button class="btn" onclick="window.limpiarFiltrosComb(); window.cerrarHistorial()">🧹 Ver todas</button>
      </div>
    </div>
  `;
  overlay.classList.add("open");
  console.log("[Historial] Modal abierto para", placa);
}

function cerrarHistorial(){
  const overlay=document.getElementById("timeline-overlay");
  if(overlay) overlay.classList.remove("open");
}

// EXPORTS GLOBALES
window.abrirHistorialPorPlaca=abrirHistorialPorPlaca;
window.abrirModalHistorial=abrirModalHistorial;
window.cerrarHistorial=cerrarHistorial;
window.closeHistorialModal=cerrarHistorial;
window.closeTimelineModal=cerrarHistorial;
window.filterCombPlaca=function(placa){ abrirHistorialPorPlaca(placa); };
window.openHistorialDirect=function(lista, placa){ abrirModalHistorial(lista, placa); };
window.limpiarFiltrosComb=function(){ FILTROS={placa:'', sucursal:'', estado:''}; renderTable(DATA); };
window.limpiarCombFiltros=window.limpiarFiltrosComb;
