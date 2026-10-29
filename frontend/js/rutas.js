// RUTAS V12.1 FIX - Sin API KEY - OSM + Carto Light libre + Ficha completa
let MAP=null; let MARKERS=[]; let FLOTA_RUTAS=[];
const GDL={lat:20.6597,lng:-103.3496}; const CLN={lat:24.8093,lng:-107.3940};

export async function initRutas(){
  const div=document.getElementById("mapa-rutas");
  if(!div) return;
  if(!window.L){ console.error("Leaflet no cargado"); div.innerHTML="<div style='padding:20px'>Cargando Leaflet... recarga Ctrl+F5</div>"; return; }

  if(MAP){
    try{ MAP.invalidateSize(); return; }catch(e){ MAP=null; div.innerHTML=""; }
  }

  // Generar flota mock robusta
  FLOTA_RUTAS=[];
  for(let i=1;i<=200;i++){
    const isGDL=i<=120; const base=isGDL?GDL:CLN;
    FLOTA_RUTAS.push({
      id:i, placa:`FG-${String(i).padStart(4,'0')}`, suc:isGDL?'SUC-GDL-01':'SUC-CLN-01',
      estado:i<=114?'En Ruta':i<=171?'En Base':i<=185?'En Taller':'Disponible',
      consumo:i<=28?'Bajo':i<=170?'Normal':i<=189?'Excedido':i<=190?'Sospechoso':'Critico',
      marca:["Scania","Volvo","Freightliner"][i%3], modelo:["R-450","VNL","Cascadia"][i%3],
      anio:2019+(i%5), kilometraje:10000+i*1234, consumo_promedio:(8+Math.random()*5).toFixed(2), mantenimiento:i<=65?'Vencido':'Vigente',
      lat: base.lat + (Math.random()-0.5)*1.5, lng: base.lng + (Math.random()-0.5)*1.5
    });
  }
  window.FLOTA_RUTAS_GLOBAL=FLOTA_RUTAS;

  try{
    MAP=L.map(div, {zoomControl:true}).setView([22.5,-105.5],5.2);

    // Tile libre sin API KEY - Carto Light que si funciona + OSM fallback
    // Probamos primero Voyager sin key, si falla usa OSM
    const lightTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:'© OpenStreetMap © CartoDB',
      subdomains:'abcd',
      maxZoom:19
    });
    lightTiles.addTo(MAP);
    
    // Si Voyager falla (requiere key), usa OSM directo
    lightTiles.on('tileerror', function(){
      console.log("Voyager falló, usando OSM");
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution:'© OpenStreetMap',
        maxZoom:19
      }).addTo(MAP);
    });

    // Pins
    FLOTA_RUTAS.forEach(f=>{
      const color=f.suc==='SUC-GDL-01'?'#C6FF00':'#38BDF8';
      const icon=L.divIcon({
        html:`<div style="width:14px;height:14px;background:${color};border:2px solid #000;border-radius:50%;box-shadow:0 0 8px ${color}"></div>`,
        className:'', iconSize:[14,14], iconAnchor:[7,7]
      });
      const m=L.marker([f.lat,f.lng],{icon}).addTo(MAP);
      m.bindPopup(`<div style="font-size:11px"><b style="color:#C6FF00">${f.placa}</b> • ${f.suc}<br>${f.marca} ${f.modelo} • ${f.estado}</div>`);
      m._placa=f.placa;
      MARKERS.push(m);
      m.on('click', ()=>{ abrirFichaDesdeMapa(f); });
    });

    // Centros
    L.marker([GDL.lat,GDL.lng],{icon:L.divIcon({html:'<div style="background:rgba(198,255,0,.25);border:2px solid #C6FF00;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#C6FF00">GDL</div>',className:'',iconSize:[34,34]})}).addTo(MAP).bindPopup("Matriz Guadalajara 120 unidades");
    L.marker([CLN.lat,CLN.lng],{icon:L.divIcon({html:'<div style="background:rgba(56,189,248,.25);border:2px solid #38BDF8;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#38BDF8">CLN</div>',className:'',iconSize:[34,34]})}).addTo(MAP).bindPopup("Culiacán 80 unidades");

    setTimeout(()=>{ MAP.invalidateSize(); },400);

    // KPIs
    const kpis=document.getElementById("rutas-kpis");
    if(kpis){ kpis.innerHTML=`<div class="rutas-kpi"><div class="rutas-kpi-item"><div class="k">GDL</div><div class="v" style="color:var(--lime)">120</div></div><div class="rutas-kpi-item"><div class="k">CLN</div><div class="v" style="color:#38BDF8">80</div></div><div class="rutas-kpi-item"><div class="k">En Ruta</div><div class="v" style="color:var(--lime)">114</div></div><div class="rutas-kpi-item"><div class="k">En Base</div><div class="v">57</div></div></div>`; }

    // Lista + tabla inferior futura
    const lista=document.getElementById("rutas-lista");
    if(lista){ lista.innerHTML=FLOTA_RUTAS.slice(0,60).map(f=>`<div class="rutas-item" data-placa="${f.placa}" onclick="window.centrarEnPin('${f.placa}')"><div><b style="color:var(--lime)">${f.placa}</b> <span style="color:var(--muted)">${f.suc}</span><br><span style="font-size:10px">${f.marca} ${f.modelo} • ${f.estado}</span></div><div><span class="custom-pin ${f.suc==='SUC-GDL-01'?'pin-gdl':'pin-cln'}"></span></div></div>`).join("") + `<div style="font-size:10px;color:var(--muted);margin-top:8px">60 de 200 • Click = centrar • Próximo: tabla Vehículos en Ruta debajo del mapa</div>`; }

    console.log("[Rutas V12.1] Mapa sin API KEY OK 200 pins");

  }catch(err){
    console.error(err);
    div.innerHTML=`<div style="padding:20px;color:#ff6b6b">Error mapa: ${err.message} - Ctrl+F5</div>`;
  }
}

