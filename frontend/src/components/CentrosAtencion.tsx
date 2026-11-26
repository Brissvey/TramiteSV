
import { useMemo, useState } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  Search,
  Building2,
  ShieldCheck,
  AlertCircle,
  Car,
  CreditCard,
  FileText,
  ChevronRight,
} from 'lucide-react';

import datosCentros from '../data/centros.json';

type Region = 'Oriente' | 'Central' | 'Occidente';

type Tramite =
  | 'DUI'
  | 'Pasaporte'
  | 'Licencia'
  | 'Tarjeta de circulación';

type CodigoTramite =
  | 'dui'
  | 'pasaporte'
  | 'licencia'
  | 'tarjeta_circulacion';

interface Centro {
  id: string;
  nombre: string;
  institucion: string;
  tramites: CodigoTramite[];
  region: Region;
  departamento: string | null;
  direccion: string | null;
  telefono: string | null;
  horario: string | null;
  verificado_oficial: boolean;
  fuentes: string[];
  notas: string | null;
}

const centros: Centro[] = datosCentros.centros as Centro[];

const regiones: Region[] = ['Oriente', 'Central', 'Occidente'];

const nombresTramites: Record<CodigoTramite, Tramite> = {
  dui: 'DUI',
  pasaporte: 'Pasaporte',
  licencia: 'Licencia',
  tarjeta_circulacion: 'Tarjeta de circulación',
};

const iconos: Record<Tramite, typeof CreditCard> = {
  DUI: CreditCard,
  Pasaporte: FileText,
  Licencia: Car,
  'Tarjeta de circulación': FileText,
};

const tramitesDisponibles: Tramite[] = [
  'DUI',
  'Pasaporte',
  'Licencia',
  'Tarjeta de circulación',
];

