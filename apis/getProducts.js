/**
 * Elaborado por: Pablo Herrera
 * Vista canal de youtube: Testing con Pablo Herrera
 */

/**
 * Obtiene datos de la API de productos y los escribe en la hoja de Google Sheets.
 */
function getProductsFromAPI() {
  const url = "https://api.escuelajs.co/api/v1/products";
  const sheetName = "Productos"; // Puedes cambiar el nombre de tu hoja aquí

  try {

    // Realiza la solicitud HTTP GET a la API
    const response = UrlFetchApp.fetch(url);
    const jsonResponse = response.getContentText();
    const products = JSON.parse(jsonResponse);

    // Obtiene la hoja activa por nombre
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

    // Si la hoja no existe, la crea
    if (!sheet) {
      SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
      const newSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      writeProductsToSheet(newSheet, products);
    } else {
      // Limpia el contenido existente antes de escribir los nuevos datos
      sheet.clearContents();
      writeProductsToSheet(sheet, products);
    }

  } catch (error) {
    Logger.log("Error al obtener o procesar los datos de la API: " + error.toString());
  }
}


/**
 * Escribe los datos de los productos en la hoja de cálculo.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet La hoja donde se escribirán los datos.
 * @param {Array<Object>} products Un array de objetos de producto.
 */
function writeProductsToSheet(sheet, products) {
  if (!products || products.length === 0) {
    sheet.getRange("A1").setValue("No se encontraron productos.");
    return;
  }

  // Define los encabezados que quieres mostrar en tu hoja
  const headers = [
    "ID",
    "Título",
    "Slug",
    "Precio",
    "Descripción",
    "Categoría ID",
    "Categoría Nombre",
    "Categoría Imagen",
    "Categoría Slug",
    "Imágenes URL (Separadas por coma)"
  ];
  sheet.appendRow(headers); // Escribe los encabezados

  // Prepara los datos para ser escritos
  const data = products.map(product => {
    // Manejo de la categoría (puede ser null o undefined)
    const categoryId = product.category ? product.category.id : "";
    const categoryName = product.category ? product.category.name : "";
    const categoryImage = product.category ? product.category.image : "";
    const categorySlug = product.category ? product.category.slug : "";

    // Manejo de las imágenes (un array de URLs)
    const imageUrls = product.images && Array.isArray(product.images)
      ? product.images.join(", ")
      : "";

    return [
      product.id,
      product.title,
      product.slug,
      product.price,
      product.description,
      categoryId,
      categoryName,
      categoryImage,
      categorySlug,
      imageUrls
    ];
  });

  // Escribe todos los datos de una vez para mayor eficiencia
  sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);

  // Ajusta el ancho de las columnas para que se vean bien
  sheet.autoResizeColumns(1, headers.length);
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('API Productos')
      .addItem('Cargar Productos', 'getProductsFromAPI')
      .addToUi();
}