function abrirFichaDesdeMapa(f){
  const modal=document.getElementById("modal-content");
  if(!modal) return;
  modal.innerHTML=`
  <div class="modal-header">
    <div><div style="font-size:22px;font-weight:950">${f.placa} <span class="badge ${getBadge(f.consumo)}">${f.consumo}</span></div>
    <div style="font-size:11px;color:var(--muted)">${f.marca} ${f.modelo} • ${f.anio} • ${f.suc} • ${f.estado} • GPS ${f.lat.toFixed(4)},${f.lng.toFixed(4)}</div></div>
    <button class="close-btn" onclick="window.closeFlotaFicha()">✕</button>
  </div>
  <div class="modal-body" style="display:grid;gap:14px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="ficha-field"><div class="lbl">PLACA</div><div class="val" style="color:var(--lime)">${f.placa}</div></div>
      <div class="ficha-field"><div class="lbl">MARCA / MODELO</div><div class="val">${f.marca} / ${f.modelo}</div></div>
      <div class="ficha-field"><div class="lbl">AÑO</div><div class="val">${f.anio}</div></div>
      <div class="ficha-field"><div class="lbl">SUCURSAL</div><div class="val">${f.suc}</div></div>
      <div class="ficha-field"><div class="lbl">ESTADO</div><div class="val">${f.estado}</div></div>
      <div class="ficha-field"><div class="lbl">CONSUMO ESTADO</div><div class="val">${f.consumo}</div></div>
      <div class="ficha-field"><div class="lbl">KILOMETRAJE</div><div class="val">${f.kilometraje.toLocaleString()} km</div></div>
      <div class="ficha-field"><div class="lbl">CONSUMO PROMEDIO</div><div class="val">${f.consumo_promedio} km/l</div></div>
      <div class="ficha-field"><div class="lbl">MANTENIMIENTO</div><div class="val" style="color:${f.mantenimiento==='Vencido'?'var(--red)':'var(--lime)'}">${f.mantenimiento}</div></div>
      <div class="ficha-field"><div class="lbl">GPS LAT/LNG</div><div class="val">${f.lat.toFixed(5)}, ${f.lng.toFixed(5)}</div></div>
      <div class="ficha-field"><div class="lbl">TELCEL SIM</div><div class="val">LIVE • Señal OK</div></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn active" style="background:var(--lime);color:#000;font-weight:900" onclick="window.verHistorialDesdeMapa('${f.placa}')">⛽ Ver Historial Recargas</button>
      <button class="btn" onclick="window.closeFlotaFicha()">Cerrar</button>
    </div>
  </div>`;
  document.getElementById("modal-overlay").classList.add("open");
}
function getBadge(c){ c=(c||'').toLowerCase(); if(c==='bajo'||c==='eficiente') return 'eficiente'; if(c==='normal'||c==='optimo') return 'normal'; return 'atencion'; }

window.centrarEnPin=function(placa){
  if(!MAP) return;
  const mk=MARKERS.find(m=>m._placa===placa);
  if(mk){ MAP.setView(mk.getLatLng(),11); mk.openPopup(); }
  document.querySelectorAll(".rutas-item").forEach(it=>{ it.classList.toggle("active", it.getAttribute("data-placa")===placa); });
};

window.verHistorialDesdeMapa=function(placa){
  window.closeFlotaFicha();
  setTimeout(()=>{
    document.querySelectorAll("[id^='view-']").forEach(v=>v.style.display="none");
    document.getElementById("view-combustible").style.display="block";
    setTimeout(()=>{ if(window.abrirHistorialPorPlaca) window.abrirHistorialPorPlaca(placa); },600);
  },100);
};
