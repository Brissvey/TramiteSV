import { useEffect, useState, type FormEvent } from 'react';
import escudoSv from './assets/escudo-sv.png';
import './App.css';
import Calendario from './components/Calendario';
import Dashboard from './components/Dashboard';
import { DocumentosSection } from './components/DocumentosSection';
import type { Documento } from './types/documento';

const API = 'http://localhost:3003';

type Usuario = {
  id: number;
  nombre: string;
  correo: string;
};

function EscudoMarcaAgua({ className }: { className?: string }) {
  return (
    <img
      src={escudoSv}
      alt=""
      aria-hidden="true"
      className={`tsv-watermark-escudo ${className ?? ''}`}
    />
  );
}

function IconoRecordatorios() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <path
        d="M28 16a8 8 0 0 1 16 0c6.5 2.5 10 8.5 10 16v9l4 5H14l4-5v-9c0-7.5 3.5-13.5 10-16Z"
        fill="#38BDF8"
        stroke="#0F172A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M31 52a5 5 0 0 0 10 0"
        stroke="#0F172A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect
        x="38"
        y="38"
        width="22"
        height="20"
        rx="4"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth="2.4"
      />
      <path d="M38 44h22" stroke="#0F172A" strokeWidth="2.2" />
      <rect x="42" y="47" width="4" height="4" rx="1" fill="#0077B6" />
      <rect x="48" y="47" width="4" height="4" rx="1" fill="#38B000" />
      <rect x="54" y="47" width="3" height="4" rx="1" fill="#FACC15" />
      <rect x="42" y="52" width="4" height="3" rx="1" fill="#EF4444" />
    </svg>
  );
}

function IconoRequisitos() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <rect
        x="28"
        y="14"
        width="26"
        height="38"
        rx="4"
        fill="#E0F2FE"
        stroke="#0F172A"
        strokeWidth="2.5"
      />
      <path
        d="M34 25h14M34 32h14M34 39h10"
        stroke="#0F172A"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <rect
        x="16"
        y="20"
        width="26"
        height="38"
        rx="4"
        fill="#38BDF8"
        stroke="#0F172A"
        strokeWidth="2.5"
      />
      <rect
        x="23"
        y="14"
        width="12"
        height="8"
        rx="2.5"
        fill="#FACC15"
        stroke="#0F172A"
        strokeWidth="2.3"
      />
      <path
        d="M21 31l2.5 2.5L28 29M31 32h7M21 40l2.5 2.5L28 38M31 41h7M21 49l2.5 2.5L28 47M31 50h6"
        stroke="#0F172A"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconoCentros() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <path d="M12 54h48" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      <rect
        x="18"
        y="34"
        width="22"
        height="20"
        rx="2"
        fill="#BAE6FD"
        stroke="#0F172A"
        strokeWidth="2.4"
      />
      <path
        d="M16 34l13-7 13 7"
        fill="#0284C7"
        stroke="#0F172A"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M23 40v14M29 40v14M35 40v14" stroke="#0F172A" strokeWidth="2.2" />
      <path
        d="M49 14c-6.1 0-11 4.8-11 10.8 0 8.2 11 19.2 11 19.2s11-11 11-19.2C60 18.8 55.1 14 49 14Z"
        fill="#EF4444"
        stroke="#0F172A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="49" cy="24.5" r="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.2" />
    </svg>
  );
}

