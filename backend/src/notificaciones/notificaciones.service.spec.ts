
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificacionesService } from './notificaciones.service';
import { DatabaseService } from '../database/database.service';

describe('NotificacionesService', () => {
  let service: NotificacionesService;

  const databaseMock = {
    getConnection: jest.fn<() => Promise<any>>(),
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

  const metodos = () =>
    service as unknown as {
      proximaFechaMensual: (dia: number, hoy: string) => string;
      crearFechaMensual: (
        anio: number,
        mes: number,
        dia: number,
      ) => string;
      diasEntre: (desde: string, hasta: string) => number;
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

  describe('crearFechaMensual', () => {
    it('debe crear una fecha mensual correctamente', () => {
      expect(metodos().crearFechaMensual(2026, 12, 15))
        .toBe('2026-12-15');
    });

    it('debe ajustar el día 31 al 28 de febrero', () => {
      expect(metodos().crearFechaMensual(2027, 2, 31))
        .toBe('2027-02-28');
    });

    it('debe ajustar el día 31 al 29 de febrero en año bisiesto', () => {
      expect(metodos().crearFechaMensual(2028, 2, 31))
        .toBe('2028-02-29');
    });

    it('debe ajustar el día 30 al 30 de abril', () => {
      expect(metodos().crearFechaMensual(2027, 4, 31))
        .toBe('2027-04-30');
    });
  });

  describe('proximaFechaMensual', () => {
    it('debe obtener el próximo corte dentro del mismo mes', () => {
      expect(metodos().proximaFechaMensual(8, '2026-12-07'))
        .toBe('2026-12-08');
    });

    it('debe pasar al siguiente mes si el día ya pasó', () => {
      expect(metodos().proximaFechaMensual(5, '2026-11-06'))
        .toBe('2026-12-05');
    });

    it('debe pasar al siguiente mes si hoy es el mismo día', () => {
      expect(metodos().proximaFechaMensual(15, '2026-11-15'))
        .toBe('2026-12-15');
    });

    it('debe cambiar de año correctamente', () => {
      expect(metodos().proximaFechaMensual(15, '2026-12-20'))
        .toBe('2027-01-15');
    });

    it('debe ajustar el día 31 en febrero', () => {
      expect(metodos().proximaFechaMensual(31, '2027-02-01'))
        .toBe('2027-02-28');
    });
  });

  describe('diasEntre', () => {
    it('debe calcular correctamente 30 días de diferencia', () => {
      expect(metodos().diasEntre('2026-11-03', '2026-12-03'))
        .toBe(30);
    });

    it('debe calcular correctamente un día de diferencia', () => {
      expect(metodos().diasEntre('2026-12-07', '2026-12-08'))
        .toBe(1);
    });

    it('debe calcular correctamente el cambio de año', () => {
      expect(metodos().diasEntre('2026-12-31', '2027-01-01'))
        .toBe(1);
    });
  });

  describe('protección contra recordatorios duplicados', () => {
    it('debe reconocer cuando un recordatorio ya fue registrado', async () => {
      const conexionMock = {
        execute: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue([
          { affectedRows: 0 },
          [],
        ]),
        release: jest.fn(),
      };

      databaseMock.getConnection.mockResolvedValue(conexionMock);

      const documento = {
        documento_id: 1,
        tipo: 'Tarjeta de crédito',
        fecha_vencimiento: '2026-12-03',
        fecha_recordatorio: '2026-12-03',
        dias_restantes: 30,
        tipo_recordatorio: 'PAGO' as const,
        dias_anticipacion: 30,
        dia_corte: 10,
        dia_pago: 3,
        nombre: 'Usuario de prueba',
        correo: 'prueba@example.com',
      };

      await (service as any).enviarRecordatorio(documento);

      expect(conexionMock.execute).toHaveBeenCalledTimes(1);
      expect(conexionMock.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT IGNORE'),
        [1, '2026-12-03', 30, 'PAGO'],
      );

      expect(conexionMock.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('envío de recordatorios', () => {
    it('debe enviar y marcar el recordatorio cuando es nuevo', async () => {
      const conexionMock = {
        execute: jest.fn<(...args: any[]) => Promise<any>>()
          .mockResolvedValueOnce([{ affectedRows: 1 }, []])
          .mockResolvedValueOnce([{ affectedRows: 1 }, []]),
        release: jest.fn(),
      };

      databaseMock.getConnection.mockResolvedValue(conexionMock);

      const enviarCorreoMock = jest.fn<(...args: any[]) => Promise<any>>()
        .mockResolvedValue({ messageId: 'correo-prueba' });

      (service as any).transporter = {
        sendMail: enviarCorreoMock,
      };

      const documento = {
        documento_id: 2,
        tipo: 'Tarjeta de crédito',
        fecha_recordatorio: '2026-12-03',
        dias_restantes: 30,
        tipo_recordatorio: 'PAGO' as const,
        nombre: 'Usuario de prueba',
        correo: 'prueba@example.com',
      };

      await (service as any).enviarRecordatorio(documento);

      expect(enviarCorreoMock).toHaveBeenCalledTimes(1);
      expect(conexionMock.execute).toHaveBeenCalledTimes(2);
      expect(conexionMock.execute.mock.calls[1][0])
        .toContain("SET estado = 'ENVIADO'");
      expect(conexionMock.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('revisarDocumentosPorVencer', () => {
    it('debe detectar el recordatorio de corte un día antes', async () => {
      const documento = {
        documento_id: 1,
        tipo: 'Tarjeta de crédito',
        fecha_vencimiento: '2027-05-31',
        dias_anticipacion: 30,
        dia_corte: 26,
        dia_pago: 15,
        nombre: 'Usuario de prueba',
        correo: 'prueba@example.com',
      };

      const conexionMock = {
        execute: jest.fn<(...args: any[]) => Promise<any>>()
          .mockResolvedValueOnce([[{ hoy: '2026-11-25' }], []])
          .mockResolvedValueOnce([[documento], []]),
        release: jest.fn(),
      };

      databaseMock.getConnection.mockResolvedValue(conexionMock);

      await service.revisarDocumentosPorVencer();

      expect(eventEmitterMock.emitAsync).toHaveBeenCalledWith(
        'DOCUMENTO_POR_VENCER',
        expect.objectContaining({
          documento_id: 1,
          tipo_recordatorio: 'CORTE',
          fecha_recordatorio: '2026-11-26',
          dias_restantes: 1,
        }),
      );

      expect(conexionMock.release).toHaveBeenCalledTimes(1);
    });
    
    it.each([
      { dias: 30, hoy: '2026-11-03' },
      { dias: 21, hoy: '2026-11-12' },
      { dias: 14, hoy: '2026-11-19' },
      { dias: 7, hoy: '2026-11-26' },
      { dias: 1, hoy: '2026-12-02' },
    ])(
      'debe detectar el aviso de pago con $dias día(s) de anticipación',
      async ({ dias, hoy }) => {
        const documento = {
          documento_id: 2,
          tipo: 'Tarjeta de crédito',
          fecha_vencimiento: '2027-05-31',
          dias_anticipacion: 30,
          dia_corte: null,
          dia_pago: 3,
          nombre: 'Usuario de prueba',
          correo: 'prueba@example.com',
        };

        const conexionMock = {
          execute: jest.fn<(...args: any[]) => Promise<any>>()
            .mockResolvedValueOnce([[{ hoy }], []])
            .mockResolvedValueOnce([[documento], []]),
          release: jest.fn(),
        };

        databaseMock.getConnection.mockResolvedValue(conexionMock);

        await service.revisarDocumentosPorVencer();

        expect(eventEmitterMock.emitAsync).toHaveBeenCalledWith(
          'DOCUMENTO_POR_VENCER',
          expect.objectContaining({
            documento_id: 2,
            tipo_recordatorio: 'PAGO',
            fecha_recordatorio: '2026-12-03',
            dias_restantes: dias,
          }),
        );

        expect(conexionMock.release).toHaveBeenCalledTimes(1);
      },
    );

    it.each([
      { dias: 30, hoy: '2026-12-01' },
      { dias: 21, hoy: '2026-12-10' },
      { dias: 14, hoy: '2026-12-17' },
      { dias: 7, hoy: '2026-12-24' },
      { dias: 1, hoy: '2026-12-30' },
    ])(
      'debe detectar el vencimiento físico con $dias día(s) de anticipación',
      async ({ dias, hoy }) => {
        const documento = {
          documento_id: 3,
          tipo: 'Tarjeta de crédito',
          fecha_vencimiento: '2026-12-31',
          dias_anticipacion: 30,
          dia_corte: null,
          dia_pago: null,
          nombre: 'Usuario de prueba',
          correo: 'prueba@example.com',
        };

        const conexionMock = {
          execute: jest.fn<(...args: any[]) => Promise<any>>()
            .mockResolvedValueOnce([[{ hoy }], []])
            .mockResolvedValueOnce([[documento], []]),
          release: jest.fn(),
        };

        databaseMock.getConnection.mockResolvedValue(conexionMock);

        await service.revisarDocumentosPorVencer();

        expect(eventEmitterMock.emitAsync).toHaveBeenCalledWith(
          'DOCUMENTO_POR_VENCER',
          expect.objectContaining({
            documento_id: 3,
            tipo_recordatorio: 'VENCIMIENTO',
            fecha_recordatorio: '2026-12-31',
            dias_restantes: dias,
          }),
        );
      },
    );

    it('debe conservar los recordatorios de documentos normales', async () => {
      const documento = {
        documento_id: 4,
        tipo: 'DUI',
        fecha_vencimiento: '2026-12-25',
        dias_anticipacion: 30,
        dia_corte: null,
        dia_pago: null,
        nombre: 'Usuario de prueba',
        correo: 'prueba@example.com',
      };

      const conexionMock = {
        execute: jest.fn<(...args: any[]) => Promise<any>>()
          .mockResolvedValueOnce([[{ hoy: '2026-12-24' }], []])
          .mockResolvedValueOnce([[documento], []]),
        release: jest.fn(),
      };

      databaseMock.getConnection.mockResolvedValue(conexionMock);

      await service.revisarDocumentosPorVencer();

      expect(eventEmitterMock.emitAsync).toHaveBeenCalledWith(
        'DOCUMENTO_POR_VENCER',
        expect.objectContaining({
          documento_id: 4,
          tipo: 'DUI',
          tipo_recordatorio: 'VENCIMIENTO',
          fecha_recordatorio: '2026-12-25',
          dias_restantes: 1,
        }),
      );
    });

  });

});
