import { Phone, Mail, Building2 } from 'lucide-react';

export function SuporteSection() {
  return (
    <section className="lp-suporte" id="suporte" aria-labelledby="suporte-heading">
      <div className="lp-section-inner">
        <div className="lp-section-header">
          <p className="lp-section-eyebrow">Atendimento</p>
          <h2 id="suporte-heading" className="lp-section-title">Precisa de ajuda?</h2>
          <p className="lp-section-desc">
            Nossa equipe da Secretaria Municipal de Educação está pronta para atendê-lo.
          </p>
        </div>
        <div className="lp-suporte-cards">
          <div className="lp-suporte-card">
            <div className="lp-suporte-icon">
              <Phone size={22} />
            </div>
            <h3>Telefone</h3>
            <p>Ligue para a SEMED</p>
            <a href="tel:+554339021112" className="lp-suporte-link" id="link-telefone">
              (43) 3902-1112
            </a>
          </div>
          <div className="lp-suporte-card">
            <div className="lp-suporte-icon">
              <Mail size={22} />
            </div>
            <h3>E-mail</h3>
            <p>Envie sua dúvida por e-mail</p>
            <a href="mailto:fosfosilvio@gmail.com" className="lp-suporte-link" id="link-email">
              fosfosilvio@<br />gmail.com
            </a>
          </div>
          <div className="lp-suporte-card">
            <div className="lp-suporte-icon">
              <Building2 size={22} />
            </div>
            <h3>Presencial</h3>
            <p>Secretaria Municipal de Educação</p>
            <span className="lp-suporte-link">
              Arapongas · PR<br />Seg–Sex · 08h–17h
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
