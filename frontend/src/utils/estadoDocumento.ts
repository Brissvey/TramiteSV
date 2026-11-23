import type { EstadoDocumento } from '../types/documento';

export interface InfoVencimiento {
  diasRestantes: number;
  estado: EstadoDocumento;
  textoDias: string;
  fechaFormateada: string;
}

function parseFechaLocal(fechaStr: string): Date {
  const soloFecha = fechaStr.split('T')[0];
  const [anio, mes, dia] = soloFecha.split('-').map(Number);
  return new Date(anio, mes - 1, dia, 0, 0, 0, 0);
}

export function calcularInfoVencimiento(
  fechaVencimiento: string,
  diasAnticipacion: number
): InfoVencimiento {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const vencimiento = parseFechaLocal(fechaVencimiento);
  const diffMs = vencimiento.getTime() - hoy.getTime();
  const diasRestantes = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let estado: EstadoDocumento = 'Vigente';
  if (diasRestantes < 0) {
    estado = 'Vencido';
  } else if (diasRestantes <= diasAnticipacion) {
    estado = 'Próximo a vencer';
  }

  let textoDias = '';
  if (diasRestantes < 0) {
    const abs = Math.abs(diasRestantes);
    textoDias = abs === 1 ? 'Venció hace 1 día' : `Venció hace ${abs} días`;
  } else if (diasRestantes === 0) {
    textoDias = 'Vence hoy';
  } else if (diasRestantes === 1) {
    textoDias = 'Falta 1 día';
  } else {
    textoDias = `Faltan ${diasRestantes} días`;
  }

  const fechaFormateada = vencimiento.toLocaleDateString('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return {
    diasRestantes,
    estado,
    textoDias,
    fechaFormateada,
  };
}