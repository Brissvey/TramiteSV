
import {
    ConflictException,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { compare, hash } from 'bcrypt';
  import { JwtService } from '@nestjs/jwt';
  import { DatabaseService } from '../database/database.service';
  
  @Injectable()
  export class UsuariosService {
    constructor(
      private readonly databaseService: DatabaseService,
      private readonly jwtService: JwtService,
    ) {}
  
    async registrar(datos: {
      nombre: string;
      correo: string;
      password: string;
    }) {
      const conexion = await this.databaseService.getConnection();
  
      try {
        const [usuariosExistentes] = await conexion.execute(
          'SELECT id FROM usuarios WHERE correo = ?',
          [datos.correo],
        );
  
        if ((usuariosExistentes as unknown[]).length > 0) {
          throw new ConflictException(
            'Ya existe una cuenta con ese correo electrónico',
          );
        }
  
        const passwordHash = await hash(datos.password, 12);
  
        const [resultado] = await conexion.execute(
          `INSERT INTO usuarios (nombre, correo, password_hash)
           VALUES (?, ?, ?)`,
          [datos.nombre, datos.correo, passwordHash],
        );
  
        const id = (resultado as { insertId: number }).insertId;
  
        return {
          mensaje: 'Usuario registrado correctamente',
          usuario: {
            id,
            nombre: datos.nombre,
            correo: datos.correo,
          },
        };
      } finally {
        conexion.release();
      }
    }
  
    async login(datos: {
      correo: string;
      password: string;
    }) {
      const conexion = await this.databaseService.getConnection();
  
      try {
        const [filas] = await conexion.execute(
          `SELECT id, nombre, correo, password_hash
           FROM usuarios
           WHERE correo = ?`,
          [datos.correo],
        );
  
        const usuarios = filas as {
          id: number;
          nombre: string;
          correo: string;
          password_hash: string;
        }[];
  
        if (usuarios.length === 0) {
          throw new UnauthorizedException(
            'Correo o contraseña incorrectos',
          );
        }
  
        const usuario = usuarios[0];
  
        const passwordValida = await compare(
          datos.password,
          usuario.password_hash,
        );
  
        if (!passwordValida) {
          throw new UnauthorizedException(
            'Correo o contraseña incorrectos',
          );
        }
  
        const accessToken = await this.jwtService.signAsync({
          sub: usuario.id,
          correo: usuario.correo,
        });
  
        return {
          mensaje: 'Inicio de sesión exitoso',
          access_token: accessToken,
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
          },
        };
      } finally {
        conexion.release();
      }
    }
  }
  