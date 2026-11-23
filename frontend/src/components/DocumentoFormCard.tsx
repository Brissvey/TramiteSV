import React, { useEffect, useState } from 'react';
import type {
  AnticipacionDias,
  Documento,
  DocumentoPayload,
  TipoDocumento,
} from '../types/documento';

interface DocumentoFormCardProps {
  documentoEnEdicion: Documento | null;
  guardando: boolean;
  onGuardar: (payload: DocumentoPayload, id?: number) => Promise<void>;
  onCancelar: () => void;
}

const TIPOS_DOCUMENTO: TipoDocumento[] = [
  'DUI',
  'Pasaporte',
  'Licencia de conducir',
  'Tarjeta de circulación',
];

const OPCIONES_ANTICIPACION: AnticipacionDias[] = [7, 14, 21, 30];

export const DocumentoFormCard: React.FC<DocumentoFormCardProps> = ({
  documentoEnEdicion,
  guardando,
  onGuardar,
  onCancelar,
}) => {
  const [tipo, setTipo] = useState<TipoDocumento>('DUI');
  const [fechaVencimiento, setFechaVencimiento] = useState<string>('');
  const [diasAnticipacion, setDiasAnticipacion] = useState<AnticipacionDias>(7);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setError('');
    if (documentoEnEdicion) {
      const tipoValido = TIPOS_DOCUMENTO.includes(
        documentoEnEdicion.tipo as TipoDocumento
      )
        ? (documentoEnEdicion.tipo as TipoDocumento)
        : 'DUI';

      setTipo(tipoValido);
      setFechaVencimiento(documentoEnEdicion.fecha_vencimiento.split('T')[0]);

      const ant = Number(documentoEnEdicion.dias_anticipacion) as AnticipacionDias;
      setDiasAnticipacion(OPCIONES_ANTICIPACION.includes(ant) ? ant : 7);
    } else {
      setTipo('DUI');
      setFechaVencimiento('');
      setDiasAnticipacion(7);
    }
  }, [documentoEnEdicion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!TIPOS_DOCUMENTO.includes(tipo)) {
      setError('Selecciona un tipo de documento válido.');
      return;
    }

    if (!fechaVencimiento || !/^\d{4}-\d{2}-\d{2}$/.test(fechaVencimiento)) {
      setError('Ingresa una fecha de vencimiento válida.');
      return;
    }

    const fechaObj = new Date(fechaVencimiento + 'T00:00:00');
    if (Number.isNaN(fechaObj.getTime())) {
      setError('La fecha ingresada no es válida.');
      return;
    }

    if (!OPCIONES_ANTICIPACION.includes(diasAnticipacion)) {
      setError('Selecciona una anticipación válida (7, 14, 21 o 30 días).');
      return;
    }

    try {
      await onGuardar(
        {
          tipo,
          fecha_vencimiento: fechaVencimiento,
          dias_anticipacion: diasAnticipacion,
        },
        documentoEnEdicion?.id
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo guardar el documento.'
      );
    }
  };

  return (
    <form className="tsv-form-card" onSubmit={handleSubmit} noValidate>
      <h3>
        {documentoEnEdicion
          ? `Editar documento: ${documentoEnEdicion.tipo}`
          : 'Registrar nuevo documento'}
      </h3>

      <div className="tsv-form-grid">
        <div className="tsv-field">
          <label htmlFor="doc-tipo">Tipo de documento</label>
          <select
            id="doc-tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoDocumento)}
            disabled={guardando}
          >
            {TIPOS_DOCUMENTO.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="tsv-field">
          <label htmlFor="doc-fecha">Fecha de vencimiento</label>
          <input
            id="doc-fecha"
            type="date"
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
            disabled={guardando}
            required
          />
        </div>

        <div className="tsv-field">
          <label htmlFor="doc-anticipacion">Anticipación de recordatorio</label>
          <select
            id="doc-anticipacion"
            value={diasAnticipacion}
            onChange={(e) =>
              setDiasAnticipacion(Number(e.target.value) as AnticipacionDias)
            }
            disabled={guardando}
          >
            {OPCIONES_ANTICIPACION.map((dias) => (
              <option key={dias} value={dias}>
                {dias} días antes
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="tsv-form-error">{error}</div>}

      <div className="tsv-form-actions">
        <button
          type="button"
          className="tsv-btn-secondary"
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </button>
        <button type="submit" className="tsv-btn-primary" disabled={guardando}>
          {guardando
            ? 'Guardando...'
            : documentoEnEdicion
            ? 'Guardar cambios'
            : 'Registrar documento'}
        </button>
      </div>
    </form>
  );
};