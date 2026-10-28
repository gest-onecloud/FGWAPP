import { CONFIG } from './config.js';
let gpsData=[], map=null, markers=[], rutasData=[];
let filtrosGps={sucursal:'', estado:'', ruta:''};

export async function initRutas(){
  document.getElementById("m-rutas")?.classList.add("active");
  await fetchGps();
  await fetchRutasList();
  renderGpsStats();
  renderMap();
  renderGpsTabla(gpsData);
  renderRutasTabla();
}

async function fetchGps(){
  try{
    const r=await fetch(CONFIG.API_BASE+"/api/gps");
    if(!r.ok) throw new Error();
    gpsData=await r.json();
  }catch(e){
    gpsData=generateMockGps();
  }
  window._gpsDataGlobal=gpsData;
}

async function fetchRutasList(){
  try{
    const r=await fetch(CONFIG.API_BASE+"/api/rutas");
    rutasData=r.ok?await r.json():generateMockRutas();
  }catch(e){ rutasData=generateMockRutas(); }
}

function generateMockGps(){
  const arr=[]; const GDL={lat:20.6597,lng:-103.3496}; const CLN={lat:24.8093,lng:-107.394};
  for(let i=1;i<=200;i++){
    const isGdl=i<=120; const base=isGdl?GDL:CLN;
    arr.push({ id:i, placa:`FG-${String(i).padStart(4,'0')}`, sucursal_id:isGdl?1:2, sucursal_clave:isGdl?'SUC-GDL-01':'SUC-CLN-01', sucursal_nombre:isGdl?'Guadalajara':'Culiacán', estado:i<=114?'En Ruta':i<=171?'En Base':i<=185?'En Taller':'Disponible', lat:base.lat+(Math.random()-0.5)*0.6, lng:base.lng+(Math.random()-0.5)*0.6, velocidad_kmh:Math.floor(Math.random()*90), direccion:`Av. ${i} Vallarta`, telcel_sim:`8952${Math.floor(Math.random()*10000000000)}`, telcel_signal:['Excelente','Buena','Regular'][Math.floor(Math.random()*3)], telcel_status:'Activo', ultima_actualizacion:new Date().toISOString(), ruta_actual:`RUTA-GDL-CLN-${(i%40)+1}`, conductor:`Operador ${(i%20)+1}`, combustible_pct:Math.floor(Math.random()*80)+20, km_actual:24532+Math.floor(Math.random()*15000), bateria_gps_pct:90 });
  }
  return arr;
}
function generateMockRutas(){
  const r=[]; for(let i=1;i<=40;i++){ r.push({ id:`RUTA-GDL-CLN-${i}`, origen:'GDL', destino:i%2==0?'CLN':'MZT', distancia_km:Math.floor(Math.random()*600)+45, unidades_activas:Math.floor(Math.random()*8)+1, tiempo_estimado_h:(Math.random()*10+1.5).toFixed(1), estado:['Activa','En Curso','Finalizada'][i%3], consumo_promedio_km_l:(Math.random()*3+6.2).toFixed(2) }); } return r;
}

function renderGpsStats(){
  const el=document.getElementById("gps-stats"); if(!el) return;
  const enRuta=gpsData.filter(g=>g.estado==='En Ruta').length;
  const enBase=gpsData.filter(g=>g.estado==='En Base').length;
  const taller=gpsData.filter(g=>g.estado==='En Taller').length;
  const activos=gpsData.filter(g=>g.telcel_status==='Activo').length;
  el.innerHTML=`
    <div class="gps-card"><div class="k">UNIDADES LIVE GPS</div><div class="v">${gpsData.length} <span style="font-size:10px;background:var(--lime);color:#000;padding:2px 6px;border-radius:999px">LIVE</span></div><div style="font-size:10px;color:var(--muted)">GDL 120 + CLN 80 • Telcel SIM</div></div>
    <div class="gps-card"><div class="k">EN RUTA</div><div class="v" style="color:var(--lime)">${enRuta}</div><div style="font-size:10px;color:var(--muted)">${Math.round(enRuta/gpsData.length*100)}% en movimiento</div></div>
    <div class="gps-card"><div class="k">EN BASE / DISPONIBLE</div><div class="v" style="color:var(--green)">${enBase}</div><div style="font-size:10px;color:var(--muted)">En base y disponible</div></div>
    <div class="gps-card"><div class="k">TELCEL SIM ACTIVO</div><div class="v" style="color:var(--blue)">${activos} / ${gpsData.length}</div><div style="font-size:10px;color:var(--muted)">Señal excelente • Batería GPS OK</div></div>
  `;
}

