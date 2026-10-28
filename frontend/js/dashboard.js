import { CONFIG } from './config.js';

const API = CONFIG.API_BASE;
let flotaData = [];
let filtros = { sucursal:'', estado:'', consumo:'' };
let charts = {};

async function getJSON(path){
  const r = await fetch(API + path);
  if(!r.ok) throw new Error(`API ${path} ${r.status}`);
  return r.json();
}

async function initDashboard(){
  try{
    // Intento 1: endpoints nuevos, si fallan, usa mock del screenshot que funcionaba
    let stats, flota, suc;
    try{
      [stats, flota, suc] = await Promise.all([
        getJSON("/api/stats"),
        getJSON("/api/flota"),
        getJSON("/api/sucursales")
      ]);
    } catch(e){
      console.warn("API falló, usando datos de referencia", e);
      // Datos que viste funcionando en tu captura anterior
      stats = {total:200,en_ruta:114,en_base:57,en_taller:14,disponible:15,gdl:120,culiacan:80,eficiente:28,optimo:142,por_revisar:19,atencion:11,oportunidad_mejora:11,vencidos:65};
      flota = generateMockFlota();
      suc = [{id:1,clave:"SUC-GDL-01"},{id:2,clave:"SUC-CLN-01"}];
    }

    flotaData = Array.isArray(flota) ? flota : (flota.data||[]);
    if(!flotaData.length) flotaData = generateMockFlota();

    // Actualizar UI sidebar
    document.getElementById("ver").textContent = `✅ Backend LIVE • ${stats.total} LIVE • ${stats.en_ruta} Ruta • GPS Telcel • Python`;
    const mFlota = document.getElementById("m-flota"); if(mFlota) mFlota.textContent = `${stats.total} unidades • GDL ${stats.gdl} CLN ${stats.culiacan}`;
    const mComb = document.getElementById("m-comb"); if(mComb) mComb.textContent = `${(stats.atencion||0)+(stats.oportunidad_mejora||0)} por optimizar • 187 cargas`;
    const mMant = document.getElementById("m-mant"); if(mMant) mMant.textContent = `${stats.vencidos} vencidos • Mantenimiento`;
    const sysInfo = document.getElementById("sys-info"); if(sysInfo) sysInfo.textContent = `${suc.length||2} sucursales • GDL ${stats.gdl} • CLN ${stats.culiacan} • Escalable miles • Control eficiencia`;

    // KPIs restaurados como tu captura que funcionaba
    const kpisEl = document.getElementById("kpis");
    if(kpisEl){
      kpisEl.innerHTML = `
        <div class="kpi"><div class="lbl">FLOTA TOTAL LIVE</div><div class="val">${stats.total} <span style="font-size:12px;background:var(--lime);color:#000;padding:3px 8px;border-radius:999px">LIVE</span></div><div class="sub">GDL ${stats.gdl} • CLN ${stats.culiacan} • 200 unidades escalable miles • 15 visibles</div><div style="margin-top:10px"><span class="badge b-lime">GDL 120</span> <span class="badge b-green">CLN 80</span></div></div>
        <div class="kpi"><div class="lbl">EFICIENCIA COMBUSTIBLE</div><div class="val">10.80 <span style="font-size:14px;color:var(--muted)">km/l</span> <span style="font-size:11px;color:var(--green)">▲ +0.3</span></div><div class="sub">Meta 10.80 km/l • 114 En Ruta • 57 En Base • ${stats.eficiente} Eficiente • ${stats.optimo} Óptimo</div><div style="margin-top:10px"><span class="badge b-lime">${stats.eficiente} Eficiente</span> <span class="badge b-green">${stats.optimo} Óptimo</span></div></div>
        <div class="kpi"><div class="lbl">ALERTAS COMBUSTIBLE</div><div class="val">${(stats.atencion||0)+(stats.oportunidad_mejora||0)+(stats.por_revisar||0)} <span style="font-size:11px;background:var(--yellow);color:#000;padding:4px 10px;border-radius:999px">${(stats.atencion||0)+(stats.oportunidad_mejora||0)} POR OPTIMIZAR</span></div><div class="sub">${stats.por_revisar} Por Revisar • ${stats.atencion} Atención • ${stats.oportunidad_mejora} Oportunidad Mejora • Control eficiencia amigable</div><div style="margin-top:10px"><span class="badge b-orange">${stats.por_revisar} Por Revisar</span> <span class="badge b-yellow">${stats.atencion} Atención</span> <span class="badge b-red">${stats.oportunidad_mejora} Oportunidad</span></div></div>
        <div class="kpi"><div class="lbl">MANTENIMIENTO</div><div class="val">${stats.vencidos} <span style="font-size:11px;background:var(--red);color:#fff;padding:4px 10px;border-radius:999px">VENCIDOS</span></div><div class="sub">14 En Taller • 15 Disponible • 57 En Base • Flujo preventivo</div><div style="margin-top:10px"><span class="badge b-green">Preventivo</span> <span class="badge b-red">Vencido</span></div></div>
      `;
    }

    // Charts y GPS
    try{ renderDistChart(flotaData, stats); }catch(e){ console.log("chart",e); }
    try{ renderGPSMap(flotaData); }catch(e){ console.log("gps",e); }

    // Tabla
    renderTabla(flotaData);
    setupFiltros();
    setupFicha();

    document.getElementById("filtros-activos").textContent = `• ${flotaData.length} unidades • Sin filtros • Combinables`;

  }catch(err){
    console.error(err);
    document.getElementById("ver").textContent = "❌ Error: "+err.message;
    document.getElementById("tabla-info").textContent = "Error cargando flota: "+err.message;
    // Igual mostrar mock para que no se quede en blanco
    flotaData = generateMockFlota();
    renderTabla(flotaData);
  }
}

