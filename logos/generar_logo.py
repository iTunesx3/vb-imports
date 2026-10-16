"""Genera los archivos de marca de VB-Imports (propuesta 04 · Caja) en img/marca/.

Los textos se convierten en trazos, así el logo se ve igual en cualquier equipo aunque no
tenga la fuente instalada. Opcionalmente exporta PNG, favicon.ico e íconos con Edge o Chrome.

Uso:
    pip install fonttools pillow
    python logos/generar_logo.py --fuente "Montserrat[wght].ttf" [--png]

Fuente Montserrat (licencia SIL OFL 1.1):
    https://github.com/google/fonts/tree/main/ofl/montserrat
"""
import argparse
import subprocess
import tempfile
import time
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "img" / "marca"
# Chrome primero: espera a terminar la captura. Edge devuelve el control antes de guardarla.
NAVEGADORES = [
    Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
]

TEMAS = {
    "claro": {"texto": "#1C1917", "suave": "#78716C", "oro": "#A16207", "oro_lado": "#854D0E",
              "tapa": "#78716C", "izq": "#1C1917", "der": "#44403C"},
    "oscuro": {"texto": "#FAFAF9", "suave": "#A8A29E", "oro": "#D4A72C", "oro_lado": "#B8901F",
               "tapa": "#E7E5E4", "izq": "#A8A29E", "der": "#D6D3D1"},
}

# Caja isométrica de 100 × 100: (clase, color, puntos). La cinta son dos caras que coinciden
# exactamente con las aristas: una cruza la tapa y la otra baja por el costado derecho.
CAJA = [
    ("t", "tapa", [(50, 8), (90, 29), (50, 50), (10, 29)]),
    ("i", "izq", [(10, 29), (50, 50), (50, 94), (10, 73)]),
    ("d", "der", [(50, 50), (90, 29), (90, 73), (50, 94)]),
    ("c", "oro", [(25.5, 20.86), (34.5, 16.14), (74.5, 37.14), (65.5, 41.86)]),
    ("c2", "oro_lado", [(65.5, 41.86), (74.5, 37.14), (74.5, 81.14), (65.5, 85.86)]),
]
FONDO_CLARO = "#FAFAF9"
FONDO_OSCURO = "#1C1917"


def num(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


class Fuente:
    def __init__(self, ruta, peso):
        fuente = TTFont(ruta)
        if "fvar" in fuente:
            fuente = instantiateVariableFont(fuente, {"wght": peso})
        self.glifos = fuente.getGlyphSet()
        self.cmap = fuente.getBestCmap()
        self.upm = fuente["head"].unitsPerEm
        self.hmtx = fuente["hmtx"]

    def trazo(self, texto, x, y, tam, espaciado=0.0):
        """Devuelve (d, ancho) del texto con la línea base en y."""
        escala = tam / self.upm
        pluma = SVGPathPen(self.glifos, ntos=num)
        cursor = 0.0
        for letra in texto:
            nombre = self.cmap.get(ord(letra))
            if nombre is None:
                continue
            if letra != " ":
                self.glifos[nombre].draw(TransformPen(pluma, (escala, 0, 0, -escala, x + cursor, y)))
            cursor += self.hmtx[nombre][0] * escala + espaciado
        return pluma.getCommands(), cursor - espaciado


# ---------- Piezas ----------

def caja(c, x=0.0, y=0.0, s=1.0):
    """Caja en perspectiva de 100 × 100 unidades, con su cinta."""
    def p(puntos):
        return " ".join(f"{num(x + px * s)},{num(y + py * s)}" for px, py in puntos)
    return "".join(f'<polygon points="{p(puntos)}" fill="{c[color]}"/>' for _, color, puntos in CAJA)


def svg(ancho, alto, contenido, titulo="VB-Imports", fondo=None):
    rect = f'<rect width="100%" height="100%" fill="{fondo}"/>' if fondo else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {num(ancho)} {num(alto)}" '
            f'width="{num(ancho)}" height="{num(alto)}" role="img" aria-label="{titulo}">'
            f"<title>{titulo}</title>{rect}{contenido}</svg>\n")


