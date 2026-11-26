
import {
  IsDateString,
  IsIn,
  IsInt,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';

export class CrearDocumentoDto {
  @IsIn([
    'DUI',
    'Pasaporte',
    'Licencia de conducir',
    'Tarjeta de circulación',
    'Tarjeta de crédito',
  ])
  tipo: string;

  @IsDateString()
  fecha_vencimiento: string;

  @IsInt()
  @IsIn([7, 14, 21, 30])
  dias_anticipacion: number;

  @ValidateIf((o) => o.tipo === 'Tarjeta de crédito')
  @IsInt()
  @Min(1)
  @Max(31)
  dia_corte: number;

  @ValidateIf((o) => o.tipo === 'Tarjeta de crédito')
  @IsInt()
  @Min(1)
  @Max(31)
  dia_pago: number;
}
