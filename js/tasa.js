// Tasa oficial del BCV (bolívares por dólar), con actualización automática.
//
// Fuentes, en orden:
//   1. data/tasa.json — lo genera scripts/actualizar_tasa.py leyendo directamente bcv.org.ve.
//      (El navegador no puede leer bcv.org.ve por sí mismo: el BCV no lo permite.)
//   2. ve.dolarapi.com — publica la misma tasa oficial del BCV.
//   3. La última tasa guardada en este navegador, o la tasa de respaldo de config.js.
(function () {
  const C = window.TIENDA.bolivares || {};
  const CLAVE = "tienda-tasa-bcv";
  const CADA = (C.actualizarCadaMinutos || 60) * 60 * 1000;
  const MAX_EDAD_ARCHIVO = 3 * 60 * 60 * 1000; // si el script dejó de correr, se pasa a la otra fuente
  const oyentes = [];
  let actual = leer() || (C.tasaRespaldo > 0 ? { valor: C.tasaRespaldo, fechaValor: null, consultada: 0, fuente: "manual" } : null);
  let temporizador = null;

  function leer() {
    try {
      const d = JSON.parse(localStorage.getItem(CLAVE));
      return d && d.valor > 0 ? d : null;
    } catch { return null; }
  }
  function guardar(d) {
    try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch { /* sin almacenamiento: se consulta en cada visita */ }
  }

  async function pedirJSON(url) {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`${url}: ${r.status}`);
    return r.json();
  }

  async function desdeArchivo() {
    const d = await pedirJSON(`data/tasa.json?t=${Date.now()}`);
    if (!(d.usd > 0)) throw new Error("tasa.json sin valor");
    return { valor: d.usd, fechaValor: d.fecha_valor, fuente: "bcv.org.ve", vieja: Date.now() - new Date(d.consultado).getTime() > MAX_EDAD_ARCHIVO };
  }
  async function desdeApi() {
    const d = await pedirJSON("https://ve.dolarapi.com/v1/dolares/oficial");
    if (!(d.promedio > 0)) throw new Error("DolarApi sin valor");
    return { valor: d.promedio, fechaValor: d.fechaActualizacion, fuente: "BCV (vía DolarApi)", vieja: false };
  }

  async function actualizar() {
    let respaldo = null;
    for (const fuente of [desdeArchivo, desdeApi]) {
      try {
        const t = await fuente();
        if (t.vieja) { respaldo = respaldo || t; continue; }
        return aplicar(t);
      } catch { /* se prueba la siguiente fuente */ }
    }
    if (respaldo) aplicar(respaldo);
  }

  function aplicar({ valor, fechaValor, fuente }) {
    const cambio = !actual || actual.valor !== valor || actual.fechaValor !== fechaValor;
    actual = { valor, fechaValor, fuente, consultada: Date.now() };
    guardar(actual);
    oyentes.forEach((fn) => fn(actual, cambio));
  }

  function programar() {
    clearTimeout(temporizador);
    const falta = actual && actual.consultada ? Math.max(0, actual.consultada + CADA - Date.now()) : 0;
    temporizador = setTimeout(async () => { await actualizar(); programar(); }, falta);
  }

  window.TasaBCV = {
    get valor() { return C.activo === false ? null : actual?.valor || null; },
    get fechaValor() { return actual?.fechaValor || null; },
    get consultada() { return actual?.consultada || null; },
    get fuente() { return actual?.fuente || null; },
    alCambiar(fn) { oyentes.push(fn); },
    iniciar() {
      if (C.activo === false) return;
      programar();
      // Al volver a la pestaña después de un rato, se revisa si ya toca actualizar.
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") programar(); });
    },
  };
})();
