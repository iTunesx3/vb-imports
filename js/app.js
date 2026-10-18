// Lógica del catálogo: portada, filtros, ficha de producto y bolsa con pedido por WhatsApp.
(function () {
  const T = window.TIENDA;
  const P = window.PRODUCTOS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const app = $("#app");

  document.documentElement.classList.add("js");

  // ---------- Utilidades ----------
  const precio = (n) => T.moneda.simbolo + n.toLocaleString(T.moneda.locale, { maximumFractionDigits: 2 });
  const escapar = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const aSlug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
  const porId = (id) => P.find((p) => p.id === id);
  const tallaTxt = (t) => `${T.sistemaTallas} ${t}`;
  const agotada = (p, t) => (p.agotadas || []).includes(t);
  // Un producto sin precio o sin tallas cargadas se muestra como "a consultar" y se pide por WhatsApp.
  const conPrecio = (p) => typeof p.precio === "number" && p.precio > 0;
  const tallasDe = (p) => p.tallas || [];
  const vendible = (p) => conPrecio(p) && tallasDe(p).some((t) => !agotada(p, t));
  const nombreCompleto = (p) => (p.marca && !p.nombre.includes(p.marca) ? `${p.marca} ${p.nombre}` : p.nombre);
  const marcaYCategoria = (p) => escapar([p.marca, p.categoria].filter(Boolean).join(" · "));
  const numeroWhatsApp = String(T.whatsapp || "").replace(/\D/g, "");
  // Click to Chat, la API oficial de WhatsApp para abrir un chat con un mensaje ya escrito.
  const enlaceWhatsApp = (texto) => `https://wa.me/${numeroWhatsApp}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;

  // Bolívares según la tasa BCV vigente (vacío mientras no haya tasa).
  const SIMBOLO_BS = (T.bolivares && T.bolivares.simbolo) || "Bs.";
  const formatoBs = (n) => `${SIMBOLO_BS} ${n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  // El IVA va solo en bolívares: el monto en Bs. es dólares × tasa BCV × (1 + IVA).
  const IVA = (T.bolivares && T.bolivares.iva) || 0;
  const enBs = (usd) => (TasaBCV.valor ? formatoBs(usd * TasaBCV.valor * (1 + IVA)) : "");
  const bsHTML = (usd, clase = "") => `<span class="bs ${clase}" data-usd="${usd}">${enBs(usd)}</span>`;
  const fechaCorta = (iso) => (iso ? iso.slice(0, 10).split("-").reverse().join("/") : "");
  function textoTasa(largo) {
    if (!TasaBCV.valor) return "";
    const base = `Tasa BCV: ${formatoBs(TasaBCV.valor)} por USD${TasaBCV.fechaValor ? ` · fecha valor ${fechaCorta(TasaBCV.fechaValor)}` : ""}` +
      (IVA ? ` · Bs. con IVA (${Math.round(IVA * 100)} %) incluido; USD sin IVA` : "");
    if (!largo || !TasaBCV.consultada) return base;
    const hora = new Date(TasaBCV.consultada).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });
    return `${base} · actualizada a las ${hora}`;
  }
  function refrescarBs() {
    $$(".bs[data-usd]").forEach((e) => (e.textContent = enBs(+e.dataset.usd)));
    $$("[data-tasa]").forEach((e) => (e.textContent = textoTasa(e.dataset.tasa === "larga")));
  }

  const ICONO = {
    x: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    bolsa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    camion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    escudo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/></svg>',
    anterior: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>',
    siguiente: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>',
    pausa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>',
    seguir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg>',
  };

  // Mensaje para consultar un modelo; incluye el enlace cuando la tienda ya está publicada.
  const enInternet = /^https?:$/.test(location.protocol) && !/^(localhost|127\.|\[::1\])/.test(location.hostname);
  const mensajeConsulta = (p, talla) =>
    `Hola, me interesa el modelo ${nombreCompleto(p)}${talla != null ? ` en talla ${tallaTxt(talla)}` : ""}` +
    (conPrecio(p) ? ` (${precio(p.precio)}). ¿Está disponible?`
      : talla != null ? ". ¿Qué precio tiene y está disponible?" : ". ¿Qué precio tiene y en qué tallas está disponible?") +
    (enInternet ? `\n${location.origin}${location.pathname}#/producto/${p.id}` : "");

  // Categorías: las fijas más las que aparezcan en los productos.
  const CATEGORIAS = [
    { slug: "todos", nombre: "Todos", incluye: () => true },
    { slug: "novedades", nombre: "Novedades", incluye: (p) => p.etiqueta === "Nuevo" },
    ...[...new Set(P.map((p) => p.categoria))].map((c) => ({ slug: aSlug(c), nombre: c, incluye: (p) => p.categoria === c })),
    { slug: "ofertas", nombre: "Ofertas", incluye: (p) => !!p.precioAntes },
  ].filter((c) => P.some(c.incluye));
  const porSlug = (s) => CATEGORIAS.find((c) => c.slug === s) || CATEGORIAS[0];

  // Imagen del producto: foto real si existe; si no, la ilustración.
  // Con portada: true (catálogo, portada de inicio y bolsa) se usa la foto de estudio del modelo.
  const NOMBRES_VISTA = ["Vista lateral", "Vista interior", "Detalle"];
  const vistas = (p) => (p.imagenes && p.imagenes.length ? p.imagenes.map((_, i) => i) : [0, 1, 2]);
  const nombreVista = (p, i) => (p.imagenes && p.imagenes.length ? `Foto ${i + 1}` : NOMBRES_VISTA[i]);
  function imagen(p, { vista = 0, decorativa = true, portada = false } = {}) {
    if (portada && p.portada) {
      return `<img src="${escapar(p.portada)}" alt="${decorativa ? "" : escapar(nombreCompleto(p))}" loading="lazy">`;
    }
    if (p.imagenes && p.imagenes.length) {
      return `<img src="${escapar(p.imagenes[vista] || p.imagenes[0])}" alt="${decorativa ? "" : escapar(nombreCompleto(p))}" loading="lazy">`;
    }
    const svg = sneakerSVG(p, { decorativa });
    const clase = ["", "v-interior", "v-detalle"][vista];
    return clase ? svg.replace("<svg", `<svg class="${clase}"`) : svg;
  }

  const precioHTML = (p) => (conPrecio(p)
    ? precio(p.precio) + (p.precioAntes ? `<s>${precio(p.precioAntes)}</s>` : "") + bsHTML(p.precio)
    : `<span class="consultar">Consultar precio</span>`);

  function tallasHTML(p, { rapido = false, elegida = null } = {}) {
    return tallasDe(p).map((t) => {
      const sin = agotada(p, t);
      const etiqueta = rapido ? `Añadir talla ${tallaTxt(t)}` : `Talla ${tallaTxt(t)}`;
      return `<button type="button" class="talla" data-talla="${t}" ${sin ? "disabled" : ""}
        ${rapido ? "" : `aria-pressed="${t === elegida}"`} aria-label="${etiqueta}${sin ? ", agotada" : ""}">${t}</button>`;
    }).join("");
  }

  const tarjeta = (p) => `
    <article class="producto revelar" data-id="${p.id}">
      <div class="foto">
        <a href="#/producto/${p.id}" tabindex="-1" aria-hidden="true">${imagen(p, { portada: true })}</a>
        ${p.etiqueta ? `<span class="etiqueta ${p.precioAntes ? "oferta" : ""}">${escapar(p.etiqueta)}</span>` : ""}
        ${vendible(p) ? `<button type="button" class="rapido-btn" data-rapido aria-expanded="false">Añadir rápido<span class="sr"> ${escapar(p.nombre)}</span></button>
        <div class="rapido" hidden>
          <div class="rapido-cab"><span>Elige tu talla (${T.sistemaTallas})</span><button type="button" data-rapido-cerrar aria-label="Cerrar selector de talla">${ICONO.x}</button></div>
          <div class="tallas">${tallasHTML(p, { rapido: true })}</div>
        </div>` : ""}
      </div>
      <a class="info" href="#/producto/${p.id}">
        <div><h3>${escapar(p.nombre)}</h3><div class="cat">${marcaYCategoria(p)}</div></div>
        <div class="precio">${precioHTML(p)}</div>
      </a>
      ${p.colores ? `<div class="colores" aria-hidden="true">${[p.colores.upper, p.colores.acento, p.colores.media].map((c) => `<i style="background:${c}"></i>`).join("")}</div>` : ""}
    </article>`;

  // ---------- Bolsa ----------
  const CLAVE = "tienda-bolsa";
  let bolsa = leerBolsa();

  function leerBolsa() {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE));
      return Array.isArray(datos) ? datos.filter((i) => porId(i.id) && i.cantidad > 0) : [];
    } catch { return []; }
  }
  function guardarBolsa() {
    try { localStorage.setItem(CLAVE, JSON.stringify(bolsa)); } catch { /* sin almacenamiento: la bolsa dura lo que la pestaña */ }
  }
  const unidades = () => bolsa.reduce((s, i) => s + i.cantidad, 0);
  const subtotal = () => bolsa.reduce((s, i) => s + porId(i.id).precio * i.cantidad, 0);

  function agregar(id, talla) {
    const item = bolsa.find((i) => i.id === id && i.talla === talla);
    if (item) item.cantidad++; else bolsa.push({ id, talla, cantidad: 1 });
    guardarBolsa();
    pintarBolsa();
  }

  function pintarBolsa() {
    const n = unidades();
    $$("[data-contador]").forEach((e) => (e.textContent = n));
    $("#btn-bolsa").setAttribute("aria-label", `Bolsa, ${n} ${n === 1 ? "producto" : "productos"}`);
    $("#bolsa-titulo").textContent = `Tu bolsa (${n})`;
    const cuerpo = $("#bolsa-cuerpo");
    const pie = $("#bolsa-pie");

    if (!bolsa.length) {
      cuerpo.innerHTML = `<div class="bolsa-vacia"><h3>Tu bolsa está vacía</h3>
        <p>Agrega tus modelos favoritos y haz tu pedido en un par de pasos.</p>
        <a class="btn" href="#/categoria/todos" data-cerrar>Ver la selección</a></div>`;
      pie.hidden = true;
      return;
    }

    const sub = subtotal();
    const meta = T.envioGratisDesde;
    const progreso = meta > 0 ? `<div class="envio-progreso">
        ${sub >= meta ? "Tienes <b>envío gratis</b>." : `Te faltan <b>${precio(meta - sub)}</b> para el envío gratis.`}
        <div class="barra"><i style="width:${Math.min(100, (sub / meta) * 100)}%"></i></div></div>` : "";

    cuerpo.innerHTML = progreso + bolsa.map((i, n) => {
      const p = porId(i.id);
      return `<div class="item">
        <a class="mini" href="#/producto/${p.id}" data-cerrar tabindex="-1" aria-hidden="true">${imagen(p, { portada: true })}</a>
        <div>
          <h3><a href="#/producto/${p.id}" data-cerrar>${escapar(p.nombre)}</a></h3>
          <div class="meta">Talla ${tallaTxt(i.talla)}${p.color ? ` · ${escapar(p.color)}` : ""}</div>
          <div class="cantidad" role="group" aria-label="Cantidad de ${escapar(p.nombre)}">
            <button type="button" data-cant="-1" data-n="${n}" aria-label="Quitar uno">−</button>
            <span>${i.cantidad}</span>
            <button type="button" data-cant="1" data-n="${n}" aria-label="Agregar uno">+</button>
          </div>
        </div>
        <div><div class="precio">${precio(p.precio * i.cantidad)}${bsHTML(p.precio * i.cantidad)}</div><button type="button" class="quitar" data-quitar="${n}">Quitar</button></div>
      </div>`;
    }).join("");

    pie.hidden = false;
    $("#bolsa-subtotal").textContent = precio(sub);
    $("#bolsa-subtotal-bs").innerHTML = bsHTML(sub);
    $("#bolsa-envio").textContent = meta > 0 && sub >= meta ? "Gratis" : "Por confirmar";
    refrescarBs();
  }

  $("#bolsa-cuerpo").addEventListener("click", (e) => {
    const cant = e.target.closest("[data-cant]");
    const quitar = e.target.closest("[data-quitar]");
    if (cant) {
      const n = +cant.dataset.n;
      bolsa[n].cantidad += +cant.dataset.cant;
      const seQuita = bolsa[n].cantidad < 1;
      if (seQuita) bolsa.splice(n, 1);
      guardarBolsa();
      pintarBolsa();
      // Mantiene el foco en el mismo botón tras redibujar.
      const mismo = !seQuita && $(`#bolsa-cuerpo [data-n="${n}"][data-cant="${cant.dataset.cant}"]`);
      (mismo || $("#bolsa-titulo")).focus();
    } else if (quitar) {
      bolsa.splice(+quitar.dataset.quitar, 1);
      guardarBolsa();
      pintarBolsa();
      $("#bolsa-titulo").focus();
    }
  });

  $("#pedir").addEventListener("click", () => {
    const conBs = (usd) => (TasaBCV.valor ? `${precio(usd)} (${enBs(usd)})` : precio(usd));
    const lineas = bolsa.map((i) => {
      const p = porId(i.id);
      return `• ${p.nombre} — Talla ${tallaTxt(i.talla)} × ${i.cantidad} — ${conBs(p.precio * i.cantidad)}`;
    });
    const tasa = TasaBCV.valor ? `\n${textoTasa()}` : "";
    const texto = `Hola, quiero hacer este pedido en ${T.nombre}:\n\n${lineas.join("\n")}\n\nSubtotal: ${conBs(subtotal())}${tasa}\n\n¿Me confirmas disponibilidad y el costo de envío?`;
    window.open(enlaceWhatsApp(texto), "_blank", "noopener");
  });

  // ---------- Paneles (bolsa y menú) ----------
  let panelAbierto = null;
  let disparador = null;
  let tCierre = null;

  function abrirPanel(id) {
    if (panelAbierto) cerrarPanel(false);
    clearTimeout(tCierre);
    const panel = $("#" + id);
    const velo = $("#velo");
    disparador = document.activeElement;
    velo.hidden = false;
    panel.hidden = false;
    void panel.offsetWidth; // fuerza el estado inicial para que la transición se vea
    velo.classList.add("abierto");
    panel.classList.add("abierto");
    document.body.classList.add("bloqueado");
    $$(`[aria-controls="${id}"]`).forEach((b) => b.setAttribute("aria-expanded", "true"));
    panelAbierto = panel;
    (id === "bolsa" ? $("#bolsa-titulo") : $("[data-foco]", panel)).focus();
  }

  function cerrarPanel(devolverFoco = true) {
    if (!panelAbierto) return;
    const panel = panelAbierto;
    const velo = $("#velo");
    panel.classList.remove("abierto");
    velo.classList.remove("abierto");
    document.body.classList.remove("bloqueado");
    $$(`[aria-controls="${panel.id}"]`).forEach((b) => b.setAttribute("aria-expanded", "false"));
    tCierre = setTimeout(() => { panel.hidden = true; velo.hidden = true; }, 300);
    panelAbierto = null;
    if (devolverFoco && disparador && document.contains(disparador)) disparador.focus();
  }

  document.addEventListener("click", (e) => {
    const abrir = e.target.closest("[data-abrir]");
    if (abrir) { abrirPanel(abrir.dataset.abrir); return; }
    if (e.target.closest("[data-cerrar]")) cerrarPanel();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (panelAbierto) cerrarPanel();
      else if (!$("#buscador").hidden && document.activeElement === $("#q")) cerrarBuscador();
      else cerrarRapidos(true);
      return;
    }
    // Mantiene el foco dentro del panel abierto.
    if (e.key === "Tab" && panelAbierto) {
      const focos = $$("a[href], button:not([disabled]), [tabindex='0']", panelAbierto).filter((el) => el.offsetParent !== null && el.tabIndex >= 0);
      if (!focos.length) return;
      const primero = focos[0];
      const ultimo = focos[focos.length - 1];
      if (e.shiftKey && (document.activeElement === primero || !panelAbierto.contains(document.activeElement))) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    }
  });

  // ---------- Buscador ----------
  const estado = { cat: "todos", orden: "destacados", texto: "" };
  let saltoPendiente = true;

  function abrirBuscador() {
    $("#buscador").hidden = false;
    $("#btn-buscar").setAttribute("aria-expanded", "true");
    saltoPendiente = true;
    $("#q").focus();
  }
  function cerrarBuscador() {
    $("#buscador").hidden = true;
    $("#btn-buscar").setAttribute("aria-expanded", "false");
    $("#btn-buscar").focus();
  }
  $("#btn-buscar").addEventListener("click", () => ($("#buscador").hidden ? abrirBuscador() : cerrarBuscador()));
  $("#cerrar-buscar").addEventListener("click", cerrarBuscador);
  $("#q").addEventListener("input", (e) => {
    estado.texto = e.target.value.trim();
    if (vistaActual !== "catalogo") { location.hash = `#/categoria/${estado.cat}`; return; }
    pintarGrid();
    if (saltoPendiente) { saltoPendiente = false; irAlCatalogo(); }
  });
  $("#q").addEventListener("keydown", (e) => { if (e.key === "Enter") irAlCatalogo(); });

  // ---------- Vistas ----------
  let vistaActual = null;
  let fichaTalla = null;

  function filtrados() {
    const cat = porSlug(estado.cat);
    const q = estado.texto.toLowerCase();
    const lista = P.filter((p) => cat.incluye(p) && (!q || `${p.marca || ""} ${p.nombre} ${p.categoria} ${p.color || ""}`.toLowerCase().includes(q)));
    // Los productos sin precio quedan al final en ambos órdenes.
    const valor = (p, sinPrecio) => (conPrecio(p) ? p.precio : sinPrecio);
    const orden = {
      "precio-asc": (a, b) => valor(a, Infinity) - valor(b, Infinity) || 0,
      "precio-desc": (a, b) => valor(b, -Infinity) - valor(a, -Infinity) || 0,
      nombre: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
    }[estado.orden];
    return orden ? lista.sort(orden) : lista;
  }

  // Leyenda de la portada: nombre y precio del modelo que se está viendo.
  const leyendaHTML = (p) => `<b>${escapar(nombreCompleto(p))}</b>` +
    (conPrecio(p) ? `<span>${precio(p.precio)}${bsHTML(p.precio, "en-linea")}</span>` : "");

  function pintarCatalogo() {
    const v = T.portada;
    const elegidos = (v.rotacion || []).map(porId).filter(Boolean);
    const diapos = elegidos.length ? elegidos : P;
    const d = diapos[0];
    const rota = diapos.length > 1;
    // Solo la primera foto se pide al abrir; las demás, justo antes de mostrarse (ver iniciarCarrusel).
    const foto = (p, i) => (i && p.portada
      ? `<img data-src="${escapar(p.portada)}" alt="">`
      : imagen(p, { portada: true }).replace('loading="lazy"', 'fetchpriority="high"'));
    app.innerHTML = `
      <section class="wrap hero">
        <div>
          <div class="eyebrow">${escapar(v.etiqueta)}</div>
          <h1>${v.titulo}</h1>
          <p>${escapar(v.texto)}</p>
          <div class="ctas">
            <a class="btn" href="#/categoria/todos">Explorar colección</a>
            ${CATEGORIAS.some((c) => c.slug === "novedades") ? `<a class="link" href="#/categoria/novedades">Ver novedades</a>` : ""}
          </div>
        </div>
        <figure class="escaparate" ${rota ? `role="region" aria-roledescription="carrusel" aria-label="${escapar(v.etiqueta || "Modelos")}" style="--segundos:${v.segundos || 5}s"` : ""}>
          <div class="diapos">
            ${diapos.map((p, i) => `<a class="diapo${i ? "" : " activa"}" href="#/producto/${p.id}" data-id="${p.id}" aria-label="Ver ${escapar(nombreCompleto(p))}">${foto(p, i)}</a>`).join("")}
          </div>
          ${rota ? `<div class="controles">
            <button type="button" data-diapo="-1" aria-label="Modelo anterior">${ICONO.anterior}</button>
            <span class="contador" aria-hidden="true"><b>01</b> / ${String(diapos.length).padStart(2, "0")}</span>
            <button type="button" data-diapo="1" aria-label="Modelo siguiente">${ICONO.siguiente}</button>
            <button type="button" data-pausa aria-pressed="false" aria-label="Pausar la rotación">${ICONO.pausa}</button>
          </div>` : ""}
          <figcaption>
            ${rota ? `<span class="progreso" aria-hidden="true"><i></i></span>` : ""}
            <div class="leyenda">${leyendaHTML(d)}</div>
          </figcaption>
        </figure>
      </section>

      <section class="wrap seccion" id="catalogo" aria-labelledby="titulo-catalogo">
        <div class="seccion-cab">
          <h2 id="titulo-catalogo" tabindex="-1">La selección</h2>
          <div class="tabs" id="tabs" role="toolbar" aria-label="Filtrar por categoría">
            ${CATEGORIAS.map((c) => `<button type="button" class="tab" data-cat="${c.slug}" aria-pressed="false">${escapar(c.nombre)}<sup>${P.filter(c.incluye).length}</sup></button>`).join("")}
          </div>
        </div>
        <div class="barra-herramientas">
          <div class="resumen-wrap"><div id="resumen" aria-live="polite"></div><div class="tasa-nota" data-tasa>${textoTasa()}</div></div>
          <label class="ordenar"><span>Ordenar</span>
            <select id="orden">
              <option value="destacados">Destacados</option>
              ${P.some(conPrecio) ? `<option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>` : ""}
              <option value="nombre">Nombre</option>
            </select>
          </label>
        </div>
        <div class="grid" id="grid"></div>
      </section>

      <section class="wrap valores revelar" aria-label="Por qué comprar aquí">
        <div><b>01</b><h3>Revisados par por par</h3><p>Revisamos cada par antes de enviarlo para que llegue en perfecto estado.</p></div>
        <div><b>02</b><h3>Envío en 24–72 h</h3><p>Despachamos el mismo día si compras antes de las 14:00.</p></div>
        <div><b>03</b><h3>Pedidos por WhatsApp</h3><p>Te confirmamos disponibilidad, pago y entrega antes de despachar.</p></div>
      </section>`;
    $("#orden").value = estado.orden;
    pintarGrid();
    iniciarCarrusel();
  }

  // ---------- Portada que rota ----------
  // La barra de progreso es el reloj: al terminar su animación pasa al siguiente modelo. Por eso se
  // detiene sola al pausarla (ratón encima, foco con teclado, pestaña oculta o portada fuera de la
  // pantalla) y no rota si el dispositivo pide menos movimiento.
  const menosMovimiento = matchMedia("(prefers-reduced-motion: reduce)");
  let vigilaPortada = null;
  document.addEventListener("visibilitychange", () => $(".escaparate", app)?.classList.toggle("oculta", document.hidden));

  function iniciarCarrusel() {
    vigilaPortada?.disconnect();
    const fig = $(".escaparate[aria-roledescription]", app);
    if (!fig) return;
    const diapos = $$(".diapo", fig);
    const barra = $(".progreso i", fig);
    const btnPausa = $("[data-pausa]", fig);
    let actual = 0;
    let pausada = menosMovimiento.matches;
    btnPausa.hidden = menosMovimiento.matches;

    const cargar = (n) => {
      const img = $("img[data-src]", diapos[n]);
      if (img) { img.src = img.dataset.src; img.removeAttribute("data-src"); }
    };
    const correr = () => {
      barra.classList.remove("corre");
      if (pausada) return;
      void barra.offsetWidth; // reinicia la animación
      barra.classList.add("corre");
    };
    function mostrar(n) {
      actual = (n + diapos.length) % diapos.length;
      cargar(actual);
      diapos.forEach((a, i) => a.classList.toggle("activa", i === actual));
      $(".leyenda", fig).innerHTML = leyendaHTML(porId(diapos[actual].dataset.id));
      $(".contador b", fig).textContent = String(actual + 1).padStart(2, "0");
      cargar((actual + 1) % diapos.length); // la siguiente queda lista
      correr();
    }
    let encima = false;
    const retener = (conFoco = true) => fig.classList.toggle("retenida", encima || (conFoco && !!$(":focus-visible", fig)));

    barra.addEventListener("animationend", () => mostrar(actual + 1));
    fig.addEventListener("click", (e) => {
      const paso = e.target.closest("[data-diapo]");
      if (paso) mostrar(actual + Number(paso.dataset.diapo));
    });
    btnPausa.addEventListener("click", () => {
      pausada = !pausada;
      btnPausa.setAttribute("aria-pressed", String(pausada));
      btnPausa.setAttribute("aria-label", pausada ? "Reanudar la rotación" : "Pausar la rotación");
      btnPausa.innerHTML = pausada ? ICONO.seguir : ICONO.pausa;
      correr();
    });
    fig.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      mostrar(actual + (e.key === "ArrowRight" ? 1 : -1));
      if (e.target.classList.contains("diapo")) diapos[actual].focus(); // el foco sigue a la foto visible
    });
    fig.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { encima = true; retener(); } });
    fig.addEventListener("pointerleave", () => { encima = false; retener(); });
    fig.addEventListener("focusin", () => retener());
    fig.addEventListener("focusout", (e) => { if (!fig.contains(e.relatedTarget)) retener(false); });

    // Deslizar con el dedo para cambiar de modelo, sin abrir el que se estaba viendo.
    let x0 = null;
    let deslizo = false;
    const zona = $(".diapos", fig);
    zona.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") x0 = e.clientX; });
    zona.addEventListener("pointercancel", () => (x0 = null));
    zona.addEventListener("pointerup", (e) => {
      if (x0 == null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) < 40) return;
      deslizo = true;
      setTimeout(() => (deslizo = false), 400);
      mostrar(actual + (dx < 0 ? 1 : -1));
    });
    zona.addEventListener("click", (e) => { if (deslizo) e.preventDefault(); }, true);

    if ("IntersectionObserver" in window) {
      vigilaPortada = new IntersectionObserver(([en]) => fig.classList.toggle("fuera", !en.isIntersecting));
      vigilaPortada.observe(fig);
    }
    fig.classList.toggle("oculta", document.hidden);
    mostrar(0);
  }

  function pintarGrid() {
    const grid = $("#grid");
    if (!grid) return;
    $$("#tabs .tab").forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.cat === estado.cat)));
    const lista = filtrados();
    // Cada talla disponible de un modelo es un par (una caja).
    const pares = lista.reduce((n, p) => n + tallasDe(p).filter((t) => !agotada(p, t)).length, 0);
    $("#resumen").innerHTML = `${lista.length} ${lista.length === 1 ? "modelo" : "modelos"}` +
      (pares ? ` · ${pares} ${pares === 1 ? "par" : "pares"}` : "") +
      (estado.texto ? `<span class="filtro-texto">“${escapar(estado.texto)}”<button type="button" data-limpiar-texto aria-label="Quitar búsqueda">${ICONO.x}</button></span>` : "");
    grid.innerHTML = lista.length ? lista.map(tarjeta).join("") : `
      <div class="vacio">
        <h3>Sin resultados</h3>
        <p>No encontramos modelos${estado.texto ? ` para “${escapar(estado.texto)}”` : ""} en ${escapar(porSlug(estado.cat).nombre.toLowerCase())}.</p>
        <button type="button" class="btn secundario" data-limpiar>Ver todos los modelos</button>
      </div>`;
    document.title = estado.cat === "todos" ? `${T.nombre} — ${T.lema}` : `${porSlug(estado.cat).nombre} — ${T.nombre}`;
    observar();
  }

  function pintarProducto(p) {
    fichaTalla = null;
    document.title = `${p.nombre} — ${T.nombre}`;
    const cat = porSlug(aSlug(p.categoria));
    const ahorro = p.precioAntes ? Math.round((1 - p.precio / p.precioAntes) * 100) : 0;
    const tallas = tallasDe(p);
    const hayStock = tallas.some((t) => !agotada(p, t));
    const comprable = vendible(p);
    const relacionados = [
      ...P.filter((x) => x.id !== p.id && x.categoria === p.categoria),
      ...P.filter((x) => x.id !== p.id && x.categoria !== p.categoria),
    ].slice(0, 4);
    const envio = T.envioGratisDesde > 0 ? `Envío gratis desde ${precio(T.envioGratisDesde)} · llega en 24–72 h` : "Envío a todo el país · llega en 24–72 h";

    app.innerHTML = `
      <div class="wrap">
        <nav class="migas" aria-label="Ruta">
          <a href="#/">Inicio</a><span aria-hidden="true">/</span>
          <a href="#/categoria/${cat.slug}">${escapar(p.categoria)}</a><span aria-hidden="true">/</span>
          <span aria-current="page">${escapar(p.nombre)}</span>
        </nav>
        <div class="ficha">
          <div class="galeria">
            <div class="miniaturas" role="group" aria-label="Vistas del producto">
              ${vistas(p).map((v, i) => `<button type="button" class="miniatura" data-vista="${v}" aria-pressed="${i === 0}" aria-label="${nombreVista(p, i)}">${imagen(p, { vista: v })}</button>`).join("")}
            </div>
            <div class="vista-principal" id="vista-principal">${imagen(p, { decorativa: false })}</div>
          </div>

          <div class="ficha-info">
            <div class="eyebrow">${marcaYCategoria(p)}${p.etiqueta ? ` · ${escapar(p.etiqueta)}` : ""}</div>
            <h1 tabindex="-1">${escapar(p.nombre)}</h1>
            ${conPrecio(p) ? `
            <div class="ficha-precio">${precio(p.precio)}${p.precioAntes ? `<s>${precio(p.precioAntes)}</s><span class="ahorro">Ahorras ${ahorro}%</span>` : ""}</div>
            <div class="ficha-bs">${bsHTML(p.precio)}</div>
            <div class="tasa-nota" data-tasa>${textoTasa()}</div>` : `
            <div class="ficha-precio"><span class="consultar">Precio a consultar</span></div>
            <div class="tasa-nota">Escríbenos por WhatsApp y te lo damos en dólares o bolívares.</div>`}
            <p class="ficha-desc">${escapar(p.descripcion)}</p>

            ${tallas.length ? `<div class="campo" id="campo-talla">
              <div class="campo-cab" id="etq-talla">Talla (${T.sistemaTallas}) <span id="talla-elegida">${hayStock ? "Elige una" : "Agotado"}</span></div>
              <div class="tallas" role="group" aria-labelledby="etq-talla" aria-describedby="error-talla">${tallasHTML(p)}</div>
              <p class="error" id="error-talla" hidden>Elige una talla para continuar.</p>
            </div>` : `<p class="campo campo-nota">Tallas: consulta la disponibilidad por WhatsApp.</p>`}

            <div class="ficha-acciones">
              ${comprable ? `<button type="button" class="btn ancho" id="agregar">${ICONO.bolsa}Añadir a la bolsa</button>` : ""}
              <a class="btn ${comprable ? "secundario " : ""}ancho" id="preguntar" href="${enlaceWhatsApp(mensajeConsulta(p))}" target="_blank" rel="noopener">${ICONO.chat}${conPrecio(p) ? "Preguntar por WhatsApp" : "Consultar precio por WhatsApp"}</a>
            </div>

            <ul class="beneficios">
              <li>${ICONO.camion}${envio}</li>
              <li>${ICONO.chat}Pedido, pago y entrega coordinados por WhatsApp</li>
              <li>${ICONO.escudo}Revisado antes del envío y entregado en su caja</li>
            </ul>

            <div class="acordeon">
              <details open><summary>Detalles</summary><div class="contenido">
                ${p.color ? `<p>Color: ${escapar(p.color)}</p>` : ""}
                <ul>${(p.detalles || []).map((d) => `<li>${escapar(d)}</li>`).join("")}</ul>
              </div></details>
              <details><summary>Envío</summary><div class="contenido">
                <p>Enviamos a todo el país en 24–72 h hábiles. Te confirmamos el costo del envío por WhatsApp al hacer tu pedido.</p>
              </div></details>
            </div>
          </div>
        </div>
      </div>

      ${relacionados.length ? `<section class="wrap relacionados" aria-labelledby="titulo-rel">
        <h2 id="titulo-rel">También te puede gustar</h2>
        <div class="grid">${relacionados.map(tarjeta).join("")}</div>
      </section>` : ""}`;
    observar();
  }

  function productoNoEncontrado() {
    document.title = `No encontrado — ${T.nombre}`;
    app.innerHTML = `<div class="wrap vacio" style="padding-block:120px">
      <h1 tabindex="-1" style="font-family:var(--display);font-weight:500;font-size:44px">Este modelo ya no está disponible</h1>
      <p>Puede que lo hayamos retirado del catálogo. Mira lo que tenemos ahora.</p>
      <a class="btn" href="#/categoria/todos">Ver la selección</a></div>`;
  }

  // Clics dentro del contenido principal.
  app.addEventListener("click", (e) => {
    const t = e.target;
    const tab = t.closest(".tab");
    if (tab) {
      estado.cat = tab.dataset.cat;
      history.replaceState(null, "", estado.cat === "todos" ? "#/" : `#/categoria/${estado.cat}`);
      pintarGrid();
      marcarNav();
      return;
    }
    if (t.closest("[data-limpiar-texto]")) { limpiarTexto(); $("#titulo-catalogo").focus({ preventScroll: true }); return; }
    if (t.closest("[data-limpiar]")) {
      limpiarTexto();
      estado.cat = "todos";
      history.replaceState(null, "", "#/");
      pintarGrid();
      marcarNav();
      $("#titulo-catalogo").focus({ preventScroll: true });
      return;
    }

    // Añadir rápido desde la tarjeta.
    const tarjetaEl = t.closest(".producto");
    if (t.closest("[data-rapido]")) { abrirRapido(tarjetaEl); return; }
    if (t.closest("[data-rapido-cerrar]")) { cerrarRapido(tarjetaEl, true); return; }
    const tallaRapida = t.closest(".rapido .talla");
    if (tallaRapida) {
      agregar(tarjetaEl.dataset.id, +tallaRapida.dataset.talla);
      cerrarRapido(tarjetaEl, false);
      abrirPanel("bolsa");
      return;
    }

    // Ficha de producto.
    const mini = t.closest(".miniatura");
    if (mini) {
      const p = porId(ruta().id);
      $$(".miniatura").forEach((m) => m.setAttribute("aria-pressed", String(m === mini)));
      $("#vista-principal").innerHTML = imagen(p, { vista: +mini.dataset.vista, decorativa: false });
      return;
    }
    const talla = t.closest("#campo-talla .talla");
    if (talla) {
      fichaTalla = +talla.dataset.talla;
      $$("#campo-talla .talla").forEach((b) => b.setAttribute("aria-pressed", String(b === talla)));
      $("#talla-elegida").textContent = tallaTxt(fichaTalla);
      $("#preguntar").href = enlaceWhatsApp(mensajeConsulta(porId(ruta().id), fichaTalla));
      $("#campo-talla").classList.remove("con-error");
      $("#error-talla").hidden = true;
      return;
    }
    if (t.closest("#agregar")) {
      if (fichaTalla == null) {
        $("#campo-talla").classList.add("con-error");
        $("#error-talla").hidden = false;
        $("#campo-talla .talla:not(:disabled)")?.focus();
        return;
      }
      agregar(ruta().id, fichaTalla);
      abrirPanel("bolsa");
    }
  });

  app.addEventListener("change", (e) => {
    if (e.target.id === "orden") { estado.orden = e.target.value; pintarGrid(); }
  });

  // Cierra el selector rápido al salir de la tarjeta con el ratón.
  app.addEventListener("mouseleave", (e) => {
    if (e.target.classList?.contains("producto")) cerrarRapido(e.target, false);
  }, true);

  function abrirRapido(card) {
    cerrarRapidos(false);
    $(".rapido", card).hidden = false;
    $("[data-rapido]", card).hidden = true;
    $("[data-rapido]", card).setAttribute("aria-expanded", "true");
    $(".rapido .talla:not(:disabled)", card)?.focus();
  }
  function cerrarRapido(card, devolverFoco) {
    const panel = card && $(".rapido", card);
    if (!panel || panel.hidden) return;
    const vuelveFoco = devolverFoco || card.contains(document.activeElement);
    panel.hidden = true;
    const btn = $("[data-rapido]", card);
    btn.hidden = false;
    btn.setAttribute("aria-expanded", "false");
    if (vuelveFoco) btn.focus();
  }
  function cerrarRapidos(devolverFoco) { $$(".producto").forEach((c) => cerrarRapido(c, devolverFoco && c.contains(document.activeElement))); }

  function limpiarTexto() {
    estado.texto = "";
    $("#q").value = "";
    pintarGrid();
  }

  function irAlCatalogo() {
    const cat = $("#catalogo");
    if (cat && cat.getBoundingClientRect().top > 160) cat.scrollIntoView({ block: "start" });
  }

  // ---------- Navegación ----------
  function ruta() {
    const [tipo, valor] = location.hash.replace(/^#\/?/, "").split("/");
    if (tipo === "producto") return { vista: "producto", id: valor };
    if (tipo === "categoria" && CATEGORIAS.some((c) => c.slug === valor)) return { vista: "catalogo", cat: valor };
    return { vista: "catalogo", cat: "todos" };
  }

  function marcarNav() {
    const actual = vistaActual === "catalogo" ? estado.cat : null;
    $$("#links a, #menu-links a, #pie-links a").forEach((a) => {
      if (a.dataset.cat === actual) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function render(inicial = false) {
    const r = ruta();
    if (panelAbierto) cerrarPanel(false);

    if (r.vista === "producto") {
      const p = porId(r.id);
      vistaActual = "producto";
      p ? pintarProducto(p) : productoNoEncontrado();
      marcarNav();
      window.scrollTo({ top: 0, behavior: "instant" });
      $("h1", app)?.focus({ preventScroll: true });
      return;
    }

    const venia = vistaActual;
    estado.cat = r.cat;
    if (venia !== "catalogo") pintarCatalogo(); else pintarGrid();
    vistaActual = "catalogo";
    marcarNav();

    const conCategoria = /^#\/categoria\//.test(location.hash);
    if (conCategoria) {
      const ir = (behavior) => $("#catalogo")?.scrollIntoView({ block: "start", behavior });
      ir(inicial || venia !== "catalogo" ? "instant" : "smooth");
      // Al abrir un enlace directo, las fuentes cambian la altura de la portada: se vuelve a ajustar.
      if (inicial && document.fonts) document.fonts.ready.then(() => ir("instant"));
      if (!inicial) $("#titulo-catalogo").focus({ preventScroll: true });
    } else if (!inicial) {
      window.scrollTo({ top: 0, behavior: venia === "catalogo" ? "smooth" : "instant" });
    }
  }

  // Aparición sutil al hacer scroll.
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((entradas) => entradas.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
      }), { rootMargin: "0px 0px -8% 0px" })
    : null;
  function observar() { $$(".revelar:not(.visible)").forEach((el) => (io ? io.observe(el) : el.classList.add("visible"))); }

  // ---------- Inicio ----------
  $$("[data-nombre]").forEach((e) => (e.textContent = T.nombre));
  $("#aviso").textContent = T.aviso;
  $("#aviso").hidden = !T.aviso;
  $("#anio").textContent = new Date().getFullYear();
  $("#pie-descripcion").textContent = T.descripcion;
  $("#pie-contacto").href = enlaceWhatsApp(`Hola, tengo una consulta sobre ${T.nombre}.`);
  $("#wa-flotante").href = enlaceWhatsApp(`Hola, tengo una consulta sobre ${T.nombre}.`);
  TasaBCV.alCambiar(refrescarBs);
  TasaBCV.iniciar();

  const enlaces = CATEGORIAS.filter((c) => c.slug !== "todos")
    .map((c) => `<a href="#/categoria/${c.slug}" data-cat="${c.slug}" data-cerrar>${escapar(c.nombre)}</a>`);
  $("#links").innerHTML = enlaces.join("");
  $("#menu-links").innerHTML = enlaces.join("");
  $("#pie-links").innerHTML = enlaces.map((a) => `<li>${a}</li>`).join("");

  window.addEventListener("hashchange", () => render());
  pintarBolsa();
  render(true);
  refrescarBs(); // muestra la tasa guardada de la visita anterior mientras llega la nueva
})();
