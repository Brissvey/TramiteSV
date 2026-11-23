import React from 'react';
import type { Documento } from '../types/documento';
import { calcularInfoVencimiento } from '../utils/estadoDocumento';

interface DocumentoCardProps {
  documento: Documento;
  onEditar: (doc: Documento) => void;
  onSolicitarEliminar: (doc: Documento) => void;
}

function obtenerConfigVisual(tipo: string) {
  const normalizado = tipo.toLowerCase();
  if (normalizado.includes('dui')) {
    return {
      claseCard: 'tsv-doc-card--dui',
      icono: '🪪',
      etiqueta: 'Identidad Nacional',
    };
  }
  if (normalizado.includes('pasaporte')) {
    return {
      claseCard: 'tsv-doc-card--pasaporte',
      icono: '🛂',
      etiqueta: 'Documento de Viaje',
    };
  }
  if (normalizado.includes('licencia')) {
    return {
      claseCard: 'tsv-doc-card--licencia',
      icono: '🚗',
      etiqueta: 'Conducción Vehicular',
    };
  }
  return {
    claseCard: 'tsv-doc-card--tarjeta',
    icono: '📋',
    etiqueta: 'Registro Vehicular',
  };
}

export const DocumentoCard: React.FC<DocumentoCardProps> = ({
  documento,
  onEditar,
  onSolicitarEliminar,
}) => {
  const info = calcularInfoVencimiento(
    documento.fecha_vencimiento,
    documento.dias_anticipacion
  );
  const visual = obtenerConfigVisual(documento.tipo);

  const claseBadge =
    info.estado === 'Vencido'
      ? 'tsv-badge--vencido'
      : info.estado === 'Próximo a vencer'
      ? 'tsv-badge--proximo'
      : 'tsv-badge--vigente';

  return (
    <article className={`tsv-doc-card ${visual.claseCard}`}>
      <div>
        <div className="tsv-card-top">
          <div className="tsv-doc-identity">
            <span className="tsv-doc-icon" aria-hidden="true">
              {visual.icono}
            </span>
            <div>
              <h3 className="tsv-doc-title">{documento.tipo}</h3>
              <span className="tsv-doc-subtitle">{visual.etiqueta}</span>
            </div>
          </div>
          <span className={`tsv-badge ${claseBadge}`}>{info.estado}</span>
        </div>

        <div className="tsv-card-body" style={{ marginTop: '0.9rem' }}>
          <div className="tsv-card-row">
            <span>Vencimiento:</span>
            <strong>{info.fechaFormateada}</strong>
          </div>
          <div className="tsv-card-row">
            <span>Tiempo restante:</span>
            <strong>{info.textoDias}</strong>
          </div>
          <div className="tsv-card-row">
            <span>Recordatorio:</span>
            <strong>{documento.dias_anticipacion} días antes</strong>
          </div>
        </div>
      </div>

      <div className="tsv-card-actions">
        <button
          type="button"
          className="tsv-btn-edit"
          onClick={() => onEditar(documento)}
        >
          Editar
        </button>
        <button
          type="button"
          className="tsv-btn-delete"
          onClick={() => onSolicitarEliminar(documento)}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
};