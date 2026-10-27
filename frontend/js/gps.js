import { CONFIG } from './config.js';

export function renderGPSMap(containerId, flota, onSelect){
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = "";
  flota.slice(0,80).forEach(f=>{
    const dot = document.createElement("div");
    dot.className = "dot";
    const isGDL = f.sucursal_id===1;
    dot.style.left = (isGDL? 12+Math.random()*36 : 58+Math.random()*34) + "%";
    dot.style.top = (12+Math.random()*76) + "%";
    let col = CONFIG.COLORS.lime;
    if(f.consumo_estado==="Critico") col=CONFIG.COLORS.red;
    else if(f.consumo_estado==="Sospechoso") col=CONFIG.COLORS.yellow;
    else if(f.consumo_estado==="Excedido") col=CONFIG.COLORS.orange;
    else if(f.consumo_estado==="Normal") col=CONFIG.COLORS.green;
    dot.style.background = col; dot.style.color = col;
    dot.title = `${f.placa} • ${f.marca} • ${f.consumo_estado} • ${f.estado}`;
    dot.onclick = ()=> onSelect(f);
    container.appendChild(dot);
  });
}
