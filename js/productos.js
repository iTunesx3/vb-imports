// Catálogo de productos. Para agregar un modelo, copia un bloque { ... } y cambia sus datos.
//
// Campos:
//   id          identificador único, sin espacios (se usa en el enlace del producto)
//   nombre      nombre visible
//   categoria   Running, Lifestyle, Basketball, Trail... (una categoría nueva aparece sola en el menú)
//   precio      precio actual; precioAntes (opcional) muestra el precio tachado y lo pone en Ofertas
//   etiqueta    texto opcional sobre la foto ("Nuevo" lo pone en Novedades)
//   agotadas    tallas sin stock de este modelo
//   imagenes    (opcional) rutas a fotos reales, ej: ["img/velox-1.jpg", "img/velox-2.jpg"]
//               Mientras no haya fotos se usa la ilustración, que toma los colores de "colores".
//   alto        true para la ilustración de caña alta
window.PRODUCTOS = [
  {
    id: "velox-runner", nombre: "Velox Runner", categoria: "Running", precio: 129, etiqueta: "Nuevo",
    color: "Blanco / Naranja", agotadas: [7, 12],
    descripcion: "Ligera y con amortiguación reactiva para tus kilómetros diarios. Malla transpirable y suela de goma de alta tracción.",
    detalles: ["Upper de malla técnica", "Mediasuela de espuma EVA", "Suela de goma", "Peso: 260 g (talla US 9)"],
    colores: { upper: "#f4f4f2", panel: "#e4e4e0", acento: "#ff5a1f", media: "#ffffff", suela: "#2b2b2b", cordones: "#d9d9d4" },
  },
  {
    id: "court-classic-85", nombre: "Court Classic 85", categoria: "Lifestyle", precio: 99,
    color: "Blanco / Verde", agotadas: [],
    descripcion: "Un clásico de cancha con aire vintage: cuero suave, suela color crema y una línea verde que nunca pasa de moda.",
    detalles: ["Upper de cuero", "Forro textil", "Suela de goma vulcanizada"],
    colores: { upper: "#fbfaf6", panel: "#f0eee6", acento: "#1f7a4d", media: "#f3ecdc", suela: "#c9b48a", cordones: "#ffffff" },
  },
  {
    id: "skyline-hi", nombre: "Skyline Hi", categoria: "Basketball", precio: 159, etiqueta: "Edición limitada", alto: true,
    color: "Negro / Rojo", agotadas: [7, 7.5, 8, 11],
    descripcion: "Caña alta, sujeción firme y una presencia que se nota. Pensada para la cancha, lista para la calle.",
    detalles: ["Caña alta acolchada", "Upper de cuero sintético", "Suela de goma con patrón de espiga"],
    colores: { upper: "#1b1b1f", panel: "#2e2e36", acento: "#e63946", media: "#ffffff", suela: "#e63946", cordones: "#3a3a42" },
  },
  {
    id: "aero-knit", nombre: "Aero Knit", categoria: "Running", precio: 119, precioAntes: 149, etiqueta: "-20%",
    color: "Azul / Lima", agotadas: [10.5],
    descripcion: "Tejido knit que se adapta al pie como un calcetín. Ideal para entrenar o para el día a día.",
    detalles: ["Upper de tejido knit", "Plantilla removible", "Mediasuela de espuma ligera"],
    colores: { upper: "#6c8cff", panel: "#5a78e6", acento: "#d4ff3a", media: "#ffffff", suela: "#1e1e1e", cordones: "#ffffff" },
  },
  {
    id: "metro-suede", nombre: "Metro Suede", categoria: "Lifestyle", precio: 109,
    color: "Tabaco / Crema", agotadas: [12],
    descripcion: "Gamuza suave en tono tabaco y suela crema. La zapatilla que combina con todo tu armario.",
    detalles: ["Upper de gamuza", "Forro de algodón", "Suela de goma"],
    colores: { upper: "#c8a27a", panel: "#b48a60", acento: "#3b2a1a", media: "#f2e8d5", suela: "#6b4f2e", cordones: "#f2e8d5" },
  },
  {
    id: "block-hi", nombre: "Block Hi", categoria: "Basketball", precio: 139, alto: true,
    color: "Blanco / Azul", agotadas: [],
    descripcion: "Bloques de color, caña alta y una suela robusta. Un ícono de cancha reinterpretado.",
    detalles: ["Caña alta", "Upper de cuero", "Suela de goma"],
    colores: { upper: "#f4f4f2", panel: "#2a6fdb", acento: "#2a6fdb", media: "#ffffff", suela: "#2a6fdb", cordones: "#ffffff" },
  },
  {
    id: "trail-pulse", nombre: "Trail Pulse", categoria: "Trail", precio: 149, etiqueta: "Nuevo",
    color: "Oliva / Naranja", agotadas: [7],
    descripcion: "Agarre extra y protección para caminos de tierra y montaña, sin perder ligereza.",
    detalles: ["Upper de malla resistente", "Puntera reforzada", "Suela con tacos de 4 mm"],
    colores: { upper: "#3d4a3a", panel: "#2c3529", acento: "#ff9f1c", media: "#d9d4c7", suela: "#1d1d1d", cordones: "#ff9f1c" },
  },
  {
    id: "pastel-glide", nombre: "Pastel Glide", categoria: "Lifestyle", precio: 115,
    color: "Rosa / Menta", agotadas: [11, 12],
    descripcion: "Tonos suaves y una pisada ligera. Para quienes van con calma, pero con estilo.",
    detalles: ["Upper de malla y sintético", "Mediasuela de espuma", "Suela de goma"],
    colores: { upper: "#f6c9d0", panel: "#efb1bc", acento: "#7cc4ad", media: "#ffffff", suela: "#efb1bc", cordones: "#ffffff" },
  },
];
