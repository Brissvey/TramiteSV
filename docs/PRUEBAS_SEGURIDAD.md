# Pruebas de seguridad – TrámiteSV

**Responsable:** Brissvey  
**Fecha:** 16 de noviembre de 2026  
**Módulo:** Backend – Autenticación y documentos

## 1. Objetivo

Verificar que el sistema autentique a los usuarios y garantice que cada usuario solamente pueda consultar, modificar y eliminar sus propios documentos.

## 2. Resultados de las pruebas

| N.º | Prueba | Resultado obtenido | Estado |
|---|---|---|---|
| 1 | Acceso a documentos sin token | HTTP 401 Unauthorized | APROBADO |
| 2 | Consulta con usuario 1 | HTTP 200; devuelve documentos del usuario ID 6 | APROBADO |
| 3 | Consulta con usuario 2 | HTTP 200; devuelve documentos del usuario ID 4 | APROBADO |
| 4 | Usuario 2 intenta modificar documento ID 10 del usuario 1 | HTTP 404 Not Found | APROBADO |
| 5 | Usuario 2 intenta eliminar documento ID 10 del usuario 1 | HTTP 404 Not Found | APROBADO |

## 3. Conclusión

Las pruebas realizadas demuestran que el backend valida la autenticación mediante JWT y aplica restricciones de propiedad sobre los documentos. Un usuario no puede consultar, modificar ni eliminar documentos pertenecientes a otro usuario.

## 4. Evidencias

Adjuntar capturas de pantalla de las respuestas obtenidas en la terminal para cada prueba.