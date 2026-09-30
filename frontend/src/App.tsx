import './App.css'

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span>📋</span>
          <h1>TrámiteSV</h1>
        </div>

        <nav>
          <a href="#inicio">Inicio</a>
          <a href="#documentos">Mis documentos</a>
          <a href="#tramites">Trámites</a>
        </nav>

        <button className="login-button">
          Iniciar sesión
        </button>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-content">
            <span className="badge">🇸🇻 Tu asistente de trámites</span>

            <h2>
              Nunca olvides renovar
              <span> tus documentos</span>
            </h2>

            <p>
              TrámiteSV te ayuda a controlar el vencimiento de tus
              documentos y te proporciona la información necesaria
              para realizar su renovación a tiempo.
            </p>

            <div className="hero-buttons">
              <button className="primary-button">
                Agregar documento
              </button>

              <button className="secondary-button">
                Ver mis documentos
              </button>
            </div>
          </div>

          <div className="hero-card">
            <div className="card-icon">📅</div>

            <h3>Próximos vencimientos</h3>

            <div className="document-preview">
              <div>
                <strong>Licencia de conducir</strong>
                <p>Vence en 14 días</p>
              </div>

              <span className="warning">⚠️</span>
            </div>

            <div className="document-preview">
              <div>
                <strong>DUI</strong>
                <p>Vence en 8 meses</p>
              </div>

              <span className="success">✓</span>
            </div>
          </div>
        </section>

        <section className="documents" id="documentos">
          <div className="section-title">
            <span>DOCUMENTOS</span>
            <h2>Administra tus documentos</h2>
            <p>
              Registra tus documentos y recibe recordatorios
              antes de que venzan.
            </p>
          </div>

          <div className="document-grid">
            <div className="document-card">
              <div className="document-icon">🪪</div>
              <h3>DUI</h3>
              <p>Controla la fecha de vencimiento de tu DUI.</p>
            </div>

            <div className="document-card">
              <div className="document-icon">🌎</div>
              <h3>Pasaporte</h3>
              <p>Recibe avisos antes de que expire.</p>
            </div>

            <div className="document-card">
              <div className="document-icon">🚗</div>
              <h3>Licencia</h3>
              <p>Consulta cuándo debes renovarla.</p>
            </div>

            <div className="document-card">
              <div className="document-icon">📄</div>
              <h3>Tarjeta de circulación</h3>
              <p>Mantén controlada su fecha de vencimiento.</p>
            </div>
          </div>
        </section>

        <section className="features" id="tramites">
          <div className="feature">
            <span>🔔</span>
            <h3>Recordatorios automáticos</h3>
            <p>
              Recibe avisos 7, 14, 21 o 30 días antes del vencimiento.
            </p>
          </div>

          <div className="feature">
            <span>📋</span>
            <h3>Requisitos</h3>
            <p>
              Consulta los requisitos necesarios para renovar.
            </p>
          </div>

          <div className="feature">
            <span>📍</span>
            <h3>Centros de atención</h3>
            <p>
              Encuentra información sobre dónde realizar el trámite.
            </p>
          </div>

          <div className="feature">
            <span>🔗</span>
            <h3>Enlaces oficiales</h3>
            <p>
              Accede directamente a los sitios oficiales para iniciar
              tu trámite.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <div>
          <strong>TrámiteSV</strong>
          <p>
            Asistente de documentos y vencimientos en El Salvador.
          </p>
        </div>

        <p>© 2026 TrámiteSV</p>
      </footer>
    </div>
  )
}

export default App