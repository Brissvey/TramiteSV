
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentosService } from './documentos.service';
import { DatabaseService } from '../database/database.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('DocumentosService', () => {
  let service: DocumentosService;

  const databaseMock = {
    getConnection: jest.fn(),
  };

  const eventEmitterMock = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentosService,
        { provide: DatabaseService, useValue: databaseMock },
        { provide: EventEmitter2, useValue: eventEmitterMock },
      ],
    }).compile();

    service = module.get<DocumentosService>(DocumentosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