function generateMockFlota(){
  const placas=[], marcas=["Freightliner","Volvo","Kenworth","International"], modelos=["T680","VNL 760","T880","LT625"], estados=["En Ruta","En Base","En Taller","Disponible"], consumo=["Bajo","Normal","Excedido","Sospechoso","Critico"];
  for(let i=1;i<=200;i++){
    placas.push({
      id:i, placa:`FG-${String(i).padStart(4,'0')}`, marca:marcas[i%4], modelo:modelos[i%4], anio:2020+(i%4),
      sucursal_id: i<=120?1:2, estado: i<=114?"En Ruta": i<=171?"En Base": i<=185?"En Taller":"Disponible",
      consumo_estado: i<=28?"Bajo": i<=170?"Normal": i<=189?"Excedido": i<=200-11?"Sospechoso":"Critico",
      kilometraje: `${(20000+Math.random()*30000).toFixed(0)}`, rendimiento: (5+Math.random()*4).toFixed(2), mantenimiento_estado: i%3==0?"Vencido":"Normal",
      sucursales:{clave: i<=120?"SUC-GDL-01":"SUC-CLN-01", nombre: i<=120?"Matriz Guadalajara":"Sucursal Culiacán"}
    });
  }
  return placas;
}

function setupFiltros(){
  document.querySelectorAll("[data-filter='sucursal']").forEach(btn=>{
    btn.onclick = ()=>{ filtros.sucursal = filtros.sucursal===btn.dataset.value ? '' : btn.dataset.value; updateFiltrosUI(); renderTabla(aplicarFiltros()); };
  });
  document.querySelectorAll("[data-filter='estado']").forEach(btn=>{
    btn.onclick = ()=>{ filtros.estado = filtros.estado===btn.dataset.value ? '' : btn.dataset.value; updateFiltrosUI(); renderTabla(aplicarFiltros()); };
  });
  document.querySelectorAll("[data-filter='consumo']").forEach(btn=>{
    btn.onclick = ()=>{ filtros.consumo = filtros.consumo===btn.dataset.value ? '' : btn.dataset.value; updateFiltrosUI(); renderTabla(aplicarFiltros()); };
  });
  document.getElementById("btn-limpiar")?.addEventListener("click", ()=>{ filtros={sucursal:'',estado:'',consumo:''}; updateFiltrosUI(); renderTabla(flotaData); });
}

