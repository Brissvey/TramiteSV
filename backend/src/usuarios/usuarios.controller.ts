
import { Body, Controller, Post } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { SolicitarRecuperacionDto } from './dto/solicitar-recuperacion.dto';
import { RestablecerPasswordDto } from './dto/restablecer-password.dto';

@Controller('api/usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
  ) {}

  @Post('registro')
  registrar(@Body() datos: CrearUsuarioDto) {
    return this.usuariosService.registrar(datos);
  }

  @Post('login')
  login(@Body() datos: LoginUsuarioDto) {
    return this.usuariosService.login(datos);
  }

  @Post('recuperar-password')
  solicitarRecuperacion(@Body() datos: SolicitarRecuperacionDto) {
    return this.usuariosService.solicitarRecuperacion(datos.correo);
  }

  @Post('restablecer-password')
  restablecerPassword(@Body() datos: RestablecerPasswordDto) {
    return this.usuariosService.restablecerPassword(
      datos.token,
      datos.nuevaPassword,
    );
  }
}
