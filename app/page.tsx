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
        <div className="hero-content">
          <div className="hero-badge">
            <ShieldCheck size={16} />
            <span>Transporte Público Escolar Seguro</span>
          </div>
          <h1>RotaEscola Arapongas - Segurança e Tecnologia no Transporte Escolar</h1>
          <p>
            Uma plataforma moderna para conectar pais, motoristas e a Secretaria de Educação. Acompanhe rotas, valide carteirinhas por QR Code e envie documentos de forma 100% digital.
          </p>
          <div className="hero-ctas">
            <Link href="/login" className="btn-primary">
              Área do Responsável
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn-outline">
              Login da Secretaria
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="bus-art-card">
            <span className="art-emoji">🚌</span>
            <div className="art-line"></div>
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
            <p>Prefeitura de Arapongas - Paraná</p>
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

      <style>{`
        .landing-container {
          width: 100vw;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--background-gray);
        }

        .navbar {
          background-color: var(--primary-navy);
          color: var(--secondary-white);
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 4px solid var(--accent-yellow);
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .brand-icon {
          font-size: 2.2rem;
        }

        .nav-brand h1 {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .nav-brand p {
          font-size: 0.8rem;
          color: var(--accent-yellow);
          font-weight: 500;
        }

        .btn-secondary {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--secondary-white);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: background 0.2s;
        }

        .btn-secondary:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        /* Hero Section */
        .hero-section {
          max-width: 1200px;
          width: 100%;
          margin: 60px auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 48px;
          align-items: center;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 20px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: rgba(15, 32, 66, 0.08);
          color: var(--primary-navy);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .hero-content h1 {
          font-size: 2.8rem;
          color: var(--primary-navy);
          line-height: 1.2;
          font-weight: 800;
        }

        .hero-content p {
          font-size: 1.1rem;
          color: var(--text-light);
          line-height: 1.6;
        }

        .hero-ctas {
          display: flex;
          gap: 16px;
          margin-top: 10px;
        }

        .btn-outline {
          border: 2px solid var(--primary-navy);
          color: var(--primary-navy);
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 700;
          transition: background 0.2s;
        }

        .btn-outline:hover {
          background-color: rgba(15, 32, 66, 0.05);
        }

        .hero-visual {
          display: flex;
          justify-content: center;
        }

        .bus-art-card {
          background: linear-gradient(135deg, var(--primary-navy) 0%, #1e3a70 100%);
          width: 300px;
          height: 300px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .art-emoji {
          font-size: 5rem;
        }

        .art-line {
          width: 80px;
          height: 4px;
          background-color: var(--accent-yellow);
          border-radius: 2px;
        }

        .art-row {
          display: flex;
          gap: 12px;
        }

        .art-badge {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--secondary-white);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
        }

        /* Features Section */
        .features-section {
          background-color: var(--secondary-white);
          padding: 80px 24px;
          text-align: center;
          border-top: 1px solid var(--border-color);
        }

        .section-header {
          max-width: 600px;
          margin: 0 auto 56px;
        }

        .section-header h2 {
          font-size: 2.2rem;
          color: var(--primary-navy);
          margin-bottom: 12px;
          font-weight: 800;
        }

        .section-header p {
          color: var(--text-light);
        }

        .features-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
        }

        .feature-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 40px 32px;
        }

        .icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: rgba(15, 32, 66, 0.08);
          color: var(--primary-navy);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-card h3 {
          font-size: 1.3rem;
          color: var(--primary-navy);
        }

        .feature-card p {
          color: var(--text-light);
          line-height: 1.6;
          font-size: 0.95rem;
        }

        /* CTA Section */
        .cta-section {
          max-width: 1200px;
          width: 100%;
          margin: 80px auto;
          padding: 0 24px;
        }

        .cta-card {
          background-color: var(--primary-navy);
          color: var(--secondary-white);
          padding: 60px 40px;
          border-radius: var(--radius);
          text-align: center;
          border-bottom: 6px solid var(--accent-yellow);
        }

        .cta-card h2 {
          font-size: 2rem;
          margin-bottom: 16px;
          font-weight: 800;
        }

        .cta-card p {
          max-width: 600px;
          margin: 0 auto 32px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }

        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .btn-yellow {
          background-color: var(--accent-yellow);
          color: var(--primary-navy);
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 700;
          transition: opacity 0.2s;
        }

        .btn-yellow:hover {
          opacity: 0.9;
        }

        .btn-white-outline {
          border: 2px solid var(--secondary-white);
          color: var(--secondary-white);
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 700;
          transition: background 0.2s;
        }

        .btn-white-outline:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        /* Footer */
        .footer {
          background-color: #0c1833;
          color: rgba(255, 255, 255, 0.7);
          padding: 48px 40px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 32px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 32px;
        }

        .footer-brand h3 {
          color: var(--secondary-white);
          margin-bottom: 8px;
        }

        .footer-links p {
          margin-bottom: 8px;
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 24px auto 0;
          text-align: center;
          font-size: 0.8rem;
        }

        @media (max-width: 768px) {
          .hero-section {
            grid-template-columns: 1fr;
            text-align: center;
            margin: 40px auto;
          }

          .hero-content {
            align-items: center;
          }

          .hero-ctas {
            flex-direction: column;
            width: 100%;
          }

          .cta-buttons {
            flex-direction: column;
            gap: 12px;
          }

          .footer-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
