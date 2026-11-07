// V13.6 Impuestos (200) - REAL
async function renderImpuestos(){
  const thead=document.getElementById('thead-impuestos');
  const tbody=document.getElementById('tbody-impuestos');
  const kpis=document.getElementById('impuestos-kpis');
  if(!tbody) return;
  tbody.innerHTML='<tr><td colspan=6>Cargando impuestos REAL 200...</td></tr>';
  try{
    const [imps, flota] = await Promise.all([FGWAPI.fetchImpuestos(), FGWAPI.FLOTA_CACHE.data.length?FGWAPI.FLOTA_CACHE.data:FGWAPI.fetchFlota()]);
    const mapFlota=new Map(flota.map(f=>[String(f.id), f.placa]));
    const pagados = imps.filter(i=> (i.estado||'').toLowerCase().includes('pagad')).length;
    if(kpis) kpis.innerHTML=`<span>TOTAL ${imps.length}</span> | <span>PAGADOS ${pagados}</span> | <span>PENDIENTES ${imps.length-pagados}</span>`;
    if(thead) thead.innerHTML='<tr><th>Placa</th><th>Concepto</th><th>Año</th><th>Monto</th><th>Vencimiento</th><th>Estado</th></tr>';
    tbody.innerHTML=imps.map(i=>{
      const placa = mapFlota.get(String(i.flota_id||'')) || i.placa || 'SIN PLACA';
      return `<tr><td><b>${FGWUtil.formatPlaca(placa)}</b></td><td>${FGWUtil.safe(i.concepto||i.tipo||'Tenencia')}</td><td>${FGWUtil.safe(i.anio||i.año||i.ejercicio||'-')}</td><td>${FGWUtil.formatDinero(i.monto||i.costo||i.importe)}</td><td>${FGWUtil.formatFecha(i.vencimiento||i.fecha_vencimiento||i.fecha_limite)}</td><td>${FGWUtil.safe(i.estado||'Pendiente')}</td></tr>`;
    }).join('');
    setTimeout(()=>{ if(window.FGWExcelFilter) FGWExcelFilter.attach('thead-impuestos','tbody-impuestos'); }, 100);
  }catch(e){ tbody.innerHTML=`<tr><td colspan=6 style=color:red>Error Impuestos: ${e.message}</td></tr>`; }
}
window.renderImpuestos=renderImpuestos;
