import { EstatusGarantia } from '../types';

/** Reglas del proceso (ver manual): máximo de avisos y días antes de escalar. */
export const MAX_AVISOS = 3;
export const DIAS_LIMITE = 30;
/** Calendario de avisos: el 1º al marcar En tienda / Nota de crédito, el 2º a los 6 días y el 3º a los 15 días. */
export const DIA_AVISO_2 = 6;
export const DIA_AVISO_3 = 15;

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

/**
 * ¿Toca dar otro aviso al cliente? Solo aplica a garantías En tienda o con Nota de crédito.
 * Como la hoja guarda la fecha del último aviso, el 2º toca 6 días después del 1º
 * y el 3º, 9 días después del 2º (día 15 si se avisó a tiempo).
 */
export function avisoPendiente(g: { estatus: EstatusGarantia; avisos: number; ultimoAviso?: string }):
  { numero: 2 | 3; dias: number; vencido: boolean } | null {
  if (g.estatus !== 'En Tienda' && g.estatus !== 'Nota de Crédito') return null;
  const dias = diasDesde(g.ultimoAviso);
  if (g.avisos === 1 && dias !== null) return { numero: 2, dias, vencido: dias >= DIA_AVISO_2 };
  if (g.avisos === 2 && dias !== null) return { numero: 3, dias, vencido: dias >= DIA_AVISO_3 - DIA_AVISO_2 };
  return null;
}

/** Fecha en que toca el siguiente aviso (o null si ya no aplica). */
export function fechaSiguienteAviso(g: { estatus: EstatusGarantia; avisos: number; ultimoAviso?: string }): Date | null {
  const p = avisoPendiente(g);
  if (!p || !g.ultimoAviso) return null;
  const base = new Date(g.ultimoAviso).getTime();
  const espera = p.numero === 2 ? DIA_AVISO_2 : DIA_AVISO_3 - DIA_AVISO_2;
  return new Date(base + espera * 86_400_000);
}
