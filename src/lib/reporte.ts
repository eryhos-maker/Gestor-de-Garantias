import { jsPDF } from 'jspdf';
import { EstatusGarantia, Garantia } from '../types';
import { DIAS_LIMITE, ESTATUS, ETIQUETA_ESTATUS, MAX_AVISOS, diasDesde, formatearFecha } from './estatus';

export interface ReporteSemanal {
  generado: Date;
  abiertas: number;
  porEstatus: { estatus: EstatusGarantia; total: number }[];
  tresAvisos: Garantia[];
  masDe30: Garantia[];
  notaCredito: Garantia[];
}

const porAntiguedad = (a: Garantia, b: Garantia) =>
  (diasDesde(b.fechaRecibo) ?? 0) - (diasDesde(a.fechaRecibo) ?? 0);

/**
 * Reporte para la revisión semanal (Jefe de Operaciones + Gerente).
 * Solo toma garantías abiertas: las entregadas ya no requieren acción.
 */
export function armarReporte(garantias: Garantia[]): ReporteSemanal {
  const abiertas = garantias.filter(g => g.estatus !== 'Listo');
  return {
    generado: new Date(),
    abiertas: abiertas.length,
    porEstatus: ESTATUS.filter(e => e !== 'Listo').map(e => ({
      estatus: e,
      total: abiertas.filter(g => g.estatus === e).length,
    })),
    tresAvisos: abiertas.filter(g => g.avisos >= MAX_AVISOS).sort(porAntiguedad),
    masDe30: abiertas.filter(g => (diasDesde(g.fechaRecibo) ?? 0) > DIAS_LIMITE).sort(porAntiguedad),
    notaCredito: abiertas.filter(g => g.estatus === 'Nota de Crédito').sort(porAntiguedad),
  };
}

// ---------- PDF (carta horizontal) ----------

const COLUMNAS: { titulo: string; ancho: number; valor: (g: Garantia) => string }[] = [
  { titulo: 'Folio', ancho: 24, valor: g => g.folio },
  { titulo: 'Cliente', ancho: 47, valor: g => g.cliente },
  { titulo: 'Teléfono', ancho: 26, valor: g => g.telefono || '—' },
  { titulo: 'Proveedor', ancho: 26, valor: g => g.proveedor || '—' },
  { titulo: 'Producto', ancho: 62, valor: g => [g.codigo, g.descripcion].filter(Boolean).join(' - ') },
  { titulo: 'Estatus', ancho: 26, valor: g => ETIQUETA_ESTATUS[g.estatus] },
  { titulo: 'Recibida', ancho: 20, valor: g => formatearFecha(g.fechaRecibo) },
  { titulo: 'Días', ancho: 10, valor: g => String(diasDesde(g.fechaRecibo) ?? '—') },
  { titulo: 'Avisos', ancho: 13, valor: g => String(g.avisos) },
];

export function crearReportePdf(r: ReporteSemanal): jsPDF {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
  const ANCHO = doc.internal.pageSize.getWidth();
  const ALTO = doc.internal.pageSize.getHeight();
  const M = 12;
  let y = M;

  const nuevaPaginaSiHaceFalta = (alto: number) => {
    if (y + alto > ALTO - M) {
      doc.addPage();
      y = M;
    }
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Reporte semanal de garantías · Ferre Mina', M, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  y += 11;
  doc.text(
    `Generado: ${r.generado.toLocaleString('es-MX')} · Garantías abiertas: ${r.abiertas} · ` +
      r.porEstatus.map(e => `${ETIQUETA_ESTATUS[e.estatus]}: ${e.total}`).join(' · '),
    M,
    y,
  );
  y += 8;

  const seccion = (titulo: string, accion: string, lista: Garantia[]) => {
    nuevaPaginaSiHaceFalta(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text(`${titulo} (${lista.length})`, M, y);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.text(accion, M, y + 4.5);
    y += 8;

    if (lista.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Sin garantías en esta categoría.', M, y + 3);
      y += 10;
      return;
    }

    const encabezado = () => {
      doc.setFillColor(235, 238, 243);
      doc.rect(M, y, ANCHO - 2 * M, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      let x = M + 1.5;
      COLUMNAS.forEach(c => {
        doc.text(c.titulo, x, y + 4.2);
        x += c.ancho;
      });
      y += 6;
    };
    encabezado();

    doc.setFont('helvetica', 'normal');
    lista.forEach(g => {
      const celdas = COLUMNAS.map(c => doc.splitTextToSize(c.valor(g), c.ancho - 2) as string[]);
      const alto = Math.max(...celdas.map(l => l.length)) * 3.6 + 2.4;
      if (y + alto > ALTO - M) {
        doc.addPage();
        y = M;
        encabezado();
        doc.setFont('helvetica', 'normal');
      }
      doc.setFontSize(8.5);
      let x = M + 1.5;
      celdas.forEach((lineas, i) => {
        doc.text(lineas, x, y + 3.8);
        x += COLUMNAS[i].ancho;
      });
      y += alto;
      doc.setDrawColor(215, 219, 226);
      doc.line(M, y, ANCHO - M, y);
    });
    y += 8;
  };

  seccion(`Con ${MAX_AVISOS} avisos o más`, 'El cliente no ha recogido: lo decide el gerente.', r.tresAvisos);
  seccion(`Más de ${DIAS_LIMITE} días abiertas`, 'Escalar con el proveedor o dar solución al cliente.', r.masDe30);
  seccion('Con nota de crédito', 'Aplicar cambio físico o, si ya no se maneja, a cuenta de otra compra.', r.notaCredito);

  // Firmas de la revisión
  nuevaPaginaSiHaceFalta(24);
  y += 10;
  doc.setDrawColor(120, 120, 120);
  doc.line(M + 20, y, M + 100, y);
  doc.line(ANCHO - M - 100, y, ANCHO - M - 20, y);
  doc.setFontSize(9);
  doc.text('Jefe de Operaciones', M + 60, y + 5, { align: 'center' });
  doc.text('Gerente de Ferretería y Pintura', ANCHO - M - 60, y + 5, { align: 'center' });

  return doc;
}

export function descargarReportePdf(r: ReporteSemanal): void {
  const fecha = r.generado.toISOString().slice(0, 10);
  crearReportePdf(r).save(`Reporte_garantias_${fecha}.pdf`);
}