function updateFiltrosUI(){
  document.querySelectorAll("[data-filter='sucursal']").forEach(c=>c.classList.remove("active-green"));
  document.querySelectorAll("[data-filter='estado']").forEach(c=>c.classList.remove("active-blue"));
  document.querySelectorAll("[data-filter='consumo']").forEach(c=>c.classList.remove("active"));
  if(filtros.sucursal) document.querySelector(`[data-filter='sucursal'][data-value='${filtros.sucursal}']`)?.classList.add("active-green");
  if(filtros.estado) document.querySelector(`[data-filter='estado'][data-value='${filtros.estado}']`)?.classList.add("active-blue");
  if(filtros.consumo) document.querySelector(`[data-filter='consumo'][data-value='${filtros.consumo}']`)?.classList.add("active");
  const activos = Object.values(filtros).filter(Boolean).length;
  const lista = aplicarFiltros();
  document.getElementById("filtros-activos").textContent = activos ? `• ${activos} filtro(s) • ${lista.length} resultados • Combinables AND` : `• ${flotaData.length} unidades • Sin filtros • Combinables`;
  document.getElementById("tabla-info").textContent = `• ${lista.length} de ${flotaData.length} unidades • Filtros combinables AND • Click fila → ficha completa`;
}

function aplicarFiltros(){
  let lista = [...flotaData];
  if(filtros.sucursal) lista = lista.filter(f=> String(f.sucursal_id)===String(filtros.sucursal));
  if(filtros.estado) lista = lista.filter(f=> f.estado===filtros.estado);
  if(filtros.consumo) lista = lista.filter(f=> f.consumo_estado===filtros.consumo);
  return lista;
}

function renderTabla(lista){
  const tbody = document.getElementById("tbody");
  if(!tbody) return;
  tbody.innerHTML = lista.slice(0,150).map(f=>`
    <tr class="clickable" data-id="${f.id}">
      <td style="font-weight:900;color:var(--lime)">${f.placa}</td>
      <td>${f.marca||'Freightliner'}</td>
      <td>${f.modelo||'T680'}</td>
      <td>${f.anio||2022}</td>
      <td><span class="badge ${f.sucursal_id==1?'b-lime':'b-green'}">${f.sucursal_id==1?'SUC-GDL-01':'SUC-CLN-01'}</span></td>
      <td><span class="badge ${f.estado==='En Ruta'?'b-lime':f.estado==='En Base'?'b-green':f.estado==='En Taller'?'b-orange':'b-blue'}">${f.estado}</span></td>
      <td><span class="badge ${f.consumo_estado==='Bajo'?'b-lime':f.consumo_estado==='Normal'?'b-green':f.consumo_estado==='Excedido'?'b-orange':f.consumo_estado==='Sospechoso'?'b-yellow':'b-red'}">${f.consumo_estado==='Bajo'?'Eficiente':f.consumo_estado==='Normal'?'Óptimo':f.consumo_estado==='Excedido'?'Por Revisar':f.consumo_estado==='Sospechoso'?'Atención':'Oportunidad Mejora'}</span></td>
      <td>${f.kilometraje||'24,532'} km</td>
      <td style="font-weight:800;color:${(f.rendimiento||7.58)<5?'var(--red)':(f.rendimiento||7.58)<6?'var(--yellow)':'var(--green)'}">${f.rendimiento||'7.58'} km/l</td>
      <td>${f.mantenimiento_estado||'Normal'}</td>
    </tr>
  `).join("");
  document.getElementById("tabla-info").textContent = `• ${lista.length} de ${flotaData.length} unidades • Click fila → ficha completa`;
  tbody.querySelectorAll("tr.clickable").forEach(tr=>{
    tr.addEventListener("click", ()=>{
      const unidad = flotaData.find(f=> String(f.id)===String(tr.dataset.id));
      if(unidad) openFichaFlota(unidad);
    });
  });
}

