
async function renderDashboardKPIs(){
  const content=document.getElementById('dash-content');
  const kpis=document.getElementById('dash-kpis');
  if(!content) return;
  content.innerHTML='Cargando Dashboard...';
  try{
    const flota = FGWAPI.FLOTA_CACHE.data.length?FGWAPI.FLOTA_CACHE.data:await FGWAPI.fetchFlota();
    const proximos = await FGWAPI.fetchProximos().catch(()=>[]);
    const docs = await FGWAPI.fetchEstadoDocs().catch(()=>[]);
    const oper = flota.filter(f=>String(f.estado||'').toLowerCase().includes('oper')).length;
    const mant = flota.filter(f=>String(f.estado||'').toLowerCase().includes('mante')).length;
    if(kpis) kpis.innerHTML='TOTAL:'+flota.length+' OPER:'+oper+' MANT:'+mant;
    content.innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:20px"><div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px"><h4>Flota</h4><canvas id="chart-flota"></canvas></div><div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px"><h4>Proximos</h4><canvas id="chart-prox"></canvas></div><div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px"><h4>Docs</h4><canvas id="chart-docs"></canvas></div><div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px"><h4>Indicadores</h4><div>KM Total: '+(flota.reduce((a,f)=>a+(Number(f.km_actual||0)),0).toLocaleString())+'<br>Prox Vencidos: '+(proximos.filter(p=>Number(p.km_restantes)<=0).length)+'<br>Docs Vencidos: '+(docs.filter(d=>String(d.estado_general).includes('VENCIDO')).length)+'</div></div></div>';
    if(typeof Chart==='undefined'){ const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'; document.head.appendChild(s); await new Promise(r=>s.onload=r); }
    new Chart(document.getElementById('chart-flota'),{type:'doughnut',data:{labels:['Operativas','Mant','Fuera'],datasets:[{data:[oper,mant,flota.length-oper-mant],backgroundColor:['#16a34a','#ea580c','#ef4444']}]},options:{responsive:true}});
    const venc=proximos.filter(p=>Number(p.km_restantes)<=0).length;
    const crit=proximos.filter(p=>{let k=Number(p.km_restantes);return k>0&&k<=500;}).length;
    const porV=proximos.filter(p=>{let k=Number(p.km_restantes);return k>500&&k<=1000;}).length;
    new Chart(document.getElementById('chart-prox'),{type:'bar',data:{labels:['Venc','Crit','PorVencer'],datasets:[{data:[venc,crit,porV],backgroundColor:['#ef4444','#dc2626','#ea580c']}]},options:{responsive:true}});
    const docsV=docs.filter(d=>String(d.estado_general)==='VIGENTE').length;
    const docsPV=docs.filter(d=>String(d.estado_general).includes('POR VENCER')).length;
    const docsVe=docs.filter(d=>String(d.estado_general)==='VENCIDO').length;
    new Chart(document.getElementById('chart-docs'),{type:'doughnut',data:{labels:['Vig','PorV','Venc'],datasets:[{data:[docsV,docsPV,docsVe],backgroundColor:['#16a34a','#ea580c','#ef4444']}]},options:{responsive:true}});
  }catch(e){ content.innerHTML='Error:'+e.message; console.error(e); }
}
window.renderDashboardKPIs=renderDashboardKPIs;
console.log('dashboard.js V13.6.3 loaded');
