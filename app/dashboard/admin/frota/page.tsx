'use client';

import { useState, useEffect } from 'react';
import { Bus, Plus, Filter, Download, X, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '../../../../utils/supabase/client';

interface VeiculoAdmin {
  id: string;
  placa: string;
  modelo: string;
  capacidade: number | string;
  motorista: string;
  tipo: 'Próprio' | 'Terceirizado' | 'Pendente';
  status: 'Ativo' | 'Manutenção' | 'Aguardando';
  rota_id?: string | null;
  rota_nome?: string | null;
  is_motorista_avulso?: boolean;
}

const VEICULOS_MOCK: VeiculoAdmin[] = [
  { id: 'v1', placa: 'AAA-1234', modelo: 'Microônibus Volare W9', capacidade: 28, motorista: 'Carlos Alberto Silva', tipo: 'Próprio', status: 'Ativo', rota_id: 'r1', rota_nome: 'RT-07 - Região Norte' },
  { id: 'v2', placa: 'BBB-5678', modelo: 'Ônibus Mercedes-Benz OF-1721', capacidade: 52, motorista: 'Marcos Vinícius Souza', tipo: 'Terceirizado', status: 'Ativo', rota_id: 'r2', rota_nome: 'RT-14 - Zona Rural' },
  { id: 'v3', placa: 'CCC-9012', modelo: 'Van Renault Master', capacidade: 15, motorista: 'Ana Julia Santos', tipo: 'Próprio', status: 'Manutenção', rota_id: null, rota_nome: 'Nenhuma rota atribuída' },
  { id: 'v4', placa: 'DDD-3456', modelo: 'Ônibus Volkswagen 17.230', capacidade: 46, motorista: 'Roberto Ferreira', tipo: 'Terceirizado', status: 'Ativo', rota_id: 'r4', rota_nome: 'RT-03 - Região Sul' },
  { id: 'v5', placa: 'EEE-7890', modelo: 'Microônibus Iveco Daily', capacidade: 22, motorista: 'Sandra Aparecida Lima', tipo: 'Próprio', status: 'Ativo', rota_id: 'r5', rota_nome: 'RT-19 - Leste' }
];

const ROTAS_MOCK_DISPONIVEIS = [
  { id: 'r1', codigo: 'RT-07', nome: 'Região Norte' },
  { id: 'r2', codigo: 'RT-14', nome: 'Zona Rural' },
  { id: 'r3', codigo: 'RT-22', nome: 'Centro' },
  { id: 'r4', codigo: 'RT-03', nome: 'Região Sul' },
  { id: 'r5', codigo: 'RT-19', nome: 'Leste' }
];

export default function FrotaPage() {
  const supabase = createClient();

  const [veiculos, setVeiculos] = useState<VeiculoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'Todos' | 'Próprio' | 'Terceirizado' | 'Manutenção' | 'Pendente'>('Todos');
  const [usandoMock, setUsandoMock] = useState(false);

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Estados dos Modais
  const [modalNovo, setModalNovo] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [modalRota, setModalRota] = useState(false);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<VeiculoAdmin | null>(null);
  const [rotaSelecionada, setRotaSelecionada] = useState<string>('');
  const [rotasDisponiveis, setRotasDisponiveis] = useState<any[]>([]);

  // Form Fields
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [capacidade, setCapacidade] = useState(28);
  const [motorista, setMotorista] = useState('');
  const [tipo, setTipo] = useState<'Próprio' | 'Terceirizado'>('Próprio');
  const [status, setStatus] = useState<'Ativo' | 'Manutenção'>('Ativo');

  // Estado de Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Estados dos motoristas reais
  const [motoristasReal, setMotoristasReal] = useState<any[]>([]);
  const [modalMotorista, setModalMotorista] = useState(false);
  const [motNome, setMotNome] = useState('');
  const [motCpf, setMotCpf] = useState('');
  const [motTelefone, setMotTelefone] = useState('');
  const [motPlaca, setMotPlaca] = useState('');
  const [motModelo, setMotModelo] = useState('');
  const [motCapacidade, setMotCapacidade] = useState(15);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadVeiculos();
  }, []);

  async function loadVeiculos() {
    setLoading(true);
    try {
      // 1. Busca motoristas reais cadastrados no banco
      const { data: motData, error: motError } = await supabase
        .from('perfis')
        .select('id, nome')
        .eq('tipo_usuario', 'Motorista')
        .order('nome', { ascending: true });

      const listMots = motData || [];
      setMotoristasReal(listMots);

      // 1.2 Busca rotas cadastradas no banco
      const { data: dbRotas, error: rotasError } = await supabase
        .from('rotas')
        .select('id, codigo, nome, veiculo_id')
        .order('nome', { ascending: true });

      const listRotas = dbRotas || [];
      setRotasDisponiveis(listRotas);

      // 2. Busca veículos cadastrados no banco
      const { data, error } = await supabase
        .from('veiculos')
        .select('*');

      if (!error && data && data.length > 0) {
        const mapped: VeiculoAdmin[] = data.map((v: any) => {
          // De-para de UUID para Nome do motorista
          const motEncontrado = listMots.find((m: any) => m.id === v.motorista_id);
          const rotaAssociada = listRotas.find((r: any) => r.veiculo_id === v.id);
          return {
            id: v.id,
            placa: v.placa,
            modelo: v.modelo,
            capacidade: v.capacidade,
            motorista: motEncontrado ? motEncontrado.nome : (v.motorista_id ?? 'Motorista não atribuído'),
            tipo: (v.tipo as any) ?? 'Próprio',
            status: (v.status as any) ?? 'Ativo',
            rota_id: rotaAssociada ? rotaAssociada.id : null,
            rota_nome: rotaAssociada ? `${rotaAssociada.codigo} - ${rotaAssociada.nome}` : 'Nenhuma rota atribuída'
          };
        });
        
        const motoristasComVeiculo = new Set(data.map((v: any) => v.motorista_id).filter(Boolean));
        const avulsos: VeiculoAdmin[] = listMots
          .filter((m: any) => !motoristasComVeiculo.has(m.id))
          .map((m: any) => ({
            id: `mot-${m.id}`,
            placa: '—',
            modelo: 'Aguardando Veículo',
            capacidade: '—',
            motorista: m.nome,
            tipo: 'Pendente',
            status: 'Aguardando',
            rota_id: null,
            rota_nome: 'Nenhuma rota',
            is_motorista_avulso: true
          }));

        setVeiculos([...mapped, ...avulsos]);
        setUsandoMock(false);
      } else {
        setVeiculos(VEICULOS_MOCK);
        setRotasDisponiveis(ROTAS_MOCK_DISPONIVEIS);
        setUsandoMock(true);
      }
    } catch (err) {
      console.error('Erro ao buscar dados de frota:', err);
      setVeiculos(VEICULOS_MOCK);
      setRotasDisponiveis(ROTAS_MOCK_DISPONIVEIS);
      setUsandoMock(true);
    } finally {
      setLoading(false);
    }
  }

  // Ação para criar motorista no Auth + Banco via API Route
  const handleCreateMotorista = async () => {
    if (!motNome.trim() || !motCpf.trim()) return;
    setLoadingAction(true);
    try {
      const res = await fetch('/api/admin/motoristas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: motNome,
          cpf: motCpf,
          telefone: motTelefone,
          placa: motPlaca,
          modelo: motModelo,
          capacidade: Number(motCapacidade)
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Erro ao cadastrar motorista.');
      }

      showToast(data.message || 'Motorista cadastrado com sucesso!', 'success');
      setModalMotorista(false);
      
      // Limpa formulário
      setMotNome('');
      setMotCpf('');
      setMotTelefone('');
      setMotPlaca('');
      setMotModelo('');
      
      // Recarrega
      await loadVeiculos();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erro ao realizar cadastro.', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCreate = async () => {
    if (!placa.trim() || !modelo.trim() || !motorista.trim()) return;
    setLoadingAction(true);
    try {
      let createdId = `v-gen-${Date.now()}`;
      
      if (!usandoMock) {
        const { data, error } = await supabase
          .from('veiculos')
          .insert({
            placa: placa.toUpperCase(),
            modelo,
            capacidade: Number(capacidade),
            motorista_id: motorista,
            tipo,
            status
          })
          .select('id')
          .maybeSingle();

        if (error) throw error;
        if (data?.id) createdId = data.id;
      }

      const novo: VeiculoAdmin = {
        id: createdId,
        placa: placa.toUpperCase(),
        modelo,
        capacidade: Number(capacidade),
        motorista,
        tipo,
        status
      };

      setVeiculos(prev => [novo, ...prev]);
      setModalNovo(false);
      setPlaca('');
      setModelo('');
      setMotorista('');
      showToast('Veículo registrado com sucesso!', 'success');
    } catch {
      const mockNovo: VeiculoAdmin = {
        id: `v-mock-${Date.now()}`,
        placa: placa.toUpperCase(),
        modelo,
        capacidade: Number(capacidade),
        motorista,
        tipo,
        status
      };
      setVeiculos(prev => [mockNovo, ...prev]);
      setModalNovo(false);
      setPlaca('');
      setModelo('');
      setMotorista('');
      showToast('Veículo registrado na simulação!', 'success');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const novoStatus = currentStatus === 'Ativo' ? 'Manutenção' : 'Ativo';
    const isMock = id.startsWith('v-mock-') || id.startsWith('v-gen-') || id.startsWith('v1') || id.startsWith('v2') || id.startsWith('v3') || id.startsWith('v4') || id.startsWith('v5') || usandoMock;

    try {
      if (!isMock) {
        const { error } = await supabase
          .from('veiculos')
          .update({ status: novoStatus })
          .eq('id', id);

        if (error) throw error;
      }

      setVeiculos(prev => prev.map(v => v.id === id ? { ...v, status: novoStatus } : v));
      showToast('Status do veículo atualizado com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao alternar status do veículo:', err);
      showToast('Erro ao atualizar status no banco.', 'error');
    }
  };

  const handleAbrirModalRota = (veiculo: VeiculoAdmin) => {
    setVeiculoSelecionado(veiculo);
    const rId = veiculo.rota_id ?? '';
    setRotaSelecionada(rId);
    setModalRota(true);
  };

  const handleSalvarVinculoRota = async () => {
    if (!veiculoSelecionado) return;
    setLoadingAction(true);
    try {
      const vId = veiculoSelecionado.id;
      const rId = rotaSelecionada; // Pode ser '' (desvincular)

      const isMock = vId.startsWith('v-mock-') || vId.startsWith('v-gen-') || vId.startsWith('v1') || vId.startsWith('v2') || vId.startsWith('v3') || vId.startsWith('v4') || vId.startsWith('v5') || usandoMock;

      if (!isMock) {
        // 1. Limpa o veiculo_id de qualquer rota que estava anteriormente vinculada a este veículo
        await supabase
          .from('rotas')
          .update({ veiculo_id: null })
          .eq('veiculo_id', vId);

        // 2. Se selecionou uma nova rota, atualiza ela com o veiculo_id do veículo correspondente
        if (rId) {
          const { error } = await supabase
            .from('rotas')
            .update({ veiculo_id: vId })
            .eq('id', rId);

          if (error) throw error;
        }
      }

      // Atualiza localmente o estado
      setVeiculos(prev => prev.map(v => {
        if (v.id === veiculoSelecionado.id) {
          const rObj = rotasDisponiveis.find(r => r.id === rId);
          return {
            ...v,
            rota_id: rId || null,
            rota_nome: rObj ? `${rObj.codigo} - ${rObj.nome}` : 'Nenhuma rota atribuída'
          };
        }
        // Se a rota selecionada for atribuída a este veículo, removemos o veículo das outras rotas localmente
        if (rId && v.rota_id === rId && v.id !== veiculoSelecionado.id) {
          return {
            ...v,
            rota_id: null,
            rota_nome: 'Nenhuma rota atribuída'
          };
        }
        return v;
      }));

      showToast('Vínculo de rota atualizado com sucesso!', 'success');
      setModalRota(false);
      // Se não for mock, recarrega para manter dados do banco consistentes
      if (!isMock) {
        await loadVeiculos();
      }
    } catch (err: any) {
      console.error('Erro ao vincular rota:', err);
      showToast('Erro ao atualizar vínculo no banco.', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const filteredVeiculos = veiculos.filter(v => {
    if (filterType === 'Todos') return true;
    if (filterType === 'Manutenção') return v.status === 'Manutenção';
    return v.tipo === filterType && v.status !== 'Manutenção';
  });

  const totalPages = Math.ceil(filteredVeiculos.length / itemsPerPage);
  const paginatedVeiculos = filteredVeiculos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans">Frota e Veículos</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Controle do transporte municipal, veículos em trânsito e manutenção de Arapongas — {veiculos.length} veículos.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMotNome('');
              setMotCpf('');
              setMotTelefone('');
              setMotPlaca('');
              setMotModelo('');
              setModalMotorista(true);
            }}
            className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border shadow-sm"
          >
            <Plus size={14} className="text-amber-500" />
            <span>Novo Motorista</span>
          </button>
          <button
            onClick={() => {
              setPlaca('');
              setModelo('');
              setMotorista('');
              setModalNovo(true);
            }}
            className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow"
          >
            <Plus size={14} className="text-amber-500" />
            <span>Novo Veículo</span>
          </button>
        </div>
      </div>

      {/* Tabela de Frota */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Filter size={14} className="text-amber-500" />
            <span>Filtrar Frota:</span>
            <div className="flex gap-1.5 ml-2">
              {(['Todos', 'Próprio', 'Terceirizado', 'Manutenção', 'Pendente'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setFilterType(t); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                    filterType === t 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {usandoMock && (
            <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-200/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Modo Demonstração
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-bold">Carregando frota...</span>
            </div>
          ) : filteredVeiculos.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <span className="text-3xl">🚌</span>
              <h3 className="text-sm font-bold text-slate-900">Nenhum veículo nesta categoria</h3>
              <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                Adicione novos ônibus, vans ou microônibus para iniciar a gestão local.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Placa</th>
                  <th className="py-3 px-4">Modelo do Veículo</th>
                  <th className="py-3 px-4">Capacidade</th>
                  <th className="py-3 px-4">Motorista Atribuído</th>
                  <th className="py-3 px-4">Rota Atribuída</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedVeiculos.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{v.placa}</td>
                    <td className="py-3.5 px-4 text-slate-600">{v.modelo}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{v.capacidade} {v.capacidade !== '—' && 'lugares'}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">{v.motorista}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold text-amber-600">{v.rota_nome ?? 'Nenhuma rota'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider ${
                        v.tipo === 'Próprio' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 
                        v.tipo === 'Terceirizado' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                        'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        {v.tipo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        v.status === 'Ativo' ? 'bg-emerald-50 border-emerald-250 text-emerald-700' : 
                        v.status === 'Manutenção' ? 'bg-rose-50 border-rose-250 text-rose-700' :
                        'bg-amber-50 border-amber-250 text-amber-700'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${v.status === 'Ativo' ? 'bg-emerald-500' : v.status === 'Manutenção' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center flex items-center justify-center gap-1.5">
                      {!v.is_motorista_avulso ? (
                        <>
                          <button
                            onClick={() => handleToggleStatus(v.id, v.status)}
                            className="py-1 px-2.5 rounded-lg text-[10px] font-extrabold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border shadow-sm"
                          >
                            Alternar Status
                          </button>
                          <button
                            onClick={() => handleAbrirModalRota(v)}
                            className="py-1 px-2.5 rounded-lg text-[10px] font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors border-0 shadow-sm animate-pulse"
                          >
                            Vincular Rota
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setPlaca('');
                            setModelo('');
                            setCapacidade(28);
                            setMotorista(v.id.replace('mot-', ''));
                            setTipo('Próprio');
                            setStatus('Ativo');
                            setModalNovo(true);
                          }}
                          className="py-1 px-2.5 rounded-lg text-[10px] font-extrabold bg-slate-900 text-white hover:bg-slate-800 transition-colors border-0 shadow-sm"
                        >
                          Atribuir Veículo
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Controles de Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2 px-2">
                <span className="text-[11px] text-slate-500 font-bold">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredVeiculos.length)} de {filteredVeiculos.length} veículos
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-7 h-7 rounded-lg text-xs font-extrabold transition-colors ${
                          currentPage === i + 1
                            ? 'bg-slate-900 text-white shadow'
                            : 'text-slate-600 hover:bg-slate-100 border border-slate-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* MODAL: NOVO MOTORISTA */}
      {modalMotorista && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border flex flex-col animate-fadeIn">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Registrar Motorista Real</h3>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase font-mono">SEMED Arapongas</span>
              </div>
              <button onClick={() => setModalMotorista(false)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={motNome}
                  onChange={(e) => setMotNome(e.target.value)}
                  placeholder="Nome do motorista"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">CPF (Somente Números - Login)</label>
                <input
                  type="text"
                  value={motCpf}
                  onChange={(e) => setMotCpf(e.target.value)}
                  placeholder="Ex: 12345678900"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Telefone (Opcional)</label>
                <input
                  type="text"
                  value={motTelefone}
                  onChange={(e) => setMotTelefone(e.target.value)}
                  placeholder="Ex: 43999998888"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all font-mono"
                />
              </div>

              <div className="border-t border-dashed my-2 pt-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">Vínculo de Veículo (Opcional)</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Placa do Veículo</label>
                    <input
                      type="text"
                      value={motPlaca}
                      onChange={(e) => setMotPlaca(e.target.value)}
                      placeholder="Ex: AAA-1234"
                      className="w-full px-3 py-2 rounded-lg border text-[11px] font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Modelo do Veículo</label>
                    <input
                      type="text"
                      value={motModelo}
                      onChange={(e) => setMotModelo(e.target.value)}
                      placeholder="Ex: Van Renault"
                      className="w-full px-3 py-2 rounded-lg border text-[11px] font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Capacidade (Lugares)</label>
                  <input
                    type="number"
                    value={motCapacidade}
                    onChange={(e) => setMotCapacidade(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border text-[11px] font-bold text-slate-850 focus:outline-none focus:border-slate-900 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t bg-slate-50 flex gap-2 justify-end">
              <button
                disabled={loadingAction}
                onClick={() => setModalMotorista(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!motNome.trim() || !motCpf.trim() || loadingAction}
                onClick={handleCreateMotorista}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow ${
                  motNome.trim() && motCpf.trim() && !loadingAction ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-450 border cursor-not-allowed'
                }`}
              >
                {loadingAction ? <div className="w-3.5 h-3.5 border-2 border-slate-550 border-t-transparent rounded-full animate-spin" /> : 'Salvar Motorista'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO VEÍCULO */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border flex flex-col animate-fadeIn">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Registrar Veículo</h3>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase font-mono">SEMED Arapongas</span>
              </div>
              <button onClick={() => setModalNovo(false)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Placa do Veículo</label>
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  placeholder="Ex: AAA-1234"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Modelo do Veículo</label>
                <input
                  type="text"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Ex: Volare W9 Escolar"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Capacidade (Lugares)</label>
                <input
                  type="number"
                  value={capacidade}
                  onChange={(e) => setCapacidade(Number(e.target.value))}
                  placeholder="Ex: 28"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 transition-all font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Motorista Atribuído</label>
                <select
                  value={motorista}
                  onChange={(e) => setMotorista(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  <option value="">-- Selecione o Motorista --</option>
                  {motoristasReal.map((mot) => (
                    <option key={mot.id} value={mot.id}>{mot.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Tipo de Frota</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  <option value="Próprio">Próprio (Prefeitura)</option>
                  <option value="Terceirizado">Terceirizado (Prestador)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Status Operacional</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  <option value="Ativo">Ativo (Em trânsito)</option>
                  <option value="Manutenção">Manutenção (Oficina)</option>
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
                disabled={!placa.trim() || !modelo.trim() || !motorista.trim() || loadingAction}
                onClick={handleCreate}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow ${
                  placa.trim() && modelo.trim() && !loadingAction ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-450 border cursor-not-allowed'
                }`}
              >
                {loadingAction ? <div className="w-3.5 h-3.5 border-2 border-slate-550 border-t-transparent rounded-full animate-spin" /> : 'Registrar Veículo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VINCULAR ROTA */}
      {modalRota && veiculoSelecionado && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border flex flex-col animate-fadeIn">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Vincular Rota ao Veículo</h3>
                <span className="text-[9px] text-amber-500 font-extrabold block mt-0.5 uppercase font-mono">
                  Placa: {veiculoSelecionado.placa} ({veiculoSelecionado.modelo})
                </span>
              </div>
              <button onClick={() => setModalRota(false)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Selecione a Rota Escolar</label>
                <select
                  value={rotaSelecionada}
                  onChange={(e) => setRotaSelecionada(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  <option value="">-- Nenhuma Rota (Desvincular) --</option>
                  {rotasDisponiveis.map((rota) => (
                    <option key={rota.id} value={rota.id}>
                      {rota.codigo} - {rota.nome}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  Ao vincular, esta rota será atribuída a este veículo e exibida no mapa e nos painéis operacionais do RotaEscola.
                </p>
              </div>
            </div>

            <div className="px-5 py-4 border-t bg-slate-50 flex gap-2 justify-end">
              <button
                disabled={loadingAction}
                onClick={() => setModalRota(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={loadingAction}
                onClick={handleSalvarVinculoRota}
                className="py-2.5 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                {loadingAction ? <div className="w-3.5 h-3.5 border-2 border-slate-550 border-t-transparent rounded-full animate-spin" /> : 'Confirmar Vínculo'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
