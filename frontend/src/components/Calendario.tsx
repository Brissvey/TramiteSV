import { useMemo, useState } from 'react'

type Documento = {
  id: number
  tipo: string
  fecha_vencimiento: string
  dias_anticipacion: number
  usuario_id: number
  dia_corte: number | null
  dia_pago: number | null
}

type CalendarioProps = { documentos: Documento[] }
type TipoEvento = 'VENCIMIENTO' | 'CORTE' | 'PAGO'
type EventoCalendario = {
  id: string
  documento: Documento
  fecha: Date
  fechaISO: string
  tipo: TipoEvento
  titulo: string
}

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function obtenerFecha(fecha: string) {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

function aFechaISO(fecha: Date) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}

function crearFechaMensual(anio: number, mes: number, dia: number) {
  const ultimoDia = new Date(anio, mes + 1, 0).getDate()
  return new Date(anio, mes, Math.min(dia, ultimoDia))
}

function esTarjetaCredito(documento: Documento) {
  return documento.tipo.toLowerCase() === 'tarjeta de crédito'
}

function generarEventosDelMes(documentos: Documento[], anio: number, mes: number): EventoCalendario[] {
  const eventos: EventoCalendario[] = []

  documentos.forEach((documento) => {
    const vencimiento = obtenerFecha(documento.fecha_vencimiento)

    if (vencimiento.getFullYear() === anio && vencimiento.getMonth() === mes) {
      eventos.push({
        id: `${documento.id}-VENCIMIENTO-${aFechaISO(vencimiento)}`,
        documento,
        fecha: vencimiento,
        fechaISO: aFechaISO(vencimiento),
        tipo: 'VENCIMIENTO',
        titulo: 'Vencimiento físico',
      })
    }

    if (esTarjetaCredito(documento) && documento.dia_corte && documento.dia_pago) {
      const fechaCorte = crearFechaMensual(anio, mes, documento.dia_corte)
      const fechaPago = crearFechaMensual(anio, mes, documento.dia_pago)

      // Las fechas recurrentes se muestran hasta el vencimiento físico de la tarjeta.
      if (fechaCorte <= vencimiento) {
        eventos.push({
          id: `${documento.id}-CORTE-${aFechaISO(fechaCorte)}`,
          documento,
          fecha: fechaCorte,
          fechaISO: aFechaISO(fechaCorte),
          tipo: 'CORTE',
          titulo: 'Fecha de corte',
        })
      }

      if (fechaPago <= vencimiento) {
        eventos.push({
          id: `${documento.id}-PAGO-${aFechaISO(fechaPago)}`,
          documento,
          fecha: fechaPago,
          fechaISO: aFechaISO(fechaPago),
          tipo: 'PAGO',
          titulo: 'Fecha de pago',
        })
      }
    }
  })

  return eventos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
}

function estadoDocumento(documento: Documento) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const vencimiento = obtenerFecha(documento.fecha_vencimiento)
  const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / 86400000)
  if (diasRestantes < 0) return 'Vencido'
  if (diasRestantes <= 30) return 'Próximo a vencer'
  return 'Vigente'
}

function etiquetaEvento(tipo: TipoEvento) {
  if (tipo === 'CORTE') return 'Corte'
  if (tipo === 'PAGO') return 'Pago'
  return 'Vencimiento'
}

function claseEvento(tipo: TipoEvento) {
  if (tipo === 'CORTE') return 'status-corte'
  if (tipo === 'PAGO') return 'status-pago'
  return 'status-vencimiento'
}

