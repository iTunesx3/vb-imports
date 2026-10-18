"""Función de Vercel: entrega la tasa oficial del BCV con la misma forma que data/tasa.json.

En Vercel no corre la tarea horaria de GitHub Actions, así que vercel.json dirige /data/tasa.json
hacia esta función. La CDN de Vercel guarda la respuesta una hora; si el BCV no responde, la tienda
usa su fuente de respaldo.
"""
import json
import sys
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from actualizar_tasa import URL, leer_bcv  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            valor, fecha_valor = leer_bcv()
            cuerpo = {
                "usd": valor,
                "fecha_valor": fecha_valor,
                "consultado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "fuente": URL,
            }
            estado, cache = 200, "public, s-maxage=3600, stale-while-revalidate=1800"
        except Exception as error:
            cuerpo = {"error": f"No se pudo leer la tasa del BCV: {error}"}
            estado, cache = 502, "no-store"
        datos = json.dumps(cuerpo, ensure_ascii=False).encode("utf-8")
        self.send_response(estado)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", cache)
        self.end_headers()
        self.wfile.write(datos)
