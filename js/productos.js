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
    imagenes: [
      "img/productos/air-jordan-3-blanco-plata-1.webp", "img/productos/air-jordan-3-blanco-plata-2.webp",
      "img/productos/air-jordan-3-blanco-plata-3.webp",
    ],
  },
  {
    id: "air-jordan-3-negro", marca: "Jordan", nombre: "Air Jordan 3 Negro", categoria: "Basketball", precio: null,
    color: "Negro",
    descripcion: "Air Jordan 3 todo negro con costuras blancas en contraste.",
    detalles: ["Acabado tipo nobuk negro", "Costuras blancas en contraste", "Jumpman blanco en la lengüeta"],
    imagenes: [
      "img/productos/air-jordan-3-negro-1.webp", "img/productos/air-jordan-3-negro-2.webp",
      "img/productos/air-jordan-3-negro-3.webp", "img/productos/air-jordan-3-negro-4.webp",
      "img/productos/air-jordan-3-negro-5.webp",
    ],
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
    id: "nike-air-max-blanco", marca: "Nike", nombre: "Air Max Dn Blanco", categoria: "Lifestyle", precio: null,
    color: "Blanco", tallas: [42],
    descripcion: "Nike Air Max Dn blanco de malla, con cuatro cámaras de aire visibles en la suela.",
    detalles: ["Parte superior de malla", "Insignia Air Max Dn en la lengüeta", "Cámaras de aire visibles en la suela", "Talla EU 42 (US 8.5)"],
    imagenes: [
      "img/productos/nike-air-max-blanco-1.webp", "img/productos/nike-air-max-blanco-2.webp",
      "img/productos/nike-air-max-blanco-3.webp", "img/productos/nike-air-max-blanco-4.webp",
      "img/productos/nike-air-max-blanco-5.webp", "img/productos/nike-air-max-blanco-6.webp",
    ],
  },
  {
    id: "nike-blanco-cafe", marca: "Estilo Nike", nombre: "Metcon Blanco y Goma", categoria: "Training", precio: null,
    color: "Blanco / Café", tallas: [43],
    descripcion: "Zapato de entrenamiento blanco, con suela tipo goma y detalles en café.",
    detalles: ["Suela tipo goma con agarre", "Detalles en tono café", "Diseño inspirado en el Nike Metcon"],
    imagenes: [
      "img/productos/nike-blanco-cafe-1.webp", "img/productos/nike-blanco-cafe-2.webp",
      "img/productos/nike-blanco-cafe-3.webp", "img/productos/nike-blanco-cafe-4.webp",
      "img/productos/nike-blanco-cafe-5.webp",
    ],
  },
  {
    id: "tommy-azul-marino", marca: "Tommy Hilfiger", nombre: "Sneaker Azul Marino", categoria: "Lifestyle", precio: null,
    color: "Azul marino",
    descripcion: "Sneaker azul marino con el nombre de la marca en relieve alrededor del talón.",
    detalles: ["Acabado tipo cuero granulado", "Bandera Tommy en el costado", "Letras en relieve en la suela"],
    imagenes: [
      "img/productos/tommy-azul-marino-1.webp", "img/productos/tommy-azul-marino-2.webp",
      "img/productos/tommy-azul-marino-3.webp", "img/productos/tommy-azul-marino-4.webp",
      "img/productos/tommy-azul-marino-5.webp",
    ],
  },
  {
    id: "tommy-blanco-h", marca: "Estilo Tommy Hilfiger", nombre: "Sneaker Blanco H", categoria: "Lifestyle", precio: null,
    color: "Blanco / Azul / Rojo", tallas: [42],
    descripcion: "Sneaker blanco con la H en rojo y azul y el talón azul marino.",
    detalles: ["Acabado tipo cuero", "H en rojo y azul en el costado", "Cinta tricolor en la lengüeta", "Diseño inspirado en Tommy Hilfiger"],
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
    id: "tommy-negro", marca: "Estilo Tommy Hilfiger", nombre: "Sneaker Negro", categoria: "Lifestyle", precio: null,
    color: "Negro / Blanco", tallas: [42, 43],
    descripcion: "Sneaker negro con suela blanca, el nombre TOMMY en el talón y detalle rojo en el primer ojal.",
    detalles: ["Acabado tipo cuero liso", "Nombre en el costado y en el talón", "Suela blanca", "Diseño inspirado en Tommy Hilfiger"],
    imagenes: [
      "img/productos/tommy-negro-1.webp", "img/productos/tommy-negro-2.webp",
    ],
  },
  {
    id: "regent-beige", marca: "Regent", nombre: "Casual Beige", categoria: "Casual", precio: null,
    color: "Beige / Café",
    descripcion: "Zapato casual en beige con franjas y suela gruesa en café.",
    detalles: ["Hecho en Turquía", "Forro interior color camel", "Suela gruesa café"],
    imagenes: [
      "img/productos/regent-beige-1.webp", "img/productos/regent-beige-2.webp",
      "img/productos/regent-beige-3.webp", "img/productos/regent-beige-4.webp",
      "img/productos/regent-beige-5.webp", "img/productos/regent-beige-6.webp",
    ],
  },
  {
    id: "regent-gris", marca: "Regent", nombre: "Casual Gris", categoria: "Casual", precio: null,
    color: "Gris / Azul marino", tallas: [42],
    descripcion: "Zapato casual gris con rayas azul marino y suela gris azulada.",
    detalles: ["Hecho en Turquía", "Rayas laterales azul marino", "Tirador en el talón"],
    imagenes: [
      "img/productos/regent-gris-1.webp", "img/productos/regent-gris-2.webp",
      "img/productos/regent-gris-3.webp", "img/productos/regent-gris-4.webp",
      "img/productos/regent-gris-5.webp", "img/productos/regent-gris-6.webp",
    ],
  },
];
