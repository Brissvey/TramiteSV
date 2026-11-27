
import {
    IsString,
    MinLength,
    MaxLength,
    IsNotEmpty,
  } from 'class-validator';

  export class RestablecerPasswordDto {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    nuevaPassword: string;
  }
