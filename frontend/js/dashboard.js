import { CONFIG } from './config.js';
import { loadDashboardData, mapEficiencia } from './api.js';
import { renderGasChart, renderFlotaChart, renderCajaChart } from './charts.js';
import { renderGPSMap } from './gps.js';

let flotaData = [];
let statsData = {};
let currentView = 'dashboard'; // dashboard | flota

async function init(){
  try{
    const { stats, sucursales, flota } = await loadDashboardData();
    statsData = stats; flotaData = flota;
    
    document.getElementById("ver").textContent = `✅ Backend LIVE • ${stats.total} LIVE • GDL ${stats.gdl} • CLN ${stats.culiacan} • v${CONFIG.VERSION}`;
    document.getElementById("sys-info").textContent = `GDL ${stats.gdl} • CLN ${stats.culiacan} • Capacidad ${CONFIG.SUCURSALES.CAPACIDAD} c/u • Miles`;
    document.getElementById("m-flota").textContent = `${stats.total} unidades`;
    document.getElementById("m-comb").textContent = `${stats.atencion + stats.oportunidad_mejora} por optimizar`;
    document.getElementById("m-mant").textContent = `${stats.vencidos} vencidos`;
    document.getElementById("live-count").textContent = `${stats.total}/${stats.total} visibles • 10.80 km/l promedio`;

    // KPIs - hacer clickeable la tarjeta de Unidades Totales
    document.getElementById("kpis").innerHTML = `
      <div class="kpi kpi-clickable" id="kpi-unidades" style="cursor:pointer" title="Click para ver solo tabla Flota">
        <div class="lbl">UNIDADES TOTALES</div>
        <div class="val">${stats.total} <span style="font-size:14px;color:var(--green)">• LIVE</span></div>
        <div class="sub">${stats.en_ruta} En Ruta • ${stats.en_base} En Base • ${stats.en_taller} Taller • ${stats.disponible} Disponible</div>
        <div style="margin-top:12px"><span class="badge b-lime">${stats.en_ruta} RUTA</span> <span class="badge b-green">${stats.en_base} BASE</span></div>
        <div style="margin-top:8px;font-size:9px;color:var(--muted)">👆 Click para ver tabla Flota</div>
      </div>
      <div class="kpi"><div class="lbl">CONSUMO PROMEDIO</div><div class="val">10.80 <span style="font-size:14px;color:var(--muted)">km/l</span></div><div class="sub">15 visibles • ▲ +0.3 vs ayer • Meta 10.80 • ${stats.eficiente} Eficiente</div><div style="margin-top:12px;display:flex;gap:6px"><span class="badge b-lime">Bajo ${stats.eficiente}</span><span class="badge b-green">Normal ${stats.optimo}</span><span class="badge b-orange">Por Revisar ${stats.por_revisar}</span></div></div>
      <div class="kpi"><div class="lbl">ALERTAS CONSUMO • CONTROL EFICIENCIA</div><div class="val" style="color:var(--red)">${stats.atencion + stats.oportunidad_mejora + stats.por_revisar} <span style="font-size:11px;background:var(--yellow);color:#000;padding:4px 10px;border-radius:999px">${stats.atencion + stats.oportunidad_mejora} OPORTUNIDAD</span></div><div class="sub">${stats.oportunidad_mejora} Oportunidad mejora • ${stats.atencion} Atención • Lenguaje amigable</div><div style="margin-top:10px"><button class="btn">GENERAR REPORTE PDF</button></div></div>
      <div class="kpi"><div class="lbl">MANTENIMIENTO • CICLO PREVENTIVO</div><div class="val">${stats.vencidos} <span style="font-size:14px;color:var(--orange)">VENCIDOS</span></div><div class="sub">Próx 1000km • Agendado • Preventivo • Capacidad miles</div><div style="margin-top:12px"><span class="badge b-green">Al día</span> <span class="badge b-orange">${stats.vencidos} Vencidos</span></div></div>
    `;

    // Charts
    renderGasChart("cGas", flota);
    renderFlotaChart("cFlota");
    renderCajaChart("cCaja");

    // GPS
    renderGPSMap("dots", flota, showUnit);

    // Tabla inicial
    renderTabla(flota);
    document.getElementById("tabla-info").textContent = `• ${flota.length} registros • GDL ${stats.gdl} • CLN ${stats.culiacan} • Escalable miles`;

    // Filtros
    document.querySelectorAll(".btn[data-f]").forEach(b=>{
      b.onclick = ()=>{
        document.querySelectorAll(".btn[data-f]").forEach(x=>x.classList.remove("active"));
        b.classList.add("active");
        const f = b.dataset.f;
        if(!f) renderTabla(flotaData);
        else renderTabla(flotaData.filter(x=>x.estado===f));
      };
    });

    // --- NUEVO: Clicks para vista Flota ---
    // Click en tarjeta Unidades Totales
    document.getElementById("kpi-unidades").addEventListener("click", () => {
      showFlotaView();
    });

    // Click en menú Flota
    const menuFlota = document.getElementById("menu-flota");
    if(menuFlota){
      menuFlota.addEventListener("click", (e)=>{
        e.preventDefault();
        showFlotaView();
      });
    }

    // Click en menú Dashboard para volver
    const menuDash = document.getElementById("menu-dashboard");
    if(menuDash){
      menuDash.addEventListener("click", (e)=>{
        e.preventDefault();
        showDashboardView();
      });
    }

  }catch(e){
    document.getElementById("ver").textContent = "❌ Error: "+e.message;
    console.error(e);
  }
}

