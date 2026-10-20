// Genera los Reels de Instagram (MP4 vertical 1080×1920, 30 cuadros por segundo, sin audio: la música se agrega
// en la app de Instagram) a partir de js/config.js y js/productos.js.
// Uso, desde la carpeta del proyecto:   node marketing/reels/generar.mjs            (todos)
//                                      node marketing/reels/generar.mjs catalogo   (solo los que contienen "catalogo")
// Resultado: marketing/reels/videos/*.mp4 y marketing/reels/textos.md (texto sugerido para cada Reel).
// Necesita Google Chrome y ffmpeg (en el PATH, en la variable FFMPEG o el de "pip install imageio-ffmpeg").
import { spawn, execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import vm from "node:vm";

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, "..", "..");
const salida = join(aqui, "videos");
const FPS = 30;

const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["js/config.js", "js/productos.js"]) vm.runInContext(readFileSync(join(raiz, f), "utf8"), ctx);
const T = ctx.window.TIENDA;
const P = ctx.window.PRODUCTOS;
const ids = (T.portada.rotacion || []).filter((id) => P.some((p) => p.id === id));
const modelos = ids.length ? ids.map((id) => P.find((p) => p.id === id)) : P;

// Sin marcas en los videos: cada modelo se presenta por estilo (como en Marketplace).
const ESTILO = { Basketball: "Básquet", Running: "Running", Training: "Entrenamiento", Lifestyle: "Casual", Casual: "Casual" };
const estilo = (p) => ESTILO[p.categoria] || "Botas";
const src = (ruta) => "../../" + ruta;
const tallas = (p) => (p.tallas || []).filter((t) => !(p.agotadas || []).includes(t));
const usuario = "@" + T.instagram;
// La promo vigente es el aviso de la franja de la web (config.js): sale en el cierre y en el texto de cada Reel.
const promo = T.aviso || "";
const cierre = (extra = "") => ({
  tipo: "cierre", dur: promo ? 3.6 : 3.2, titulo: "Modelos, tallas y precios <em>en la web</em>", extra, promo, usuario,
  nota: "Ciudad Ojeda · Envíos a todo el país",
});
const hashtags = "#CiudadOjeda #Ojeda #Zulia #CostaOriental #Lagunillas #Cabimas #BotasVenezuela #Botas";
const lineaPromo = promo ? [promo + "."] : [];

const reels = [];

// 1. Todo el catálogo, un modelo tras otro.
reels.push({
  nombre: "01-catalogo",
  texto: ["Nuevos modelos en Ciudad Ojeda.", ...lineaPromo, "Más fotos, tallas y modelos en la web (enlace en la biografía).", "", hashtags + " #Reels"].join("\n"),
  planos: [
    { tipo: "intro", dur: 2.4, ceja: "Nuevos ingresos", titulo: "Botas <em>importadas</em>", sub: "Ya en Ciudad Ojeda" },
    ...modelos.map((p, i) => ({ tipo: "foto", dur: 0.85, src: src(p.portada), etiqueta: estilo(p), contador: `${String(i + 1).padStart(2, "0")} / ${modelos.length}` })),
    cierre(),
  ],
});

// 2. Por estilo: casual, básquet y running/entrenamiento.
const grupos = [
  ["Casual", modelos.filter((p) => estilo(p) === "Casual"), 0.6],
  ["Básquet", modelos.filter((p) => estilo(p) === "Básquet"), 0.75],
  ["Running", modelos.filter((p) => ["Running", "Entrenamiento"].includes(estilo(p))), 0.75],
].filter(([, ms]) => ms.length);
reels.push({
  nombre: "02-estilos",
  texto: ["¿Casual, básquet o running?", ...lineaPromo, "Elige tu estilo: más fotos, tallas y modelos en la web (enlace en la biografía).", "", hashtags + " #Reels"].join("\n"),
  planos: [
    { tipo: "intro", dur: 2.0, ceja: "Elige tu estilo", titulo: "Casual, básquet <em>o running</em>", sub: "Botas importadas · Ciudad Ojeda" },
    ...grupos.flatMap(([nombre, ms, dur]) => [
      { tipo: "capitulo", dur: 0.9, ceja: "Estilo", titulo: nombre },
      ...ms.map((p) => ({ tipo: "foto", dur, src: src(p.portada), etiqueta: estilo(p) })),
    ]),
    cierre(),
  ],
});

