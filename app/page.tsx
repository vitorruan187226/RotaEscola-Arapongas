'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Bus,
  ShieldCheck,
  MapPin,
  QrCode,
  FileText,
  WifiOff,
  ArrowRight,
  Users,
  BarChart3,
  Smartphone,
  CheckCircle,
  Menu,
  X,
  Phone,
  Mail,
  Building2,
  ChevronRight,
  Star,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Dados de conteúdo ──────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Vantagens', href: '#vantagens' },
  { label: 'Recursos', href: '#recursos' },
  { label: 'Suporte', href: '#suporte' },
];

const STATS = [
  { value: '6.000', label: 'Alunos atendidos', icon: Users },
  { value: '102', label: 'Veículos na frota', icon: Bus },
  { value: '38', label: 'Rotas ativas', icon: MapPin },
  { value: '100%', label: 'Documentos digitais', icon: FileText },
];

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
      { icon: WifiOff, texto: 'Funciona offline em áreas rurais e assentamentos' },
    ],
  },
];

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
    icon: WifiOff,
    titulo: 'Modo Offline',
    descricao: 'Funciona mesmo sem internet. Essencial para assentamentos, sítios e zona rural de Arapongas.',
    tag: 'Inovação',
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

// ─── Componente principal ────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="lp-root">

      {/* ══════════════════════════════════════════
          HEADER / NAVBAR
      ══════════════════════════════════════════ */}
      <header className="lp-header">
        <div className="lp-header-inner">

          {/* Logo */}
          <Link href="/" className="lp-logo" id="lp-logo-link">
            <div className="lp-logo-icon">
              <Bus size={22} />
            </div>
            <div className="lp-logo-text">
              <span className="lp-logo-name">RotaEscola</span>
              <span className="lp-logo-city">Arapongas · PR</span>
            </div>
          </Link>

          {/* Nav Links — desktop */}
          <nav className="lp-nav-links" aria-label="Navegação principal">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="lp-nav-link">
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Botão — desktop */}
          <div className="lp-header-cta">
            <Button asChild variant="yellow" size="sm" id="btn-header-acessar">
              <Link href="/login">
                Acessar Sistema
                <ChevronRight size={16} />
              </Link>
            </Button>
          </div>

          {/* Hambúrguer — mobile */}
          <button
            id="btn-mobile-menu"
            className="lp-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu de navegação"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menu mobile expandido */}
        {menuOpen && (
          <div className="lp-mobile-menu" role="navigation" aria-label="Menu mobile">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="lp-mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
                <ChevronRight size={16} />
              </a>
            ))}
            <div className="lp-mobile-cta">
              <Button asChild variant="yellow" className="w-full justify-center" id="btn-mobile-acessar">
                <Link href="/login">Acessar Sistema</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main>

        {/* ══════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════ */}
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
                Conectando <strong>6.000 alunos</strong>, <strong>102 veículos</strong> e a{' '}
                Secretaria de Educação em uma única plataforma inteligente.
              </p>

              <div className="lp-hero-ctas">
                <Button asChild variant="yellow" size="lg" id="btn-hero-responsavel">
                  <Link href="/login">
                    Sou Responsável
                    <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button asChild variant="navy" size="lg" id="btn-hero-motorista">
                  <Link href="/login">
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
                        <span className="lp-mockup-stat-val">102</span>
                        <span className="lp-mockup-stat-lbl">Veículos</span>
                      </div>
                    </div>
                    <div className="lp-mockup-stat lp-mockup-stat--yellow">
                      <Users size={18} />
                      <div>
                        <span className="lp-mockup-stat-val">6.000</span>
                        <span className="lp-mockup-stat-lbl">Alunos</span>
                      </div>
                    </div>
                  </div>

                  {/* Linha de rota */}
                  <div className="lp-mockup-route-item">
                    <div className="lp-mockup-route-dot lp-mockup-route-dot--green" />
                    <div className="lp-mockup-route-info">
                      <span className="lp-mockup-route-name">Rota 07 — Norte</span>
                      <span className="lp-mockup-route-status">Em trânsito · 12 alunos</span>
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
                <WifiOff size={14} />
                <span>Funciona Offline</span>
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

        {/* ══════════════════════════════════════════
            VANTAGENS — TRÊS PILARES
        ══════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════
            RECURSOS — CARDS MODERNOS
        ══════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════
            CTA FINAL — RECADASTRO ANUAL
        ══════════════════════════════════════════ */}
        <section className="lp-cta-banner" aria-labelledby="cta-heading">
          <div className="lp-cta-banner-inner">
            <div className="lp-cta-badge">
              <Zap size={14} />
              <span>Recadastro Anual 2025 — Aberto</span>
            </div>
            <h2 id="cta-heading" className="lp-cta-title">
              Renove a matrícula do seu filho no transporte escolar
            </h2>
            <p className="lp-cta-desc">
              O recadastro anual é obrigatório para garantir a vaga no ônibus escolar. Agora você pode fazer tudo{' '}
              <strong>100% digital</strong>, sem sair de casa, pelo celular ou computador.
            </p>
            <div className="lp-cta-actions">
              <Button asChild variant="yellow" size="lg" id="btn-cta-recadastro">
                <Link href="/login">
                  Fazer Recadastro Agora
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild variant="white-outline" size="lg" id="btn-cta-saibamais">
                <Link href="#suporte">
                  Tirar Dúvidas
                </Link>
              </Button>
            </div>
            <p className="lp-cta-hint">
              Prazo: até 31 de julho de 2025 · Documentos exigidos: RG, CPF e comprovante de matrícula
            </p>
          </div>
          {/* Decoração */}
          <div className="lp-cta-deco lp-cta-deco--1" aria-hidden="true" />
          <div className="lp-cta-deco lp-cta-deco--2" aria-hidden="true" />
        </section>

        {/* ══════════════════════════════════════════
            SUPORTE
        ══════════════════════════════════════════ */}
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
                <a href="mailto:transporte.educacao@arapongas.pr.gov.br" className="lp-suporte-link" id="link-email">
                  transporte.educacao@<br />arapongas.pr.gov.br
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
      </main>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-footer-logo">
              <Bus size={20} />
              <span>RotaEscola Arapongas</span>
            </div>
            <p>Sistema de Gestão Integrada do Transporte Escolar Municipal — Prefeitura de Arapongas, Paraná.</p>
          </div>
          <div className="lp-footer-links-col">
            <h4>Navegação</h4>
            <ul>
              {NAV_LINKS.map((l) => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
              <li><Link href="/login">Acessar Sistema</Link></li>
            </ul>
          </div>
          <div className="lp-footer-links-col">
            <h4>Perfis</h4>
            <ul>
              <li><Link href="/login">Sou Responsável</Link></li>
              <li><Link href="/login">Sou da Secretaria</Link></li>
              <li><Link href="/login">Sou Motorista</Link></li>
            </ul>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p>© {new Date().getFullYear()} RotaEscola Arapongas · Secretaria Municipal de Educação</p>
          <p>Desenvolvido para o município de Arapongas — Paraná, Brasil.</p>
        </div>
      </footer>

      {/* ══════════════════════════════════════════
          ESTILOS ESPECÍFICOS DA LANDING PAGE
      ══════════════════════════════════════════ */}
      <style>{`

        /* ── Root ── */
        .lp-root {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #F8FAFC;
          font-family: var(--font-inter), system-ui, sans-serif;
        }

        /* ── Header ── */
        .lp-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background-color: rgba(15, 23, 42, 0.97);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .lp-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 68px;
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .lp-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .lp-logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #FBBF24, #F59E0B);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0F172A;
          flex-shrink: 0;
        }
        .lp-logo-text { display: flex; flex-direction: column; }
        .lp-logo-name {
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          letter-spacing: -0.3px;
        }
        .lp-logo-city {
          font-size: 0.7rem;
          color: #FBBF24;
          font-weight: 500;
        }

        .lp-nav-links {
          display: none;
          align-items: center;
          gap: 4px;
          flex: 1;
        }
        @media (min-width: 768px) {
          .lp-nav-links { display: flex; }
        }
        .lp-nav-link {
          color: rgba(255,255,255,0.75);
          font-size: 0.9rem;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: 8px;
          text-decoration: none;
          transition: color 0.2s, background 0.2s;
        }
        .lp-nav-link:hover {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }

        .lp-header-cta { display: none; margin-left: auto; }
        @media (min-width: 768px) { .lp-header-cta { display: block; } }

        .lp-hamburger {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: auto;
          color: #fff;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .lp-hamburger:hover { background: rgba(255,255,255,0.1); }
        @media (min-width: 768px) { .lp-hamburger { display: none; } }

        .lp-mobile-menu {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 16px 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          background-color: rgba(15, 23, 42, 0.99);
          animation: fadeIn 0.2s ease;
        }
        .lp-mobile-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: rgba(255,255,255,0.80);
          font-size: 1rem;
          font-weight: 500;
          padding: 12px 8px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s, color 0.2s;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .lp-mobile-link:last-of-type { border-bottom: none; }
        .lp-mobile-link:hover { background: rgba(255,255,255,0.07); color: #fff; }
        .lp-mobile-cta { margin-top: 12px; }

        /* ── Hero ── */
        .lp-hero {
          position: relative;
          overflow: hidden;
          background: linear-gradient(160deg, #0F172A 0%, #162140 55%, #1a2a52 100%);
          padding: 80px 24px 0;
        }
        .lp-hero-bg-circle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .lp-hero-bg-circle--1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%);
          top: -100px; right: -150px;
        }
        .lp-hero-bg-circle--2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);
          bottom: 0; left: -100px;
        }

        .lp-hero-inner {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          align-items: center;
          padding-bottom: 64px;
        }
        @media (min-width: 900px) {
          .lp-hero-inner {
            grid-template-columns: 1.1fr 0.9fr;
            gap: 64px;
          }
        }

        .lp-hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 24px;
        }
        @media (max-width: 899px) {
          .lp-hero-content { align-items: center; text-align: center; }
        }

        .lp-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(251,191,36,0.15);
          color: #FBBF24;
          border: 1px solid rgba(251,191,36,0.3);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .lp-hero-title {
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          letter-spacing: -0.5px;
        }
        .lp-hero-highlight {
          color: #FBBF24;
          position: relative;
        }
        .lp-hero-subtitle {
          font-size: clamp(1rem, 2vw, 1.15rem);
          color: rgba(255,255,255,0.75);
          line-height: 1.7;
          max-width: 520px;
        }

        .lp-hero-ctas {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }
        @media (max-width: 479px) {
          .lp-hero-ctas { flex-direction: column; width: 100%; }
          .lp-hero-ctas a { justify-content: center; }
        }

        .lp-hero-trust {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.5);
        }
        .lp-trust-star { color: #FBBF24; }

        /* ── Mockup Visual ── */
        .lp-hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .lp-mockup-card {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          width: 100%;
          max-width: 380px;
          overflow: hidden;
          box-shadow: 0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
        }

        .lp-mockup-topbar {
          background: rgba(0,0,0,0.25);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .lp-mockup-topbar-dots {
          display: flex;
          gap: 6px;
        }
        .lp-mockup-topbar-dots span {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: block;
        }
        .lp-mockup-topbar-dots span:first-child { background: #ef4444; }
        .lp-mockup-topbar-dots span:nth-child(2) { background: #FBBF24; }
        .lp-mockup-topbar-dots span:last-child { background: #22c55e; }
        .lp-mockup-topbar-title {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.6);
          font-weight: 500;
        }

        .lp-mockup-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

        .lp-mockup-stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .lp-mockup-stat {
          border-radius: 12px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lp-mockup-stat--primary {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }
        .lp-mockup-stat--yellow {
          background: rgba(251,191,36,0.15);
          color: #FBBF24;
        }
        .lp-mockup-stat-val {
          display: block;
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          line-height: 1;
        }
        .lp-mockup-stat-lbl {
          display: block;
          font-size: 0.68rem;
          color: rgba(255,255,255,0.5);
          margin-top: 2px;
        }

        .lp-mockup-route-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .lp-mockup-route-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          animation: pulseSoft 2s infinite;
        }
        .lp-mockup-route-dot--green  { background: #22c55e; }
        .lp-mockup-route-dot--yellow { background: #FBBF24; }
        .lp-mockup-route-dot--blue   { background: #60a5fa; }

        .lp-mockup-route-info { flex: 1; }
        .lp-mockup-route-name {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #fff;
        }
        .lp-mockup-route-status {
          display: block;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.5);
          margin-top: 2px;
        }
        .lp-mockup-route-badge       { font-size: 0.7rem; color: #22c55e; }
        .lp-mockup-route-badge--yellow { color: #FBBF24; }
        .lp-mockup-route-badge--blue   { color: #60a5fa; }

        .lp-mockup-qr-section {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px;
          background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05));
          border: 1px solid rgba(251,191,36,0.25);
          border-radius: 12px;
        }
        .lp-mockup-qr-icon { color: #FBBF24; flex-shrink: 0; }
        .lp-mockup-qr-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #fff;
        }
        .lp-mockup-qr-sub {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.5);
          margin-top: 2px;
        }

        /* Float badges */
        .lp-float-badge {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          color: #0F172A;
          font-size: 0.73rem;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
          white-space: nowrap;
        }
        .lp-float-badge--tl { top: -12px; left: -16px; }
        .lp-float-badge--br { bottom: -12px; right: -16px; color: #065f46; }
        @media (max-width: 899px) {
          .lp-float-badge { display: none; }
        }

        /* ── Stats Bar ── */
        .lp-stats-bar {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0;
          border-top: 1px solid rgba(255,255,255,0.10);
          margin-top: 0;
        }
        @media (min-width: 640px) {
          .lp-stats-bar { grid-template-columns: repeat(4, 1fr); }
        }
        .lp-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 24px 16px;
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .lp-stat-item:last-child { border-right: none; }
        .lp-stat-icon { color: #FBBF24; }
        .lp-stat-value {
          font-size: 1.6rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }
        .lp-stat-label {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.55);
          text-align: center;
        }

        /* ── Seções Genéricas ── */
        .lp-section-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .lp-section-header {
          text-align: center;
          max-width: 620px;
          margin: 0 auto 56px;
        }
        .lp-section-eyebrow {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #FBBF24;
          margin-bottom: 10px;
        }
        .lp-section-title {
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 800;
          color: #0F172A;
          line-height: 1.2;
          margin-bottom: 14px;
          letter-spacing: -0.3px;
        }
        .lp-section-desc {
          color: #64748B;
          font-size: 1rem;
          line-height: 1.7;
        }

        /* ── Pilares ── */
        .lp-pilares {
          padding: 96px 24px;
          background: #fff;
        }
        .lp-pilares-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .lp-pilares-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .lp-pilar-card {
          border-radius: 16px;
          padding: 32px;
          border: 1px solid transparent;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .lp-pilar-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.10);
        }

        .pillar-navy {
          background: linear-gradient(135deg, #0F172A 0%, #1e3a70 100%);
          color: #fff;
        }
        .pillar-yellow {
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
          border-color: rgba(251,191,36,0.30) !important;
        }
        .pillar-slate {
          background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%);
          border-color: #CBD5E1 !important;
        }

        .lp-pilar-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 24px;
        }
        .lp-pilar-emoji {
          font-size: 2.4rem;
          line-height: 1;
          flex-shrink: 0;
        }
        .lp-pilar-titulo {
          font-size: 1.15rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 4px;
        }
        .pillar-navy .lp-pilar-titulo { color: #fff; }
        .pillar-yellow .lp-pilar-titulo { color: #78350F; }
        .pillar-slate .lp-pilar-titulo { color: #0F172A; }

        .lp-pilar-subtitulo {
          font-size: 0.82rem;
          font-weight: 500;
          line-height: 1.4;
        }
        .pillar-navy .lp-pilar-subtitulo { color: rgba(255,255,255,0.65); }
        .pillar-yellow .lp-pilar-subtitulo { color: #92400E; }
        .pillar-slate .lp-pilar-subtitulo { color: #475569; }

        .lp-pilar-lista {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .lp-pilar-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .pillar-navy .lp-pilar-item { color: rgba(255,255,255,0.85); }
        .pillar-yellow .lp-pilar-item { color: #78350F; }
        .pillar-slate .lp-pilar-item { color: #334155; }

        .lp-pilar-item-icon { flex-shrink: 0; margin-top: 2px; }
        .pillar-navy .lp-pilar-item-icon { color: #FBBF24; }
        .pillar-yellow .lp-pilar-item-icon { color: #D97706; }
        .pillar-slate .lp-pilar-item-icon { color: #0F172A; }

        /* ── Recursos ── */
        .lp-recursos {
          padding: 96px 24px;
          background: #F8FAFC;
        }
        .lp-recursos-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 640px) {
          .lp-recursos-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .lp-recursos-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .lp-recurso-card {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-radius: 16px;
        }
        .lp-recurso-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .lp-recurso-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: rgba(15,23,42,0.07);
          color: #0F172A;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .lp-recurso-tag {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .tag-yellow { background: #FEF3C7; color: #92400E; }
        .tag-green  { background: #dcfce7; color: #166534; }
        .tag-blue   { background: #dbeafe; color: #1d4ed8; }
        .tag-purple { background: #f3e8ff; color: #6b21a8; }

        .lp-recurso-titulo {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0F172A;
        }
        .lp-recurso-desc {
          font-size: 0.875rem;
          color: #64748B;
          line-height: 1.6;
          flex: 1;
        }
        .lp-recurso-footer { margin-top: 4px; }
        .lp-recurso-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #0F172A;
          text-decoration: none;
          transition: gap 0.2s;
        }
        .lp-recurso-link:hover { gap: 10px; }

        /* ── CTA Banner ── */
        .lp-cta-banner {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #0F172A 0%, #162350 60%, #0f1f40 100%);
          padding: 96px 24px;
          border-top: 4px solid #FBBF24;
        }
        .lp-cta-banner-inner {
          position: relative;
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .lp-cta-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(251,191,36,0.18);
          color: #FBBF24;
          border: 1px solid rgba(251,191,36,0.3);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .lp-cta-title {
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
          letter-spacing: -0.3px;
        }
        .lp-cta-desc {
          font-size: 1rem;
          color: rgba(255,255,255,0.75);
          line-height: 1.7;
          max-width: 560px;
        }
        .lp-cta-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }
        @media (max-width: 479px) {
          .lp-cta-actions { flex-direction: column; width: 100%; }
          .lp-cta-actions a { justify-content: center; }
        }
        .lp-cta-hint {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.45);
        }

        /* Decorações CTA */
        .lp-cta-deco {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .lp-cta-deco--1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%);
          top: -150px; right: -100px;
        }
        .lp-cta-deco--2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);
          bottom: -80px; left: -60px;
        }

        /* ── Suporte ── */
        .lp-suporte {
          padding: 96px 24px;
          background: #fff;
        }
        .lp-suporte-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          max-width: 900px;
          margin: 0 auto;
        }
        @media (min-width: 640px) {
          .lp-suporte-cards { grid-template-columns: repeat(3, 1fr); }
        }
        .lp-suporte-card {
          text-align: center;
          padding: 36px 24px;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .lp-suporte-card:hover {
          box-shadow: 0 8px 32px rgba(15,23,42,0.08);
          transform: translateY(-3px);
        }
        .lp-suporte-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: rgba(15,23,42,0.07);
          color: #0F172A;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .lp-suporte-card h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #0F172A;
        }
        .lp-suporte-card p {
          font-size: 0.82rem;
          color: #64748B;
        }
        .lp-suporte-link {
          font-size: 0.875rem;
          font-weight: 600;
          color: #0F172A;
          text-decoration: none;
          line-height: 1.5;
          word-break: break-all;
        }
        a.lp-suporte-link:hover { color: #FBBF24; }

        /* ── Footer ── */
        .lp-footer {
          background: #080f20;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 56px;
        }
        .lp-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 40px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        @media (min-width: 768px) {
          .lp-footer-inner { grid-template-columns: 2fr 1fr 1fr; }
        }
        .lp-footer-brand { display: flex; flex-direction: column; gap: 14px; }
        .lp-footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
        }
        .lp-footer-logo svg { color: #FBBF24; }
        .lp-footer-brand p {
          font-size: 0.83rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
          max-width: 300px;
        }
        .lp-footer-links-col h4 {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.4);
          margin-bottom: 16px;
        }
        .lp-footer-links-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .lp-footer-links-col ul a {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          transition: color 0.2s;
        }
        .lp-footer-links-col ul a:hover { color: #FBBF24; }
        .lp-footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 24px calc(20px + var(--safe-area-bottom));
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
          text-align: center;
        }
        .lp-footer-bottom p {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.3);
        }

        /* ── shadcn Button — variante white-outline (CTA banner) ── */
        [data-variant="white-outline"],
        .btn-variant-white-outline {
          border: 2px solid rgba(255,255,255,0.70);
          color: #fff;
          background: transparent;
        }
      `}</style>
    </div>
  );
}
