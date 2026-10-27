// FGWAPP V8 - Configuración central
export const CONFIG = {
  API_BASE: "https://fgwapp.onrender.com", // Cambia a https://fgwapp-backend.onrender.com si renombras
  SUPABASE_URL: "https://yjbzbfeivxkrxzlpehxj.supabase.co",
  VERSION: "8.0.0-python",
  SUCURSALES: { GDL: 120, CLN: 80, CAPACIDAD: 1000 },
  COLORS: {
    lime: "#C6FF00",
    green: "#00FFA3",
    yellow: "#FBBF24",
    orange: "#F59E0B",
    red: "#EF4444",
    blue: "#3B82F6",
    eficiente: "#C6FF00",
    optimo: "#00FFA3",
    por_revisar: "#F59E0B",
    atencion: "#FBBF24",
    oportunidad: "#EF4444"
  },
  LENGUAJE_AMIGABLE: {
    Bajo: "Eficiente • Mantener buenas prácticas",
    Normal: "Óptimo • Continuar operación normal",
    Excedido: "Por Revisar • Revisar hábitos conducción",
    Sospechoso: "Atención • Oportunidad optimización",
    Critico: "Oportunidad de Mejora • Revisión prioritaria"
  }
};
