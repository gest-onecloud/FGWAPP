from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Routers existentes
from control_combustible import router as combustible_router
from control_eficiencia import router as eficiencia_router
from control_rutas import router as rutas_router

app = FastAPI(title="FGWAPP Backend - 200 LIVE GPS Telcel")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok", "flota": 200, "sucursales": {"GDL": 120, "CLN": 80}, "version": "V12.1 Rutas GPS Telcel"}

# --- Existing Combustible routes ---
app.include_router(combustible_router)
app.include_router(eficiencia_router)

# --- NUEVO Capa 3 Rutas GPS Telcel ---
# Endpoints: /api/gps , /api/gps/{placa} , /api/rutas
app.include_router(rutas_router)

# Si tienes flota_router y stats_router, inclúyelos también:
# from flota import router as flota_router
# from stats import router as stats_router
# app.include_router(flota_router)
# app.include_router(stats_router)