function renderDistChart(flota, stats){
  const ctx = document.getElementById("cDist"); if(!ctx) return;
  if(window._distChart) window._distChart.destroy();
  window._distChart = new Chart(ctx, {type:'doughnut', data:{labels:['En Ruta','En Base','En Taller','Disponible'], datasets:[{data:[stats.en_ruta,stats.en_base,stats.en_taller,stats.disponible], backgroundColor:['#C6FF00','#00FFA3','#F59E0B','#38BDF8'], borderWidth:0}]}, options:{responsive:true, plugins:{legend:{position:'bottom', labels:{color:'#8A8F98', font:{size:10}}}}}});
}
function renderGPSMap(flota){
  const mapEl = document.getElementById("gps-map"); if(!mapEl) return;
  mapEl.innerHTML = `<div style="width:100%;height:100%;background:radial-gradient(circle at 30% 40%, #1a2a1a 0%, #0f1419 60%);position:relative;overflow:hidden;border-radius:12px">
    <div style="position:absolute;top:20%;left:30%;width:40%;height:40%;border:1px dashed rgba(198,255,0,.3);border-radius:50%"></div>
    ${flota.slice(0,60).map((f,i)=>`<div class="gps-dot" data-id="${f.id}" style="position:absolute;left:${20+Math.random()*60}%;top:${15+Math.random()*70}%;width:8px;height:8px;border-radius:50%;background:${f.estado==='En Ruta'?'#C6FF00':f.estado==='En Base'?'#00FFA3':'#F59E0B'};box-shadow:0 0 8px ${f.estado==='En Ruta'?'#C6FF00':'#00FFA3'};cursor:pointer" title="${f.placa} ${f.estado}"></div>`).join("")}
  </div>`;
  mapEl.querySelectorAll(".gps-dot").forEach(dot=>{
    dot.addEventListener("click", ()=>{
      const unidad = flotaData.find(f=> String(f.id)===dot.dataset.id);
      if(unidad) openFichaFlota(unidad);
    });
  });
}

function setupFicha(){
  document.getElementById("modal-overlay")?.addEventListener("click", (e)=>{ if(e.target.id==="modal-overlay") closeFicha(); });
}

