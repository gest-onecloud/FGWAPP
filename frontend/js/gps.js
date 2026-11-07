async function renderGPS(){await renderRutas(); const gps=await FGWAPI.fetchGPS(); console.log('[GPS]',gps.length);}
window.renderGPS=renderGPS;
