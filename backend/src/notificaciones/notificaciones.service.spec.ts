
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificacionesService } from './notificaciones.service';
import { DatabaseService } from '../database/database.service';

describe('NotificacionesService', () => {
  let service: NotificacionesService;

  const databaseMock = {
    getConnection: jest.fn(),
  };

  const configMock = {
    get: jest.fn((clave: string) => {
      const configuracion: Record<string, string> = {
        MAIL_HOST: 'localhost',
        MAIL_PORT: '587',
        MAIL_SECURE: 'false',
        MAIL_USER: 'prueba@example.com',
        MAIL_PASSWORD: 'password-de-prueba',
        MAIL_FROM: 'prueba@example.com',
      };

      return configuracion[clave];
    }),
  };

  const eventEmitterMock = {
    emitAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionesService,
        { provide: DatabaseService, useValue: databaseMock },
        { provide: ConfigService, useValue: configMock },
        { provide: EventEmitter2, useValue: eventEmitterMock },
      ],
    }).compile();

    service = module.get<NotificacionesService>(NotificacionesService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeDefined();
  });
});
