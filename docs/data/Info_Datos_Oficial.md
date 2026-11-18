# Datos oficiales de trámites y centros

Contrato de datos de la parte de información oficial de TramiteSV. Describe qué hay en `backend/data/oficial/clean/`, de dónde sale cada dato y cómo se debe usar.

- **Responsable:** Carlos
- **Última verificación:** 14 de noviembre de 2026
- **Regla:** este contrato y los JSON no se modifican sin acuerdo del equipo. Un cambio aquí afecta a quien muestra los datos en pantalla y a las plantillas de correo.

---

## 1. Archivos

| Archivo | Contenido |
|---|---|
| `backend/data/oficial/clean/tramites.json` | 4 trámites: DUI, pasaporte, licencia de conducir y tarjeta de circulación |
| `backend/data/oficial/clean/centros.json` | 41 centros de atención, por región y por trámite |
| `backend/data/oficial/validar.mjs` | Valida los dos JSON y muestra los conteos |

Los dos JSON se editan a mano y se versionan. No hay carpeta `raw/` porque los datos se arman desde páginas web y notas de prensa, no desde una exportación.

---

## 2. Fuentes

| Fuente | Tipo | Se usa para |
|---|---|---|
| Portal de Transparencia (`transparencia.gob.sv`), fichas de la DGME | Oficial | Requisitos, costo y sucursales del pasaporte |
| `dui.sv` (RNPN) | Oficial | Enlace del trámite del DUI; los datos del DUI vienen de prensa que cita al RNPN |
| `sertracen.com.sv` (SERTRACEN / VMT) | Oficial | Enlace de licencia y tarjeta de circulación; los datos vienen de prensa que cita a la institución |
| elsalvador.com, Diario El Mundo, El Diario de Hoy | Prensa | Costos, requisitos, direcciones y horarios que no se pudieron leer en la fuente oficial |

Cada dato lleva su fuente. Los enlaces de `tramites.json` indican `tipo: "oficial"` o `tipo: "prensa"` y, para prensa, a quién citan.

---

## 3. Campos de `tramites.json`

| Campo | Significado |
|---|---|
| `id` | `dui`, `pasaporte`, `licencia` o `tarjeta_circulacion` |
| `documento`, `nombre_completo`, `institucion` | Nombre y entidad responsable |
| `enlaces_oficiales` | Páginas del Estado para hacer el trámite |
| `costos` | Lista de `{ concepto, monto_usd, nota }`. `monto_usd: null` significa no verificado |
| `requisitos` | Requisitos por tipo de trámite (primera vez, renovación, reposición…) |
| `instrucciones` | Pasos para hacer el trámite |
| `notas_importantes` | Excepciones y avisos |
| `fuentes` | `{ titulo, url, tipo, cita_a }` |
| `estado_verificacion` | Qué se confirmó y qué falta |

## 4. Campos de `centros.json`

| Campo | Significado |
|---|---|
| `id` | Identificador único, por ejemplo `dui-santa-ana` o `mig-masferrer` |
| `nombre`, `institucion` | Nombre del centro y entidad (`RNPN`, `Migracion (DGME)`, `SERTRACEN / VMT`) |
| `tramites` | Lista de `id` de `tramites.json` que se atienden ahí |
| `region` | `Oriente`, `Central` u `Occidente` |
| `departamento` | Departamento, o `null` si no se verificó |
| `direccion`, `telefono`, `horario` | Datos de contacto; `null` significa no verificado |
| `verificado_oficial` | `true` solo si la dirección y el horario salen de una ficha oficial |
| `fuentes` | Enlaces de donde salió el dato |
| `notas` | Dudas o cambios conocidos |

Conteos esperados: 4 trámites y 41 centros (22 de RNPN, 9 de Migración y 10 de SERTRACEN).

---

## 5. Reglas de uso

1. **`null` no se muestra como dato.** Un monto, teléfono, dirección u horario en `null` no se imprime ni se estima. La app muestra "sin verificar" o lo omite.
2. **Prensa no es fuente oficial.** Si un dato viene de prensa, la pantalla lo presenta como informativo y enlaza al portal oficial.
3. **Los costos y horarios cambian.** Antes de mostrar un costo se enlaza al portal oficial del trámite.
4. **La asignación de departamentos a regiones es una convención del proyecto** (Chalatenango y los paracentrales quedan en Central). Es un supuesto, no un dato oficial.
5. **Los datos que faltan quedan en `null`.** No se inventan ni se estiman.

---

## 6. Cómo actualizar

1. Crear una rama desde `main` actualizado.
2. Editar el JSON y, si el dato cambió, la fecha de verificación y la fuente.
3. Ejecutar la validación desde la raíz del repositorio:

```
node backend/data/oficial/validar.mjs
```

4. Si se agregó o quitó un centro a propósito, actualizar los conteos de `ESPERADO` en `validar.mjs` y los de la sección 4.
5. Abrir el Pull Request.
