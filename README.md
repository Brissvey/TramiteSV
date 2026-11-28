# 🇸🇻 TrámiteSV – Asistente de Documentos y Vencimientos

**Plataforma web para gestionar documentos importantes y recibir recordatorios automáticos antes de su vencimiento.**

<p align="center">
  <a href="https://tramite-sv.vercel.app/">
    <strong>🚀 VISITAR TRÁMITESV</strong>
  </a>
</p>

🌐 **Aplicación en línea:** https://tramite-sv.vercel.app/

---

## 📌 Descripción del proyecto

TrámiteSV es una plataforma web desarrollada para ayudar a las personas a mantener un mejor control de sus documentos personales y sus fechas de vencimiento.

El sistema permite registrar documentos, consultar sus fechas de expiración y recibir notificaciones automáticas por correo electrónico antes de que estos venzan.

Además, proporciona información útil para facilitar los procesos de renovación, incluyendo requisitos, costos estimados y ubicaciones de centros de atención.

Este proyecto fue desarrollado como parte de la asignatura de Programación Orientada a Eventos de la carrera de Ingeniería en Desarrollo de Software de la Universidad de Oriente (UNIVO).

## 🎯 Objetivos

- Facilitar el control de documentos personales y sus fechas de vencimiento.
- Automatizar la detección de documentos próximos a vencer.
- Implementar una arquitectura orientada a eventos utilizando NestJS.
- Enviar notificaciones automáticas mediante correo electrónico.
- Centralizar información útil para la renovación de documentos.
- Aplicar tecnologías modernas para el desarrollo de aplicaciones web.

---

## ✨ Funcionalidades principales

### 👤 Gestión de usuarios

- Registro de nuevas cuentas.
- Inicio de sesión.
- Recuperación de contraseña.
- Restablecimiento de contraseña.
- Correo electrónico de bienvenida.

### 📄 Gestión de documentos

- Registro de documentos personales.
- Consulta de documentos registrados.
- Visualización de fechas de vencimiento.
- Configuración de días de anticipación para recibir notificaciones.
- Consulta de próximos vencimientos.

### 🔔 Sistema de notificaciones

El sistema permite configurar diferentes períodos de anticipación para recibir recordatorios:

- 1 día.
- 7 días.
- 14 días.
- 21 días.
- 30 días.

Las notificaciones se generan automáticamente mediante tareas programadas en el backend.

### 📧 Notificaciones por correo electrónico

TrámiteSV implementa tres tipos principales de correos:

1. **Bienvenida:** se envía cuando un usuario crea su cuenta.
2. **Recuperación de contraseña:** permite al usuario restablecer su acceso.
3. **Recordatorios:** notifican sobre documentos próximos a vencer e incluyen información útil para su renovación.

El envío de correos se implementa utilizando Nodemailer y Gmail SMTP.

### 📍 Información de renovación

Los recordatorios pueden incluir:

- Requisitos para realizar el trámite.
- Costos estimados.
- Ubicación del centro de atención.
- Información útil para la renovación.

---

## 🛠️ Tecnologías utilizadas

### Frontend

| Tecnología | Uso |
|---|---|
| React | Desarrollo de interfaces de usuario |
| TypeScript | Tipado y organización del código |
| Vite | Herramienta de desarrollo y compilación |

### Backend

| Tecnología | Uso |
|---|---|
| Node.js | Entorno de ejecución |
| NestJS | Framework para el desarrollo del backend |
| TypeScript | Lenguaje de programación |
| @nestjs/event-emitter | Gestión y emisión de eventos |
| @nestjs/schedule | Ejecución de tareas programadas |
| Nodemailer | Envío de correos electrónicos |

### Base de datos

| Tecnología | Uso |
|---|---|
| TiDB Cloud | Alojamiento de la base de datos en la nube |
| MySQL compatible | Gestión y almacenamiento de información |

### Servicios y herramientas adicionales

