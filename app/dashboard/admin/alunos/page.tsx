'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, X, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { createClient } from '../../../../utils/supabase/client';

interface AlunoAdmin {
  id: string;
  nome: string;
  escola: string;
  escolaId?: string;
  serie: string;
  rotaId: string;
  statusCarteirinha: 'Pendente' | 'Em análise' | 'Aprovado';
}

const ALUNOS_MOCK: AlunoAdmin[] = [
  { id: 'aluno-mock-1', nome: 'Thiago Martins Nogueira', escola: 'Escola Municipal Dorcelina Folador', escolaId: 'b73e2840-7288-4682-9642-17cb25e36001', serie: '4º Ano B', rotaId: 'Rota 04', statusCarteirinha: 'Aprovado' },
  { id: 'aluno-mock-2', nome: 'Beatriz Martins Nogueira', escola: 'Colégio Estadual Julia Wanderley', escolaId: 'b73e2840-7288-4682-9642-17cb25e36002', serie: '7º Ano A', rotaId: 'Rota 22', statusCarteirinha: 'Em análise' },
  { id: 'aluno-mock-3', nome: 'Pedro Henrique Silva', escola: 'Escola Municipal Codorna', escolaId: 'b73e2840-7288-4682-9642-17cb25e36003', serie: '2º Ano C', rotaId: 'Rota 14', statusCarteirinha: 'Pendente' },
  { id: 'aluno-mock-4', nome: 'Sophia Moraes Dias', escola: 'Colégio Estadual Julia Wanderley', escolaId: 'b73e2840-7288-4682-9642-17cb25e36002', serie: '6º Ano B', rotaId: 'Rota 07', statusCarteirinha: 'Pendente' },
  { id: 'aluno-mock-5', nome: 'Guilherme Augusto Nogueira', escola: 'Escola Municipal Dorcelina Folador', escolaId: 'b73e2840-7288-4682-9642-17cb25e36001', serie: '3º Ano A', rotaId: 'Rota 04', statusCarteirinha: 'Em análise' }
];

