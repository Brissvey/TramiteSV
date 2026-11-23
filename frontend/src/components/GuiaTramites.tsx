import { useState } from 'react'

type Region = 'Oriente' | 'Central' | 'Occidente'

type Centro = {
  nombre: string
  direccion: string
  horario: string
  nota?: string
}

type Centros = Record<Region, Centro[]>

type HorarioResumen = {
  titulo: string
  detalle: string
  destacado?: boolean
}

type Tramite = {
  id: string
  nombre: string
  icono: string
  institucion: string
  costo: string
  costoDetalle: string
  enlaceRenovacion: string
  enlaceRequisitos: string
  requisitos: string[]
  horarios: HorarioResumen[]
  notaHorario?: string
  centros: Centros
  notasCentros?: string[]
}

const regiones: Region[] = ['Oriente', 'Central', 'Occidente']

const HORARIO_DUI_ESTANDAR =
  'L-V 8:00 a.m. – 4:00 p.m. · Sáb 8:00 a.m. – 12:00 m.d.'
const HORARIO_DUI_EXTENDIDO =
  'L-V 8:00 a.m. – 6:00 p.m. · Sáb 8:00 a.m. – 4:00 p.m.'
const HORARIO_DUI_CENTRAL =
  'L-V 7:30 a.m. – 3:30 p.m. · Sáb y dom cerrado'
const HORARIO_MIG_8_4 = 'L-V 8:00 a.m. – 4:00 p.m. · Sáb y dom cerrado'
const HORARIO_MIG_730 = 'L-V 7:30 a.m. – 3:30 p.m. · Sáb y dom cerrado'
const HORARIO_SERTRACEN =
  'L-V 8:00 a.m. – 4:00 p.m. · Sáb 8:00 a.m. – 12:00 m.d.'
const NOTA_KIOSCO =
  'Kioscos y Digital Center: L-V 8:00 a.m. – 5:00 p.m. · Sáb 8:00 a.m. – 12:00 m.d.'

const centrosSertracen: Centros = {
  Oriente: [
    {
      nombre: 'SERTRACEN San Miguel',
      direccion:
        '15 Calle Oriente y 6ª Avenida Sur #308, Barrio Concepción (cerca del Centro de Gobierno), San Miguel.',
      horario: HORARIO_SERTRACEN,
    },
    {
      nombre: 'SERTRACEN Usulután',
      direccion:
        'Km 122 Carretera Bypass Usulután, Centro Comercial Mall del Sol, Locales 13, 14 y 15, Santa María, Usulután.',
      horario: HORARIO_SERTRACEN,
    },
  ],
  Central: [
    {
      nombre: 'SERTRACEN San Salvador (Tutunichapa)',
      direccion:
        'Boulevard Tutunichapa, Avenida Legazpi, Urbanización Siglo XXI, San Salvador.',
      horario: HORARIO_SERTRACEN,
      nota: 'Sede central. ' + NOTA_KIOSCO,
    },
    {
      nombre: 'SERTRACEN Boulevard del Ejército',
      direccion:
        'Km 4 ½ Boulevard del Ejército Nacional (contiguo a gasolinera DLC), Soyapango.',
      horario: HORARIO_SERTRACEN,
    },
    {
      nombre: 'SERTRACEN Apopa',
      direccion:
        'Km 12 Carretera Troncal del Norte, Centro Comercial Plaza Mundo Apopa, Apopa.',
      horario: HORARIO_SERTRACEN,
      nota: NOTA_KIOSCO,
    },
    {
      nombre: 'Sucursal Las Cascadas y Digital Center Cascadas',
      direccion:
        'Centro Comercial Las Cascadas, Local L-210, Av. Jerusalén y Calle Panamericana, Antiguo Cuscatlán.',
      horario: HORARIO_SERTRACEN,
      nota: NOTA_KIOSCO,
    },
    {
      nombre: 'SERTRACEN Lourdes',
      direccion:
        'Centro Comercial Pasatiempo, Km 25.5 Carretera hacia Santa Ana, Lourdes, Colón.',
      horario: HORARIO_SERTRACEN,
    },
  ],
  Occidente: [
    {
      nombre: 'SERTRACEN Santa Ana',
      direccion:
        '21 Calle Poniente y 6ª Avenida Sur (atrás de Academia Europea), Santa Ana.',
      horario: HORARIO_SERTRACEN,
    },
    {
      nombre: 'SERTRACEN Sonsonate',
      direccion:
        'Carretera a Acajutla, Plaza Larista, Locales A8 y A9 (costado sur del ISSS), Sonsonate.',
      horario: HORARIO_SERTRACEN,
    },
  ],
}

