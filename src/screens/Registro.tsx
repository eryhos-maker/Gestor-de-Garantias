import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Garantia } from '../types';
import { LOGO_SVG_STRING } from '../components/Logo';

interface Props {
  onRegistrar: (garantia: Garantia) => Promise<void>;
}

export default function Registro({ onRegistrar }: Props) {
  const [folio, setFolio] = useState('');
  const [cliente, setCliente] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [motivo, setMotivo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const generateFolio = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    setFolio(`GAR-${randomNum}`);
  };

  useEffect(() => {
    generateFolio();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const nuevaGarantia: Garantia = {
        folio,
        cliente,
        direccion,
        telefono,
        fechaRecibo: new Date().toISOString(),
        proveedor,
        motivo,
        codigo,
        descripcion,
        cantidad,
        observaciones,
        estatus: 'Sin Enviar'
      };

      await onRegistrar(nuevaGarantia);
      
      // Generar y descargar PDF para ticketera
      generarTicketPDF(nuevaGarantia);

      setSuccessMsg(`Garantía ${folio} registrada exitosamente. El ticket se ha descargado.`);
      
      // Reset form
      generateFolio();
      setCliente('');
      setDireccion('');
      setTelefono('');
      setProveedor('');
      setMotivo('');
      setCodigo('');
      setDescripcion('');
      setCantidad(1);
      setObservaciones('');
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al registrar la garantía');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generarTicketPDF = (garantia: Garantia) => {
    // Epson TM-T88 es una impresora térmica de 80mm.
    // Creamos un PDF con 80mm de ancho y 150mm de alto (ticket estándar).
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 150]
    });

    let y = 8;
    const margin = 4;
    const width = 80;
    const contentWidth = width - (margin * 2);

    const printCentered = (text: string, yPos: number, size: number, style: 'normal' | 'bold' = 'normal') => {
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      const textWidth = doc.getTextWidth(text);
      const x = (width - textWidth) / 2;
      doc.text(text, x, yPos);
    };

    const printKeyValue = (key: string, value: string, yPos: number) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${key}:`, margin, yPos);
      
      doc.setFont('helvetica', 'normal');
      const keyWidth = doc.getTextWidth(`${key}: `);
      const lines = doc.splitTextToSize(value || 'N/A', contentWidth - keyWidth);
      doc.text(lines, margin + keyWidth, yPos);
      
      return lines.length * 4; // Aprox 4mm de alto por línea
    };

    // Encabezado
    try {
      // Add SVG Logo
      // Convert SVG string to base64
      const svgBase64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(LOGO_SVG_STRING)));
      // Center the logo (width 40, height 17.6)
      doc.addImage(svgBase64, 'SVG', 20, y, 40, 17.6);
      y += 22;
    } catch (e) {
      // Fallback if SVG rendering fails in jsPDF
      printCentered('Ferre Don Nico', y, 14, 'bold');
      y += 6;
    }

    printCentered('COMPROBANTE DE GARANTIA', y, 11, 'bold');
    y += 6;
    printCentered(`FOLIO: ${garantia.folio}`, y, 14, 'bold');
    y += 6;

    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y, width - margin, y);
    y += 5;

    // Info General
    y += printKeyValue('Fecha', new Date(garantia.fechaRecibo).toLocaleDateString(), y);
    y += printKeyValue('Cliente', garantia.cliente, y);
    if (garantia.telefono) y += printKeyValue('Tel', garantia.telefono, y);
    
    y += 2;
    doc.line(margin, y, width - margin, y);
    y += 5;

    // Producto
    printCentered('DATOS DEL PRODUCTO', y, 10, 'bold');
    y += 6;

    y += printKeyValue('Prov.', garantia.proveedor, y);
    y += printKeyValue('Cód.', garantia.codigo, y);
    y += printKeyValue('Desc.', garantia.descripcion, y);
    y += printKeyValue('Cant.', garantia.cantidad.toString(), y);
    
    y += 2;
    doc.line(margin, y, width - margin, y);
    y += 5;

    // Detalles
    printCentered('DETALLES', y, 10, 'bold');
    y += 6;

    y += printKeyValue('Motivo', garantia.motivo, y);
    if (garantia.observaciones) {
      y += printKeyValue('Obs.', garantia.observaciones, y);
    }

    y += 4;
    doc.line(margin, y, width - margin, y);
    y += 6;

    // Pie de página
    printCentered('Conserve este ticket para', y, 8, 'normal');
    y += 4;
    printCentered('cualquier aclaracion.', y, 8, 'normal');

    // Nombre del archivo: Folio_NombreCliente.pdf
    const safeClienteName = garantia.cliente.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${garantia.folio}_${safeClienteName}.pdf`;
    
    doc.save(fileName);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-slate-800">Registro de Garantía</h2>
        <p className="text-sm text-slate-500 mt-1">Capture los datos de la nueva solicitud.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {successMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Folio */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Folio *</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                required
                value={folio}
                className="flex-1 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                placeholder="Generando folio..."
              />
            </div>
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Cliente *</label>
            <input
              type="text"
              required
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Nombre completo"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="10 dígitos"
            />
          </div>

          {/* Proveedor */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Proveedor</label>
            <select
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all bg-white"
            >
              <option value="">Seleccione un proveedor</option>
              <option value="Truper">Truper</option>
              <option value="IUSA">IUSA</option>
              <option value="Rotoplas">Rotoplas</option>
              <option value="Mendoza">Mendoza</option>
            </select>
          </div>

          {/* Dirección */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Dirección</label>
            <textarea
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="Dirección completa"
            />
          </div>

          {/* Código */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Código de Producto</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="SKU o Código"
            />
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Cantidad</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Descripción del Producto</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="¿Qué producto es?"
            />
          </div>

          {/* Motivo */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Motivo de Descompostura</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="Describa la falla reportada por el cliente"
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="Notas adicionales (opcional)"
            />
          </div>

          {/* Estatus (Solo lectura) */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Estatus Inicial</label>
            <input
              type="text"
              readOnly
              value="Sin Enviar"
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500">El estatus se asigna automáticamente y no puede ser modificado aquí.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !folio || !cliente}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-red text-white rounded-lg font-medium hover:bg-brand-red-light focus:ring-4 focus:ring-brand-red/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {isSubmitting ? 'Guardando...' : 'Guardar / Registrar'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
