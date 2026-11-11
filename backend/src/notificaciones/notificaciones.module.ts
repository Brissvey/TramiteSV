
import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [NotificacionesController],
  providers: [NotificacionesService, DatabaseService],
})
export class NotificacionesModule {}

