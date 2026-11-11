
import {
    IsDateString,
    IsIn,
    IsInt,
  } from 'class-validator';
  
  export class CrearDocumentoDto {
    @IsIn([
      'DUI',
      'Pasaporte',
      'Licencia de conducir',
      'Tarjeta de circulación',
    ])
    tipo: string;
  
    @IsDateString()
    fecha_vencimiento: string;
  
    @IsInt()
    @IsIn([7, 14, 21, 30])
    dias_anticipacion: number;
  }
