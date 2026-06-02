'use client';

import { useState, useEffect } from 'react';
import { Bus, Plus, Filter, Download, X, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '../../../../utils/supabase/client';

interface VeiculoAdmin {
  id: string;
  placa: string;
  modelo: string;
  capacidade: number;
  motorista: string;
  tipo: 'Próprio' | 'Terceirizado';
  status: 'Ativo' | 'Manutenção';
}

const VEICULOS_MOCK: VeiculoAdmin[] = [
  { id: 'v1', placa: 'AAA-1234', modelo: 'Microônibus Volare W9', capacidade: 28, motorista: 'Carlos Alberto Silva', tipo: 'Próprio', status: 'Ativo' },
  { id: 'v2', placa: 'BBB-5678', modelo: 'Ônibus Mercedes-Benz OF-1721', capacidade: 52, motorista: 'Marcos Vinícius Souza', tipo: 'Terceirizado', status: 'Ativo' },
  { id: 'v3', placa: 'CCC-9012', modelo: 'Van Renault Master', capacidade: 15, motorista: 'Ana Julia Santos', tipo: 'Próprio', status: 'Manutenção' },
  { id: 'v4', placa: 'DDD-3456', modelo: 'Ônibus Volkswagen 17.230', capacidade: 46, motorista: 'Roberto Ferreira', tipo: 'Terceirizado', status: 'Ativo' },
  { id: 'v5', placa: 'EEE-7890', modelo: 'Microônibus Iveco Daily', capacidade: 22, motorista: 'Sandra Aparecida Lima', tipo: 'Próprio', status: 'Ativo' }
];

export default function FrotaPage() {
  const supabase = createClient();

  const [veiculos, setVeiculos] = useState<VeiculoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'Todos' | 'Próprio' | 'Terceirizado' | 'Manutenção'>('Todos');
  const [usandoMock, setUsandoMock] = useState(false);

  // Estados dos Modais
  const [modalNovo, setModalNovo] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // Form Fields
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [capacidade, setCapacidade] = useState(28);
  const [motorista, setMotorista] = useState('');
  const [tipo, setTipo] = useState<'Próprio' | 'Terceirizado'>('Próprio');
  const [status, setStatus] = useState<'Ativo' | 'Manutenção'>('Ativo');

  // Estado de Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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
      const { data, error } = await supabase
        .from('veiculos')
        .select('*');

      if (!error && data && data.length > 0) {
        const mapped: VeiculoAdmin[] = data.map((v: any) => ({
          id: v.id,
          placa: v.placa,
          modelo: v.modelo,
          capacidade: v.capacidade,
          motorista: v.motorista_id ?? 'Motorista não atribuído',
          tipo: (v.tipo as any) ?? 'Próprio',
          status: (v.status as any) ?? 'Ativo'
        }));
        setVeiculos(mapped);
        setUsandoMock(false);
      } else {
        setVeiculos(VEICULOS_MOCK);
        setUsandoMock(true);
      }
    } catch {
      setVeiculos(VEICULOS_MOCK);
      setUsandoMock(true);
    } finally {
      setLoading(false);
    }
  }

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

  const filteredVeiculos = veiculos.filter(v => {
    if (filterType === 'Todos') return true;
    if (filterType === 'Manutenção') return v.status === 'Manutenção';
    return v.tipo === filterType && v.status !== 'Manutenção';
  });

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
              {(['Todos', 'Próprio', 'Terceirizado', 'Manutenção'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
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
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Placa</th>
                  <th className="py-3 px-4">Modelo do Veículo</th>
                  <th className="py-3 px-4">Capacidade</th>
                  <th className="py-3 px-4">Motorista Atribuído</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredVeiculos.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{v.placa}</td>
                    <td className="py-3.5 px-4 text-slate-600">{v.modelo}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{v.capacidade} lugares</td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">{v.motorista}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider ${
                        v.tipo === 'Próprio' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-orange-50 border-orange-200 text-orange-700'
                      }`}>
                        {v.tipo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        v.status === 'Ativo' ? 'bg-emerald-50 border-emerald-250 text-emerald-700' : 'bg-rose-50 border-rose-250 text-rose-700'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${v.status === 'Ativo' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

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
                <input
                  type="text"
                  value={motorista}
                  onChange={(e) => setMotorista(e.target.value)}
                  placeholder="Nome do motorista"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
                />
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

    </div>
  );
}
