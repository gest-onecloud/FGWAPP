// V13.6 Infracciones (80) - REAL
async function renderInfracciones(){
  const thead=document.getElementById('thead-infra');
  const tbody=document.getElementById('tbody-infra');
  const kpis=document.getElementById('infra-kpis');
  if(!tbody) return;
  tbody.innerHTML='<tr><td colspan=6>Cargando infracciones REAL 80...</td></tr>';
  try{
    const [infras, flota] = await Promise.all([FGWAPI.fetchInfracciones(), FGWAPI.FLOTA_CACHE.data.length?FGWAPI.FLOTA_CACHE.data:FGWAPI.fetchFlota()]);
    const mapFlota=new Map(flota.map(f=>[String(f.id), f.placa]));
    const pag = infras.filter(i=> (i.estado||'').toLowerCase().includes('pag')).length;
    if(kpis) kpis.innerHTML=`<span>TOTAL ${infras.length}</span> | <span>PAGADAS ${pag}</span> | <span>PENDIENTES ${infras.length-pag}</span>`;
    if(thead) thead.innerHTML='<tr><th>Fecha</th><th>Placa</th><th>Chofer</th><th>Motivo</th><th>Monto</th><th>Estado</th></tr>';
    tbody.innerHTML=infras.map(i=>{
      const placa = mapFlota.get(String(i.flota_id||'')) || i.placa || 'SIN PLACA';
      return `<tr><td>${FGWUtil.formatFecha(i.fecha||i.fecha_infraccion)}</td><td><b>${FGWUtil.formatPlaca(placa)}</b></td><td>${FGWUtil.safe(i.chofer||i.chofer_id||'-')}</td><td>${FGWUtil.safe((i.motivo||i.descripcion||'').toString().slice(0,80))}</td><td>${FGWUtil.formatDinero(i.monto||i.costo||i.multa)}</td><td>${FGWUtil.safe(i.estado||'Pendiente')}</td></tr>`;
    }).join('');
    setTimeout(()=>{ if(window.FGWExcelFilter) FGWExcelFilter.attach('thead-infra','tbody-infra'); }, 100);
  }catch(e){ tbody.innerHTML=`<tr><td colspan=6 style=color:red>Error Infracciones: ${e.message}</td></tr>`; }
}
window.renderInfracciones=renderInfracciones;