function renderMap(){
  const mapDiv=document.getElementById("map-rutas"); if(!mapDiv) return;
  if(map){ map.remove(); map=null; markers=[]; }
  // Leaflet map
  map=L.map('map-rutas').setView([22.5, -105.5], 6);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution:'© CartoDB' }).addTo(map);
  // Add markers
  gpsData.slice(0,200).forEach(g=>{
    const colorClass=g.estado==='En Ruta'?'marker-enruta':g.estado==='En Base'?'marker-enbase':g.estado==='En Taller'?'marker-entaller':'marker-disponible';
    const icon=L.divIcon({ className:'', html:`<div class="marker-pin ${colorClass}">${g.placa.split('-')[1]}</div>`, iconSize:[32,32], iconAnchor:[16,16] });
    const m=L.marker([g.lat, g.lng], {icon}).addTo(map);
    m.bindPopup(`
      <div style="min-width:180px"><b style="color:var(--lime)">${g.placa}</b> • ${g.estado}<br>
      <span style="font-size:10px">${g.sucursal_clave} • ${g.sucursal_nombre}</span><br>
      <span style="font-size:10px">${g.direccion}<br>Vel: ${g.velocidad_kmh} km/h • Comb: ${g.combustible_pct}%</span><br>
      <span style="font-size:10px">SIM: ${g.telcel_sim.slice(-4)} • ${g.telcel_signal} • ${g.telcel_status}</span><br>
      <span style="font-size:10px">Ruta: ${g.ruta_actual} • ${g.conductor}</span><br>
      <div style="margin-top:6px;display:flex;gap:4px"><button onclick="window.openGpsFicha('${g.placa}')" style="background:var(--lime);color:#000;border:none;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:800">Ver Ficha</button><button onclick="window.verHistorialCombustible('${g.placa}')" style="background:#1C212E;color:var(--text);border:1px solid var(--border);padding:4px 8px;border-radius:999px;font-size:10px">Historial ⛽</button></div>
      </div>
    `);
    markers.push({marker:m, data:g});
  });
  // Fit bounds
  if(markers.length>0){
    const group=new L.featureGroup(markers.map(mm=>mm.marker));
    map.fitBounds(group.getBounds().pad(0.2));
  }
}

function renderGpsTabla(lista){
  const tb=document.getElementById("tbody-rutas-gps"); if(!tb) return;
  const thead=document.getElementById("thead-rutas-gps");
  if(thead){
    thead.innerHTML=`<tr><th>PLACA</th><th>SUCURSAL</th><th>ESTADO</th><th>VEL</th><th>DIRECCION</th><th>SIM SEÑAL</th><th>RUTA</th><th>COMB</th><th>ACTUALIZACION</th></tr>`;
  }
  tb.innerHTML=lista.slice(0,100).map(g=>`<tr class="clickable" onclick="window.openGpsFicha('${g.placa}')"><td style="font-weight:900;color:var(--lime)">${g.placa}</td><td><span class="badge b-lime">${g.sucursal_clave}</span></td><td><span class="badge ${g.estado==='En Ruta'?'b-lime':g.estado==='En Base'?'b-green':g.estado==='En Taller'?'b-orange':'b-blue'}">${g.estado}</span></td><td>${g.velocidad_kmh} km/h</td><td style="max-width:120px;overflow:hidden;text-overflow:ellipsis">${g.direccion}</td><td><span class="badge ${g.telcel_signal==='Excelente'?'b-lime':g.telcel_signal==='Buena'?'b-green':'b-yellow'}">${g.telcel_signal}</span></td><td>${g.ruta_actual}</td><td>${g.combustible_pct}%</td><td style="font-size:10px">${new Date(g.ultima_actualizacion).toLocaleTimeString()}</td></tr>`).join("");
}

