# FGWAPP - Fleet Guard Web y Aplicación V8 Python

## Estructura de carpetas (dónde guardar cada cosa)

FGWAPP/
├── database/                    <- AQUÍ GUARDAS TODOS LOS SQLs
│   ├── schema_fgwapp.sql        <- Schema principal (200 unidades, GDL + CLN) - YA EJECUTADO
│   ├── 002_combustible_seed.sql <- Futuro: cargas de combustible históricas
│   ├── 003_gps_seed.sql         <- Futuro: tracking GPS
│   └── 004_mantenimiento.sql    <- Futuro: mantenimiento
│
├── backend/                     <- AQUÍ VA PYTHON (no backend-python)
│   ├── main.py                  <- FastAPI principal
│   ├── requirements.txt         <- fastapi, supabase, pandas, plotly
│   ├── .env                     <- TU SUPABASE_URL y ANON_KEY (crearlo)
│   ├── fraud_detector.py        <- Futuro: lógica fraude inteligente
│   └── supabase_client.py       <- Futuro: cliente Supabase
│
├── frontend/                    <- Dashboard Definitivo 200 unidades
│   ├── index.html
│   ├── css/fleetguard.css
│   ├── js/api.js
│   └── assets/
└── README.md (este archivo)

## Dónde guardar lo que ya hiciste

1. database/schema_fgwapp.sql -> Ya lo ejecutaste en Supabase, guárdalo en C:\Users\jdcov\Documents\OneDrive\FGWAPP\database\schema_fgwapp.sql

2. Todos los futuros SQLs (combustible, gps, etc) van en database/

3. backend/main.py -> C:\Users\jdcov\Documents\OneDrive\FGWAPP\backend\main.py

## Próximo paso: Crear .env

Crea archivo C:\Users\jdcov\Documents\OneDrive\FGWAPP\backend\.env con:

SUPABASE_URL=https://yjbzbfeivxkrxzlpehxj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.TU_ANON_KEY_COMPLETA_AQUI
PORT=10000
