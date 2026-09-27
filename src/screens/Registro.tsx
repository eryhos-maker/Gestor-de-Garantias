import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Printer, Download } from 'lucide-react';
import { Garantia } from '../types';
import { api } from '../lib/api';
import { descargarTicket, imprimirTicket } from '../lib/ticket';

const PROVEEDORES = ['Truper', 'IUSA', 'Rotoplas', 'Mendoza'];

const VACIO = {
  cliente: '',
  direccion: '',
  telefono: '',
  proveedor: '',
  motivo: '',
  codigo: '',
  descripcion: '',
  cantidad: 1,
  observaciones: '',
};

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all';

export default function Registro() {
  const [form, setForm] = useState(VACIO);
  const [folioSiguiente, setFolioSiguiente] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrada, setRegistrada] = useState<Garantia | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const set = <K extends keyof typeof VACIO>(campo: K, valor: (typeof VACIO)[K]) =>
    setForm(f => ({ ...f, [campo]: valor }));

  const cargarFolio = async () => {
    try {
      setFolioSiguiente(await api.siguienteFolio());
    } catch {
      setFolioSiguiente('');
    }
  };

  useEffect(() => {
    cargarFolio();
  }, []);

  const telefonoLimpio = form.telefono.replace(/\D/g, '');
  const telefonoInvalido = form.telefono.trim() !== '' && telefonoLimpio.length !== 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (telefonoInvalido) {
      setErrorMsg('El teléfono debe tener 10 dígitos.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    setRegistrada(null);

    try {
      // El folio lo asigna el servidor al guardar: así nunca se repite
      // aunque dos cajas registren al mismo tiempo.
      const garantia = await api.registrar({
        cliente: form.cliente.trim(),
        direccion: form.direccion.trim(),
        telefono: telefonoLimpio,
        proveedor: form.proveedor.trim(),
        motivo: form.motivo.trim(),
        codigo: form.codigo.trim(),
        descripcion: form.descripcion.trim(),
        cantidad: form.cantidad,
        observaciones: form.observaciones.trim(),
      });

      setRegistrada(garantia);
      descargarTicket(garantia);
      setForm(VACIO);
      cargarFolio();
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al registrar la garantía');
    } finally {
      setIsSubmitting(false);
    }
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
        {registrada && (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-sm border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>
              Garantía <strong className="font-mono">{registrada.folio}</strong> registrada. El ticket se descargó.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => imprimirTicket(registrada)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-medium hover:bg-emerald-700"
              >
                <Printer size={14} /> Imprimir
              </button>
              <button
                type="button"
                onClick={() => descargarTicket(registrada)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-700 border border-emerald-300 rounded-md text-xs font-medium hover:bg-emerald-100"
              >
                <Download size={14} /> Descargar otra vez
              </button>
            </div>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Folio</label>
            <input
              type="text"
              readOnly
              value={folioSiguiente || 'Se asigna al guardar'}
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 cursor-not-allowed font-mono"
            />
            <p className="text-xs text-slate-500">Se confirma al guardar.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Cliente *</label>
            <input
              type="text"
              required
              value={form.cliente}
              onChange={e => set('cliente', e.target.value)}
              className={inputCls}
              placeholder="Nombre completo"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Teléfono</label>
            <input
              type="tel"
              inputMode="numeric"
              value={form.telefono}
              onChange={e => set('telefono', e.target.value)}
              className={`${inputCls} ${telefonoInvalido ? 'border-red-400' : ''}`}
              placeholder="10 dígitos"
            />
            {telefonoInvalido && <p className="text-xs text-red-600">Debe tener 10 dígitos.</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Proveedor</label>
            <input
              list="proveedores"
              value={form.proveedor}
              onChange={e => set('proveedor', e.target.value)}
              className={inputCls}
              placeholder="Elija o escriba el proveedor"
            />
            <datalist id="proveedores">
              {PROVEEDORES.map(p => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Dirección</label>
            <textarea
              value={form.direccion}
              onChange={e => set('direccion', e.target.value)}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="Dirección completa"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Código de Producto</label>
            <input
              type="text"
              value={form.codigo}
              onChange={e => set('codigo', e.target.value)}
              className={inputCls}
              placeholder="SKU o Código"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Cantidad</label>
            <input
              type="number"
              min="1"
              value={form.cantidad}
              onChange={e => set('cantidad', Math.max(1, parseInt(e.target.value) || 1))}
              className={inputCls}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Descripción del Producto *</label>
            <input
              type="text"
              required
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              className={inputCls}
              placeholder="¿Qué producto es?"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Motivo de Descompostura *</label>
            <textarea
              required
              value={form.motivo}
              onChange={e => set('motivo', e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Describa la falla reportada por el cliente"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Observaciones</label>
            <textarea
              value={form.observaciones}
              onChange={e => set('observaciones', e.target.value)}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="Notas adicionales (opcional)"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500">Estatus inicial: <strong>Sin enviar</strong></p>
          <button
            type="submit"
            disabled={isSubmitting || !form.cliente.trim()}
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
