import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const carpeta = join(dirname(fileURLToPath(import.meta.url)), "clean");

const ESPERADO = {
  tramites: 4,
  centros: 41,
  porInstitucion: { RNPN: 22, "Migracion (DGME)": 9, "SERTRACEN / VMT": 10 },
};
const IDS_TRAMITE = ["dui", "pasaporte", "licencia", "tarjeta_circulacion"];
const REGIONES = ["Oriente", "Central", "Occidente"];

const errores = [];
const error = (mensaje) => errores.push(mensaje);
const texto = (valor) => typeof valor === "string" && valor.trim().length > 0;
const textoONulo = (valor) => valor === null || texto(valor);

function cargar(nombre) {
  try {
    return JSON.parse(readFileSync(join(carpeta, nombre), "utf8"));
  } catch (e) {
    error(`${nombre}: no se pudo leer (${e.message})`);
    return null;
  }
}

function contar(lista, clave) {
  const cuenta = {};
  for (const item of lista) cuenta[item[clave]] = (cuenta[item[clave]] || 0) + 1;
  return cuenta;
}

const tramitesDoc = cargar("tramites.json");
const centrosDoc = cargar("centros.json");

let montosNulos = 0;
let telefonosNulos = 0;
let direccionesNulas = 0;
let horariosNulos = 0;
let sinVerificarOficial = 0;

if (tramitesDoc) {
  const lista = tramitesDoc.tramites;
  if (!Array.isArray(lista)) {
    error("tramites.json: falta el arreglo 'tramites'");
  } else {
    const vistos = new Set();
    for (const t of lista) {
      const etiqueta = `tramites.json [${t.id}]`;
      if (!IDS_TRAMITE.includes(t.id)) error(`${etiqueta}: id desconocido`);
      if (vistos.has(t.id)) error(`${etiqueta}: id repetido`);
      vistos.add(t.id);
      for (const campo of ["documento", "nombre_completo", "institucion", "estado_verificacion"]) {
        if (!texto(t[campo])) error(`${etiqueta}: falta '${campo}'`);
      }
      if (!Array.isArray(t.enlaces_oficiales) || t.enlaces_oficiales.length === 0) {
        error(`${etiqueta}: sin enlaces_oficiales`);
      } else {
        for (const e of t.enlaces_oficiales) {
          if (!texto(e.url) || !e.url.startsWith("https://")) error(`${etiqueta}: enlace sin https`);
        }
      }
      if (!Array.isArray(t.costos) || t.costos.length === 0) {
        error(`${etiqueta}: sin costos`);
      } else {
        for (const c of t.costos) {
          if (c.monto_usd !== null && typeof c.monto_usd !== "number") {
            error(`${etiqueta}: monto_usd debe ser número o null (${c.concepto})`);
          }
          if (c.monto_usd === null) montosNulos += 1;
        }
      }
      if (typeof t.requisitos !== "object" || t.requisitos === null) error(`${etiqueta}: falta 'requisitos'`);
      if (!Array.isArray(t.instrucciones) || t.instrucciones.length === 0) error(`${etiqueta}: sin instrucciones`);
      if (!Array.isArray(t.fuentes) || t.fuentes.length === 0) {
        error(`${etiqueta}: sin fuentes`);
      } else {
        for (const f of t.fuentes) {
          if (!texto(f.url) || !f.url.startsWith("https://")) error(`${etiqueta}: fuente sin https`);
          if (!["oficial", "prensa"].includes(f.tipo)) error(`${etiqueta}: fuente con tipo inválido`);
        }
      }
    }
    if (lista.length !== ESPERADO.tramites) {
      error(`tramites.json: se esperaban ${ESPERADO.tramites} trámites y hay ${lista.length}`);
    }
  }
}

