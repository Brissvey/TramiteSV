import { useState } from 'react'

type Region = 'Oriente' | 'Central' | 'Occidente'

type Centro = {
  nombre: string
  direccion: string
  nota?: string
}

type Centros = Record<Region, Centro[]>

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
  centros: Centros
  notasCentros?: string[]
}

const regiones: Region[] = ['Oriente', 'Central', 'Occidente']

const centrosSertracen: Centros = {
  Oriente: [
    {
      nombre: 'SERTRACEN San Miguel',
      direccion:
        '15 Calle Oriente y 6ª Avenida Sur #308, Barrio Concepción (cerca del Centro de Gobierno), San Miguel.',
    },
    {
      nombre: 'SERTRACEN Usulután',
      direccion:
        'Km 122 Carretera Bypass Usulután, Centro Comercial Mall del Sol, Locales 13, 14 y 15, Santa María, Usulután.',
    },
  ],
  Central: [
    {
      nombre: 'SERTRACEN San Salvador (Tutunichapa)',
      direccion:
        'Boulevard Tutunichapa, Avenida Legazpi, Urbanización Siglo XXI, San Salvador.',
      nota: 'Sede central. Cuenta con kioscos de autogestión.',
    },
    {
      nombre: 'SERTRACEN Boulevard del Ejército',
      direccion:
        'Km 4 ½ Boulevard del Ejército Nacional (contiguo a gasolinera DLC), Soyapango.',
    },
    {
      nombre: 'SERTRACEN Apopa',
      direccion:
        'Km 12 Carretera Troncal del Norte, Centro Comercial Plaza Mundo Apopa, Apopa.',
    },
    {
      nombre: 'Sucursal Las Cascadas y Digital Center Cascadas',
      direccion:
        'Centro Comercial Las Cascadas, Local L-210, Av. Jerusalén y Calle Panamericana, Antiguo Cuscatlán.',
    },
    {
      nombre: 'SERTRACEN Lourdes',
      direccion:
        'Centro Comercial Pasatiempo, Km 25.5 Carretera hacia Santa Ana, Lourdes, Colón.',
    },
  ],
  Occidente: [
    {
      nombre: 'SERTRACEN Santa Ana',
      direccion:
        '21 Calle Poniente y 6ª Avenida Sur (atrás de Academia Europea), Santa Ana.',
    },
    {
      nombre: 'SERTRACEN Sonsonate',
      direccion:
        'Carretera a Acajutla, Plaza Larista, Locales A8 y A9 (costado sur del ISSS), Sonsonate.',
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
    centros: {
      Oriente: [
        {
          nombre: 'DUICentro Usulután',
          direccion:
            'Centro Comercial Plaza Mundo Usulután, Km 115 Carretera Panamericana y Ruta Nacional 14.',
        },
        {
          nombre: 'DUICentro San Miguel',
          direccion:
            'Centro Comercial Garden Mall, Boulevard Víctor Kury y Calle al Delirio.',
        },
        {
          nombre: 'DUICentro San Francisco Gotera',
          direccion:
            'Avenida Thompson Norte y Calle José Simeón Cañas, Barrio La Cruz, San Francisco Gotera.',
        },
        {
          nombre: 'DUICentro La Unión',
          direccion:
            'Centro Comercial Santa Mónica, Lotificación Santa Mónica Sur, Carretera Panamericana, La Unión.',
        },
      ],
      Central: [
        {
          nombre: 'Oficina Central RNPN',
          direccion:
            'Alameda Manuel Enrique Araujo, Km 4 ½ Carretera a Santa Tecla, Colonia Roma, Pasaje Carbonell, San Salvador.',
        },
        {
          nombre: 'DUICentro Galerías (Escalón)',
          direccion:
            'Paseo General Escalón y 71ª Av. Norte, Centro Comercial Galerías Escalón, Locales 18-19, San Salvador.',
        },
        {
          nombre: 'DUICentro Salvador del Mundo',
          direccion:
            'Alameda Franklin Delano Roosevelt y 65ª Av. Norte, Centro Comercial Salvador del Mundo, San Salvador.',
        },
        {
          nombre: 'DUICentro Mejicanos',
          direccion: '2ª Calle Poniente y Pasaje San Juan, Mejicanos.',
        },
        {
          nombre: 'DUICentro Apopa',
          direccion:
            'Km 12 Carretera Troncal del Norte / Centro Comercial Plaza Mundo Apopa.',
        },
        {
          nombre: 'DUICentro Plaza Mundo Soyapango',
          direccion:
            'Km 4.5 Boulevard del Ejército Nacional y Calle Montecarmelo, Centro Comercial Plaza Mundo.',
        },
        {
          nombre: 'DUICentro Soyapango La Placita',
          direccion:
            'Centro Comercial La Placita, Local No. 5, Colonia La Floresta.',
        },
        {
          nombre: 'DUICentro Santa Tecla',
          direccion:
            '2ª Avenida Sur No. 1-8, Centro Comercial Arco Centro, Santa Tecla.',
        },
        {
          nombre: 'DUICentro Plaza Merliot',
          direccion:
            'Calle Chiltiupán, Centro Comercial Plaza Merliot, 2.º nivel, Ciudad Merliot.',
        },
        {
          nombre: 'DUICentro Lourdes',
          direccion:
            'Centro Comercial Pasatiempo, Km 25 ½ Carretera a Santa Ana, Locales 34 y 35, Lourdes, Colón.',
        },
        {
          nombre: 'DUICentro Chalatenango',
          direccion:
            'Centro Comercial Plaza Las Mesas, Carretera Longitudinal del Norte Km 73.5, Chalatenango.',
        },
        {
          nombre: 'DUICentro Cojutepeque',
          direccion:
            '4ª Calle Oriente, Barrio El Centro, Cojutepeque (contiguo a Panadería El Tabor).',
        },
        {
          nombre: 'DUICentro Zacatecoluca',
          direccion:
            '1ª Calle Poniente No. 7, Barrio El Centro, Zacatecoluca (frente a Banco Hipotecario).',
        },
        {
          nombre: 'DUICentro Sensuntepeque',
          direccion:
            'Avenida Libertad, Barrio Los Remedios No. 2, Sensuntepeque (frente al Destacamento Militar).',
        },
        {
          nombre: 'DUICentro San Vicente',
          direccion:
            '9ª Avenida Sur No. 14, Barrio San Juan de Dios, San Vicente.',
        },
      ],
      Occidente: [
        {
          nombre: 'DUICentro Santa Ana (Sede Principal)',
          direccion:
            '25 Calle Poniente, entre 18 Av. Sur y Calle Internacional (contiguo a Didea), Santa Ana.',
        },
        {
          nombre: 'DUICentro Plaza Bolcaña',
          direccion:
            'Avenida Fray Felipe de Jesús Moraga Sur, Santa Ana.',
        },
        {
          nombre: 'DUICentro Sonsonate',
          direccion:
            'Final Boulevard Las Palmeras y 7ª Calle Oriente, Barrio El Ángel, Centro de Negocios CYT, Locales 6-7 (frente al Monumento al Ferrocarril), Sonsonate.',
        },
        {
          nombre: 'DUICentro Ahuachapán',
          direccion:
            'Barrio Las Flores, Calle Gerardo Barrios y 3ª Av. Norte No. 1-1, Ahuachapán.',
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
    centros: {
      Oriente: [
        {
          nombre: 'Migración y Extranjería San Miguel',
          direccion:
            'Centro Comercial La Plaza (ex Plaza Goldtree), Local Ancla 2, Avenida Roosevelt, San Miguel.',
        },
        {
          nombre: 'Sucursal Usulután',
          direccion:
            '2ª Calle Poniente, entre 1ª Av. Norte y Av. Guadalupe, ½ cuadra abajo del Parque Central «Raúl Francisco Munguía», Edificio Esmahan, Usulután.',
        },
      ],
      Central: [
        {
          nombre: 'Sede Central DGME',
          direccion:
            '9ª Calle Poniente y final 15 Avenida Norte, Centro de Gobierno (entre PGR y Gobernación), San Salvador.',
        },
        {
          nombre: 'Sucursal Masferrer',
          direccion:
            'Final Paseo General Escalón y Avenida Masferrer #5019, San Salvador.',
        },
        {
          nombre: 'Sucursal Plaza Mundo Soyapango',
          direccion:
            'Centro Comercial Plaza Mundo, primera etapa, planta baja, estacionamiento oriente (contiguo a oficinas del ISSS), Soyapango.',
        },
        {
          nombre: 'Sucursal Las Cascadas',
          direccion:
            'Centro Comercial Mall Las Cascadas, 2.º nivel, Locales 217 y 218, Av. Jerusalén y Carretera Panamericana, Antiguo Cuscatlán.',
        },
        {
          nombre: 'Sucursal Pasatiempo',
          direccion:
            'Centro Comercial Pasatiempo, Local 19-B, Km 25 ½ Carretera hacia Santa Ana, Lourdes, Colón.',
        },
      ],
      Occidente: [
        {
          nombre: 'Sucursal Las Ramblas Santa Ana',
          direccion:
            'Autopista a San Salvador y Carretera a Chalchuapa, Cantón Comecayo, Locales 42, 43, 44 y 45, Santa Ana.',
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
    <section className="guide" id="tramites">
      <div className="section-title">
        <span>GUÍA DE TRÁMITES</span>
        <h2>Todo lo que necesitas para renovar</h2>
        <p>
          Consulta costos, requisitos, enlaces oficiales y centros de atención
          para tus documentos en El Salvador.
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
              Ubicaciones para {tramite.nombre.toLowerCase()} organizadas por
              zona del país.
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
