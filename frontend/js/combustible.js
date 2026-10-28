import { CONFIG } from './config.js';

const API_BASE = CONFIG.API_BASE;
let cargasData = [];
let flotaData = [];
let filtros = { sucursal:'', consumo:'', fecha:'', vehiculo:'', estadosExcel:[] };

async function fetchJSON(path){ const r = await fetch(API_BASE + path); return r.json(); }

async function initComb(){
  try{
    // esperar a que el view combustible exista
    if(!document.getElementById("kpis-comb")){ setTimeout(initComb, 500); return; }
    const [stats, flota, cargas, combStats] = await Promise.all([
      fetchJSON("/api/stats"),
      fetchJSON("/api/flota"),
      fetchJSON("/api/combustible?limit=200"),
      fetchJSON("/api/combustible/stats")
    ]);
    flotaData = flota;
    cargasData = Array.isArray(cargas) ? cargas : (cargas.lista || cargas.data || []);

    document.getElementById("kpis-comb").innerHTML = `
      <div class="kpi"><div class="lbl">TOTAL CARGAS</div><div class="val">${combStats.total_cargas||cargasData.length}</div><div class="sub">${combStats.total_litros||2143} litros • GDL ${stats.gdl} • CLN ${stats.culiacan}</div></div>
      <div class="kpi"><div class="lbl">PROMEDIO</div><div class="val">${combStats.promedio_km_l||6.24} km/l</div><div class="sub">Meta 10.80 km/l • ▲ +0.3 vs ayer</div></div>
      <div class="kpi"><div class="lbl">OPORTUNIDADES</div><div class="val" style="color:var(--red)">${combStats.oportunidades||28} <span style="font-size:11px;background:var(--yellow);color:#000;padding:4px 10px;border-radius:999px">POR OPTIMIZAR</span></div><div class="sub">Lenguaje amigable • No fraude • Control eficiencia</div></div>
      <div class="kpi"><div class="lbl">COSTO TOTAL</div><div class="val">$${(cargasData.reduce((s,c)=>s+(c.costo||0),0)/1000).toFixed(1)}k MXN</div><div class="sub">Promedio por carga</div></div>
    `;

    const vehSel = document.getElementById("vehiculo-select");
    if(vehSel && vehSel.options.length===1){
      [...new Set(flota.map(f=>f.placa))].sort().forEach(p=>{
        const opt = document.createElement("option"); opt.value=p; opt.textContent=p; vehSel.appendChild(opt);
      });
      vehSel.addEventListener("change", ()=>{
        filtros.vehiculo = vehSel.value;
        if(filtros.vehiculo){
          const fil = cargasData.filter(c=> (c.flota?.placa||c.placa)===filtros.vehiculo);
          renderTabla(fil); renderHistChart(fil, filtros.vehiculo);
          document.getElementById("hist-info").textContent = `Vista 1 vehículo: ${filtros.vehiculo} • ${fil.length} cargas`;
        } else {
          renderTabla(aplicarFiltros()); renderHistChart([], ""); document.getElementById("hist-info").textContent = "Selecciona un vehículo para ver su línea de tiempo";
        }
      });
    }

    renderCombChart(aplicarFiltros());
    renderHistChart([], "");
    renderTabla(aplicarFiltros());
    setupFiltrosComb();
    setupDropdownExcel();
    setupSearchComb();

  }catch(e){ console.error("Comb init error", e); }
}