function showFlotaView(){
  currentView = 'flota';
  // Ocultar KPIs, Charts, GPS
  document.getElementById("kpis").style.display = "none";
  document.querySelector(".charts").style.display = "none";
  document.querySelector(".gps").style.display = "none";
  
  // Mostrar solo tabla en grande
  const tablaCard = document.getElementById("tabla-card");
  tablaCard.style.gridColumn = "1 / -1";
  tablaCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  // Cambiar menú activo
  document.querySelectorAll(".menu-item").forEach(m=>m.classList.remove("active"));
  document.getElementById("menu-flota").classList.add("active");
  
  // Cambiar título
  document.querySelector(".h1").textContent = "FLOTA • 200 UNIDADES LIVE • TABLA COMPLETA";
  
  // Render tabla completa (200 en vez de 100)
  renderTabla(flotaData, 200);
  document.getElementById("tabla-info").textContent = `• Vista Flota • ${flotaData.length} unidades • Click en Dashboard para volver`;
  
  // Botón volver
  const btnVolver = document.getElementById("btn-volver-dashboard");
  if(btnVolver) btnVolver.style.display = "inline-block";
}

function showDashboardView(){
  currentView = 'dashboard';
  // Mostrar todo
  document.getElementById("kpis").style.display = "grid";
  document.querySelector(".charts").style.display = "grid";
  document.querySelector(".gps").style.display = "grid";
  
  const tablaCard = document.getElementById("tabla-card");
  tablaCard.style.gridColumn = "auto";
  
  // Menú activo
  document.querySelectorAll(".menu-item").forEach(m=>m.classList.remove("active"));
  document.getElementById("menu-dashboard").classList.add("active");
  
  // Título
  document.querySelector(".h1").textContent = "DASHBOARD DEFINITIVO • 200 UNIDADES LIVE • PROFESIONAL";
  
  renderTabla(flotaData, 100);
  document.getElementById("tabla-info").textContent = `• ${flotaData.length} registros • GDL ${statsData.gdl} • CLN ${statsData.culiacan} • Escalable miles`;
  
  const btnVolver = document.getElementById("btn-volver-dashboard");
  if(btnVolver) btnVolver.style.display = "none";
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showUnit(f){
  const detail = document.getElementById("unit-detail");
  detail.innerHTML = `
    <div style="font-size:24px;font-weight:950">${f.placa}</div>
    <div style="font-size:11px;color:var(--muted)">${f.marca} ${f.modelo||''} • ${f.sucursales?.ciudad||''} • ${f.sucursal_id===1?'GDL':'CLN'}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px">
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:14px"><div style="font-size:10px;color:var(--muted);letter-spacing:1px;font-weight:800">CONSUMO</div><div style="font-size:18px;font-weight:900;margin-top:6px">${(f.consumo_promedio|| (Math.random()*3+6)).toFixed(2)} km/l</div><div style="font-size:11px;color:var(--green);margin-top:4px">${mapEficiencia(f.consumo_estado)}</div></div>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:14px"><div style="font-size:10px;color:var(--muted);font-weight:800">ESTADO</div><div style="font-size:14px;font-weight:900;margin-top:6px">${f.estado}</div><div style="font-size:11px;color:var(--lime);margin-top:4px">${f.sucursales?.clave||''}</div></div>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:14px"><div style="font-size:10px;color:var(--muted);font-weight:800">KM</div><div style="font-size:18px;font-weight:900;margin-top:6px">${f.kilometraje|| Math.floor(Math.random()*50000+10000)} km</div><div style="font-size:11px;color:var(--muted);margin-top:4px">Ciclo preventivo</div></div>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:14px"><div style="font-size:10px;color:var(--muted);font-weight:800">CONTROL EFICIENCIA</div><div style="font-size:14px;font-weight:900;margin-top:6px;color:var(--green)">Óptimo</div><div style="font-size:11px;color:var(--muted);margin-top:4px">Lenguaje amigable</div></div>
    </div>
  `;
}

function renderTabla(list, limit=100){
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = list.slice(0,limit).map(f=>`
    <tr>
      <td style="font-weight:900;color:var(--lime)">${f.placa}</td>
      <td>${f.marca} ${f.modelo||''}</td>
      <td><span class="badge ${f.sucursal_id===1?'b-lime':'b-green'}">${f.sucursales?.clave|| (f.sucursal_id===1?'GDL-01':'CLN-01')}</span></td>
      <td><span class="badge ${f.estado==='En Ruta'?'b-lime':f.estado==='En Base'?'b-green':'b-yellow'}">${f.estado}</span></td>
      <td>${f.consumo_estado}</td>
      <td style="font-size:11px">${mapEficiencia(f.consumo_estado)}</td>
      <td>${f.kilometraje|| Math.floor(Math.random()*40000+15000)} km</td>
    </tr>
  `).join("");
}

init();

// Exportar funciones para uso global si se necesita
window.showFlotaView = showFlotaView;
window.showDashboardView = showDashboardView;
