import { useState } from 'react';
import { motion } from 'motion/react';
import { PackageCheck, Store, Receipt, Printer, MessageCircle, BellRing } from 'lucide-react';
import { EstatusGarantia, Garantia } from '../types';
import { api } from '../lib/api';
import { ETIQUETA_ESTATUS, formatearFecha, MAX_AVISOS, fechaSiguienteAviso } from '../lib/estatus';
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
      setSuccessMsg(
        estatus === 'En Tienda' || estatus === 'Nota de Crédito'
          ? `La garantía ${garantia.folio} ahora está como "${ETIQUETA_ESTATUS[estatus]}". Envía ahora el aviso al cliente con el botón Avisar por WhatsApp.`
          : `La garantía ${garantia.folio} ahora está como "${ETIQUETA_ESTATUS[estatus]}".`,
      );
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al cambiar el estatus');
    } finally {
      setIsSubmitting(false);
    }
  };

  const registrarAviso = async (porWhatsApp = false) => {
    if (!garantia) return;
    // WhatsApp se abre primero (directo del clic) para que el navegador no lo bloquee.
    if (porWhatsApp && !enviarPorWhatsApp(garantia)) {
      setErrorMsg('El teléfono del cliente no tiene 10 dígitos; avísale por llamada y usa Registrar llamada.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const actualizada = await api.registrarAviso(garantia.folio);
      setGarantia(actualizada);
      setSuccessMsg(
        `Aviso ${actualizada.avisos} ${porWhatsApp ? 'enviado por WhatsApp y ' : ''}registrado para ${garantia.folio}.`,
      );
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al registrar el aviso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const estatus = garantia?.estatus;
  // Solo se avisa cuando el producto (o la nota) ya está en tienda.
  const listaParaAvisar = estatus === 'En Tienda' || estatus === 'Nota de Crédito';
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

            <div className="mt-6 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-sm">
                <span className="block text-slate-500">Avisos al cliente</span>
                <span className={`font-semibold ${garantia.avisos >= MAX_AVISOS ? 'text-red-600' : 'text-slate-800'}`}>
                  {garantia.avisos} de {MAX_AVISOS}
                </span>
                {garantia.ultimoAviso && (
                  <span className="text-slate-500"> · último: {formatearFecha(garantia.ultimoAviso)}</span>
                )}
                {(() => {
                  const sig = fechaSiguienteAviso(garantia);
                  return sig && !cerrada ? (
                    <span className="block text-xs text-slate-500 mt-1">
                      Siguiente aviso ({garantia.avisos + 1}º): {formatearFecha(sig.toISOString())}
                    </span>
                  ) : null;
                })()}
                {garantia.avisos >= MAX_AVISOS && !cerrada && (
                  <span className="block text-red-600 text-xs mt-1">Ya se dieron {MAX_AVISOS} avisos: lo decide el gerente.</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => registrarAviso(true)}
                  disabled={isSubmitting || cerrada || !listaParaAvisar || !garantia.telefono}
                  title={listaParaAvisar ? 'Abre WhatsApp con el mensaje para el cliente y cuenta el aviso' : 'Se avisa cuando está En tienda o con Nota de crédito'}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle size={16} />
                  Avisar por WhatsApp
                </button>
                <button
                  onClick={() => registrarAviso(false)}
                  disabled={isSubmitting || cerrada || !listaParaAvisar}
                  title="Si le avisaste por llamada, regístralo aquí"
                  className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BellRing size={16} />
                  Registrar llamada
                </button>
              </div>
            </div>

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
                {garantia.telefono && !listaParaAvisar && (
                  <button
                    onClick={() => enviarPorWhatsApp(garantia)}
                    title="Reenvía al cliente el comprobante de su garantía"
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-all"
                  >
                    <MessageCircle size={18} />
                    Enviar comprobante
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
