'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  UserCheck, 
  UserX, 
  BarChart3, 
  Award,
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';
import { createClient } from '../../../../utils/supabase/client';
import SkeletonLoader from '../../../../components/SkeletonLoader';

interface MetricsData {
  total_alunos: number;
  presencas_hoje: number;
  faltas_hoje: number;
  alunos_por_escola: Array<{ escola: string; total: number }>;
  alunos_por_rota: Array<{ rota: string; total: number }>;
  alunos_por_turno: Array<{ turno: string; total: number }>;
  mais_assiduos: Array<{ nome: string; escola: string; total_presencas: number }>;
  mais_faltosos: Array<{ nome: string; escola: string; total_faltas: number }>;
}

const INITIAL_METRICS: MetricsData = {
  total_alunos: 0,
  presencas_hoje: 0,
  faltas_hoje: 0,
  alunos_por_escola: [],
  alunos_por_rota: [],
  alunos_por_turno: [],
  mais_assiduos: [],
  mais_faltosos: []
};

export default function AlunosPage() {
  const supabase = createClient();
  const [metrics, setMetrics] = useState<MetricsData>(INITIAL_METRICS);
  const [loading, setLoading] = useState(true);
  const [escolaFilter, setEscolaFilter] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_dashboard_metrics');
      if (error) {
        console.warn('RPC get_dashboard_metrics falhou. Executando fallback em JS local...', error.message);
        await fetchMetricsFallback();
      } else if (data) {
        const metricsData = data as MetricsData;
        // Se a RPC retornar dados mas a lista de mais faltosos for muito pequena (<= 1 item)
        // enquanto existem outros registros no banco de dados, ou para garantir resiliência contra
        // RPC desatualizada no Supabase, executamos o fallback local para precisão completa.
        if (!metricsData.mais_faltosos || metricsData.mais_faltosos.length <= 1) {
          console.warn('RPC get_dashboard_metrics retornou dados incompletos de faltas. Executando fallback local...');
          await fetchMetricsFallback();
        } else {
          setMetrics(metricsData);
        }
      } else {
        await fetchMetricsFallback();
      }
    } catch (err) {
      console.warn('Erro ao chamar RPC. Executando fallback em JS local...', err);
      await fetchMetricsFallback();
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetricsFallback() {
    try {
      // 1. Buscar todos os alunos
      const { data: dbAlunos, error: errAlunos } = await supabase
        .from('alunos')
        .select('id, nome, escola, turno, rota_id');

      if (errAlunos) throw errAlunos;
      const Alunos = dbAlunos || [];

      // 2. Buscar todas as rotas
      const { data: dbRotas } = await supabase
        .from('rotas')
        .select('id, codigo, nome');

      const Rotas = dbRotas || [];

      // 3. Buscar logs de embarque de hoje e histórico
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      const { data: dbLogsToday } = await supabase
        .from('logs_embarque')
        .select('aluno_id, data_registro, status')
        .eq('data_registro', todayStr);

      const LogsToday = dbLogsToday || [];

      // Histórico de logs para os mais assíduos
      const { data: dbAllLogs } = await supabase
        .from('logs_embarque')
        .select('aluno_id, status')
        .eq('status', 'PRESENTE')
        .limit(2000);

      const AllLogs = dbAllLogs || [];

      // 4. Buscar presenças diárias (faltas) de hoje e histórico
      const { data: dbFaltasToday } = await supabase
        .from('presencas_diarias')
        .select('aluno_id, compareceu, data_presenca')
        .eq('data_presenca', todayStr)
        .eq('compareceu', false);

      const FaltasToday = dbFaltasToday || [];

      // Histórico de faltas para os mais faltosos
      const { data: dbAllAbsences } = await supabase
        .from('presencas_diarias')
        .select('aluno_id, compareceu, data_presenca')
        .eq('compareceu', false)
        .limit(2000);

      const AllAbsences = dbAllAbsences || [];

      // Buscar também ausências registradas por motoristas (status = 'AUSENTE')
      const { data: dbAllDriverAbsences } = await supabase
        .from('logs_embarque')
        .select('aluno_id, data_registro')
        .eq('status', 'AUSENTE')
        .limit(2000);

      const AllDriverAbsences = dbAllDriverAbsences || [];

      // 5. Agregações locais
      const total_alunos = Alunos.length;

      // Alunos por escola (ranking)
      const escolaMap: Record<string, number> = {};
      Alunos.forEach(a => {
        if (a.escola) {
          escolaMap[a.escola] = (escolaMap[a.escola] || 0) + 1;
        }
      });
      const alunos_por_escola = Object.entries(escolaMap)
        .map(([escola, total]) => ({ escola, total }))
        .sort((a, b) => b.total - a.total);

      // Alunos por turno
      const turnoMap: Record<string, number> = {};
      Alunos.forEach(a => {
        const tRaw = a.turno || 'Manhã';
        let t = tRaw;
        if (tRaw.toLowerCase().includes('manhã') || tRaw.toLowerCase() === 'manha') t = 'Manhã';
        else if (tRaw.toLowerCase().includes('tarde')) t = 'Tarde';
        else if (tRaw.toLowerCase().includes('noite')) t = 'Noite';
        turnoMap[t] = (turnoMap[t] || 0) + 1;
      });
      const alunos_por_turno = Object.entries(turnoMap)
        .map(([turno, total]) => ({ turno, total }))
        .sort((a, b) => b.total - a.total);

      // Alunos por rota
      const rotasMap: Record<string, string> = {};
      Rotas.forEach(r => {
        rotasMap[r.id] = r.codigo ? `${r.codigo} — ${r.nome}` : r.nome;
      });
      const alunosRotaMap: Record<string, number> = {};
      Alunos.forEach(a => {
        const rotaName = a.rota_id ? (rotasMap[a.rota_id] || a.rota_id) : 'Sem Rota';
        alunosRotaMap[rotaName] = (alunosRotaMap[rotaName] || 0) + 1;
      });
      const alunos_por_rota = Object.entries(alunosRotaMap)
        .map(([rota, total]) => ({ rota, total }))
        .sort((a, b) => b.total - a.total);

      // Presenças hoje (filtrando apenas status PRESENTE)
      const uniquePresencasToday = new Set(
        LogsToday
          .filter(l => l.status === 'PRESENTE')
          .map(l => l.aluno_id)
      );
      const presencasHoje = uniquePresencasToday.size;

      // Faltas hoje (driver marked absent today OR parent notified absent today)
      const uniqueFaltasToday = new Set([
        ...LogsToday.filter(l => l.status === 'AUSENTE').map(l => l.aluno_id),
        ...FaltasToday.map(p => p.aluno_id)
      ]);
      const faltasHoje = uniqueFaltasToday.size;

      // Alunos mapeados por id para nomes e escolas
      const alunosLookup: Record<string, { nome: string; escola: string }> = {};
      Alunos.forEach(a => {
        alunosLookup[a.id] = { nome: a.nome, escola: a.escola };
      });

      // Mais assíduos
      const logsCountMap: Record<string, number> = {};
      AllLogs.forEach(l => {
        if (l.aluno_id) {
          logsCountMap[l.aluno_id] = (logsCountMap[l.aluno_id] || 0) + 1;
        }
      });
      const mais_assiduos = Object.entries(logsCountMap)
        .map(([alunoId, total]) => {
          const a = alunosLookup[alunoId];
          return {
            nome: a ? a.nome : 'Estudante',
            escola: a ? a.escola : 'Escola',
            total_presencas: total
          };
        })
        .sort((a, b) => b.total_presencas - a.total_presencas)
        .slice(0, 5);

      // Mais faltosos (combinando logs_embarque status AUSENTE e presencas_diarias compareceu false por dia)
      const faltasCountMap: Record<string, Set<string>> = {}; // alunoId -> Set de datas
      AllAbsences.forEach(p => {
        if (p.aluno_id) {
          const date = p.data_presenca || todayStr;
          if (!faltasCountMap[p.aluno_id]) {
            faltasCountMap[p.aluno_id] = new Set();
          }
          faltasCountMap[p.aluno_id].add(date);
        }
      });
      AllDriverAbsences.forEach(l => {
        if (l.aluno_id) {
          const date = l.data_registro || todayStr;
          if (!faltasCountMap[l.aluno_id]) {
            faltasCountMap[l.aluno_id] = new Set();
          }
          faltasCountMap[l.aluno_id].add(date);
        }
      });

      const mais_faltosos = Object.entries(faltasCountMap)
        .map(([alunoId, datesSet]) => {
          const a = alunosLookup[alunoId];
          return {
            nome: a ? a.nome : 'Estudante',
            escola: a ? a.escola : 'Escola',
            total_faltas: datesSet.size
          };
        })
        .sort((a, b) => b.total_faltas - a.total_faltas)
        .slice(0, 5);

      setMetrics({
        total_alunos,
        presencas_hoje: presencasHoje,
        faltas_hoje: faltasHoje,
        alunos_por_escola,
        alunos_por_rota,
        alunos_por_turno,
        mais_assiduos,
        mais_faltosos
      });
    } catch (err) {
      console.error('Erro no fallback local de métricas:', err);
      setMetrics(INITIAL_METRICS);
    }
  }

  // Filtragem local baseada na busca por escola
  const filteredEscolas = (metrics?.alunos_por_escola || []).filter(e =>
    e.escola.toLowerCase().includes(escolaFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 relative font-sans animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="text-amber-500" size={24} />
            <span>Painel de Relatórios e Métricas</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Consolidado estratégico da assiduidade e logística do transporte escolar municipal de Arapongas.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMetrics}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all active-press bg-white shadow-sm"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Alunos */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 shadow-sm border border-slate-800 flex items-center justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-out">
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total de Estudantes</span>
            {loading ? (
              <SkeletonLoader variant="rect" className="h-8 w-20 bg-slate-800 rounded-lg mt-1" />
            ) : (
              <span className="text-3xl font-black">{metrics.total_alunos}</span>
            )}
            <span className="text-[10px] text-slate-550 font-bold">Cadastros ativos no transporte</span>
          </div>
          <div className="p-4 bg-slate-800/40 rounded-2xl z-10">
            <Users size={24} className="text-amber-400" />
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-500" />
        </div>

        {/* Presenças de Hoje */}
        <div className="bg-white border rounded-3xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-out">
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-450">Presentes Hoje (Check-in)</span>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <SkeletonLoader variant="rect" className="h-8 w-20 rounded-lg mt-1" />
              ) : (
                <>
                  <span className="text-3xl font-black text-slate-900">{metrics.presencas_hoje}</span>
                  {metrics.total_alunos > 0 && (
                    <span className="text-xs text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      {Math.round((metrics.presencas_hoje / metrics.total_alunos) * 100)}%
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-650 font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Embarques detectados hoje</span>
            </div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-2xl z-10 border border-emerald-100/50">
            <UserCheck size={24} className="text-emerald-600" />
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500" />
        </div>

        {/* Ausências de Hoje */}
        <div className="bg-white border rounded-3xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-out">
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-450">Ausências Informadas</span>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <SkeletonLoader variant="rect" className="h-8 w-20 rounded-lg mt-1" />
              ) : (
                <>
                  <span className="text-3xl font-black text-slate-900">{metrics.faltas_hoje}</span>
                  {metrics.total_alunos > 0 && (
                    <span className="text-xs text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded-md">
                      {Math.round((metrics.faltas_hoje / metrics.total_alunos) * 100)}%
                    </span>
                  )}
                </>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-bold">Faltas justificadas pelos responsáveis</span>
          </div>
          <div className="p-4 bg-rose-50 rounded-2xl z-10 border border-rose-100/50">
            <UserX size={24} className="text-rose-600" />
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all duration-500" />
        </div>
      </div>

      {/* Main Stats Area: Schools Ranking & Rotas Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Escola Ranking */}
        <div className="bg-white border rounded-3xl p-5 shadow-sm flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
              <Building2 size={15} className="text-amber-500" />
              <span>Estudantes por Unidade de Ensino</span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Filtrar escola..."
                value={escolaFilter}
                onChange={(e) => setEscolaFilter(e.target.value)}
                className="pl-7 pr-3 py-1 rounded-xl border text-[10px] font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-all w-36"
              />
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="flex flex-col gap-4 py-2">
            {loading ? (
              <SkeletonLoader variant="list" count={4} className="h-10 w-full rounded-2xl" />
            ) : filteredEscolas.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">Nenhuma escola corresponde ao filtro.</p>
            ) : (
              filteredEscolas.map((item, idx) => {
                const totalAlunosRede = metrics.total_alunos || 1;
                const percentage = Math.round((item.total / totalAlunosRede) * 100);
                
                // Color badges for top ranks
                const isTop1 = idx === 0;
                const isTop2 = idx === 1;
                const isTop3 = idx === 2;

                return (
                  <div key={item.escola} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-900 truncate">
                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-black text-white shrink-0 ${
                          isTop1 ? 'bg-amber-500 animate-bounce' : isTop2 ? 'bg-slate-400' : isTop3 ? 'bg-amber-600' : 'bg-slate-300'
                        }`}>
                          {idx + 1}º
                        </span>
                        <span className="truncate max-w-[200px] sm:max-w-xs" title={item.escola}>{item.escola}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 font-extrabold">
                        <span className="text-slate-500">{item.total} alunos</span>
                        <span className="text-amber-550 bg-amber-50 px-1.5 py-0.2 rounded">{percentage}%</span>
                      </div>
                    </div>
                    {/* Horizontal Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          isTop1 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-slate-400'
                        }`} 
                        style={{ width: `${Math.max(percentage, 3)}%` }} 
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Turnos & Rotas */}
        <div className="flex flex-col gap-6">
          
          {/* Turnos */}
          <div className="bg-white border rounded-3xl p-5 shadow-sm flex flex-col gap-4 flex-1">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b">
              <Clock size={15} className="text-amber-500" />
              <span>Distribuição por Turno</span>
            </div>

            <div className="flex flex-col justify-center gap-3.5 py-2">
              {loading ? (
                <SkeletonLoader variant="text" count={3} className="h-5 w-full rounded" />
              ) : (
                metrics.alunos_por_turno.map((item) => {
                  const total = metrics.total_alunos || 1;
                  const percentage = Math.round((item.total / total) * 100);
                  const isManha = item.turno.toLowerCase().includes('manhã') || item.turno.toLowerCase() === 'manha';
                  const isTarde = item.turno.toLowerCase().includes('tarde');

                  return (
                    <div key={item.turno} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-700">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          isManha ? 'bg-amber-450' : isTarde ? 'bg-blue-400' : 'bg-indigo-700'
                        }`} />
                        <span>{item.turno}</span>
                      </div>
                      <div className="flex items-center gap-2 font-black">
                        <span className="text-slate-800">{item.total}</span>
                        <span className="text-slate-400 font-medium">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Passageiros por Rota */}
          <div className="bg-white border rounded-3xl p-5 shadow-sm flex flex-col gap-4 flex-1">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b">
              <BarChart3 size={15} className="text-amber-500" />
              <span>Volume por Rota Ativa</span>
            </div>

            <div className="flex flex-col gap-3.5 py-2 overflow-y-auto max-h-[180px] scrollbar-thin">
              {loading ? (
                <SkeletonLoader variant="text" count={4} className="h-5 w-full rounded" />
              ) : metrics.alunos_por_rota.length === 0 ? (
                <p className="text-xs text-slate-400 text-center">Nenhuma rota ativa.</p>
              ) : (
                metrics.alunos_por_rota.map((item) => (
                  <div key={item.rota} className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 truncate max-w-[160px]" title={item.rota}>{item.rota}</span>
                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md text-[10px] shrink-0">
                      {item.total} passageiros
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Assiduidade & Absenteísmo Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Mais Assiduos */}
        <div className="bg-white border rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b">
            <Award size={15} className="text-emerald-600" />
            <span>Top 5 Alunos Mais Assíduos</span>
          </div>

          <div className="flex flex-col gap-3 py-1">
            {loading ? (
              <SkeletonLoader variant="list" count={5} className="h-12 w-full rounded-xl" />
            ) : metrics.mais_assiduos.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Sem registros de embarque disponíveis.</p>
            ) : (
              metrics.mais_assiduos.map((item, idx) => (
                <div key={`${item.nome}-${idx}`} className="flex items-center justify-between gap-3 text-xs p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-sm active-press transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-emerald-700 bg-emerald-50 w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-black shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.nome}</p>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">{item.escola}</p>
                    </div>
                  </div>
                  <span className="text-emerald-700 bg-emerald-100/60 text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0">
                    {item.total_presencas} check-ins
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mais Faltosos */}
        <div className="bg-white border rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b">
            <AlertCircle size={15} className="text-rose-600" />
            <span>Top 5 Alunos com Mais Faltas</span>
          </div>

          <div className="flex flex-col gap-3 py-1">
            {loading ? (
              <SkeletonLoader variant="list" count={5} className="h-12 w-full rounded-xl" />
            ) : metrics.mais_faltosos.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Sem registros de faltas disponíveis.</p>
            ) : (
              metrics.mais_faltosos.map((item, idx) => (
                <div key={`${item.nome}-${idx}`} className="flex items-center justify-between gap-3 text-xs p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-sm active-press transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-rose-700 bg-rose-50 w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-black shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.nome}</p>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">{item.escola}</p>
                    </div>
                  </div>
                  <span className="text-rose-750 bg-rose-100/60 text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0">
                    {item.total_faltas} faltas
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
