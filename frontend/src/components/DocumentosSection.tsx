import React, { useEffect, useState } from 'react';
import { documentosService } from '../services/documentosService';
import type { Documento, DocumentoPayload } from '../types/documento';
import { ConfirmarEliminarModal } from './ConfirmarEliminarModal';
import { DocumentoCard } from './DocumentoCard';
import { DocumentoFormCard } from './DocumentoFormCard';
import './DocumentosSection.css';

interface DocumentosSectionProps {
  onDocumentosChange?: (documentos: Documento[]) => void;
}

export const DocumentosSection: React.FC<DocumentosSectionProps> = ({
  onDocumentosChange,
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
          : 'Error al cargar tus documentos.'
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDocumentos();
  }, []);

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

  return (
    <section className="tsv-docs-section" aria-label="Mis documentos">
      <div className="tsv-docs-header">
        <h2>Mis Documentos Registrados</h2>
        {!mostrarFormulario && (
          <button
            type="button"
            className="tsv-btn-primary"
            onClick={handleAbrirNuevo}
          >
            + Nuevo documento
          </button>
        )}
      </div>

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
        <p>Aún no tienes documentos registrados. Agrega tu primer documento.</p>
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