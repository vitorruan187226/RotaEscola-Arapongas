'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../utils/supabase/client';
import {
  ShieldAlert,
  Send,
  CheckCircle2,
  Clock,
  User,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

// ─── Tipos ──────────────────────────────────────────────────────────────────
interface OcorrenciaRow {
  id: string;
  descricao: string;
  status: 'pendente' | 'enviada_ao_pai';
  criado_em: string;
  aluno: {
    id: string;
    nome: string;
    escola: string;
    foto_url: string | null;
    responsavel_id: string | null;
  } | null;
  motorista: {
    nome: string;
  } | null;
}

// ─── Mock de fallback (quando a tabela ainda não existe no banco) ─────────────
const OCORRENCIAS_MOCK: OcorrenciaRow[] = [
  {
    id: '1',
    descricao: 'O aluno ficou me xingando durante todo o trajeto e jogou papel no chão do ônibus.',
    status: 'pendente',
    criado_em: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    aluno: { id: '1', nome: 'Lucas Lima Souza', escola: 'Esc. Dorcelina Folador', foto_url: null, responsavel_id: '1e45bfd4-2113-4e06-b231-e8f2f1136151' },
    motorista: { nome: 'João Motorista' },
  },
  {
    id: '2',
    descricao: 'O aluno bateu na colega Ana Beatriz e começou a quebrar o apoio de braço do banco.',
    status: 'pendente',
    criado_em: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    aluno: { id: '2', nome: 'Enzo Gabriel Silva', escola: 'Esc. Dorcelina Folador', foto_url: null, responsavel_id: '2aec5cb3-45d0-4754-821d-ff00eecd7fbf' },
    motorista: { nome: 'Maria Monitora' },
  },
  {
    id: '3',
    descricao: 'A aluna se recusou a sentar e ficou andando no corredor em movimento.',
    status: 'enviada_ao_pai',
    criado_em: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    aluno: { id: '3', nome: 'Mariana Almeida Ortiz', escola: 'Col. Olímpia', foto_url: null, responsavel_id: '1e45bfd4-2113-4e06-b231-e8f2f1136151' },
    motorista: { nome: 'João Motorista' },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatarTempo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

// ─── Componente Principal ────────────────────────────────────────────────────
export default function OcorrenciasAdminPage() {
  const supabase = createClient();
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviandoId, setEnviandoId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'enviada_ao_pai'>('todos');
  const [usandoMock, setUsandoMock] = useState(false);

  // ── Carrega ocorrências ─────────────────────────────────────────────────
  const carregarOcorrencias = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select(`
          id,
          descricao,
          status,
          criado_em,
          aluno:aluno_id (
            id,
            nome,
            escola,
            foto_url,
            responsavel_id
          ),
          motorista:motorista_id (
            nome
          )
        `)
        .order('criado_em', { ascending: false });

      if (!error && data && data.length >= 0) {
        setOcorrencias(data as unknown as OcorrenciaRow[]);
        setUsandoMock(false);
      } else {
        setOcorrencias(OCORRENCIAS_MOCK);
        setUsandoMock(true);
      }
    } catch {
      setOcorrencias(OCORRENCIAS_MOCK);
      setUsandoMock(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarOcorrencias();
  }, []);

  // ── Enviar ao Pai ────────────────────────────────────────────────────────
  const handleEnviarAoPai = async (ocorrencia: OcorrenciaRow) => {
    if (!ocorrencia.aluno?.responsavel_id) {
      exibirToast('Responsável não encontrado para este aluno.');
      return;
    }

    setEnviandoId(ocorrencia.id);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!usandoMock && user) {
        // 1. Insere notificação para o responsável
        await supabase.from('notificacoes').insert({
          destinatario_id: ocorrencia.aluno.responsavel_id,
          remetente_id: user.id,
          tipo: 'ocorrencia',
          titulo: '⚠️ Ocorrência Escolar Registrada',
          canal: 'app',
          mensagem: `Seu filho(a) ${ocorrencia.aluno?.nome ?? 'seu filho'} foi registrado(a) em uma ocorrência escolar: "${ocorrencia.descricao}". Por favor, entre em contato com a secretaria.`,
          lida: false,
        });

        // 2. Atualiza o status da ocorrência
        await supabase
          .from('ocorrencias')
          .update({ status: 'enviada_ao_pai' })
          .eq('id', ocorrencia.id);
      }

      // Atualiza local
      setOcorrencias(prev =>
        prev.map(o =>
          o.id === ocorrencia.id ? { ...o, status: 'enviada_ao_pai' } : o
        )
      );

      exibirToast(`Ocorrência enviada ao responsável de ${ocorrencia.aluno?.nome ?? 'aluno'}!`);
    } catch (err) {
      console.error('Erro ao enviar ao pai:', err);
      exibirToast('Erro ao enviar. Tente novamente.');
    }

    setEnviandoId(null);
  };

  const exibirToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // ── Filtragem ─────────────────────────────────────────────────────────────
  const ocorrenciasFiltradas = ocorrencias.filter(o =>
    filtroStatus === 'todos' ? true : o.status === filtroStatus
  );
  const totalPendentes = ocorrencias.filter(o => o.status === 'pendente').length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'relative' }}>

      {/* Toast */}
      {showToast && (
        <div className="occ-toast">
          <CheckCircle2 size={16} color="#10b981" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <div className="occ-header">
        <div className="occ-header-left">
          <div className="occ-header-icon">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 className="occ-title">Ocorrências Disciplinares</h1>
            <p className="occ-subtitle">
              {totalPendentes > 0
                ? `${totalPendentes} ocorrência${totalPendentes > 1 ? 's' : ''} aguardando resposta`
                : 'Todas as ocorrências foram tratadas'}
            </p>
          </div>
        </div>
        <button
          onClick={carregarOcorrencias}
          className="occ-refresh-btn"
          title="Atualizar lista"
        >
          <RefreshCw size={15} className={loading ? 'occ-spin' : ''} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Mock banner */}
      {usandoMock && (
        <div className="occ-mock-banner">
          <AlertTriangle size={14} />
          <span>Exibindo dados de demonstração. A tabela <code>ocorrencias</code> será ativada após aplicar a migração SQL.</span>
        </div>
      )}

      {/* ── Filtros ───────────────────────────────────────────────────────── */}
      <div className="occ-filters">
        {(['todos', 'pendente', 'enviada_ao_pai'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltroStatus(f)}
            className={`occ-filter-btn ${filtroStatus === f ? 'occ-filter-btn--active' : ''}`}
          >
            {f === 'todos' ? 'Todas' : f === 'pendente' ? 'Pendentes' : 'Enviadas ao Pai'}
            {f === 'pendente' && totalPendentes > 0 && (
              <span className="occ-filter-badge">{totalPendentes}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Lista de Ocorrências ──────────────────────────────────────────── */}
      {loading ? (
        <div className="occ-loading">
          <div className="occ-spinner" />
          <span>Carregando ocorrências...</span>
        </div>
      ) : ocorrenciasFiltradas.length === 0 ? (
        <div className="occ-empty">
          <ShieldAlert size={40} color="#CBD5E1" />
          <p>Nenhuma ocorrência encontrada</p>
          <span>Quando um motorista registrar uma ocorrência, ela aparecerá aqui.</span>
        </div>
      ) : (
        <div className="occ-list">
          {ocorrenciasFiltradas.map((ocorrencia) => (
            <div
              key={ocorrencia.id}
              className={`occ-card ${ocorrencia.status === 'pendente' ? 'occ-card--pendente' : 'occ-card--enviada'}`}
            >
              {/* Status badge */}
              <div className="occ-card-header">
                <span className={`occ-status-badge ${ocorrencia.status === 'pendente' ? 'occ-status-badge--pendente' : 'occ-status-badge--enviada'}`}>
                  {ocorrencia.status === 'pendente' ? (
                    <><Clock size={10} /> Pendente</>
                  ) : (
                    <><CheckCircle2 size={10} /> Enviada ao Pai</>
                  )}
                </span>
                <span className="occ-card-time">{formatarTempo(ocorrencia.criado_em)}</span>
              </div>

              {/* Info do aluno */}
              <div className="occ-aluno-row">
                <div className="occ-aluno-avatar">
                  {ocorrencia.aluno?.foto_url ? (
                    <img src={ocorrencia.aluno.foto_url} alt={ocorrencia.aluno.nome} className="occ-avatar-img" />
                  ) : (
                    <User size={18} color="#94A3B8" />
                  )}
                </div>
                <div className="occ-aluno-info">
                  <p className="occ-aluno-nome">{ocorrencia.aluno?.nome ?? '—'}</p>
                  <p className="occ-aluno-escola">{ocorrencia.aluno?.escola ?? '—'}</p>
                </div>
                <div className="occ-motorista-chip">
                  <span>por {ocorrencia.motorista?.nome ?? 'Motorista'}</span>
                  <ChevronRight size={10} />
                </div>
              </div>

              {/* Descrição */}
              <div className="occ-descricao">
                <MessageSquare size={13} color="#F97316" />
                <p>"{ocorrencia.descricao}"</p>
              </div>

              {/* Ação */}
              {ocorrencia.status === 'pendente' && (
                <button
                  onClick={() => handleEnviarAoPai(ocorrencia)}
                  disabled={enviandoId === ocorrencia.id}
                  className="occ-enviar-btn"
                  id={`btn-enviar-pai-${ocorrencia.id}`}
                >
                  {enviandoId === ocorrencia.id ? (
                    <><div className="occ-btn-spinner" /> Enviando...</>
                  ) : (
                    <><Send size={14} /> Enviar ao Pai</>
                  )}
                </button>
              )}

              {ocorrencia.status === 'enviada_ao_pai' && (
                <div className="occ-enviada-info">
                  <CheckCircle2 size={14} color="#10b981" />
                  <span>Responsável notificado com sucesso</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Estilos ───────────────────────────────────────────────────────── */}
      <style>{`
        /* Toast */
        .occ-toast {
          position: fixed;
          top: 80px;
          right: 24px;
          background: #fff;
          border: 1px solid #D1FAE5;
          border-radius: 12px;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #065F46;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          z-index: 100;
          animation: slideInRight 0.3s ease;
        }
        @keyframes slideInRight {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }

        /* Header */
        .occ-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .occ-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .occ-header-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #F97316, #FB923C);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(249,115,22,0.28);
        }
        .occ-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
        }
        .occ-subtitle {
          font-size: 0.78rem;
          color: #64748B;
          margin: 2px 0 0;
        }
        .occ-refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid #E2E8F0;
          background: #fff;
          color: #475569;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .occ-refresh-btn:hover { background: #F8FAFC; border-color: #CBD5E1; color: #0F172A; }
        .occ-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Mock banner */
        .occ-mock-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 0.78rem;
          color: #92400E;
          margin-bottom: 20px;
        }
        .occ-mock-banner code {
          background: #FEF3C7;
          padding: 0 4px;
          border-radius: 4px;
          font-size: 0.75rem;
        }

        /* Filtros */
        .occ-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .occ-filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 999px;
          border: 1px solid #E2E8F0;
          background: #fff;
          color: #64748B;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .occ-filter-btn:hover { border-color: #CBD5E1; color: #0F172A; }
        .occ-filter-btn--active {
          background: #0F172A;
          border-color: #0F172A;
          color: #fff;
        }
        .occ-filter-badge {
          background: #EF4444;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 999px;
          min-width: 18px;
          text-align: center;
        }

        /* Loading */
        .occ-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 60px 0;
          color: #94A3B8;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .occ-spinner {
          width: 28px; height: 28px;
          border: 3px solid #E2E8F0;
          border-top-color: #F97316;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Empty */
        .occ-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 72px 0;
          text-align: center;
        }
        .occ-empty p {
          font-size: 1rem;
          font-weight: 700;
          color: #94A3B8;
          margin: 8px 0 0;
        }
        .occ-empty span {
          font-size: 0.78rem;
          color: #CBD5E1;
          max-width: 300px;
        }

        /* Lista */
        .occ-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Card */
        .occ-card {
          background: #fff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          border: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: box-shadow 0.2s;
        }
        .occ-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.09); }
        .occ-card--pendente { border-left: 4px solid #F97316; }
        .occ-card--enviada  { border-left: 4px solid #10B981; }

        /* Card header */
        .occ-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .occ-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .occ-status-badge--pendente {
          background: #FFF7ED;
          color: #C2410C;
          border: 1px solid #FED7AA;
        }
        .occ-status-badge--enviada {
          background: #ECFDF5;
          color: #065F46;
          border: 1px solid #A7F3D0;
        }
        .occ-card-time {
          font-size: 0.72rem;
          color: #94A3B8;
          font-weight: 500;
        }

        /* Aluno row */
        .occ-aluno-row {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 10px 14px;
        }
        .occ-aluno-avatar {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .occ-avatar-img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .occ-aluno-info { flex: 1; min-width: 0; }
        .occ-aluno-nome {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .occ-aluno-escola {
          font-size: 0.72rem;
          color: #64748B;
          margin: 2px 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .occ-motorista-chip {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.68rem;
          color: #94A3B8;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Descrição */
        .occ-descricao {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          background: #FFF7ED;
          border: 1px solid #FED7AA;
          border-radius: 10px;
          padding: 12px 14px;
        }
        .occ-descricao p {
          font-size: 0.82rem;
          color: #7C3AED;
          color: #78350F;
          font-style: italic;
          margin: 0;
          line-height: 1.55;
          font-weight: 500;
        }

        /* Botão Enviar ao Pai */
        .occ-enviar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #F97316, #FB923C);
          color: #fff;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(249,115,22,0.28);
        }
        .occ-enviar-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(249,115,22,0.38);
        }
        .occ-enviar-btn:active { transform: translateY(0); }
        .occ-enviar-btn:disabled {
          background: #E2E8F0;
          color: #94A3B8;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }
        .occ-btn-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* Enviada info */
        .occ-enviada-info {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #065F46;
        }
      `}</style>
    </div>
  );
}
