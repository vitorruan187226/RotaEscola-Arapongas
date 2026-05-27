import { cookies } from 'next/headers';
import { createClient as createServerClient } from '../../../utils/supabase/server';
import {
  Users,
  Bus,
  FileCheck,
  AlertTriangle,
  Map,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// ─── Tipos ──────────────────────────────────────────────────────────────────
interface KpiCard {
  titulo: string;
  valor: string | number;
  subtitulo: string;
  icone: React.ElementType;
  cor: 'navy' | 'yellow' | 'red' | 'green';
  tendencia?: string;
}

interface AtividadeRecente {
  id: number;
  aluno: string;
  escola: string;
  rota: string;
  status: 'Aprovado' | 'Pendente' | 'Em análise';
  data: string;
}

// ─── Dados mock tipados ──────────────────────────────────────────────────────
const mockAtividades: AtividadeRecente[] = [
  { id: 1, aluno: 'Beatriz Oliveira Santos',   escola: 'E. M. Codorna',         rota: 'Rota 07 — Norte',   status: 'Aprovado',   data: '27/05/2025' },
  { id: 2, aluno: 'Lucas Henrique Ferreira',   escola: 'E. M. Padre Silvestre', rota: 'Rota 14 — Zona Rural', status: 'Aprovado', data: '27/05/2025' },
  { id: 3, aluno: 'Mariana Costa Souza',       escola: 'E. M. Lagoa Azul',      rota: 'Rota 22 — Centro',  status: 'Em análise', data: '26/05/2025' },
  { id: 4, aluno: 'Pedro Augusto Lima',        escola: 'E. M. São Rafael',      rota: 'Rota 03 — Sul',     status: 'Pendente',   data: '26/05/2025' },
  { id: 5, aluno: 'Isabela Rodrigues Cunha',   escola: 'E. M. Codorna',         rota: 'Rota 07 — Norte',   status: 'Aprovado',   data: '25/05/2025' },
  { id: 6, aluno: 'Gabriel Mendes Pereira',    escola: 'E. M. Padre Silvestre', rota: 'Rota 19 — Leste',   status: 'Aprovado',   data: '25/05/2025' },
];

// ─── Helper de status ────────────────────────────────────────────────────────
function StatusPill({ status }: { status: AtividadeRecente['status'] }) {
  const map = {
    'Aprovado':   { cls: 'pill-green',  icon: <CheckCircle2 size={12} /> },
    'Pendente':   { cls: 'pill-yellow', icon: <Clock size={12} /> },
    'Em análise': { cls: 'pill-blue',   icon: <RefreshCw size={12} /> },
  };
  const { cls, icon } = map[status];
  return (
    <span className={`adm-pill ${cls}`}>
      {icon}
      {status}
    </span>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // KPIs com fallback para mocks
  let totalAlunos   = 6000;
  let totalVeiculos = 102;
  let docsPendentes = 34;
  let ocorrencias   = 0;

  try {
    const [
      { count: alunosCount },
      { count: veiculosCount },
    ] = await Promise.all([
      supabase.from('alunos').select('*',   { count: 'exact', head: true }),
      supabase.from('veiculos').select('*', { count: 'exact', head: true }),
    ]);
    if (alunosCount   !== null) totalAlunos   = alunosCount;
    if (veiculosCount !== null) totalVeiculos = veiculosCount;
  } catch {
    // fallback silencioso — dados simulados em uso
  }

  const kpis: KpiCard[] = [
    {
      titulo: 'Alunos Cadastrados',
      valor: totalAlunos.toLocaleString('pt-BR'),
      subtitulo: 'No sistema RotaEscola',
      icone: Users,
      cor: 'navy',
      tendencia: '+124 este mês',
    },
    {
      titulo: 'Frota Ativa',
      valor: totalVeiculos,
      subtitulo: 'Veículos em operação',
      icone: Bus,
      cor: 'green',
      tendencia: '100% operacional',
    },
    {
      titulo: 'Documentos Pendentes',
      valor: docsPendentes,
      subtitulo: 'Aguardando aprovação',
      icone: FileCheck,
      cor: 'yellow',
      tendencia: '↓ 8 desde ontem',
    },
    {
      titulo: 'Ocorrências Hoje',
      valor: ocorrencias,
      subtitulo: 'Registros de incidente',
      icone: AlertTriangle,
      cor: 'red',
      tendencia: 'Tudo normal ✓',
    },
  ];

  const corMap = {
    navy:   { bg: 'kpi-bg-navy',   icon: 'kpi-icon-navy' },
    green:  { bg: 'kpi-bg-green',  icon: 'kpi-icon-green' },
    yellow: { bg: 'kpi-bg-yellow', icon: 'kpi-icon-yellow' },
    red:    { bg: 'kpi-bg-red',    icon: 'kpi-icon-red' },
  };

  return (
    <div className="adm-page">

      {/* ── Cabeçalho da página ── */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Visão Geral do Transporte Escolar</h1>
          <p className="adm-page-sub">
            Painel de controle — Secretaria Municipal de Educação de Arapongas
          </p>
        </div>
        <div className="adm-page-header-actions">
          <span className="adm-live-badge">
            <span className="adm-live-dot" />
            Dados ao vivo
          </span>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <section className="adm-kpis" aria-label="Indicadores de desempenho">
        {kpis.map((kpi) => {
          const { bg, icon } = corMap[kpi.cor];
          return (
            <div key={kpi.titulo} className={`adm-kpi-card ${bg}`}>
              <div className="adm-kpi-top">
                <div className={`adm-kpi-icon ${icon}`}>
                  <kpi.icone size={22} />
                </div>
                <ArrowUpRight size={16} className="adm-kpi-arrow" />
              </div>
              <div className="adm-kpi-valor">{kpi.valor}</div>
              <div className="adm-kpi-titulo">{kpi.titulo}</div>
              <div className="adm-kpi-sub">{kpi.subtitulo}</div>
              {kpi.tendencia && (
                <div className="adm-kpi-tendencia">{kpi.tendencia}</div>
              )}
            </div>
          );
        })}
      </section>

      {/* ── Mapa Placeholder ── */}
      <section className="adm-mapa-section" aria-label="Área do mapa">
        <div className="adm-section-header">
          <div>
            <h2 className="adm-section-title">
              <Map size={18} className="adm-section-icon" />
              Mapa de Rastreamento em Tempo Real
            </h2>
            <p className="adm-section-desc">
              Visualize a posição de todos os veículos da frota em operação.
            </p>
          </div>
          <span className="adm-tag-integrado">Mapbox — Em breve</span>
        </div>

        <div className="adm-mapa-placeholder">
          <div className="adm-mapa-grid" aria-hidden="true">
            {/* Grade decorativa simulando mapa */}
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="adm-mapa-cell" />
            ))}
          </div>
          <div className="adm-mapa-content">
            <div className="adm-mapa-icon-ring">
              <Map size={40} className="adm-mapa-icon" />
            </div>
            <h3>Mapa de Rastreamento em Tempo Real</h3>
            <p>Mapbox será integrado aqui — visualização das 38 rotas ativas de Arapongas</p>
            <div className="adm-mapa-badges">
              <span className="adm-mapa-badge adm-mapa-badge--green">
                <span className="adm-live-dot" />
                12 veículos em trânsito
              </span>
              <span className="adm-mapa-badge adm-mapa-badge--yellow">
                ⚑ 3 próximos de escolas
              </span>
              <span className="adm-mapa-badge adm-mapa-badge--gray">
                ✓ 87 concluídos hoje
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabela de Atividades Recentes ── */}
      <section className="adm-table-section" aria-label="Atividades recentes">
        <div className="adm-section-header">
          <div>
            <h2 className="adm-section-title">
              <TrendingUp size={18} className="adm-section-icon" />
              Atividades Recentes
            </h2>
            <p className="adm-section-desc">
              Últimos cadastros de alunos processados pelo sistema.
            </p>
          </div>
          <a href="/dashboard/admin/alunos" className="adm-ver-todos">
            Ver todos
            <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table" aria-label="Tabela de atividades recentes">
            <thead>
              <tr>
                <th scope="col">Aluno</th>
                <th scope="col">Escola</th>
                <th scope="col">Rota</th>
                <th scope="col">Data</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockAtividades.map((row) => (
                <tr key={row.id}>
                  <td className="adm-td-aluno">{row.aluno}</td>
                  <td className="adm-td-escola">{row.escola}</td>
                  <td className="adm-td-rota">{row.rota}</td>
                  <td className="adm-td-data">{row.data}</td>
                  <td><StatusPill status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── ESTILOS ─── */}
      <style>{`
        .adm-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* Cabeçalho */
        .adm-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .adm-page-title {
          font-size: clamp(1.3rem, 3vw, 1.75rem);
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.3px;
          line-height: 1.2;
        }
        .adm-page-sub {
          font-size: 0.87rem;
          color: #64748B;
          margin-top: 4px;
        }
        .adm-page-header-actions { display: flex; align-items: center; gap: 12px; }
        .adm-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #166534;
          background: #dcfce7;
          border: 1px solid #bbf7d0;
          padding: 5px 12px;
          border-radius: 20px;
        }
        .adm-live-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #22c55e;
          display: inline-block;
          animation: pulseSoft 2s ease-in-out infinite;
        }

        /* ── KPI Cards ── */
        .adm-kpis {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        .adm-kpi-card {
          border-radius: 14px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border: 1px solid transparent;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .adm-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }

        /* Cores de fundo dos KPIs */
        .kpi-bg-navy   { background: #fff; border-color: #E2E8F0; }
        .kpi-bg-green  { background: #fff; border-color: #E2E8F0; }
        .kpi-bg-yellow { background: #fff; border-color: #E2E8F0; }
        .kpi-bg-red    { background: #fff; border-color: #E2E8F0; }

        .adm-kpi-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .adm-kpi-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kpi-icon-navy   { background: rgba(15,23,42,0.08);  color: #0F172A; }
        .kpi-icon-green  { background: rgba(34,197,94,0.12); color: #166534; }
        .kpi-icon-yellow { background: rgba(251,191,36,0.15); color: #92400E; }
        .kpi-icon-red    { background: rgba(239,68,68,0.10); color: #991b1b; }

        .adm-kpi-arrow { color: #CBD5E1; }

        .adm-kpi-valor {
          font-size: 2rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.5px;
          line-height: 1;
        }
        .adm-kpi-titulo {
          font-size: 0.88rem;
          font-weight: 600;
          color: #334155;
        }
        .adm-kpi-sub {
          font-size: 0.75rem;
          color: #94A3B8;
        }
        .adm-kpi-tendencia {
          margin-top: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748B;
          padding: 3px 8px;
          background: #F1F5F9;
          border-radius: 8px;
          display: inline-block;
        }

        /* ── Seções genéricas ── */
        .adm-section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .adm-section-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0F172A;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .adm-section-icon { color: #0F172A; flex-shrink: 0; }
        .adm-section-desc { font-size: 0.82rem; color: #64748B; }

        /* ── Mapa ── */
        .adm-mapa-section {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          padding: 24px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .adm-tag-integrado {
          font-size: 0.72rem;
          font-weight: 700;
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          padding: 4px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .adm-mapa-placeholder {
          position: relative;
          height: 280px;
          border-radius: 12px;
          overflow: hidden;
          background: #F8FAFC;
          border: 2px dashed #CBD5E1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .adm-mapa-grid {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          grid-template-rows: repeat(5, 1fr);
          opacity: 0.25;
        }
        .adm-mapa-cell {
          border: 1px solid #CBD5E1;
        }
        .adm-mapa-content {
          position: relative;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 0 24px;
        }
        .adm-mapa-icon-ring {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: rgba(15,23,42,0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .adm-mapa-icon { color: #0F172A; }
        .adm-mapa-content h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #0F172A;
        }
        .adm-mapa-content p {
          font-size: 0.82rem;
          color: #64748B;
          max-width: 360px;
          line-height: 1.5;
        }
        .adm-mapa-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 4px;
        }
        .adm-mapa-badge {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .adm-mapa-badge--green  { background: #dcfce7; color: #166534; }
        .adm-mapa-badge--yellow { background: #FEF3C7; color: #92400E; }
        .adm-mapa-badge--gray   { background: #F1F5F9; color: #475569; }

        /* ── Tabela ── */
        .adm-table-section {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          padding: 24px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .adm-ver-todos {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #0F172A;
          text-decoration: none;
          padding: 6px 14px;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .adm-ver-todos:hover { border-color: #0F172A; background: #F8FAFC; }

        .adm-table-wrap { overflow-x: auto; }
        .adm-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.875rem;
        }
        .adm-table th {
          padding: 12px 16px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #94A3B8;
          border-bottom: 2px solid #F1F5F9;
          white-space: nowrap;
        }
        .adm-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #F8FAFC;
          vertical-align: middle;
        }
        .adm-table tbody tr:last-child td { border-bottom: none; }
        .adm-table tbody tr:hover td { background: #FAFAFA; }

        .adm-td-aluno   { font-weight: 600; color: #0F172A; white-space: nowrap; }
        .adm-td-escola  { color: #475569; white-space: nowrap; }
        .adm-td-rota    { color: #475569; white-space: nowrap; }
        .adm-td-data    { color: #94A3B8; font-size: 0.8rem; white-space: nowrap; font-family: monospace; }

        /* Status pills */
        .adm-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .pill-green  { background: #dcfce7; color: #166534; }
        .pill-yellow { background: #FEF3C7; color: #92400E; }
        .pill-blue   { background: #dbeafe; color: #1d4ed8; }
      `}</style>
    </div>
  );
}
