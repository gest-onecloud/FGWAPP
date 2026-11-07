// V13.4 talleres.js - 5 TALLERES REAL
async function renderTalleres(){
  const cont=document.getElementById('talleres-table-container');
  const kpis=document.getElementById('talleres-kpis');
  const thead=document.getElementById('thead-talleres');
  const tbody=document.getElementById('tbody-talleres');
  if(!tbody) return;
  tbody.innerHTML='<tr><td colspan=6>Cargando talleres REAL 5...</td></tr>';
  try{
    const talleres=await FGWAPI.fetchTalleres();
    const sucMap={};
    try{
      const sucs=await FGWAPI.fetchDirect('sucursales',10,null);
      sucs.forEach(s=>{ sucMap[String(s.id)] = s.nombre||s.clave||s.id; });
    }catch{}
    if(kpis) kpis.innerHTML='<span>TOTAL '+talleres.length+'</span> | <span>GDL '+talleres.filter(t=>String(t.sucursal_id).toLowerCase().includes('gdl')||(sucMap[String(t.sucursal_id)]||'').includes('GDL')).length+'</span> | <span>CLN '+talleres.filter(t=>String(t.sucursal_id).toLowerCase().includes('cln')||(sucMap[String(t.sucursal_id)]||'').includes('CLN')).length+'</span>';
    if(thead) thead.innerHTML='<tr><th>ID</th><th>Nombre</th><th>Sucursal</th><th>Dirección</th><th>Teléfono</th><th>Especialidad</th></tr>';
    tbody.innerHTML=talleres.map(t=>`
      <tr>
        <td>${FGWUtil.safe(t.id)}</td>
        <td><b>${FGWUtil.safe(t.nombre||t.clave||'Taller '+t.id)}</b></td>
        <td>${FGWUtil.safe(sucMap[String(t.sucursal_id)]||t.sucursal_id||'-')}</td>
        <td>${FGWUtil.safe(t.direccion||t.ubicacion||'-')}</td>
        <td>${FGWUtil.safe(t.telefono||t.tel||'-')}</td>
        <td>${FGWUtil.safe(t.especialidad||t.tipo||t.servicio||'General')}</td>
      </tr>`).join('');
  }catch(e){
    tbody.innerHTML='<tr><td colspan=6 style=color:red>Error Talleres: '+e.message+'</td></tr>';
    console.error(e);
  }
}
window.renderTalleres=renderTalleres;
