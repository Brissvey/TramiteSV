import RequisitosTramites from "./components/RequisitosTramites";
import './App.css'
import { useEffect, useState, type FormEvent } from 'react'

import {
  BellRing,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  ExternalLink,
  LogIn,
  LogOut,
  LockKeyhole,
  Mail,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'

import Dashboard from './components/Dashboard'
import Calendario from './components/Calendario'
import GuiaTramites from './components/GuiaTramites'
import CentrosAtencion from './components/CentrosAtencion'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3003'
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
  dia_corte: number | null
  dia_pago: number | null
}


function IconoDocumento({ tipo }: { tipo: string }) {
  const nombre = tipo.toLowerCase();

  if (nombre.includes('dui')) {
    return <CreditCard size={27} strokeWidth={1.8} />;
  }

  if (nombre.includes('pasaporte')) {
    return <FileText size={27} strokeWidth={1.8} />;
  }

  if (nombre.includes('licencia')) {
    return <CarFront size={27} strokeWidth={1.8} />;
  }

  if (nombre.includes('tarjeta de crédito')) {
    return <CreditCard size={27} strokeWidth={1.8} />;
  }

  if (nombre.includes('tarjeta')) {
    return <CarFront size={27} strokeWidth={1.8} />;
  }

  return <FileText size={27} strokeWidth={1.8} />;
}

function claseDocumento(tipo: string) {
  const nombre = tipo.toLowerCase();

  if (nombre.includes('dui')) return 'dui';
  if (nombre.includes('pasaporte')) return 'pasaporte';
  if (nombre.includes('licencia')) return 'licencia';
  if (nombre.includes('tarjeta de crédito')) return 'credito';
  if (nombre.includes('tarjeta')) return 'circulacion';

  return 'default';
}


function formatearFechaDocumento(fecha: string, tipo: string) {
  const fechaISO = fecha.slice(0, 10)

  if (tipo === 'Tarjeta de crédito') {
    const [anio, mes] = fechaISO.split('-')
    return `${mes}/${anio}`
  }

  return new Date(`${fechaISO}T12:00:00`).toLocaleDateString('es-SV')
}

