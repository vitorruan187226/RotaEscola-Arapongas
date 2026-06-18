import { cookies } from 'next/headers';
import { createClient as createServerClient } from '../../../utils/supabase/server';
import { 
  Users, 
  Bus, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Navigation,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Wrench,
  Map,
  AlertOctagon
} from 'lucide-react';
import Link from 'next/link';
import AutoRefresh from '../../../components/AutoRefresh';

export const dynamic = 'force-dynamic';

// ─── Interfaces de Dados ──────────────────────────────────────────────────
interface RotaAtiva {
  id: number;
  linha: string;
  motorista: string;
  placa: string;
  status: 'In Transit' | 'Stopped';
  ultimaSincronizacao: string;
}

interface SolicitacaoCarteirinha {
  id: number;
  aluno: string;
  escola: string;
  status: 'Aguardando Análise' | 'Aprovado' | 'Documento Inválido';
  avatarColor: string;
  iniciais: string;
  fotoUrl?: string | null;
}

// ─── Mocks Premium Arapongas ──────────────────────────────────────────────
const ROTAS_ATIVAS_MOCK: RotaAtiva[] = [
  { id: 1, linha: 'Rota 04 — Zona Rural / Dorcelina Folador', motorista: 'Carlos Alberto Silva', placa: 'BBB-5678', status: 'In Transit', ultimaSincronizacao: '16:23' },
  { id: 2, linha: 'Rota 07 — Região Norte / Olímpia', motorista: 'Marcos Vinícius Souza', placa: 'AAA-1234', status: 'In Transit', ultimaSincronizacao: '16:20' },
  { id: 3, linha: 'Rota 22 — Centro / Julia Wanderley', motorista: 'Ana Julia Santos', placa: 'CCC-9012', status: 'Stopped', ultimaSincronizacao: '16:15' },
  { id: 4, linha: 'Rota 14 — Zona Sul / Padre Silvestre', motorista: 'Roberto Ferreira', placa: 'DDD-3456', status: 'In Transit', ultimaSincronizacao: '16:22' },
  { id: 5, linha: 'Rota 19 — Leste / Codorna', motorista: 'Sandra Aparecida Lima', placa: 'EEE-7890', status: 'Stopped', ultimaSincronizacao: '16:02' }
];

