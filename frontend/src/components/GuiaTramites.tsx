import { useState } from 'react'

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
          Consulta costos, requisitos, horarios y enlaces oficiales para tus
          documentos en El Salvador.
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
      </div>
    </section>
  )
}

export default GuiaTramites
