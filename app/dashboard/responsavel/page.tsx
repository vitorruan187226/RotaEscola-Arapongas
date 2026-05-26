import { Heart, LogOut, ArrowRight, ClipboardList, ShieldAlert, Award } from 'lucide-react';
import Link from 'next/link';

export default function ResponsavelDashboard() {
  return (
    <div className="dashboard-container">
      <header className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">👨‍👩‍👦</span>
          <div>
            <h1>Painel Responsável</h1>
            <p>RotaEscola Arapongas</p>
          </div>
        </div>
        <div className="nav-actions">
          <Link href="/login" className="logout-btn">
            <LogOut size={16} />
            Sair
          </Link>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="welcome-banner">
          <div className="banner-badge">
            <Heart size={18} />
            <span>Área da Família</span>
          </div>
          <h2>Área de Acompanhamento dos Alunos</h2>
          <p>Gerencie a carteirinha dos seus filhos, envie documentação pendente e acompanhe o histórico escolar de transporte.</p>
        </section>

        <section className="features-grid">
          <div className="card-premium">
            <h3>Enviar Documentação</h3>
            <p>Atualize a Declaração de Matrícula e Comprovante de Residência dos seus filhos.</p>
            <div className="card-action">
              <span>Enviar arquivos</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="card-premium">
            <h3>Histórico de Embarque</h3>
            <p>Monitore os horários em que seu filho realizou o embarque e desembarque no veículo escolar.</p>
            <div className="card-action">
              <span>Ver histórico</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="card-premium">
            <h3>Informações do Veículo</h3>
            <p>Veja detalhes sobre o ônibus/van escolar, incluindo dados de contato do motorista e da linha.</p>
            <div className="card-action">
              <span>Consultar</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .dashboard-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
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
        }

        .nav-brand p {
          font-size: 0.8rem;
          color: var(--accent-yellow);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--secondary-white);
          text-decoration: none;
          font-size: 0.9rem;
          background-color: rgba(255, 255, 255, 0.15);
          padding: 8px 16px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .logout-btn:hover {
          background-color: rgba(255, 255, 255, 0.25);
        }

        .dashboard-grid {
          max-width: 1200px;
          width: 100%;
          margin: 40px auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        .welcome-banner {
          background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
          color: var(--secondary-white);
          padding: 40px;
          border-radius: var(--radius);
        }

        .banner-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: rgba(251, 192, 45, 0.2);
          color: var(--accent-yellow);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .welcome-banner h2 {
          font-size: 1.8rem;
          margin-bottom: 12px;
        }

        .welcome-banner p {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          max-width: 700px;
          line-height: 1.5;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .card-premium h3 {
          color: var(--primary-navy);
          margin-bottom: 8px;
        }

        .card-premium p {
          color: var(--text-light);
          font-size: 0.9rem;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .card-action {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--primary-navy);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
