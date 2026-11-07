// V13.5 Mantenimientos (200) - REAL
async function renderMantenimientos(){
  const thead=document.getElementById('thead-mant');
  const tbody=document.getElementById('tbody-mant');
  const kpis=document.getElementById('mant-kpis');
  if(!tbody) return;
  tbody.innerHTML='<tr><td colspan=7>Cargando mantenimientos REAL 200...</td></tr>';
  try{
    const [mants, flota] = await Promise.all([FGWAPI.fetchMantenimientos(), FGWAPI.FLOTA_CACHE.data.length?FGWAPI.FLOTA_CACHE.data:FGWAPI.fetchFlota()]);
    const mapFlota=new Map(flota.map(f=>[String(f.id), f.placa]));
    
    const prev = mants.filter(m=> (m.tipo||m.descripcion||'').toLowerCase().includes('prevent') || (m.tipo_mantenimiento||'').toLowerCase().includes('prevent')).length;
    const corr = mants.length - prev;
    const venc = mants.filter(m=> m.estado && m.estado.toLowerCase().includes('venc')).length;
    if(kpis) kpis.innerHTML=`<span>TOTAL ${mants.length}</span> | <span>PREVENTIVOS ${prev}</span> | <span>CORRECTIVOS ${corr}</span> | <span>VENCIDOS ${venc}</span>`;

    if(thead) thead.innerHTML='<tr><th>Fecha</th><th>Placa</th><th>Tipo</th><th>Descripción</th><th>Costo</th><th>KM</th><th>Estado</th></tr>';
    tbody.innerHTML=mants.map(m=>{
      const placa = mapFlota.get(String(m.flota_id||m.vehiculo_id||'')) || m.placa || m.flota_id || 'SIN PLACA';
      return `<tr>
        <td>${FGWUtil.formatFecha(m.fecha||m.fecha_mantenimiento)}</td>
        <td><b>${FGWUtil.formatPlaca(placa)}</b></td>
        <td>${FGWUtil.safe(m.tipo||m.tipo_mantenimiento||'-')}</td>
        <td>${FGWUtil.safe((m.descripcion||m.detalle||'').toString().slice(0,80))}</td>
        <td>${FGWUtil.formatDinero(m.costo||m.costo_total)}</td>
        <td>${FGWUtil.formatKM(m.kilometraje||m.km||m.odometro||0)}</td>
        <td>${FGWUtil.safe(m.estado||'Completado')}</td>
      </tr>`;
    }).join('');
    setTimeout(()=>{ if(window.FGWExcelFilter) FGWExcelFilter.attach('thead-mant','tbody-mant'); }, 100);
  }catch(e){
    tbody.innerHTML=`<tr><td colspan=7 style=color:red>Error Mantenimientos: ${e.message}</td></tr>`;
    console.error(e);
  }
}
window.renderMantenimientos=renderMantenimientos;