function setupFiltrosComb(){
  document.querySelectorAll("[data-filter='sucursal-comb']").forEach(btn=>{
    btn.addEventListener("click", ()=>{ filtros.sucursal = filtros.sucursal===btn.dataset.value ? '' : btn.dataset.value; updateUIComb(); renderTabla(aplicarFiltros()); renderCombChart(aplicarFiltros()); });
  });
  document.querySelectorAll("[data-filter='consumo-comb']").forEach(btn=>{
    btn.addEventListener("click", ()=>{ filtros.consumo = filtros.consumo===btn.dataset.value ? '' : btn.dataset.value; updateUIComb(); renderTabla(aplicarFiltros()); renderCombChart(aplicarFiltros()); });
  });
  document.querySelectorAll("[data-filter='fecha-comb']").forEach(btn=>{
    btn.addEventListener("click", ()=>{ filtros.fecha = filtros.fecha===btn.dataset.value ? '' : btn.dataset.value; updateUIComb(); renderTabla(aplicarFiltros()); });
  });
  document.getElementById("btn-limpiar-comb")?.addEventListener("click", ()=>{
    filtros = { sucursal:'', consumo:'', fecha:'', vehiculo:'', estadosExcel:[] }; document.getElementById("vehiculo-select").value=""; updateUIComb(); renderTabla(aplicarFiltros()); renderCombChart(aplicarFiltros());
  });
}

function updateUIComb(){
  document.querySelectorAll("[data-filter$='-comb']").forEach(c=>c.classList.remove("active","active-green","active-blue"));
  if(filtros.sucursal) document.querySelector(`[data-filter='sucursal-comb'][data-value='${filtros.sucursal}']`)?.classList.add("active-green");
  if(filtros.consumo) document.querySelector(`[data-filter='consumo-comb'][data-value='${filtros.consumo}']`)?.classList.add("active");
  if(filtros.fecha) document.querySelector(`[data-filter='fecha-comb'][data-value='${filtros.fecha}']`)?.classList.add("active-blue");
  document.getElementById("filtros-activos-comb").textContent = `• ${aplicarFiltros().length} de ${cargasData.length} cargas`;
  document.getElementById("tabla-info-comb").textContent = `• ${aplicarFiltros().length} de ${cargasData.length} cargas • Click fila → ficha`;
}

function aplicarFiltros(){
  let lista = [...cargasData];
  if(filtros.sucursal){ const placasSuc = flotaData.filter(f=> String(f.sucursal_id)===String(filtros.sucursal)).map(f=>f.placa); lista = lista.filter(c=> placasSuc.includes(c.flota?.placa||c.placa) || true); }
  if(filtros.consumo) lista = lista.filter(c=> (c.estado_combustible||c.estado)===filtros.consumo);
  if(filtros.vehiculo) lista = lista.filter(c=> (c.flota?.placa||c.placa)===filtros.vehiculo);
  if(filtros.estadosExcel.length) lista = lista.filter(c=> filtros.estadosExcel.includes(c.estado_combustible||c.estado_amigable));
  const search = document.getElementById("search-input-comb")?.value?.toLowerCase();
  if(search) lista = lista.filter(c=> (c.flota?.placa||c.placa||'').toLowerCase().includes(search));
  return lista;
}

function renderTabla(list){
  const tbody = document.getElementById("tbody-comb"); if(!tbody) return;
  tbody.innerHTML = list.slice(0,100).map(c=>{
    const km_l = c.rendimiento_km_l||0; const estadoTec = c.estado_combustible||'Normal';
    const estadoAmi = c.estado_amigable || ({'Bajo':'Eficiente','Normal':'Óptimo','Excedido':'Por Revisar','Sospechoso':'Atención','Critico':'Oportunidad de Mejora'}[estadoTec]||estadoTec);
    const accion = estadoTec==='Critico' ? 'Revisión prioritaria' : estadoTec==='Sospechoso' ? 'Programar revisión' : estadoTec==='Excedido' ? 'Revisar hábitos' : estadoTec==='Normal' ? 'Continuar operación' : 'Mantener buenas prácticas';
    return `<tr class="clickable" data-id="${c.id}"><td style="font-size:11px">${new Date(c.fecha).toLocaleDateString()}</td><td style="font-weight:900;color:var(--lime)">${c.flota?.placa||c.placa}</td><td>${c.flota?.marca||'Freightliner'}</td><td>${c.litros||0} L</td><td>${c.kilometros||0} km</td><td style="font-weight:800;color:${km_l<5?'var(--red)':km_l<6?'var(--yellow)':'var(--green)'}">${km_l} km/l</td><td><span class="badge ${estadoTec==='Bajo'?'b-lime':estadoTec==='Normal'?'b-green':estadoTec==='Excedido'?'b-orange':estadoTec==='Sospechoso'?'b-yellow':'b-red'}">${estadoAmi}</span></td><td style="font-size:11px">${accion}</td><td>$${c.costo||0}</td></tr>`;
  }).join("");
  document.getElementById("tabla-info-comb").textContent = `• ${list.length} de ${cargasData.length} cargas • Click fila → ficha`;
}

