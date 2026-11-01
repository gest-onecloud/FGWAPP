/**
 * FGWAPP V12.3.5 CLEAN FINAL - gps.js - SIN IMPORTS - FIX SyntaxError
 * (R)
 */
function formatGPS(lat, lng) {
  if (lat == null || lng == null) return 'Sin GPS';
  const la = Number(lat), ln = Number(lng);
  if (isNaN(la) || isNaN(ln)) return 'Sin GPS';
  return `${la.toFixed(5)}, ${ln.toFixed(5)}`;
}
function isValidGPS(lat, lng) {
  const la = Number(lat), ln = Number(lng);
  return !isNaN(la) && !isNaN(ln) && la !== 0 && ln !== 0;
}
