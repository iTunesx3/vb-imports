// Genera las publicaciones de Instagram (estilo A · Vitrina) y sus textos a partir de js/config.js y js/productos.js.
// Uso, desde la carpeta del proyecto:   node marketing/instagram/generar.mjs
// Resultado: marketing/instagram/publicaciones/NN-<id>.jpg (1080×1350) y marketing/instagram/textos.md.
// Orden: el de portada.rotacion en config.js (los nuevos ingresos); si está vacía, todos los modelos.
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import vm from "node:vm";

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, "..", "..");
const salida = join(aqui, "publicaciones");

// Datos de la tienda, leídos igual que en la web.
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["js/config.js", "js/productos.js"]) vm.runInContext(readFileSync(join(raiz, f), "utf8"), ctx);
const T = ctx.window.TIENDA;
const P = ctx.window.PRODUCTOS;
const ids = (T.portada.rotacion || []).filter((id) => P.some((p) => p.id === id));
const modelos = (ids.length ? ids.map((id) => P.find((p) => p.id === id)) : P);

// Igual que en la tienda: sin repetir la marca cuando el nombre ya la trae ("Air Jordan 3").
const nombreCompleto = (p) => (p.marca && !p.nombre.includes(p.marca) ? `${p.marca} ${p.nombre}` : p.nombre);

// Texto corto a propósito (lo pidió el dueño): los detalles están en la web, para que la visiten.
// Si la web tiene una promo en la franja de aviso (config.js), va también aquí.
function texto(p) {
  return [
    "Nuevos modelos en Ciudad Ojeda.",
    ...(T.aviso ? [T.aviso + "."] : []),
    "Más fotos, tallas y modelos en la web (enlace en la biografía).",
    "",
    `#CiudadOjeda #Ojeda #Zulia #CostaOriental #Lagunillas #Cabimas #BotasVenezuela #Botas #${p.categoria}`,
  ].join("\n");
}

// Chrome sin ventana, controlado por el protocolo de DevTools.
const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find(existsSync);
if (!chrome) throw new Error("No encontré Google Chrome.");
const puerto = 9400 + Math.floor(Math.random() * 400);
const perfil = mkdtempSync(join(tmpdir(), "vb-ig-"));
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

  await cdp("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });
  mkdirSync(salida, { recursive: true });
  const plantilla = pathToFileURL(join(aqui, "plantilla.html")).href;
  const md = [
    "# Publicaciones de Instagram",
    "",
    `Generadas con \`node marketing/instagram/generar.mjs\`. Sube cada imagen de \`publicaciones/\` con su texto.`,
    "El precio en bolívares no va en la imagen porque la tasa BCV cambia cada día.",
    "",
  ];
  for (const [i, p] of modelos.entries()) {
    const nn = String(i + 1).padStart(2, "0");
    await cdp("Page.navigate", { url: `${plantilla}?id=${encodeURIComponent(p.id)}` });
    for (let k = 0; k < 100 && (await evaluar("document.readyState")) !== "complete"; k++) await espera(100);
    await evaluar("window.listo");
    const foto = await cdp("Page.captureScreenshot", { format: "jpeg", quality: 92, clip: { x: 0, y: 0, width: 1080, height: 1350, scale: 1 } });
    const archivo = `${nn}-${p.id}.jpg`;
    writeFileSync(join(salida, archivo), Buffer.from(foto.result.data, "base64"));
    md.push(`## ${nn} · ${nombreCompleto(p)}`, "", `Imagen: \`publicaciones/${archivo}\``, "", "```", texto(p), "```", "");
    console.log(`${nn} ${p.id}`);
  }
  writeFileSync(join(aqui, "textos.md"), md.join("\n"));
  ws.close();
} finally {
  proc.kill();
  await espera(500);
  try { rmSync(perfil, { recursive: true, force: true }); } catch { /* Chrome puede tardar en soltar el perfil */ }
}
