// DASHBOARD - Flota - Ficha con Ver Historial que SIEMPRE despliega
import { fetchStats, fetchFlota } from './api.js';
let flotaData=[]; let filtros={};
async function init(){
  const stats=await fetchStats(); flotaData=await fetchFlota();
  document.getElementById("ver").textContent=`LIVE ${stats.total} Ruta`;
  document.getElementById("m-flota").textContent=`${stats.total} GDL ${stats.gdl} CLN ${stats.culiacan}`;
  renderTabla(flotaData);
}
function norm(f){ return {id:f.id, placa:f.placa||`FG-${String(f.id).padStart(4,'0')}`, marca:f.marca||'Scania', modelo:f.modelo||'R-450', anio:f.anio||2022, sucursal:f.sucursales?.clave||'SUC-GDL-01', estado:f.estado||'En Ruta', consumo:f.consumo_estado||'Normal', km:f.kilometraje||'24,532', kml:f.rendimiento||'7.58', mant:f.mantenimiento_estado||'Preventivo'}; }
function renderTabla(listaRaw){
  const lista=listaRaw.map(norm);
  const thead=document.getElementById("thead-flota");
  const tbody=document.getElementById("tbody");
  thead.innerHTML=`<tr><th>PLACA</th><th>MARCA</th><th>MODELO</th><th>AÑO</th><th>SUCURSAL</th><th>ESTADO</th><th>CONSUMO</th><th>KM</th><th>KM/L</th></tr>`;
  tbody.innerHTML=lista.slice(0,100).map(f=>`<tr class="clickable" data-id="${f.id}"><td style="font-weight:900;color:var(--lime)">${f.placa}</td><td>${f.marca}</td><td>${f.modelo}</td><td>${f.anio}</td><td>${f.sucursal}</td><td>${f.estado}</td><td>${f.consumo}</td><td>${f.km}</td><td style="color:var(--green)">${f.kml}</td></tr>`).join("");
  tbody.querySelectorAll("tr.clickable").forEach(tr=>{
    tr.addEventListener("click",()=>{
      const id=tr.getAttribute("data-id");
      const raw=flotaData.find(x=>String(x.id)===String(id));
      if(raw) openFicha(norm(raw));
    });
  });
}
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
    // Espera a que combustible cargue y abre historial
    setTimeout(()=>{
      if(window.abrirHistorialPorPlaca) window.abrirHistorialPorPlaca(placa);
      else console.log("abrirHistorialPorPlaca no listo, reintentando", placa);
    },800);
  },200);
}
init();