const SOLICITACOES_MOCK: SolicitacaoCarteirinha[] = [
  { id: 1, aluno: 'Pedro Henrique Silva', escola: 'E. M. Codorna', status: 'Aguardando Análise', avatarColor: 'bg-indigo-600', iniciais: 'PS' },
  { id: 2, aluno: 'Sophia Moraes Dias', escola: 'C. E. Julia Wanderley', status: 'Documento Inválido', avatarColor: 'bg-rose-600', iniciais: 'SD' },
  { id: 3, aluno: 'Guilherme Augusto Nogueira', escola: 'E. M. Dorcelina Folador', status: 'Aguardando Análise', avatarColor: 'bg-amber-600', iniciais: 'GN' },
  { id: 4, aluno: 'Beatriz Martins Souza', escola: 'C. E. Julia Wanderley', status: 'Documento Inválido', avatarColor: 'bg-rose-600', iniciais: 'BS' },
  { id: 5, aluno: 'Lucas Henrique Ferreira', escola: 'E. M. Padre Silvestre', status: 'Aprovado', avatarColor: 'bg-teal-650', iniciais: 'LF' }
];

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // Métricas dinâmicas do banco
  let totalAlunos = 0;
  let totalVeiculos = 0;
  let solicitacoesPendentes = 0;
  let alertasOcorrencia = 0;
  let rotasAtivasCount = 0;
  let logsEmbarqueRecentes: any[] = [];
  let rotasAtivas: any[] = [];
  let ultimasSolicitacoes: any[] = [];

  let alertasAtivos: any[] = [];

  try {
    const [
      { count: alunosCount },
      { count: veiculosCount },
      { count: pendentesCount },
      { count: ocorrenciasCount },
      { count: ativasCount },
      { data: logsData },
      { data: rotasData },
      { data: solicitacoesData },
      { data: notificationsData }
    ] = await Promise.all([
      supabase.from('alunos').select('*', { count: 'exact', head: true }),
      supabase.from('veiculos').select('*', { count: 'exact', head: true }),
      supabase.from('alunos').select('*', { count: 'exact', head: true }).eq('status_carteirinha', 'Em análise'),
      supabase.from('ocorrencias').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
      supabase.from('rotas').select('*', { count: 'exact', head: true }).eq('ativa', true),
      supabase
        .from('logs_embarque')
        .select(`
          id,
          tipo_movimento,
          criado_em,
          alunos (nome, escola, turno)
        `)
        .order('criado_em', { ascending: false })
        .limit(5),
      supabase
        .from('rotas')
        .select(`
          id,
          codigo,
          nome,
          turno,
          ativa,
          perfis (nome),
          veiculos (placa)
        `)
        .order('codigo', { ascending: true })
        .limit(5),
      supabase
        .from('alunos')
        .select('id, nome, escola, status_carteirinha, created_at, foto_url')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('notificacoes')
        .select('id, titulo, mensagem, criado_em')
        .is('aluno_id', null)
        .eq('lida', false)
    ]);

    if (alunosCount !== null) totalAlunos = alunosCount;
    if (veiculosCount !== null) totalVeiculos = veiculosCount;
    if (pendentesCount !== null) solicitacoesPendentes = pendentesCount;
    if (ativasCount !== null) rotasAtivasCount = ativasCount;

    if (notificationsData) {
      alertasAtivos = notificationsData.filter((n: any) =>
        n.titulo.includes('SOS') ||
        n.titulo.includes('EMERGÊNCIA') ||
        n.titulo.includes('Mecânica') ||
        n.titulo.includes('Via')
      );
    }

    // Alertas de Ocorrência = Ocorrências de Estudantes Pendentes + Alertas de Frota Ativos
    alertasOcorrencia = (ocorrenciasCount || 0) + alertasAtivos.length;

    if (logsData && logsData.length > 0) {
      logsEmbarqueRecentes = logsData.map((log: any) => ({
        id: log.id,
        alunoNome: log.alunos?.nome || 'Estudante Municipal',
        escola: log.alunos?.escola || 'Escola Municipal',
        tipoMovimento: log.tipo_movimento,
        status: 'PRESENTE',
        dataRegistro: new Date(log.criado_em).toISOString().split('T')[0],
        turno: log.alunos?.turno || 'Matutino',
        hora: new Date(log.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }));
    }

    if (rotasData && rotasData.length > 0) {
      rotasAtivas = rotasData.map((r: any) => ({
        id: r.id,
        linha: `${r.codigo} — ${r.nome}`,
        motorista: r.perfis?.nome || 'Motorista não designado',
        placa: r.veiculos?.placa || 'Sem Veículo',
        status: r.ativa ? 'Em Rota' : 'Fora de Rota',
        ultimaSincronizacao: new Date(r.created_at || new Date()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }));
    }

    if (solicitacoesData && solicitacoesData.length > 0) {
      ultimasSolicitacoes = solicitacoesData.map((s: any) => {
        const partes = s.nome.split(' ');
        const iniciais = partes.length > 1 
          ? `${partes[0][0]}${partes[1][0]}`.toUpperCase() 
          : `${partes[0][0]}${partes[0][1] || ''}`.toUpperCase();
        
        const cores = ['bg-indigo-600', 'bg-rose-600', 'bg-amber-600', 'bg-teal-650', 'bg-sky-600'];
        const avatarColor = cores[s.nome.charCodeAt(0) % cores.length];

        let statusLabel = 'Aguardando Análise';
        if (s.status_carteirinha === 'Aprovado') statusLabel = 'Aprovado';
        if (s.status_carteirinha === 'Pendente') statusLabel = 'Documento Inválido';

        return {
          id: s.id,
          aluno: s.nome,
          escola: s.escola || 'Escola Municipal',
          status: statusLabel,
          avatarColor,
          iniciais,
          fotoUrl: s.foto_url
        };
      });
    }
  } catch (e) {
    console.error('Erro ao buscar dados do dashboard real:', e);
  }

  if (rotasAtivas.length === 0) {
    rotasAtivas = ROTAS_ATIVAS_MOCK;
  }
  if (ultimasSolicitacoes.length === 0) {
    ultimasSolicitacoes = SOLICITACOES_MOCK;
  }
  if (logsEmbarqueRecentes.length === 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    logsEmbarqueRecentes = [
      { id: 'l1', alunoNome: 'Lucas Lima Souza', escola: 'E. M. Dorcelina Folador', tipoMovimento: 'IDA', status: 'PRESENTE', dataRegistro: todayStr, turno: 'Matutino', hora: '07:15' },
      { id: 'l2', alunoNome: 'Enzo Gabriel Silva', escola: 'E. M. Dorcelina Folador', tipoMovimento: 'IDA', status: 'AUSENTE', dataRegistro: todayStr, turno: 'Matutino', hora: '07:18' },
      { id: 'l3', alunoNome: 'Ana Beatriz Silveira', escola: 'E. M. Dorcelina Folador', tipoMovimento: 'IDA', status: 'PRESENTE', dataRegistro: todayStr, turno: 'Matutino', hora: '07:20' },
      { id: 'l4', alunoNome: 'João Pedro Santos', escola: 'Colégio Estadual Olímpia', tipoMovimento: 'VOLTA', status: 'PRESENTE', dataRegistro: yesterdayStr, turno: 'Vespertino', hora: '12:45' },
      { id: 'l5', alunoNome: 'Júlia Nogueira Melo', escola: 'Colégio Estadual Olímpia', tipoMovimento: 'VOLTA', status: 'AUSENTE', dataRegistro: yesterdayStr, turno: 'Vespertino', hora: '12:48' }
    ];
  }

  return (
    <div className="space-y-8 bg-slate-50 min-h-screen p-1 sm:p-4">
      <AutoRefresh intervalMs={10000} />

      {/* 🚨 Alertas Operacionais Ativos (SOS, Mecânico, Vias) 🚨 */}
      {alertasAtivos && alertasAtivos.length > 0 && (
        <div className="space-y-3">
          {alertasAtivos.map((alert: any) => {
            const isSos = alert.titulo.includes('SOS') || alert.titulo.includes('EMERGÊNCIA');
            const isMecanico = alert.titulo.includes('Mecânica');
            
            let bgClass = 'bg-blue-50 border-blue-200 text-blue-800';
            let iconBgClass = 'bg-blue-500 text-white';
            let btnClass = 'bg-blue-600 hover:bg-blue-500 text-white';
            let Icon = Map;
            
            if (isSos) {
              bgClass = 'bg-rose-50 border-rose-200 text-rose-800 animate-pulse';
              iconBgClass = 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)]';
              btnClass = 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_4px_12px_rgba(225,29,72,0.3)]';
              Icon = AlertOctagon;
            } else if (isMecanico) {
              bgClass = 'bg-amber-50 border-amber-250 text-amber-900';
              iconBgClass = 'bg-amber-500 text-slate-950';
              btnClass = 'bg-amber-600 hover:bg-amber-500 text-white';
              Icon = Wrench;
            }

            return (
              <div 
                key={alert.id}
                className={`border rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md ${bgClass}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBgClass}`}>
                    <Icon size={24} className={isSos ? 'animate-bounce' : ''} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                      {alert.titulo}
                      {!isSos && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />}
                    </h3>
                    <p className="text-xs font-semibold mt-1">
                      {alert.mensagem}
                    </p>
                  </div>
                </div>
                <Link 
                  href="/dashboard/admin/ocorrencias"
                  className={`w-full sm:w-auto px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:-translate-y-0.5 text-center cursor-pointer border-0 shrink-0 text-decoration-none ${btnClass}`}
                >
                  VER DETALHES
                </Link>
              </div>
            );
          })}
        </div>
      )}
      
      {/* ── Cabeçalho do Dashboard ── */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Monitoramento Operacional
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Painel administrativo da Secretaria Municipal de Educação (SEMED) · Arapongas - PR
          </p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full shadow-sm w-fit self-start md:self-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Dados Sincronizados
        </span>
      </div>

      {/* ── Grid de 4 Mini-Cards Modernos (Métricas) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" aria-label="Métricas Principais">
        
        {/* Solicitações Pendentes */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Solicitações Pendentes
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-950 block tracking-tight font-mono">
              {solicitacoesPendentes}
            </span>
            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 w-fit block">
              Pendente de auditoria
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500 border border-amber-100/50">
            <FileText size={22} />
          </div>
        </div>

        {/* Ônibus em Rota */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Ônibus em Rota
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-950 block tracking-tight font-mono">
              {rotasAtivasCount}<span className="text-slate-400 text-base font-normal">/{totalVeiculos}</span>
            </span>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 w-fit block">
              Veículos em trânsito
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100/50">
            <Bus size={22} />
          </div>
        </div>

        {/* Alunos Transportados Hoje */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Alunos Transportados Hoje
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-950 block tracking-tight font-mono">
              {totalAlunos.toLocaleString('pt-BR')}
            </span>
            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 w-fit block">
              Alunos atendidos
            </span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100/50">
            <Users size={22} />
          </div>
        </div>

        {/* Alertas de Ocorrência */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Alertas de Ocorrência
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 block tracking-tight font-mono animate-pulse">
              {alertasOcorrencia}
            </span>
            <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 w-fit block">
              Casos urgentes
            </span>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600 border border-rose-100/50">
            <AlertTriangle size={22} />
          </div>
        </div>

      </section>

      {/* ── Layout Central em Duas Colunas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna da Esquerda (Mais larga) - Monitoramento de Rotas */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Navigation size={15} className="text-amber-500" />
                  Monitoramento de Rotas Ativas
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Itinerários ativos no município de Arapongas e última atualização de frota.
                </p>
              </div>
              <Link 
                href="/dashboard/admin/rotas" 
                className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200/50 transition-colors flex items-center gap-1"
              >
                <span>Ver todas</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Nome da Linha</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Motorista</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Placa</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Status</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-right">Última Sincronização</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rotasAtivas.map((rota) => (
                    <tr key={rota.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{rota.linha}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">{rota.motorista}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono font-medium">{rota.placa}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          rota.status === 'Em Rota'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${rota.status === 'Em Rota' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          {rota.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-right font-medium">{rota.ultimaSincronizacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginação da Tabela */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium gap-3">
            <span>Visualizando 5 de 38 rotas de transporte escolar</span>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-50 transition-colors cursor-pointer" disabled>
                <ChevronLeft size={14} />
              </button>
              <span className="font-bold text-slate-700">1</span>
              <span className="text-slate-300">/</span>
              <span>8</span>
              <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Coluna da Direita (Mais estreita) - Solicitações */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck size={15} className="text-amber-500" />
                  Últimas Solicitações
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Pedidos recentes de liberação de carteirinhas.
                </p>
              </div>
              <Link 
                href="/dashboard/admin/documentos" 
                className="text-[10px] font-bold text-amber-500 hover:text-amber-600 transition-colors"
              >
                Analisar
              </Link>
            </div>

            <div className="flex flex-col gap-3.5">
              {ultimasSolicitacoes.map((sol) => (
                <div key={sol.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50 transition-colors">
                  
                  {/* Avatar Circular */}
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm flex items-center justify-center relative bg-slate-100">
                    {sol.fotoUrl ? (
                      <img 
                        src={sol.fotoUrl} 
                        alt={sol.aluno} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className={`w-full h-full ${sol.avatarColor} text-white flex items-center justify-center font-bold text-xs`}>
                        {sol.iniciais}
                      </div>
                    )}
                  </div>

                  {/* Detalhes do Aluno */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">{sol.aluno}</h4>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">{sol.escola}</span>
                  </div>

                  {/* Badge Elegante de Status */}
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    sol.status === 'Aprovado' 
                      ? 'bg-emerald-100 border-emerald-250 text-emerald-700'
                      : sol.status === 'Aguardando Análise'
                      ? 'bg-amber-100 border-amber-250 text-amber-700'
                      : 'bg-rose-100 border-rose-250 text-rose-700'
                  }`}>
                    {sol.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link 
              href="/dashboard/admin/alunos" 
              className="text-xs font-extrabold text-slate-900 hover:text-slate-700 inline-flex items-center gap-1"
            >
              <span>Gerenciar Alunos</span>
              <ArrowUpRight size={14} className="text-amber-500" />
            </Link>
          </div>
        </div>

        {/* Histórico Recente de Embarque (Auditoria) */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Auditoria de Embarque Diário (logs_embarque)
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Registro retroativo consolidado do checklist dos motoristas (IDA/VOLTA).
              </p>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">
              Atualização Automática
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Estudante</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Escola</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Viagem / Turno</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Data do Registro</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Horário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logsEmbarqueRecentes.map((log: any) => {
                  const isPresente = log.status === 'PRESENTE';
                  let dateFormatted = log.dataRegistro;
                  if (dateFormatted.includes('-')) {
                    const parts = dateFormatted.split('-');
                    dateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
                  }
                  
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{log.alunoNome}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-semibold">{log.escola}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase">
                          {log.tipoMovimento} · {log.turno}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">{dateFormatted}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isPresente
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${isPresente ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {isPresente ? 'Compareceu' : 'Faltou'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-right font-medium">{log.hora}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
