import { useState } from 'react';
import { motion } from 'motion/react';
import { PackageCheck, Store, Receipt, Printer, MessageCircle } from 'lucide-react';
import { EstatusGarantia, Garantia } from '../types';
import { api } from '../lib/api';
import { ETIQUETA_ESTATUS } from '../lib/estatus';
import { imprimirTicket, enviarPorWhatsApp } from '../lib/ticket';
import { BusquedaFolio, DetalleGarantia, Aviso } from '../components/BusquedaFolio';

export default function Consulta() {
  const [garantia, setGarantia] = useState<Garantia | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmarEntrega, setConfirmarEntrega] = useState(false);

  const alEncontrar = (g: Garantia | null) => {
    setGarantia(g);
    setErrorMsg('');
    setSuccessMsg('');
    setConfirmarEntrega(false);
  };

  const cambiarEstatus = async (estatus: EstatusGarantia) => {
    if (!garantia) return;
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    setConfirmarEntrega(false);
    try {
      const cambios: Partial<Garantia> = { estatus };
      if (estatus === 'Listo') cambios.fechaEntrega = new Date().toISOString();
      const actualizada = await api.actualizar(garantia.folio, cambios);
      setGarantia(actualizada);
      setSuccessMsg(`La garantía ${garantia.folio} ahora está como "${ETIQUETA_ESTATUS[estatus]}".`);
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al cambiar el estatus');
    } finally {
      setIsSubmitting(false);
    }
  };

  const estatus = garantia?.estatus;
  const cerrada = estatus === 'Listo';
  // Si todavía no regresa del proveedor, pedimos confirmar antes de entregar.
  const entregaAnticipada = estatus === 'Sin Enviar' || estatus === 'En proceso';

  const clickEntregar = () => {
    if (entregaAnticipada && !confirmarEntrega) {
      setConfirmarEntrega(true);
      return;
    }
    cambiarEstatus('Listo');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-800">Consulta y Entrega</h2>
          <p className="text-sm text-slate-500 mt-1">
            Revise el estado de una garantía, actualícela o márquela como entregada al cliente.
          </p>
        </div>
        <div className="p-6">
          <BusquedaFolio etiqueta="Ingresar Folio" onEncontrada={alEncontrar} />
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

            {confirmarEntrega && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                Esta garantía aún no regresa del proveedor ({ETIQUETA_ESTATUS[garantia.estatus].toLowerCase()}).
                Si de todos modos se entrega al cliente, presione <strong>Confirmar entrega</strong>.
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap justify-between gap-3">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => imprimirTicket(garantia)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-all"
                >
                  <Printer size={18} />
                  Reimprimir ticket
                </button>
                {garantia.telefono && (
                  <button
                    onClick={() => enviarPorWhatsApp(garantia)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-all"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => cambiarEstatus('En Tienda')}
                  disabled={isSubmitting || cerrada || estatus === 'En Tienda'}
                  title="El producto regresó del proveedor y espera al cliente"
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 focus:ring-4 focus:ring-amber-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Store size={18} />
                  En tienda
                </button>

                <button
                  onClick={() => cambiarEstatus('Nota de Crédito')}
                  disabled={isSubmitting || cerrada || estatus === 'Nota de Crédito'}
                  title="El proveedor resolvió con nota de crédito"
                  className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:ring-4 focus:ring-purple-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Receipt size={18} />
                  Nota de crédito
                </button>

                <button
                  onClick={clickEntregar}
                  disabled={isSubmitting || cerrada}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PackageCheck size={18} />
                  {isSubmitting
                    ? 'Procesando...'
                    : cerrada
                      ? 'Garantía entregada'
                      : confirmarEntrega
                        ? 'Confirmar entrega'
                        : 'Entregar al cliente'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
