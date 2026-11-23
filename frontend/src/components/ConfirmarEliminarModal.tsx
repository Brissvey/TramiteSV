import React from 'react';
import type { Documento } from '../types/documento';

interface ConfirmarEliminarModalProps {
  documento: Documento | null;
  eliminando: boolean;
  onConfirmar: () => Promise<void>;
  onCancelar: () => void;
}

export const ConfirmarEliminarModal: React.FC<ConfirmarEliminarModalProps> = ({
  documento,
  eliminando,
  onConfirmar,
  onCancelar,
}) => {
  if (!documento) return null;

  return (
    <div className="tsv-modal-backdrop" role="dialog" aria-modal="true">
      <div className="tsv-modal-box">
        <h4>¿Estás seguro de eliminar este documento?</h4>
        <p>
          Vas a eliminar <strong>{documento.tipo}</strong> con vencimiento el{' '}
          <strong>{documento.fecha_vencimiento.split('T')[0]}</strong>. Esta
          acción no se puede deshacer.
        </p>

        <div className="tsv-form-actions">
          <button
            type="button"
            className="tsv-btn-secondary"
            onClick={onCancelar}
            disabled={eliminando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="tsv-btn-danger"
            onClick={onConfirmar}
            disabled={eliminando}
          >
            {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};