import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  ArrowRight,
  Star,
  Bus,
  Users,
  QrCode,
  CalendarX,
  MapPin,
  FileText
} from 'lucide-react';

const STATS = [
  { value: 'Seguro', label: 'Validação por QR Code', icon: QrCode },
  { value: 'Ao Vivo', label: 'Rastreamento de rotas', icon: MapPin },
  { value: 'Ausências', label: 'Aviso prévio de faltas', icon: CalendarX },
  { value: '100%', label: 'Processo digital', icon: FileText },
];

export function HeroSection() {
  return (
    <section className="lp-hero" id="hero" aria-labelledby="hero-heading">
      {/* Decoração de fundo */}
      <div className="lp-hero-bg-circle lp-hero-bg-circle--1" aria-hidden="true" />
      <div className="lp-hero-bg-circle lp-hero-bg-circle--2" aria-hidden="true" />

      <div className="lp-hero-inner">
        {/* Coluna de texto */}
        <div className="lp-hero-content animate-slide-up">
          <div className="lp-hero-badge">
            <ShieldCheck size={14} />
            <span>Sistema Oficial da Prefeitura de Arapongas</span>
          </div>

          <h1 id="hero-heading" className="lp-hero-title">
            Tecnologia e Segurança no Transporte Escolar de{' '}
            <span className="lp-hero-highlight">Arapongas</span>
          </h1>

          <p className="lp-hero-subtitle">
            Conectando alunos, veículos escolares e a Secretaria de Educação de Arapongas em uma única plataforma inteligente e segura.
          </p>

          <div className="lp-hero-ctas">
            <Button asChild variant="yellow" size="lg" id="btn-hero-responsavel">
              <Link href="/login">
                Sou Responsável
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild variant="navy" size="lg" id="btn-hero-motorista">
              <Link href="/login?role=motorista">
                Primeiro Acesso (Motorista)
              </Link>
            </Button>
          </div>

          <div className="lp-hero-trust">
            <Star size={14} className="lp-trust-star" />
            <span>Utilizado pela Secretaria Municipal de Educação</span>
          </div>
        </div>

        {/* Coluna visual — mockup do app */}
        <div className="lp-hero-visual animate-fade-in" aria-hidden="true">
          <div className="lp-mockup-card">
            {/* Barra superior do mockup */}
            <div className="lp-mockup-topbar">
              <div className="lp-mockup-topbar-dots">
                <span /><span /><span />
              </div>
              <span className="lp-mockup-topbar-title">RotaEscola · Painel</span>
            </div>

            {/* Status cards dentro do mockup */}
            <div className="lp-mockup-body">
              <div className="lp-mockup-stat-row">
                <div className="lp-mockup-stat lp-mockup-stat--primary">
                  <Bus size={18} />
                  <div>
                    <span className="lp-mockup-stat-val">Rotas</span>
                    <span className="lp-mockup-stat-lbl">Monitoradas</span>
                  </div>
                </div>
                <div className="lp-mockup-stat lp-mockup-stat--yellow">
                  <Users size={18} />
                  <div>
                    <span className="lp-mockup-stat-val">Alunos</span>
                    <span className="lp-mockup-stat-lbl">Identificados</span>
                  </div>
                </div>
              </div>

              {/* Linha de rota */}
              <div className="lp-mockup-route-item">
                <div className="lp-mockup-route-dot lp-mockup-route-dot--green" />
                <div className="lp-mockup-route-info">
                  <span className="lp-mockup-route-name">Rota 07 — Norte</span>
                  <span className="lp-mockup-route-status">Em trânsito</span>
                </div>
                <span className="lp-mockup-route-badge">●</span>
              </div>
              <div className="lp-mockup-route-item">
                <div className="lp-mockup-route-dot lp-mockup-route-dot--yellow" />
                <div className="lp-mockup-route-info">
                  <span className="lp-mockup-route-name">Rota 14 — Zona Rural</span>
                  <span className="lp-mockup-route-status">Partindo em 5 min</span>
                </div>
                <span className="lp-mockup-route-badge lp-mockup-route-badge--yellow">●</span>
              </div>
              <div className="lp-mockup-route-item">
                <div className="lp-mockup-route-dot lp-mockup-route-dot--blue" />
                <div className="lp-mockup-route-info">
                  <span className="lp-mockup-route-name">Rota 22 — Centro</span>
                  <span className="lp-mockup-route-status">Concluído</span>
                </div>
                <span className="lp-mockup-route-badge lp-mockup-route-badge--blue">●</span>
              </div>

              {/* QR Code simulado */}
              <div className="lp-mockup-qr-section">
                <QrCode size={40} className="lp-mockup-qr-icon" />
                <div>
                  <p className="lp-mockup-qr-title">Carteirinha Digital</p>
                  <p className="lp-mockup-qr-sub">Toque para validar embarque</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="lp-float-badge lp-float-badge--tl">
            <ShieldCheck size={14} />
            <span>100% Seguro</span>
          </div>
          <div className="lp-float-badge lp-float-badge--br">
            <CalendarX size={14} />
            <span>Aviso de Ausência</span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="lp-stats-bar">
        {STATS.map(({ value, label, icon: Icon }) => (
          <div key={label} className="lp-stat-item">
            <Icon size={20} className="lp-stat-icon" />
            <span className="lp-stat-value">{value}</span>
            <span className="lp-stat-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