def logo_completo(f700, f500, c):
    """Caja + VB IMPORTS + línea dorada + lema."""
    d_vb, w_vb = f700.trazo("VB", 118, 64, 44, 1)
    x_imp = 118 + w_vb + 12
    d_imp, w_imp = f500.trazo("IMPORTS", x_imp, 64, 20, 5)
    fin = x_imp + w_imp
    d_lema, w_lema = f500.trazo("DEL MUNDO A LA COL", 120, 98, 10, 3.3)
    ancho = max(fin, 120 + w_lema) + 6
    cuerpo = (caja(c, 4, 12, 0.96)
              + f'<path d="{d_vb}" fill="{c["texto"]}"/><path d="{d_imp}" fill="{c["texto"]}"/>'
              + f'<rect x="120" y="78" width="{num(fin - 120)}" height="2" fill="{c["oro"]}"/>'
              + f'<path d="{d_lema}" fill="{c["suave"]}"/>')
    return ancho, 112, cuerpo


def logo_simple(f700, f500, c):
    """Versión compacta para cabeceras: caja + VB IMPORTS en una línea."""
    # Letras más grandes que en el logo completo: esta versión se usa a unos 30–40 px de alto.
    d_vb, w_vb = f700.trazo("VB", 104, 69, 54, 1)
    x_imp = 104 + w_vb + 10
    d_imp, w_imp = f500.trazo("IMPORTS", x_imp, 69, 27, 3.5)
    ancho = x_imp + w_imp + 4
    cuerpo = caja(c, 0, 0, 1) + f'<path d="{d_vb}" fill="{c["texto"]}"/><path d="{d_imp}" fill="{c["texto"]}"/>'
    return ancho, 100, cuerpo


def favicon_adaptable():
    """Ícono que cambia de colores según el tema claro u oscuro del navegador."""
    def reglas(tema):
        return "".join(f".{clase}{{fill:{TEMAS[tema][color]}}}" for clase, color, _ in CAJA)
    estilo = f"<style>{reglas('claro')}@media (prefers-color-scheme:dark){{{reglas('oscuro')}}}</style>"
    caras = "".join(f'<polygon class="{clase}" points="{" ".join(f"{num(px)},{num(py)}" for px, py in puntos)}"/>'
                    for clase, _, puntos in CAJA)
    return svg(100, 100, estilo + caras)


# ---------- PNG ----------

