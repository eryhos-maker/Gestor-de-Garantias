import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Garantia } from '../types';

interface Props {
  onBuscar: (folio: string) => Promise<Garantia | undefined>;
  onActualizar: (folio: string, actualizaciones: Partial<Garantia>) => Promise<void>;
}

export default function Embarque({ onBuscar, onActualizar }: Props) {
  const [folioBusqueda, setFolioBusqueda] = useState('');
  const [garantiaEncontrada, setGarantiaEncontrada] = useState<Garantia | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!folioBusqueda.trim()) return;

    setIsSubmitting(true);
    try {
      const resultado = await onBuscar(folioBusqueda.trim());
      if (resultado) {
        setGarantiaEncontrada(resultado);
      } else {
        setGarantiaEncontrada(null);
        setErrorMsg('No se encontró ninguna garantía con ese folio.');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al buscar la garantía');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcesarEmbarque = async () => {
    if (!garantiaEncontrada) return;
    
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await onActualizar(garantiaEncontrada.folio, {
        estatus: 'En proceso',
        fechaEmbarque: new Date().toISOString()
      });
      
      setSuccessMsg(`La garantía ${garantiaEncontrada.folio} ha sido actualizada a "En proceso".`);
      // Update local state to reflect changes immediately
      setGarantiaEncontrada({
        ...garantiaEncontrada,
        estatus: 'En proceso',
        fechaEmbarque: new Date().toISOString()
      });
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al procesar el embarque');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Search Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-800">Procesar Embarque</h2>
          <p className="text-sm text-slate-500 mt-1">Busque una garantía para enviarla a revisión o reparación.</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleBuscar} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="block text-sm font-medium text-slate-700">Colocar Folio</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={folioBusqueda}
                  onChange={(e) => setFolioBusqueda(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-sm transition-all"
                  placeholder="Ingrese el folio a buscar..."
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!folioBusqueda.trim()}
              className="px-6 py-2.5 bg-brand-blue text-white rounded-lg font-medium hover:bg-brand-blue-light transition-colors disabled:opacity-50"
            >
              Buscar
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200 flex items-center gap-2">
              <AlertCircle size={18} />
              {errorMsg}
            </div>
          )}
          
          {successMsg && (
            <div className="mt-4 p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 size={18} />
              {successMsg}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {garantiaEncontrada && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Detalles de la Garantía</h3>
                <p className="text-sm text-slate-500">Folio: <span className="font-mono font-medium text-slate-700">{garantiaEncontrada.folio}</span></p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                garantiaEncontrada.estatus === 'Sin Enviar' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                garantiaEncontrada.estatus === 'En proceso' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                garantiaEncontrada.estatus === 'En Tienda' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                garantiaEncontrada.estatus === 'Nota de Crédito' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {garantiaEncontrada.estatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <span className="block text-slate-500 mb-1">Cliente</span>
                <span className="font-medium text-slate-800">{garantiaEncontrada.cliente}</span>
              </div>
              <div>
                <span className="block text-slate-500 mb-1">Fecha de Recibo</span>
                <span className="font-medium text-slate-800">
                  {new Date(garantiaEncontrada.fechaRecibo).toLocaleDateString()}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-slate-500 mb-1">Producto</span>
                <span className="font-medium text-slate-800">
                  {garantiaEncontrada.codigo} - {garantiaEncontrada.descripcion} (Cant: {garantiaEncontrada.cantidad})
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-slate-500 mb-1">Motivo de Descompostura</span>
                <span className="text-slate-700">{garantiaEncontrada.motivo || 'No especificado'}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleProcesarEmbarque}
                disabled={isSubmitting || garantiaEncontrada.estatus !== 'Sin Enviar'}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-red text-white rounded-lg font-medium hover:bg-brand-red-light focus:ring-4 focus:ring-brand-red/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Truck size={18} />
                {isSubmitting ? 'Procesando...' : 
                 garantiaEncontrada.estatus === 'Sin Enviar' ? 'Procesar Embarque' : 
                 'Embarque ya procesado'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
