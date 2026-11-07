
async function renderFlujo(){
  const content=document.getElementById('flujo-content');
  const kpis=document.getElementById('flujo-kpis');
  if(!content) return;
  content.innerHTML='Cargando Flujo Caja...';
  try{
    const [comb,mant,imp,infra]=await Promise.all([FGWAPI.fetchCombustible(),FGWAPI.fetchMantenimientos(),FGWAPI.fetchImpuestos(),FGWAPI.fetchInfracciones()]);
    const totalComb=comb.reduce((a,c)=>a+Number(c.costo||0),0);
    const totalMant=mant.reduce((a,c)=>a+Number(c.costo||0),0);
    const totalImp=imp.reduce((a,c)=>a+Number(c.monto||0),0);
    const totalInfra=infra.reduce((a,c)=>a+Number(c.monto||0),0);
    if(kpis) kpis.innerHTML='COMBUSTIBLE $'+totalComb.toLocaleString()+' | MANTENIMIENTOS $'+totalMant.toLocaleString()+' | IMPUESTOS $'+totalImp.toLocaleString()+' | INFRACCIONES $'+totalInfra.toLocaleString()+' | TOTAL $'+(totalComb+totalMant+totalImp+totalInfra).toLocaleString();
    content.innerHTML='<div style="padding:20px"><canvas id="chart-flujo"></canvas><br><canvas id="chart-flujo-dist"></canvas></div>';
    if(typeof Chart==='undefined'){ const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'; document.head.appendChild(s); await new Promise(r=>s.onload=r); }
    // Agrupar por mes
    function getMes(f){ try{ const d=new Date(f); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); }catch{ return '2025-01'; } }
    const map={};
    comb.forEach(c=>{ const m=getMes(c.fecha||c.created_at); if(!map[m]) map[m]={comb:0,mant:0,imp:0,infra:0}; map[m].comb+=Number(c.costo||0); });
    mant.forEach(c=>{ const m=getMes(c.fecha||c.created_at); if(!map[m]) map[m]={comb:0,mant:0,imp:0,infra:0}; map[m].mant+=Number(c.costo||0); });
    imp.forEach(c=>{ const m=getMes(c.fecha_vencimiento||c.created_at); if(!map[m]) map[m]={comb:0,mant:0,imp:0,infra:0}; map[m].imp+=Number(c.monto||0); });
    infra.forEach(c=>{ const m=getMes(c.fecha||c.created_at); if(!map[m]) map[m]={comb:0,mant:0,imp:0,infra:0}; map[m].infra+=Number(c.monto||0); });
    const labels=Object.keys(map).sort().slice(-12);
    new Chart(document.getElementById('chart-flujo'),{type:'bar',data:{labels,datasets:[{label:'Comb',data:labels.map(l=>map[l].comb),backgroundColor:'#111'},{label:'Mant',data:labels.map(l=>map[l].mant),backgroundColor:'#ea580c'},{label:'Imp',data:labels.map(l=>map[l].imp),backgroundColor:'#3b82f6'},{label:'Infra',data:labels.map(l=>map[l].infra),backgroundColor:'#ef4444'}]},options:{responsive:true,scales:{x:{stacked:true},y:{stacked:true}}}});
    new Chart(document.getElementById('chart-flujo-dist'),{type:'doughnut',data:{labels:['COMBUSTIBLE','Mant','Imp','Infra'],datasets:[{data:[totalComb,totalMant,totalImp,totalInfra],backgroundColor:['#111','#ea580c','#3b82f6','#ef4444']}]},options:{responsive:true}});
  }catch(e){ content.innerHTML='Error:'+e.message; console.error(e); }
}
window.renderFlujo=renderFlujo;
window.renderFlujoCaja=renderFlujo;
console.log('flujo.js V13.6.3 loaded');
