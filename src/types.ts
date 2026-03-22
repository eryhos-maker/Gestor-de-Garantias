export type EstatusGarantia = 'Sin Enviar' | 'En proceso' | 'Listo';

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
}
