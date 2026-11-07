// V13.6 Seguros (200) - REAL
async function renderSeguros(){
  const thead=document.getElementById('thead-seguros');
  const tbody=document.getElementById('tbody-seguros');
  const kpis=document.getElementById('seguros-kpis');
  if(!tbody) return;
  tbody.innerHTML='<tr><td colspan=6>Cargando seguros REAL 200...</td></tr>';
  try{
    const [segs, flota] = await Promise.all([FGWAPI.fetchSeguros(), FGWAPI.FLOTA_CACHE.data.length?FGWAPI.FLOTA_CACHE.data:FGWAPI.fetchFlota()]);
    const mapFlota=new Map(flota.map(f=>[String(f.id), f.placa]));
    const vigentes = segs.filter(s=> (s.estado||'').toLowerCase().includes('vigent') || (s.estatus||'').toLowerCase().includes('vigent')).length;
    const venc = segs.length - vigentes;
    if(kpis) kpis.innerHTML=`<span>TOTAL ${segs.length}</span> | <span>VIGENTES ${vigentes}</span> | <span>VENCIDOS ${venc}</span>`;
    if(thead) thead.innerHTML='<tr><th>Placa</th><th>Póliza</th><th>Aseguradora</th><th>Vigencia</th><th>Costo</th><th>Estado</th></tr>';
    tbody.innerHTML=segs.map(s=>{
      const placa = mapFlota.get(String(s.flota_id||s.vehiculo_id||'')) || s.placa || s.flota_id || 'SIN PLACA';
      return `<tr><td><b>${FGWUtil.formatPlaca(placa)}</b></td><td>${FGWUtil.safe(s.poliza||s.numero_poliza||'-')}</td><td>${FGWUtil.safe(s.aseguradora||'-')}</td><td>${FGWUtil.formatFecha(s.vigencia_inicio||s.fecha_inicio)} → ${FGWUtil.formatFecha(s.vigencia_fin||s.fecha_fin)}</td><td>${FGWUtil.formatDinero(s.costo||s.prima)}</td><td>${FGWUtil.safe(s.estado||s.estatus||'Vigente')}</td></tr>`;
    }).join('');
    setTimeout(()=>{ if(window.FGWExcelFilter) FGWExcelFilter.attach('thead-seguros','tbody-seguros'); }, 100);
  }catch(e){ tbody.innerHTML=`<tr><td colspan=6 style=color:red>Error Seguros: ${e.message}</td></tr>`; }
}
window.renderSeguros=renderSeguros;