def exportar_png(navegador, archivo_svg, destino, ancho, alto, fondo=None):
    """Dibuja el SVG con el navegador en modo sin ventana y guarda la captura."""
    # El navegador deja procesos auxiliares unos segundos; no se espera a que liberen la carpeta.
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmp:
        pagina = Path(tmp) / "p.html"
        fondo_css = fondo or "transparent"
        pagina.write_text(
            f'<html><body style="margin:0;background:{fondo_css}">'
            f'<img src="{archivo_svg.as_uri()}" style="display:block;width:{ancho}px;height:{alto}px;object-fit:contain"></body></html>',
            encoding="utf-8")
        inicio = time.time()
        subprocess.run([str(navegador), "--headless", "--disable-gpu", "--hide-scrollbars",
                        "--force-device-scale-factor=1", "--default-background-color=00000000",
                        f"--user-data-dir={Path(tmp) / 'perfil'}", f"--window-size={ancho},{alto}",
                        f"--screenshot={destino}", pagina.as_uri()],
                       check=True, capture_output=True, timeout=120)
        # Espera a que la captura quede escrita antes de borrar la página temporal.
        while not (destino.exists() and destino.stat().st_mtime >= inicio - 1):
            if time.time() - inicio > 30:
                raise SystemExit(f"El navegador no generó {destino.name}")
            time.sleep(0.3)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--fuente", required=True, help="ruta a Montserrat[wght].ttf")
    parser.add_argument("--png", action="store_true", help="exportar también PNG e ICO")
    args = parser.parse_args()

    f700, f500 = Fuente(args.fuente, 700), Fuente(args.fuente, 500)
    SALIDA.mkdir(parents=True, exist_ok=True)
    archivos = {}

    for tema, sufijo in (("claro", ""), ("oscuro", "-blanco")):
        c = TEMAS[tema]
        for nombre, generador in (("logo", logo_completo), ("logo-simple", logo_simple)):
            ancho, alto, cuerpo = generador(f700, f500, c)
            ruta = SALIDA / f"vb-imports-{nombre}{sufijo}.svg"
            ruta.write_text(svg(ancho, alto, cuerpo), encoding="utf-8")
            archivos[ruta.stem] = (ruta, ancho, alto)
        ruta = SALIDA / f"vb-imports-icono{sufijo}.svg"
        ruta.write_text(svg(100, 100, caja(c)), encoding="utf-8")
        archivos[ruta.stem] = (ruta, 100, 100)

    (SALIDA / "favicon.svg").write_text(favicon_adaptable(), encoding="utf-8")
    # Ícono con margen y fondo, para redes sociales y pantallas de inicio del teléfono.
    for nombre, fondo, tema in (("perfil-claro", FONDO_CLARO, "claro"), ("perfil-oscuro", FONDO_OSCURO, "oscuro")):
        ruta = SALIDA / f"vb-imports-{nombre}.svg"
        ruta.write_text(svg(100, 100, caja(TEMAS[tema], 20, 20, 0.6), fondo=fondo), encoding="utf-8")
        archivos[ruta.stem] = (ruta, 100, 100)

    # Imagen para compartir enlaces (WhatsApp, Facebook…): 1200 × 630 con el logo centrado.
    ancho, alto, cuerpo = logo_completo(f700, f500, TEMAS["claro"])
    escala = 460 / ancho
    ruta = SALIDA / "vb-imports-compartir.svg"
    ruta.write_text(svg(600, 315, f'<g transform="translate({num((600 - ancho * escala) / 2)} '
                                   f'{num((315 - alto * escala) / 2)}) scale({num(escala)})">{cuerpo}</g>',
                        fondo=FONDO_CLARO), encoding="utf-8")
    archivos[ruta.stem] = (ruta, 600, 315)

    for ruta in sorted(SALIDA.glob("*.svg")):
        print(f"SVG  {ruta.relative_to(RAIZ)}")

    if not args.png:
        return
    navegador = next((n for n in NAVEGADORES if n.exists()), None)
    if not navegador:
        raise SystemExit("No se encontró Edge ni Chrome para exportar PNG.")

    pngs = []
    for clave in ("vb-imports-logo", "vb-imports-logo-blanco", "vb-imports-logo-simple", "vb-imports-logo-simple-blanco"):
        ruta, ancho, alto = archivos[clave]
        w = 1200
        pngs.append((ruta, SALIDA / f"{clave}.png", w, round(w * alto / ancho), None))
    pngs += [
        (archivos["vb-imports-icono"][0], SALIDA / "vb-imports-icono.png", 512, 512, None),
        (archivos["vb-imports-icono-blanco"][0], SALIDA / "vb-imports-icono-blanco.png", 512, 512, None),
        (archivos["vb-imports-perfil-claro"][0], SALIDA / "vb-imports-perfil-claro.png", 1080, 1080, None),
        (archivos["vb-imports-perfil-oscuro"][0], SALIDA / "vb-imports-perfil-oscuro.png", 1080, 1080, None),
        (archivos["vb-imports-compartir"][0], SALIDA / "vb-imports-compartir.png", 1200, 630, None),
        (archivos["vb-imports-perfil-claro"][0], SALIDA / "apple-touch-icon.png", 180, 180, None),
        (archivos["vb-imports-icono"][0], SALIDA / "favicon-32.png", 32, 32, None),
    ]
    for origen, destino, ancho, alto, fondo in pngs:
        exportar_png(navegador, origen, destino, ancho, alto, fondo)
        print(f"PNG  {destino.relative_to(RAIZ)}  {ancho}×{alto}")

    from PIL import Image
    Image.open(SALIDA / "vb-imports-icono.png").save(SALIDA / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"ICO  {(SALIDA / 'favicon.ico').relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
