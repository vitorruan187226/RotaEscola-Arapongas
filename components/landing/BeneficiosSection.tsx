import {
  BarChart3,
  Zap,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Smartphone,
  Users,
  QrCode
} from 'lucide-react';

const PILARES = [
  {
    id: 'secretaria',
    emoji: '🏛️',
    titulo: 'Para a Secretaria',
    subtitulo: 'Controle total com dados em tempo real',
    cor: 'pillar-navy',
    itens: [
      { icon: BarChart3, texto: 'Auditoria com GPS e relatórios automáticos' },
      { icon: Zap, texto: 'Economia de recursos com processos 100% digitais' },
      { icon: BarChart3, texto: 'Dados em tempo real para tomada de decisão' },
      { icon: ShieldCheck, texto: 'Conformidade com a legislação do transporte escolar' },
    ],
  },
  {
    id: 'pais',
    emoji: '👨‍👩‍👧',
    titulo: 'Para os Pais',
    subtitulo: 'Tranquilidade e praticidade no dia a dia',
    cor: 'pillar-yellow',
    itens: [
      { icon: CheckCircle, texto: 'Fim das filas presenciais na Secretaria' },
      { icon: MapPin, texto: 'Acompanhamento do trajeto em tempo real' },
      { icon: ShieldCheck, texto: 'Segurança total para o seu filho' },
      { icon: Smartphone, texto: 'Recadastro anual 100% pelo celular' },
    ],
  },
  {
    id: 'motoristas',
    emoji: '🚌',
    titulo: 'Para os Motoristas',
    subtitulo: 'Eficiência operacional em campo',
    cor: 'pillar-slate',
    itens: [
      { icon: Users, texto: 'Lista de passageiros digital e atualizada' },
      { icon: QrCode, texto: 'Controle de embarque por QR Code' },
      { icon: Smartphone, texto: 'Comunicação direta com a SEMED' },
      { icon: ShieldCheck, texto: 'Sincronização instantânea de presenças' },
    ],
  },
];

export function BeneficiosSection() {
  return (
    <section className="lp-pilares" id="vantagens" aria-labelledby="vantagens-heading">
      <div className="lp-section-inner">
        <div className="lp-section-header">
          <p className="lp-section-eyebrow">Por que o RotaEscola?</p>
          <h2 id="vantagens-heading" className="lp-section-title">
            Uma plataforma, três perfis de usuário
          </h2>
          <p className="lp-section-desc">
            Cada ator do transporte escolar tem sua área personalizada e ferramentas exclusivas.
          </p>
        </div>

        <div className="lp-pilares-grid">
          {PILARES.map((pilar) => (
            <div key={pilar.id} className={`lp-pilar-card ${pilar.cor}`}>
              <div className="lp-pilar-header">
                <span className="lp-pilar-emoji" role="img" aria-label={pilar.titulo}>
                  {pilar.emoji}
                </span>
                <div>
                  <h3 className="lp-pilar-titulo">{pilar.titulo}</h3>
                  <p className="lp-pilar-subtitulo">{pilar.subtitulo}</p>
                </div>
              </div>
              <ul className="lp-pilar-lista">
                {pilar.itens.map(({ icon: Icon, texto }) => (
                  <li key={texto} className="lp-pilar-item">
                    <Icon size={16} className="lp-pilar-item-icon" />
                    <span>{texto}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
