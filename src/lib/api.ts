/// <reference types="vite/client" />

import { Garantia, NuevaGarantia } from '../types';
import { normalizarEstatus } from './estatus';

/**
 * Conexión directa a Google Sheets a través de un Apps Script publicado
 * como aplicación web (ver apps-script/Code.gs).
 */
const API_URL = (import.meta.env.VITE_SHEETS_API_URL || '').trim();
const API_KEY = (import.meta.env.VITE_SHEETS_API_KEY || '').trim();

export const apiConfigurada = () => !!API_URL && !!API_KEY;

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`El servidor respondió ${res.status}`);
  let body: ApiResponse<T>;
  try {
    body = await res.json();
  } catch {
    throw new Error('Respuesta inválida de Google Sheets. Revisa que la URL del Apps Script sea la correcta (/exec).');
  }
  if (!body.ok) throw new Error((body as { error?: string }).error || 'Error desconocido');
  return (body as { data: T }).data;
}

function asegurarConfig() {
  if (!apiConfigurada()) {
    throw new Error('Falta configurar la conexión a Google Sheets (VITE_SHEETS_API_URL y VITE_SHEETS_API_KEY).');
  }
}

async function get<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  asegurarConfig();
  const qs = new URLSearchParams({ action, key: API_KEY, ...params });
  try {
    return await parseResponse<T>(await fetch(`${API_URL}?${qs.toString()}`));
  } catch (e) {
    throw aErrorAmigable(e);
  }
}

async function post<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  asegurarConfig();
  try {
    // text/plain evita la validación previa (CORS) que Apps Script no soporta.
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, key: API_KEY, ...payload }),
    });
    return await parseResponse<T>(res);
  } catch (e) {
    throw aErrorAmigable(e);
  }
}

function aErrorAmigable(e: unknown): Error {
  if (e instanceof TypeError) {
    return new Error('Sin conexión con Google Sheets. Revisa el internet e intenta de nuevo.');
  }
  return e instanceof Error ? e : new Error(String(e));
}

/** Acepta "GAR-0015", "gar-15" o "15" y regresa "GAR-0015". */
export function normalizarFolio(folio: string): string {
  const f = folio.trim().toUpperCase();
  const m = f.match(/^(?:GAR-?)?(\d+)$/);
  return m ? `GAR-${m[1].replace(/^0+(?=\d)/, '').padStart(4, '0')}` : f;
}

function filaAGarantia(row: Record<string, unknown>): Garantia {
  const texto = (v: unknown) => String(v ?? '').trim();
  const cantidad = parseInt(texto(row.cantidad), 10);
  return {
    folio: texto(row.folio).toUpperCase(),
    cliente: texto(row.cliente),
    direccion: texto(row.direccion),
    telefono: texto(row.telefono),
    fechaRecibo: texto(row.fechaRecibo),
    proveedor: texto(row.proveedor),
    motivo: texto(row.motivo),
    codigo: texto(row.codigo),
    descripcion: texto(row.descripcion),
    cantidad: isNaN(cantidad) || cantidad < 1 ? 1 : cantidad,
    observaciones: texto(row.observaciones),
    estatus: normalizarEstatus(row.estatus),
    fechaEmbarque: texto(row.fechaEmbarque) || undefined,
    fechaEntrega: texto(row.fechaEntrega) || undefined,
    avisos: Math.max(0, parseInt(texto(row.avisos), 10) || 0),
    ultimoAviso: texto(row.ultimoAviso) || undefined,
    actualizado: texto(row.actualizado) || undefined,
  };
}

export const api = {
  async listar(): Promise<Garantia[]> {
    const rows = await get<Record<string, unknown>[]>('list');
    return rows.map(filaAGarantia).filter(g => g.folio);
  },

  async buscarPorFolio(folio: string): Promise<Garantia | undefined> {
    const row = await get<Record<string, unknown> | null>('get', { folio: normalizarFolio(folio) });
    return row ? filaAGarantia(row) : undefined;
  },

  /** Solo de referencia: el folio definitivo lo asigna el servidor al guardar. */
  async siguienteFolio(): Promise<string> {
    return get<string>('nextFolio');
  },

  async registrar(datos: NuevaGarantia): Promise<Garantia> {
    const row = await post<Record<string, unknown>>('create', {
      data: { ...datos, fechaRecibo: new Date().toISOString() },
    });
    return filaAGarantia(row);
  },

  /** Suma 1 al contador de avisos al cliente (lo cuenta la hoja, no se pierde). */
  async registrarAviso(folio: string): Promise<Garantia> {
    const row = await post<Record<string, unknown>>('registrarAviso', { folio });
    return filaAGarantia(row);
  },

  async actualizar(folio: string, cambios: Partial<Garantia>): Promise<Garantia> {
    const row = await post<Record<string, unknown>>('update', { folio, data: cambios });
    return filaAGarantia(row);
  },
};
