import { createClient as createServerClient } from '../../../utils/supabase/server';
import { cookies } from 'next/headers';
import { Bus, Users, Map, LogOut, FileText, Filter, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // 1. Buscando contagens do Supabase com tratamento de fallback
  let totalOnibus = 12;
  let totalAlunos = 5820;
  let totalRotas = 38;

  try {
    const { count: onibusCount } = await supabase.from('veiculos').select('*', { count: 'exact', head: true });
    if (onibusCount !== null) totalOnibus = onibusCount;

    const { count: alunosCount } = await supabase.from('alunos').select('*', { count: 'exact', head: true });
    if (alunosCount !== null) totalAlunos = alunosCount;

    const { count: rotasCount } = await supabase.from('rotas').select('*', { count: 'exact', head: true });
    if (rotasCount !== null) totalRotas = rotasCount;
  } catch (e) {
    // Fallback silencioso para dados simulados
  }

  // 2. Mock de dados de Veículos e Motoristas
  const veiculosMotoristas = [
    { id: 1, motorista: 'Carlos Alberto Silva', veiculo: 'Microônibus Volare', placa: 'AAA-1234', tipo: 'Próprio', status: 'Ativo' },
    { id: 2, motorista: 'Marcos Vinícius Souza', veiculo: 'Ônibus Mercedes-Benz', placa: 'BBB-5678', tipo: 'Terceirizado', status: 'Ativo' },
    { id: 3, motorista: 'Ana Julia Santos', veiculo: 'Van Escolar Master', placa: 'CCC-9012', tipo: 'Próprio', status: 'Manutenção' },
    { id: 4, motorista: 'Roberto Ferreira', veiculo: 'Ônibus Volkswagen', placa: 'DDD-3456', tipo: 'Terceirizado', status: 'Ativo' },
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🏛️</span>
          <div>
            <h1>Painel do Administrador</h1>
            <p>Secretaria de Educação - Arapongas</p>
          </div>
        </div>
        <div className="nav-actions">
          <Link href="/login" className="logout-btn">
            <LogOut size={16} />
            Sair
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <main className="dashboard-grid">
        
        {/* Resumo de Cards */}
        <section className="summary-cards">
          <div className="card-premium stat-card">
            <div className="stat-icon-wrapper navy">
              <Bus size={24} />
            </div>
            <div className="stat-data">
              <span className="stat-title">Total de Ônibus</span>
              <span className="stat-value">{totalOnibus}</span>
            </div>
          </div>

          <div className="card-premium stat-card">
            <div className="stat-icon-wrapper yellow">
              <Users size={24} />
            </div>
            <div className="stat-data">
              <span className="stat-title">Alunos Transportados</span>
              <span className="stat-value">{totalAlunos}</span>
            </div>
          </div>

          <div className="card-premium stat-card">
            <div className="stat-icon-wrapper navy">
              <Map size={24} />
            </div>
            <div className="stat-data">
              <span className="stat-title">Rotas Ativas</span>
              <span className="stat-value">{totalRotas}</span>
            </div>
          </div>
        </section>

        {/* Gestão e Tabela */}
        <section className="management-section">
          <div className="card-premium table-card">
            <div className="table-header">
              <div>
                <h2>Gestão de Frotas & Operadores</h2>
                <p>Monitore e filtre a alocação de veículos e seus respectivos motoristas.</p>
              </div>
              <button className="btn-primary report-btn">
                <FileText size={18} />
                Gerar Relatório
              </button>
            </div>

            <div className="table-filter-bar">
              <div className="filter-item">
                <Filter size={16} />
                <span>Filtrar Tipo:</span>
              </div>
              <button className="filter-badge active">Todos</button>
              <button className="filter-badge">Próprio</button>
              <button className="filter-badge">Terceirizado</button>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Motorista</th>
                    <th>Veículo</th>
                    <th>Placa</th>
                    <th>Vínculo</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {veiculosMotoristas.map((item) => (
                    <tr key={item.id}>
                      <td className="font-bold">{item.motorista}</td>
                      <td>{item.veiculo}</td>
                      <td className="code-font">{item.placa}</td>
                      <td>
                        <span className={`badge-type ${item.tipo === 'Próprio' ? 'own' : 'partner'}`}>
                          {item.tipo}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>

      <style>{`
        .dashboard-container {
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
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* Summary Cards */
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 28px;
        }

        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon-wrapper.navy {
          background-color: rgba(15, 32, 66, 0.08);
          color: var(--primary-navy);
        }

        .stat-icon-wrapper.yellow {
          background-color: rgba(251, 192, 45, 0.15);
          color: #B78103;
        }

        .stat-data {
          display: flex;
          flex-direction: column;
        }

        .stat-title {
          font-size: 0.85rem;
          color: var(--text-light);
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-dark);
        }

        /* Management Table */
        .management-section {
          width: 100%;
        }

        .table-card {
          padding: 32px;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 20px;
        }

        .table-header h2 {
          color: var(--primary-navy);
          font-size: 1.4rem;
          font-weight: 700;
        }

        .table-header p {
          color: var(--text-light);
          font-size: 0.9rem;
          margin-top: 4px;
        }

        .report-btn {
          height: fit-content;
        }

        .table-filter-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .filter-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          color: var(--text-light);
          font-weight: 600;
        }

        .filter-badge {
          background-color: #F1F5F9;
          border: 1px solid var(--border-color);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-badge.active, .filter-badge:hover {
          background-color: var(--primary-navy);
          color: var(--secondary-white);
          border-color: var(--primary-navy);
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .custom-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .custom-table th, .custom-table td {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .custom-table th {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-light);
          text-transform: uppercase;
        }

        .custom-table td {
          font-size: 0.95rem;
          color: var(--text-dark);
        }

        .font-bold {
          font-weight: 600;
        }

        .code-font {
          font-family: monospace;
          font-weight: 600;
          color: var(--text-light);
        }

        .badge-type {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .badge-type.own {
          background-color: #ecfdf5;
          color: #065f46;
        }

        .badge-type.partner {
          background-color: #eff6ff;
          color: #1e40af;
        }

        .status-pill {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-pill.ativo {
          background-color: rgba(74, 222, 128, 0.15);
          color: #166534;
        }

        .status-pill.manutenção {
          background-color: rgba(239, 68, 68, 0.15);
          color: #991b1b;
        }

        @media (max-width: 768px) {
          .table-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .table-filter-bar {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
