from fastapi import APIRouter
import random
from datetime import datetime, timedelta

router = APIRouter()

# Coordenadas base GDL y CLN
GDL_BASE = {"lat": 20.6597, "lng": -103.3496, "name": "Guadalajara"}
CLN_BASE = {"lat": 24.8093, "lng": -107.3940, "name": "Culiacán"}

def generate_gps_data(total=200):
    data=[]
    for i in range(1, total+1):
        is_gdl = i <= 120
        base = GDL_BASE if is_gdl else CLN_BASE
        # Dispersión ~ 30km alrededor
        lat = base["lat"] + random.uniform(-0.3, 0.3)
        lng = base["lng"] + random.uniform(-0.3, 0.3)
        speed = random.randint(0, 90) if random.random() > 0.3 else 0
        estado = "En Ruta" if speed > 5 else ("En Base" if i % 3 == 0 else "Disponible")
        if i % 14 == 0:
            estado = "En Taller"
            speed = 0
        signal = random.choice(["Excelente", "Buena", "Regular", "Baja"])
        sim_status = "Activo" if random.random() > 0.05 else "Sin Señal"
        last_update = (datetime.now() - timedelta(minutes=random.randint(0, 45))).isoformat()
        placa = f"FG-{str(i).zfill(4)}"
        data.append({
            "id": i,
            "placa": placa,
            "sucursal_id": 1 if is_gdl else 2,
            "sucursal_clave": "SUC-GDL-01" if is_gdl else "SUC-CLN-01",
            "sucursal_nombre": base["name"],
            "estado": estado,
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "velocidad_kmh": speed,
            "direccion": f"{random.choice(['Av. Vallarta', 'Periférico', 'Carretera', 'Blvd. Lola Beltrán'])} {random.randint(100, 2500)}",
            "combustible_pct": random.randint(15, 95),
            "km_actual": 24532 + random.randint(0, 15000),
            "telcel_sim": f"8952{random.randint(1000000000, 9999999999)}",
            "telcel_signal": signal,
            "telcel_status": sim_status,
            "ultima_actualizacion": last_update,
            "ruta_actual": f"RUTA-{random.choice(['GDL-CLN', 'GDL-MEX', 'CLN-MZT', 'GDL-LOCAL'])}-{random.randint(1, 40)}",
            "conductor": f"Operador {random.randint(1, 20)}",
            "bateria_gps_pct": random.randint(60, 100)
        })
    return data

@router.get("/api/gps")
def get_gps_all():
    return generate_gps_data(200)

@router.get("/api/gps/{placa}")
def get_gps_by_placa(placa: str):
    data = generate_gps_data(200)
    filtered = [d for d in data if d["placa"] == placa.upper()]
    if filtered:
        return filtered[0]
    return {"error": "No encontrado", "placa": placa}

@router.get("/api/rutas")
def get_rutas():
    rutas=[]
    for i in range(1, 41):
        origen = random.choice(["GDL", "CLN"])
        destino = "CLN" if origen == "GDL" else "GDL" if random.random() > 0.5 else random.choice(["MZT", "MEX", "LOCAL"])
        rutas.append({
            "id": f"RUTA-{origen}-{destino}-{i}",
            "origen": origen,
            "destino": destino,
            "distancia_km": random.randint(45, 680),
            "unidades_activas": random.randint(1, 8),
            "tiempo_estimado_h": round(random.uniform(1.5, 12.5), 1),
            "estado": random.choice(["Activa", "En Curso", "Finalizada", "Programada"]),
            "consumo_promedio_km_l": round(random.uniform(6.2, 9.8), 2)
        })
    return rutas
