# Pruebas de notificaciones – TrámiteSV

**Responsable:** Brissvey  
**Fecha:** 16 de noviembre de 2026

## 1. Objetivo

Comprobar que el sistema evita registrar recordatorios duplicados para un mismo documento, fecha de vencimiento y días de anticipación.

## 2. Prueba de restricción UNIQUE

Se verificó la estructura de la tabla `recordatorios_enviados` y se encontró la restricción:

`uq_recordatorio (documento_id, fecha_vencimiento, dias_anticipacion)`

## 3. Prueba de inserción duplicada

Se intentó insertar nuevamente el recordatorio correspondiente al documento ID 10, con fecha de vencimiento 2026-11-19 y anticipación de 7 días.

**Resultado obtenido:**
- MySQL ejecutó correctamente `INSERT IGNORE`.
- Filas insertadas: 0.
- Registros existentes antes de la prueba: 2.
- Registros existentes después de la prueba: 2.
- No se creó un registro duplicado.

**Estado:** APROBADO.

## 4. Conclusión

La restricción UNIQUE de MySQL y la instrucción INSERT IGNORE impiden insertar un segundo registro con la misma combinación de documento, fecha de vencimiento y días de anticipación.