// V13.6.1 Paso 6 - Proximos Mantenimientos REAL con alerta KM
// Usa v_proximos_mantenimientos + fallback flota.km_actual / km_ultimo_mant / intervalo_mant_km
async function renderProximos(){
  const tbody=document.getElementById('tbody-prox');
  const thead=document.getElementById('thead-prox');
  const kpis=document.getElementById('prox-kpis');
  if(!tbody) return;
  tbody.innerHTML='<tr><td colspan=9>Cargando próximos mantenimientos REAL...</td></tr>';
  try{
    // Intenta vista, si no existe usa flota + mantenimientos
    let data = [];
    try{
      data = await FGWAPI.fetchProximos();
    }catch(e){
      console.warn('[proximos] v_proximos_mantenimientos fail, fallback flota', e.message);
    }

    // Si la vista ya trae km_restantes, la usamos directo
    // Si no, calculamos desde flota
    let flota = FGWAPI.FLOTA_CACHE.data;
    if(!flota || !flota.length){
      flota = await FGWAPI.fetchFlota();
    }
    const mapFlota = new Map(flota.map(f=>[String(f.id), f]));

    let lista = [];
    if(data && data.length && (data[0].km_restantes!=null || data[0].km_faltantes!=null || data[0].placa)){
      // Vista ya procesada
      lista = data.map(d=>{
        const f = mapFlota.get(String(d.flota_id||d.id_vehiculo||'')) || {};
        const km_actual = Number(d.km_actual||d.kilometraje||f.km_actual||f.kilometraje||0);
        const km_ult = Number(d.km_ultimo_mant||d.km_ultimo||f.km_ultimo_mant||0);
        const intervalo = Number(d.intervalo_mant_km||d.intervalo||f.intervalo_mant_km||10000);
        const km_rest = d.km_restantes!=null ? Number(d.km_restantes) : d.km_faltantes!=null ? Number(d.km_faltantes) : (km_ult+intervalo - km_actual);
        return {
          placa: FGWUtil.formatPlaca(d.placa||f.placa||d.flota_id||''),
          flota_id: d.flota_id||d.id_vehiculo||f.id,
          km_actual,
          km_ultimo_mant: km_ult,
          intervalo,
          km_restantes: km_rest,
          fecha_ultimo_mant: d.fecha_ultimo_mant||f.fecha_ultimo_mant||'',
          proximo_estimado: d.proximo_estimado||'',
          tipo: d.tipo||d.tipo_mant||'Preventivo',
          estado: d.estado||''
        };
      });
    } else {
      // Fallback: calcular desde flota sola
      lista = flota.map(f=>{
        const km_actual = Number(f.km_actual||f.kilometraje||0);
        const km_ult = Number(f.km_ultimo_mant||0);
        const intervalo = Number(f.intervalo_mant_km||10000);
        const km_rest = km_ult + intervalo - km_actual;
        return {
          placa: FGWUtil.formatPlaca(f.placa||''),
          flota_id: f.id,
          km_actual,
          km_ultimo_mant: km_ult,
          intervalo,
          km_restantes: km_rest,
          fecha_ultimo_mant: f.fecha_ultimo_mant||'',
          proximo_estimado: '',
          tipo: 'Preventivo',
          estado: ''
        };
      });
    }

    // Clasificar alerta
    function getAlerta(km_rest){
      if(km_rest <= 0) return {label:'VENCIDO', color:'#ef4444', bg:'#fef2f2'};
      if(km_rest <= 500) return {label:'CRITICO <500km', color:'#dc2626', bg:'#fee2e2'};
      if(km_rest <= 1000) return {label:'POR VENCER <1000km', color:'#ea580c', bg:'#ffedd5'};
      if(km_rest <= 3000) return {label:'PROXIMO <3000km', color:'#ca8a04', bg:'#fef9c3'};
      return {label:'OK', color:'#16a34a', bg:'#dcfce7'};
    }

    lista.sort((a,b)=>a.km_restantes - b.km_restantes);

    let vencidos = lista.filter(x=>x.km_restantes<=0).length;
    let criticos = lista.filter(x=>x.km_restantes>0 && x.km_restantes<=500).length;
    let porVencer = lista.filter(x=>x.km_restantes>500 && x.km_restantes<=1000).length;
    let proximos = lista.filter(x=>x.km_restantes>1000 && x.km_restantes<=3000).length;

    if(kpis) kpis.innerHTML = '<span>TOTAL: '+lista.length+'</span> | <span style=color:#ef4444>VENCIDOS: '+vencidos+'</span> | <span style=color:#dc2626>CRITICOS <500km: '+criticos+'</span> | <span style=color:#ea580c>POR VENCER 1000km: '+porVencer+'</span> | <span>PROXIMOS 3000km: '+proximos+'</span>';

    if(thead) thead.innerHTML='<tr><th>Placa</th><th>KM Actual</th><th>KM Ultimo Mant</th><th>Intervalo</th><th>KM Restantes</th><th>Fecha Ult Mant</th><th>Prox Estimado</th><th>Tipo</th><th>Alerta</th></tr>';

    tbody.innerHTML = lista.slice(0,200).map(r=>{
      const al = getAlerta(r.km_restantes);
      return '<tr style="background:'+al.bg+'"><td><b>'+FGWUtil.formatPlaca(r.placa)+'</b></td><td>'+FGWUtil.formatKM(r.km_actual)+'</td><td>'+FGWUtil.formatKM(r.km_ultimo_mant)+'</td><td>'+FGWUtil.formatKM(r.intervalo)+'</td><td><b style="color:'+al.color+'">'+FGWUtil.formatKM(r.km_restantes)+'</b></td><td>'+FGWUtil.formatFecha(r.fecha_ultimo_mant)+'</td><td>'+FGWUtil.formatFecha(r.proximo_estimado)+'</td><td>'+FGWUtil.safe(r.tipo)+'</td><td><span style="background:'+al.color+';color:#fff;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">'+al.label+'</span></td></tr>';
    }).join('');

    setTimeout(()=>{ if(window.FGWExcelFilter) FGWExcelFilter.attach('thead-prox','tbody-prox'); }, 100);

  }catch(e){
    tbody.innerHTML='<tr><td colspan=9 style=color:red>Error Proximos: '+e.message+'</td></tr>';
    console.error(e);
  }
}
window.renderProximos=renderProximos;
window.renderProximosMantenimientos=renderProximos;
