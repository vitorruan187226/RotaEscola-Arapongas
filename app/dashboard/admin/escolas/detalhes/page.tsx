'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  ArrowLeft, 
  FileCheck, 
  CheckCircle, 
  XCircle, 
  Eye, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Clock, 
  MapPin, 
  Users, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { createClient } from '../../../../../utils/supabase/client';
import { ALUNOS_MOCK_GLOBAL } from '../../../../../lib/mocks/alunos';

interface AlunoAuditoria {
  id: string;
  nome: string;
  escola: string;
  serie: string;
  status: 'Em análise' | 'Aprovado' | 'Rejeitado' | 'Pendente';
  enviadoEm: string;
  rotaId?: string;
}

interface DocumentoAnexo {
  tipo: string;
  url: string;
}

const ALUNOS_MOCK_AUDITORIA: AlunoAuditoria[] = ALUNOS_MOCK_GLOBAL.map(a => ({
  id: a.id,
  nome: a.nome,
  escola: a.escola,
  serie: a.serie,
  status: a.statusCarteirinha === 'Pendente' ? 'Rejeitado' as const : a.statusCarteirinha,
  rotaId: a.rotaId,
  enviadoEm: new Date().toLocaleDateString('pt-BR')
}));

export default function EscolaDetalhesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [escolaNome, setEscolaNome] = useState('');
  const [escolaId, setEscolaId] = useState('');
  const [escolaInfo, setEscolaInfo] = useState<any>(null);

  const [alunos, setAlunos] = useState<AlunoAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [usandoMock, setUsandoMock] = useState(false);

  // Filtros por Abas
  const [activeTab, setActiveTab] = useState<'pendentes' | 'aprovados' | 'rejeitados'>('pendentes');

  // Estados dos Modais de Auditoria
  const [selectedAluno, setSelectedAluno] = useState<AlunoAuditoria | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoAnexo[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Estados para designação de rota na aprovação
  const [rotas, setRotas] = useState<any[]>([]);
  const [alunoParaAprovar, setAlunoParaAprovar] = useState<AlunoAuditoria | null>(null);
  const [selectedRotaId, setSelectedRotaId] = useState<string>('');
  const [fluxoContinuo, setFluxoContinuo] = useState(false);

  // Estado de Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const name = params.get('escola') || '';
      const id = params.get('id') || '';
      setEscolaNome(name);
      setEscolaId(id);
    }
  }, []);

  useEffect(() => {
    if (escolaNome) {
      loadEscolaDados();
      loadAlunosDaEscola();
      loadRotas();
    }
  }, [escolaNome]);

  async function loadEscolaDados() {
    if (!escolaId) return;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(escolaId);
    if (!isUuid) return;
    try {
      const { data, error } = await supabase
        .from('escolas')
        .select('*')
        .eq('id', escolaId)
        .maybeSingle();

      if (!error && data) {
        setEscolaInfo(data);
      }
    } catch (err) {
      console.warn('Erro ao obter detalhes da escola do Supabase:', err);
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

  async function loadAlunosDaEscola() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome, escola, status_carteirinha, rota_id, created_at')
        .eq('escola', escolaNome);

      if (error) {
        console.error('--- ERRO DETALHADO DO SUPABASE (Alunos da Escola) ---');
        console.error('Mensagem:', error.message);
        console.error('Detalhes:', error.details);
        console.error('Dica (Hint):', error.hint);
        console.error('---------------------------------');
        
        console.warn('Erro ao consultar estudantes do banco. Carregando mock.', error);
        const filtradoMock = ALUNOS_MOCK_AUDITORIA.filter(
          a => a.escola.toLowerCase().includes(escolaNome.toLowerCase())
        );
        setAlunos(filtradoMock.length > 0 ? filtradoMock : ALUNOS_MOCK_AUDITORIA);
        setUsandoMock(true);
        return;
      }

      // Se não houver erro, usa os dados do banco, mesmo que vazio
      if (data) {
        const mapped: AlunoAuditoria[] = data.map((a: any) => ({
          id: a.id,
          nome: a.nome,
          escola: a.escola,
          serie: '—',
          status: (a.status_carteirinha === 'Pendente' ? 'Rejeitado' as const : a.status_carteirinha as AlunoAuditoria['status']) ?? 'Pendente',
          enviadoEm: a.created_at ? new Date(a.created_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
          rotaId: a.rota_id ?? undefined
        }));
        setAlunos(mapped);
        setUsandoMock(false);
      }
    } catch (err) {
      console.warn('Erro ao consultar estudantes do banco. Carregando mock.', err);
      const filtradoMock = ALUNOS_MOCK_AUDITORIA.filter(
        a => a.escola.toLowerCase().includes(escolaNome.toLowerCase())
      );
      setAlunos(filtradoMock.length > 0 ? filtradoMock : ALUNOS_MOCK_AUDITORIA);
      setUsandoMock(true);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDocs = async (aluno: AlunoAuditoria) => {
    setSelectedAluno(aluno);
    setLoadingDocs(true);
    setDocumentos([]);

    try {
      const { data, error } = await supabase
        .from('documentos_aluno')
        .select('tipo_documento, url_documento')
        .eq('aluno_id', aluno.id);

      if (!error && data && data.length > 0) {
        const mappedDocs: DocumentoAnexo[] = data.map((d: any) => ({
          tipo: getDocLabel(d.tipo_documento),
          url: d.url_documento
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

  const handleAprovar = (aluno: AlunoAuditoria) => {
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
        // Persistência Real no Supabase com campo status_carteirinha
        const { data, error } = await supabase
          .from('alunos')
          .update({ 
            status_carteirinha: 'Aprovado',
            rota_id: selectedRotaId 
          })
          .eq('id', id);

        if (error) {
          console.error('--- ERRO DETALHADO DO SUPABASE (Aprovação Aluno) ---');
          console.error('Mensagem:', error.message);
          console.error('Detalhes:', error.details);
          console.error('Dica (Hint):', error.hint);
          console.error('---------------------------------');
          alert('Erro ao salvar aprovação no banco de dados: ' + error.message);
          throw error;
        }
      }
      
      // SÓ altera o estado do front-end e badges após confirmação de sucesso
      let proximo: AlunoAuditoria | undefined = undefined;
      setAlunos(prev => {
        const updated = prev.map(a => a.id === id ? { ...a, status: 'Aprovado' as const, rotaId: selectedRotaId } : a);
        if (fluxoContinuo) {
          proximo = updated.find(a => a.status === 'Em análise');
        }
        return updated;
      });

      if (isMockAluno) {
        showToast('Aprovação simulada com sucesso!', 'success');
      } else {
        showToast('Estudante APROVADO e Rota cadastrada com sucesso!', 'success');
      }
      
      if (fluxoContinuo) {
        if (proximo) {
          const prox = proximo as AlunoAuditoria;
          setSelectedAluno(prox);
          handleOpenDocs(prox);
          setAlunoParaAprovar(null);
        } else {
          setSelectedAluno(null);
          setAlunoParaAprovar(null);
          showToast('Todos os documentos desta instituição foram analisados!', 'success');
        }
        setFluxoContinuo(false);
      } else {
        setAlunoParaAprovar(null);
        if (selectedAluno?.id === id) setSelectedAluno(null);
      }
    } catch (err) {
      console.error('Falha de persistência ao aprovar estudante:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejeitar = async (id: string) => {
    setLoadingAction(id);
    const isMockAluno = id.startsWith('aluno-mock') || usandoMock;

    try {
      if (!isMockAluno) {
        // Persistência Real no Supabase com campo status_carteirinha
        const { data, error } = await supabase
          .from('alunos')
          .update({ 
            status_carteirinha: 'Pendente',
            rota_id: null 
          })
          .eq('id', id);

        if (error) {
          console.error('--- ERRO DETALHADO DO SUPABASE (Rejeição Aluno) ---');
          console.error('Mensagem:', error.message);
          console.error('Detalhes:', error.details);
          console.error('Dica (Hint):', error.hint);
          console.error('---------------------------------');
          alert('Erro ao salvar rejeição no banco de dados: ' + error.message);
          throw error;
        }
      }

      // SÓ altera o estado do front-end e badges após confirmação de sucesso
      setAlunos(prev => prev.map(a => a.id === id ? { ...a, status: 'Rejeitado' as const, rotaId: undefined } : a));
      
      if (isMockAluno) {
        showToast('Rejeição simulada com sucesso!', 'success');
      } else {
        showToast('Solicitação REJEITADA. Cadastro retornado ao status Rejeitado.', 'success');
      }
      
      if (selectedAluno?.id === id) setSelectedAluno(null);
    } catch (err) {
      console.error('Falha de persistência ao rejeitar estudante:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReavaliar = async (id: string) => {
    setLoadingAction(id);
    const isMockAluno = id.startsWith('aluno-mock') || usandoMock;

    try {
      if (!isMockAluno) {
        // Persistência Real no Supabase com campo status_carteirinha
        const { data, error } = await supabase
          .from('alunos')
          .update({ 
            status_carteirinha: 'Em análise' 
          })
          .eq('id', id);

        if (error) {
          console.error('--- ERRO DETALHADO DO SUPABASE (Reavaliação Aluno) ---');
          console.error('Mensagem:', error.message);
          console.error('Detalhes:', error.details);
          console.error('Dica (Hint):', error.hint);
          console.error('---------------------------------');
          alert('Erro ao reavaliar estudante no banco de dados: ' + error.message);
          throw error;
        }
      }

      // SÓ altera o estado do front-end e badges após confirmação de sucesso
      setAlunos(prev => prev.map(a => a.id === id ? { ...a, status: 'Em análise' as const } : a));
      
      if (isMockAluno) {
        showToast('Reavaliação simulada com sucesso!', 'success');
      } else {
        showToast('Solicitação de estudante enviada de volta para análise.', 'success');
      }
    } catch (err) {
      console.error('Falha de persistência ao reavaliar estudante:', err);
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

  // Filtragem local baseada na aba ativa
  const filteredAlunos = alunos.filter((aluno) => {
    if (activeTab === 'pendentes') {
      return aluno.status === 'Em análise';
    } else if (activeTab === 'aprovados') {
      return aluno.status === 'Aprovado';
    } else {
      // Rejeitados / Pendentes de documentação
      return aluno.status === 'Rejeitado' || aluno.status === 'Pendente';
    }
  });

  const countPendentes = alunos.filter(a => a.status === 'Em análise').length;
  const countAprovados = alunos.filter(a => a.status === 'Aprovado').length;
  const countRejeitados = alunos.filter(a => a.status === 'Rejeitado' || a.status === 'Pendente').length;

  return (
    <div className="flex flex-col gap-6 relative font-sans">
      
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
          onClick={() => router.push('/dashboard/admin/escolas')}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors w-fit border border-slate-200 bg-white hover:border-slate-350 px-3 py-1.5 rounded-xl shadow-sm"
        >
          <ArrowLeft size={13} />
          <span>Voltar para Escolas</span>
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4 mt-1">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-amber-50 rounded-3xl text-amber-500 shrink-0 shadow-sm border border-amber-100">
              <Building2 size={28} />
            </div>
            <div>
              <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={11} className="animate-pulse" />
                Unidade Escolar Atendida
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {escolaNome || 'Carregando Escola...'}
              </h1>
              {escolaInfo && (
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-semibold flex-wrap">
                  <div className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{escolaInfo.endereco}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <div className="flex items-center gap-1">
                    <Clock size={13} className="text-slate-400" />
                    <span>Turnos: {escolaInfo.turnos.join(', ')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {usandoMock && (
            <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-200/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Modo Simulação
            </span>
          )}
        </div>
      </div>

      {/* Abas de Navegação (Tabs) */}
      <div className="flex border-b border-slate-200 gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('pendentes')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-black transition-all ${
            activeTab === 'pendentes'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>Pendentes</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'pendentes' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
          }`}>
            {countPendentes}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('aprovados')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-black transition-all ${
            activeTab === 'aprovados'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>Aprovados</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'aprovados' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
          }`}>
            {countAprovados}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rejeitados')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-black transition-all ${
            activeTab === 'rejeitados'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>Rejeitados</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'rejeitados' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
          }`}>
            {countRejeitados}
          </span>
        </button>
      </div>

      {/* Tabela da Aba Selecionada */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider pb-2 border-b">
          <Users size={14} className="text-amber-500" />
          <span>Fila de Auditoria Cadastral — {
            activeTab === 'pendentes' ? 'Pendências' : activeTab === 'aprovados' ? 'Aprovados' : 'Rejeitados'
          }</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-bold">Carregando fila...</span>
            </div>
          ) : filteredAlunos.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <span className="text-3xl">🎉</span>
              <h3 className="text-sm font-bold text-slate-900">
                Nenhum estudante nesta categoria
              </h3>
              <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                {activeTab === 'pendentes' 
                  ? 'Não há novos cadastros sob análise técnica nesta unidade escolar.' 
                  : activeTab === 'aprovados' 
                  ? 'Nenhum estudante aprovado cadastrado nesta escola.'
                  : 'Nenhum estudante rejeitado ou pendente de envio de anexo.'
                }
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Estudante</th>
                  <th className="py-3 px-4">Série / Ano</th>
                  <th className="py-3 px-4">Enviado Em</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Ações de Auditoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAlunos.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{a.nome}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{a.serie}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-350" />
                        <span>{a.enviadoEm}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        a.status === 'Aprovado'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : a.status === 'Em análise'
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          a.status === 'Aprovado' ? 'bg-emerald-500' : a.status === 'Em análise' ? 'bg-blue-500 animate-pulse' : 'bg-rose-500'
                        }`} />
                        {a.status === 'Pendente' ? 'Recusado' : a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* 1. Botão Ver Documentos (presente em todos os status) */}
                        <button
                          onClick={() => handleOpenDocs(a)}
                          className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-extrabold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border"
                        >
                          <Eye size={12} />
                          <span>Ver Documentos</span>
                        </button>

                        {/* 2. Ações para Pendentes (Em análise) */}
                        {a.status === 'Em análise' && (
                          <>
                            <button
                              disabled={loadingAction !== null}
                              onClick={() => handleAprovar(a)}
                              className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-extrabold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm disabled:opacity-50"
                            >
                              {loadingAction === a.id ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle size={12} />
                                  <span>Aprovar</span>
                                </>
                              )}
                            </button>
                            <button
                              disabled={loadingAction !== null}
                              onClick={() => handleRejeitar(a.id)}
                              className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-extrabold bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-sm disabled:opacity-50"
                            >
                              {loadingAction === a.id ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <XCircle size={12} />
                                  <span>Rejeitar</span>
                                </>
                              )}
                            </button>
                          </>
                        )}

                        {/* 3. Exibição para Aprovados (Remoção de botões, mostra Rota + botão discreto de Alterar Rota) */}
                        {a.status === 'Aprovado' && (
                          <div className="flex items-center gap-2">
                            {(() => {
                              const rota = rotas.find(r => r.id === a.rotaId || r.codigo === a.rotaId);
                              const rotaNome = rota ? `${rota.codigo} — ${rota.nome_rota || rota.nome}` : a.rotaId || 'Sem Rota';
                              return (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-50/70 text-amber-800 border border-amber-200">
                                  <Clock size={10} className="text-amber-500" />
                                  <span>{rotaNome}</span>
                                </span>
                              );
                            })()}
                            <button
                              onClick={() => handleAprovar(a)}
                              className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-[10px] font-extrabold bg-white text-slate-700 hover:bg-slate-100 transition-colors border"
                              title="Alterar Rota"
                            >
                              <span>Alterar Rota</span>
                            </button>
                          </div>
                        )}

                        {/* 4. Ações para Rejeitados (Pendente / Rejeitado) - Exibe apenas o botão 'Reavaliar' */}
                        {(a.status === 'Rejeitado' || a.status === 'Pendente') && (
                          <button
                            disabled={loadingAction !== null}
                            onClick={() => handleReavaliar(a.id)}
                            className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-extrabold bg-amber-600 text-white hover:bg-amber-500 transition-colors shadow-sm disabled:opacity-50"
                          >
                            {loadingAction === a.id ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <Sparkles size={12} className="text-amber-350 shrink-0" />
                                <span>Reavaliar</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL: VISUALIZADOR DE DOCUMENTOS */}
      {selectedAluno && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border flex flex-col max-h-[90vh] animate-fadeIn">
            
            {/* Header */}
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Auditoria de Anexos</h3>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5 truncate max-w-[280px]">
                  Estudante: {selectedAluno.nome}
                </span>
              </div>
              <button onClick={() => setSelectedAluno(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
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
                  <p className="text-[10px] text-slate-400">Não há arquivos registrados para este estudante no Supabase.</p>
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
                          className="flex items-center gap-1 py-1 px-2.5 rounded-lg text-[9px] font-extrabold bg-white text-slate-800 border hover:bg-slate-50 transition-colors shadow-sm"
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
            <div className="px-5 py-4 border-t bg-slate-50 flex gap-2 justify-end">
              <button
                disabled={loadingAction !== null}
                onClick={() => handleRejeitar(selectedAluno.id)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition-all flex items-center gap-1.5 shadow"
              >
                <XCircle size={14} />
                <span>Rejeitar</span>
              </button>
              <button
                disabled={loadingAction !== null}
                onClick={() => handleAprovar(selectedAluno)}
                className="py-2.5 px-5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center gap-1.5 shadow"
              >
                <CheckCircle2 size={14} />
                <span>Aprovar Cadastro</span>
              </button>
              {selectedAluno.status === 'Em análise' && (
                <button
                  disabled={loadingAction !== null}
                  onClick={() => {
                    setFluxoContinuo(true);
                    handleAprovar(selectedAluno);
                  }}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow border border-transparent"
                >
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Aprovar e Próximo</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL: DESIGNAÇÃO DE ROTA (APROVAÇÃO) */}
      {alunoParaAprovar && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border flex flex-col animate-fadeIn">
            
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Aprovar e Designar Rota</h3>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase">SEMED Arapongas</span>
              </div>
              <button onClick={() => setAlunoParaAprovar(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={15} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-xs text-emerald-800 flex gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Aprovando estudante:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{alunoParaAprovar.nome}</p>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                  Selecione a Rota Escolar
                </label>
                <select
                  value={selectedRotaId}
                  onChange={(e) => setSelectedRotaId(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  <option value="" disabled>-- Selecione uma Rota --</option>
                  {rotas.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.nome_rota || r.nome}{r.turno ? ` (${r.turno === 'manha' || r.turno === 'Manhã' ? 'Manhã' : 'Tarde'})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                  A rota selecionada definirá automaticamente o motorista designado e o veículo que aparecerão na carteirinha digital e no mapa do responsável.
                </p>
              </div>
            </div>

            <div className="px-5 py-4 border-t bg-slate-50 flex gap-2 justify-end">
              <button
                onClick={() => setAlunoParaAprovar(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!selectedRotaId || loadingAction !== null}
                onClick={() => handleConfirmAprovar(alunoParaAprovar.id)}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow ${
                  selectedRotaId && loadingAction === null
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-slate-100 text-slate-450 border cursor-not-allowed'
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
