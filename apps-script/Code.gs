/**
 * API del Gestor de Garantías — Ferre Don Nico
 * ---------------------------------------------
 * Conecta la app directamente con esta hoja de Google Sheets (sin SheetDB).
 *
 * Instalación (una sola vez):
 *   1. En la hoja de garantías: Extensiones > Apps Script. Borra lo que haya y pega este archivo.
 *   2. Cambia API_KEY por una clave propia (la misma va en VITE_SHEETS_API_KEY de la app).
 *   3. Ejecuta la función probarConexion (autoriza los permisos que pida).
 *   4. Implementar > Nueva implementación > Tipo: Aplicación web
 *        - Ejecutar como: Yo
 *        - Quién tiene acceso: Cualquier usuario
 *   5. Copia la URL que termina en /exec y ponla en VITE_SHEETS_API_URL de la app.
 *
 * Si cambias este código después, usa Implementar > Administrar implementaciones >
 * Editar (lápiz) > Versión: Nueva versión, para que la URL siga siendo la misma.
 */

var CONFIG = {
  // Clave compartida con la app. Cámbiala antes de implementar.
  API_KEY: 'CAMBIA-ESTA-CLAVE',
  // Nombre de la pestaña de garantías. Vacío = usa la primera pestaña (como SheetDB).
  SHEET_GARANTIAS: '',
  FOLIO_PREFIJO: 'GAR-',
  FOLIO_DIGITOS: 4
};

// Columnas de la hoja (se agregan solas si faltan; las que ya existen no se tocan).
var HEADERS = [
  'folio', 'cliente', 'direccion', 'telefono', 'fechaRecibo', 'proveedor',
  'motivo', 'codigo', 'descripcion', 'cantidad', 'observaciones', 'estatus',
  'fechaEmbarque', 'fechaEntrega', 'actualizado'
];

// Campos que la app puede modificar después del registro.
var CAMPOS_EDITABLES = ['estatus', 'fechaEmbarque', 'fechaEntrega', 'observaciones'];
var ESTATUS_VALIDOS = ['Sin Enviar', 'En proceso', 'En Tienda', 'Nota de Crédito', 'Listo'];

function doGet(e) {
  return handle_((e && e.parameter) || {});
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'Solicitud inválida' });
  }
  return handle_(body);
}

function handle_(params) {
  try {
    if (!params.key || params.key !== getApiKey_()) {
      return json_({ ok: false, error: 'Clave de acceso inválida' });
    }
    switch (params.action) {
      case 'ping':
        return json_({ ok: true, data: 'ok' });
      case 'list':
        return json_({ ok: true, data: leerGarantias_() });
      case 'get':
        return json_({ ok: true, data: buscarPorFolio_(params.folio) });
      case 'nextFolio':
        return json_({ ok: true, data: siguienteFolio_(leerGarantias_()) });
      case 'create':
        return json_({ ok: true, data: withLock_(function () { return crear_(params.data); }) });
      case 'update':
        return json_({ ok: true, data: withLock_(function () { return actualizar_(params.folio, params.data); }) });
      default:
        return json_({ ok: false, error: 'Acción no válida: ' + params.action });
    }
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

/** Permite guardar la clave en Propiedades del script en lugar de en el código. */
function getApiKey_() {
  var fromProps = PropertiesService.getScriptProperties().getProperty('API_KEY');
  return fromProps || CONFIG.API_KEY;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Evita que dos cajas guarden al mismo tiempo y se repita un folio. */
function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = CONFIG.SHEET_GARANTIAS
    ? ss.getSheetByName(CONFIG.SHEET_GARANTIAS)
    : ss.getSheets()[0];
  if (!sheet) throw new Error('No existe la pestaña "' + CONFIG.SHEET_GARANTIAS + '"');
  return sheet;
}

/** Asegura que la hoja tenga todas las columnas y regresa los encabezados. */
function asegurarEncabezados_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0]
    .map(function (h) { return String(h).trim(); });
  if (headers.length === 1 && headers[0] === '') headers = [];
  HEADERS.forEach(function (h) {
    if (headers.indexOf(h) === -1) {
      headers.push(h);
      sheet.getRange(1, headers.length).setValue(h);
    }
  });
  return headers;
}

function leerGarantias_() {
  var sheet = getSheet_();
  var values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  var headers = values[0].map(function (h) { return String(h).trim(); });
  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var vacia = row.every(function (v) { return String(v).trim() === ''; });
    if (vacia) continue;
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      if (headers[c]) obj[headers[c]] = row[c];
    }
    rows.push(obj);
  }
  return rows;
}

