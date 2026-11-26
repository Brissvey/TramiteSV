import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';

describe('UsuariosService', () => {
  let service: UsuariosService;

  const databaseMock = {
    getConnection: jest.fn(),
  };

  const jwtMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: DatabaseService, useValue: databaseMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