| Tecnología | Uso |
|---|---|
| Gmail SMTP | Servicio de envío de correos electrónicos |
| Git | Control de versiones |
| GitHub | Repositorio y colaboración |
| npm | Administración de dependencias |
| Visual Studio Code | Entorno de desarrollo |
| Vercel | Publicación del frontend |
| Render | Alojamiento del backend |

---

## 🏗️ Arquitectura del sistema

TrámiteSV utiliza una arquitectura de tres capas:

**1. Presentación (Frontend)**

Desarrollada con React, TypeScript y Vite. Es la interfaz con la que interactúan los usuarios para registrarse, iniciar sesión, administrar sus documentos y consultar vencimientos.

**2. Lógica de negocio (Backend)**

Desarrollada con Node.js y NestJS. Se encarga de procesar las solicitudes, gestionar usuarios y documentos, ejecutar tareas programadas y emitir eventos.

**3. Persistencia (Base de datos)**

Utiliza TiDB Cloud, compatible con MySQL, para almacenar los datos de los usuarios, documentos y fechas de vencimiento.

### Diagrama general

```text
                 USUARIO
                    |
                    v
          FRONTEND - REACT
           TypeScript + Vite
                    |
               HTTP / API
                    |
                    v
           BACKEND - NESTJS
                    |
          +---------+---------+
          |                   |
          v                   v
     BASE DE DATOS       EVENTOS Y
      TiDB Cloud          TAREAS
      (MySQL)           PROGRAMADAS
                             |
                             v
                       NOTIFICACIONES
                             |
                             v
                         NODEMAILER
                             |
                             v
                          GMAIL SMTP
                             |
                             v
                       CORREO DEL
                          USUARIO
```

---

## ⚡ Arquitectura orientada a eventos

Uno de los componentes principales de TrámiteSV es la implementación de programación orientada a eventos mediante NestJS.

Se utilizan los siguientes paquetes:

- `@nestjs/event-emitter`
- `@nestjs/schedule`

Estos permiten emitir eventos y ejecutar tareas programadas para detectar documentos próximos a vencer.

### Eventos principales

**DOCUMENTO_REGISTRADO**

Se genera cuando un usuario registra un nuevo documento en la plataforma.

**DOCUMENTO_POR_VENCER**

Se genera cuando el sistema detecta que un documento ha alcanzado el período de notificación configurado.

### Funcionamiento del proceso

1. El usuario registra un documento y su fecha de vencimiento.
2. El backend almacena la información en la base de datos.
3. Se emite el evento `DOCUMENTO_REGISTRADO`.
4. Una tarea programada revisa periódicamente las fechas de vencimiento.
5. Cuando un documento entra en su período de notificación, se emite `DOCUMENTO_POR_VENCER`.
6. Un listener recibe el evento.
7. El servicio de notificaciones prepara el mensaje correspondiente.
8. Nodemailer utiliza Gmail SMTP para enviar el correo electrónico al usuario.

Este proceso permite automatizar los recordatorios sin que el usuario tenga que revisar manualmente sus documentos.

---

## ☁️ Despliegue y servicios en la nube

El proyecto utiliza diferentes servicios para mantener sus componentes disponibles.

| Componente | Servicio |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Base de datos | TiDB Cloud |
| Correos electrónicos | Gmail SMTP |

### Frontend – Vercel

Se utiliza para publicar la aplicación web y permitir el acceso desde un navegador.

🔗 https://tramite-sv.vercel.app/

### Backend – Render

Se utiliza para alojar la aplicación desarrollada con NestJS, ejecutar la lógica del sistema y mantener las tareas programadas.

**Nota:** En el plan gratuito de Render, el servicio puede suspenderse temporalmente por inactividad, lo que puede ocasionar retrasos cuando recibe nuevas solicitudes.

### Base de datos – TiDB Cloud

Permite almacenar la información del sistema en la nube y mantenerla disponible independientemente de que la computadora del desarrollador esté apagada.

### Correo electrónico – Gmail SMTP

Se utiliza para enviar los correos de bienvenida, recuperación de contraseña y recordatorios automáticos.

Las credenciales se configuran mediante variables de entorno.

---

## 🔐 Seguridad y configuración

