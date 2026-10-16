// Configuración general de la tienda. Cambia estos valores sin tocar el resto del código.
window.TIENDA = {
  nombre: "VB-Imports",
  lema: "Productos importados en Ciudad Ojeda",
  descripcion: "Productos importados y originales, con envío desde Ciudad Ojeda a todo el país. Empezamos con sneakers; pronto, mucho más.",

  // Los precios de productos.js están en dólares. El formato de números es el venezolano (1.234,56).
  moneda: { simbolo: "$", locale: "es-VE" },

  // Precio en bolívares calculado con la tasa oficial del BCV, que se consulta cada hora.
  // tasaRespaldo: tasa manual (Bs. por USD) que se usa solo si no se puede consultar ninguna fuente.
  bolivares: { activo: true, simbolo: "Bs.", tasaRespaldo: 0, actualizarCadaMinutos: 60 },

  // Número de WhatsApp que recibe los pedidos: código de país + número, sin "+" ni espacios.
  whatsapp: "584121365631",

  // A partir de este subtotal el envío es gratis (pon 0 para desactivar la barra de progreso).
  envioGratisDesde: 99,

  // Tallas que se ofrecen en todos los modelos (cada producto puede marcar algunas como agotadas).
  sistemaTallas: "US",
  tallas: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12],

  // Portada: producto destacado y textos (en el título, <em> pone la palabra en cursiva).
  destacado: "metro-suede",
  portada: {
    etiqueta: "Colección Otoño 2026",
    titulo: "Diseñadas para caminar <em>la ciudad</em>",
    texto: "Siluetas atemporales, materiales nobles y la comodidad de siempre. Una selección corta, pensada para durar.",
  },

  aviso: "Envío gratis en pedidos desde $99 · Cambios sin costo durante 30 días",
};
