import Link from 'next/link';
import { ArrowRight, QrCode, MapPin, CalendarX, FileText } from 'lucide-react';

const RECURSOS = [
  {
    icon: QrCode,
    titulo: 'Carteirinha Digital',
    descricao: 'Identificação instantânea dos alunos por QR Code. Sem papel, sem filas, sem fraudes.',
    tag: 'Exclusivo',
    tagColor: 'tag-yellow',
  },
  {
    icon: MapPin,
    titulo: 'Rastreamento em Tempo Real',
    descricao: 'Pais acompanham a localização do ônibus escolar ao vivo. Alertas de embarque e chegada.',
    tag: 'Novo',
    tagColor: 'tag-green',
  },
  {
    icon: CalendarX,
    titulo: 'Controle de Ausências',
    descricao: 'Notifique a ausência do aluno diretamente pelo aplicativo. O motorista é avisado em tempo real e otimiza a rota de Arapongas.',
    tag: 'Praticidade',
    tagColor: 'tag-blue',
  },
  {
    icon: FileText,
    titulo: 'Gestão de Documentos',
    descricao: 'Envio, validação e arquivamento de documentos escolares diretamente pelo app.',
    tag: 'Integrado',
    tagColor: 'tag-purple',
  },
];

export function RecursosSection() {
  return (
    <section className="lp-recursos" id="recursos" aria-labelledby="recursos-heading">
      <div className="lp-section-inner">
        <div className="lp-section-header">
          <p className="lp-section-eyebrow">Funcionalidades</p>
          <h2 id="recursos-heading" className="lp-section-title">
            Recursos que fazem a diferença
          </h2>
          <p className="lp-section-desc">
            Tecnologia de ponta adaptada à realidade do município de Arapongas e sua zona rural.
          </p>
        </div>

        <div className="lp-recursos-grid">
          {RECURSOS.map((recurso) => (
            <div key={recurso.titulo} className="lp-recurso-card card-premium">
              <div className="lp-recurso-top">
                <div className="lp-recurso-icon-box">
                  <recurso.icon size={26} />
                </div>
                <span className={`lp-recurso-tag ${recurso.tagColor}`}>{recurso.tag}</span>
              </div>
              <h3 className="lp-recurso-titulo">{recurso.titulo}</h3>
              <p className="lp-recurso-desc">{recurso.descricao}</p>
              <div className="lp-recurso-footer">
                <Link href="/login" className="lp-recurso-link" id={`link-recurso-${recurso.titulo.toLowerCase().replace(/ /g, '-')}`}>
                  Saiba mais <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
