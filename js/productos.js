// Catálogo de productos. Para agregar un modelo, copia un bloque { ... } y cambia sus datos.
//
// Campos:
//   id          identificador único, sin espacios (se usa en el enlace del producto)
//   marca       marca que se muestra junto a la categoría
//   nombre      nombre visible
//   categoria   Running, Basketball, Lifestyle, Casual... (una categoría nueva aparece sola en el menú)
//   precio      precio en dólares; con null el producto se muestra como "Consultar precio"
//   precioAntes (opcional) precio tachado; pone el producto en Ofertas
//   etiqueta    (opcional) texto sobre la foto; "Nuevo" pone el producto en Novedades
//   tallas      tallas disponibles (EU). Si no hay, se pide consultar por WhatsApp
//   agotadas    (opcional) tallas de la lista que ya no hay
//   imagenes    fotos del producto, la primera es la principal
window.PRODUCTOS = [
  {
    id: "jordan-spizike-gris", marca: "Jordan", nombre: "Spizike Low Gris y Negro", categoria: "Basketball", precio: null,
    color: "Negro / Gris (Black/Grey)", tallas: [44],
    descripcion: "Jordan Spizike Low en gamuza gris con negro y detalles en rojo: mezcla piezas de varios Air Jordan clásicos en un solo diseño.",
    detalles: ["Acabado tipo gamuza gris", "Pieza trasera con el nombre JORDAN en relieve", "Seguro de cordón y Jumpman en rojo", "Talla EU 44 (US 10)"],
    imagenes: [
      "img/productos/jordan-spizike-gris-1.webp", "img/productos/jordan-spizike-gris-2.webp",
      "img/productos/jordan-spizike-gris-3.webp", "img/productos/jordan-spizike-gris-4.webp",
      "img/productos/jordan-spizike-gris-5.webp",
    ],
  },
  {
    id: "air-jordan-3-blanco-plata", marca: "Jordan", nombre: "Air Jordan 3 Blanco y Plata", categoria: "Basketball", precio: null,
    color: "Blanco / Plata",
    descripcion: "El clásico Air Jordan 3 en blanco, con estampado tipo elefante plateado en la puntera y el talón.",
    detalles: ["Caña media", "Estampado tipo elefante plateado", "Jumpman negro en la lengüeta"],
    imagenes: ["img/productos/air-jordan-3-blanco-plata-1.webp"],
  },
  {
    id: "air-jordan-3-negro", marca: "Jordan", nombre: "Air Jordan 3 Negro", categoria: "Basketball", precio: null,
    color: "Negro",
    descripcion: "Air Jordan 3 todo negro con costuras blancas en contraste.",
    detalles: ["Acabado tipo nobuk negro", "Costuras blancas en contraste", "Jumpman blanco en la lengüeta"],
    imagenes: ["img/productos/air-jordan-3-negro-1.webp"],
  },
  {
    id: "on-cloudmonster-gris", marca: "Estilo On", nombre: "Cloudmonster Gris Claro", categoria: "Running", precio: null,
    color: "Gris claro / Negro", tallas: [43],
    descripcion: "Running de suela alta y acolchada, en gris claro con detalles en negro.",
    detalles: ["Parte superior de malla", "Suela gruesa con cápsulas de amortiguación", "Diseño inspirado en el On Cloudmonster"],
    imagenes: [
      "img/productos/on-cloudmonster-gris-1.webp", "img/productos/on-cloudmonster-gris-2.webp",
      "img/productos/on-cloudmonster-gris-3.webp", "img/productos/on-cloudmonster-gris-4.webp",
    ],
  },
  {
    id: "on-cloudsurfer-blanco-negro", marca: "Estilo On", nombre: "Cloudsurfer Blanco y Negro", categoria: "Running", precio: null,
    color: "Blanco / Negro", tallas: [42, 43],
    descripcion: "Running ligero de tejido knit blanco, con cuello y cordones negros.",
    detalles: ["Tejido knit transpirable", "Suela con cápsulas de amortiguación", "Diseño inspirado en el On Cloudsurfer"],
    imagenes: ["img/productos/on-cloudsurfer-blanco-negro-1.webp", "img/productos/on-cloudsurfer-blanco-negro-2.webp"],
  },
  {
    id: "nike-air-max-blanco", marca: "Nike", nombre: "Air Max Blanco", categoria: "Lifestyle", precio: null,
    color: "Blanco",
    descripcion: "Nike Air Max blanco de malla, con cámaras de aire visibles en la suela.",
    detalles: ["Parte superior de malla", "Insignia Air en la lengüeta", "Cámaras de aire visibles"],
    imagenes: ["img/productos/nike-air-max-blanco-1.webp"],
  },
  {
    id: "nike-blanco-cafe", marca: "Nike", nombre: "Blanco y Café", categoria: "Lifestyle", precio: null,
    color: "Blanco / Café",
    descripcion: "Nike blanco de perfil grueso, con detalles en café y suela tipo goma.",
    detalles: ["Detalles en tono café", "Plantilla con logo Nike", "Suela tipo goma"],
    imagenes: ["img/productos/nike-blanco-cafe-1.webp"],
  },
  {
    id: "tommy-azul-marino", marca: "Tommy Hilfiger", nombre: "Sneaker Azul Marino", categoria: "Lifestyle", precio: null,
    color: "Azul marino",
    descripcion: "Sneaker azul marino con el nombre de la marca en relieve alrededor del talón.",
    detalles: ["Acabado tipo cuero granulado", "Bandera Tommy en el costado", "Letras en relieve en la suela"],
    imagenes: [
      "img/productos/tommy-azul-marino-1.webp", "img/productos/tommy-azul-marino-2.webp",
      "img/productos/tommy-azul-marino-3.webp",
    ],
  },
  {
    id: "tommy-blanco-h", marca: "Tommy Hilfiger", nombre: "Sneaker Blanco H", categoria: "Lifestyle", precio: null,
    color: "Blanco / Azul / Rojo",
    descripcion: "Sneaker blanco con la H en rojo y azul y el talón azul marino.",
    detalles: ["Acabado tipo cuero", "H en rojo y azul en el costado", "Cinta tricolor en la lengüeta"],
    imagenes: ["img/productos/tommy-blanco-h-1.webp", "img/productos/tommy-blanco-h-2.webp"],
  },
  {
    id: "tommy-gris", marca: "Tommy Hilfiger", nombre: "Sneaker Gris", categoria: "Lifestyle", precio: null,
    color: "Gris", tallas: [42],
    descripcion: "Sneaker gris de acabado tipo gamuza y diseño minimalista.",
    detalles: ["Acabado tipo gamuza", "Perforaciones laterales", "Logo en el talón"],
    imagenes: ["img/productos/tommy-gris-1.webp", "img/productos/tommy-gris-2.webp"],
  },
  {
    id: "tommy-negro", marca: "Tommy Hilfiger", nombre: "Sneaker Negro", categoria: "Lifestyle", precio: null,
    color: "Negro",
    descripcion: "Sneaker negro con el logo de la marca en el costado.",
    detalles: ["Acabado tipo cuero", "Logo Tommy Hilfiger en el costado", "Plantilla con logo Tommy"],
    imagenes: ["img/productos/tommy-negro-1.webp"],
  },
  {
    id: "regent-beige", marca: "Regent", nombre: "Casual Beige", categoria: "Casual", precio: null,
    color: "Beige / Café",
    descripcion: "Zapato casual en beige con franjas y suela gruesa en café.",
    detalles: ["Hecho en Turquía", "Forro interior color camel", "Suela gruesa café"],
    imagenes: ["img/productos/regent-beige-1.webp", "img/productos/regent-beige-2.webp", "img/productos/regent-beige-3.webp"],
  },
  {
    id: "regent-gris", marca: "Regent", nombre: "Casual Gris", categoria: "Casual", precio: null,
    color: "Gris / Azul marino",
    descripcion: "Zapato casual gris con rayas azul marino y suela gris azulada.",
    detalles: ["Hecho en Turquía", "Rayas laterales azul marino", "Tirador en el talón"],
    imagenes: ["img/productos/regent-gris-1.webp", "img/productos/regent-gris-2.webp", "img/productos/regent-gris-3.webp"],
  },
];
