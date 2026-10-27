
"""
FGWAPP - Control de Eficiencia de Consumo
Análisis amigable de rendimiento - Optimización y mejora continua
No acusa, solo detecta oportunidades de mejora en consumo

Objetivo: Dashboard con 200 unidades, 10.80 km/L promedio
Terminología amigable: Bajo, Normal, Por Optimizar, Atención, Oportunidad Mejora
"""

import pandas as pd
from typing import List, Dict
from datetime import datetime

class ControlEficiencia:
    """
    Analiza rendimiento de combustible para optimización
    Lenguaje amigable: no usa 'fraude', usa 'oportunidad de mejora', 'por optimizar', 'atención'
    """
    
    def __init__(self, umbral_bajo=7.5, umbral_normal=6.0, umbral_atencion=5.0, umbral_oportunidad=4.5):
        self.umbral_bajo = umbral_bajo  # >7.5 Excelente
        self.umbral_normal = umbral_normal  # 6.0-7.5 Normal
        self.umbral_atencion = umbral_atencion  # 5.0-6.0 Atención
        self.umbral_oportunidad = umbral_oportunidad  # <4.5 Oportunidad mejora
    
    def clasificar_rendimiento(self, km_l: float, promedio_historico: float = None) -> Dict:
        """
        Clasifica rendimiento con lenguaje amigable
        """
        if km_l is None:
            return {"estado": "Sin datos", "color": "#6B7280", "mensaje": "Sin registro"}
        
        # Si hay histórico, comparar % caída (más inteligente que solo valor absoluto)
        variacion = None
        if promedio_historico and promedio_historico > 0:
            variacion = ((km_l - promedio_historico) / promedio_historico) * 100
        
        if km_l >= self.umbral_bajo:
            return {
                "estado": "Eficiente",
                "estado_tecnico": "Bajo",  # Para compatibilidad con DB
                "color": "#3B82F6",
                "mensaje": f"Excelente rendimiento {km_l} km/L",
                "variacion": variacion,
                "accion": "Mantener buenas prácticas"
            }
        elif km_l >= self.umbral_normal:
            return {
                "estado": "Óptimo",
                "estado_tecnico": "Normal",
                "color": "#C6FF00",
                "mensaje": f"Rendimiento dentro de lo esperado {km_l} km/L",
                "variacion": variacion,
                "accion": "Continuar operación normal"
            }
        elif km_l >= self.umbral_atencion:
            return {
                "estado": "Por Revisar",
                "estado_tecnico": "Excedido",
                "color": "#F59E0B",
                "mensaje": f"Consumo por encima de lo esperado {km_l} km/L",
                "variacion": variacion,
                "accion": "Revisar hábitos de conducción y ruta"
            }
        elif km_l >= self.umbral_oportunidad:
            return {
                "estado": "Atención",
                "estado_tecnico": "Sospechoso",
                "color": "#FBBF24",
                "mensaje": f"Oportunidad de optimización {km_l} km/L",
                "variacion": variacion,
                "accion": "Programar revisión de unidad y capacitación"
            }
        else:
            return {
                "estado": "Oportunidad de Mejora",
                "estado_tecnico": "Critico",
                "color": "#EF4444",
                "mensaje": f"Consumo atípico detectado {km_l} km/L - revisar operación",
                "variacion": variacion,
                "accion": "Revisión prioritaria de unidad, ruta y operación"
            }
    
    def analizar_flota(self, cargas: List[Dict]) -> Dict:
        """
        Analiza toda la flota para dashboard
        """
        if not cargas:
            return {"total": 0, "por_estado": {}, "promedio": 0, "oportunidades": []}
        
        df = pd.DataFrame(cargas)
        
        # Promedio general
        promedio_general = df["rendimiento_km_l"].mean() if "rendimiento_km_l" in df else 0
        
        # Clasificar cada carga
        df["analisis"] = df["rendimiento_km_l"].apply(lambda x: self.clasificar_rendimiento(x))
        df["estado_amigable"] = df["analisis"].apply(lambda x: x["estado"])
        
        # Conteo por estado amigable
        por_estado = df["estado_amigable"].value_counts().to_dict()
        
        # Oportunidades de mejora (antes 'fraudes', ahora lenguaje constructivo)
        oportunidades = df[df["estado_amigable"].isin(["Atención", "Oportunidad de Mejora"])].to_dict("records")
        
        return {
            "total_cargas": len(df),
            "promedio_general": round(promedio_general, 2),
            "por_estado_amigable": por_estado,
            "por_estado_tecnico": df["estado_combustible"].value_counts().to_dict() if "estado_combustible" in df else {},
            "oportunidades_mejora": len(oportunidades),
            "lista_oportunidades": oportunidades[:20],  # Top 20 para revisar
            "mensaje_dashboard": f"{len(oportunidades)} unidades con oportunidad de optimización detectada"
        }

# Ejemplo uso
if __name__ == "__main__":
    control = ControlEficiencia()
    
    # Ejemplo: FG-0003 con 3.2 km/L (antes Critico/Fraude, ahora Oportunidad Mejora)
    resultado = control.clasificar_rendimiento(3.2, promedio_historico=6.5)
    print(f"FG-0003: {resultado['estado']} - {resultado['mensaje']}")
    print(f"Acción sugerida: {resultado['accion']}")
    print(f"Variación vs histórico: {resultado['variacion']:.1f}%")
    
    # FG-0001 con 4.1 (antes Sospechoso)
    resultado2 = control.clasificar_rendimiento(4.1, promedio_historico=6.5)
    print(f"\nFG-0001: {resultado2['estado']} - {resultado2['mensaje']}")
