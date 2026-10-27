import { CONFIG } from './config.js';

let chartInstances = {};

export function renderGasChart(canvasId, flota){
  const ctx = document.getElementById(canvasId);
  if(!ctx) return;
  const labels = flota.slice(0,15).map(f=>f.placa);
  const vals = flota.slice(0,15).map(()=> (Math.random()*4+5.5).toFixed(2));
  const colors = vals.map(v=> v<5? CONFIG.COLORS.red : v<6? CONFIG.COLORS.yellow : v<7.5? CONFIG.COLORS.orange : CONFIG.COLORS.lime);
  
  if(chartInstances[canvasId]) chartInstances[canvasId].destroy();
  chartInstances[canvasId] = new Chart(ctx, {
    type:'bar',
    data:{labels, datasets:[{data:vals, backgroundColor:colors, borderRadius:6, borderSkipped:false}]},
    options:{responsive:true, plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}, ticks:{color:'#8A8F98', font:{size:9}}}, y:{grid:{color:'#23262F'}, ticks:{color:'#8A8F98'}}}}
  });
}

export function renderFlotaChart(canvasId){
  const ctx = document.getElementById(canvasId);
  if(!ctx) return;
  if(chartInstances[canvasId]) chartInstances[canvasId].destroy();
  chartInstances[canvasId] = new Chart(ctx, {
    type:'line',
    data:{labels:Array.from({length:12},(_,i)=>`Sem ${i+1}`), datasets:[{data:[120,135,148,142,160,155,172,168,182,178,190,200], borderColor:CONFIG.COLORS.green, backgroundColor:'rgba(0,255,163,.14)', tension:.4, fill:true, pointRadius:3}]},
    options:{responsive:true, plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}, ticks:{color:'#8A8F98'}}, y:{grid:{color:'#23262F'}, ticks:{color:'#8A8F98'}}}}
  });
}

export function renderCajaChart(canvasId){
  const ctx = document.getElementById(canvasId);
  if(!ctx) return;
  if(chartInstances[canvasId]) chartInstances[canvasId].destroy();
  chartInstances[canvasId] = new Chart(ctx, {
    type:'line',
    data:{labels:Array.from({length:12},(_,i)=>`M${i+1}`), datasets:[
      {label:'Ingresos', data:[30,35,38,45,50,55,60,58,62,65,68,72], borderColor:CONFIG.COLORS.lime, tension:.4, fill:false},
      {label:'Egresos', data:[20,22,25,28,30,35,38,36,40,42,45,48], borderColor:CONFIG.COLORS.red, tension:.4, fill:false}
    ]},
    options:{responsive:true, plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}, ticks:{color:'#8A8F98'}}, y:{grid:{color:'#23262F'}, ticks:{color:'#8A8F98'}}}}
  });
}
