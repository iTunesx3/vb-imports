"""Prepara los anuncios de Facebook Marketplace a partir de js/config.js y js/productos.js.

Uso, desde la carpeta del proyecto:   python marketing/marketplace/generar.py
Resultado, en marketing/marketplace/:
  anuncios/NN-<id>/01.jpg ...  la foto de estudio primero (Marketplace la muestra cuadrada) y luego las fotos reales
  textos.md                    título, precio, datos y descripción de cada anuncio
Orden: el de portada.rotacion en config.js. Necesita Node (para leer los .js) y Pillow.
"""
import json
import math
import shutil
import subprocess
from pathlib import Path

from PIL import Image

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
SALIDA = AQUI / "anuncios"

# Los datos se leen con Node, igual que en la tienda.
LEER = """
const vm = require('vm'), fs = require('fs'), path = require('path');
const c = { window: {} }; vm.createContext(c);
for (const f of ['js/config.js', 'js/productos.js']) vm.runInContext(fs.readFileSync(path.join(process.argv[1], f), 'utf8'), c);
console.log(JSON.stringify({ tienda: c.window.TIENDA, productos: c.window.PRODUCTOS }));
"""


def leer_datos():
    salida = subprocess.run(["node", "-e", LEER, str(RAIZ)], capture_output=True, text=True, encoding="utf-8", check=True)
    return json.loads(salida.stdout)


def usd(n):
    entero, decimales = f"{n:,.2f}".split(".")
    return f"${entero.replace(',', '.')},{decimales}"


def nombre_completo(p):
    # Igual que en la tienda: sin repetir la marca cuando el nombre ya la trae ("Air Jordan 3").
    return p["nombre"] if p.get("marca") and p["marca"] in p["nombre"] else f"{p['marca']} {p['nombre']}"


def titulo(p):
    # "Botas" va primero porque es lo que la gente busca; los Tommy ya se llaman "Botas …".
    if p["nombre"].startswith("Botas"):
        return f"{p['nombre']} {p['marca']}"
    return f"Botas {nombre_completo(p)}"


def tallas(p):
    return [t for t in p.get("tallas", []) if t not in p.get("agotadas", [])]


def unir(xs):
    xs = [str(x) for x in xs]
    return xs[0] if len(xs) == 1 else f"{', '.join(xs[:-1])} y {xs[-1]}"


def guardar_jpg(origen, destino, lado_max=1600):
    with Image.open(origen) as im:
        im = im.convert("RGB")
        im.thumbnail((lado_max, lado_max), Image.LANCZOS)
        im.save(destino, "JPEG", quality=92)


def main():
    datos = leer_datos()
    T, P = datos["tienda"], datos["productos"]
    iva = (T.get("bolivares") or {}).get("iva", 0)
    sistema = T["sistemaTallas"]
    ids = [i for i in T["portada"].get("rotacion", []) if any(p["id"] == i for p in P)]
    modelos = [next(p for p in P if p["id"] == i) for i in ids] if ids else P

    if SALIDA.exists():
        shutil.rmtree(SALIDA)
    md = [
        "# Anuncios de Facebook Marketplace",
        "",
        "Generados con `python marketing/marketplace/generar.py`. Cada anuncio usa las fotos de su carpeta en `anuncios/`, en orden.",
        "Precio en dólares con IVA, redondeado hacia arriba (Marketplace no acepta decimales). Sin métodos de pago.",
        "",
    ]
    for n, p in enumerate(modelos, 1):
        nn = f"{n:02d}"
        carpeta = SALIDA / f"{nn}-{p['id']}"
        carpeta.mkdir(parents=True)
        fotos = ([p["portada"]] if p.get("portada") else []) + list(p.get("imagenes") or [])
        for k, ruta in enumerate(fotos[:10], 1):
            guardar_jpg(RAIZ / ruta, carpeta / f"{k:02d}.jpg")

        t = tallas(p)
        linea_tallas = (f"Tallas {sistema} {unir(t)} (un par de cada una)." if len(t) > 1
                        else f"Talla {sistema} {t[0]} (un solo par).")
        # Marketplace en Venezuela solo acepta "Bs.F" y sin decimales: va el precio en dólares, redondeado hacia
        # arriba, y el "$" en el título y la descripción para que se entienda.
        dolares = math.ceil(round(p["precio"] * (1 + iva), 2))
        tit = f"{titulo(p)} · {'Tallas' if len(t) > 1 else 'Talla'} {unir(t)} · ${dolares}"
        descripcion = "\n".join([
            f"{titulo(p)}, nuevas y en su caja, ya en Ciudad Ojeda.",
            linea_tallas,
            f"Precio en dólares: ${dolares} con IVA incluido, o en bolívares a la tasa BCV del día.",
            "Entrega en Ojeda a domicilio o en punto de encuentro. Envíos a todo el país.",
            "Escríbenos para ver más fotos y otros modelos.",
        ])
        md += [
            f"## {nn} · {tit}",
            "",
            f"- **Fotos:** `anuncios/{carpeta.name}/` ({min(len(fotos), 10)})",
            f"- **Título:** {tit}",
            f"- **Precio:** {dolares} (Facebook lo muestra como Bs.F {dolares}; en la web: {usd(p['precio'] * (1 + iva))})",
            "- **Estado:** Nuevo",
            f"- **Marca:** {p['marca']}",
            "- **Categoría:** Ropa y calzado de hombre",
            f"- **Talla:** {sistema} {unir(t)}",
            f"- **Color:** {p.get('color', '')}",
            "- **Ubicación:** Ciudad Ojeda, Zulia",
            "",
            "Descripción:",
            "",
            "```",
            descripcion,
            "```",
            "",
        ]
        print(nn, p["id"], len(fotos), "fotos")
    (AQUI / "textos.md").write_text("\n".join(md), encoding="utf-8")


if __name__ == "__main__":
    main()
