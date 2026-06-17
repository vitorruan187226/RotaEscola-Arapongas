'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileCheck, 
  CheckCircle, 
  XCircle, 
  Eye, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Download,
  Clock,
  AlertTriangle,
  Send,
  ArrowLeft,
  Search,
  Sparkles
} from 'lucide-react';
import { createClient } from '../../../../utils/supabase/client';

interface AlunoAnalise {
  id: string;
  nome: string;
  escola: string;
  escola_id?: string;
  ano_serie?: string;
  turma?: string;
  periodo?: 'manha' | 'tarde' | 'noite';
  status: 'aguardando' | 'aprovado' | 'rejeitado' | 'pendente_correcao';
  observacao_secretaria?: string | null;
  enviadoEm: string;
  fotoUrl?: string | null;
}

interface DocumentoAnexo {
  tipo: string;
  url: string;
}

export default function DocumentosPage() {
  const router = useRouter();
  const supabase = createClient();

  const [alunos, setAlunos] = useState<AlunoAnalise[]>([]);
  const [loading, setLoading] = useState(true);
  const [usandoMock, setUsandoMock] = useState(false);

  // Estados de Filtros e Busca
  const [activeTab, setActiveTab] = useState<'pendentes' | 'aprovados' | 'rejeitados'>('pendentes');
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [escolas, setEscolas] = useState<any[]>([]);

  // Modais e Lógica de Aprovação/Rejeição
  const [selectedAluno, setSelectedAluno] = useState<AlunoAnalise | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoAnexo[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [rotas, setRotas] = useState<any[]>([]);
  const [alunoParaAprovar, setAlunoParaAprovar] = useState<AlunoAnalise | null>(null);
  const [selectedRotaId, setSelectedRotaId] = useState<string>('');

  const [showCorrectionInput, setShowCorrectionInput] = useState(false);
  const [correctionText, setCorrectionText] = useState('');

  // Contadores globais
  const [stats, setStats] = useState({ pendentes: 0, aprovados: 0, rejeitados: 0 });
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadEscolas();
    loadRotas();
  }, []);

  // Recarregar alunos quando a aba mudar
  useEffect(() => {
    loadAlunosPorFiltro();
  }, [activeTab]);

  async function loadEscolas() {
    try {
      const { data, error } = await supabase
        .from('escolas')
        .select('id, nome')
        .order('nome', { ascending: true });
      if (!error && data) {
        setEscolas(data);
      } else {
        setEscolas([
          { id: 'b73e2840-7288-4682-9642-17cb25e36001', nome: 'Escola Municipal Dorcelina Folador' },
          { id: 'b73e2840-7288-4682-9642-17cb25e36002', nome: 'Colégio Estadual Julia Wanderley' },
          { id: 'b73e2840-7288-4682-9642-17cb25e36003', nome: 'Escola Municipal Codorna' }
        ]);
      }
    } catch {
      setEscolas([
        { id: 'b73e2840-7288-4682-9642-17cb25e36001', nome: 'Escola Municipal Dorcelina Folador' },
        { id: 'b73e2840-7288-4682-9642-17cb25e36002', nome: 'Colégio Estadual Julia Wanderley' },
        { id: 'b73e2840-7288-4682-9642-17cb25e36003', nome: 'Escola Municipal Codorna' }
      ]);
    }
  }

  async function loadRotas() {
    try {
      const { data, error } = await supabase
        .from('rotas')
        .select('id, codigo, nome');
      if (!error && data) {
        const rotasComStatus = data.map((r: any) => ({ ...r, status: r.status ?? 'Ativo' }));
        setRotas(rotasComStatus.filter((r: any) => r.status === 'Ativo'));
      } else {
        setRotas([
          { id: '9d0f2832-7288-4682-9642-17cb25e36928', codigo: 'RT-04', nome: 'Rota 04 — Zona Rural', status: 'Ativo' },
          { id: '8a723821-3928-4444-9123-ab39d1b0d777', codigo: 'RT-04-T', nome: 'Rota 04 — Zona Rural (Tarde)', status: 'Ativo' },
          { id: 'rota-mock-3', codigo: 'RT-22', nome: 'Rota 22 — Centro', status: 'Ativo' },
        ]);
      }
    } catch {
      setRotas([
        { id: '9d0f2832-7288-4682-9642-17cb25e36928', codigo: 'RT-04', nome: 'Rota 04 — Zona Rural', status: 'Ativo' },
        { id: '8a723821-3928-4444-9123-ab39d1b0d777', codigo: 'RT-04-T', nome: 'Rota 04 — Zona Rural (Tarde)', status: 'Ativo' },
        { id: 'rota-mock-3', codigo: 'RT-22', nome: 'Rota 22 — Centro', status: 'Ativo' },
      ]);
    }
  }

  async function loadAlunosPorFiltro() {
    setLoading(true);
    try {
      let query = supabase
        .from('alunos')
        .select('id, nome, escola, escola_id, ano_serie, turma, periodo, status, status_carteirinha, observacao_secretaria, criado_em, foto_url');
      
      if (activeTab === 'pendentes') {
        query = query.eq('status', 'aguardando');
      } else if (activeTab === 'aprovados') {
        query = query.eq('status', 'aprovado');
      } else {
        query = query.in('status', ['rejeitado', 'pendente_correcao']);
      }

      const { data, error } = await query.order('criado_em', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: AlunoAnalise[] = data.map((a: any) => ({
          id: a.id,
          nome: a.nome,
          escola: a.escola || 'Não informada',
          escola_id: a.escola_id,
          ano_serie: a.ano_serie || 'Sem Série',
          turma: a.turma || 'Sem Turma',
          periodo: a.periodo || 'manha',
          status: a.status || 'aguardando',
          observacao_secretaria: a.observacao_secretaria,
          fotoUrl: a.foto_url,
          enviadoEm: a.criado_em ? new Date(a.criado_em).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')
        }));
        setAlunos(mapped);
        setUsandoMock(false);
      } else {
        setAlunos(filterMockByTab(activeTab));
        setUsandoMock(true);
      }
    } catch {
      setAlunos(filterMockByTab(activeTab));
      setUsandoMock(true);
    } finally {
      setLoading(false);
      refreshStats();
    }
  }

  async function refreshStats() {
    try {
      const [
        { count: pCount },
        { count: aCount },
        { count: rCount }
      ] = await Promise.all([
        supabase.from('alunos').select('*', { count: 'exact', head: true }).eq('status', 'aguardando'),
        supabase.from('alunos').select('*', { count: 'exact', head: true }).eq('status', 'aprovado'),
        supabase.from('alunos').select('*', { count: 'exact', head: true }).in('status', ['rejeitado', 'pendente_correcao'])
      ]);
      
      setStats({
        pendentes: pCount || 0,
        aprovados: aCount || 0,
        rejeitados: rCount || 0
      });
    } catch {
      setStats({
        pendentes: 3,
        aprovados: 1,
        rejeitados: 1
      });
    }
  }

  function filterMockByTab(tab: string) {
    const mockList = [
      { id: 'aluno-mock-1', nome: 'Mariana Costa Souza', escola: 'Colégio Estadual Julia Wanderley', escola_id: 'b73e2840-7288-4682-9642-17cb25e36002', ano_serie: '7º Ano', turma: 'A', periodo: 'manha', status: 'aguardando', enviadoEm: '26/05/2026', fotoUrl: null },
      { id: 'aluno-mock-2', nome: 'Felipe Nascimento Torres', escola: 'Escola Municipal Codorna', escola_id: 'b73e2840-7288-4682-9642-17cb25e36003', ano_serie: '2º Ano', turma: 'C', periodo: 'tarde', status: 'aguardando', enviadoEm: '25/05/2026', fotoUrl: null },
      { id: 'aluno-mock-3', nome: 'Beatriz Martins Nogueira', escola: 'Colégio Estadual Julia Wanderley', escola_id: 'b73e2840-7288-4682-9642-17cb25e36002', ano_serie: '7º Ano', turma: 'A', periodo: 'manha', status: 'aguardando', enviadoEm: '24/05/2026', fotoUrl: null },
      { id: 'aluno-mock-4', nome: 'Enzo Miguel', escola: 'Colégio Estadual Julia Wanderley', escola_id: 'b73e2840-7288-4682-9642-17cb25e36002', ano_serie: '6º Ano', turma: 'B', periodo: 'tarde', status: 'aprovado', enviadoEm: '23/05/2026', fotoUrl: null },
      { id: 'aluno-mock-5', nome: 'Sophia Velasco de Pauda', escola: 'Escola Municipal Codorna', escola_id: 'b73e2840-7288-4682-9642-17cb25e36003', ano_serie: '1º Ano', turma: 'A', periodo: 'manha', status: 'pendente_correcao', enviadoEm: '22/05/2026', fotoUrl: null }
    ];
    return mockList.filter((a: any) => {
      if (tab === 'pendentes') return a.status === 'aguardando';
      if (tab === 'aprovados') return a.status === 'aprovado';
      return a.status === 'rejeitado' || a.status === 'pendente_correcao';
    }) as AlunoAnalise[];
  }

  const handleOpenDocs = async (aluno: AlunoAnalise) => {
    setSelectedAluno(aluno);
    setLoadingDocs(true);
    setDocumentos([]);
    setShowCorrectionInput(false);
    setCorrectionText('');

    try {
      const { data, error } = await supabase
        .from('documentos_aluno')
        .select('tipo_documento, url_arquivo, url_documento')
        .eq('aluno_id', aluno.id);

      if (!error && data && data.length > 0) {
        const mappedDocs: DocumentoAnexo[] = data.map((d: any) => ({
          tipo: getDocLabel(d.tipo_documento),
          url: d.url_documento || d.url_arquivo
        }));
        setDocumentos(mappedDocs);
      } else {
        setDocumentos([
          { tipo: 'Comprovante de Residência', url: 'https://picsum.photos/400/300?random=1' },
          { tipo: 'Documento do Aluno', url: 'https://picsum.photos/400/300?random=2' },
          { tipo: 'Documento do Responsável', url: 'https://picsum.photos/400/300?random=3' },
          { tipo: 'Declaração de Matrícula', url: 'https://picsum.photos/400/300?random=4' }
        ]);
      }
    } catch {
      setDocumentos([
        { tipo: 'Comprovante de Residência', url: 'https://picsum.photos/400/300?random=1' },
        { tipo: 'Documento do Aluno', url: 'https://picsum.photos/400/300?random=2' },
        { tipo: 'Documento do Responsável', url: 'https://picsum.photos/400/300?random=3' },
        { tipo: 'Declaração de Matrícula', url: 'https://picsum.photos/400/300?random=4' }
      ]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleAprovar = (aluno: AlunoAnalise) => {
    setAlunoParaAprovar(aluno);
    if (rotas.length > 0) {
      setSelectedRotaId(rotas[0].id);
    } else {
      setSelectedRotaId('');
    }
  };

  const handleConfirmAprovar = async (id: string) => {
    setLoadingAction(id);
    const isMockAluno = id.startsWith('aluno-mock') || usandoMock;
    try {
      if (!isMockAluno) {
        const { error } = await supabase
          .from('alunos')
          .update({ 
            status: 'aprovado',
            status_carteirinha: 'Aprovado',
            rota_id: selectedRotaId 
          })
          .eq('id', id);

        if (error) throw error;
      }
      setAlunos(prev => prev.filter(a => a.id !== id));
      showToast('Solicitação APROVADA e Rota designada com sucesso!', 'success');
      setAlunoParaAprovar(null);
      if (selectedAluno?.id === id) setSelectedAluno(null);
      refreshStats();
    } catch (err: any) {
      console.error(err);
      showToast('Falha ao aprovar cadastro: ' + err.message, 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejeitar = async (id: string) => {
    setLoadingAction(id);
    const isMockAluno = id.startsWith('aluno-mock') || usandoMock;
    try {
      if (!isMockAluno) {
        const { error } = await supabase
          .from('alunos')
          .update({ 
            status: 'rejeitado',
            status_carteirinha: 'Pendente',
            rota_id: null 
          })
          .eq('id', id);

        if (error) throw error;
      }
      setAlunos(prev => prev.filter(a => a.id !== id));
      showToast('Solicitação REJEITADA com sucesso.', 'success');
      if (selectedAluno?.id === id) setSelectedAluno(null);
      refreshStats();
    } catch (err: any) {
      console.error(err);
      showToast('Falha ao rejeitar: ' + err.message, 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSolicitarCorrecao = async (id: string, observacao: string) => {
    if (!observacao.trim()) {
      showToast('Por favor, informe a observação de correção.', 'error');
      return;
    }
    setLoadingAction(id);
    const isMockAluno = id.startsWith('aluno-mock') || usandoMock;
    try {
      if (!isMockAluno) {
        const { error } = await supabase
          .from('alunos')
          .update({ 
            status: 'pendente_correcao',
            status_carteirinha: 'Pendente',
            observacao_secretaria: observacao,
            rota_id: null 
          })
          .eq('id', id);

        if (error) throw error;
      }
      setAlunos(prev => prev.filter(a => a.id !== id));
      showToast('Solicitação colocada em correção!', 'success');
      setShowCorrectionInput(false);
      setCorrectionText('');
      if (selectedAluno?.id === id) setSelectedAluno(null);
      refreshStats();
    } catch (err: any) {
      console.error(err);
      showToast('Falha ao solicitar correção: ' + err.message, 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const getDocLabel = (tipo: string) => {
    if (tipo === 'Comprovante_Residencia') return 'Comprovante de Residência';
    if (tipo === 'Documento_Aluno') return 'Documento do Aluno';
    if (tipo === 'Documento_Responsavel') return 'Documento do Responsável';
    if (tipo === 'Declaracao_Matricula') return 'Declaração de Matrícula';
    if (tipo === 'Declaracao')  return 'Declaração de Matrícula';
    if (tipo === 'Comprovante') return 'Comprovante de Residência';
    return 'Documento Geral';
  };

  // Filtragem local baseada na busca por texto e no filtro de escolas
  const filteredAlunos = alunos.filter((aluno) => {
    const matchesSearch = aluno.nome.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSchool = !schoolFilter || aluno.escola === schoolFilter;
    return matchesSearch && matchesSchool;
  });

  return (
    <div className="flex flex-col gap-6 relative bg-slate-50 min-h-screen p-1 sm:p-4 font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border backdrop-blur text-white text-xs font-bold ${
          toast.type === 'success' ? 'bg-emerald-600 border-emerald-500/20' : 'bg-rose-600 border-rose-500/20'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Botão de Voltar & Título */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-black transition-all w-fit border border-slate-200 bg-white hover:border-slate-350 px-4 py-2 rounded-2xl shadow-sm active-press"
        >
          <ArrowLeft size={14} />
          <span>Voltar para Visão Geral</span>
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4 mt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileCheck className="text-amber-500" size={24} />
              Aprovação de Documentos
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Fila de auditoria e validação cadastral da SEMED Arapongas.
            </p>
          </div>
          {usandoMock && (
            <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-200/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Modo Simulação
            </span>
          )}
        </div>
      </div>

      {/* Mini-Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aguardando Auditoria</span>
            <span className="text-2xl font-mono font-black text-slate-900 block mt-1">{stats.pendentes}</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500 border border-amber-100/50">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Carteirinhas Liberadas</span>
            <span className="text-2xl font-mono font-black text-slate-900 block mt-1">{stats.aprovados}</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100/50">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ajustes Solicitados</span>
            <span className="text-2xl font-mono font-black text-rose-600 block mt-1">{stats.rejeitados}</span>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600 border border-rose-100/50">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Caixa de Busca e Filtro */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar estudante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all bg-white"
          />
        </div>

        <div className="w-full sm:max-w-xs">
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 transition-all bg-white cursor-pointer"
          >
            <option value="">-- Todas as Escolas --</option>
            {escolas.map((esc) => (
              <option key={esc.id} value={esc.nome}>
                {esc.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Abas por Status */}
      <div className="flex border-b border-slate-200 gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('pendentes')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all active-press ${
            activeTab === 'pendentes'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>Aguardando Análise</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'pendentes' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
          }`}>
            {stats.pendentes}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('aprovados')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all active-press ${
            activeTab === 'aprovados'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>Aprovados</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'aprovados' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
          }`}>
            {stats.aprovados}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rejeitados')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all active-press ${
            activeTab === 'rejeitados'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>Pendências / Rejeitados</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'rejeitados' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
          }`}>
            {stats.rejeitados}
          </span>
        </button>
      </div>

      {/* Grid de Solicitações (Fila Linear) */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-bold">Carregando fila...</span>
          </div>
        ) : filteredAlunos.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <span className="text-3xl">🎉</span>
            <h3 className="text-sm font-bold text-slate-900">Nenhum documento nesta categoria</h3>
            <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
              Não há novos cadastros pendentes de análise para esta escola ou busca.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAlunos.map((aluno) => (
              <div 
                key={aluno.id} 
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 card-premium animate-fade-in"
              >
                
                {/* Cabeçalho do Card */}
                <div className="flex items-start gap-3.5">
                  {/* Foto do Aluno */}
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-sm border border-slate-100 flex items-center justify-center relative bg-slate-50">
                    {aluno.fotoUrl ? (
                      <img src={aluno.fotoUrl} alt={aluno.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 text-white flex items-center justify-center font-black text-sm uppercase">
                        {aluno.nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('')}
                      </div>
                    )}
                  </div>

                  {/* Nome e Escola */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-slate-950 truncate tracking-tight">{aluno.nome}</h4>
                    <span className="inline-block px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold text-slate-600 mt-1 truncate max-w-full">
                      {aluno.escola}
                    </span>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      {aluno.ano_serie} · Turma {aluno.turma} · {aluno.periodo === 'manha' ? 'Manhã' : aluno.periodo === 'tarde' ? 'Tarde' : 'Noite'}
                    </p>
                  </div>
                </div>

                {/* Status e Data */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px]">
                  <span className="text-slate-450 font-bold">Enviado em: {aluno.enviadoEm}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                    aluno.status === 'aprovado'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : aluno.status === 'aguardando'
                      ? 'bg-amber-50 border-amber-250 text-amber-700'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${
                      aluno.status === 'aprovado' ? 'bg-emerald-500' : aluno.status === 'aguardando' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                    }`} />
                    {aluno.status === 'aguardando' ? 'Pendente' : aluno.status === 'aprovado' ? 'Aprovado' : aluno.status === 'pendente_correcao' ? 'Correção' : 'Rejeitado'}
                  </span>
                </div>

                {/* Ações do Card */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                  <button
                    onClick={() => handleOpenDocs(aluno)}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-[10px] font-extrabold bg-slate-50 text-slate-700 border hover:bg-slate-100 transition-colors active-press"
                  >
                    <Eye size={12} />
                    <span>Ver Anexos</span>
                  </button>

                  {aluno.status === 'aguardando' && (
                    <>
                      <button
                        onClick={() => handleAprovar(aluno)}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors active-press shadow-sm shadow-emerald-600/10"
                      >
                        <CheckCircle size={12} />
                        <span>Aprovar</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAluno(aluno);
                          setShowCorrectionInput(true);
                          setCorrectionText('');
                        }}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-[10px] font-extrabold bg-amber-600 hover:bg-amber-500 text-white transition-colors active-press shadow-sm shadow-amber-600/10"
                      >
                        <AlertTriangle size={12} />
                        <span>Corrigir</span>
                      </button>
                    </>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: VISUALIZADOR DE DOCUMENTOS */}
      {selectedAluno && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border flex flex-col max-h-[90vh] animate-fade-in">
            
            {/* Header */}
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Auditoria de Anexos</h3>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5 truncate max-w-[280px]">
                  Estudante: {selectedAluno.nome}
                </span>
              </div>
              <button 
                onClick={() => {
                  setSelectedAluno(null);
                  setShowCorrectionInput(false);
                  setCorrectionText('');
                }} 
                className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              >
                <X size={15} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
              {loadingDocs ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-500 font-semibold">Carregando arquivos...</span>
                </div>
              ) : documentos.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <h4 className="text-xs font-bold text-slate-900">Documentos não encontrados</h4>
                  <p className="text-[10px] text-slate-450">Não há arquivos registrados para este estudante.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {documentos.map((doc, idx) => (
                    <div key={idx} className="border rounded-2xl p-4 flex flex-col gap-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wide">{doc.tipo}</span>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[9px] font-extrabold bg-white text-slate-800 border hover:bg-slate-50 transition-colors shadow-sm"
                        >
                          <Download size={11} className="text-amber-500" />
                          <span>Abrir Anexo</span>
                        </a>
                      </div>
                      
                      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 border relative flex items-center justify-center">
                        <img
                          src={doc.url}
                          alt={doc.tipo}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://picsum.photos/400/300?random=${idx}`;
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t bg-slate-50 flex flex-col gap-3">
              {showCorrectionInput ? (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">
                    Observação de Correção (Visível para o Responsável)
                  </label>
                  <textarea
                    value={correctionText}
                    onChange={(e) => setCorrectionText(e.target.value)}
                    placeholder="Especifique os documentos com problemas e descreva como corrigir..."
                    className="w-full p-2.5 border rounded-xl text-xs font-medium text-slate-850 bg-white focus:outline-none focus:border-slate-900 min-h-[70px] resize-none"
                  />
                  <div className="flex gap-2 justify-end mt-1">
                    <button
                      onClick={() => setShowCorrectionInput(false)}
                      className="py-1.5 px-3 rounded-lg text-[10px] font-bold border text-slate-650 hover:bg-slate-100 transition-colors bg-white"
                    >
                      Voltar
                    </button>
                    <button
                      disabled={loadingAction !== null}
                      onClick={() => handleSolicitarCorrecao(selectedAluno.id, correctionText)}
                      className="py-1.5 px-3.5 rounded-lg text-[10px] font-bold bg-amber-600 text-white hover:bg-amber-500 transition-colors flex items-center gap-1 shadow-sm"
                    >
                      {loadingAction === selectedAluno.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={10} />
                          <span>Enviar para Correção</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 justify-end">
                  {selectedAluno.status === 'aguardando' && (
                    <>
                      <button
                        disabled={loadingAction !== null}
                        onClick={() => handleRejeitar(selectedAluno.id)}
                        className="py-2 px-3.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition-all flex items-center gap-1 shadow active-press"
                      >
                        <XCircle size={14} />
                        <span>Rejeitar</span>
                      </button>
                      <button
                        onClick={() => setShowCorrectionInput(true)}
                        className="py-2 px-3.5 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-500 transition-all flex items-center gap-1 shadow active-press"
                      >
                        <AlertTriangle size={14} />
                        <span>Solicitar Correção</span>
                      </button>
                      <button
                        disabled={loadingAction !== null}
                        onClick={() => handleAprovar(selectedAluno)}
                        className="py-2 px-4.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center gap-1 shadow active-press"
                      >
                        <CheckCircle2 size={14} />
                        <span>Aprovar</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL: DESIGNAÇÃO DE ROTA (APROVAÇÃO) */}
      {alunoParaAprovar && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border flex flex-col animate-fade-in">
            
            {/* Header */}
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Aprovar e Designar Rota</h3>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase">SEMED Arapongas</span>
              </div>
              <button onClick={() => setAlunoParaAprovar(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={15} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-xs text-emerald-800 flex gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Aprovando estudante:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{alunoParaAprovar.nome}</p>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block mb-1.5">
                  Selecione a Rota Escolar
                </label>
                <select
                  value={selectedRotaId}
                  onChange={(e) => setSelectedRotaId(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  <option value="" disabled>-- Selecione uma Rota --</option>
                  {rotas.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.codigo} — {r.nome_rota || r.nome}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-450 mt-1.5 leading-normal">
                  A rota designará automaticamente o veículo e motorista para a carteirinha do estudante.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t bg-slate-50 flex gap-2 justify-end">
              <button
                onClick={() => setAlunoParaAprovar(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border text-slate-650 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!selectedRotaId || loadingAction !== null}
                onClick={() => handleConfirmAprovar(alunoParaAprovar.id)}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow ${
                  selectedRotaId && loadingAction === null
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 active-press'
                    : 'bg-slate-100 text-slate-400 border cursor-not-allowed'
                }`}
              >
                {loadingAction === alunoParaAprovar.id ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-550 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Aprovar e Liberar</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