export default function CentrosAtencion() {
  const [region, setRegion] = useState<Region>('Oriente');
  const [tramite, setTramite] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  const centrosFiltrados = useMemo(() => {
    return centros.filter((centro) => {
      const coincideRegion = centro.region === region;

      const tramitesCentro = centro.tramites.map(
        (codigo) => nombresTramites[codigo]
      );

      const coincideTramite =
        tramite === 'Todos' || tramitesCentro.includes(tramite as Tramite);

      const texto = [
        centro.nombre,
        centro.institucion,
        centro.departamento ?? '',
        centro.direccion ?? '',
      ]
        .join(' ')
        .toLowerCase();

      const coincideBusqueda = texto.includes(busqueda.toLowerCase());

      return coincideRegion && coincideTramite && coincideBusqueda;
    });
  }, [region, tramite, busqueda]);

  const totalRegion = centros.filter(
    (centro) => centro.region === region
  ).length;

  return (
    <section className="centros-section" id="centros-atencion">
      <div className="centros-container">
        <div className="centros-heading">
          <span className="centros-eyebrow">
            <Building2 size={16} /> TRÁMITES EN EL SALVADOR
          </span>

          <h2>Centros de atención</h2>

          <p>
            Encuentra las instituciones y sedes donde puedes realizar tus
            trámites, según tu ubicación.
          </p>
        </div>

        <div className="centros-region-grid">
          {regiones.map((r) => {
            const cantidad = centros.filter(
              (centro) => centro.region === r
            ).length;

            return (
              <button
                key={r}
                className={`centro-region-card ${region === r ? 'active' : ''}`}
                onClick={() => setRegion(r)}
              >
                <span className="region-icon">
                  <MapPin size={21} />
                </span>

                <span className="region-info">
                  <strong>Zona {r}</strong>
                  <small>{cantidad} centros disponibles</small>
                </span>

                <ChevronRight size={19} />
              </button>
            );
          })}
        </div>

        <div className="centros-list-header">
          <div>
            <h3>Centros de la zona {region}</h3>
            <span>{totalRegion} sedes registradas</span>
          </div>
        </div>

        <div className="centros-filters">
          <div className="centros-search">
            <Search size={19} />

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por sede o departamento..."
            />
          </div>

          <select
            value={tramite}
            onChange={(e) => setTramite(e.target.value)}
            aria-label="Filtrar por trámite"
          >
            <option value="Todos">Todos los trámites</option>

            {tramitesDisponibles.map((nombre) => (
              <option key={nombre} value={nombre}>
                {nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="centros-grid">
          {centrosFiltrados.map((centro) => {
            const tramitesCentro = centro.tramites.map(
              (codigo) => nombresTramites[codigo]
            );

            return (
              <article className="centro-card" key={centro.id}>
                <div className="centro-card-top">
                  <span className="centro-institucion">
                    <Building2 size={15} />
                    {centro.institucion}
                  </span>

                  {centro.verificado_oficial ? (
                    <span className="centro-status verified">
                      <ShieldCheck size={14} />
                      Verificado oficialmente
                    </span>
                  ) : (
                    <span className="centro-status pending">
                      <AlertCircle size={14} />
                      Por confirmar
                    </span>
                  )}
                </div>

                <h3>{centro.nombre}</h3>

                <span className="centro-departamento">
                  {centro.departamento ?? 'Departamento no especificado'},
                  {' '}Zona {centro.region}
                </span>

                <div className="centro-detail">
                  <MapPin size={17} />
                  <span>
                    {centro.direccion ?? 'Dirección pendiente de confirmación'}
                  </span>
                </div>

                {centro.telefono && (
                  <div className="centro-detail">
                    <Phone size={16} />
                    <span>{centro.telefono}</span>
                  </div>
                )}

                {centro.horario && (
                  <div className="centro-detail">
                    <Clock size={16} />
                    <span>{centro.horario}</span>
                  </div>
                )}

                {centro.notas && (
                  <div className="centro-detail">
                    <AlertCircle size={16} />
                    <span>{centro.notas}</span>
                  </div>
                )}

                <div className="centro-tags">
                  {tramitesCentro.map((nombre) => {
                    const Icon = iconos[nombre];

                    return (
                      <span key={nombre}>
                        <Icon size={14} />
                        {nombre}
                      </span>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        {centrosFiltrados.length === 0 && (
          <div className="centros-empty">
            <Search size={32} />
            <h3>No encontramos centros</h3>
            <p>Prueba con otro nombre o tipo de trámite.</p>
          </div>
        )}

        <div className="centros-notice">
          <AlertCircle size={19} />
          <p>
            <strong>Importante:</strong> los datos proceden del registro de
            centros del proyecto. El estado de cada sede indica si cuenta
            con verificación oficial. Cuando un dato no está disponible,
            se muestra como pendiente de confirmación. Verifica la
            información antes de visitar una sede.
          </p>
        </div>
      </div>

      <style>{`
        .centros-section {
          padding: 65px 24px;
          background: #f4f8fc;
          color: #17324d;
        }

        .centros-container {
          max-width: 1180px;
          margin: auto;
        }

        .centros-heading {
          text-align: center;
          margin-bottom: 35px;
        }

        .centros-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #0879b9;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.1px;
        }

        .centros-heading h2 {
          font-size: clamp(28px, 4vw, 38px);
          margin: 13px 0 10px;
          color: #12365a;
        }

        .centros-heading p {
          color: #6b7d90;
          max-width: 580px;
          margin: auto;
          line-height: 1.7;
        }

        .centros-region-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 45px;
        }

        .centro-region-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px;
          border: 1px solid #e1eaf3;
          border-radius: 15px;
          background: white;
          color: #23415e;
          cursor: pointer;
          text-align: left;
          transition: .2s ease;
        }

        .centro-region-card:hover,
        .centro-region-card.active {
          border-color: #1687c7;
          background: #edf7ff;
          box-shadow: 0 5px 18px #1479b514;
        }

        .region-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          background: #e1f2ff;
          color: #0879b9;
          border-radius: 12px;
        }

        .region-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
        }

        .region-info strong {
          font-size: 16px;
        }

        .region-info small {
          color: #77899b;
          font-size: 12px;
        }

        .centros-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .centros-list-header h3 {
          color: #153957;
          font-size: 22px;
          margin: 0 0 5px;
        }

        .centros-list-header span {
          color: #7b8da0;
          font-size: 13px;
        }

        .centros-filters {
          display: flex;
          gap: 13px;
          margin-bottom: 22px;
        }

        .centros-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          border: 1px solid #dce6ef;
          border-radius: 10px;
          padding: 0 14px;
          flex: 1;
          color: #8295a8;
          min-width: 0;
        }

        .centros-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: none;
          padding: 13px 0;
          background: transparent;
          color: #23415e;
          font-size: 14px;
        }

        .centros-filters select {
          padding: 0 14px;
          min-height: 46px;
          border: 1px solid #dce6ef;
          border-radius: 10px;
          background: white;
          color: #23415e;
          font-size: 14px;
          outline: none;
        }

        .centros-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 17px;
        }

        .centro-card {
          background: white;
          border: 1px solid #e5edf4;
          border-radius: 15px;
          padding: 21px;
          box-shadow: 0 4px 15px #183c5908;
          min-width: 0;
        }

        .centro-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .centro-institucion {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #47708f;
          font-size: 12px;
          font-weight: 700;
        }

        .centro-status {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border-radius: 20px;
          padding: 5px 8px;
          font-size: 10px;
          font-weight: 700;
        }

        .centro-status.verified {
          color: #16734c;
          background: #e9f7ef;
        }

        .centro-status.pending {
          color: #986414;
          background: #fff5df;
        }

        .centro-card h3 {
          font-size: 17px;
          color: #183c5b;
          line-height: 1.4;
          margin: 0 0 5px;
        }

        .centro-departamento {
          color: #1680ba;
          font-size: 12px;
          font-weight: 600;
        }

        .centro-detail {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 16px;
          color: #647b8e;
          font-size: 13px;
          line-height: 1.55;
        }

        .centro-detail svg {
          color: #1680ba;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .centro-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          border-top: 1px solid #edf1f5;
          padding-top: 15px;
          margin-top: 17px;
        }

        .centro-tags span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 7px;
          padding: 6px 9px;
          background: #edf6fd;
          color: #24648d;
          font-size: 11px;
          font-weight: 600;
        }

        .centros-empty {
          text-align: center;
          padding: 50px 20px;
          color: #8193a5;
          background: white;
          border-radius: 15px;
        }

        .centros-empty h3 {
          color: #24435f;
        }

        .centros-notice {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-top: 25px;
          padding: 17px;
          background: #fff8e9;
          border: 1px solid #f5e6c6;
          border-radius: 12px;
          color: #866324;
        }

        .centros-notice svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .centros-notice p {
          margin: 0;
          font-size: 13px;
          line-height: 1.65;
        }

        @media (max-width: 850px) {
          .centros-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .centros-region-grid {
            gap: 10px;
          }

          .centro-region-card {
            padding: 14px;
          }
        }

        @media (max-width: 600px) {
          .centros-section {
            padding: 45px 15px;
          }

          .centros-region-grid {
            grid-template-columns: 1fr;
          }

          .centros-filters {
            flex-direction: column;
          }

          .centros-filters select {
            min-height: 46px;
          }

          .centros-grid {
            grid-template-columns: 1fr;
          }

          .centros-list-header h3 {
            font-size: 19px;
          }
        }
      `}</style>
    </section>
  );
}
