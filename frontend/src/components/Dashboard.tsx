
type Documento = {
    id: number
    tipo: string
    fecha_vencimiento: string
    dias_anticipacion: number
    usuario_id: number
  }
  
  type DashboardProps = {
    documentos: Documento[]
    nombre: string
    onAgregarDocumento: () => void
    onVerCalendario: () => void
  }
  
  function Dashboard({
    documentos,
    nombre,
    onAgregarDocumento,
    onVerCalendario,
  }: DashboardProps) {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
  
    function obtenerDias(fecha: string) {
      const vencimiento = new Date(`${fecha.slice(0, 10)}T12:00:00`)
      const fechaActual = new Date(hoy)
      fechaActual.setHours(12, 0, 0, 0)
  
      return Math.ceil(
        (vencimiento.getTime() - fechaActual.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    }
  
    const vencidos = documentos.filter(
      (documento) => obtenerDias(documento.fecha_vencimiento) < 0,
    )
  
    const proximos = documentos.filter((documento) => {
      const dias = obtenerDias(documento.fecha_vencimiento)
      return dias >= 0 && dias <= 30
    })
  
    const vigentes = documentos.length - vencidos.length - proximos.length
  
    return (
      <section className="dashboard">
        <div className="dashboard-heading">
          <div>
            <span className="dashboard-label">PANEL PRINCIPAL</span>
            <h2>¡Bienvenido, {nombre}!</h2>
            <p>Este es el resumen del estado de tus documentos.</p>
          </div>
  
          <button
            className="primary-button"
            onClick={onAgregarDocumento}
          >
            + Agregar documento
          </button>
        </div>
  
        <div className="dashboard-stats">
          <article className="stat-card">
            <span className="stat-icon">📁</span>
            <div>
              <p>Total de documentos</p>
              <h3>{documentos.length}</h3>
            </div>
          </article>
  
          <article className="stat-card stat-warning">
            <span className="stat-icon">⏳</span>
            <div>
              <p>Próximos a vencer</p>
              <h3>{proximos.length}</h3>
            </div>
          </article>
  
          <article className="stat-card stat-danger">
            <span className="stat-icon">⚠️</span>
            <div>
              <p>Documentos vencidos</p>
              <h3>{vencidos.length}</h3>
            </div>
        </article>

        <article className="stat-card stat-success">
            <span className="stat-icon">✓</span>
            <div>
            <p>Documentos vigentes</p>
            <h3>{vigentes}</h3>
            </div>
        </article>
        </div>

        <div className="dashboard-bottom">
        <article className="dashboard-panel">
            <h3>Estado de tus documentos</h3>
            <p>
            {documentos.length === 0
                ? 'Todavía no tienes documentos registrados.'
                : 'Mantén tus documentos actualizados y evita vencimientos.'}
            </p>
            <div className="status-list">
            <div>
                <span className="status-dot dot-success" />
                Vigentes
                <strong>{vigentes}</strong>
            </div>
            <div>
                <span className="status-dot dot-warning" />
                Próximos a vencer
                <strong>{proximos.length}</strong>
            </div>
            <div>
                <span className="status-dot dot-danger" />
                Vencidos
                <strong>{vencidos.length}</strong>
            </div>
            </div>
        </article>
        <article className="dashboard-panel calendar-shortcut">
            <span className="shortcut-icon">📅</span>
            <h3>Calendario de vencimientos</h3>
            <p>
            Consulta las fechas de vencimiento de todos tus documentos
            en un solo lugar.
            </p>
            <button
            className="secondary-button"
            onClick={onVerCalendario}
            >
            Abrir calendario →
            </button>
        </article>
        </div>
    </section>
    )
}

export default Dashboard
