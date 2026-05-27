import Link from 'next/link';
import { Bus, ShieldCheck, MapPin, QrCode, ClipboardList, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🚌</span>
          <div>
            <h1>RotaEscola</h1>
            <p>Arapongas - PR</p>
          </div>
        </div>
        <div className="nav-actions">
          <Link href="/login" className="btn-secondary">
            Acessar o Painel
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content animate-slide-up">
          <div className="hero-badge">
            <ShieldCheck size={16} />
            <span>Transporte Público Escolar Seguro</span>
          </div>
          <h1>RotaEscola Arapongas — Segurança e Tecnologia no Transporte Escolar</h1>
          <p>
            Uma plataforma moderna para conectar pais, motoristas e a Secretaria de Educação.
            Acompanhe rotas, valide carteirinhas por QR Code e envie documentos de forma 100% digital.
          </p>
          <div className="hero-ctas">
            <Link href="/login" className="btn-yellow">
              Área do Responsável
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn-outline">
              Login da Secretaria
            </Link>
          </div>
        </div>
        <div className="hero-visual animate-fade-in">
          <div className="bus-art-card">
            <span className="art-emoji">🚌</span>
            <div className="art-line" />
            <div className="art-row">
              <span className="art-badge">6K Alunos</span>
              <span className="art-badge">100% Monitorado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Recursos e Facilidades do Sistema</h2>
          <p>Tecnologia pensada para garantir o conforto e a segurança diária dos alunos municipais.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card card-premium">
            <div className="icon-wrapper">
              <MapPin size={24} />
            </div>
            <h3>Rastreamento em Tempo Real</h3>
            <p>Monitore os horários aproximados e as rotas dos ônibus em tempo real para planejar o embarque do seu filho.</p>
          </div>

          <div className="feature-card card-premium">
            <div className="icon-wrapper">
              <QrCode size={24} />
            </div>
            <h3>Carteirinha Digital</h3>
            <p>Validação de embarque por QR Code instantâneo. Mais controle para os motoristas e tranquilidade para os pais.</p>
          </div>

          <div className="feature-card card-premium">
            <div className="icon-wrapper">
              <ClipboardList size={24} />
            </div>
            <h3>Gestão Inteligente</h3>
            <p>Painel simplificado para a Secretaria de Educação gerenciar rotas, motoristas, frotas e matrículas com agilidade.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Pronto para cadastrar seu filho ou gerenciar o transporte?</h2>
          <p>Seja você um pai de aluno ou servidor da rede municipal de Arapongas, clique abaixo para acessar sua área exclusiva.</p>
          <div className="cta-buttons">
            <Link href="/login" className="btn-yellow">
              Acessar Área do Responsável
            </Link>
            <Link href="/login" className="btn-white-outline">
              Login da Secretaria
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Secretaria Municipal de Educação</h3>
            <p>Prefeitura de Arapongas — Paraná</p>
          </div>
          <div className="footer-links">
            <p>Apoio ao Responsável: <strong>(43) 3902-1112</strong></p>
            <p>E-mail: <strong>transporte.educacao@arapongas.pr.gov.br</strong></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} RotaEscola Arapongas. Todos os direitos reservados à Secretaria de Educação.</p>
        </div>
      </footer>
    </div>
  );
}
