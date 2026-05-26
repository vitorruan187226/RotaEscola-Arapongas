import { createClient as createServerClient } from '../utils/supabase/server';
import { cookies } from 'next/headers';
import { Bus, Users, ShieldAlert, Award, FileCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  let statusConexao = "Online";
  try {
    const { error } = await supabase.from('todos').select('id').limit(1);
    if (error) statusConexao = "Erro RLS / Tabela";
  } catch (err) {
    statusConexao = "Offline / Erro Supabase";
  }

  return (
    <div className="dashboard-container">
      {/* Barra de Navegação Superior */}
      <header className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🚌</span>
          <div>
            <h1>RotaEscola</h1>
            <p>Arapongas - PR</p>
          </div>
        </div>
        <div className="nav-status">
          <span className="status-dot"></span>
          <span>Status Banco: {statusConexao}</span>
        </div>
      </header>

      {/* Grid Principal */}
      <main className="dashboard-grid">
        {/* Painel Informativo Principal */}
        <section className="welcome-banner">
          <h2>Gestão Integrada de Transporte Escolar</h2>
          <p>
            Plataforma municipal de monitoramento de rotas, controle de embarque dos alunos e validação de carteirinhas.
          </p>
          <div className="banner-stats">
            <div className="stat-item">
              <span className="stat-val">6.000</span>
              <span className="stat-lbl">Alunos Atendidos</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">42</span>
              <span className="stat-lbl">Rotas Ativas</span>
            </div>
          </div>
        </section>

        {/* Seção de Funcionalidades */}
        <section className="features-grid">
          <div className="card-premium">
            <div className="feature-header">
              <div className="feature-icon navy-bg">
                <Users size={24} />
              </div>
              <span className="badge-yellow">Administrativo</span>
            </div>
            <h3>Controle de Alunos</h3>
            <p>Acompanhamento cadastral, vinculação a rotas específicas e emissão de autorizações.</p>
          </div>

          <div className="card-premium">
            <div className="feature-header">
              <div className="feature-icon navy-bg">
                <Bus size={24} />
              </div>
              <span className="badge-yellow">Rotas</span>
            </div>
            <h3>Frotas & Veículos</h3>
            <p>Gestão e rastreabilidade dos veículos, limites de lotação e escalas de motoristas.</p>
          </div>

          <div className="card-premium">
            <div className="feature-header">
              <div className="feature-icon navy-bg">
                <Award size={24} />
              </div>
              <span className="badge-yellow">Segurança</span>
            </div>
            <h3>Carteirinhas QR</h3>
            <p>Histórico de embarque sincronizado em tempo real com o aplicativo mobile do motorista.</p>
          </div>

          <div className="card-premium">
            <div className="feature-header">
              <div className="feature-icon navy-bg">
                <FileCheck size={24} />
              </div>
              <span className="badge-yellow">Validação</span>
            </div>
            <h3>Documentação</h3>
            <p>Central de análise de comprovantes enviados pelos responsáveis via aplicativo móvel.</p>
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
          letter-spacing: -0.5px;
        }

        .nav-brand p {
          font-size: 0.8rem;
          color: var(--accent-yellow);
          font-weight: 500;
        }

        .nav-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          background-color: rgba(255, 255, 255, 0.1);
          padding: 6px 12px;
          border-radius: 20px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background-color: #4ade80;
          border-radius: 50%;
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
          background: linear-gradient(135deg, var(--primary-navy) 0%, #1e3a70 100%);
          color: var(--secondary-white);
          padding: 40px;
          border-radius: var(--radius);
          position: relative;
          overflow: hidden;
        }

        .welcome-banner h2 {
          font-size: 1.8rem;
          margin-bottom: 12px;
        }

        .welcome-banner p {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          max-width: 600px;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .banner-stats {
          display: flex;
          gap: 32px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-val {
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent-yellow);
        }

        .stat-lbl {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .feature-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .feature-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .navy-bg {
          background-color: rgba(15, 32, 70, 0.08);
          color: var(--primary-navy);
        }

        .features-grid h3 {
          font-size: 1.15rem;
          color: var(--primary-navy);
          margin-bottom: 8px;
        }

        .features-grid p {
          font-size: 0.9rem;
          color: var(--text-light);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
