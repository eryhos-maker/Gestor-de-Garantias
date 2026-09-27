export type EstatusGarantia =
  | 'Sin Enviar'      // Recibida en tienda, falta mandarla al proveedor
  | 'En proceso'      // Embarcada al proveedor
  | 'En Tienda'       // Regresó del proveedor, espera al cliente
  | 'Nota de Crédito' // El proveedor la resolvió con nota de crédito
  | 'Listo';          // Entregada al cliente (cerrada)

export interface Garantia {
  folio: string;
  cliente: string;
  direccion: string;
  telefono: string;
  fechaRecibo: string; // ISO date string
  proveedor: string;
  motivo: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  observaciones: string;
  estatus: EstatusGarantia;
  fechaEmbarque?: string; // ISO date string
  fechaEntrega?: string; // ISO date string
  actualizado?: string; // ISO date string
}

/** Datos que captura la tienda; folio, estatus y fechas los pone el sistema. */
export type NuevaGarantia = Omit<Garantia, 'folio' | 'estatus' | 'fechaRecibo' | 'fechaEmbarque' | 'fechaEntrega' | 'actualizado'>;
