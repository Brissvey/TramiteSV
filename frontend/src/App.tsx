
import './App.css'
import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import Calendario from './components/Calendario'

const API = 'http://localhost:3003'

type Usuario = {
  id: number
  nombre: string
  correo: string
}

type Documento = {
  id: number
  tipo: string
  fecha_vencimiento: string
  dias_anticipacion: number
  usuario_id: number
}

function App() {
  const [estadoBackend, setEstadoBackend] = useState('Conectando...')
  const [mostrarAuth, setMostrarAuth] = useState(false)
  const [modoRegistro, setModoRegistro] = useState(false)
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mostrarDocumento, setMostrarDocumento] = useState(false)
  const [documentoEditando, setDocumentoEditando] = useState<Documento | null>(null)
  const [tipoDocumento, setTipoDocumento] = useState('DUI')
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [diasAnticipacion, setDiasAnticipacion] = useState(14)
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [cargandoDocumentos, setCargandoDocumentos] = useState(false)

  useEffect(() => {
    async function restaurarSesion() {
      const token = localStorage.getItem('tramitesv_token')
      const usuarioGuardado = localStorage.getItem('tramitesv_usuario')
      try {
        const respuesta = await fetch(`${API}/api/documentos`, {
          headers: {
            Authorization: `Bearer ${token || ''}`,
          },
        })
        setEstadoBackend('Conectado correctamente')
        if (!token || !usuarioGuardado) return
        if (!respuesta.ok) {
          throw new Error('La sesión ha expirado.')
        }
        const usuarioRecuperado = JSON.parse(usuarioGuardado) as Usuario
        const documentosRecuperados = await respuesta.json()
        setUsuario(usuarioRecuperado)
        setDocumentos(documentosRecuperados as Documento[])
      } catch {
        localStorage.removeItem('tramitesv_token')
        localStorage.removeItem('tramitesv_usuario')
        setUsuario(null)
        setDocumentos([])
      }
    }
  
    void restaurarSesion()
  }, [])

  async function enviarFormulario(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMensaje('')
    setCargando(true)

    try {
      const endpoint = modoRegistro ? 'registro' : 'login'
      const datos = modoRegistro
        ? { nombre, correo, password }
        : { correo, password }

      const respuesta = await fetch(`${API}/api/usuarios/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      })

      const resultado = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          Array.isArray(resultado.message)
            ? resultado.message.join(', ')
            : resultado.message || 'No se pudo completar la operación',
        )
      }

      if (modoRegistro) {
        setMensaje('Cuenta creada correctamente. Ahora puedes iniciar sesión.')
        setModoRegistro(false)
        setPassword('')
      } else {
        localStorage.setItem('tramitesv_token', resultado.access_token)
        localStorage.setItem('tramitesv_usuario', JSON.stringify(resultado.usuario))
        setUsuario(resultado.usuario)
        setMostrarAuth(false)
        setMensaje('')
        setPassword('')
        await cargarDocumentos(resultado.access_token)
      }
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado',
      )
    } finally {
      setCargando(false)
    }
  }

  async function cargarDocumentos(token?: string) {
    const accessToken = token || localStorage.getItem('tramitesv_token')

    if (!accessToken) {
      setDocumentos([])
      return
    }

    setCargandoDocumentos(true)

    try {
      const respuesta = await fetch(`${API}/api/documentos`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const resultado = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          resultado.message || 'No se pudieron cargar tus documentos.',
        )
      }

      setDocumentos(resultado as Documento[])
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : 'Error al cargar los documentos.',
      )
    } finally {
      setCargandoDocumentos(false)
    }
  }

  function abrirLogin() {
    setModoRegistro(false)
    setMostrarAuth(true)
    setMensaje('')
  }

  function cerrarSesion() {
    localStorage.removeItem('tramitesv_token')
    localStorage.removeItem('tramitesv_usuario')
    setUsuario(null)
    setDocumentos([])
    setMostrarDocumento(false)
    setMensaje('Has cerrado sesión.')
  }

  function cerrarVentana() {
    setMostrarAuth(false)
    setMensaje('')
  }

  function abrirFormularioDocumento() {
    setMensaje('')
    setMostrarDocumento(true)
  }
  function abrirEdicionDocumento(documento: Documento) {
    setDocumentoEditando(documento)
    setTipoDocumento(documento.tipo)
    setFechaVencimiento(documento.fecha_vencimiento.slice(0, 10))
    setDiasAnticipacion(documento.dias_anticipacion)
    setMensaje('')
    setMostrarDocumento(true)
  }


  async function registrarDocumento(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMensaje('')
    const token = localStorage.getItem('tramitesv_token')
    if (!token) {
      setMensaje('Debes iniciar sesión primero.')
      abrirLogin()
      return
    }
    try {
      const editando = documentoEditando !== null
      const url = editando
        ? `${API}/api/documentos/${documentoEditando.id}`
        : `${API}/api/documentos`
      const respuesta = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipo: tipoDocumento,
          fecha_vencimiento: fechaVencimiento,
          dias_anticipacion: diasAnticipacion,
        }),
      })
      const resultado = await respuesta.json()
      if (!respuesta.ok) {
        throw new Error(
          Array.isArray(resultado.message)
            ? resultado.message.join(', ')
            : resultado.message || 'No se pudo guardar el documento.',
        )
      }
      setMensaje(
        editando
          ? 'Documento actualizado correctamente.'
          : 'Documento registrado correctamente.',
      )
      setMostrarDocumento(false)
      setDocumentoEditando(null)
      setFechaVencimiento('')
      setDiasAnticipacion(14)
      await cargarDocumentos(token)
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : 'Error al guardar el documento.',
      )
    }
  }
  

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
        {usuario ? (
          <div>
            <span>Hola, {usuario.nombre} </span>
            <button className="login-button" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        ) : (
          <button className="login-button" onClick={abrirLogin}>
            Iniciar sesión
          </button>
        )}
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-content">
            <p>Estado del sistema: {estadoBackend}</p>
            <span className="badge">🇸🇻 Tu asistente de trámites</span>
            <h2>
              Nunca olvides renovar
              <span> tus documentos</span>
            </h2>
            <p>
              TrámiteSV te ayuda a controlar el vencimiento de tus documentos
              y te proporciona información para renovarlos a tiempo.
            </p>
            <div className="hero-buttons">
              <button className="primary-button" onClick={() => {
                if (!usuario) {
                  abrirLogin()
                } else {
                  abrirFormularioDocumento()
                }
              }}>
                Agregar documento
              </button>
              <button className="secondary-button" onClick={() => {
                if (!usuario) {
                  abrirLogin()
                } else {
                  document.getElementById('documentos')?.scrollIntoView({
                    behavior: 'smooth',
                  })
                  void cargarDocumentos()
                }
              }}>
                Ver mis documentos
              </button>
            </div>
            {usuario && <p>Sesión iniciada como {usuario.correo}</p>}
            {mensaje && !mostrarAuth && (
              <p role="status">{mensaje}</p>
            )}
          </div>
          <div className="hero-card">
            <div className="card-icon">📅</div>
            <h3>Próximos vencimientos</h3>
            {documentos.length === 0 ? (
              <p>Aún no tienes documentos registrados.</p>
            ) : (
              [...documentos]
                .sort((a, b) => a.fecha_vencimiento.localeCompare(b.fecha_vencimiento))
                .slice(0, 3)
                .map((documento) => (
                  <div className="document-preview" key={documento.id}>
                    <div>
                      <strong>{documento.tipo}</strong>
                      <p>
                        Vence el:{' '}
                        {new Date(
                          `${documento.fecha_vencimiento.slice(0, 10)}T12:00:00`,
                        ).toLocaleDateString('es-SV')}
                      </p>
                    </div>
                    <span className="warning">📅</span>
                  </div>
                ))
            )}
          </div>
        </section>

        {usuario && (
  <>
    <Dashboard
      documentos={documentos}
      nombre={usuario.nombre}
      onAgregarDocumento={abrirFormularioDocumento}
      onVerCalendario={() => {
        document.getElementById('calendario')?.scrollIntoView({
          behavior: 'smooth',
        })
      }}
    />

    <Calendario documentos={documentos} />
  </>
)}

        {mostrarAuth && (
          <div className="auth-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) cerrarVentana()
          }}>
            <section
              className="auth-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-title"
            >
              <button
                type="button"
                className="auth-close"
                onClick={cerrarVentana}
                aria-label="Cerrar ventana"
              >
                ×
              </button>
              <div className="section-title">
                <span>CUENTA</span>
                <h2 id="auth-title">
                  {modoRegistro ? 'Crear una cuenta' : 'Iniciar sesión'}
                </h2>
                <p>
                  {modoRegistro
                    ? 'Regístrate para comenzar a controlar tus documentos.'
                    : 'Ingresa con tu correo y contraseña.'}
                </p>
              </div>
              <form className="auth-form" onSubmit={enviarFormulario}>
                {modoRegistro && (
                  <label>
                    Nombre completo
                    <input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      maxLength={100}
                      autoComplete="name"
                    />
                  </label>
                )}
                <label>
                  Correo electrónico
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    maxLength={150}
                    autoComplete="email"
                  />
                </label>
                <label>
                  Contraseña
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete={modoRegistro ? 'new-password' : 'current-password'}
                  />
                </label>
                {mensaje && (
                  <p className="auth-message" role="alert">
                    {mensaje}
                  </p>
                )}
                <button className="primary-button" type="submit" disabled={cargando}>
                  {cargando
                    ? 'Procesando...'
                    : modoRegistro
                      ? 'Crear cuenta'
                      : 'Iniciar sesión'}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setModoRegistro(!modoRegistro)
                    setMensaje('')
                  }}
                >
                  {modoRegistro ? 'Ya tengo una cuenta' : 'Crear una cuenta nueva'}
                </button>
              </form>
            </section>
          </div>
        )}

        {mostrarDocumento && usuario && (
          <div className="auth-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) setMostrarDocumento(false)
          }}>
            <section
              className="auth-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="documento-title"
            >
              <button
                className="auth-close"
                type="button"
                onClick={() => setMostrarDocumento(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
              <div className="section-title">
                <span>NUEVO DOCUMENTO</span>
                <h2>{documentoEditando ? 'Editar documento' : 'Registrar documento'}</h2>
                <p>Completa los datos para controlar su vencimiento.</p>
              </div>
              <form className="auth-form" onSubmit={registrarDocumento}>
                <label>
                  Tipo de documento
                  <select
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                  >
                    <option value="DUI">DUI</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="Licencia de conducir">Licencia de conducir</option>
                    <option value="Tarjeta de circulación">Tarjeta de circulación</option>
                  </select>
                </label>
                <label>
                  Fecha de vencimiento
                  <input
                    type="date"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                    min={new Date().toLocaleDateString('en-CA')}
                    required
                  />
                </label>
                <label>
                  Avisarme con anticipación
                  <select
                    value={diasAnticipacion}
                    onChange={(e) => setDiasAnticipacion(Number(e.target.value))}
                  >
                    <option value={7}>7 días antes</option>
                    <option value={14}>14 días antes</option>
                    <option value={21}>21 días antes</option>
                    <option value={30}>30 días antes</option>
                  </select>
                </label>
                {mensaje && <p role="alert">{mensaje}</p>}
                <button className="primary-button" type="submit">
                  Guardar documento
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setMostrarDocumento(false)}
                >
                  Cancelar
                </button>
              </form>
            </section>
          </div>
        )}

        <section className="documents" id="documentos">
          <div className="section-title">
            <span>DOCUMENTOS</span>
            <h2>Administra tus documentos</h2>
            <p>
              Registra tus documentos y recibe recordatorios antes de que
              venzan.
            </p>
          </div>
          {!usuario ? (
            <p className="section-title">
              Inicia sesión para consultar tus documentos personales.
            </p>
          ) : cargandoDocumentos ? (
            <p className="section-title">Cargando tus documentos...</p>
          ) : documentos.length === 0 ? (
            <p className="section-title">
              Todavía no tienes documentos registrados.
            </p>
          ) : (
            
<div className="document-grid">
  {documentos.map((documento) => (
    <div className="document-card" key={documento.id}>
      <div className="document-icon">📄</div>
      <h3>{documento.tipo}</h3>
      <p>
        Vence el:{' '}
        {new Date(
          `${documento.fecha_vencimiento.slice(0, 10)}T12:00:00`,
        ).toLocaleDateString('es-SV')}
      </p>
      <p>Recordatorio: {documento.dias_anticipacion} días antes</p>
      <button
        type="button"
        onClick={() => abrirEdicionDocumento(documento)}
      >
        Editar
      </button>
    </div>
  ))}
</div>

          )}
        </section>

        <section className="features" id="tramites">
          <div className="feature">
            <span>🔔</span>
            <h3>Recordatorios automáticos</h3>
            <p>Recibe avisos 7, 14, 21 o 30 días antes del vencimiento.</p>
          </div>
          <div className="feature">
            <span>📋</span>
            <h3>Requisitos</h3>
            <p>Consulta los requisitos necesarios para renovar.</p>
          </div>
          <div className="feature">
            <span>📍</span>
            <h3>Centros de atención</h3>
            <p>Encuentra información sobre dónde realizar el trámite.</p>
          </div>
          <div className="feature">
            <span>🔗</span>
            <h3>Enlaces oficiales</h3>
            <p>Accede a los sitios oficiales para iniciar tu trámite.</p>
          </div>
        </section>
      </main>

      <footer>
        <div>
          <strong>TrámiteSV</strong>
          <p>Asistente de documentos y vencimientos en El Salvador.</p>
        </div>
        <p>© 2026 TrámiteSV</p>
      </footer>
    </div>
  )
}

export default App
