import { EstatusGarantia } from '../types';

export const ESTATUS: EstatusGarantia[] = ['Sin Enviar', 'En proceso', 'En Tienda', 'Nota de Crédito', 'Listo'];

/** Texto que ve el usuario (en la hoja se guarda el valor original). */
export const ETIQUETA_ESTATUS: Record<EstatusGarantia, string> = {
  'Sin Enviar': 'Sin enviar',
  'En proceso': 'Con proveedor',
  'En Tienda': 'En tienda',
  'Nota de Crédito': 'Nota de crédito',
  'Listo': 'Entregada',
};

export const COLOR_ESTATUS: Record<EstatusGarantia, string> = {
  'Sin Enviar': 'bg-slate-100 text-slate-700 border-slate-200',
  'En proceso': 'bg-blue-50 text-blue-700 border-blue-200',
  'En Tienda': 'bg-amber-50 text-amber-700 border-amber-200',
  'Nota de Crédito': 'bg-purple-50 text-purple-700 border-purple-200',
  'Listo': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

/** Convierte lo que venga de la hoja a un estatus válido (tolera mayúsculas y acentos). */
export function normalizarEstatus(valor: unknown): EstatusGarantia {
  const limpio = String(valor ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  const encontrado = ESTATUS.find(
    e => e.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') === limpio
  );
  return encontrado ?? 'Sin Enviar';
}

/** Días desde que se recibió la garantía (para detectar las que llevan mucho tiempo). */
export function diasDesde(fechaIso?: string): number | null {
  if (!fechaIso) return null;
  const t = new Date(fechaIso).getTime();
  if (isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86_400_000);
}

export function formatearFecha(fechaIso?: string): string {
  if (!fechaIso) return '—';
  const d = new Date(fechaIso);
  if (isNaN(d.getTime())) return fechaIso; // si en la hoja quedó texto, se muestra tal cual
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