function Calendario({ documentos }: CalendarioProps) {
  const [mesActual, setMesActual] = useState(new Date())
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null)

  const anio = mesActual.getFullYear()
  const mes = mesActual.getMonth()
  const diasMes = new Date(anio, mes + 1, 0).getDate()
  const primerDia = (new Date(anio, mes, 1).getDay() + 6) % 7

  const dias = useMemo(
    () => Array.from({ length: primerDia + diasMes }, (_, i) =>
      i < primerDia ? null : i - primerDia + 1,
    ),
    [primerDia, diasMes],
  )

  const eventosMes = useMemo(
    () => generarEventosDelMes(documentos, anio, mes),
    [documentos, anio, mes],
  )

  const eventosPorFecha = useMemo(() => {
    const agrupados: Record<string, EventoCalendario[]> = {}
    eventosMes.forEach((evento) => {
      if (!agrupados[evento.fechaISO]) agrupados[evento.fechaISO] = []
      agrupados[evento.fechaISO].push(evento)
    })
    return agrupados
  }, [eventosMes])

  const eventosSeleccionados = fechaSeleccionada ? eventosPorFecha[fechaSeleccionada] ?? [] : []
  const hoyISO = aFechaISO(new Date())

  function cambiarMes(direccion: number) {
    setMesActual(new Date(anio, mes + direccion, 1))
    setFechaSeleccionada(null)
  }

  return (
    <section className="calendar-section" id="calendario">
      <div className="calendar-heading">
        <div>
          <span className="calendar-label">ORGANIZA TUS DOCUMENTOS</span>
          <h2>Calendario de vencimientos</h2>
          <p>Consulta los vencimientos, fechas de corte y pagos de tus tarjetas.</p>
        </div>
        <span className="calendar-main-icon">📅</span>
      </div>

      <div className="calendar-layout">
        <div className="calendar-card">
          <div className="calendar-navigation">
            <button onClick={() => cambiarMes(-1)} aria-label="Mes anterior">‹</button>
            <h3>{meses[mes]} {anio}</h3>
            <button onClick={() => cambiarMes(1)} aria-label="Mes siguiente">›</button>
          </div>

          <div className="calendar-grid">
            {diasSemana.map((dia) => <div className="calendar-weekday" key={dia}>{dia}</div>)}

            {dias.map((dia, indice) => {
              if (dia === null) return <div className="calendar-day empty" key={`empty-${indice}`} />

              const iso = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
              const eventosDia = eventosPorFecha[iso] ?? []
              const tieneVencimiento = eventosDia.some((evento) => evento.tipo === 'VENCIMIENTO')
              const tienePago = eventosDia.some((evento) => evento.tipo === 'PAGO')
              const tieneCorte = eventosDia.some((evento) => evento.tipo === 'CORTE')
              const esHoy = hoyISO === iso

              let clase = ''
              if (tieneVencimiento) {
                const evento = eventosDia.find((item) => item.tipo === 'VENCIMIENTO')
                clase = evento && estadoDocumento(evento.documento) === 'Vencido' ? 'day-expired' : 'day-warning'
              } else if (tienePago) {
                clase = 'day-card-payment'
              } else if (tieneCorte) {
                clase = 'day-card-cut'
              }

              return (
                <button
                  key={iso}
                  className={`calendar-day ${clase} ${fechaSeleccionada === iso ? 'day-selected' : ''} ${esHoy ? 'day-today' : ''}`}
                  onClick={() => setFechaSeleccionada(iso)}
                  aria-label={`${dia} de ${meses[mes]}: ${eventosDia.length} evento(s)`}
                >
                  <span>{dia}</span>
                  {esHoy && <small className="calendar-today-label">Hoy</small>}
                  {eventosDia.length > 0 && (
                    <span className="calendar-event-dots" aria-hidden="true">
                      {Array.from(new Set(eventosDia.map((evento) => evento.tipo))).map((tipo) => (
                        <i
                          key={tipo}
                          className={`calendar-event-dot ${tipo === 'PAGO' ? 'dot-payment' : tipo === 'CORTE' ? 'dot-cut' : 'dot-expiration'}`}
                        />
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="calendar-legend">
            <span><i className="legend-expired" /> Vencimiento</span>
            <span><i className="legend-payment" /> Pago</span>
            <span><i className="legend-cut" /> Corte</span>
          </div>
        </div>

        <aside className="calendar-details">
          <h3>
            {fechaSeleccionada
              ? `Eventos del ${fechaSeleccionada.split('-').reverse().join('/')}`
              : `Eventos de ${meses[mes]} ${anio}`}
          </h3>

          {fechaSeleccionada ? (
            eventosSeleccionados.length > 0 ? (
              eventosSeleccionados.map((evento) => (
                <article className="calendar-document" key={evento.id}>
                  <strong>{evento.documento.tipo}</strong>
                  <p>{evento.titulo}</p>
                  <p>Fecha: {evento.fecha.toLocaleDateString('es-SV')}</p>
                  <span className={`calendar-status ${claseEvento(evento.tipo)}`}>{etiquetaEvento(evento.tipo)}</span>
                </article>
              ))
            ) : (
              <p className="calendar-empty">No hay eventos programados para este día.</p>
            )
          ) : (
            eventosMes.map((evento) => (
                <article className="calendar-document" key={evento.id}>
                  <strong>{evento.documento.tipo}</strong>
                  <p>{evento.titulo}: {evento.fecha.toLocaleDateString('es-SV')}</p>
                  <span className={`calendar-status ${claseEvento(evento.tipo)}`}>{etiquetaEvento(evento.tipo)}</span>
                </article>
              ))
          )}

          {!fechaSeleccionada && eventosMes.length === 0 && (
            <p className="calendar-empty">No hay eventos próximos para este mes.</p>
          )}

          {fechaSeleccionada && (
            <button className="calendar-back" onClick={() => setFechaSeleccionada(null)}>
              Ver próximos eventos
            </button>
          )}
        </aside>
      </div>
    </section>
  )
}

export default Calendario
