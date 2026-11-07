function getCfg(){
  if(typeof window!=='undefined'){
    if(window.CONFIG && window.CONFIG.SUPABASE_ANON_KEY) return window.CONFIG;
    if(window.config && window.config.SUPABASE_ANON_KEY) return window.config;
    if(window.SUPABASE_URL && window.SUPABASE_ANON_KEY) return {SUPABASE_URL:window.SUPABASE_URL,SUPABASE_ANON_KEY:window.SUPABASE_ANON_KEY,SUPABASE_KEY:window.SUPABASE_ANON_KEY,API_BASE_URL:'https://fgwapp.onrender.com'};
  }
  if(typeof CONFIG!=='undefined' && CONFIG.SUPABASE_ANON_KEY) return CONFIG;
  // FALLBACK anon key real de tu Supabase yjbzbfeivxkrxzlpehxj
  return {
    SUPABASE_URL:'https://yjbzbfeivxkrxzlpehxj.supabase.co',
    SUPABASE_ANON_KEY:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqYnpiZmVpdnhrcnh6bHBlaHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMTg0MDcsImV4cCI6MjEwODY5NDQwN30.LCrwlV_Wr41JBidY6IlsZg6Pflzg6CvKFcoYo3XexqU',
    SUPABASE_KEY:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqYnpiZmVpdnhrcnh6bHBlaHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMTg0MDcsImV4cCI6MjEwODY5NDQwN30.LCrwlV_Wr41JBidY6IlsZg6Pflzg6CvKFcoYo3XexqU',
    API_BASE_URL:'https://fgwapp.onrender.com'
  };
}
const FLOTA_CACHE={data:[],latlng:[]};
async function fetchDirect(table,limit=200,orderBy=null,retry=true){
  const cfg=getCfg();
  let u=cfg.SUPABASE_URL+'/rest/v1/'+table+'?limit='+limit;
  if(orderBy) u+='&order='+orderBy;
  const headers={apikey:cfg.SUPABASE_ANON_KEY,Authorization:'Bearer '+cfg.SUPABASE_ANON_KEY,'Content-Type':'application/json'};
  const res=await fetch(u,{headers});
  if(!res.ok){
    if(res.status===400&&orderBy&&retry){console.warn('[api] 400 '+table+' retry sin order'); return fetchDirect(table,limit,null,false);}
    throw new Error(table+' '+res.status+' '+(await res.text()).slice(0,300));
  }
  const j=await res.json(); return Array.isArray(j)?j:[];
}
function normalizeFlota(i){
  if(!i) return i;
  const km=i.kilometraje||i.km_actual||i.odom||i.odometro||i.km_ultimo_mant||0;
  return {...i,kilometraje:Number(km)||0,km_actual:Number(i.km_actual||km)||0,odom:Number(i.odom||km)||0,placa:(i.placa||'').toString().trim().toUpperCase(),ultima_lat:i.ultima_lat!=null?Number(i.ultima_lat):null,ultima_lng:i.ultima_lng!=null?Number(i.ultima_lng):null,anio:i.anio||i.año||2020,sucursal_id:i.sucursal_id||i.sucursal||null};
}
async function fetchFlota(){
  const cfg=getCfg();
  try{
    const c=new AbortController(); const to=setTimeout(()=>c.abort(),60000);
    const r=await fetch(cfg.API_BASE_URL+'/api/flota',{signal:c.signal}); clearTimeout(to);
    if(r.ok){const d=await r.json(); if(Array.isArray(d)&&d.length){const n=d.map(normalizeFlota); FLOTA_CACHE.data=n; FLOTA_CACHE.latlng=n.filter(f=>f.ultima_lat&&f.ultima_lng); return n;}}
  }catch(e){console.warn('[api] Render flota fail',e.message);}
  const direct=(await fetchDirect('flota',200,null)).map(normalizeFlota); FLOTA_CACHE.data=direct; FLOTA_CACHE.latlng=direct.filter(f=>f.ultima_lat&&f.ultima_lng); return direct;
}
async function fetchCombustible(){try{const v=await fetchDirect('v_combustible_con_placa',1000,'fecha.desc'); if(v.length) return v;}catch(e){console.warn('[api] vista combustible fail',e.message);} const raw=await fetchDirect('combustible_cargas',1600,'fecha.desc'); if(!FLOTA_CACHE.data.length) await fetchFlota(); const m=new Map(FLOTA_CACHE.data.map(f=>[String(f.id),f.placa])); return raw.map(c=>({...c,placa:m.get(String(c.flota_id))||c.flota_id||'SIN PLACA'}));}
async function fetchChoferesReal(){try{const v=await fetchDirect('v_choferes_activos',100,null); if(v.length) return v;}catch(e){console.warn('[api] v_choferes_activos fail',e.message);} return await fetchDirect('choferes',50,null);}
async function fetchRutas(){try{return await fetchDirect('rutas',20,null);}catch{return [];}}
async function fetchTalleres(){try{return await fetchDirect('talleres',20,null);}catch{return [];}}
async function fetchMantenimientos(){try{return await fetchDirect('mantenimientos',200,'fecha.desc');}catch{return [];}}
async function fetchSeguros(){try{return await fetchDirect('seguros',200,null);}catch{return [];}}
async function fetchImpuestos(){try{return await fetchDirect('impuestos',200,null);}catch{return [];}}
async function fetchInfracciones(){try{return await fetchDirect('infracciones',200,'fecha.desc');}catch{return [];}}
async function fetchViajes(){try{return await fetchDirect('viajes',100,'fecha.desc');}catch{return [];}}
async function fetchProximos(){try{return await fetchDirect('v_proximos_mantenimientos',200,null);}catch{try{return await fetchDirect('mantenimientos',200,null);}catch{return [];}}}
async function fetchEstadoDocs(){try{return await fetchDirect('v_estado_documentos',200,null);}catch{return [];}}
async function fetchGPS(){const cfg=getCfg(); try{const r=await fetch(cfg.API_BASE_URL+'/api/gps'); if(r.ok){const d=await r.json(); if(d.length) return d;}}catch{} try{return await fetchDirect('gps_tracking',2000,'fecha.desc');}catch{if(!FLOTA_CACHE.data.length) await fetchFlota(); return FLOTA_CACHE.data.filter(f=>f.ultima_lat).map(f=>({flota_id:f.id,placa:f.placa,lat:f.ultima_lat,lng:f.ultima_lng,fecha:f.ultima_fecha}));}}
window.FGWAPI={fetchDirect,fetchFlota,fetchCombustible,fetchChoferesReal,fetchRutas,fetchTalleres,fetchMantenimientos,fetchSeguros,fetchImpuestos,fetchInfracciones,fetchViajes,fetchGPS,fetchProximos,fetchEstadoDocs,getCfg,normalizeFlota,FLOTA_CACHE};
console.log('[V13.6.1] api.js OK - 10 fetchers + anon key embedded');