// 3. Un Reel corto por modelo: foto de estudio y hasta 3 fotos reales del par.
for (const [i, p] of modelos.entries()) {
  const t = tallas(p);
  reels.push({
    nombre: `03-modelo-${String(i + 1).padStart(2, "0")}-${p.id}`,
    texto: ["Nuevo ingreso en Ciudad Ojeda.", ...lineaPromo, "Más fotos, tallas y modelos en la web (enlace en la biografía).", "", `${hashtags} #${estilo(p).normalize("NFD").replace(/[\u0300-\u036f]/g, "")} #Reels`].join("\n"),
    planos: [
      { tipo: "intro", dur: 1.4, ceja: "Nuevo ingreso", titulo: `<em>${estilo(p)}</em>`, sub: "Botas importadas · Ciudad Ojeda" },
      { tipo: "foto", dur: 2.0, src: src(p.portada), etiqueta: estilo(p) },
      ...(p.imagenes || []).slice(0, 3).map((ruta) => ({ tipo: "real", dur: 1.1, src: src(ruta) })),
      cierre(t.length ? `${t.length > 1 ? "Tallas" : "Talla"} ${t.join(" y ")}` : ""),
    ],
  });
}

const filtro = process.argv.slice(2);
const elegidos = filtro.length ? reels.filter((r) => filtro.some((f) => r.nombre.includes(f))) : reels;

function buscarFfmpeg() {
  if (process.env.FFMPEG && existsSync(process.env.FFMPEG)) return process.env.FFMPEG;
  try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); return "ffmpeg"; } catch { /* no está en el PATH */ }
  for (const py of ["python", "python3", "py"]) {
    try {
      const ruta = execFileSync(py, ["-c", "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"], { encoding: "utf8" }).trim();
      if (ruta && existsSync(ruta)) return ruta;
    } catch { /* probar el siguiente */ }
  }
  throw new Error("No encontré ffmpeg. Instálalo o ejecuta: python -m pip install imageio-ffmpeg");
}
const ffmpeg = buscarFfmpeg();

const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find(existsSync);
if (!chrome) throw new Error("No encontré Google Chrome.");
const puerto = 9400 + Math.floor(Math.random() * 400);
const perfil = mkdtempSync(join(tmpdir(), "vb-reels-"));
const proc = spawn(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
  `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`, "about:blank"], { stdio: "ignore" });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  let lista;
  for (let i = 0; i < 50 && !lista; i++) {
    try { lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json(); } catch { await espera(200); }
  }
  const ws = new WebSocket(lista.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let n = 0;
  const pendientes = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m); pendientes.delete(m.id); }
  });
  const cdp = (method, params = {}) => new Promise((r) => { const k = ++n; pendientes.set(k, r); ws.send(JSON.stringify({ id: k, method, params })); });
  const evaluar = async (expression) => {
    const r = await cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || expression);
    return r.result.result.value;
  };

  await cdp("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
  await cdp("Page.navigate", { url: pathToFileURL(join(aqui, "plantilla.html")).href });
  for (let k = 0; k < 100 && (await evaluar("document.readyState")) !== "complete"; k++) await espera(100);
  mkdirSync(salida, { recursive: true });

  for (const reel of elegidos) {
    const { total, fuentes } = await evaluar(`window.cargar(${JSON.stringify({ planos: reel.planos })})`);
    if (!fuentes) console.warn("  Aviso: no cargaron las fuentes de Google; el video saldrá con letra de respaldo.");
    const cuadros = Math.round(total * FPS);
    const archivo = join(salida, `${reel.nombre}.mp4`);
    const ff = spawn(ffmpeg, ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", archivo], { stdio: ["pipe", "inherit", "inherit"] });
    const fin = new Promise((ok, mal) => ff.on("close", (c) => (c === 0 ? ok() : mal(new Error(`ffmpeg terminó con código ${c}`)))));
    for (let f = 0; f < cuadros; f++) {
      await evaluar(`(async () => { window.dibujar(${(f / FPS).toFixed(4)});
        await Promise.all([...document.images].filter((i) => i.offsetParent).map((i) => i.decode().catch(() => {}))); })()`);
      const shot = await cdp("Page.captureScreenshot", { format: "jpeg", quality: 92, clip: { x: 0, y: 0, width: 1080, height: 1920, scale: 1 } });
      if (!ff.stdin.write(Buffer.from(shot.result.data, "base64"))) await new Promise((r) => ff.stdin.once("drain", r));
    }
    ff.stdin.end();
    await fin;
    console.log(`${reel.nombre}.mp4  ${total.toFixed(1)} s`);
  }

  // Textos sugeridos (se regeneran completos aunque se haya pedido solo una parte de los videos).
  const md = ["# Reels de Instagram", "", "Generados con `node marketing/reels/generar.mjs`. Sin audio: al subirlos, agrega una canción del catálogo de Instagram.", ""];
  for (const r of reels) md.push(`## ${r.nombre}`, "", `Video: \`videos/${r.nombre}.mp4\``, "", "```", r.texto, "```", "");
  writeFileSync(join(aqui, "textos.md"), md.join("\n"));
  ws.close();
} finally {
  proc.kill();
  await espera(500);
  try { rmSync(perfil, { recursive: true, force: true }); } catch { /* Chrome puede tardar en soltar el perfil */ }
}
