import { jsPDF } from 'jspdf';
import { Garantia } from '../types';
import { LOGO_PNG_BASE64 } from '../assets/logoBase64';

// Epson TM-T88: papel de 80 mm. El alto se calcula según el contenido
// para que nunca se corte el texto (motivos u observaciones largas).
const ANCHO = 80;
const MARGEN = 4;
const ANCHO_UTIL = ANCHO - MARGEN * 2;
const LOGO_ANCHO = 44;
const LOGO_ALTO = 18.67; // proporción real del logo (870x369)

function fechaHora(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso || 'N/A';
  return d.toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

type Copia = 'CLIENTE' | 'TIENDA';

/** Dibuja el ticket y regresa el alto usado (mm). */
function dibujar(doc: jsPDF, g: Garantia, copia: Copia): number {
  let y = 6;

  const centrado = (texto: string, size: number, estilo: 'normal' | 'bold' = 'normal') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', estilo);
    const lineas: string[] = doc.splitTextToSize(texto, ANCHO_UTIL);
    const alto = size * 0.3528 * 1.2; // pt -> mm con interlineado
    lineas.forEach(l => {
      doc.text(l, ANCHO / 2, y, { align: 'center' });
      y += alto;
    });
  };

  const campo = (etiqueta: string, valor: string) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const titulo = `${etiqueta}: `;
    doc.text(titulo, MARGEN, y);
    const anchoTitulo = doc.getTextWidth(titulo);
    doc.setFont('helvetica', 'normal');
    const lineas: string[] = doc.splitTextToSize(valor?.trim() || 'N/A', ANCHO_UTIL - anchoTitulo);
    const alto = 9 * 0.3528 * 1.25;
    lineas.forEach((l, i) => doc.text(l, MARGEN + anchoTitulo, y + i * alto));
    y += lineas.length * alto + 0.8;
  };

  const separador = () => {
    y += 1;
    doc.setLineDashPattern([1, 1], 0);
    doc.setLineWidth(0.3);
    doc.line(MARGEN, y, ANCHO - MARGEN, y);
    doc.setLineDashPattern([], 0);
    y += 5;
  };

  // Encabezado
  try {
    doc.addImage(LOGO_PNG_BASE64, 'PNG', (ANCHO - LOGO_ANCHO) / 2, y, LOGO_ANCHO, LOGO_ALTO, 'logo', 'FAST');
    y += LOGO_ALTO + 5;
  } catch {
    y += 4;
    centrado('Ferre Don Nico', 14, 'bold');
    y += 1;
  }

  centrado('COMPROBANTE DE GARANTÍA', 11, 'bold');
  y += 1;
  centrado(`FOLIO: ${g.folio}`, 16, 'bold');
  y += 1;
  centrado(`COPIA ${copia}`, 9, 'bold');
  separador();

  campo('Fecha', fechaHora(g.fechaRecibo));
  campo('Cliente', g.cliente);
  if (g.telefono) campo('Tel', g.telefono);
  if (g.direccion) campo('Dir', g.direccion);
  separador();

  centrado('DATOS DEL PRODUCTO', 10, 'bold');
  y += 1;
  campo('Prov.', g.proveedor);
  campo('Cód.', g.codigo);
  campo('Desc.', g.descripcion);
  campo('Cant.', String(g.cantidad));
  separador();

  centrado('DETALLES', 10, 'bold');
  y += 1;
  campo('Motivo', g.motivo);
  if (g.observaciones) campo('Obs.', g.observaciones);
  separador();

  // Firmas: el cliente y quien recibe firman AMBAS copias
  const lineaFirma = (texto: string) => {
    y += 9;
    doc.setLineWidth(0.3);
    doc.line(MARGEN + 10, y, ANCHO - MARGEN - 10, y);
    y += 4;
    centrado(texto, 8);
  };
  lineaFirma('Firma del cliente');
  lineaFirma('Recibió: nombre y firma');
  y += 3;

  if (copia === 'CLIENTE') {
    centrado('Presente este ticket para recoger su producto', 8, 'bold');
    centrado('o para cualquier aclaración.', 8);
  } else {
    centrado('Archivo de tienda · Jefe de Operaciones', 8, 'bold');
  }
  y += 4;

  return y;
}

