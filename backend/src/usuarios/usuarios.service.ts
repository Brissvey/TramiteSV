
import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { CorreoService } from '../correo/correo.service';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly correoService: CorreoService,
    private readonly configService: ConfigService,
  ) {}

  async registrar(datos: {
    nombre: string;
    correo: string;
    password: string;
  }) {
    const conexion = await this.databaseService.getConnection();

    let usuarioCreado: {
      id: number;
      nombre: string;
      correo: string;
    } | null = null;

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

      usuarioCreado = {
        id,
        nombre: datos.nombre,
        correo: datos.correo,
      };
    } finally {
      conexion.release();
    }

    if (!usuarioCreado) {
      throw new Error('No fue posible completar el registro.');
    }

    try {
      await this.correoService.enviarBienvenida(
        usuarioCreado.nombre,
        usuarioCreado.correo,
      );
    } catch (error) {
      this.logger.error(
        `No se pudo enviar el correo de bienvenida a ${usuarioCreado.correo}.`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return {
      mensaje: 'Usuario registrado correctamente',
      usuario: usuarioCreado,
    };
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

  async solicitarRecuperacion(correo: string) {
    const conexion = await this.databaseService.getConnection();

    try {
      const [filas] = await conexion.execute(
        `SELECT id, nombre, correo
         FROM usuarios
         WHERE correo = ?`,
        [correo],
      );

      const usuarios = filas as {
        id: number;
        nombre: string;
        correo: string;
      }[];

      // No revelar si el correo está registrado.
      if (usuarios.length === 0) {
        return {
          mensaje: 'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.',
        };
      }

      const usuario = usuarios[0];
      const token = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256')
        .update(token)
        .digest('hex');

      await conexion.execute(
        `DELETE FROM recuperacion_password
         WHERE usuario_id = ? AND utilizado = FALSE`,
        [usuario.id],
      );

      await conexion.execute(
        `INSERT INTO recuperacion_password
         (usuario_id, token_hash, expira_en)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
        [usuario.id, tokenHash],
      );

      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL');

      if (!frontendUrl) {
        throw new Error('FRONTEND_URL no está configurada.');
      }

      const enlace =
        `${frontendUrl}/?token=${encodeURIComponent(token)}`;

      try {
        await this.correoService.enviarRecuperacionPassword(
          usuario.nombre,
          usuario.correo,
          enlace,
        );
      } catch (error) {
        await conexion.execute(
          `DELETE FROM recuperacion_password
           WHERE token_hash = ?`,
          [tokenHash],
        );
        throw error;
      }

      return {
        mensaje: 'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.',
      };
    } finally {
      conexion.release();
    }
  }

  async restablecerPassword(token: string, nuevaPassword: string) {
    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const conexion = await this.databaseService.getConnection();

    try {
      await conexion.beginTransaction();

      const [filas] = await conexion.execute(
        `SELECT id, usuario_id
         FROM recuperacion_password
         WHERE token_hash = ?
           AND utilizado = FALSE
           AND expira_en > NOW()
         FOR UPDATE`,
        [tokenHash],
      );

      const recuperaciones = filas as {
        id: number;
        usuario_id: number;
      }[];

      if (recuperaciones.length === 0) {
        throw new BadRequestException(
          'El enlace es inválido, ha expirado o ya fue utilizado.',
        );
      }

      const recuperacion = recuperaciones[0];
      const passwordHash = await hash(nuevaPassword, 12);

      await conexion.execute(
        `UPDATE usuarios
         SET password_hash = ?
         WHERE id = ?`,
        [passwordHash, recuperacion.usuario_id],
      );

      await conexion.execute(
        `UPDATE recuperacion_password
         SET utilizado = TRUE
         WHERE id = ?`,
        [recuperacion.id],
      );

      await conexion.commit();

      return {
        mensaje: 'Tu contraseña ha sido restablecida correctamente.',
      };
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  }

}
