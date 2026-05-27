import { cookies } from 'next/headers';
import { createClient as createServerClient } from '../../../utils/supabase/server';
import { 
  Users, 
  Bus, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  ArrowUpRight, 
  MapPin, 
  FileText,
  AlertOctagon,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// ─── Interfaces de Dados ──────────────────────────────────────────────────
interface RotaAtiva {
  id: number;
  linha: string;
  motorista: string;
  placa: string;
  status: 'Em movimento' | 'Parado';
  ultimaSincronizacao: string;
}

interface SolicitacaoCarteirinha {
  id: number;
  aluno: string;
  escola: string;
  status: 'Aguardando Análise' | 'Documento Inválido';
  avatarColor: string;
  iniciais: string;
}

// ─── Dados Simulados (Mocks de Fallback) ──────────────────────────────────
const ROTAS_ATIVAS_MOCK: RotaAtiva[] = [
  { id: 1, linha: 'Rota 04 — Zona Rural', motorista: 'Carlos Alberto Silva', placa: 'BBB-5678', status: 'Em movimento', ultimaSincronizacao: '16:12' },
  { id: 2, linha: 'Rota 07 — Região Norte', motorista: 'Marcos Vinícius Souza', placa: 'AAA-1234', status: 'Em movimento', ultimaSincronizacao: '16:11' },
  { id: 3, linha: 'Rota 22 — Centro', motorista: 'Ana Julia Santos', placa: 'CCC-9012', status: 'Parado', ultimaSincronizacao: '16:05' },
  { id: 4, linha: 'Rota 14 — Zona Sul', motorista: 'Roberto Ferreira', placa: 'DDD-3456', status: 'Em movimento', ultimaSincronizacao: '16:10' },
  { id: 5, linha: 'Rota 19 — Leste', motorista: 'Sandra Aparecida Lima', placa: 'EEE-7890', status: 'Parado', ultimaSincronizacao: '15:58' }
];

const SOLICITACOES_MOCK: SolicitacaoCarteirinha[] = [
  { id: 1, aluno: 'Pedro Henrique Silva', escola: 'E. M. Codorna', status: 'Aguardando Análise', avatarColor: 'bg-indigo-650', iniciais: 'PS' },
  { id: 2, aluno: 'Sophia Moraes Dias', escola: 'C. E. Julia Wanderley', status: 'Documento Inválido', avatarColor: 'bg-emerald-650', iniciais: 'SD' },
  { id: 3, aluno: 'Guilherme Augusto Nogueira', escola: 'E. M. Dorcelina Folador', status: 'Aguardando Análise', avatarColor: 'bg-amber-600', iniciais: 'GN' },
  { id: 4, aluno: 'Beatriz Martins Souza', escola: 'C. E. Julia Wanderley', status: 'Documento Inválido', avatarColor: 'bg-rose-600', iniciais: 'BS' }
];

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // KPIs dinâmicos buscando da nuvem se disponível
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
    console.log('Utilizando fallbacks mockados para métricas do dashboard admin');
  }

  return (
    <div className="space-y-8 bg-slate-50 min-h-screen p-1 sm:p-4">
      {/* ── Cabeçalho do Dashboard ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Visão Geral do Transporte Escolar
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Painel administrativo da Secretaria Municipal de Educação (SEMED) · Arapongas - PR
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Dados em Tempo Real
          </span>
        </div>
      </div>

      {/* ── Grade de 4 Mini-Cards Modernos (KPIs) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" aria-label="Métricas Principais">
        
        {/* Solicitações Pendentes */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Solicitações Pendentes
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 block tracking-tight font-mono">
              {solicitacoesPendentes}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">Aguardando verificação</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500 border border-amber-100/50">
            <FileCheck size={22} />
          </div>
        </div>

        {/* Ônibus em Rota */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Ônibus em Rota
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 block tracking-tight font-mono">
              87<span className="text-slate-400 text-base font-normal">/{totalVeiculos}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">Veículos em operação ativa</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100/50">
            <Bus size={22} />
          </div>
        </div>

        {/* Alunos Transportados */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Alunos Transportados
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block tracking-tight font-mono">
              {totalAlunos.toLocaleString('pt-BR')}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">Cadastros ativos no município</span>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-800 border border-slate-200/20">
            <Users size={22} />
          </div>
        </div>

        {/* Alertas de Ocorrência */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Alertas de Ocorrência
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 block tracking-tight font-mono animate-pulse">
              {alertasOcorrencia}
            </span>
            <span className="text-[10px] text-rose-500 font-bold block">Incidentes reportados hoje</span>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600 border border-rose-100/50">
            <AlertTriangle size={22} />
          </div>
        </div>

      </section>

      {/* ── Área Central em Duas Colunas (Tabelas e Widgets) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna da Esquerda (Mais larga - Tabela de Monitoramento) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} className="text-amber-500" />
                  Monitoramento de Rotas Ativas
                </h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Posicionamento e status de sincronização dos veículos em serviço.
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
                  <tr className="border-b border-slate-100">
                    <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider">Linha</th>
                    <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider">Motorista</th>
                    <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider">Placa</th>
                    <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-right">Última Sinc.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ROTAS_ATIVAS_MOCK.map((rota) => (
                    <tr key={rota.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{rota.linha}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">{rota.motorista}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono font-medium">{rota.placa}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          rota.status === 'Em movimento' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${rota.status === 'Em movimento' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
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

          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-medium gap-2">
            <span>Mostrando 5 de 38 rotas registradas em Arapongas.</span>
            <span className="flex items-center gap-1 text-slate-500 font-bold uppercase text-[9px] tracking-wider bg-slate-100 px-2 py-0.5 rounded">
              Arapongas SEMED
            </span>
          </div>
        </div>

        {/* Coluna da Direita (Mais estreita - Solicitações) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck size={16} className="text-amber-500" />
                  Solicitações
                </h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Últimos cadastros de carteirinha.
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
              {SOLICITACOES_MOCK.map((sol) => (
                <div key={sol.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50 transition-colors">
                  {/* Avatar Circular */}
                  <div className={`w-8 h-8 rounded-full ${sol.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}>
                    {sol.iniciais}
                  </div>

                  {/* Informações do Estudante */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{sol.aluno}</h4>
                    <span className="text-[10px] text-slate-400 block truncate font-medium mt-0.5">{sol.escola}</span>
                  </div>

                  {/* Badge de Status */}
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    sol.status === 'Aguardando Análise' 
                      ? 'bg-amber-50 border-amber-200 text-amber-700' 
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    {sol.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <Link 
              href="/dashboard/admin/alunos" 
              className="text-xs font-extrabold text-slate-900 hover:text-slate-700 inline-flex items-center gap-1"
            >
              <span>Gerenciar Alunos</span>
              <ArrowUpRight size={14} className="text-amber-500" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
