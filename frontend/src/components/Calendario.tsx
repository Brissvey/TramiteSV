
import { useMemo, useState } from 'react'

type Documento = {
id: number
tipo: string
fecha_vencimiento: string
dias_anticipacion: number
usuario_id: number
}

type CalendarioProps = {
documentos: Documento[]
}

const meses = [
'Enero', 'Febrero', 'Marzo', 'Abril',
'Mayo', 'Junio', 'Julio', 'Agosto',
'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function obtenerFecha(fecha: string) {
const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number)
return new Date(anio, mes - 1, dia)
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

function fechaISO(dia: number) {
    return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

function documentosDelDia(dia: number) {
    return documentos.filter(
    (documento) => documento.fecha_vencimiento.slice(0, 10) === fechaISO(dia),
    )
}

function estadoDocumento(documento: Documento) {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const vencimiento = obtenerFecha(documento.fecha_vencimiento)
    const diasRestantes = Math.ceil(
    (vencimiento.getTime() - hoy.getTime()) / 86400000,
    )

    if (diasRestantes < 0) return 'Vencido'
    if (diasRestantes <= 30) return 'Próximo a vencer'
    return 'Vigente'
}

const seleccionados = documentos.filter(
    (documento) =>
    documento.fecha_vencimiento.slice(0, 10) === fechaSeleccionada,
)

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
        <p>Consulta cuándo vence cada uno de tus documentos.</p>
        </div>
        <span className="calendar-main-icon">📅</span>
    </div>

    <div className="calendar-layout">
        <div className="calendar-card">
        <div className="calendar-navigation">
            <button onClick={() => cambiarMes(-1)} aria-label="Mes anterior">
            ‹
            </button>
            <h3>{meses[mes]} {anio}</h3>
            <button onClick={() => cambiarMes(1)} aria-label="Mes siguiente">
            ›
            </button>
        </div>

        <div className="calendar-grid">
            {diasSemana.map((dia) => (
            <div className="calendar-weekday" key={dia}>
                {dia}
            </div>
            ))}

            {dias.map((dia, indice) => {
            if (dia === null) {
                return <div className="calendar-day empty" key={`empty-${indice}`} />
            }
            const documentosDia = documentosDelDia(dia)
            const iso = fechaISO(dia)
            const estados = documentosDia.map(estadoDocumento)
            const esHoy =
                new Date().toDateString() ===
                new Date(anio, mes, dia).toDateString()

            let clase = ''
            if (estados.includes('Vencido')) clase = 'day-expired'
            else if (estados.includes('Próximo a vencer')) clase = 'day-warning'
            else if (documentosDia.length > 0) clase = 'day-valid'

            return (
                <button
                key={iso}
                className={`calendar-day ${clase} ${fechaSeleccionada === iso ? 'day-selected' : ''} ${esHoy ? 'day-today' : ''}`}
                onClick={() => setFechaSeleccionada(iso)}
                >
                <span>{dia}</span>
                {documentosDia.length > 0 && (
                    <small>{documentosDia.length} doc.</small>
                )}
                </button>
            )
            })}
        </div>

        <div className="calendar-legend">
            <span><i className="legend-valid" /> Vigente</span>
            <span><i className="legend-warning" /> Próximo a vencer</span>
            <span><i className="legend-expired" /> Vencido</span>
        </div>
        </div>

        <aside className="calendar-details">
        <h3>
            {fechaSeleccionada
            ? `Vencimientos del ${fechaSeleccionada.split('-').reverse().join('/')}`
            : 'Próximos vencimientos'}
        </h3>

        {fechaSeleccionada ? (
            seleccionados.length > 0 ? (
            seleccionados.map((documento) => (
                <article className="calendar-document" key={documento.id}>
                <strong>{documento.tipo}</strong>
                <p>Estado: {estadoDocumento(documento)}</p>
                <p>Recordatorio: {documento.dias_anticipacion} días antes</p>
                </article>
            ))
            ) : (
            <p className="calendar-empty">
                No hay documentos que venzan este día.
            </p>
            )
        ) : (
            documentos
            .filter((documento) => obtenerFecha(documento.fecha_vencimiento) >= new Date(new Date().setHours(0, 0, 0, 0)))
            .sort((a, b) => a.fecha_vencimiento.localeCompare(b.fecha_vencimiento))
            .slice(0, 5)
            .map((documento) => (
                <article className="calendar-document" key={documento.id}>
                <strong>{documento.tipo}</strong>
                <p>Vence: {obtenerFecha(documento.fecha_vencimiento).toLocaleDateString('es-SV')}</p>
                <span className={`calendar-status ${estadoDocumento(documento) === 'Próximo a vencer' ? 'status-soon' : 'status-valid'}`}>
                    {estadoDocumento(documento)}
                </span>
                </article>
            ))
        )}

        {fechaSeleccionada && (
            <button
            className="calendar-back"
            onClick={() => setFechaSeleccionada(null)}
            >
            Ver próximos vencimientos
            </button>
        )}
        </aside>
    </div>
    </section>
)
}

export default Calendario
