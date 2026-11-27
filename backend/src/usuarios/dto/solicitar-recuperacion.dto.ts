
import { IsEmail, MaxLength } from 'class-validator';

export class SolicitarRecuperacionDto {
  @IsEmail()
  @MaxLength(150)
  correo: string;
}
