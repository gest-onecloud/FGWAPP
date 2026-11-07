// V13.6 Viajes (100) - REAL
async function renderViajes(){
  const thead=document.getElementById('thead-viajes');
  const tbody=document.getElementById('tbody-viajes');
  const kpis=document.getElementById('viajes-kpis');
  if(!tbody) return;
  tbody.innerHTML='<tr><td colspan=7>Cargando viajes REAL 100...</td></tr>';
  try{
    const [viajes, flota] = await Promise.all([FGWAPI.fetchViajes(), FGWAPI.FLOTA_CACHE.data.length?FGWAPI.FLOTA_CACHE.data:FGWAPI.fetchFlota()]);
    const mapFlota=new Map(flota.map(f=>[String(f.id), f.placa]));
    const enRuta = viajes.filter(v=> (v.estado||'').toLowerCase().includes('ruta') || (v.estatus||'').toLowerCase().includes('ruta')).length;
    if(kpis) kpis.innerHTML=`<span>TOTAL ${viajes.length}</span> | <span>EN RUTA ${enRuta}</span> | <span>COMPLETADOS ${viajes.length-enRuta}</span>`;
    if(thead) thead.innerHTML='<tr><th>Fecha</th><th>Placa</th><th>Chofer</th><th>Ruta</th><th>Origen→Destino</th><th>KM</th><th>Estado</th></tr>';
    tbody.innerHTML=viajes.map(v=>{
      const placa = mapFlota.get(String(v.flota_id||'')) || v.placa || 'SIN PLACA';
      return `<tr><td>${FGWUtil.formatFecha(v.fecha||v.fecha_salida)}</td><td><b>${FGWUtil.formatPlaca(placa)}</b></td><td>${FGWUtil.safe(v.chofer_id||v.chofer||'-')}</td><td>${FGWUtil.safe(v.ruta_id||v.ruta||'-')}</td><td>${FGWUtil.safe(v.origen||'') } → ${FGWUtil.safe(v.destino||'')}</td><td>${FGWUtil.formatKM(v.km_recorridos||v.distancia||0)}</td><td>${FGWUtil.safe(v.estado||v.estatus||'En ruta')}</td></tr>`;
    }).join('');
    setTimeout(()=>{ if(window.FGWExcelFilter) FGWExcelFilter.attach('thead-viajes','tbody-viajes'); }, 100);
  }catch(e){ tbody.innerHTML=`<tr><td colspan=7 style=color:red>Error Viajes: ${e.message}</td></tr>`; }
}
window.renderViajes=renderViajes;

async function renderGPSTracking(){
  const thead=document.getElementById('thead-gps');
  const tbody=document.getElementById('tbody-gps');
  const kpis=document.getElementById('gps-kpis');
  if(!tbody) return;
  tbody.innerHTML='<tr><td colspan=5>Cargando GPS Tracking 2000...</td></tr>';
  try{
    const gps = await FGWAPI.fetchGPS();
    if(kpis) kpis.innerHTML=`<span>TOTAL ${gps.length}</span>`;
    if(thead) thead.innerHTML='<tr><th>Fecha</th><th>Placa</th><th>Lat</th><th>Lng</th><th>Velocidad</th></tr>';
    tbody.innerHTML=gps.slice(0,500).map(g=>`<tr><td>${FGWUtil.formatFecha(g.fecha||g.timestamp)}</td><td>${FGWUtil.formatPlaca(g.placa||g.flota_id)}</td><td>${Number(g.lat||g.latitude||g.ultima_lat||0).toFixed(4)}</td><td>${Number(g.lng||g.longitude||g.ultima_lng||0).toFixed(4)}</td><td>${FGWUtil.safe(g.velocidad||'-')}</td></tr>`).join('');
    setTimeout(()=>{ if(window.FGWExcelFilter) FGWExcelFilter.attach('thead-gps','tbody-gps'); }, 100);
  }catch(e){ tbody.innerHTML=`<tr><td colspan=5 style=color:red>Error GPS: ${e.message}</td></tr>`; }
}
window.renderGPSTracking=renderGPSTracking;