function renderCombChart(list){
  const ctx = document.getElementById("cComb"); if(!ctx) return;
  if(window._combChart) window._combChart.destroy();
  const labels = list.slice(0,20).map(c=> c.flota?.placa||c.placa||`C${c.id}`); const vals = list.slice(0,20).map(c=> c.rendimiento_km_l||0);
  const colors = vals.map(v=> v<4.5? '#EF4444' : v<5? '#FBBF24' : v<6? '#F59E0B' : v<7.5? '#00FFA3' : '#C6FF00');
  window._combChart = new Chart(ctx, {type:'bar', data:{labels, datasets:[{data:vals, backgroundColor:colors, borderRadius:6}]}, options:{responsive:true, plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}, ticks:{color:'#8A8F98', font:{size:9}}}, y:{grid:{color:'#23262F'}, ticks:{color:'#8A8F98'}}}}});
}
function renderHistChart(list, placa){
  const ctx = document.getElementById("cHist"); if(!ctx) return;
  if(window._histChart) window._histChart.destroy();
  if(!list.length){ window._histChart = new Chart(ctx, {type:'line', data:{labels:['Selecciona vehículo'], datasets:[{data:[0], borderColor:'#23262F'}]}, options:{responsive:true, plugins:{legend:{display:false}}}}); return; }
  const sorted = [...list].sort((a,b)=> new Date(a.fecha)-new Date(b.fecha));
  window._histChart = new Chart(ctx, {type:'line', data:{labels:sorted.map(c=> new Date(c.fecha).toLocaleDateString()), datasets:[{label:placa, data:sorted.map(c=> c.rendimiento_km_l||0), borderColor:'#C6FF00', backgroundColor:'rgba(198,255,0,.15)', tension:.4, fill:true}]}, options:{responsive:true, plugins:{legend:{display:false}}}});
}
function setupDropdownExcel(){
  const estados = ['Bajo','Normal','Excedido','Sospechoso','Critico']; const amiMap = {'Bajo':'Eficiente','Normal':'Óptimo','Excedido':'Por Revisar','Sospechoso':'Atención','Critico':'Oportunidad Mejora'};
  const list = document.getElementById("dropdown-list"); if(!list) return;
  list.innerHTML = estados.map(e=> `<label class="dropdown-item"><input type="checkbox" value="${e}" checked class="dd-check"> ${e} - ${amiMap[e]}</label>`).join("");
  document.getElementById("dropdown-search")?.addEventListener("input", (ev)=>{ const q = ev.target.value.toLowerCase(); list.querySelectorAll(".dropdown-item").forEach(it=>{ it.style.display = it.textContent.toLowerCase().includes(q) ? 'flex' : 'none'; }); });
  document.getElementById("check-all")?.addEventListener("change", (ev)=>{ list.querySelectorAll(".dd-check").forEach(c=> c.checked = ev.target.checked); });
}
window.aplicarDropdown = function(){ const checks = [...document.querySelectorAll("#dropdown-list .dd-check:checked")].map(c=>c.value); filtros.estadosExcel = checks; if(checks.length===5 || checks.length===0) filtros.estadosExcel = []; renderTabla(aplicarFiltros()); renderCombChart(aplicarFiltros()); document.getElementById("dropdown-estado").classList.remove("open"); }
function setupSearchComb(){ document.getElementById("search-input-comb")?.addEventListener("input", ()=>{ renderTabla(aplicarFiltros()); renderCombChart(aplicarFiltros()); }); }

initComb();
