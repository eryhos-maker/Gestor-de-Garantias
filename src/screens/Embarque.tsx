import { useState } from 'react';
import { motion } from 'motion/react';
import { Truck } from 'lucide-react';
import { Garantia } from '../types';
import { api } from '../lib/api';
import { BusquedaFolio, DetalleGarantia, Aviso } from '../components/BusquedaFolio';

export default function Embarque() {
  const [garantia, setGarantia] = useState<Garantia | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const alEncontrar = (g: Garantia | null) => {
    setGarantia(g);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const procesarEmbarque = async () => {
    if (!garantia) return;
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // Tomamos lo que regresa la hoja para mostrar el estado real guardado.
      const actualizada = await api.actualizar(garantia.folio, {
        estatus: 'En proceso',
        fechaEmbarque: new Date().toISOString(),
      });
      setGarantia(actualizada);
      setSuccessMsg(`La garantía ${garantia.folio} se marcó como enviada al proveedor.`);
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al procesar el embarque');
    } finally {
      setIsSubmitting(false);
    }
  };

  const puedeEmbarcar = garantia?.estatus === 'Sin Enviar';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-800">Procesar Embarque</h2>
          <p className="text-sm text-slate-500 mt-1">Busque una garantía para enviarla a revisión o reparación.</p>
        </div>
        <div className="p-6">
          <BusquedaFolio etiqueta="Colocar Folio" onEncontrada={alEncontrar} />
          {errorMsg && <Aviso tipo="error" texto={errorMsg} />}
          {successMsg && <Aviso tipo="ok" texto={successMsg} />}
        </div>
      </div>

      {garantia && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-6">
            <DetalleGarantia g={garantia} />
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={procesarEmbarque}
                disabled={isSubmitting || !puedeEmbarcar}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-red text-white rounded-lg font-medium hover:bg-brand-red-light focus:ring-4 focus:ring-brand-red/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Truck size={18} />
                {isSubmitting ? 'Procesando...' : puedeEmbarcar ? 'Procesar Embarque' : 'Embarque ya procesado'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
