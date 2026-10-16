"""Lee la tasa oficial del dólar publicada en bcv.org.ve y la guarda en data/tasa.json.

Uso:
    python scripts/actualizar_tasa.py

La tienda lee data/tasa.json primero. Para que el archivo se mantenga al día, programa este
script cada hora en el servidor donde publiques la tienda (cron, GitHub Actions o el
Programador de tareas de Windows). Si el archivo tiene más de 3 horas, la tienda usa otra
fuente con la misma tasa oficial del BCV.
"""
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

URL = "https://www.bcv.org.ve/"
DESTINO = Path(__file__).resolve().parent.parent / "data" / "tasa.json"


def leer_bcv():
    pedido = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0 (tasa para catálogo)"})
    with urllib.request.urlopen(pedido, timeout=30) as respuesta:
        html = respuesta.read().decode("utf-8", "replace")

    # <div id="dolar"> ... <strong class="strong-tb">880,11590000</strong>
    dolar = re.search(r'id="dolar".*?<strong[^>]*>\s*([\d.,]+)\s*</strong>', html, re.S)
    if not dolar:
        raise ValueError("no se encontró la tasa del dólar en la página del BCV (¿cambió su diseño?)")
    valor = float(dolar.group(1).replace(".", "").replace(",", "."))
    if valor <= 0:
        raise ValueError(f"tasa inválida: {dolar.group(1)}")

    # Fecha Valor: <span ... content="2026-10-16T00:00:00-04:00">
    fecha = re.search(r'Fecha Valor:\s*<span[^>]*content="([^"]+)"', html)
    return valor, fecha.group(1) if fecha else None


def main():
    try:
        valor, fecha_valor = leer_bcv()
    except Exception as error:
        print(f"No se pudo actualizar la tasa: {error}", file=sys.stderr)
        return 1

    datos = {
        "usd": valor,
        "fecha_valor": fecha_valor,
        "consultado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "fuente": URL,
    }
    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    DESTINO.write_text(json.dumps(datos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Tasa BCV: {valor} Bs. por USD (fecha valor {fecha_valor}) -> {DESTINO}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
