import { ShieldCheck, LogOut, ArrowRight, UserCheck, Settings, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function SecretariaDashboard() {
  return (
    <div className="dashboard-container">
      <header className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🏛️</span>
          <div>
            <h1>Painel Secretaria</h1>
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
            <ShieldCheck size={18} />
            <span>Acesso Autorizado</span>
          </div>
          <h2>Bem-vindo, Gestor da Secretaria</h2>
          <p>Você possui permissões administrativas para gerenciar rotas, cadastrar alunos, auditar logs de embarque e autorizar novos motoristas.</p>
        </section>

        <section className="features-grid">
          <div className="card-premium">
            <h3>Novas Solicitações</h3>
            <p>Verifique cadastros de alunos pendentes de validação de documentos.</p>
            <div className="card-action">
              <span>Analisar</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="card-premium">
            <h3>Auditoria de Logs</h3>
            <p>Visualize em tempo real as carteirinhas lidas pelos motoristas nas vans escolares.</p>
            <div className="card-action">
              <span>Auditar</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="card-premium">
            <h3>Gerenciar Rotas</h3>
            <p>Crie novas linhas de itinerário, atrele veículos e atualize escalas.</p>
            <div className="card-action">
              <span>Configurar</span>
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
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          color: var(--secondary-white);
          padding: 40px;
          border-radius: var(--radius);
        }

        .banner-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: rgba(74, 222, 128, 0.2);
          color: #4ade80;
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