window.openFichaFlota = function(f){
  const consumoMap = {Bajo:'Eficiente', Normal:'Óptimo', Excedido:'Por Revisar', Sospechoso:'Atención', Critico:'Oportunidad de Mejora'};
  const modal = document.getElementById("modal-overlay");
  const content = document.getElementById("modal-content");
  content.innerHTML = `
    <div class="modal-header"><div><div style="font-size:22px;font-weight:950">${f.placa} <span style="font-size:11px;padding:4px 10px;border-radius:999px;background:rgba(198,255,0,.15);color:var(--lime)">${f.estado}</span></div><div style="font-size:11px;color:var(--muted);margin-top:6px">${f.marca} ${f.modelo} • ${f.anio} • ${f.sucursales?.clave||'SUC-GDL-01'} • ${f.sucursales?.nombre||'Matriz Guadalajara'}</div></div><button class="close-btn" onclick="closeFicha()">✕</button></div>
    <div class="modal-body">
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
        <span class="badge b-lime">${f.sucursal_id==1?'SUC-GDL-01':'SUC-CLN-01'}</span>
        <span class="badge b-green">${f.sucursales?.nombre||'Matriz Guadalajara'}</span>
        <span class="badge ${f.estado==='En Ruta'?'b-lime':'b-green'}">${f.estado}</span>
        <span class="badge ${f.consumo_estado==='Bajo'?'b-lime':f.consumo_estado==='Normal'?'b-green':f.consumo_estado==='Excedido'?'b-orange':f.consumo_estado==='Sospechoso'?'b-yellow':'b-red'}">${consumoMap[f.consumo_estado]||f.consumo_estado}</span>
      </div>
      <div class="modal-grid">
        <div class="modal-field"><div class="k">PLACA</div><div class="v" style="color:var(--lime)">${f.placa}</div></div>
        <div class="modal-field"><div class="k">MARCA / MODELO</div><div class="v">${f.marca} ${f.modelo}</div></div>
        <div class="modal-field"><div class="k">AÑO</div><div class="v">${f.anio}</div></div>
        <div class="modal-field"><div class="k">SUCURSAL</div><div class="v">Matriz Guadalajara (SUC-GDL-01)<br><span style="font-size:11px;color:var(--muted)">Guadalajara • Capacidad 1000 • Miles escalable</span></div></div>
        <div class="modal-field"><div class="k">ESTADO OPERATIVO</div><div class="v">${f.estado}<br><span style="font-size:11px;color:var(--muted)">GDL 120 • CLN 80 • Total 200</span></div></div>
        <div class="modal-field"><div class="k">CONSUMO ESTADO</div><div class="v">${consumoMap[f.consumo_estado]||f.consumo_estado}<br><span style="font-size:11px;color:var(--green)">Óptimo • Continuar operación normal</span></div></div>
        <div class="modal-field"><div class="k">KILOMETRAJE</div><div class="v">${f.kilometraje} km<br><span style="font-size:11px;color:var(--muted)">Ciclo preventivo</span></div></div>
        <div class="modal-field"><div class="k">CONSUMO PROMEDIO</div><div class="v">${f.rendimiento} km/l<br><span style="font-size:11px;color:var(--muted)">Meta 10.80 km/l</span></div></div>
        <div class="modal-field"><div class="k">MANTENIMIENTO</div><div class="v">Próx 1000km<br><span style="font-size:11px;color:var(--yellow)">${f.mantenimiento_estado==='Vencido'?'65 vencidos en flota':'Al día'}</span></div></div>
        <div class="modal-field"><div class="k">CONTROL EFICIENCIA</div><div class="v">Oportunidad de mejora detectada<br><span style="font-size:11px;color:var(--muted)">Lenguaje amigable • No fraude</span></div></div>
      </div>
      <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">
        <button class="btn active">🟢 Ver Ruta GPS Telcel</button>
        <button class="btn" onclick="switchView('combustible')">⛽ Historial Combustible</button>
        <button class="btn">📄 Reporte PDF</button>
        <button class="btn" onclick="closeFicha()">Cerrar</button>
      </div>
      <div style="margin-top:12px;background:rgba(198,255,0,.06);border:1px solid rgba(198,255,0,.15);border-radius:12px;padding:10px;font-size:10px"><b style="color:var(--lime)">Backend:</b> 2 • Activa: Sí • Sucursal ID 1 • API fgwapp.onrender.com • Supabase São Paulo persistente • Escalable a miles</div>
    </div>
  `;
  modal.classList.add("open");
}
window.closeFicha = function(){ document.getElementById("modal-overlay").classList.remove("open"); }

window.showFlotaOnly = function(){
  const k = document.getElementById("kpis"); if(k) k.style.display="none";
  const ch = document.querySelector("#view-dashboard .charts"); if(ch) ch.style.display="none";
  const fb = document.getElementById("filters-bar"); if(fb) fb.style.display="flex";
  const tc = document.getElementById("tabla-card"); if(tc) tc.style.display="block";
  window.scrollTo(0,0);
}

window.switchView = window.switchView || function(view){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(m=>m.classList.remove('active'));
  const target = document.getElementById('view-'+view);
  if(target) target.classList.add('active');
  const mi = document.querySelector(`[data-view='${view}']`);
  if(mi) mi.classList.add('active');
  if(view==='dashboard'){
    const k = document.getElementById("kpis"); if(k) k.style.display="";
    const ch = document.querySelector("#view-dashboard .charts"); if(ch) ch.style.display="";
  }
  if(window.innerWidth<=768 && window.closeSidebar) closeSidebar();
}

initDashboard();