function App() {
  const tokenRecuperacion = new URLSearchParams(
    window.location.search,
  ).get('token');
  const [estadoBackend, setEstadoBackend] = useState('Conectando...')
  const [mostrarAuth, setMostrarAuth] = useState(false)
  const [modoRegistro, setModoRegistro] = useState(false)
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [modoRecuperacion, setModoRecuperacion] = useState(
    tokenRecuperacion ? 'restablecer' : 'ninguno'
  )
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mostrarDocumento, setMostrarDocumento] = useState(false)
  const [documentoEditando, setDocumentoEditando] =
    useState<Documento | null>(null)
  const [tipoDocumento, setTipoDocumento] = useState('DUI')
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [mesVencimientoTarjeta, setMesVencimientoTarjeta] = useState('')
  const [anioVencimientoTarjeta, setAnioVencimientoTarjeta] = useState('')
  const [diasAnticipacion, setDiasAnticipacion] = useState(14)
  const [diaCorte, setDiaCorte] = useState(15)
  const [diaPago, setDiaPago] = useState(25)
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
        setEstadoBackend('No se pudo conectar')
      }
    }

    void restaurarSesion()
  }, [])

  async function enviarFormulario(e: FormEvent<HTMLFormElement>) {
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
        localStorage.setItem(
          'tramitesv_usuario',
          JSON.stringify(resultado.usuario),
        )

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

async function restablecerPassword(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setMensaje('');

  if (!tokenRecuperacion) {
    setMensaje('El enlace de recuperación no es válido.');
    return;
  }

  if (nuevaPassword !== confirmarPassword) {
    setMensaje('Las contraseñas no coinciden.');
    return;
  }

  setCargando(true);

  try {
    const respuesta = await fetch(
      `${API}/api/usuarios/restablecer-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: tokenRecuperacion,
          nuevaPassword,
        }),
      },
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        Array.isArray(resultado.message)
          ? resultado.message.join(', ')
          : resultado.message || 'No se pudo restablecer la contraseña.',
      );
    }

    setMensaje('Contraseña actualizada correctamente. Ya puedes iniciar sesión.');
    setNuevaPassword('');
    setConfirmarPassword('');
    setModoRecuperacion('ninguno');

    window.history.replaceState({}, '', window.location.pathname);
  } catch (error) {
    setMensaje(
      error instanceof Error
        ? error.message
        : 'Ocurrió un error inesperado.',
    );
  } finally {
    setCargando(false);
  }
}

async function solicitarRecuperacion(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setMensaje('');
  setCargando(true);

  try {
    const respuesta = await fetch(`${API}/api/usuarios/recuperar-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo }),
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.message || 'No se pudo enviar la solicitud.');
    }

    setMensaje(
      resultado.mensaje ||
      'Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.',
    );
  } catch (error) {
    setMensaje(
      error instanceof Error
        ? error.message
        : 'Ocurrió un error inesperado.',
    );
  } finally {
    setCargando(false);
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
    setDocumentoEditando(null)
    setTipoDocumento('DUI')
    setFechaVencimiento('')
    setMesVencimientoTarjeta('')
    setAnioVencimientoTarjeta('')
    setDiasAnticipacion(14)
    setDiaCorte(15)
    setDiaPago(25)
    setMensaje('')
    setMostrarDocumento(true)
  }

  function abrirEdicionDocumento(documento: Documento) {
    setDocumentoEditando(documento)
    setTipoDocumento(documento.tipo)
    setFechaVencimiento(documento.fecha_vencimiento.slice(0, 10))
    if (documento.tipo === 'Tarjeta de crédito') {
      const fecha = new Date(`${documento.fecha_vencimiento.slice(0, 10)}T12:00:00`)
      setMesVencimientoTarjeta(String(fecha.getMonth() + 1).padStart(2, '0'))
      setAnioVencimientoTarjeta(String(fecha.getFullYear()))
    } else {
      setMesVencimientoTarjeta('')
      setAnioVencimientoTarjeta('')
    }
    setDiasAnticipacion(documento.dias_anticipacion)
    setDiaCorte(documento.dia_corte ?? 15)
    setDiaPago(documento.dia_pago ?? 25)
    setMensaje('')
    setMostrarDocumento(true)
  }

  async function registrarDocumento(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMensaje('')

    const token = localStorage.getItem('tramitesv_token')

    if (!token) {
      setMensaje('Debes iniciar sesión primero.')
      abrirLogin()
      return
    }

    try {
      let fechaParaEnviar = fechaVencimiento

      if (tipoDocumento === 'Tarjeta de crédito') {
        if (!mesVencimientoTarjeta || !anioVencimientoTarjeta) {
          throw new Error('Selecciona el mes y el año de vencimiento de la tarjeta.')
        }

        const anio = Number(anioVencimientoTarjeta)
        const mes = Number(mesVencimientoTarjeta)
        const hoy = new Date()

        if (
          anio < hoy.getFullYear() ||
          (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)
        ) {
          throw new Error('La fecha de vencimiento de la tarjeta no puede estar en el pasado.')
        }

        const ultimoDia = new Date(anio, mes, 0).getDate()
        fechaParaEnviar = `${anio}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`
      }

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
          fecha_vencimiento: fechaParaEnviar,
          dias_anticipacion: diasAnticipacion,
          dia_corte: tipoDocumento === 'Tarjeta de crédito' ? diaCorte : null,
          dia_pago: tipoDocumento === 'Tarjeta de crédito' ? diaPago : null,
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
      setMesVencimientoTarjeta('')
      setAnioVencimientoTarjeta('')
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

async function eliminarDocumento(id: number, tipo: string) {
  const confirmar = window.confirm(
    `¿Estás seguro de que deseas eliminar este documento: ${tipo}?`,
  )

  if (!confirmar) return

  const token = localStorage.getItem('tramitesv_token')

  if (!token) {
    setMensaje('Debes iniciar sesión nuevamente.')
    return
  }

  try {
    const respuesta = await fetch(`${API}/api/documentos/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!respuesta.ok) {
      const resultado = await respuesta.json()
      throw new Error(
        resultado.message || 'No se pudo eliminar el documento.',
      )
    }

    setDocumentos((actuales) =>
      actuales.filter((documento) => documento.id !== id),
    )

    setMensaje('Documento eliminado correctamente.')
  } catch (error) {
    setMensaje(
      error instanceof Error
        ? error.message
        : 'Error al eliminar el documento.',
    )
  }
}


  return (
    <div className="app">
      {/* ENCABEZADO */}
      <header className="header">
        <a href="#inicio" className="logo">
          <span className="logo-icon">
            <ShieldCheck size={27} strokeWidth={2} />
          </span>
          <h1>TrámiteSV</h1>
        </a>

        <nav>
          <a href="#inicio">Inicio</a>
          <a href="#documentos">Mis documentos</a>
          <a href="#tramites">Guía de trámites</a>
<a href="#calendario">Calendario</a>
<a href="#centros-atencion">Centros de atención</a>
<a href="#sitios-oficiales">Sitios oficiales</a>
        </nav>

        {usuario ? (
          <div className="header-user">
            <span>
              <UserRound size={17} />
              Hola, {usuario.nombre}
            </span>

            <button className="login-button" onClick={cerrarSesion}>
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        ) : (
          <button className="login-button" onClick={abrirLogin}>
            <LogIn size={17} />
            Iniciar sesión
          </button>
        )}
      </header>

      <main>
        {/* INICIO */}
        <section className="hero" id="inicio">
          <div className="hero-content">
            <p className="backend-status">
              <span
                className={`status-dot ${
                  estadoBackend === 'Conectado correctamente'
                    ? 'connected'
                    : ''
                }`}
              />
              Sistema: {estadoBackend}
            </p>

            <span className="badge">
              <ShieldCheck size={15} />
              Tu asistente de trámites en El Salvador
            </span>

            <h2>
              Nunca olvides renovar
              <span> tus documentos</span>
            </h2>

            <p>
              TrámiteSV te ayuda a controlar el vencimiento de tus documentos
              y te proporciona información para renovarlos a tiempo.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-button"
                onClick={() => {
                  if (!usuario) {
                    abrirLogin()
                  } else {
                    abrirFormularioDocumento()
                  }
                }}
              >
                <Plus size={18} />
                Agregar documento
              </button>

              <button
                className="secondary-button"
                onClick={() => {
                  if (!usuario) {
                    abrirLogin()
                  } else {
                    document.getElementById('documentos')?.scrollIntoView({
                      behavior: 'smooth',
                    })
                    void cargarDocumentos()
                  }
                }}
              >
                <FileText size={18} />
                Ver mis documentos
              </button>
            </div>

            {usuario && (
              <p className="session-info">
                <CheckCircle2 size={16} />
                Sesión iniciada como {usuario.correo}
              </p>
            )}

            {mensaje && !mostrarAuth && (
              <p role="status">{mensaje}</p>
            )}
          </div>

          <div className="hero-card">
            <div className="card-icon">
              <CalendarDays size={30} />
            </div>

            <h3>Próximos vencimientos</h3>

            {documentos.length === 0 ? (
              <p>Aún no tienes documentos registrados.</p>
            ) : (
              [...documentos]
                .sort((a, b) =>
                  a.fecha_vencimiento.localeCompare(b.fecha_vencimiento),
                )
                .slice(0, 3)
                .map((documento) => (
                  <div className="document-preview" key={documento.id}>
                    <div>
                      <strong>{documento.tipo}</strong>
                      <p>
                        Vence el:{' '}
                        {formatearFechaDocumento(
                          documento.fecha_vencimiento,
                          documento.tipo,
                        )}
                      </p>
                    </div>
                    <CalendarDays size={19} className="warning" />
                  </div>
                ))
            )}
          </div>
        </section>

        {/* DASHBOARD Y CALENDARIO */}
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

        {/* MIS DOCUMENTOS */}
        <section className="documents" id="documentos">
          <div className="section-title">
            <span>GESTIÓN PERSONAL</span>
            <h2>Mis documentos</h2>
            <p>
              Registra tus documentos y recibe recordatorios antes de que
              venzan.
            </p>
          </div>

          {!usuario ? (
            <div className="documents-empty">
              <div className="empty-icon">
                <LockKeyhole size={30} />
              </div>
              <h3>Tu información está protegida</h3>
              <p>
                Inicia sesión para consultar y administrar tus documentos
                personales.
              </p>
              <button className="primary-button" onClick={abrirLogin}>
                <LogIn size={17} />
                Iniciar sesión
              </button>
            </div>
          ) : cargandoDocumentos ? (
            <p className="section-title">Cargando tus documentos...</p>
          ) : documentos.length === 0 ? (
            <div className="documents-empty">
              <div className="empty-icon">
                <FileText size={30} />
              </div>
              <h3>¡Comienza a organizar tus documentos!</h3>
              <p>
                Todavía no tienes documentos registrados. Agrega el primero
                para comenzar a controlar sus vencimientos.
              </p>
              <button
                className="primary-button"
                onClick={abrirFormularioDocumento}
              >
                <Plus size={18} />
                Registrar documento
              </button>
            </div>
          ) : (
            <div className="document-grid">
              {documentos.map((documento) => (
                <div
                className={`document-card document-card--${claseDocumento(documento.tipo)}`}
                key={documento.id}
              >
                  <div className="document-icon">
                    <IconoDocumento tipo={documento.tipo} />
                  </div>

                  <h3>{documento.tipo}</h3>

                  <p>
                    <CalendarDays size={15} />
                    Vence el:{' '}
                    {formatearFechaDocumento(
                      documento.fecha_vencimiento,
                      documento.tipo,
                    )}
                  </p>

                  <p>
                    <BellRing size={15} />
                    Recordatorio: {documento.dias_anticipacion} días antes
                  </p>


                  <div className="document-card-actions">
  <button
    className="document-edit-button"
    type="button"
    onClick={() => abrirEdicionDocumento(documento)}
  >
    <Pencil size={16} />
    Editar documento
  </button>

  <button
    className="document-delete-button"
    type="button"
    onClick={() =>
      eliminarDocumento(documento.id, documento.tipo)
    }
  >
    Eliminar documento
  </button>
</div>

                </div>
              ))}
            </div>
          )}
        </section>

{modoRecuperacion === 'restablecer' && (
  <div className="auth-overlay">
    <section className="auth-modal" role="dialog" aria-modal="true">
      <div className="section-title">
        <span>SEGURIDAD DE CUENTA</span>
        <h2>Crear nueva contraseña</h2>
        <p>Ingresa tu nueva contraseña para recuperar el acceso a TrámiteSV.</p>
      </div>

      <form className="auth-form" onSubmit={restablecerPassword}>
        <label>
          Nueva contraseña
          <span className="input-icon">
            <LockKeyhole size={17} />
            <input
              type="password"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              required
            />
          </span>
        </label>

        <label>
          Confirmar nueva contraseña
          <span className="input-icon">
            <LockKeyhole size={17} />
            <input
              type="password"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              required
            />
          </span>
        </label>

        {mensaje && (
          <p className="auth-message" role="alert">
            {mensaje}
          </p>
        )}

        <button
          className="primary-button"
          type="submit"
          disabled={cargando}
        >
          {cargando ? 'Actualizando...' : 'Guardar nueva contraseña'}
          {!cargando && <ChevronRight size={18} />}
        </button>
      </form>
    </section>
  </div>
)}

{modoRecuperacion === 'solicitar' && (
  <div className="auth-overlay">
    <section className="auth-modal" role="dialog" aria-modal="true">
      <div className="section-title">
        <span>RECUPERAR CUENTA</span>
        <h2>¿Olvidaste tu contraseña?</h2>
        <p>Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.</p>
      </div>

      <form className="auth-form" onSubmit={solicitarRecuperacion}>
        <label>
          Correo electrónico
          <span className="input-icon">
            <Mail size={17} />
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
              required
            />
          </span>
        </label>

        {mensaje && (
          <p className="auth-message" role="alert">
            {mensaje}
          </p>
        )}

        <button
          className="primary-button"
          type="submit"
          disabled={cargando}
        >
          {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
          {!cargando && <ChevronRight size={18} />}
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setModoRecuperacion('ninguno');
            setMensaje('');
          }}
        >
          Volver al inicio de sesión
        </button>
      </form>
    </section>
  </div>
)}

        {/* FORMULARIO DE AUTENTICACIÓN */}
        {mostrarAuth && modoRecuperacion !== 'solicitar' && (
          <div
            className="auth-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) cerrarVentana()
            }}
          >
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
                <X size={21} />
              </button>

              <div className="section-title">
                <span>CUENTA TRÁMITESV</span>
                <h2 id="auth-title">
                  {modoRegistro ? 'Crear una cuenta' : 'Bienvenido de nuevo'}
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
                      placeholder="Tu nombre completo"
                    />
                  </label>
                )}

                <label>
                  Correo electrónico
                  <span className="input-icon">
                    <Mail size={17} />
                    <input
                      type="email"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                      maxLength={150}
                      autoComplete="email"
                      placeholder="correo@ejemplo.com"
                    />
                  </span>
                </label>

                <label>
                  Contraseña
                  <span className="input-icon">
                    <LockKeyhole size={17} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      maxLength={72}
                      autoComplete={
                        modoRegistro ? 'new-password' : 'current-password'
                      }
                      placeholder="Tu contraseña"
                    />
                  </span>
                </label>

                {!modoRegistro && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setModoRecuperacion('solicitar');
                      setMensaje('');
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}

                {mensaje && (
                  <p className="auth-message" role="alert">
                    {mensaje}
                  </p>
                )}

                <button
                  className="primary-button"
                  type="submit"
                  disabled={cargando}
                >
                  {cargando
                    ? 'Procesando...'
                    : modoRegistro
                      ? 'Crear cuenta'
                      : 'Iniciar sesión'}
                  {!cargando && <ChevronRight size={18} />}
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setModoRegistro(!modoRegistro)
                    setMensaje('')
                  }}
                >
                  {modoRegistro
                    ? 'Ya tengo una cuenta'
                    : 'Crear una cuenta nueva'}
                </button>
              </form>
            </section>
          </div>
        )}

        {/* FORMULARIO DE DOCUMENTOS */}
        {mostrarDocumento && usuario && (
          <div
            className="auth-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setMostrarDocumento(false)
            }}
          >
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
                <X size={21} />
              </button>

              <div className="section-title">
                <span>GESTIÓN DE DOCUMENTOS</span>
                <h2 id="documento-title">
                  {documentoEditando
                    ? 'Editar documento'
                    : 'Registrar documento'}
                </h2>
                <p>Completa los datos para controlar su vencimiento.</p>
              </div>

              <div
                className={`document-form-preview document-form-preview--${claseDocumento(tipoDocumento)}`}
              >
                <div className="document-form-preview__top">
                  <div className="document-form-preview__brand">
                    <IconoDocumento tipo={tipoDocumento} />
                    <span>TRÁMITES SV</span>
                  </div>
                  <span className="document-form-preview__label">
                    VISTA PREVIA
                  </span>
                </div>

                <div className="document-form-preview__main">
                  <span className="document-form-preview__caption">
                    DOCUMENTO REGISTRADO
                  </span>
                  <h3>{tipoDocumento.toUpperCase()}</h3>
                  <div className="document-form-preview__date">
                    {tipoDocumento === 'Tarjeta de crédito'
                      ? mesVencimientoTarjeta && anioVencimientoTarjeta
                        ? `${mesVencimientoTarjeta}/${anioVencimientoTarjeta}`
                        : 'MM / AAAA'
                      : fechaVencimiento
                        ? new Date(
                            `${fechaVencimiento}T12:00:00`,
                          ).toLocaleDateString('es-SV', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : 'DD / MM / AAAA'}
                  </div>
                </div>

                <div className="document-form-preview__bottom">
                  <div>
                    <span>FECHA DE VENCIMIENTO</span>
                    <strong>
                      {tipoDocumento === 'Tarjeta de crédito'
                        ? mesVencimientoTarjeta && anioVencimientoTarjeta
                          ? `${mesVencimientoTarjeta}/${anioVencimientoTarjeta}`
                          : 'Pendiente de fecha'
                        : fechaVencimiento
                          ? new Date(
                              `${fechaVencimiento}T12:00:00`,
                            ).toLocaleDateString('es-SV', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'Pendiente de fecha'}
                    </strong>
                  </div>
                  <div>
                    <span>RECORDATORIO</span>
                    <strong>{diasAnticipacion} días antes</strong>
                  </div>
                </div>
              </div>

              <style>{`
                .document-form-preview {
                  width: 100%;
                  margin: 0 0 24px;
                  padding: 22px;
                  border: 1px solid #c9def9;
                  border-radius: 18px;
                  background: #eaf3ff;
                  color: #1769d2;
                  box-sizing: border-box;
                  transition: background .2s ease, border-color .2s ease;
                }

                .document-form-preview__top,
                .document-form-preview__brand {
                  display: flex;
                  align-items: center;
                }

                .document-form-preview__top {
                  justify-content: space-between;
                  gap: 12px;
                }

                .document-form-preview__brand {
                  gap: 9px;
                  font-size: 12px;
                  font-weight: 800;
                  letter-spacing: 1px;
                }

                .document-form-preview__label,
                .document-form-preview__caption,
                .document-form-preview__bottom span {
                  font-size: 9px;
                  font-weight: 800;
                  letter-spacing: .8px;
                  opacity: .7;
                }

                .document-form-preview__main {
                  margin: 25px 0 22px;
                }

                .document-form-preview__main h3 {
                  margin: 7px 0 12px;
                  color: inherit;
                  font-size: 17px;
                }

                .document-form-preview__date {
                  font-size: clamp(23px, 5vw, 31px);
                  font-weight: 800;
                  letter-spacing: 1.5px;
                  font-variant-numeric: tabular-nums;
                }

                .document-form-preview__bottom {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 14px;
                  padding-top: 16px;
                  border-top: 1px solid rgba(30, 75, 120, .18);
                }

                .document-form-preview__bottom div {
                  display: flex;
                  flex-direction: column;
                  gap: 6px;
                  min-width: 0;
                }

                .document-form-preview__bottom strong {
                  color: inherit;
                  font-size: 12px;
                  line-height: 1.5;
                  overflow-wrap: anywhere;
                }

                .document-form-preview--dui {
                  color: #1769d2;
                  background: #eaf3ff;
                  border-color: #c9def9;
                }

                .document-form-preview--pasaporte {
                  color: #7952b8;
                  background: #f2edfc;
                  border-color: #ded2f5;
                }

                .document-form-preview--licencia {
                  color: #16836c;
                  background: #e9f7f2;
                  border-color: #c8eadf;
                }

                .document-form-preview--circulacion {
                  color: #b47716;
                  background: #fff5e5;
                  border-color: #f3dfbd;
                }
                  .document-form-preview--credito {
                  color: #7541a8;
                  background: #f4edff;
                  border-color: #ddcafa;
                }

                .document-form-select {
                  display: block;
                  width: 100%;
                  min-height: 54px;
                  margin-top: 9px;
                  padding: 0 48px 0 16px;
                  border: 1.5px solid #c9d9ef;
                  border-radius: 13px;
                  background-color: #ffffff;
                  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%232168ce' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
                  background-repeat: no-repeat;
                  background-position: right 16px center;
                  background-size: 19px;
                  color: #1d3155;
                  font: inherit;
                  font-size: 16px;
                  font-weight: 600;
                  line-height: 1.4;
                  appearance: none;
                  -webkit-appearance: none;
                  cursor: pointer;
                  transition: border-color .2s ease, box-shadow .2s ease, background-color .2s ease;
                }

                .document-form-select:hover {
                  border-color: #8db7ee;
                  background-color: #fbfdff;
                }

                .document-form-select:focus {
                  outline: none;
                  border-color: #2168ce;
                  box-shadow: 0 0 0 4px rgba(33, 104, 206, .13);
                }

                .document-form-select option {
                  color: #1d3155;
                  background: #ffffff;
                  font-weight: 500;
                }

                @media (max-width: 480px) {
                  .document-form-select {
                    min-height: 50px;
                    font-size: 15px;
                  }

                  .document-form-preview {
                    padding: 17px;
                  }

                  .document-form-preview__bottom {
                    grid-template-columns: 1fr;
                  }
                }
              `}</style>

              <form className="auth-form" onSubmit={registrarDocumento}>
                <label>
                  Tipo de documento
                  <select
                    className="document-form-select"
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                  >
                    <option value="DUI">DUI</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="Licencia de conducir">
                      Licencia de conducir
                    </option>
                    <option value="Tarjeta de circulación">
                      Tarjeta de circulación
                    </option>
                    <option value="Tarjeta de crédito">
                      Tarjeta de crédito
                    </option>
                  </select>
                </label>

                {tipoDocumento === 'Tarjeta de crédito' ? (
  <>
    <label>
      Mes de vencimiento
      <select
        className="document-form-select"
        value={mesVencimientoTarjeta}
        onChange={(e) => setMesVencimientoTarjeta(e.target.value)}
        required
      >
        <option value="">Selecciona el mes</option>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
          <option key={mes} value={String(mes).padStart(2, '0')}>
            {String(mes).padStart(2, '0')}
          </option>
        ))}
      </select>
    </label>

    <label>
      Año de vencimiento
      <select
        className="document-form-select"
        value={anioVencimientoTarjeta}
        onChange={(e) => setAnioVencimientoTarjeta(e.target.value)}
        required
      >
        <option value="">Selecciona el año</option>
        {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map((anio) => (
          <option key={anio} value={String(anio)}>
            {anio}
          </option>
        ))}
      </select>
    </label>
  </>
) : (
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
)}

{tipoDocumento === 'Tarjeta de crédito' && (
  <>
    <label>
      Día de corte mensual
      <select
        className="document-form-select"
        value={diaCorte}
        onChange={(e) => setDiaCorte(Number(e.target.value))}
        required
      >
        {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
          <option key={dia} value={dia}>
            Día {dia}
          </option>
        ))}
      </select>
    </label>

    <label>
      Día de pago mensual
      <select
        className="document-form-select"
        value={diaPago}
        onChange={(e) => setDiaPago(Number(e.target.value))}
        required
      >
        {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
          <option key={dia} value={dia}>
            Día {dia}
          </option>
        ))}
      </select>
    </label>
  </>
)}


                <label>
                  Avisarme con anticipación
                  <select
                    className="document-form-select"
                    value={diasAnticipacion}
                    onChange={(e) =>
                      setDiasAnticipacion(Number(e.target.value))
                    }
                  >
                    <option value={7}>7 días antes</option>
                    <option value={14}>14 días antes</option>
                    <option value={21}>21 días antes</option>
                    <option value={30}>30 días antes</option>
                  </select>
                </label>

                {mensaje && <p role="alert">{mensaje}</p>}

                <button className="primary-button" type="submit">
                  <CheckCircle2 size={18} />
                  {documentoEditando ? 'Guardar cambios' : 'Guardar documento'}
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

        {/* CENTROS DE ATENCIÓN */}
        <CentrosAtencion />
        <RequisitosTramites />


        {/* SITIOS OFICIALES */}
        <section className="official-sites" id="sitios-oficiales">
          <div className="official-sites__heading">
            <span>ENLACES DE CONFIANZA</span>
            <h2>Sitios oficiales</h2>
            <p>
              Accede directamente a las plataformas oficiales para consultar
              y realizar trámites relacionados con tus documentos.
            </p>
          </div>

          <div className="official-sites__grid">
            <article className="official-site-card official-site-card--dui">
              <div className="official-site-card__icon">
                <CreditCard size={25} />
              </div>
              <div className="official-site-card__content">
                <span>IDENTIFICACIÓN</span>
                <h3>DUI</h3>
                <p>Consulta los servicios y trámites relacionados con tu Documento Único de Identidad.</p>
              </div>
              <a href="https://dui.sv/inicio/" target="_blank" rel="noopener noreferrer" className="official-site-card__link">
                Ir al sitio oficial <ExternalLink size={16} />
              </a>
            </article>

            <article className="official-site-card official-site-card--pasaporte">
              <div className="official-site-card__icon">
                <FileText size={25} />
              </div>
              <div className="official-site-card__content">
                <span>IDENTIFICACIÓN INTERNACIONAL</span>
                <h3>Pasaporte</h3>
                <p>Accede al portal de inicio de sesión del Gobierno de El Salvador.</p>
              </div>
              <a href="https://login.gob.sv/login" target="_blank" rel="noopener noreferrer" className="official-site-card__link">
                Ir al sitio oficial <ExternalLink size={16} />
              </a>
            </article>

            <article className="official-site-card official-site-card--licencia">
              <div className="official-site-card__icon">
                <CarFront size={25} />
              </div>
              <div className="official-site-card__content">
                <span>TRANSPORTE</span>
                <h3>Licencia de conducir</h3>
                <p>Portal de SERTRACEN para la refrenda de la licencia de conducir.</p>
              </div>
              <a href="https://portal.sertracen.com.sv/refrenda_licencia/" target="_blank" rel="noopener noreferrer" className="official-site-card__link">
                Ir al sitio oficial <ExternalLink size={16} />
              </a>
            </article>

            <article className="official-site-card official-site-card--circulacion">
              <div className="official-site-card__icon">
                <CarFront size={25} />
              </div>
              <div className="official-site-card__content">
                <span>TRANSPORTE</span>
                <h3>Tarjeta de circulación</h3>
                <p>Consulta el cálculo de refrenda de tu tarjeta de circulación.</p>
              </div>
              <a href="https://www.sertracen.com.sv/index.php/calculo-de-refrenda" target="_blank" rel="noopener noreferrer" className="official-site-card__link">
                Ir al sitio oficial <ExternalLink size={16} />
              </a>
            </article>
          </div>

          <p className="official-sites__note">
            TrámiteSV facilita el acceso a estos enlaces, pero no pertenece
            a las instituciones responsables de los trámites.
          </p>
        </section>

        <GuiaTramites />

        <style>{`
          .official-sites {
            width: min(1120px, calc(100% - 40px));
            margin: 64px auto;
          }

          .official-sites__heading {
            max-width: 680px;
            margin: 0 auto 28px;
            text-align: center;
          }

          .official-sites__heading > span {
            color: #2168ce;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 1.4px;
          }

          .official-sites__heading h2 {
            margin: 9px 0;
            color: #1d3155;
            font-size: clamp(26px, 4vw, 34px);
          }

          .official-sites__heading p {
            margin: 0;
            color: #71819c;
            line-height: 1.7;
          }

          .official-sites__grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

          .official-site-card {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            min-width: 0;
            padding: 23px;
            border: 1px solid #e3eaf4;
            border-radius: 18px;
            background: #fff;
            box-shadow: 0 8px 24px rgba(29, 49, 85, .06);
            transition: transform .2s ease, box-shadow .2s ease;
          }

          .official-site-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 13px 30px rgba(29, 49, 85, .10);
          }

          .official-site-card__icon {
            display: grid;
            width: 48px;
            height: 48px;
            margin-bottom: 16px;
            place-items: center;
            border-radius: 14px;
            background: var(--site-soft);
            color: var(--site-color);
          }

          .official-site-card__content > span {
            color: var(--site-color);
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1px;
          }

          .official-site-card__content h3 {
            margin: 7px 0;
            color: #1d3155;
            font-size: 19px;
          }

          .official-site-card__content p {
            margin: 0 0 18px;
            color: #71819c;
            font-size: 14px;
            line-height: 1.65;
          }

          .official-site-card__link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: auto;
            color: var(--site-color);
            font-size: 14px;
            font-weight: 750;
            text-decoration: none;
          }

          .official-site-card__link:hover {
            text-decoration: underline;
            text-underline-offset: 4px;
          }

          .official-site-card--dui {
            --site-color: #2168ce;
            --site-soft: #eaf3ff;
          }

          .official-site-card--pasaporte {
            --site-color: #7952b8;
            --site-soft: #f2edfc;
          }

          .official-site-card--licencia {
            --site-color: #16836c;
            --site-soft: #e9f7f2;
          }

          .official-site-card--circulacion {
            --site-color: #b47716;
            --site-soft: #fff5e5;
          }

          .official-sites__note {
            margin: 19px 0 0;
            color: #8290a6;
            font-size: 12px;
            line-height: 1.6;
            text-align: center;
          }

          @media (max-width: 640px) {
            .official-sites {
              width: min(100% - 28px, 480px);
              margin: 46px auto;
            }

            .official-sites__grid {
              grid-template-columns: 1fr;
            }

            .official-site-card {
              padding: 20px;
            }
          }
        `}</style>

        {/* CARACTERÍSTICAS */}
        <section className="features" id="beneficios">
          <div className="feature">
            <span>
              <BellRing size={31} />
            </span>
            <h3>Recordatorios automáticos</h3>
            <p>
              Recibe avisos 7, 14, 21 o 30 días antes del vencimiento.
            </p>
          </div>

          <div className="feature">
            <span>
              <FileText size={31} />
            </span>
            <h3>Información de trámites</h3>
            <p>
              Consulta información para preparar la renovación de tus
              documentos.
            </p>
          </div>

          <div className="feature">
            <span>
              <MapPin size={31} />
            </span>
            <h3>Centros de atención</h3>
            <p>
              Encuentra sedes de atención en las zonas de El Salvador.
            </p>
          </div>

          <div className="feature">
            <span>
              <Sparkles size={31} />
            </span>
            <h3>Organización sencilla</h3>
            <p>
              Mantén tus documentos y fechas importantes en un solo lugar.
            </p>
          </div>
        </section>
      </main>

      {/* PIE DE PÁGINA */}
      <footer>
        <div>
          <strong>
            <ShieldCheck size={20} />
            TrámiteSV
          </strong>
          <p>
            Asistente de documentos y vencimientos en El Salvador.
          </p>
        </div>

        <p>© 2026 TrámiteSV. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default App
