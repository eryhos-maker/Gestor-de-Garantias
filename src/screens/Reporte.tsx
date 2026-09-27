import { useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, Download, RefreshCw } from 'lucide-react';
import { Garantia } from '../types';
import { api } from '../lib/api';
import { armarReporte, descargarReportePdf, ReporteSemanal } from '../lib/reporte';
import { COLOR_ESTATUS, DIA_AVISO_2, DIA_AVISO_3, DIAS_LIMITE, ETIQUETA_ESTATUS, MAX_AVISOS, diasDesde, formatearFecha } from '../lib/estatus';
import { Aviso, EtiquetaEstatus } from '../components/BusquedaFolio';

/** Revisión semanal: Jefe de Operaciones + Gerente. */
export default function Reporte() {
  const [reporte, setReporte] = useState<ReporteSemanal | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const generar = async () => {
    setCargando(true);
    setError('');
    try {
      setReporte(armarReporte(await api.listar()));
    } catch (e: any) {
      setError(e.message || 'No se pudo generar el reporte');
    } finally {
      setCargando(false);
    }
  };

  const maxBarra = Math.max(1, ...(reporte?.porEstatus.map(e => e.total) ?? [1]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Revisión de los lunes</h2>
            <p className="text-sm text-slate-500 mt-1">
              Jefe de Operaciones: genera el reporte cada lunes, da los avisos que tocan y revisa con el gerente lo que requiere decisión.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generar}
              disabled={cargando}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-lg font-medium hover:bg-brand-blue-light disabled:opacity-50"
            >
              {reporte ? <RefreshCw size={18} /> : <ClipboardList size={18} />}
              {cargando ? 'Generando...' : reporte ? 'Actualizar' : 'Generar reporte'}
            </button>
            {reporte && (
              <button
                onClick={() => descargarReportePdf(reporte)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
              >
                <Download size={18} /> PDF
              </button>
            )}
          </div>
        </div>
        {error && <div className="px-6 pb-6"><Aviso tipo="error" texto={error} /></div>}

        {reporte && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500">Garantías abiertas</p>
              <p className="text-4xl font-semibold text-slate-800">{reporte.abiertas}</p>
              <p className="text-xs text-slate-500 mt-1">Generado {reporte.generado.toLocaleString('es-MX')}</p>
            </div>
            <div className="space-y-2">
              {reporte.porEstatus.map(e => (
                <div key={e.estatus} className="flex items-center gap-3 text-sm">
                  <span className="w-32 text-slate-600">{ETIQUETA_ESTATUS[e.estatus]}</span>
                  <div className="flex-1 h-5 bg-slate-100 rounded">
                    <div
                      className={`h-5 rounded border ${COLOR_ESTATUS[e.estatus]}`}
                      style={{ width: `${(e.total / maxBarra) * 100}%`, minWidth: e.total ? '0.5rem' : 0 }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium text-slate-800">{e.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {reporte && (
        <>
          <Seccion
            titulo="Avisos que tocan esta semana"
            accion={`Dar el 2º aviso (día ${DIA_AVISO_2}) o el 3º (día ${DIA_AVISO_3}) con el botón Avisar por WhatsApp en Consulta.`}
            lista={reporte.avisosPendientes}
          />
          <Seccion
            titulo={`Con ${MAX_AVISOS} avisos o más`}
            accion="El cliente no ha recogido: lo decide el gerente."
            lista={reporte.tresAvisos}
          />
          <Seccion
            titulo={`Más de ${DIAS_LIMITE} días abiertas (sin nota de crédito)`}
            accion="Escalar con el proveedor o dar solución al cliente."
            lista={reporte.masDe30}
          />
          <Seccion
            titulo="Con nota de crédito"
            accion="Aplicar cambio físico o, si el proveedor ya no lo maneja, a cuenta de otra compra."
            lista={reporte.notaCredito}
          />
        </>
      )}
    </motion.div>
  );
}

function Seccion({ titulo, accion, lista }: { titulo: string; accion: string; lista: Garantia[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">
          {titulo} <span className="text-slate-400 font-normal">({lista.length})</span>
        </h3>
        <p className="text-sm text-slate-500">{accion}</p>
      </div>
      {lista.length === 0 ? (
        <p className="px-6 py-4 text-sm text-slate-500">Sin garantías en esta categoría.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Folio</th>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Teléfono</th>
                <th className="px-4 py-2 font-medium">Proveedor</th>
                <th className="px-4 py-2 font-medium">Producto</th>
                <th className="px-4 py-2 font-medium">Estatus</th>
                <th className="px-4 py-2 font-medium">Recibida</th>
                <th className="px-4 py-2 font-medium text-right">Días</th>
                <th className="px-4 py-2 font-medium text-right">Avisos</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(g => (
                <tr key={g.folio} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-mono">{g.folio}</td>
                  <td className="px-4 py-2">{g.cliente}</td>
                  <td className="px-4 py-2">{g.telefono || '—'}</td>
                  <td className="px-4 py-2">{g.proveedor || '—'}</td>
                  <td className="px-4 py-2">{[g.codigo, g.descripcion].filter(Boolean).join(' - ')}</td>
                  <td className="px-4 py-2"><EtiquetaEstatus g={g} /></td>
                  <td className="px-4 py-2 whitespace-nowrap">{formatearFecha(g.fechaRecibo)}</td>
                  <td className="px-4 py-2 text-right">{diasDesde(g.fechaRecibo) ?? '—'}</td>
                  <td className="px-4 py-2 text-right">{g.avisos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
