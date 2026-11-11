
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { Request } from 'express';
  
  import { DocumentosService } from './documentos.service';
  import { CrearDocumentoDto } from './dto/crear-documento.dto';
  import { ActualizarDocumentoDto } from './dto/actualizar-documento.dto';
  import { AuthGuard } from '../auth/auth.guard';
  
  interface SolicitudAutenticada extends Request {
    user: {
      id: number;
      correo: string;
    };
  }
  
  @UseGuards(AuthGuard)
  @Controller('api/documentos')
  export class DocumentosController {
    constructor(
      private readonly documentosService: DocumentosService,
    ) {}
  
    @Get()
    obtenerTodos(@Req() request: SolicitudAutenticada) {
      return this.documentosService.obtenerTodos(request.user.id);
    }
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    crear(
      @Req() request: SolicitudAutenticada,
      @Body() datos: CrearDocumentoDto,
    ) {
      return this.documentosService.crear(datos, request.user.id);
    }
  
    @Put(':id')
    actualizar(
      @Param('id', ParseIntPipe) id: number,
      @Req() request: SolicitudAutenticada,
      @Body() datos: ActualizarDocumentoDto,
    ) {
      return this.documentosService.actualizar(
        id,
        datos,
        request.user.id,
      );
    }
  
    @Delete(':id')
    eliminar(
      @Param('id', ParseIntPipe) id: number,
      @Req() request: SolicitudAutenticada,
    ) {
      return this.documentosService.eliminar(id, request.user.id);
    }
  }
  