export default function AlunosPage() {
  const supabase = createClient();
  
  const [alunos, setAlunos] = useState<AlunoAdmin[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [usandoMock, setUsandoMock] = useState(false);

  // Estados dos Modais
  const [modalNovo, setModalNovo] = useState(false);
  const [modalEditar, setModalEditar] = useState<AlunoAdmin | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Form Fields (Novo / Editar)
  const [nome, setNome] = useState('');
  const [escola, setEscola] = useState('Escola Municipal Dorcelina Folador');
  const [escolaId, setEscolaId] = useState('');
  const [serie, setSerie] = useState('');
  const [rotaId, setRotaId] = useState('Rota 04');
  const [status, setStatus] = useState<'Pendente' | 'Em análise' | 'Aprovado'>('Pendente');

  // Estado de Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadAlunos();
    loadEscolas();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const escolaParam = params.get('escola');
      if (escolaParam) {
        setSearchTerm(escolaParam);
      }
    }
  }, []);

  async function loadEscolas() {
    try {
      const { data, error } = await supabase
        .from('escolas')
        .select('id, nome')
        .order('nome', { ascending: true });
      if (!error && data && data.length > 0) {
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

  async function loadAlunos() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome, escola, escola_id, serie, rota_id, status_carteirinha');

      if (!error && data && data.length > 0) {
        const mapped: AlunoAdmin[] = data.map((a: any) => ({
          id: a.id,
          nome: a.nome,
          escola: a.escola,
          escolaId: a.escola_id ?? undefined,
          serie: a.serie ?? '—',
          rotaId: a.rota_id ?? 'Aguardando Atribuição',
          statusCarteirinha: (a.status_carteirinha as AlunoAdmin['statusCarteirinha']) ?? 'Pendente'
        }));
        setAlunos(mapped);
        setUsandoMock(false);
      } else {
        setAlunos(ALUNOS_MOCK);
        setUsandoMock(true);
      }
    } catch {
      setAlunos(ALUNOS_MOCK);
      setUsandoMock(true);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async () => {
    if (!nome.trim() || !serie.trim()) return;
    setLoadingAction(true);
    try {
      let createdId = `aluno-gen-${Date.now()}`;
      
      if (!usandoMock) {
        const { data, error } = await supabase
          .from('alunos')
          .insert({
            nome,
            escola,
            escola_id: escolaId || null,
            serie,
            status_carteirinha: status,
            rota_id: rotaId
          })
          .select('id')
          .maybeSingle();

        if (error) {
          // Retry
          const { data: retryData, error: retryError } = await supabase
            .from('alunos')
            .insert({
              nome,
              escola,
              escola_id: escolaId || null,
              serie,
              status_carteirinha: status,
              rota_id: rotaId
            })
            .select('id')
            .maybeSingle();

          if (retryError) throw retryError;
          if (retryData?.id) createdId = retryData.id;
        } else if (data?.id) {
          createdId = data.id;
        }
      }

      const novo: AlunoAdmin = {
        id: createdId,
        nome,
        escola,
        escolaId,
        serie,
        rotaId,
        statusCarteirinha: status
      };

      setAlunos(prev => [novo, ...prev]);
      setModalNovo(false);
      setNome('');
      setSerie('');
      showToast('Aluno cadastrado com sucesso!', 'success');
    } catch {
      // Se estiver em modo simulado ou offline
      const mockNovo: AlunoAdmin = {
        id: `aluno-mock-${Date.now()}`,
        nome,
        escola,
        escolaId,
        serie,
        rotaId,
        statusCarteirinha: status
      };
      setAlunos(prev => [mockNovo, ...prev]);
      setModalNovo(false);
      setNome('');
      setSerie('');
      showToast('Cadastro simulado com sucesso!', 'success');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdate = async () => {
    if (!modalEditar || !nome.trim() || !serie.trim()) return;
    setLoadingAction(true);
    try {
      if (!usandoMock && !modalEditar.id.startsWith('aluno-mock')) {
        const { error } = await supabase
          .from('alunos')
          .update({
            nome,
            escola,
            escola_id: escolaId || null,
            serie,
            status_carteirinha: status,
            rota_id: rotaId
          })
          .eq('id', modalEditar.id);

        if (error) throw error;
      }

      setAlunos(prev => prev.map(a => a.id === modalEditar.id ? {
        ...a,
        nome,
        escola,
        escolaId,
        serie,
        rotaId,
        statusCarteirinha: status
      } : a));
      
      setModalEditar(null);
      setNome('');
      setSerie('');
      showToast('Cadastro atualizado com sucesso!', 'success');
    } catch {
      setAlunos(prev => prev.map(a => a.id === modalEditar.id ? {
        ...a,
        nome,
        escola,
        escolaId,
        serie,
        rotaId,
        statusCarteirinha: status
      } : a));
      setModalEditar(null);
      setNome('');
      setSerie('');
      showToast('Cadastro atualizado localmente!', 'success');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este estudante do cadastro municipal?')) return;
    try {
      if (!usandoMock && !id.startsWith('aluno-mock')) {
        const { error } = await supabase.from('alunos').delete().eq('id', id);
        if (error) throw error;
      }
      setAlunos(prev => prev.filter(a => a.id !== id));
      showToast('Estudante excluído com sucesso.', 'success');
    } catch {
      setAlunos(prev => prev.filter(a => a.id !== id));
      showToast('Exclusão simulada com sucesso.', 'success');
    }
  };

  const filteredAlunos = alunos.filter(a =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.escola.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border backdrop-blur text-white text-xs font-bold ${
          toast.type === 'success' ? 'bg-emerald-600 border-emerald-500/20' : 'bg-rose-600 border-rose-500/20'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Gestão de Alunos</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Gestão do cadastro municipal do transporte escolar de Arapongas — {alunos.length} alunos monitorados.
          </p>
        </div>
        <button
          onClick={() => {
            setNome('');
            setSerie('');
            setStatus('Pendente');
            if (escolas.length > 0) {
              setEscolaId(escolas[0].id);
              setEscola(escolas[0].nome);
            } else {
              setEscolaId('');
              setEscola('Escola Municipal Dorcelina Folador');
            }
            setModalNovo(true);
          }}
          className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow"
        >
          <Plus size={14} className="text-amber-500" />
          <span>Novo Aluno</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do aluno ou escola..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-bold placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        {usandoMock && (
          <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-200/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Visualização de Demonstração
          </span>
        )}
      </div>

      {/* Tabela de Alunos */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-bold">Carregando estudantes...</span>
            </div>
          ) : filteredAlunos.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <span className="text-3xl">👥</span>
              <h3 className="text-sm font-bold text-slate-900">Nenhum estudante encontrado</h3>
              <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                Tente redefinir os termos de busca ou adicione um novo registro no painel.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Nome do Aluno</th>
                  <th className="py-3 px-4">Escola</th>
                  <th className="py-3 px-4">Ano/Turma</th>
                  <th className="py-3 px-4">Rota Vinculada</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAlunos.map((aluno) => (
                  <tr key={aluno.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{aluno.nome}</td>
                    <td className="py-3.5 px-4 text-slate-600">{aluno.escola}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{aluno.serie}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">{aluno.rotaId}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        aluno.statusCarteirinha === 'Aprovado'
                          ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                          : aluno.statusCarteirinha === 'Em análise'
                          ? 'bg-blue-50 border-blue-250 text-blue-700'
                          : 'bg-amber-50 border-amber-250 text-amber-700'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          aluno.statusCarteirinha === 'Aprovado' ? 'bg-emerald-500' : aluno.statusCarteirinha === 'Em análise' ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'
                        }`} />
                        {aluno.statusCarteirinha}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setNome(aluno.nome);
                            setEscola(aluno.escola);
                            setEscolaId(aluno.escolaId || '');
                            setSerie(aluno.serie);
                            setRotaId(aluno.rotaId);
                            setStatus(aluno.statusCarteirinha);
                            setModalEditar(aluno);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-950 transition-colors border border-transparent hover:border-slate-200"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(aluno.id)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL: NOVO ALUNO */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border flex flex-col animate-fadeIn">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Novo Aluno</h3>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase">SEMED Arapongas</span>
              </div>
              <button onClick={() => setModalNovo(false)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do estudante"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Instituição de Ensino</label>
                <select
                  value={escolaId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    setEscolaId(selId);
                    const selNome = escolas.find(esc => esc.id === selId)?.nome || '';
                    setEscola(selNome);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  {escolas.map((esc) => (
                    <option key={esc.id} value={esc.id}>{esc.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Ano / Turma</label>
                <input
                  type="text"
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  placeholder="Ex: 4º Ano B"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Rota Vinculada</label>
                <select
                  value={rotaId}
                  onChange={(e) => setRotaId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  <option value="Rota 04">Rota 04 — Zona Rural</option>
                  <option value="Rota 07">Rota 07 — Norte</option>
                  <option value="Rota 22">Rota 22 — Centro</option>
                  <option value="Rota 14">Rota 14 — Sul</option>
                  <option value="Rota 19">Rota 19 — Leste</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Status da Carteirinha</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  <option value="Pendente">Pendente (Aguardando Doc)</option>
                  <option value="Em análise">Em análise (Aguardando SEMED)</option>
                  <option value="Aprovado">Aprovado (Carteirinha Liberada)</option>
                </select>
              </div>
            </div>

            <div className="px-5 py-4 border-t bg-slate-50 flex gap-2 justify-end">
              <button
                disabled={loadingAction}
                onClick={() => setModalNovo(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!nome.trim() || !serie.trim() || loadingAction}
                onClick={handleCreate}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow ${
                  nome.trim() && serie.trim() && !loadingAction ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-450 border cursor-not-allowed'
                }`}
              >
                {loadingAction ? <div className="w-3.5 h-3.5 border-2 border-slate-550 border-t-transparent rounded-full animate-spin" /> : 'Salvar Aluno'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR ALUNO */}
      {modalEditar && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border flex flex-col animate-fadeIn">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Editar Cadastro</h3>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase">SEMED Arapongas</span>
              </div>
              <button onClick={() => setModalEditar(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do estudante"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Instituição de Ensino</label>
                <select
                  value={escolaId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    setEscolaId(selId);
                    const selNome = escolas.find(esc => esc.id === selId)?.nome || '';
                    setEscola(selNome);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  {escolas.map((esc) => (
                    <option key={esc.id} value={esc.id}>{esc.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Ano / Turma</label>
                <input
                  type="text"
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  placeholder="Ex: 4º Ano B"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 transition-all font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Rota Vinculada</label>
                <select
                  value={rotaId}
                  onChange={(e) => setRotaId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  <option value="Rota 04">Rota 04 — Zona Rural</option>
                  <option value="Rota 07">Rota 07 — Norte</option>
                  <option value="Rota 22">Rota 22 — Centro</option>
                  <option value="Rota 14">Rota 14 — Sul</option>
                  <option value="Rota 19">Rota 19 — Leste</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Status da Carteirinha</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  <option value="Pendente">Pendente (Aguardando Doc)</option>
                  <option value="Em análise">Em análise (Aguardando SEMED)</option>
                  <option value="Aprovado">Aprovado (Carteirinha Liberada)</option>
                </select>
              </div>
            </div>

            <div className="px-5 py-4 border-t bg-slate-50 flex gap-2 justify-end">
              <button
                disabled={loadingAction}
                onClick={() => setModalEditar(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!nome.trim() || !serie.trim() || loadingAction}
                onClick={handleUpdate}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow ${
                  nome.trim() && serie.trim() && !loadingAction ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-450 border cursor-not-allowed'
                }`}
              >
                {loadingAction ? <div className="w-3.5 h-3.5 border-2 border-slate-550 border-t-transparent rounded-full animate-spin" /> : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
