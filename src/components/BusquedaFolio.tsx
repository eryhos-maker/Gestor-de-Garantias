import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Garantia } from '../types';
import { api } from '../lib/api';
import { COLOR_ESTATUS, ETIQUETA_ESTATUS, diasDesde, formatearFecha } from '../lib/estatus';

interface Props {
  etiqueta: string;
  onEncontrada: (g: Garantia | null) => void;
}

/** Buscador de folio compartido por Embarque y Consulta. Acepta "15", "gar-15" o "GAR-0015". */
export function BusquedaFolio({ etiqueta, onEncontrada }: Props) {
  const [folio, setFolio] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folio.trim()) return;
    setError('');
    setBuscando(true);
    try {
      const g = await api.buscarPorFolio(folio);
      onEncontrada(g ?? null);
      if (!g) setError('No se encontró ninguna garantía con ese folio.');
    } catch (err: any) {
      onEncontrada(null);
      setError(err.message || 'Error al buscar la garantía');
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div>
      <form onSubmit={buscar} className="flex gap-4 items-end">
        <div className="flex-1 space-y-2">
          <label className="block text-sm font-medium text-slate-700">{etiqueta}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={folio}
              onChange={e => setFolio(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-sm transition-all uppercase"
              placeholder="Ej. GAR-0015 o solo 15"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!folio.trim() || buscando}
          className="px-6 py-2.5 bg-brand-blue text-white rounded-lg font-medium hover:bg-brand-blue-light transition-colors disabled:opacity-50"
        >
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
      {error && <Aviso tipo="error" texto={error} />}
    </div>
  );
}

export function Aviso({ tipo, texto }: { tipo: 'error' | 'ok'; texto: string }) {
  const Icono = tipo === 'error' ? AlertCircle : CheckCircle2;
  const cls =
    tipo === 'error'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return (
    <div className={`mt-4 p-4 rounded-lg text-sm font-medium border flex items-center gap-2 ${cls}`}>
      <Icono size={18} className="shrink-0" />
      {texto}
    </div>
  );
}

export function EtiquetaEstatus({ g }: { g: Garantia }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${COLOR_ESTATUS[g.estatus]}`}>
      {ETIQUETA_ESTATUS[g.estatus]}
    </span>
  );
}

/** Tarjeta con los datos de la garantía. */
export function DetalleGarantia({ g }: { g: Garantia }) {
  const dias = g.estatus === 'Listo' ? null : diasDesde(g.fechaRecibo);
  return (
    <>
      <div className="flex justify-between items-start mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Detalles de la Garantía</h3>
          <p className="text-sm text-slate-500">
            Folio: <span className="font-mono font-medium text-slate-700">{g.folio}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <EtiquetaEstatus g={g} />
          {dias !== null && (
            <span className={`text-xs ${dias > 30 ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
              {dias} {dias === 1 ? 'día' : 'días'} abierta
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
        <Dato titulo="Cliente" valor={g.cliente} />
        <Dato titulo="Teléfono" valor={g.telefono} />
        <Dato titulo="Proveedor" valor={g.proveedor} />
        <Dato titulo="Cantidad" valor={String(g.cantidad)} />
        <Dato titulo="Producto" valor={[g.codigo, g.descripcion].filter(Boolean).join(' - ')} ancho />
        <Dato titulo="Motivo de descompostura" valor={g.motivo} ancho />
        {g.observaciones && <Dato titulo="Observaciones" valor={g.observaciones} ancho />}
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm text-slate-500 mt-4">
        <Dato titulo="Recibida" valor={formatearFecha(g.fechaRecibo)} />
        <Dato titulo="Enviada a proveedor" valor={formatearFecha(g.fechaEmbarque)} />
        <Dato titulo="Entregada" valor={formatearFecha(g.fechaEntrega)} />
      </div>
    </>
  );
}

function Dato({ titulo, valor, ancho }: { titulo: string; valor?: string; ancho?: boolean }) {
  return (
    <div className={ancho ? 'sm:col-span-2' : ''}>
      <span className="block text-slate-500 mb-1">{titulo}</span>
      <span className="font-medium text-slate-800 break-words">{valor || 'N/A'}</span>
    </div>
  );
}
