// Propuestas de logo para VB-Imports. Cada propuesta dibuja su versión completa (símbolo + nombre)
// y su ícono solo, en tema claro u oscuro.
(function () {
  const TEMAS = {
    claro: { fg: "#1C1917", fg2: "#44403C", suave: "#78716C", oro: "#A16207", fondo: "#FAFAF9" },
    oscuro: { fg: "#FAFAF9", fg2: "#D6D3D1", suave: "#A8A29E", oro: "#D4A72C", fondo: "#1C1917" },
  };
  const SERIF = "Cormorant, Georgia, serif";
  const SANS = "Montserrat, Arial, sans-serif";
  let uid = 0;

  // ---------- Letras geométricas (V y B) ----------
  // V con fondo plano: x, y = esquina superior izquierda; w, h = tamaño; t = grosor.
  function letraV(x, y, w, h, t, color) {
    const tw = t * 1.2;
    const cx = x + w / 2;
    // Altura donde se cruzan los bordes interiores de los dos brazos.
    const yi =y + Math.max(0, Math.min(1, (cx - (x + tw)) / ((cx + tw / 2) - (x + tw)))) * h;
    return `<polygon fill="${color}" points="${x},${y} ${x + tw},${y} ${cx},${yi} ${x + w - tw},${y} ${x + w},${y} ${cx + tw / 2},${y + h} ${cx - tw / 2},${y + h}"/>`;
  }
  // B: x = borde izquierdo del asta, ancho = ancho total aproximado.
  // colorAsta permite pintar el asta de otro color (para la ligadura).
  function letraB(x, y, ancho, h, t, color, colorAsta = color) {
    const yt = y + t / 2, ym = y + h * 0.47, yb = y + h - t / 2;
    const r1 = (ym - yt) / 2, r2 = (yb - ym) / 2;
    const x1 = x + ancho - t / 2 - r1 - ancho * 0.06;
    const x2 = x + ancho - t / 2 - r2;
    // Con el mismo color, las curvas se montan sobre el asta para que no quede una línea entre ambas.
    const x0 = colorAsta === color ? x + t / 2 : x + t;
    return `<rect x="${x}" y="${y}" width="${t}" height="${h}" fill="${colorAsta}"/>
      <path d="M${x0} ${yt} H${x1} A${r1} ${r1} 0 0 1 ${x1} ${ym} H${x0} M${x0} ${ym} H${x2} A${r2} ${r2} 0 0 1 ${x2} ${yb} H${x0}"
        fill="none" stroke="${color}" stroke-width="${t}"/>`;
  }

  // ---------- Propuestas ----------
  const PROPUESTAS = [
    {
      id: "clasico",
      nombre: "Clásico",
      idea: "Monograma con la misma serif de tu tienda, una línea dorada y el nombre en mayúsculas espaciadas. Elegante y sobrio, transmite marca premium.",
      usos: "Web, etiquetas colgantes, bolsas de papel",
      completo: (c) => `<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="VB-Imports">
        <text x="2" y="90" font-family="${SERIF}" font-weight="600" font-size="104" letter-spacing="-4" fill="${c.fg}">VB</text>
        <rect x="140" y="26" width="1.5" height="70" fill="${c.oro}"/>
        <text x="160" y="60" font-family="${SANS}" font-weight="600" font-size="22" letter-spacing="7" fill="${c.fg}">IMPORTS</text>
        <text x="161" y="84" font-family="${SANS}" font-weight="500" font-size="10.5" letter-spacing="3.6" fill="${c.oro}">CIUDAD OJEDA</text>
      </svg>`,
      icono: (c) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill="${c.fg}"/>
        <text x="50" y="66" text-anchor="middle" font-family="${SERIF}" font-weight="600" font-size="56" letter-spacing="-2" fill="${c.fondo}">VB</text>
        <rect x="34" y="76" width="32" height="2.5" fill="${c.oro}"/>
      </svg>`,
    },
    {
      id: "ligadura",
      nombre: "Ligadura",
      idea: "La V y la B comparten el mismo trazo: el brazo dorado de la V se apoya en el asta de la B. Moderno, único y se reconoce incluso a 16 px.",
      usos: "Ícono de la web, foto de perfil, app, sellos de caja",
      completo: (c) => `<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="VB-Imports">
        <g transform="translate(6 10)">${ligadura(c)}</g>
        <text x="128" y="62" font-family="${SANS}" font-weight="700" font-size="30" letter-spacing="1.5" fill="${c.fg}">VB-IMPORTS</text>
        <text x="129" y="86" font-family="${SANS}" font-weight="500" font-size="10.5" letter-spacing="3.4" fill="${c.suave}">CIUDAD OJEDA · ZULIA</text>
      </svg>`,
      icono: (c) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${ligadura(c)}</svg>`,
    },
    {
      id: "sello",
      nombre: "Sello",
      idea: "Un sello circular como los de aduana, con la ubicación en el borde. Cuenta la historia de importación y luce muy bien en stickers y empaques.",
      usos: "Stickers, cajas, bolsas, redes sociales",
      completo: (c) => sello(c),
      icono: (c) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="none" stroke="${c.fg}" stroke-width="5"/>
        <circle cx="50" cy="50" r="37" fill="none" stroke="${c.oro}" stroke-width="2"/>
        <text x="50" y="63" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="40" letter-spacing="-1" fill="${c.fg}">VB</text>
      </svg>`,
    },
    {
      id: "caja",
      nombre: "Caja",
      idea: "Una caja en perspectiva con su cinta dorada: el paquete que llega importado. Es directo y funciona con cualquier producto que vendas.",
      usos: "E-commerce, etiquetas de envío, facturas",
      completo: (c) => `<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="VB-Imports">
        <g transform="translate(4 12) scale(.96)">${caja(c)}</g>
        <text x="118" y="64" font-family="${SANS}" font-weight="700" font-size="44" letter-spacing="1" fill="${c.fg}">VB</text>
        <text x="199" y="64" font-family="${SANS}" font-weight="500" font-size="20" letter-spacing="5" fill="${c.fg}">IMPORTS</text>
        <rect x="120" y="78" width="210" height="2" fill="${c.oro}"/>
        <text x="120" y="98" font-family="${SANS}" font-weight="500" font-size="10" letter-spacing="3.3" fill="${c.suave}">DEL MUNDO A LA COL</text>
      </svg>`,
      icono: (c) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${caja(c)}</svg>`,
    },
    {
      id: "ruta",
      nombre: "Ruta",
      idea: "Las letras VB con una ruta punteada que viaja y aterriza en la B: lo que compras afuera llega a Ciudad Ojeda. Dinámico y fácil de entender.",
      usos: "Publicidad, redes sociales, avisos de envío",
      completo: (c) => `<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="VB-Imports">
        <g transform="translate(0 8)">${ruta(c)}</g>
        <text x="136" y="64" font-family="${SANS}" font-weight="700" font-size="28" letter-spacing="2" fill="${c.fg}">VB-IMPORTS</text>
        <text x="137" y="88" font-family="${SANS}" font-weight="500" font-size="10.5" letter-spacing="3.2" fill="${c.oro}">IMPORTADO PARA TI</text>
      </svg>`,
      icono: (c) => `<svg viewBox="0 0 120 108" xmlns="http://www.w3.org/2000/svg">${ruta(c)}</svg>`,
    },
    {
      id: "sol-lago",
      nombre: "Sol del Lago",
      idea: "El sol zuliano saliendo sobre las olas del Lago de Maracaibo. Le da a la marca identidad local y orgullo regional, sin atarla a un solo producto.",
      usos: "Marca local, redes, empaques, uniformes",
      completo: (c) => `<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="VB-Imports">
        <g transform="translate(6 12) scale(.96)">${solLago(c)}</g>
        <text x="118" y="70" font-family="${SERIF}" font-weight="600" font-size="50" letter-spacing="-.5" fill="${c.fg}">VB-Imports</text>
        <text x="121" y="94" font-family="${SANS}" font-weight="500" font-size="10.5" letter-spacing="3.6" fill="${c.oro}">CIUDAD OJEDA · ZULIA</text>
      </svg>`,
      icono: (c) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${solLago(c)}</svg>`,
    },
  ];

  // ---------- Símbolos ----------
  function ligadura(c) {
    // La V dorada (brazo + asta) comparte su trazo derecho con la B, cuyas curvas van en tinta.
    const brazo = `<polygon fill="${c.oro}" points="10,16 24,16 58,84 45,84"/>`;
    return `<g>${brazo}${letraB(45, 16, 46, 68, 13, c.fg, c.oro)}</g>`;
  }

  function sello(c) {
    const id = `arco-${++uid}`;
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="VB-Imports">
      <defs><path id="${id}" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0"/></defs>
      <circle cx="100" cy="100" r="95" fill="none" stroke="${c.fg}" stroke-width="3"/>
      <circle cx="100" cy="100" r="88" fill="none" stroke="${c.fg}" stroke-width="1"/>
      <circle cx="100" cy="100" r="60" fill="none" stroke="${c.oro}" stroke-width="1.5"/>
      <text font-family="${SANS}" font-weight="600" font-size="12.5" letter-spacing="2" fill="${c.fg}">
        <textPath href="#${id}" textLength="462" lengthAdjust="spacing">VB-IMPORTS ✦ CIUDAD OJEDA ✦ ZULIA ✦ VENEZUELA ✦</textPath>
      </text>
      <text x="100" y="112" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="58" letter-spacing="-1" fill="${c.fg}">VB</text>
      <text x="100" y="134" text-anchor="middle" font-family="${SANS}" font-weight="600" font-size="8.5" letter-spacing="2.6" fill="${c.oro}">DESDE 2026</text>
    </svg>`;
  }

  function caja(c) {
    const tapa = c === TEMAS.oscuro ? "#E7E5E4" : "#78716C";
    const izq = c === TEMAS.oscuro ? "#A8A29E" : c.fg;
    const der = c === TEMAS.oscuro ? "#D6D3D1" : c.fg2;
    return `<g stroke-linejoin="round">
      <polygon points="50,8 90,29 50,50 10,29" fill="${tapa}"/>
      <polygon points="10,29 50,50 50,94 10,73" fill="${izq}"/>
      <polygon points="50,50 90,29 90,73 50,94" fill="${der}"/>
      <polygon points="25.5,20.86 34.5,16.14 74.5,37.14 65.5,41.86" fill="${c.oro}"/>
      <polygon points="65.5,41.86 74.5,37.14 74.5,81.14 65.5,85.86" fill="${c === TEMAS.oscuro ? "#B8901F" : "#854D0E"}"/>
    </g>`;
  }

  function ruta(c) {
    return `<g>
      <path d="M8 40 Q 52 -10 98 26" fill="none" stroke="${c.oro}" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="1 7"/>
      <polygon points="104,30 92,30 100,20" fill="${c.oro}" transform="rotate(28 100 27)"/>
      ${letraV(4, 44, 54, 56, 12, c.fg)}
      ${letraB(62, 44, 44, 56, 12, c.fg)}
    </g>`;
  }

  function solLago(c) {
    const id = `marco-${++uid}`;
    return `<g>
      <defs><clipPath id="${id}"><circle cx="50" cy="50" r="44"/></clipPath></defs>
      <g clip-path="url(#${id})">
        <path d="M22 58 A28 28 0 0 1 78 58 Z" fill="${c.oro}"/>
        <g stroke="${c.oro}" stroke-width="3.5" stroke-linecap="round">
          <line x1="50" y1="14" x2="50" y2="22"/><line x1="26" y1="24" x2="31" y2="30"/><line x1="74" y1="24" x2="69" y2="30"/>
          <line x1="14" y1="44" x2="21" y2="46"/><line x1="86" y1="44" x2="79" y2="46"/>
        </g>
        <g fill="none" stroke="${c.fg}" stroke-width="4.5" stroke-linecap="round">
          <path d="M6 66 q 8.5 -6 17 0 t 17 0 t 17 0 t 17 0 t 17 0 t 17 0"/>
          <path d="M14 77 q 8.5 -6 17 0 t 17 0 t 17 0 t 17 0"/>
          <path d="M26 88 q 8.5 -6 17 0 t 17 0 t 17 0"/>
        </g>
      </g>
      <circle cx="50" cy="50" r="46" fill="none" stroke="${c.fg}" stroke-width="4"/>
    </g>`;
  }

  window.LOGOS = { TEMAS, PROPUESTAS };
})();
