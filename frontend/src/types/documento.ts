export type TipoDocumento =
  | 'DUI'
  | 'Pasaporte'
  | 'Licencia de conducir'
  | 'Tarjeta de circulación';

export type AnticipacionDias = 7 | 14 | 21 | 30;

export type EstadoDocumento = 'Vigente' | 'Próximo a vencer' | 'Vencido';

export interface Documento {
  id: number;
  tipo: TipoDocumento | string;
  fecha_vencimiento: string;
  dias_anticipacion: number;
  creado_en?: string;
  usuario_id?: number;
}

export interface DocumentoPayload {
  tipo: TipoDocumento;
  fecha_vencimiento: string;
  dias_anticipacion: AnticipacionDias;
}