/** Dos páginas: copia para el cliente y copia firmada para archivo de tienda. */
export function crearPdf(g: Garantia): jsPDF {
  // 1a pasada: medir el alto real de cada copia
  const medir = (copia: Copia) => {
    const borrador = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [ANCHO, 1000] });
    return Math.max(100, Math.ceil(dibujar(borrador, g, copia)));
  };
  const altoCliente = medir('CLIENTE');
  const altoTienda = medir('TIENDA');
  // 2a pasada: cada copia en su página, del tamaño exacto
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [ANCHO, altoCliente] });
  dibujar(doc, g, 'CLIENTE');
  doc.addPage([ANCHO, altoTienda], 'portrait');
  dibujar(doc, g, 'TIENDA');
  doc.setProperties({ title: `Garantía ${g.folio}` });
  return doc;
}

function nombreArchivo(g: Garantia): string {
  const cliente = g.cliente
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return `${g.folio}_${cliente || 'cliente'}.pdf`;
}

/** Descarga el ticket en PDF. */
export function descargarTicket(g: Garantia): void {
  crearPdf(g).save(nombreArchivo(g));
}

/**
 * Abre el ticket con el diálogo de impresión.
 * Llamar directo desde un clic (si no, el navegador puede bloquear la ventana).
 * Si la ventana se bloquea, lo descarga.
 */
export function imprimirTicket(g: Garantia): void {
  const doc = crearPdf(g);
  doc.autoPrint();
  const url = doc.output('bloburl');
  const ventana = window.open(url, '_blank');
  if (!ventana) doc.save(nombreArchivo(g));
}

/** Mensaje de WhatsApp según la etapa de la garantía. */
export function mensajeWhatsApp(g: Garantia): string {
  const producto = [g.codigo, g.descripcion].filter(Boolean).join(' - ');
  const saludo = `Hola ${g.cliente.split(' ')[0] || ''}, le escribimos de Ferre Don Nico.`.replace(' ,', ',');
  if (g.estatus === 'En Tienda') {
    return [
      saludo,
      `Le informamos que su artículo en garantía ya se encuentra en tienda y puede pasar a recogerlo.`,
      `Folio: ${g.folio}`,
      `Producto: ${producto}`,
      '',
      'Por favor presente su ticket de garantía o este folio al recogerlo. ¡Gracias por su preferencia!',
    ].join('\n');
  }
  if (g.estatus === 'Nota de Crédito') {
    return [
      saludo,
      `Le informamos que su garantía ya fue resuelta y puede pasar a recoger su nuevo artículo.`,
      `Folio: ${g.folio}`,
      `Producto original: ${producto}`,
      '',
      'Por favor presente su ticket de garantía o este folio al acudir a tienda. ¡Gracias por su preferencia!',
    ].join('\n');
  }
  return [
    'Ferre Don Nico · Comprobante de garantía',
    `Folio: ${g.folio}`,
    `Fecha: ${fechaHora(g.fechaRecibo)}`,
    `Cliente: ${g.cliente}`,
    `Producto: ${producto} (Cant. ${g.cantidad})`,
    `Motivo: ${g.motivo}`,
    '',
    'Presente su ticket impreso o este folio para recoger su producto. Le avisaremos por este medio cuando esté listo.',
  ].join('\n');
}

/**
 * Abre WhatsApp con el mensaje que corresponde a la etapa de la garantía
 * (comprobante, "ya está en tienda" o "pase por su nuevo artículo").
 * Llamar directo desde un clic para que el navegador no bloquee la ventana.
 */
export function enviarPorWhatsApp(g: Garantia): boolean {
  const tel = g.telefono.replace(/\D/g, '');
  if (tel.length !== 10) return false;
  window.open(`https://wa.me/52${tel}?text=${encodeURIComponent(mensajeWhatsApp(g))}`, '_blank');
  return true;
}
