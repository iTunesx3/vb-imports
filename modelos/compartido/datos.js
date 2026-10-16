// Productos de ejemplo. Los nombres son provisionales: reemplázalos por tus modelos reales.
window.PRODUCTOS = [
  {
    id: "velox-runner", nombre: "Velox Runner", categoria: "Running", precio: 129, etiqueta: "Nuevo",
    fondo: "#ffe7dc",
    colores: { upper: "#f4f4f2", panel: "#e4e4e0", acento: "#ff5a1f", media: "#ffffff", suela: "#2b2b2b", cordones: "#d9d9d4" },
  },
  {
    id: "court-classic-85", nombre: "Court Classic 85", categoria: "Lifestyle", precio: 99,
    fondo: "#e3f1e8",
    colores: { upper: "#fbfaf6", panel: "#f0eee6", acento: "#1f7a4d", media: "#f3ecdc", suela: "#c9b48a", cordones: "#ffffff" },
  },
  {
    id: "skyline-hi", nombre: "Skyline Hi", categoria: "Basketball", precio: 159, etiqueta: "Edición limitada", alto: true,
    fondo: "#fde2e4",
    colores: { upper: "#1b1b1f", panel: "#2e2e36", acento: "#e63946", media: "#ffffff", suela: "#e63946", cordones: "#3a3a42" },
  },
  {
    id: "aero-knit", nombre: "Aero Knit", categoria: "Running", precio: 119, precioAntes: 149, etiqueta: "-20%",
    fondo: "#e2e8ff",
    colores: { upper: "#6c8cff", panel: "#5a78e6", acento: "#d4ff3a", media: "#ffffff", suela: "#1e1e1e", cordones: "#ffffff" },
  },
  {
    id: "metro-suede", nombre: "Metro Suede", categoria: "Lifestyle", precio: 109,
    fondo: "#f3e6d6",
    colores: { upper: "#c8a27a", panel: "#b48a60", acento: "#3b2a1a", media: "#f2e8d5", suela: "#6b4f2e", cordones: "#f2e8d5" },
  },
  {
    id: "block-hi", nombre: "Block Hi", categoria: "Basketball", precio: 139, alto: true,
    fondo: "#dde9fb",
    colores: { upper: "#f4f4f2", panel: "#2a6fdb", acento: "#2a6fdb", media: "#ffffff", suela: "#2a6fdb", cordones: "#ffffff" },
  },
  {
    id: "trail-pulse", nombre: "Trail Pulse", categoria: "Trail", precio: 149, etiqueta: "Nuevo",
    fondo: "#e6eadf",
    colores: { upper: "#3d4a3a", panel: "#2c3529", acento: "#ff9f1c", media: "#d9d4c7", suela: "#1d1d1d", cordones: "#ff9f1c" },
  },
  {
    id: "pastel-glide", nombre: "Pastel Glide", categoria: "Lifestyle", precio: 115,
    fondo: "#fbe4e8",
    colores: { upper: "#f6c9d0", panel: "#efb1bc", acento: "#7cc4ad", media: "#ffffff", suela: "#efb1bc", cordones: "#ffffff" },
  },
];

window.CATEGORIAS = ["Todos", "Running", "Lifestyle", "Basketball", "Trail"];

window.formatoPrecio = (n) => "$" + n.toLocaleString("es", { minimumFractionDigits: 0 });