if (centrosDoc) {
  const lista = centrosDoc.centros;
  const regiones = centrosDoc.regiones || {};
  if (!Array.isArray(lista)) {
    error("centros.json: falta el arreglo 'centros'");
  } else {
    for (const r of REGIONES) {
      if (!Array.isArray(regiones[r])) error(`centros.json: falta la región '${r}' en 'regiones'`);
    }
    const ids = new Set();
    for (const c of lista) {
      const etiqueta = `centros.json [${c.id}]`;
      if (!texto(c.id)) error("centros.json: un centro no tiene id");
      if (ids.has(c.id)) error(`${etiqueta}: id repetido`);
      ids.add(c.id);
      for (const campo of ["nombre", "institucion"]) {
        if (!texto(c[campo])) error(`${etiqueta}: falta '${campo}'`);
      }
      if (!Array.isArray(c.tramites) || c.tramites.length === 0) {
        error(`${etiqueta}: sin trámites`);
      } else {
        for (const t of c.tramites) {
          if (!IDS_TRAMITE.includes(t)) error(`${etiqueta}: trámite desconocido '${t}'`);
        }
      }
      if (!REGIONES.includes(c.region)) error(`${etiqueta}: región inválida '${c.region}'`);
      if (c.departamento !== null && !texto(c.departamento)) error(`${etiqueta}: departamento inválido`);
      if (texto(c.departamento) && Array.isArray(regiones[c.region]) && !regiones[c.region].includes(c.departamento)) {
        error(`${etiqueta}: el departamento '${c.departamento}' no pertenece a la región '${c.region}'`);
      }
      if (!textoONulo(c.direccion)) error(`${etiqueta}: dirección inválida`);
      if (!textoONulo(c.horario)) error(`${etiqueta}: horario inválido`);
      if (c.telefono !== null && !(texto(c.telefono) && /^\d{4}-\d{4}$/.test(c.telefono))) {
        error(`${etiqueta}: teléfono con formato inválido`);
      }
      if (typeof c.verificado_oficial !== "boolean") error(`${etiqueta}: verificado_oficial debe ser true o false`);
      if (!Array.isArray(c.fuentes) || c.fuentes.length === 0) {
        error(`${etiqueta}: sin fuentes`);
      } else {
        for (const f of c.fuentes) {
          if (!texto(f) || !f.startsWith("https://")) error(`${etiqueta}: fuente sin https`);
        }
      }
      if (c.telefono === null) telefonosNulos += 1;
      if (c.direccion === null) direccionesNulas += 1;
      if (c.horario === null) horariosNulos += 1;
      if (c.verificado_oficial === false) sinVerificarOficial += 1;
    }
    if (lista.length !== ESPERADO.centros) {
      error(`centros.json: se esperaban ${ESPERADO.centros} centros y hay ${lista.length}`);
    }
    const porInstitucion = contar(lista, "institucion");
    for (const [institucion, esperado] of Object.entries(ESPERADO.porInstitucion)) {
      if ((porInstitucion[institucion] || 0) !== esperado) {
        error(`centros.json: se esperaban ${esperado} centros de ${institucion} y hay ${porInstitucion[institucion] || 0}`);
      }
    }
    console.log("Centros por institución:", porInstitucion);
    console.log("Centros por región:", contar(lista, "region"));
  }
}

console.log("");
console.log(`Trámites: ${tramitesDoc?.tramites?.length ?? 0} (esperado ${ESPERADO.tramites})`);
console.log(`Centros: ${centrosDoc?.centros?.length ?? 0} (esperado ${ESPERADO.centros})`);
console.log("");
console.log("Datos que todavía no se tienen (quedan en null):");
console.log(`  costos con monto null: ${montosNulos}`);
console.log(`  centros sin teléfono: ${telefonosNulos}`);
console.log(`  centros sin dirección: ${direccionesNulas}`);
console.log(`  centros sin horario: ${horariosNulos}`);
console.log(`  centros sin ficha oficial: ${sinVerificarOficial}`);
console.log("");

if (errores.length > 0) {
  console.error(`FALLO: ${errores.length} problema(s)`);
  for (const e of errores) console.error(`  - ${e}`);
  console.error("Si agregaste o quitaste centros a propósito, actualiza los conteos de ESPERADO en este archivo.");
  process.exit(1);
}

console.log("OK: los dos archivos cumplen el contrato.");