const tramites: Tramite[] = [
  {
    id: 'dui',
    nombre: 'DUI',
    icono: '🪪',
    institucion: 'Registro Nacional de las Personas Naturales (RNPN)',
    costo: '$10.31',
    costoDetalle:
      'Renovación, reposición o modificación. La primera vez en El Salvador es gratuita.',
    enlaceRenovacion: 'https://dui.sv/inicio/',
    enlaceRequisitos: 'https://dui.sv/inicio/#Requirements',
    requisitos: [
      'Partida de nacimiento original (primera vez).',
      'Recibo o comprobante de pago de $10.31 (renovación o reposición).',
      'Documentos que respalden el cambio, si se modifican datos.',
      'Actualizar la profesión solo se hace de forma presencial en un DUICentro.',
    ],
    horarios: [
      {
        titulo: 'Oficina Central RNPN',
        detalle:
          'Lunes a viernes, 7:30 a.m. a 3:30 p.m. (trámites administrativos y certificaciones). Sábados y domingos cerrado.',
      },
      {
        titulo: 'DUICentros estándar',
        detalle:
          'Lunes a viernes, 8:00 a.m. a 4:00 p.m. Sábados, 8:00 a.m. a 12:00 m.d. Domingos cerrado.',
      },
      {
        titulo: 'Sedes con horario extendido',
        detalle:
          'Lunes a viernes, 8:00 a.m. a 6:00 p.m. (hasta las 8:00 p.m. en renovaciones masivas). Sábados, 8:00 a.m. a 4:00 p.m.',
      },
      {
        titulo: 'Call Center para citas · 2555-1900',
        detalle: 'Lunes a sábado, 7:00 a.m. a 5:00 p.m.',
        destacado: true,
      },
    ],
    notaHorario:
      'Los domingos solo atienden las sedes habilitadas por jornada extraordinaria. El horario puede variar en temporadas de renovación masiva.',
    centros: {
      Oriente: [
        {
          nombre: 'DUICentro Usulután',
          direccion:
            'Centro Comercial Plaza Mundo Usulután, Km 115 Carretera Panamericana y Ruta Nacional 14.',
          horario: HORARIO_DUI_ESTANDAR,
        },
        {
          nombre: 'DUICentro San Miguel',
          direccion:
            'Centro Comercial Garden Mall, Boulevard Víctor Kury y Calle al Delirio.',
          horario:
            'L-V 8:00 a.m. – 6:00 p.m. · Sáb 8:00 a.m. – 4:00 p.m.',
          nota: 'Horario extendido. En renovaciones masivas puede ampliarse hasta las 8:00 p.m.',
        },
        {
          nombre: 'DUICentro San Francisco Gotera',
          direccion:
            'Avenida Thompson Norte y Calle José Simeón Cañas, Barrio La Cruz, San Francisco Gotera.',
          horario: HORARIO_DUI_ESTANDAR,
        },
        {
          nombre: 'DUICentro La Unión',
          direccion:
            'Centro Comercial Santa Mónica, Lotificación Santa Mónica Sur, Carretera Panamericana, La Unión.',
          horario: HORARIO_DUI_ESTANDAR,
        },
      ],
      Central: [
        {
          nombre: 'Oficina Central RNPN',
          direccion:
            'Alameda Manuel Enrique Araujo, Km 4 ½ Carretera a Santa Tecla, Colonia Roma, Pasaje Carbonell, San Salvador.',
          horario: HORARIO_DUI_CENTRAL,
          nota: 'Trámites administrativos y certificaciones.',
        },
        {
          nombre: 'DUICentro Galerías (Escalón)',
          direccion:
            'Paseo General Escalón y 71ª Av. Norte, Centro Comercial Galerías Escalón, Locales 18-19, San Salvador.',
          horario: HORARIO_DUI_EXTENDIDO,
          nota: 'Horario extendido. En renovaciones masivas puede ampliarse hasta las 8:00 p.m.',
        },
        {
          nombre: 'DUICentro Salvador del Mundo',
          direccion:
            'Alameda Franklin Delano Roosevelt y 65ª Av. Norte, Centro Comercial Salvador del Mundo, San Salvador.',
          horario: HORARIO_DUI_ESTANDAR,
        },
        {
          nombre: 'DUICentro Mejicanos',
          direccion: '2ª Calle Poniente y Pasaje San Juan, Mejicanos.',
          horario: HORARIO_DUI_ESTANDAR,
        },
        {
          nombre: 'DUICentro Apopa',
          direccion:
            'Km 12 Carretera Troncal del Norte / Centro Comercial Plaza Mundo Apopa.',
          horario: HORARIO_DUI_ESTANDAR,
        },
        {
          nombre: 'DUICentro Plaza Mundo Soyapango',
          direccion:
            'Km 4.5 Boulevard del Ejército Nacional y Calle Montecarmelo, Centro Comercial Plaza Mundo.',
          horario: HORARIO_DUI_ESTANDAR,
        },
        {
          nombre: 'DUICentro Soyapango La Placita',
          direccion:
            'Centro Comercial La Placita, Local No. 5, Colonia La Floresta.',
          horario: HORARIO_DUI_ESTANDAR,
        },
        {
          nombre: 'DUICentro Santa Tecla',
          direccion:
            '2ª Avenida Sur No. 1-8, Centro Comercial Arco Centro, Santa Tecla.',
          horario: HORARIO_DUI_EXTENDIDO,
          nota: 'Horario extendido. En renovaciones masivas puede ampliarse hasta las 8:00 p.m.',
        },
        {
          nombre: 'DUICentro Plaza Merliot',
          direccion:
            'Calle Chiltiupán, Centro Comercial Plaza Merliot, 2.º nivel, Ciudad Merliot.',
          horario: HORARIO_DUI_ESTANDAR,
        },
        {
          nombre: 'DUICentro Lourdes',
          direccion:
            'Centro Comercial Pasatiempo, Km 25 ½ Carretera a Santa Ana, Locales 34 y 35, Lourdes, Colón.',
          horario: HORARIO_DUI_ESTANDAR,
        },
        {
          nombre: 'DUICentro Chalatenango',
          direccion:
            'Centro Comercial Plaza Las Mesas, Carretera Longitudinal del Norte Km 73.5, Chalatenango.',
          horario: HORARIO_DUI_ESTANDAR,
        },
        {
          nombre: 'DUICentro Cojutepeque',
          direccion:
            '4ª Calle Oriente, Barrio El Centro, Cojutepeque (contiguo a Panadería El Tabor).',
          horario: HORARIO_DUI_ESTANDAR,
        },
        {
          nombre: 'DUICentro Zacatecoluca',
          direccion:
            '1ª Calle Poniente No. 7, Barrio El Centro, Zacatecoluca (frente a Banco Hipotecario).',
          horario: HORARIO_DUI_ESTANDAR,
        },
        {
          nombre: 'DUICentro Sensuntepeque',
          direccion:
            'Avenida Libertad, Barrio Los Remedios No. 2, Sensuntepeque (frente al Destacamento Militar).',
          horario: HORARIO_DUI_ESTANDAR,
        },
        {
          nombre: 'DUICentro San Vicente',
          direccion:
            '9ª Avenida Sur No. 14, Barrio San Juan de Dios, San Vicente.',
          horario: HORARIO_DUI_ESTANDAR,
        },
      ],
      Occidente: [
        {
          nombre: 'DUICentro Santa Ana (Sede Principal)',
          direccion:
            '25 Calle Poniente, entre 18 Av. Sur y Calle Internacional (contiguo a Didea), Santa Ana.',
          horario: HORARIO_DUI_EXTENDIDO,
          nota: 'Horario extendido. En renovaciones masivas puede ampliarse hasta las 8:00 p.m.',
        },
        {
          nombre: 'DUICentro Plaza Bolcaña',
          direccion:
            'Avenida Fray Felipe de Jesús Moraga Sur, Santa Ana.',
          horario: HORARIO_DUI_ESTANDAR,
        },
        {
          nombre: 'DUICentro Sonsonate',
          direccion:
            'Final Boulevard Las Palmeras y 7ª Calle Oriente, Barrio El Ángel, Centro de Negocios CYT, Locales 6-7 (frente al Monumento al Ferrocarril), Sonsonate.',
          horario: HORARIO_DUI_EXTENDIDO,
          nota: 'Horario extendido. En renovaciones masivas puede ampliarse hasta las 8:00 p.m.',
        },
        {
          nombre: 'DUICentro Ahuachapán',
          direccion:
            'Barrio Las Flores, Calle Gerardo Barrios y 3ª Av. Norte No. 1-1, Ahuachapán.',
          horario: HORARIO_DUI_ESTANDAR,
        },
      ],
    },
  },
  {
    id: 'pasaporte',
    nombre: 'Pasaporte',
    icono: '🛂',
    institucion: 'Dirección General de Migración y Extranjería (DGME)',
    costo: '$25.00',
    costoDetalle:
      'Primera emisión, renovación o reposición en El Salvador. Se paga en la colecturía de la sucursal.',
    enlaceRenovacion: 'https://login.gob.sv/login',
    enlaceRequisitos: 'https://www.migracion.gob.sv/pasaportes-preguntas/',
    requisitos: [
      'DUI original, vigente y en buen estado.',
      'Pasaporte vencido o por vencer (renovación).',
      'Partida de nacimiento original y presencia de ambos padres (menores de edad).',
      'Declaración jurada llenada en la sucursal (reposición por pérdida o robo).',
      'Pago de $25 en la colecturía de la sucursal.',
    ],
    horarios: [
      {
        titulo: 'Sedes de 8:00 a.m. a 4:00 p.m.',
        detalle:
          'Sede Central, Plaza Mundo, Las Cascadas y Pasatiempo. Lunes a viernes.',
      },
      {
        titulo: 'Sedes de 7:30 a.m. a 3:30 p.m.',
        detalle:
          'Masferrer, San Miguel, Usulután y Santa Ana. Lunes a viernes.',
      },
      {
        titulo: 'Sábados',
        detalle:
          'Solo Las Cascadas, de 8:00 a.m. a 12:00 m.d. (por orden de llegada hasta agotar cupos).',
        destacado: true,
      },
    ],
    notaHorario:
      'La atención de lunes a viernes es por orden de llegada. El resto de sucursales permanece cerrado los fines de semana.',
    centros: {
      Oriente: [
        {
          nombre: 'Migración y Extranjería San Miguel',
          direccion:
            'Centro Comercial La Plaza (ex Plaza Goldtree), Local Ancla 2, Avenida Roosevelt, San Miguel.',
          horario: HORARIO_MIG_730,
        },
        {
          nombre: 'Sucursal Usulután',
          direccion:
            '2ª Calle Poniente, entre 1ª Av. Norte y Av. Guadalupe, ½ cuadra abajo del Parque Central «Raúl Francisco Munguía», Edificio Esmahan, Usulután.',
          horario: HORARIO_MIG_730,
        },
      ],
      Central: [
        {
          nombre: 'Sede Central DGME',
          direccion:
            '9ª Calle Poniente y final 15 Avenida Norte, Centro de Gobierno (entre PGR y Gobernación), San Salvador.',
          horario: HORARIO_MIG_8_4,
        },
        {
          nombre: 'Sucursal Masferrer',
          direccion:
            'Final Paseo General Escalón y Avenida Masferrer #5019, San Salvador.',
          horario: HORARIO_MIG_730,
        },
        {
          nombre: 'Sucursal Plaza Mundo Soyapango',
          direccion:
            'Centro Comercial Plaza Mundo, primera etapa, planta baja, estacionamiento oriente (contiguo a oficinas del ISSS), Soyapango.',
          horario: HORARIO_MIG_8_4,
        },
        {
          nombre: 'Sucursal Las Cascadas',
          direccion:
            'Centro Comercial Mall Las Cascadas, 2.º nivel, Locales 217 y 218, Av. Jerusalén y Carretera Panamericana, Antiguo Cuscatlán.',
          horario:
            'L-V 8:00 a.m. – 4:00 p.m. · Sáb 8:00 a.m. – 12:00 m.d.',
          nota: 'Única sucursal con atención los sábados, hasta agotar cupos.',
        },
        {
          nombre: 'Sucursal Pasatiempo',
          direccion:
            'Centro Comercial Pasatiempo, Local 19-B, Km 25 ½ Carretera hacia Santa Ana, Lourdes, Colón.',
          horario: HORARIO_MIG_8_4,
        },
      ],
      Occidente: [
        {
          nombre: 'Sucursal Las Ramblas Santa Ana',
          direccion:
            'Autopista a San Salvador y Carretera a Chalchuapa, Cantón Comecayo, Locales 42, 43, 44 y 45, Santa Ana.',
          horario: HORARIO_MIG_730,
        },
      ],
    },
    notasCentros: [
      'Morazán y La Unión no tienen sucursal fija: los trámites se realizan en San Miguel o Usulután.',
      'Sonsonate y Ahuachapán no cuentan con sucursal fija: se tramita en Santa Ana o Lourdes.',
    ],
  },
  {
    id: 'licencia',
    nombre: 'Licencia de conducir',
    icono: '🚗',
    institucion: 'Viceministerio de Transporte (VMT) / SERTRACEN',
    costo: '$52.82',
    costoDetalle:
      'Emisión, renovación o reposición. El examen visual se realiza en SERTRACEN.',
    enlaceRenovacion: 'https://www.sertracen.com.sv/index.php',
    enlaceRequisitos: 'https://www.sertracen.com.sv/index.php/primera-vez',
    requisitos: [
      'Licencia anterior y DUI vigente y original.',
      'Aprobar el examen visual en SERTRACEN.',
      'No tener esquelas (multas) pendientes de pago.',
      'El trámite es personal y no se puede delegar a terceros.',
    ],
    horarios: [
      {
        titulo: 'Ventanillas de atención general',
        detalle:
          'Lunes a viernes, 8:00 a.m. a 4:00 p.m. Sábados, 8:00 a.m. a 12:00 m.d. Domingos cerrado.',
      },
      {
        titulo: 'Kioscos y Digital Center',
        detalle:
          'Lunes a viernes, 8:00 a.m. a 5:00 p.m. Sábados, 8:00 a.m. a 12:00 m.d.',
        destacado: true,
      },
    ],
    notaHorario:
      'El horario es el mismo en todas las sedes del país. Las agencias bancarias autorizadas pueden tener su propio horario.',
    centros: centrosSertracen,
  },
  {
    id: 'tarjeta_circulacion',
    nombre: 'Tarjeta de circulación',
    icono: '📄',
    institucion: 'Viceministerio de Transporte (VMT) / SERTRACEN',
    costo: '$17.43',
    costoDetalle:
      'Refrenda anual de la tarjeta de circulación (servicio de tarjeta).',
    enlaceRenovacion: 'https://portal.sertracen.com.sv/refrenda_tarjeta/',
    enlaceRequisitos:
      'https://www.sertracen.com.sv/index.php/reposicion-de-tarjeta-de-circulacion-extravio',
    requisitos: [
      'Tarjeta de circulación original.',
      'DUI original vigente.',
      'Estar solvente de esquelas (multas).',
      'Seguro vigente.',
    ],
    horarios: [
      {
        titulo: 'Ventanillas de atención general',
        detalle:
          'Lunes a viernes, 8:00 a.m. a 4:00 p.m. Sábados, 8:00 a.m. a 12:00 m.d. Domingos cerrado.',
      },
      {
        titulo: 'Kioscos y Digital Center',
        detalle:
          'Lunes a viernes, 8:00 a.m. a 5:00 p.m. Sábados, 8:00 a.m. a 12:00 m.d.',
        destacado: true,
      },
    ],
    notaHorario:
      'La refrenda se puede hacer en todas las sucursales de SERTRACEN. Las agencias bancarias autorizadas pueden tener su propio horario.',
    centros: centrosSertracen,
    notasCentros: [
      'La refrenda y los demás trámites de tarjeta de circulación se atienden en todas las sucursales de SERTRACEN del país.',
      'Para refrendas simples también hay agencias autorizadas de Banco Cuscatlán, Banco Davivienda y Banco Hipotecario.',
    ],
  },
]

