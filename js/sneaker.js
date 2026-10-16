// Ilustración SVG de una zapatilla, recoloreable por producto.
// Se usa como imagen provisional hasta tener fotos reales.
(function () {
  const SILUETAS = {
    bajo: {
      upper: "M46 148 C36 120 38 90 52 72 C70 66 100 70 118 80 C130 60 150 48 172 46 L182 56 C220 80 270 105 320 118 C350 124 372 134 374 148 Z",
      collar: "M52 72 C70 66 100 70 118 80 C130 60 150 48 172 46",
      lengua: "M160 50 C165 40 178 36 188 40 L190 58 L172 50 Z",
      talon: "M44 80 C40 92 40 108 44 120 L56 118 C52 106 52 94 56 82 Z",
      cordones: [[195, 66], [215, 77], [235, 88], [255, 98], [275, 107]],
    },
    alto: {
      upper: "M46 148 C34 115 36 70 48 34 C70 28 100 30 122 40 C132 30 150 22 170 22 L182 34 C200 70 260 105 320 118 C350 124 372 134 374 148 Z",
      collar: "M48 34 C70 28 100 30 122 40 C132 30 150 22 170 22",
      lengua: "M158 24 C162 12 178 8 190 14 L190 36 L172 26 Z",
      talon: "M42 42 C38 62 38 90 42 112 L54 110 C50 88 50 66 54 46 Z",
      cordones: [[190, 50], [206, 66], [224, 80], [243, 92], [263, 102], [283, 110]],
    },
  };

  function sombrear(hex, cantidad) {
    const n = parseInt(hex.slice(1), 16);
    const c = (v) => Math.max(0, Math.min(255, Math.round(v * (1 - cantidad))));
    return "#" + [n >> 16, (n >> 8) & 255, n & 255].map((v) => c(v).toString(16).padStart(2, "0")).join("");
  }

  window.sneakerSVG = function (p, opciones = {}) {
    const s = SILUETAS[p.alto ? "alto" : "bajo"];
    const c = p.colores;
    const sombra = opciones.sombra !== false;
    const cordones = s.cordones
      .map(([x, y]) => `<line x1="${x - 7}" y1="${y + 8}" x2="${x + 9}" y2="${y - 7}" />`)
      .join("");
    return `<svg viewBox="0 0 410 200" xmlns="http://www.w3.org/2000/svg" ${opciones.decorativa ? `aria-hidden="true" focusable="false"` : `role="img" aria-label="${p.nombre}"`}>
      ${sombra ? `<ellipse cx="208" cy="188" rx="170" ry="7" fill="rgba(0,0,0,.14)"/>` : ""}
      <path d="M54 172 L366 170 C376 170 376 179 364 180 L58 180 C44 180 44 172 54 172 Z" fill="${c.suela}"/>
      <path d="M38 140 C120 144 260 146 376 146 C386 152 382 168 366 170 L54 172 C36 172 32 156 38 140 Z" fill="${c.media}"/>
      <path d="M50 160 C150 162 280 162 370 160" stroke="${sombrear(c.media, 0.12)}" stroke-width="2" fill="none"/>
      <path d="${s.upper}" fill="${c.upper}"/>
      <path d="${s.lengua}" fill="${sombrear(c.upper, 0.08)}"/>
      <path d="M300 118 C340 124 370 134 374 148 L300 148 C294 136 294 126 300 118 Z" fill="${c.panel}"/>
      <path d="M112 142 C170 118 240 104 306 122 L298 136 C240 122 186 128 126 148 Z" fill="${c.acento}"/>
      <path d="${s.talon}" fill="${c.acento}"/>
      <path d="${s.collar}" stroke="${sombrear(c.upper, 0.22)}" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M52 138 C150 140 280 140 366 142" stroke="${sombrear(c.upper, 0.18)}" stroke-width="1.5" stroke-dasharray="4 5" fill="none"/>
      <g stroke="${c.cordones}" stroke-width="5" stroke-linecap="round">${cordones}</g>
    </svg>`;
  };
})();
