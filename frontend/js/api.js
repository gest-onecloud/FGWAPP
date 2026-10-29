// API V12.3 HYBRID - Intenta Supabase/Render con timeout 3s + fallback mock no bloqueante - Escalable a miles
export const API_BASE = "https://fgwapp.onrender.com";
const TIMEOUT_MS = 3500;

async function fetchWithTimeout(url, opts={}){
  const controller = new AbortController();
  const id = setTimeout(()=>controller.abort(), TIMEOUT_MS);
  try{
    const res = await fetch(url, {...opts, signal: controller.signal});
    clearTimeout(id);
    return res;
  }catch(e){
    clearTimeout(id);
    throw e;
  }
}

function genMockFlota(){
  return Array.from({length:200},(_,i)=>{
    const n=i+1; const isGDL=n<=120;
    return {
      id:n,
      placa:`FG-${String(n).padStart(4,'0')}`,
      marca:["Scania","Volvo","Freightliner"][n%3],
      modelo:["R-450","VNL","Cascadia"][n%3],
      anio:2019+(n%5),
      sucursal:isGDL?'SUC-GDL-01':'SUC-CLN-01',
      estado:n<=114?'En Ruta':n<=171?'En Base':n<=185?'En Taller':'Disponible',
      consumo_estado:n<=28?'Bajo':n<=170?'Normal':n<=189?'Excedido':n<=190?'Sospechoso':'Critico',
      kilometraje:10000+n*1234,
      consumo_promedio:(8+Math.random()*5).toFixed(2),
      mantenimiento:n<=65?'Vencido':'Vigente',
      ubicacion_lat:isGDL?20.6597:24.8093,
      ubicacion_lng:isGDL?-103.3496:-107.3940
    };
  });
}

export async function fetchFlota(){
  console.log(`[API V12.3] Intentando ${API_BASE}/api/flota con timeout ${TIMEOUT_MS}ms`);
  try{
    const res = await fetchWithTimeout(`${API_BASE}/api/flota`);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if(Array.isArray(data) && data.length>0){
      console.log(`[API] Backend OK ${data.length} unidades LIVE desde Supabase`);
      return data.map((f,idx)=>({
        ...f,
        placa:f.placa||`FG-${String(idx+1).padStart(4,'0')}`,
        sucursal:f.sucursal||f.suc||'SUC-GDL-01',
        consumo_estado:f.consumo_estado||f.consumo||'Normal'
      }));
    }
    throw new Error("Empty");
  }catch(e){
    console.warn(`[API] Backend dormido o timeout (${e.message}) - Fallback mock temporal 200 - Reintentando en background`);
    // Disparar wake-up call en background sin bloquear
    fetch(`${API_BASE}/`, {mode:'no-cors'}).catch(()=>{});
    return genMockFlota();
  }
}

export function generateMockCombustible(){
  const out=[];
  for(let i=1;i<=200;i++){
    const placa=`FG-${String(i).padStart(4,'0')}`;
    for(let j=0;j<8;j++){
      out.push({
        id:`${i}-${j}`,
        placa,
        vehiculo_id:placa,
        fecha:new Date(Date.now()-j*2*86400000).toISOString().split('T')[0],
        created_at:new Date(Date.now()-j*2*86400000).toISOString(),
        cantidad_litros:(50+Math.random()*150).toFixed(1),
        km_recorridos:Math.floor(300+Math.random()*600),
        km_l:(8+Math.random()*5).toFixed(2),
        tipo:"Diesel",
        consumo_estado:j===0? (i<=28?'Bajo':i<=170?'Normal':'Excedido') : 'Normal',
        costo:Math.floor(1500+Math.random()*2500),
        sucursal:i<=120?'SUC-GDL-01':'SUC-CLN-01'
      });
    }
  }
  return out;
}

export async function fetchCombustible(){
  try{
    const res = await fetchWithTimeout(`${API_BASE}/api/combustible`);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if(Array.isArray(data) && data.length>0){
      console.log(`[API] Combustible LIVE ${data.length} desde Supabase`);
      return data;
    }
    throw new Error("Empty combustible");
  }catch(e){
    console.warn("[API] Combustible fallback mock 1600", e.message);
    return generateMockCombustible();
  }
}

// Para despertar Render manualmente
export async function wakeBackend(){
  try{
    await fetch(`${API_BASE}/`, {mode:'no-cors'});
    console.log("[API] Wake signal enviado a Render");
  }catch(_){}
}
