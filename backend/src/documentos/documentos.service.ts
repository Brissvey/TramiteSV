
import {
    BadRequestException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { EventEmitter2 } from '@nestjs/event-emitter';
  import { DatabaseService } from '../database/database.service';
  
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
  
    async crear(
      datos: {
        tipo: string;
        fecha_vencimiento: string;
        dias_anticipacion: number;
      },
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
  
      const conexion = await this.databaseService.getConnection();
  
      try {
        const [resultado] = await conexion.execute(
          `INSERT INTO documentos
            (tipo, fecha_vencimiento, dias_anticipacion, usuario_id)
           VALUES (?, ?, ?, ?)`,
          [
            datos.tipo,
            datos.fecha_vencimiento,
            datos.dias_anticipacion,
            usuarioId,
          ],
        );
  
        const documentoId = (
          resultado as { insertId: number }
        ).insertId;
  
        // Emitir el evento después de registrar el documento.
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
      datos: {
        tipo: string;
        fecha_vencimiento: string;
        dias_anticipacion: number;
      },
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
  
      const conexion = await this.databaseService.getConnection();
  
      try {
        const [resultado] = await conexion.execute(
          `UPDATE documentos
           SET tipo = ?, fecha_vencimiento = ?, dias_anticipacion = ?
           WHERE id = ? AND usuario_id = ?`,
          [
            datos.tipo,
            datos.fecha_vencimiento,
            datos.dias_anticipacion,
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
  