function GuiaTramites() {
  const [activo, setActivo] = useState(tramites[0].id)
  const tramite = tramites.find((item) => item.id === activo) ?? tramites[0]

  return (
    <section className={`guide guide-${tramite.id}`} id="tramites">
      <div className="section-title">
        <span>GUÍA DE TRÁMITES</span>
        <h2>Todo lo que necesitas para renovar</h2>
        <p>
          Consulta costos, requisitos, horarios, enlaces oficiales y centros de
          atención para tus documentos en El Salvador.
        </p>
      </div>

      <div className="guide-tabs" role="tablist" aria-label="Selecciona un trámite">
        {tramites.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={activo === item.id}
            className={`guide-tab${activo === item.id ? ' active' : ''}`}
            onClick={() => setActivo(item.id)}
          >
            <span>{item.icono}</span>
            {item.nombre}
          </button>
        ))}
      </div>

      <div className="guide-layout">
        <article className="guide-info">
          <div className="guide-info-head">
            <span className="guide-icon">{tramite.icono}</span>
            <div>
              <h3>{tramite.nombre}</h3>
              <p>{tramite.institucion}</p>
            </div>
          </div>

          <div className="guide-cost">
            <span>Costo aproximado</span>
            <strong>{tramite.costo}</strong>
            <p>{tramite.costoDetalle}</p>
          </div>

          <div className="guide-links">
            <a
              className="primary-button"
              href={tramite.enlaceRenovacion}
              target="_blank"
              rel="noreferrer"
            >
              Renovar en línea ↗
            </a>
            <a
              className="secondary-button"
              href={tramite.enlaceRequisitos}
              target="_blank"
              rel="noreferrer"
            >
              Ver requisitos oficiales ↗
            </a>
          </div>

          <div className="guide-schedule">
            <h4>
              <span aria-hidden="true">🕘</span> Horarios de atención
            </h4>
            <div className="schedule-list">
              {tramite.horarios.map((horario) => (
                <div
                  className={`schedule-row${horario.destacado ? ' featured' : ''}`}
                  key={horario.titulo}
                >
                  <strong>{horario.titulo}</strong>
                  <p>{horario.detalle}</p>
                </div>
              ))}
            </div>
            {tramite.notaHorario && (
              <p className="schedule-note">{tramite.notaHorario}</p>
            )}
          </div>

          <div className="guide-requirements">
            <h4>Requisitos principales</h4>
            <ul>
              {tramite.requisitos.map((requisito) => (
                <li key={requisito}>{requisito}</li>
              ))}
            </ul>
          </div>

          <p className="guide-warning">
            Los costos y requisitos pueden cambiar. Confirma siempre en el
            portal oficial antes de realizar el trámite.
          </p>
        </article>

        <div className="centers" id="centros">
          <div className="centers-head">
            <h3>Centros de atención</h3>
            <p>
              Ubicaciones y horarios para {tramite.nombre.toLowerCase()}{' '}
              organizados por zona del país.
            </p>
          </div>

          <div className="centers-grid">
            {regiones.map((region) => (
              <div className="centers-region" key={region}>
                <h4>
                  Zona {region}
                  <span>{tramite.centros[region].length}</span>
                </h4>
                <div className="centers-list">
                  {tramite.centros[region].map((centro) => (
                    <article className="center-card" key={centro.nombre}>
                      <strong>{centro.nombre}</strong>
                      <p>{centro.direccion}</p>
                      <div className="center-schedule">
                        <span aria-hidden="true">🕘</span>
                        <span>{centro.horario}</span>
                      </div>
                      {centro.nota && <small>{centro.nota}</small>}
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {tramite.notasCentros && (
            <div className="centers-notes">
              {tramite.notasCentros.map((nota) => (
                <p key={nota}>ℹ️ {nota}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default GuiaTramites
