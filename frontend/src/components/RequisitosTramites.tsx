
import { FileText, CircleDollarSign, ExternalLink, ClipboardList } from "lucide-react";
import { tramites } from "../data/tramites";

export default function RequisitosTramites() {
  return (
    <section className="requisitos-section" id="requisitos-tramites">
      <div className="requisitos-heading">
        <span>INFORMACIÓN PARA TUS TRÁMITES</span>
        <h2>Requisitos y costos de renovación</h2>
        <p>
          Consulta qué necesitas, cuánto cuesta y dónde puedes renovar tus
          documentos en El Salvador.
        </p>
      </div>

      <div className="requisitos-grid">
        {tramites.map((tramite) => (
          <article
            className={`requisito-card requisito-card--${tramite.tipo === "DUI" ? "dui" : tramite.tipo === "Pasaporte" ? "pasaporte" : tramite.tipo === "Licencia de conducir" ? "licencia" : "circulacion"}`}
            key={tramite.tipo}
          >
            <div className="requisito-card__top">
              <div className="requisito-icon">
                <FileText size={25} />
              </div>
              <span className="requisito-label">RENOVACIÓN</span>
            </div>

            <h3>{tramite.nombre}</h3>

            <div className="requisito-costo">
              <CircleDollarSign size={20} />
              <div>
                <span>Costo del trámite</span>
                <strong>{tramite.costo}</strong>
              </div>
            </div>

            <div className="requisito-bloque">
              <h4>
                <ClipboardList size={17} />
                Requisitos
              </h4>
              <ul>
                {tramite.requisitos.map((requisito, index) => (
                  <li key={index}>{requisito}</li>
                ))}
              </ul>
            </div>

            <div className="requisito-bloque requisito-adicional">
              <h4>Información adicional</h4>
              <ul>
                {tramite.informacionAdicional.map((informacion, index) => (
                  <li key={index}>{informacion}</li>
                ))}
              </ul>
            </div>

            <div className="requisito-footer">
              <span>{tramite.modalidad}</span>

              {tramite.enlaceOficial && (
                <a
                  href={tramite.enlaceOficial}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sitio oficial <ExternalLink size={15} />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