function IconoEnlacesOficiales() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle cx="27" cy="36" r="15" fill="#E0F2FE" stroke="#0F172A" strokeWidth="2.5" />
      <path d="M17 31h20v5H17z" fill="#0284C7" />
      <path d="M17 36h20v4H17z" fill="#FFFFFF" />
      <path d="M17 40h20v4H17z" fill="#0284C7" />
      <polygon
        points="27,25 32,45 22,45"
        fill="#38B000"
        stroke="#0F172A"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="27" cy="36" r="3" fill="#FACC15" />
      <path
        d="M41 32l5-5a7.5 7.5 0 0 1 10.6 10.6l-5 5"
        stroke="#0F172A"
        strokeWidth="7.5"
        strokeLinecap="round"
      />
      <path
        d="M41 32l5-5a7.5 7.5 0 0 1 10.6 10.6l-5 5"
        stroke="#0088CC"
        strokeWidth="3.8"
        strokeLinecap="round"
      />
      <path
        d="M36 40l-5 5a7.5 7.5 0 0 0 10.6 10.6l5-5"
        stroke="#0F172A"
        strokeWidth="7.5"
        strokeLinecap="round"
      />
      <path
        d="M36 40l-5 5a7.5 7.5 0 0 0 10.6 10.6l5-5"
        stroke="#38BDF8"
        strokeWidth="3.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function App() {
  const [estadoBackend, setEstadoBackend] = useState('Conectando...');
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [abrirFormularioTrigger, setAbrirFormularioTrigger] = useState(0);
  const [mostrarSeccionDocumentos, setMostrarSeccionDocumentos] = useState(false);

  useEffect(() => {
    fetch(API)
      .then((res) => res.text())
      .then((texto) => setEstadoBackend(texto || 'Conectado...'))
      .catch(() => setEstadoBackend('Conectado...'));

    const tokenGuardado = localStorage.getItem('tramitesv_token');
    const usuarioGuardado = localStorage.getItem('tramitesv_usuario');
    if (tokenGuardado && usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
        setMostrarSeccionDocumentos(true);
      } catch {
        localStorage.removeItem('tramitesv_usuario');
      }
    }
  }, []);

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    try {
      const endpoint = modoRegistro ? `${API}/auth/register` : `${API}/auth/login`;
      const body = modoRegistro
        ? { nombre, correo, password }
        : { correo, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error de autenticación');
      }

      const token = data.access_token || data.token;
      const userData: Usuario = data.usuario ||
        data.user || {
          id: data.id ?? 0,
          nombre: nombre || correo,
          correo,
        };

      if (token) {
        localStorage.setItem('tramitesv_token', token);
      }
      localStorage.setItem('tramitesv_usuario', JSON.stringify(userData));
      setUsuario(userData);
      setMostrarAuth(false);
      setMostrarSeccionDocumentos(true);
      setPassword('');
      setMensaje(modoRegistro ? 'Cuenta creada con éxito.' : 'Sesión iniciada.');
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'Error al autenticar');
    } finally {
      setCargando(false);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('tramitesv_token');
    localStorage.removeItem('tramitesv_usuario');
    setUsuario(null);
    setDocumentos([]);
    setMostrarSeccionDocumentos(false);
    setMensaje('Sesión cerrada.');
  };

  const handleAgregarDesdeHero = () => {
    setMostrarSeccionDocumentos(true);
    setAbrirFormularioTrigger((prev) => prev + 1);
    setTimeout(() => {
      const seccion = document.getElementById('mis-documentos');
      seccion?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleVerDocumentosDesdeHero = () => {
    setMostrarSeccionDocumentos(true);
    setTimeout(() => {
      const seccion = document.getElementById('mis-documentos');
      seccion?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const tieneWorkspaceActivo =
    (mostrarAuth && !usuario) ||
    Boolean(usuario) ||
    mostrarSeccionDocumentos ||
    documentos.length > 0;

  return (
    <div className="tsv-page">
      <div className="tsv-hero-wrapper">
        <EscudoMarcaAgua className="tsv-watermark-escudo--hero" />

        <header className="tsv-navbar">
          <a href="#inicio" className="tsv-brand">
            <span className="tsv-brand-icon" aria-hidden="true">
              📄
            </span>
            <span>Trámite SV</span>
          </a>

          <nav className="tsv-nav-links" aria-label="Navegación principal">
            <a href="#inicio">Inicio</a>
            <a href="#mis-documentos" onClick={handleVerDocumentosDesdeHero}>
              Mis documentos
            </a>
            <a href="#tramites">Trámites</a>
          </nav>

          <div className="tsv-nav-actions">
            {usuario ? (
              <>
                <span className="tsv-user-pill">{usuario.nombre}</span>
                <button
                  type="button"
                  className="tsv-btn-logout"
                  onClick={handleCerrarSesion}
                >
                  Salir
                </button>
              </>
            ) : (
              <button
                type="button"
                className="tsv-btn-login"
                onClick={() => {
                  setModoRegistro(false);
                  setMostrarAuth((prev) => !prev);
                }}
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </header>

        <section id="inicio" className="tsv-hero">
          <div className="tsv-hero-left">
            <div className="tsv-status-badge">
              <span className="tsv-status-dot" aria-hidden="true" />
              <span>Estado del sistema: {estadoBackend}</span>
            </div>

            <h1 className="tsv-hero-title">
              Nunca olvides renovar tus documentos.
            </h1>

            <p className="tsv-hero-subtitle">
              TrámiteSV te ayuda a controlar el vencimiento de los documentos y te
              proporciona información para renovarlos a tiempo.
            </p>

            <div className="tsv-hero-cta-row">
              <button
                type="button"
                className="tsv-btn-cta-primary"
                onClick={handleAgregarDesdeHero}
              >
                <span aria-hidden="true">📄</span>
                <span>Agregar documento</span>
              </button>

              <a
                href="#mis-documentos"
                className="tsv-btn-cta-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  handleVerDocumentosDesdeHero();
                }}
              >
                <span aria-hidden="true">🗂️</span>
                <span>Ver mis documentos</span>
              </a>
            </div>
          </div>

          <aside className="tsv-hero-right" aria-label="Próximos vencimientos">
            <div className="tsv-upcoming-card">
              <div className="tsv-upcoming-icon" aria-hidden="true">
                📅
              </div>
              <h2>Próximos vencimientos</h2>
              {documentos.length === 0 ? (
                <p>Aún no tienes documentos registrados.</p>
              ) : (
                <p>
                  Tienes <strong>{documentos.length}</strong>{' '}
                  {documentos.length === 1
                    ? 'documento registrado.'
                    : 'documentos registrados.'}
                </p>
              )}
            </div>
          </aside>
        </section>
      </div>

      {tieneWorkspaceActivo && (
        <div className="tsv-workspace tsv-workspace--active">
          {mostrarAuth && !usuario && (
            <div className="tsv-auth-card">
              <h3>{modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h3>
              <form onSubmit={handleAuthSubmit} className="tsv-auth-form">
                {modoRegistro && (
                  <input
                    type="text"
                    placeholder="Ejemplo: usuario1"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                )}
                <input
                  type="email"
                  placeholder="Ejemplo: usuario1@correo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Ejemplo: 123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="tsv-auth-actions">
                  <button type="submit" className="tsv-btn-login" disabled={cargando}>
                    {cargando
                      ? 'Procesando...'
                      : modoRegistro
                      ? 'Registrarse'
                      : 'Entrar'}
                  </button>
                  <button
                    type="button"
                    className="tsv-link-btn"
                    onClick={() => setModoRegistro((prev) => !prev)}
                  >
                    {modoRegistro
                      ? 'Ya tengo cuenta'
                      : 'Crear una cuenta nueva'}
                  </button>
                </div>
              </form>
              {mensaje && <p className="tsv-status-msg">{mensaje}</p>}
            </div>
          )}

          {usuario && (
            <div className="tsv-dashboard-grid">
              <Dashboard
                nombre={usuario.nombre}
                documentos={documentos as never}
                onAgregarDocumento={handleAgregarDesdeHero}
                onVerCalendario={() => {
                  const cal = document.querySelector('.tsv-dashboard-grid');
                  cal?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
              <Calendario documentos={documentos as never} />
            </div>
          )}

          <div id="mis-documentos">
            <DocumentosSection
              visible={mostrarSeccionDocumentos}
              onDocumentosChange={setDocumentos}
              abrirFormularioTrigger={abrirFormularioTrigger}
            />
          </div>
        </div>
      )}

      <section id="tramites" className="tsv-features-section">
        <EscudoMarcaAgua className="tsv-watermark-escudo--left" />

        <div className="tsv-features-header">
          <span className="tsv-eyebrow">DOCUMENTOS</span>
          <h2>Administra tus documentos</h2>
          <p>Registra tus documentos y recibe recordatorios antes que venzan.</p>
        </div>

        <div className="tsv-features-grid">
          <article className="tsv-feature-item">
            <div className="tsv-feature-icon">
              <IconoRecordatorios />
            </div>
            <h3>Recordatorios automáticos</h3>
            <p>Recibe avisos 7, 15 y 30 días antes del vencimiento.</p>
          </article>

          <article className="tsv-feature-item">
            <div className="tsv-feature-icon">
              <IconoRequisitos />
            </div>
            <h3>Requisitos</h3>
            <p>Consulta los requisitos necesarios para renovar.</p>
          </article>

          <article className="tsv-feature-item">
            <div className="tsv-feature-icon">
              <IconoCentros />
            </div>
            <h3>Centros de atención</h3>
            <p>Encuentra información sobre dónde realizar el trámite.</p>
          </article>

          <article className="tsv-feature-item">
            <div className="tsv-feature-icon">
              <IconoEnlacesOficiales />
            </div>
            <h3>Enlaces oficiales</h3>
            <p>Accede a los sitios oficiales para gestionar tu cita.</p>
          </article>
        </div>

        <div className="tsv-bottom-wave" aria-hidden="true" />
      </section>

      <footer className="tsv-footer">
        <div className="tsv-footer-brand">
          <strong>Trámite SV</strong>
          <span>Asistente de documentos y vencimientos en El Salvador.</span>
        </div>
        <p className="tsv-footer-copy">© 2026 TrámiteSV</p>
      </footer>
    </div>
  );
}

export default App;