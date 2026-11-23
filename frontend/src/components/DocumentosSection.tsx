import React, { useEffect, useState } from 'react';
import { documentosService } from '../services/documentosService';
import type { Documento, DocumentoPayload } from '../types/documento';
import { ConfirmarEliminarModal } from './ConfirmarEliminarModal';
import { DocumentoCard } from './DocumentoCard';
import { DocumentoFormCard } from './DocumentoFormCard';
import './DocumentosSection.css';

interface DocumentosSectionProps {
  onDocumentosChange?: (documentos: Documento[]) => void;
  abrirFormularioTrigger?: number;
  visible?: boolean;
}

export const DocumentosSection: React.FC<DocumentosSectionProps> = ({
  onDocumentosChange,
  abrirFormularioTrigger = 0,
  visible = false,
}) => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorGeneral, setErrorGeneral] = useState<string>('');

  const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);
  const [documentoEnEdicion, setDocumentoEnEdicion] =
    useState<Documento | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  const [documentoAEliminar, setDocumentoAEliminar] =
    useState<Documento | null>(null);
  const [eliminando, setEliminando] = useState<boolean>(false);

  const cargarDocumentos = async () => {
    try {
      setCargando(true);
      setErrorGeneral('');
      const lista = await documentosService.obtenerTodos();
      setDocumentos(lista);
      onDocumentosChange?.(lista);
    } catch (err) {
      setErrorGeneral(
        err instanceof Error
          ? err.message
          : 'Error al cargar tus documentos desde la API.'
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDocumentos();
  }, []);

  useEffect(() => {
    if (abrirFormularioTrigger > 0) {
      setDocumentoEnEdicion(null);
      setMostrarFormulario(true);
    }
  }, [abrirFormularioTrigger]);

  const handleAbrirNuevo = () => {
    setDocumentoEnEdicion(null);
    setMostrarFormulario(true);
  };

  const handleAbrirEditar = (doc: Documento) => {
    setDocumentoEnEdicion(doc);
    setMostrarFormulario(true);
  };

  const handleGuardar = async (payload: DocumentoPayload, id?: number) => {
    setGuardando(true);
    setErrorGeneral('');
    try {
      if (id) {
        await documentosService.actualizar(id, payload);
      } else {
        await documentosService.crear(payload);
      }
      setMostrarFormulario(false);
      setDocumentoEnEdicion(null);
      await cargarDocumentos();
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!documentoAEliminar) return;
    setEliminando(true);
    setErrorGeneral('');
    try {
      await documentosService.eliminar(documentoAEliminar.id);
      setDocumentoAEliminar(null);
      await cargarDocumentos();
    } catch (err) {
      setErrorGeneral(
        err instanceof Error
          ? err.message
          : 'No se pudo eliminar el documento.'
      );
      setDocumentoAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  if (!visible && !mostrarFormulario && documentos.length === 0) {
    return null;
  }

  return (
    <section className="tsv-docs-section" aria-label="Mis documentos">
      <div className="tsv-docs-header">
        <div>
          <h2>JUAN – Tarjetas de documentos y formularios</h2>
          <p className="tsv-docs-subtitle-top">
            Administra DUI, Pasaporte, Licencia de conducir y Tarjeta de
            circulación con anticipación de 7, 14, 21 y 30 días.
          </p>
        </div>
        {!mostrarFormulario && (
          <button
            type="button"
            className="tsv-btn-primary"
            onClick={handleAbrirNuevo}
          >
            + Registrar documento
          </button>
        )}
      </div>

      <details className="tsv-role-spec">
        <summary>Ver alcance y tareas de JUAN (CRUD y formulario)</summary>
        <div className="tsv-role-spec-grid">
          <div>
            <strong>A. Tarjetas de documentos</strong>
            <ul>
              <li>DUI, Pasaporte, Licencia de conducir y Tarjeta de circulación.</li>
              <li>Muestra tipo, fecha de vencimiento, días restantes, estado y anticipación.</li>
            </ul>
          </div>
          <div>
            <strong>B. Formularios</strong>
            <ul>
              <li>Registrar y editar documentos con validaciones de campos.</li>
              <li>Anticipación seleccionable: 7, 14, 21 y 30 días.</li>
            </ul>
          </div>
          <div>
            <strong>C. Acciones</strong>
            <ul>
              <li>Visualizar, editar y eliminar documentos con confirmación previa.</li>
            </ul>
          </div>
          <div>
            <strong>D. Conexión con el backend</strong>
            <ul>
              <li>Conectado a la API CRUD existente con token JWT.</li>
            </ul>
          </div>
        </div>
      </details>

      {mostrarFormulario && (
        <DocumentoFormCard
          documentoEnEdicion={documentoEnEdicion}
          guardando={guardando}
          onGuardar={handleGuardar}
          onCancelar={() => {
            setMostrarFormulario(false);
            setDocumentoEnEdicion(null);
          }}
        />
      )}

      {errorGeneral && <div className="tsv-form-error">{errorGeneral}</div>}

      {cargando ? (
        <p>Cargando documentos...</p>
      ) : documentos.length === 0 ? (
        <p>
          Aún no tienes documentos registrados. Usa &ldquo;+ Registrar
          documento&rdquo; para crear el primero.
        </p>
      ) : (
        <div className="tsv-cards-grid">
          {documentos.map((doc) => (
            <DocumentoCard
              key={doc.id}
              documento={doc}
              onEditar={handleAbrirEditar}
              onSolicitarEliminar={setDocumentoAEliminar}
            />
          ))}
        </div>
      )}

      <ConfirmarEliminarModal
        documento={documentoAEliminar}
        eliminando={eliminando}
        onConfirmar={handleConfirmarEliminar}
        onCancelar={() => setDocumentoAEliminar(null)}
      />
    </section>
  );
};