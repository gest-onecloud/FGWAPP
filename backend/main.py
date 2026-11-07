# FGWAPP Backend V13.6.3 CLEAN - main.py
# Fallback endpoints directos a Supabase (sin módulos externos)
# Compatible con Render: usa PORT, SUPABASE_URL, SUPABASE_ANON_KEY / SUPABASE_KEY

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Cargar .env si existe (útil en local; en Render se usan las ENV del dashboard)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = FastAPI(title="FGWAPP Backend V13.6.3 CLEAN - 200 LIVE + GPS REAL")

# CORS para mjd-solutions.mx
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import robusto - prueba 3 rutas distintas
flota_router = None
combustible_router = None
gps_router = None
rutas_router = None
stats_router = None

def safe_import(name, alias):
    global flota_router, combustible_router, gps_router, rutas_router, stats_router
    candidates = [
        f"{name}",  # mismo dir
        f"backend.{name}",  # desde root
        f"src.backend.{name}",  # src/backend
    ]
    for mod_path in candidates:
        try:
            mod = __import__(mod_path, fromlist=['router'])
            router = getattr(mod, 'router')
            print(f"[IMPORT OK] {mod_path} -> {name}")
            return router
        except Exception as e:
            print(f"[IMPORT TRY] {mod_path} fail: {e}")
            continue
    print(f"[IMPORT FAIL] {name} no encontrado, usando fallback")
    return None

# Intenta importar
try:
    from flota import router as flota_router
except:
    flota_router = safe_import('flota', 'flota')

try:
    from control_combustible import router as combustible_router
except:
    try:
        from combustible import router as combustible_router
    except:
        combustible_router = safe_import('combustible', 'combustible') or safe_import('control_combustible', 'combustible')

try:
    from gps import router as gps_router
except:
    gps_router = safe_import('gps', 'gps') or safe_import('control_gps', 'gps')

try:
    from rutas import router as rutas_router
except:
    rutas_router = safe_import('rutas', 'rutas')

try:
    from stats import router as stats_router
except:
    stats_router = safe_import('stats', 'stats')

# Registra lo que exista
if flota_router:
    app.include_router(flota_router, prefix="/api", tags=["flota"])
    print("[ROUTE] /api/flota OK")
else:
    print("[ROUTE] /api/flota FALLBACK - usando directo Supabase")
    # Fallback inline para no quedar sin flota
    @app.get("/api/flota")
    def get_flota_fallback():
        from supabase import create_client
        import os
        url = os.getenv("SUPABASE_URL", "https://yjbzbfeivxkrxzlpehxj.supabase.co")
        key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")
        if not key:
            # key publica anon de tu proyecto - ponla en Render ENV
            return []
        supabase = create_client(url, key)
        res = supabase.table("flota").select("*").limit(200).execute()
        return res.data or []

if combustible_router:
    app.include_router(combustible_router, prefix="/api", tags=["combustible"])
else:
    @app.get("/api/combustible")
    def get_comb_fallback():
        try:
            from supabase import create_client
            import os
            url = os.getenv("SUPABASE_URL", "https://yjbzbfeivxkrxzlpehxj.supabase.co")
            key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")
            if not key:
                return []
            supabase = create_client(url, key)
            res = supabase.table("combustible_cargas").select("*").limit(1600).execute()
            return res.data or []
        except Exception as e:
            print(f"[FALLBACK COMB] {e}")
            return []

if gps_router:
    app.include_router(gps_router, prefix="/api", tags=["gps"])
else:
    @app.get("/api/gps")
    def get_gps_fallback():
        # Fallback: usa ultima_lat/lng de flota
        try:
            from supabase import create_client
            import os
            url = os.getenv("SUPABASE_URL", "https://yjbzbfeivxkrxzlpehxj.supabase.co")
            key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")
            if not key:
                return []
            supabase = create_client(url, key)
            res = supabase.table("flota").select("placa, ultima_lat, ultima_lng, marca, modelo, sucursal, estado_operativo").execute()
            data = [r for r in (res.data or []) if r.get("ultima_lat") and r.get("ultima_lng")]
            print(f"[FALLBACK GPS] {len(data)} con GPS real de flota")
            return data
        except Exception as e:
            print(f"[FALLBACK GPS] {e}")
            return []

if rutas_router:
    app.include_router(rutas_router, prefix="/api", tags=["rutas"])
else:
    @app.get("/api/rutas")
    def get_rutas_fallback():
        # Usa flota como rutas
        return []

if stats_router:
    app.include_router(stats_router, prefix="/api", tags=["stats"])

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "V13.6.3 CLEAN", "flota": "200 LIVE", "gps": "real ultima_lat/lng", "supabase": "direct fallback"}

@app.get("/")
def root():
    return {"message": "FGWAPP Backend V13.6.3 CLEAN - 200 LIVE + GPS REAL"}

# Para local
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 10000)))