/** Acepta "GAR-0015", "gar-15", "15" y los convierte al formato GAR-0015. */
function normalizarFolio_(folio) {
  var f = String(folio || '').trim().toUpperCase();
  if (!f) return '';
  var soloNumero = f.replace(CONFIG.FOLIO_PREFIJO, '').replace(/\D/g, '');
  if (/^\d+$/.test(f) || /^GAR-?\d+$/.test(f)) {
    return CONFIG.FOLIO_PREFIJO + padNum_(parseInt(soloNumero, 10));
  }
  return f;
}

function padNum_(n) {
  var s = String(n);
  while (s.length < CONFIG.FOLIO_DIGITOS) s = '0' + s;
  return s;
}

function numeroFolio_(folio) {
  var n = parseInt(String(folio || '').replace(/\D/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

function siguienteFolio_(garantias) {
  var max = 0;
  garantias.forEach(function (g) {
    var n = numeroFolio_(g.folio);
    if (n > max) max = n;
  });
  return CONFIG.FOLIO_PREFIJO + padNum_(max + 1);
}

function buscarPorFolio_(folio) {
  var buscado = normalizarFolio_(folio);
  if (!buscado) throw new Error('Falta el folio');
  var garantias = leerGarantias_();
  for (var i = 0; i < garantias.length; i++) {
    if (normalizarFolio_(garantias[i].folio) === buscado) return garantias[i];
  }
  return null;
}

function filaDeFolio_(sheet, headers, folio) {
  var col = headers.indexOf('folio') + 1;
  var lastRow = sheet.getLastRow();
  if (col < 1 || lastRow < 2) return -1;
  var buscado = normalizarFolio_(folio);
  var folios = sheet.getRange(2, col, lastRow - 1, 1).getDisplayValues();
  for (var i = 0; i < folios.length; i++) {
    if (normalizarFolio_(folios[i][0]) === buscado) return i + 2;
  }
  return -1;
}

function toCell_(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

/** Registra una garantía nueva. El folio lo asigna el servidor (nunca se repite). */
function crear_(g) {
  if (!g) throw new Error('Faltan los datos de la garantía');
  if (!String(g.cliente || '').trim()) throw new Error('Falta el nombre del cliente');

  var sheet = getSheet_();
  var headers = asegurarEncabezados_(sheet);
  var ahora = new Date().toISOString();

  var nueva = {};
  HEADERS.forEach(function (h) { nueva[h] = g[h] !== undefined ? g[h] : ''; });
  nueva.folio = siguienteFolio_(leerGarantias_());
  nueva.fechaRecibo = g.fechaRecibo || ahora;
  nueva.estatus = 'Sin Enviar';
  nueva.fechaEmbarque = '';
  nueva.fechaEntrega = '';
  nueva.actualizado = ahora;
  nueva.cantidad = Math.max(1, parseInt(g.cantidad, 10) || 1);

  var fila = headers.map(function (h) { return toCell_(nueva[h]); });
  var rowIndex = sheet.getLastRow() + 1;
  var range = sheet.getRange(rowIndex, 1, 1, headers.length);
  range.setNumberFormat('@'); // texto plano: evita que Sheets cambie fechas, folios o teléfonos
  range.setValues([fila]);
  return nueva;
}

/** Actualiza solo los campos permitidos (estatus, fechas, observaciones). */
function actualizar_(folio, cambios) {
  if (!folio) throw new Error('Falta el folio');
  if (!cambios) throw new Error('No hay cambios que guardar');
  if (cambios.estatus && ESTATUS_VALIDOS.indexOf(cambios.estatus) === -1) {
    throw new Error('Estatus no válido: ' + cambios.estatus);
  }

  var sheet = getSheet_();
  var headers = asegurarEncabezados_(sheet);
  var rowIndex = filaDeFolio_(sheet, headers, folio);
  if (rowIndex === -1) throw new Error('No se encontró el folio ' + folio);

  cambios.actualizado = new Date().toISOString();
  CAMPOS_EDITABLES.concat(['actualizado']).forEach(function (campo) {
    if (cambios[campo] === undefined) return;
    var col = headers.indexOf(campo) + 1;
    var cell = sheet.getRange(rowIndex, col);
    cell.setNumberFormat('@');
    cell.setValue(toCell_(cambios[campo]));
  });
  return buscarPorFolio_(folio);
}

/** Ejecuta esta función desde el editor para confirmar que todo está bien. */
function probarConexion() {
  var garantias = leerGarantias_();
  Logger.log('Pestaña: ' + getSheet_().getName());
  Logger.log('Garantías registradas: ' + garantias.length);
  Logger.log('Siguiente folio: ' + siguienteFolio_(garantias));
}
