2026-11-02T02:29:59.519280888Z ==> Downloading cache...
2026-11-02T02:29:59.54615956Z ==> Cloning from https://github.com/gest-onecloud/FGWAPP
2026-11-02T02:29:59.812115506Z ==> Checking out commit edcaa4b74a146ae8555ce0c3ea09039ac4d18db7 in branch main
2026-11-02T02:29:59.844192778Z ==> Downloaded and extracted 9.9 MiB cache in 0s.
2026-11-02T02:30:00.998970987Z ==> Using Python version 3.14.8 (default)
2026-11-02T02:30:00.998984164Z ==> Docs on specifying a Python version: https://render.com/docs/python-version
2026-11-02T02:30:00.999080691Z ==> Installing Python version 3.14.8...
2026-11-02T02:30:07.184856615Z ==> Using Poetry version 2.1.3 (default)
2026-11-02T02:30:07.225800343Z ==> Docs on specifying a Poetry version: https://render.com/docs/poetry-version
2026-11-02T02:30:07.279534403Z ==> Running build command 'pip install -r requirements.txt'...
2026-11-02T02:30:07.883435046Z Collecting fastapi==0.104.1 (from -r requirements.txt (line 1))
2026-11-02T02:30:07.885332982Z   Using cached fastapi-0.104.1-py3-none-any.whl.metadata (24 kB)
2026-11-02T02:30:07.964089849Z Collecting uvicorn==0.24.0 (from -r requirements.txt (line 2))
2026-11-02T02:30:07.965308925Z   Using cached uvicorn-0.24.0-py3-none-any.whl.metadata (6.4 kB)
2026-11-02T02:30:08.044429827Z Collecting supabase==2.9.1 (from -r requirements.txt (line 3))
2026-11-02T02:30:08.045687131Z   Using cached supabase-2.9.1-py3-none-any.whl.metadata (10 kB)
2026-11-02T02:30:08.113450487Z Collecting python-dotenv==1.0.0 (from -r requirements.txt (line 4))
2026-11-02T02:30:08.11468341Z   Using cached python_dotenv-1.0.0-py3-none-any.whl.metadata (21 kB)
2026-11-02T02:30:08.187933381Z Collecting anyio<4.0.0,>=3.7.1 (from fastapi==0.104.1->-r requirements.txt (line 1))
2026-11-02T02:30:08.189172129Z   Using cached anyio-3.7.1-py3-none-any.whl.metadata (4.7 kB)
2026-11-02T02:30:08.325715647Z Collecting pydantic!=1.8,!=1.8.1,!=2.0.0,!=2.0.1,!=2.1.0,<3.0.0,>=1.7.4 (from fastapi==0.104.1->-r requirements.txt (line 1))
2026-11-02T02:30:08.327065339Z   Using cached pydantic-2.14.2-py3-none-any.whl.metadata (137 kB)
2026-11-02T02:30:08.403912388Z Collecting starlette<0.28.0,>=0.27.0 (from fastapi==0.104.1->-r requirements.txt (line 1))
2026-11-02T02:30:08.40512009Z   Using cached starlette-0.27.0-py3-none-any.whl.metadata (5.8 kB)
2026-11-02T02:30:08.477158397Z Collecting typing-extensions>=4.8.0 (from fastapi==0.104.1->-r requirements.txt (line 1))
2026-11-02T02:30:08.478680588Z   Using cached typing_extensions-4.16.0-py3-none-any.whl.metadata (3.3 kB)
2026-11-02T02:30:08.550638653Z Collecting click>=7.0 (from uvicorn==0.24.0->-r requirements.txt (line 2))
2026-11-02T02:30:08.551892231Z   Using cached click-8.5.0-py3-none-any.whl.metadata (2.6 kB)
2026-11-02T02:30:08.617471052Z Collecting h11>=0.8 (from uvicorn==0.24.0->-r requirements.txt (line 2))
2026-11-02T02:30:08.61869528Z   Using cached h11-0.16.0-py3-none-any.whl.metadata (8.3 kB)
2026-11-02T02:30:08.688536541Z Collecting gotrue<3.0.0,>=2.9.0 (from supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:08.689743032Z   Using cached gotrue-2.12.4-py3-none-any.whl.metadata (2.0 kB)
2026-11-02T02:30:08.757878363Z Collecting httpx<0.28,>=0.26 (from supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:08.759012688Z   Using cached httpx-0.27.2-py3-none-any.whl.metadata (7.1 kB)
2026-11-02T02:30:08.828478426Z Collecting postgrest<0.18.0,>=0.17.0 (from supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:08.829689768Z   Using cached postgrest-0.17.2-py3-none-any.whl.metadata (3.4 kB)
2026-11-02T02:30:08.899371049Z Collecting realtime<3.0.0,>=2.0.0 (from supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:08.900582772Z   Using cached realtime-2.33.0-py3-none-any.whl.metadata (9.9 kB)
2026-11-02T02:30:08.972978172Z Collecting storage3<0.9.0,>=0.8.0 (from supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:08.974444778Z   Using cached storage3-0.8.2-py3-none-any.whl.metadata (1.8 kB)
2026-11-02T02:30:09.041555911Z Collecting supafunc<0.7.0,>=0.6.0 (from supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:09.042905219Z   Using cached supafunc-0.6.2-py3-none-any.whl.metadata (1.1 kB)
2026-11-02T02:30:09.11082412Z Collecting idna>=2.8 (from anyio<4.0.0,>=3.7.1->fastapi==0.104.1->-r requirements.txt (line 1))
2026-11-02T02:30:09.112056623Z   Using cached idna-3.20-py3-none-any.whl.metadata (7.2 kB)
2026-11-02T02:30:09.179476607Z Collecting sniffio>=1.1 (from anyio<4.0.0,>=3.7.1->fastapi==0.104.1->-r requirements.txt (line 1))
2026-11-02T02:30:09.181367924Z   Using cached sniffio-1.3.1-py3-none-any.whl.metadata (3.9 kB)
2026-11-02T02:30:09.259556611Z Collecting pyjwt<3.0.0,>=2.10.1 (from gotrue<3.0.0,>=2.9.0->supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:09.260772528Z   Using cached pyjwt-2.15.1-py3-none-any.whl.metadata (3.5 kB)
2026-11-02T02:30:09.331617516Z Collecting certifi (from httpx<0.28,>=0.26->supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:09.332870058Z   Using cached certifi-2026.10.23-py3-none-any.whl.metadata (2.5 kB)
2026-11-02T02:30:09.401508665Z Collecting httpcore==1.* (from httpx<0.28,>=0.26->supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:09.402750541Z   Using cached httpcore-1.0.9-py3-none-any.whl.metadata (21 kB)
2026-11-02T02:30:09.474407997Z Collecting h2<5,>=3 (from httpx[http2]<0.29,>=0.26->gotrue<3.0.0,>=2.9.0->supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:09.475597461Z   Using cached h2-4.4.1-py3-none-any.whl.metadata (3.8 kB)
2026-11-02T02:30:09.543548662Z Collecting hyperframe<7,>=6.1 (from h2<5,>=3->httpx[http2]<0.29,>=0.26->gotrue<3.0.0,>=2.9.0->supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:09.544762351Z   Using cached hyperframe-6.1.0-py3-none-any.whl.metadata (4.3 kB)
2026-11-02T02:30:09.611503008Z Collecting hpack<5,>=4.2 (from h2<5,>=3->httpx[http2]<0.29,>=0.26->gotrue<3.0.0,>=2.9.0->supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:09.612767843Z   Using cached hpack-4.2.0-py3-none-any.whl.metadata (3.3 kB)
2026-11-02T02:30:09.680088911Z Collecting deprecation<3.0.0,>=2.1.0 (from postgrest<0.18.0,>=0.17.0->supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:09.681701561Z   Using cached deprecation-2.1.0-py2.py3-none-any.whl.metadata (4.6 kB)
2026-11-02T02:30:09.755597049Z Collecting packaging (from deprecation<3.0.0,>=2.1.0->postgrest<0.18.0,>=0.17.0->supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:09.756858982Z   Using cached packaging-26.3-py3-none-any.whl.metadata (3.5 kB)
2026-11-02T02:30:09.82323191Z Collecting annotated-types>=0.6.0 (from pydantic!=1.8,!=1.8.1,!=2.0.0,!=2.0.1,!=2.1.0,<3.0.0,>=1.7.4->fastapi==0.104.1->-r requirements.txt (line 1))
2026-11-02T02:30:09.824616329Z   Using cached annotated_types-0.8.0-py3-none-any.whl.metadata (15 kB)
2026-11-02T02:30:10.387412827Z Collecting pydantic-core==2.50.2 (from pydantic!=1.8,!=1.8.1,!=2.0.0,!=2.0.1,!=2.1.0,<3.0.0,>=1.7.4->fastapi==0.104.1->-r requirements.txt (line 1))
2026-11-02T02:30:10.388857425Z   Using cached pydantic_core-2.50.2-cp314-cp314-manylinux2014_x86_64.manylinux_2_17_x86_64.whl.metadata (6.5 kB)
2026-11-02T02:30:10.453898842Z Collecting typing-inspection>=0.4.4 (from pydantic!=1.8,!=1.8.1,!=2.0.0,!=2.0.1,!=2.1.0,<3.0.0,>=1.7.4->fastapi==0.104.1->-r requirements.txt (line 1))
2026-11-02T02:30:10.455042468Z   Using cached typing_inspection-0.4.4-py3-none-any.whl.metadata (2.6 kB)
2026-11-02T02:30:10.607801118Z Collecting websockets<16,>=11 (from realtime<3.0.0,>=2.0.0->supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:10.609134518Z   Using cached websockets-15.0.1-py3-none-any.whl.metadata (6.8 kB)
2026-11-02T02:30:10.679862707Z Collecting python-dateutil<3.0.0,>=2.8.2 (from storage3<0.9.0,>=0.8.0->supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:10.681275687Z   Using cached python_dateutil-2.9.0.post0-py2.py3-none-any.whl.metadata (8.4 kB)
2026-11-02T02:30:10.749427963Z Collecting six>=1.5 (from python-dateutil<3.0.0,>=2.8.2->storage3<0.9.0,>=0.8.0->supabase==2.9.1->-r requirements.txt (line 3))
2026-11-02T02:30:10.750651273Z   Using cached six-1.17.0-py2.py3-none-any.whl.metadata (1.7 kB)
2026-11-02T02:30:10.757164075Z Using cached fastapi-0.104.1-py3-none-any.whl (92 kB)
2026-11-02T02:30:10.758477334Z Using cached uvicorn-0.24.0-py3-none-any.whl (59 kB)
2026-11-02T02:30:10.759747543Z Using cached supabase-2.9.1-py3-none-any.whl (16 kB)
2026-11-02T02:30:10.760984258Z Using cached python_dotenv-1.0.0-py3-none-any.whl (19 kB)
2026-11-02T02:30:10.762278823Z Using cached anyio-3.7.1-py3-none-any.whl (80 kB)
2026-11-02T02:30:10.763531466Z Using cached gotrue-2.12.4-py3-none-any.whl (42 kB)
2026-11-02T02:30:10.764765553Z Using cached httpx-0.27.2-py3-none-any.whl (76 kB)
2026-11-02T02:30:10.766155457Z Using cached httpcore-1.0.9-py3-none-any.whl (78 kB)
2026-11-02T02:30:10.767490676Z Using cached h2-4.4.1-py3-none-any.whl (62 kB)
2026-11-02T02:30:10.768948593Z Using cached hpack-4.2.0-py3-none-any.whl (34 kB)
2026-11-02T02:30:10.770451752Z Using cached hyperframe-6.1.0-py3-none-any.whl (13 kB)
2026-11-02T02:30:10.771947147Z Using cached postgrest-0.17.2-py3-none-any.whl (21 kB)
2026-11-02T02:30:10.773520342Z Using cached deprecation-2.1.0-py2.py3-none-any.whl (11 kB)
2026-11-02T02:30:10.775042032Z Using cached pydantic-2.14.2-py3-none-any.whl (490 kB)
2026-11-02T02:30:10.777260477Z Using cached pydantic_core-2.50.2-cp314-cp314-manylinux2014_x86_64.manylinux_2_17_x86_64.whl (2.2 MB)
2026-11-02T02:30:10.780778883Z Using cached pyjwt-2.15.1-py3-none-any.whl (33 kB)
2026-11-02T02:30:10.782368846Z Using cached realtime-2.33.0-py3-none-any.whl (24 kB)
2026-11-02T02:30:10.783871165Z Using cached starlette-0.27.0-py3-none-any.whl (66 kB)
2026-11-02T02:30:10.785409142Z Using cached storage3-0.8.2-py3-none-any.whl (16 kB)
2026-11-02T02:30:10.786840166Z Using cached python_dateutil-2.9.0.post0-py2.py3-none-any.whl (229 kB)
2026-11-02T02:30:10.788537019Z Using cached supafunc-0.6.2-py3-none-any.whl (6.6 kB)
2026-11-02T02:30:10.789705506Z Using cached typing_extensions-4.16.0-py3-none-any.whl (45 kB)
2026-11-02T02:30:10.790986409Z Using cached websockets-15.0.1-py3-none-any.whl (169 kB)
2026-11-02T02:30:10.792384579Z Using cached annotated_types-0.8.0-py3-none-any.whl (13 kB)
2026-11-02T02:30:10.793575921Z Using cached click-8.5.0-py3-none-any.whl (125 kB)
2026-11-02T02:30:10.794929912Z Using cached h11-0.16.0-py3-none-any.whl (37 kB)
2026-11-02T02:30:10.796146353Z Using cached idna-3.20-py3-none-any.whl (69 kB)
2026-11-02T02:30:10.7974474Z Using cached six-1.17.0-py2.py3-none-any.whl (11 kB)
2026-11-02T02:30:10.79862643Z Using cached sniffio-1.3.1-py3-none-any.whl (10 kB)
2026-11-02T02:30:10.799787436Z Using cached typing_inspection-0.4.4-py3-none-any.whl (14 kB)
2026-11-02T02:30:10.801017343Z Using cached certifi-2026.10.23-py3-none-any.whl (135 kB)
2026-11-02T02:30:10.802363555Z Using cached packaging-26.3-py3-none-any.whl (129 kB)
2026-11-02T02:30:10.911112806Z Installing collected packages: websockets, typing-extensions, sniffio, six, python-dotenv, pyjwt, packaging, idna, hyperframe, hpack, h11, click, certifi, annotated-types, uvicorn, typing-inspection, python-dateutil, pydantic-core, httpcore, h2, deprecation, anyio, starlette, pydantic, httpx, realtime, fastapi, supafunc, storage3, postgrest, gotrue, supabase
2026-11-02T02:30:12.278290665Z 
2026-11-02T02:30:12.281637344Z Successfully installed annotated-types-0.8.0 anyio-3.7.1 certifi-2026.10.23 click-8.5.0 deprecation-2.1.0 fastapi-0.104.1 gotrue-2.12.4 h11-0.16.0 h2-4.4.1 hpack-4.2.0 httpcore-1.0.9 httpx-0.27.2 hyperframe-6.1.0 idna-3.20 packaging-26.3 postgrest-0.17.2 pydantic-2.14.2 pydantic-core-2.50.2 pyjwt-2.15.1 python-dateutil-2.9.0.post0 python-dotenv-1.0.0 realtime-2.33.0 six-1.17.0 sniffio-1.3.1 starlette-0.27.0 storage3-0.8.2 supabase-2.9.1 supafunc-0.6.2 typing-extensions-4.16.0 typing-inspection-0.4.4 uvicorn-0.24.0 websockets-15.0.1
2026-11-02T02:30:12.282994574Z 
2026-11-02T02:30:12.283008414Z [notice] A new release of pip is available: 26.2.1 -> 26.2.2
2026-11-02T02:30:12.283011891Z [notice] To update, run: pip install --upgrade pip
2026-11-02T02:30:12.980843094Z ==> Uploading build...
2026-11-02T02:30:16.41983801Z ==> Uploaded in 1.9s. Compression took 1.5s
2026-11-02T02:30:16.427032047Z ==> Build successful 🎉
2026-11-02T02:30:17.50173146Z ==> Deploying...
2026-11-02T02:30:17.639227189Z ==> Setting WEB_CONCURRENCY=1 by default, based on available CPUs in the instance
2026-11-02T02:30:25.6930751Z ==> Running 'uvicorn main:app --host 0.0.0.0 --port 10000'
2026-11-02T02:30:32.998341362Z /opt/render/project/src/.venv/lib/python3.14/site-packages/anyio/from_thread.py:118: SyntaxWarning: 'return' in a 'finally' block
2026-11-02T02:30:32.998365192Z   return result
2026-11-02T02:30:34.490356335Z INFO:     Started server process [61]
2026-11-02T02:30:34.490381196Z INFO:     Waiting for application startup.
2026-11-02T02:30:34.490608371Z INFO:     Application startup complete.
2026-11-02T02:30:34.490919708Z INFO:     Uvicorn running on http://0.0.0.0:10000 (Press CTRL+C to quit)
2026-11-02T02:30:34.508178595Z [IMPORT TRY] flota fail: No module named 'flota'
2026-11-02T02:30:34.508200945Z [IMPORT TRY] backend.flota fail: No module named 'backend'
2026-11-02T02:30:34.508203595Z [IMPORT TRY] src.backend.flota fail: No module named 'src'
2026-11-02T02:30:34.508205725Z [IMPORT FAIL] flota no encontrado, usando fallback
2026-11-02T02:30:34.508207866Z [IMPORT TRY] combustible fail: No module named 'combustible'
2026-11-02T02:30:34.508209786Z [IMPORT TRY] backend.combustible fail: No module named 'backend'
2026-11-02T02:30:34.508212966Z [IMPORT TRY] src.backend.combustible fail: No module named 'src'
2026-11-02T02:30:34.508216366Z [IMPORT FAIL] combustible no encontrado, usando fallback
2026-11-02T02:30:34.508219916Z [IMPORT TRY] control_combustible fail: No module named 'control_combustible'
2026-11-02T02:30:34.508223236Z [IMPORT TRY] backend.control_combustible fail: No module named 'backend'
2026-11-02T02:30:34.508226556Z [IMPORT TRY] src.backend.control_combustible fail: No module named 'src'
2026-11-02T02:30:34.508229476Z [IMPORT FAIL] control_combustible no encontrado, usando fallback
2026-11-02T02:30:34.508233186Z [IMPORT TRY] gps fail: No module named 'gps'
2026-11-02T02:30:34.508236476Z [IMPORT TRY] backend.gps fail: No module named 'backend'
2026-11-02T02:30:34.508239656Z [IMPORT TRY] src.backend.gps fail: No module named 'src'
2026-11-02T02:30:34.508242636Z [IMPORT FAIL] gps no encontrado, usando fallback
2026-11-02T02:30:34.508246116Z [IMPORT TRY] control_gps fail: No module named 'control_gps'
2026-11-02T02:30:34.508249186Z [IMPORT TRY] backend.control_gps fail: No module named 'backend'
2026-11-02T02:30:34.508252687Z [IMPORT TRY] src.backend.control_gps fail: No module named 'src'
2026-11-02T02:30:34.508255707Z [IMPORT FAIL] control_gps no encontrado, usando fallback
2026-11-02T02:30:34.508259007Z [IMPORT TRY] rutas fail: No module named 'rutas'
2026-11-02T02:30:34.508275597Z [IMPORT TRY] backend.rutas fail: No module named 'backend'
2026-11-02T02:30:34.508279037Z [IMPORT TRY] src.backend.rutas fail: No module named 'src'
2026-11-02T02:30:34.508282177Z [IMPORT FAIL] rutas no encontrado, usando fallback
2026-11-02T02:30:34.508285487Z [IMPORT TRY] stats fail: No module named 'stats'
2026-11-02T02:30:34.508288367Z [IMPORT TRY] backend.stats fail: No module named 'backend'
2026-11-02T02:30:34.508291647Z [IMPORT TRY] src.backend.stats fail: No module named 'src'
2026-11-02T02:30:34.508297617Z [IMPORT FAIL] stats no encontrado, usando fallback
2026-11-02T02:30:34.508301088Z [ROUTE] /api/flota FALLBACK - usando directo Supabase
2026-11-02T02:30:34.508304258Z INFO:     127.0.0.1:60092 - "HEAD / HTTP/1.1" 405 Method Not Allowed
2026-11-02T02:30:38.541169465Z ==> Your service is live 🎉
2026-11-02T02:30:38.598072275Z INFO:     35.230.115.238:0 - "GET / HTTP/1.1" 200 OK
2026-11-02T02:30:38.654539423Z ==> 
2026-11-02T02:30:38.662661023Z ==> ///////////////////////////////////////////////////////////
2026-11-02T02:30:38.667004415Z ==> 
2026-11-02T02:30:38.683735625Z ==> Available at your primary URL https://fgwapp.onrender.com
2026-11-02T02:30:38.688381694Z ==> 
2026-11-02T02:30:38.693501361Z ==> ///////////////////////////////////////////////////////////