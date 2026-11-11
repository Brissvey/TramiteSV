
import {
    IsEmail,
    IsString,
    MaxLength,
    MinLength,
  } from 'class-validator';
  
  export class LoginUsuarioDto {
    @IsEmail()
    @MaxLength(150)
    correo: string;
  
    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password: string;
  }
  