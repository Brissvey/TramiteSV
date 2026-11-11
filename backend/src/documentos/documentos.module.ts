
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { DatabaseService } from '../database/database.service';
import { AuthGuard } from '../auth/auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [DocumentosController],
  providers: [DocumentosService, DatabaseService, AuthGuard],
})
export class DocumentosModule {}
