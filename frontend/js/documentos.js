// V13.6.1 Paso 7 - Estado Docs consolidado v_estado_documentos
// Consolida Seguros + Impuestos + Infracciones + Mantenimientos por placa
async function renderDocumentos(){
  console.log('[V13.6.1] Paso 7 renderDocumentos START');
  const container = document.getElementById('doc-content');
  const kpis = document.getElementById('doc-kpis');
  if(!container) return;
  container.innerHTML = '<div style="padding:20px;text-align:center">⏳ Cargando estado de documentos REAL 200 placas...</div>';

  try{
    let docs = [];
    try{
      docs = await FGWAPI.fetchEstadoDocs();
      console.log('[Documentos] v_estado_documentos:', docs.length, docs.slice(0,1));
    }catch(e){
      console.warn('[Documentos] vista no existe, fallback consolidado', e.message);
      docs = [];
    }

    let flota = FGWAPI.FLOTA_CACHE.data && FGWAPI.FLOTA_CACHE.data.length ? FGWAPI.FLOTA_CACHE.data : await FGWAPI.fetchFlota();
    let seguros = [], impuestos = [], infracciones = [];

    // Fallback: construir estado docs desde tablas reales si vista vacía
    if(!docs || docs.length===0){
      console.log('[Documentos] Fallback construyendo desde seguros/impuestos/infracciones REAL');
      [seguros, impuestos, infracciones] = await Promise.all([
        FGWAPI.fetchSeguros(),
        FGWAPI.fetchImpuestos(),
        FGWAPI.fetchInfracciones()
      ]);

      const mapSeguro = new Map();
      seguros.forEach(s=>{
        const fid = String(s.flota_id||s.vehiculo_id||'');
        if(!mapSeguro.has(fid) || new Date(s.fecha_fin||s.vigencia_fin||0) > new Date(mapSeguro.get(fid).fecha_fin||0)){
          mapSeguro.set(fid, s);
        }
      });
      const mapImpuesto = new Map();
      impuestos.forEach(i=>{
        const fid = String(i.flota_id||'');
        const key = fid+'|'+String(i.anio||i.año||'');
        // cuenta por flota
        if(!mapImpuesto.has(fid)) mapImpuesto.set(fid, []);
        mapImpuesto.get(fid).push(i);
      });
      const mapInfra = new Map();
      infracciones.forEach(inf=>{
        const fid = String(inf.flota_id||'');
        if(!mapInfra.has(fid)) mapInfra.set(fid, 0);
        mapInfra.set(fid, mapInfra.get(fid)+1);
      });

      docs = flota.map(f=>{
        const fid = String(f.id);
        const seg = mapSeguro.get(fid);
        const imps = mapImpuesto.get(fid) || [];
        const infraCount = mapInfra.get(fid) || 0;

        let seguroEstado = 'SIN SEGURO';
        let seguroDias = null;
        if(seg){
          const fin = seg.fecha_fin||seg.vigencia_fin||seg.fecha_vencimiento;
          seguroDias = FGWUtil.diasRestantes(fin);
          if(seguroDias==null) seguroEstado='VIGENTE';
          else if(seguroDias<0) seguroEstado='VENCIDO';
          else if(seguroDias<=30) seguroEstado='POR VENCER';
          else seguroEstado='VIGENTE';
        }

        let impuestosVencidos = imps.filter(i=> (i.estado||'').toLowerCase().includes('venc') || FGWUtil.diasRestantes(i.fecha_vencimiento||i.vencimiento)<0 ).length;
        let impuestosPendientes = imps.filter(i=> (i.estado||'').toLowerCase().includes('pend')).length;

        let estadoGeneral = 'VIGENTE';
        if(seguroEstado==='VENCIDO' || impuestosVencidos>0) estadoGeneral='VENCIDO';
        else if(seguroEstado==='POR VENCER' || impuestosPendientes>0 || infraCount>0) estadoGeneral='POR VENCER';

        return {
          placa: f.placa,
          flota_id: f.id,
          seguro_estado: seguroEstado,
          seguro_dias: seguroDias,
          seguro_poliza: seg ? (seg.poliza||seg.numero_poliza||'-') : '-',
          seguro_vencimiento: seg ? (seg.fecha_fin||seg.vigencia_fin||'') : '',
          impuestos_total: imps.length,
          impuestos_vencidos: impuestosVencidos,
          impuestos_pendientes: impuestosPendientes,
          infracciones: infraCount,
          estado_general: estadoGeneral,
          sucursal: f.sucursal_id||'',
          marca_modelo: (f.marca||'')+' '+(f.modelo||'')
        };
      });
    }

    // KPIs
    let vigentes = docs.filter(d=>d.estado_general==='VIGENTE').length;
    let porVencer = docs.filter(d=>d.estado_general==='POR VENCER').length;
    let vencidos = docs.filter(d=>d.estado_general==='VENCIDO').length;
    let sinSeguro = docs.filter(d=>d.seguro_estado==='SIN SEGURO').length;

    if(kpis) kpis.innerHTML = '<span>TOTAL: '+docs.length+'</span> | <span style=color:#16a34a>VIGENTES: '+vigentes+'</span> | <span style=color:#ea580c>POR VENCER: '+porVencer+'</span> | <span style=color:#ef4444>VENCIDOS: '+vencidos+'</span> | <span style=opacity:.6>SIN SEGURO: '+sinSeguro+'</span> | <span style=opacity:.6>Vista: '+(docs.length>0 && FGWAPI.FLOTA_CACHE.data.length!==docs.length ? 'v_estado_documentos' : 'consolidado REAL')+'</span>';

    function badgeEstado(estado){
      if(estado==='VIGENTE') return '<span style="background:#16a34a;color:#fff;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">VIGENTE</span>';
      if(estado==='POR VENCER') return '<span style="background:#ea580c;color:#fff;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">POR VENCER</span>';
      if(estado==='VENCIDO') return '<span style="background:#ef4444;color:#fff;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">VENCIDO</span>';
      return '<span style="background:#6b7280;color:#fff;padding:2px 8px;border-radius:10px;font-size:10px">'+estado+'</span>';
    }

    docs.sort((a,b)=>{
      const order = {VENCIDO:0, 'POR VENCER':1, VIGENTE:2, 'SIN SEGURO':3};
      return (order[a.estado_general]??9) - (order[b.estado_general]??9);
    });

    container.innerHTML = '<div style="padding:0 20px 10px"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead id="thead-doc"><tr><th>Placa</th><th>Marca/Modelo</th><th>Seguro</th><th>Póliza</th><th>Venc Seguro</th><th>Impuestos</th><th>Infracciones</th><th>Estado General</th><th>Acción</th></tr></thead><tbody id="tbody-doc">'+
      docs.slice(0,200).map(d=>{
        return '<tr><td><b>'+FGWUtil.formatPlaca(d.placa)+'</b></td><td>'+FGWUtil.safe(d.marca_modelo)+'</td><td>'+badgeEstado(d.seguro_estado)+ (d.seguro_dias!=null?' <small style=opacity:.6>('+d.seguro_dias+'d)</small>':'') +'</td><td>'+FGWUtil.safe(d.seguro_poliza)+'</td><td>'+FGWUtil.formatFecha(d.seguro_vencimiento)+'</td><td>'+ (d.impuestos_total>0 ? d.impuestos_total+' <small>('+(d.impuestos_vencidos>0?'<span style=color:red>'+d.impuestos_vencidos+' venc</span>':'') + (d.impuestos_pendientes>0?' '+d.impuestos_pendientes+' pend':'') +')</small>' : '0') +'</td><td>'+ (d.infracciones>0?'<span style=color:#ef4444;font-weight:700>'+d.infracciones+'</span>':'0') +'</td><td>'+badgeEstado(d.estado_general)+'</td><td><button onclick="verFicha(\''+FGWUtil.formatPlaca(d.placa)+'\')" style="padding:2px 8px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer">Ficha</button></td></tr>';
      }).join('')+
      '</tbody></table></div>';

    setTimeout(()=>{ try{ if(window.FGWExcelFilter) FGWExcelFilter.attach('thead-doc','tbody-doc'); }catch(e){} }, 100);
    console.log('[V13.6.1] Paso 7 renderDocumentos OK - pintados', docs.length);

  }catch(e){
    console.error('[Documentos] ERROR', e);
    container.innerHTML = '<div style="padding:20px;color:red">Error Estado Docs: '+e.message+'<pre style="font-size:11px">'+e.stack+'</pre></div>';
  }
}
window.renderDocumentos=renderDocumentos;
window.renderEstadoDocs=renderDocumentos;
console.log('[V13.6.1] documentos.js Paso 7 cargado');