function renderRutasTabla(){
  const tb=document.getElementById("tbody-rutas-lista"); if(!tb) return;
  tb.innerHTML=rutasData.slice(0,20).map(r=>`<tr><td style="font-weight:800">${r.id}</td><td>${r.origen} → ${r.destino}</td><td>${r.distancia_km} km</td><td>${r.unidades_activas}</td><td>${r.tiempo_estimado_h} h</td><td><span class="badge ${r.estado==='Activa'?'b-lime':r.estado==='En Curso'?'b-green':'b-blue'}">${r.estado}</span></td><td>${r.consumo_promedio_km_l} km/l</td></tr>`).join("");
}

window.openGpsFicha=function(placa){
  const g=gpsData.find(x=>x.placa===placa); if(!g) return;
  const c=document.getElementById("modal-content");
  c.innerHTML=`<div class="modal-header"><div><div style="font-size:22px;font-weight:950">${g.placa} <span style="font-size:11px;padding:4px 10px;border-radius:999px;background:rgba(198,255,0,.15);color:var(--lime)">${g.estado}</span></div><div style="font-size:11px;color:var(--muted)">${g.sucursal_clave} • ${g.sucursal_nombre} • ${g.ruta_actual}</div></div><button class="close-btn" onclick="closeFicha()">✕</button></div><div class="modal-body"><div class="modal-grid"><div class="modal-field"><div class="k">PLACA</div><div class="v" style="color:var(--lime)">${g.placa}</div></div><div class="modal-field"><div class="k">POSICION GPS</div><div class="v">${g.lat.toFixed(4)}, ${g.lng.toFixed(4)}<br><span style="font-size:11px">${g.direccion}</span></div></div><div class="modal-field"><div class="k">VELOCIDAD</div><div class="v">${g.velocidad_kmh} km/h<br><span style="font-size:11px">${g.estado}</span></div></div><div class="modal-field"><div class="k">TELCEL SIM</div><div class="v">${g.telcel_sim}<br><span style="font-size:11px">${g.telcel_signal} • ${g.telcel_status} • Bat ${g.bateria_gps_pct}%</span></div></div><div class="modal-field"><div class="k">COMBUSTIBLE</div><div class="v">${g.combustible_pct}% • ${g.km_actual} km</div></div><div class="modal-field"><div class="k">RUTA / CONDUCTOR</div><div class="v">${g.ruta_actual}<br><span style="font-size:11px">${g.conductor}</span></div></div></div><div style="display:flex;gap:8px;margin-top:14px"><button class="btn active" onclick="verHistorialCombustible('${g.placa}')">⛽ Ver Historial Combustible</button><button class="btn" onclick="closeFicha(); if(window._gpsMapFocus) window._gpsMapFocus('${g.placa}')">📍 Centrar en Mapa</button><button class="btn" onclick="closeFicha()">Cerrar</button></div></div>`;
  document.getElementById("modal-overlay").classList.add("open");
}
window._gpsMapFocus=function(placa){ const g=gpsData.find(x=>x.placa===placa); if(g && map){ map.setView([g.lat, g.lng], 14); } }
window.closeFicha=function(){ document.getElementById("modal-overlay").classList.remove("open"); }
window.filtrarGpsSucursal=function(clave){ filtrosGps.sucursal=filtrosGps.sucursal===clave?'':clave; applyGpsFilter(); }
window.filtrarGpsEstado=function(estado){ filtrosGps.estado=filtrosGps.estado===estado?'':estado; applyGpsFilter(); }
function applyGpsFilter(){
  let l=[...gpsData];
  if(filtrosGps.sucursal) l=l.filter(g=>g.sucursal_clave===filtrosGps.sucursal);
  if(filtrosGps.estado) l=l.filter(g=>g.estado===filtrosGps.estado);
  renderGpsTabla(l);
  // Update map markers visibility
  markers.forEach(m=>{ const show=( !filtrosGps.sucursal || m.data.sucursal_clave===filtrosGps.sucursal) && (!filtrosGps.estado || m.data.estado===filtrosGps.estado); if(show) m.marker.addTo(map); else map.removeLayer(m.marker); });
}
