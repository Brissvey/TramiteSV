
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from '../database/database.service';

interface DatosDocumento {
  tipo: string;
  fecha_vencimiento: string;
  dias_anticipacion: number;
  dia_corte?: number;
  dia_pago?: number;
}

@Injectable()
export class DocumentosService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async obtenerTodos(usuarioId: number) {
    const conexion = await this.databaseService.getConnection();

    try {
      const [filas] = await conexion.execute(
        'SELECT * FROM documentos WHERE usuario_id = ? ORDER BY id DESC',
        [usuarioId],
      );

      return filas;
    } finally {
      conexion.release();
    }
  }

  async crear(datos: DatosDocumento, usuarioId: number) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaVencimiento = new Date(
      `${datos.fecha_vencimiento}T00:00:00`,
    );

    if (
      Number.isNaN(fechaVencimiento.getTime()) ||
      fechaVencimiento <= hoy
    ) {
      throw new BadRequestException(
        'La fecha de vencimiento debe ser posterior a hoy',
      );
    }

    if (
      datos.tipo === 'Tarjeta de crédito' &&
      (datos.dia_corte == null || datos.dia_pago == null)
    ) {
      throw new BadRequestException(
        'La tarjeta de crédito requiere día de corte y día de pago',
      );
    }

    const diaCorte =
      datos.tipo === 'Tarjeta de crédito' ? datos.dia_corte : null;

    const diaPago =
      datos.tipo === 'Tarjeta de crédito' ? datos.dia_pago : null;

    const conexion = await this.databaseService.getConnection();

    try {
      const [resultado] = await conexion.query(
        `INSERT INTO documentos
          (tipo, fecha_vencimiento, dias_anticipacion, dia_corte, dia_pago, usuario_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          datos.tipo,
          datos.fecha_vencimiento,
          datos.dias_anticipacion,
          diaCorte,
          diaPago,
          usuarioId,
        ],
      );

      const documentoId = (
        resultado as { insertId: number }
      ).insertId;

      this.eventEmitter.emit('DOCUMENTO_REGISTRADO', {
        documentoId,
        usuarioId,
        tipo: datos.tipo,
        fechaVencimiento: datos.fecha_vencimiento,
        diasAnticipacion: datos.dias_anticipacion,
      });

      return {
        mensaje: 'Documento registrado correctamente',
        id: documentoId,
      };
    } finally {
      conexion.release();
    }
  }

  async actualizar(
    id: number,
    datos: DatosDocumento,
    usuarioId: number,
  ) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaVencimiento = new Date(
      `${datos.fecha_vencimiento}T00:00:00`,
    );

    if (
      Number.isNaN(fechaVencimiento.getTime()) ||
      fechaVencimiento <= hoy
    ) {
      throw new BadRequestException(
        'La fecha de vencimiento debe ser posterior a hoy',
      );
    }

    if (
      datos.tipo === 'Tarjeta de crédito' &&
      (datos.dia_corte == null || datos.dia_pago == null)
    ) {
      throw new BadRequestException(
        'La tarjeta de crédito requiere día de corte y día de pago',
      );
    }

    const diaCorte =
      datos.tipo === 'Tarjeta de crédito' ? datos.dia_corte : null;

    const diaPago =
      datos.tipo === 'Tarjeta de crédito' ? datos.dia_pago : null;

    const conexion = await this.databaseService.getConnection();

    try {
      const [resultado] = await conexion.query(
        `UPDATE documentos
         SET tipo = ?, fecha_vencimiento = ?, dias_anticipacion = ?,
             dia_corte = ?, dia_pago = ?
         WHERE id = ? AND usuario_id = ?`,
        [
          datos.tipo,
          datos.fecha_vencimiento,
          datos.dias_anticipacion,
          diaCorte,
          diaPago,
          id,
          usuarioId,
        ],
      );

      const filasAfectadas = (
        resultado as { affectedRows: number }
      ).affectedRows;

      if (filasAfectadas === 0) {
        throw new NotFoundException(
          'No se encontró el documento solicitado',
        );
      }

      return {
        mensaje: 'Documento actualizado correctamente',
        id,
      };
    } finally {
      conexion.release();
    }
  }

  async eliminar(id: number, usuarioId: number) {
    const conexion = await this.databaseService.getConnection();

    try {
      const [resultado] = await conexion.execute(
        'DELETE FROM documentos WHERE id = ? AND usuario_id = ?',
        [id, usuarioId],
      );

      const filasAfectadas = (
        resultado as { affectedRows: number }
      ).affectedRows;

      if (filasAfectadas === 0) {
        throw new NotFoundException(
          'No se encontró el documento solicitado',
        );
      }

      return {
        mensaje: 'Documento eliminado correctamente',
        id,
      };
    } finally {
      conexion.release();
    }
  }
}
