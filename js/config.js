// Configuración general de la tienda. Cambia estos valores sin tocar el resto del código.
window.TIENDA = {
  nombre: "VB-Imports",
  lema: "Productos importados en Ciudad Ojeda",
  descripcion: "Productos importados, con envío desde Ciudad Ojeda a todo el país. Empezamos con sneakers; pronto, mucho más.",

  // Los precios de productos.js están en dólares. El formato de números es el venezolano (1.234,56).
  moneda: { simbolo: "$", locale: "es-VE" },

  // Precio en bolívares calculado con la tasa oficial del BCV, que se consulta cada hora.
  // tasaRespaldo: tasa manual (Bs. por USD) que se usa solo si no se puede consultar ninguna fuente.
  // iva: el IVA va solo en bolívares; el precio en dólares se muestra sin IVA.
  bolivares: { activo: true, simbolo: "Bs.", tasaRespaldo: 0, actualizarCadaMinutos: 60, iva: 0.16 },

  // Número de WhatsApp que recibe los pedidos: código de país + número, sin "+" ni espacios.
  whatsapp: "584121365631",

  // Envío gratis a partir de este subtotal en USD. 0 = no se ofrece (no se muestra la barra en la bolsa).
  envioGratisDesde: 0,

  // Sistema de tallas que se muestra junto a cada talla (las tallas van en cada producto).
  sistemaTallas: "EU",

  // Portada: producto destacado y textos (en el título, <em> pone la palabra en cursiva).
  destacado: "regent-beige",
  portada: {
    etiqueta: "Nuevos ingresos",
    titulo: "Diseñadas para caminar <em>la ciudad</em>",
    texto: "Running, básquet y casual: una selección de sneakers importados, con envío desde Ciudad Ojeda a todo el país.",
  },

  // Franja superior con un anuncio; vacía, no se muestra.
  aviso: "",
};