El proyecto utiliza variables de entorno para almacenar información sensible y configuraciones de conexión.

Entre los datos que deben protegerse se encuentran:

- Credenciales de conexión a la base de datos.
- Usuario y contraseña de aplicación de Gmail.
- Claves secretas de autenticación.
- Direcciones de conexión y configuraciones del backend.

**Importante:** Nunca se deben subir archivos `.env` con credenciales reales a GitHub.

Se recomienda mantener un archivo `.env.example` con nombres de variables y valores de ejemplo, sin contraseñas ni claves reales.

---

## 💻 Instalación y ejecución local

Para trabajar con el proyecto en un entorno local se necesita:

- Node.js.
- npm.
- Git.
- Visual Studio Code.
- Acceso a la base de datos configurada.

### 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

### 2. Instalar dependencias

El frontend y el backend tienen sus propias dependencias. Se debe ingresar a la carpeta correspondiente e instalar los paquetes:

```bash
npm install
```

### 3. Configurar variables de entorno

Crear los archivos `.env` correspondientes al frontend y backend, utilizando como referencia la configuración del proyecto.

Configurar las conexiones necesarias para:

- Base de datos TiDB Cloud.
- Gmail SMTP.
- Autenticación.
- Dirección de comunicación entre frontend y backend.

### 4. Ejecutar la aplicación

Ingresar a la carpeta de cada componente y utilizar los scripts definidos en su respectivo `package.json`.

El frontend y el backend deben estar ejecutándose para utilizar todas las funcionalidades de la plataforma en el entorno local.

---

## 🧪 Pruebas realizadas

Durante el desarrollo se realizaron pruebas funcionales para comprobar los principales procesos:

- Registro de una cuenta nueva.
- Recepción del correo de bienvenida.
- Inicio de sesión.
- Recuperación de contraseña.
- Recepción del correo de recuperación.
- Registro de documentos.
- Consulta de documentos registrados.
- Detección de próximos vencimientos.
- Envío automático de recordatorios por correo electrónico.

También se realizaron pruebas de comunicación entre el frontend, backend y base de datos.

---

## 📸 Evidencias del proyecto

Se pueden consultar las siguientes evidencias de las funcionalidades de TrámiteSV:

- Página principal.
- Registro e inicio de sesión.
- Panel principal del usuario.
- Formulario para agregar documentos.
- Listado de documentos registrados.
- Próximos vencimientos.
- Correo de bienvenida.
- Correo de recuperación de contraseña.
- Correo de recordatorio automático.

---

## 🚀 Mejoras futuras

Entre las posibles mejoras del sistema se encuentran:

- Incorporar más tipos de documentos.
- Mejorar la administración de notificaciones.
- Implementar nuevas opciones de comunicación.
- Ampliar la información sobre requisitos y costos.
- Optimizar el rendimiento del backend.
- Fortalecer los mecanismos de seguridad.
- Mejorar la experiencia de usuario.

---

## 🎓 Información académica

| Información | Detalle |
|---|---|
| Proyecto | TrámiteSV – Asistente de Documentos y Vencimientos |
| Institución | Universidad de Oriente (UNIVO) |
| Facultad | Facultad de Ingeniería y Arquitectura |
| Carrera | Ingeniería en Desarrollo de Software |
| Asignatura | Programación Orientada a Eventos |
| Período | Ciclo II de 2026 |
| Docente | José Adolfo Herrera Funes |

---

## 👨‍💻 Contribuciones

El proyecto fue desarrollado mediante trabajo colaborativo, utilizando Git y GitHub para administrar el código fuente y coordinar las actividades del equipo.

Las contribuciones se distribuyeron entre el desarrollo del frontend, backend, base de datos, notificaciones, pruebas y documentación.

---

## 📄 Licencia

Proyecto desarrollado con fines académicos para la asignatura de Programación Orientada a Eventos.

---

<p align="center">
  <strong>TrámiteSV 🇸🇻</strong><br>
  Una manera más sencilla de mantener tus documentos al día.
  <br><br>
  <a href="https://tramite-sv.vercel.app/">Visitar aplicación</a>
</p>
