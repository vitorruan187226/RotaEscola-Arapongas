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
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import LogoutButton from '../../../components/LogoutButton';

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

export default async function SecretariaDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // Fallbacks de banco para Arapongas
  let totalAlunos = 5840;
  let totalVeiculos = 102;
  let solicitacoesPendentes = 34;
  let alertasOcorrencia = 2;

  try {
    const [
      { count: alunosCount },
      { count: veiculosCount },
    ] = await Promise.all([
      supabase.from('alunos').select('*', { count: 'exact', head: true }),
      supabase.from('veiculos').select('*', { count: 'exact', head: true }),
    ]);

    if (alunosCount !== null) totalAlunos = alunosCount;
    if (veiculosCount !== null) totalVeiculos = veiculosCount;
  } catch (e) {
    // Fallback silencioso em ambiente local
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      
      {/* Barra de Navegação Superior (Navbar) */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-4 border-amber-500 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white leading-none">
              Painel Secretaria
            </h1>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block mt-1">
              Prefeitura de Arapongas · SEMED
            </span>
          </div>
        </div>

        <LogoutButton 
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
          iconSize={14}
        />
      </header>

      {/* Conteúdo do Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Titulo da Sessão */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Monitoramento Operacional
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Controle diário de embarques, veículos ativos e documentos cadastrais da SEMED.
            </p>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full shadow-sm w-fit">
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
                87<span className="text-slate-400 text-base font-normal">/{totalVeiculos}</span>
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
                5.840
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
                    {ROTAS_ATIVAS_MOCK.map((rota) => (
                      <tr key={rota.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{rota.linha}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-semibold">{rota.motorista}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono font-medium">{rota.placa}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            rota.status === 'In Transit'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${rota.status === 'In Transit' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            {rota.status === 'In Transit' ? 'In Transit' : 'Stopped'}
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
                    <FileText size={15} className="text-amber-500" />
                    Últimas Solicitações
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Pedidos recentes de liberação de carteirinhas.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3.5">
                {SOLICITACOES_MOCK.map((sol) => (
                  <div key={sol.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50 transition-colors">
                    
                    {/* Avatar Circular */}
                    <div className={`w-8 h-8 rounded-full ${sol.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}>
                      {sol.iniciais}
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
                href="/dashboard/admin/documentos" 
                className="text-xs font-extrabold text-slate-900 hover:text-slate-700 inline-flex items-center gap-1"
              >
                <span>Auditar Documentações</span>
                <ArrowUpRight size={14} className="text-amber-500" />
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
