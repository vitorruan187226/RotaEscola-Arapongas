'use client';

import { useState, useEffect } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, X, AlertCircle, CheckCircle, MapPin, Clock } from 'lucide-react';
import { createClient } from '../../../../utils/supabase/client';

interface Escola {
  id: string;
  nome: string;
  endereco: string;
  turnos: string[]; // ['Manhã', 'Tarde', 'Noite']
}

const ESCOLAS_MOCK: Escola[] = [
  { id: 'escola-mock-1', nome: 'Escola Municipal Dorcelina Folador', endereco: 'Rua das Gralhas, 123 - Arapongas', turnos: ['Manhã', 'Tarde'] },
  { id: 'escola-mock-2', nome: 'Colégio Estadual Julia Wanderley', endereco: 'Av. Arapongas, 456 - Centro', turnos: ['Manhã', 'Tarde', 'Noite'] },
  { id: 'escola-mock-3', nome: 'Escola Municipal Codorna', endereco: 'Rua Codorna, 789 - Zona Sul', turnos: ['Manhã', 'Tarde'] }
];

export default function EscolasPage() {
  const supabase = createClient();
  
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [usandoMock, setUsandoMock] = useState(false);

  // Estados dos Modais
  const [modalNovo, setModalNovo] = useState(false);
  const [modalEditar, setModalEditar] = useState<Escola | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Form Fields (Novo / Editar)
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [turnos, setTurnos] = useState<string[]>([]); // ['Manhã', 'Tarde']

  // Estado de Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadEscolas();
  }, []);

  async function loadEscolas() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('escolas')
        .select('id, nome, endereco, turnos')
        .order('nome', { ascending: true });

      if (!error && data && data.length > 0) {
        setEscolas(data as Escola[]);
        setUsandoMock(false);
      } else {
        setEscolas(ESCOLAS_MOCK);
        setUsandoMock(true);
      }
    } catch {
      setEscolas(ESCOLAS_MOCK);
      setUsandoMock(true);
    } finally {
      setLoading(false);
    }
  }

  const toggleTurno = (turno: string) => {
    if (turnos.includes(turno)) {
      setTurnos(prev => prev.filter(t => t !== turno));
    } else {
      setTurnos(prev => [...prev, turno]);
    }
  };

  const handleCreate = async () => {
    if (!nome.trim() || !endereco.trim() || turnos.length === 0) return;
    setLoadingAction(true);
    try {
      let createdId = `escola-gen-${Date.now()}`;
      
      if (!usandoMock) {
        const { data, error } = await supabase
          .from('escolas')
          .insert({
            nome,
            endereco,
            turnos
          })
          .select('id')
          .maybeSingle();

        if (error) throw error;
        if (data?.id) createdId = data.id;
      }

      const nova: Escola = {
        id: createdId,
        nome,
        endereco,
        turnos
      };

      setEscolas(prev => [nova, ...prev]);
      setModalNovo(false);
      setNome('');
      setEndereco('');
      setTurnos([]);
      showToast('Escola cadastrada com sucesso!', 'success');
    } catch (err: any) {
      console.warn('Erro ao salvar no banco. Salvando simulado localmente.', err.message);
      const mockNova: Escola = {
        id: `escola-mock-${Date.now()}`,
        nome,
        endereco,
        turnos
      };
      setEscolas(prev => [mockNova, ...prev]);
      setModalNovo(false);
      setNome('');
      setEndereco('');
      setTurnos([]);
      showToast('Cadastro simulado com sucesso!', 'success');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdate = async () => {
    if (!modalEditar || !nome.trim() || !endereco.trim() || turnos.length === 0) return;
    setLoadingAction(true);
    try {
      if (!usandoMock && !modalEditar.id.startsWith('escola-mock')) {
        const { error } = await supabase
          .from('escolas')
          .update({
            nome,
            endereco,
            turnos
          })
          .eq('id', modalEditar.id);

        if (error) throw error;
      }

      setEscolas(prev => prev.map(e => e.id === modalEditar.id ? {
        ...e,
        nome,
        endereco,
        turnos
      } : e));
      
      setModalEditar(null);
      setNome('');
      setEndereco('');
      setTurnos([]);
      showToast('Cadastro atualizado com sucesso!', 'success');
    } catch {
      setEscolas(prev => prev.map(e => e.id === modalEditar.id ? {
        ...e,
        nome,
        endereco,
        turnos
      } : e));
      setModalEditar(null);
      setNome('');
      setEndereco('');
      setTurnos([]);
      showToast('Cadastro atualizado localmente!', 'success');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover esta unidade escolar? Alunos vinculados ficarão sem escola associada.')) return;
    try {
      if (!usandoMock && !id.startsWith('escola-mock')) {
        const { error } = await supabase.from('escolas').delete().eq('id', id);
        if (error) throw error;
      }
      setEscolas(prev => prev.filter(e => e.id !== id));
      showToast('Unidade escolar excluída com sucesso.', 'success');
    } catch {
      setEscolas(prev => prev.filter(e => e.id !== id));
      showToast('Exclusão simulada com sucesso.', 'success');
    }
  };

  const filteredEscolas = escolas.filter(e =>
    e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.endereco.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Entidades Escolares</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Gestão do cadastro relacional de escolas atendidas pelo transporte escolar em Arapongas — {escolas.length} escolas catalogadas.
          </p>
        </div>
        <button
          onClick={() => {
            setNome('');
            setEndereco('');
            setTurnos([]);
            setModalNovo(true);
          }}
          className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow"
        >
          <Plus size={14} className="text-amber-500" />
          <span>Cadastrar Escola</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou endereço da escola..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-bold placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        {usandoMock && (
          <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-200/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Modo Demonstração
          </span>
        )}
      </div>

      {/* Tabela de Escolas */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-bold">Carregando escolas...</span>
            </div>
          ) : filteredEscolas.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <span className="text-3xl">🏫</span>
              <h3 className="text-sm font-bold text-slate-900">Nenhuma escola cadastrada</h3>
              <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                Adicione as escolas do município para que os responsáveis possam selecioná-las ao solicitar transporte escolar.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Nome da Escola</th>
                  <th className="py-3 px-4">Endereço</th>
                  <th className="py-3 px-4">Turnos Atendidos</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredEscolas.map((escola) => (
                  <tr key={escola.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400 shrink-0" />
                      <span>{escola.nome}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{escola.endereco}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {escola.turnos.map((turno) => (
                          <span
                            key={turno}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50"
                          >
                            <Clock size={8} />
                            {turno}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setNome(escola.nome);
                            setEndereco(escola.endereco);
                            setTurnos(escola.turnos);
                            setModalEditar(escola);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-950 transition-colors border border-transparent hover:border-slate-200"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(escola.id)}
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

      {/* MODAL: NOVA ESCOLA */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border flex flex-col animate-fadeIn">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Nova Escola</h3>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase">SEMED Arapongas</span>
              </div>
              <button onClick={() => setModalNovo(false)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nome da Escola</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome oficial da escola"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Endereço</label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, Número - Bairro"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Turnos Atendidos</label>
                <div className="flex flex-col gap-2 bg-slate-50 border p-3 rounded-2xl">
                  {['Manhã', 'Tarde', 'Noite'].map((turno) => (
                    <label key={turno} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={turnos.includes(turno)}
                        onChange={() => toggleTurno(turno)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-slate-700">{turno}</span>
                    </label>
                  ))}
                </div>
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
                disabled={!nome.trim() || !endereco.trim() || turnos.length === 0 || loadingAction}
                onClick={handleCreate}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow ${
                  nome.trim() && endereco.trim() && turnos.length > 0 && !loadingAction ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-450 border cursor-not-allowed'
                }`}
              >
                {loadingAction ? <div className="w-3.5 h-3.5 border-2 border-slate-550 border-t-transparent rounded-full animate-spin" /> : 'Salvar Escola'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR ESCOLA */}
      {modalEditar && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border flex flex-col animate-fadeIn">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Editar Escola</h3>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase">SEMED Arapongas</span>
              </div>
              <button onClick={() => setModalEditar(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nome da Escola</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome oficial da escola"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Endereço</label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, Número - Bairro"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Turnos Atendidos</label>
                <div className="flex flex-col gap-2 bg-slate-50 border p-3 rounded-2xl">
                  {['Manhã', 'Tarde', 'Noite'].map((turno) => (
                    <label key={turno} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={turnos.includes(turno)}
                        onChange={() => toggleTurno(turno)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-slate-700">{turno}</span>
                    </label>
                  ))}
                </div>
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
                disabled={!nome.trim() || !endereco.trim() || turnos.length === 0 || loadingAction}
                onClick={handleUpdate}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow ${
                  nome.trim() && endereco.trim() && turnos.length > 0 && !loadingAction ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-450 border cursor-not-allowed'
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
