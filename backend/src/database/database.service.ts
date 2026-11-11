
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mysql, { Pool } from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
private readonly pool: Pool;

constructor(private readonly configService: ConfigService) {
    this.pool = mysql.createPool({
    host: this.configService.get<string>('DB_HOST'),
    port: Number(this.configService.get<string>('DB_PORT') ?? 3306),
    user: this.configService.get<string>('DB_USER'),
    password: this.configService.get<string>('DB_PASSWORD'),
    database: this.configService.get<string>('DB_NAME'),
    waitForConnections: true,
    connectionLimit: 10,
    });
}

getConnection() {
    return this.pool.getConnection();
}

async probarConexion() {
    const conexion = await this.pool.getConnection();

    try {
    const [filas] = await conexion.query(
        'SELECT DATABASE() AS base, NOW() AS fecha',
    );

    return filas;
    } finally {
    conexion.release();
    }
}

async onModuleDestroy() {
    await this.pool.end();
}
}
