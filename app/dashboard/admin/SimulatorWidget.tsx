'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { Calendar, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface AlunoCard {
  id: string;
  nome: string;
  cardId?: string;
  dataVencimento?: string | null;
}

export default function SimulatorWidget() {
  const supabase = createClient();
  const [alunos, setAlunos] = useState<AlunoCard[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  async function loadAlunosAndCards() {
    try {
      setFetching(true);
      // Busca todos os alunos
      const { data: alunosData, error: alunosError } = await supabase
        .from('alunos')
        .select('id, nome')
        .order('nome', { ascending: true });

      if (alunosError) throw alunosError;

      if (alunosData) {
        // Busca as carteirinhas associadas
        const { data: cardsData, error: cardsError } = await supabase
          .from('carteirinhas')
          .select('id, aluno_id, data_vencimento');

        if (cardsError) {
          console.warn('Erro ao carregar carteirinhas (talvez coluna data_vencimento ainda nao exista):', cardsError);
        }

        const mapped = alunosData.map((aluno: any) => {
          const card = cardsData?.find((c: any) => c.aluno_id === aluno.id);
          return {
            id: aluno.id,
            nome: aluno.nome,
            cardId: card?.id,
            dataVencimento: card?.data_vencimento,
          };
        });

        setAlunos(mapped);
        if (mapped.length > 0) {
          setSelectedAlunoId(mapped[0].id);
          if (mapped[0].dataVencimento) {
            setNewDate(mapped[0].dataVencimento.split('T')[0]);
          } else {
            // Padrão: hoje + 1 ano
            const d = new Date();
            d.setFullYear(d.getFullYear() + 1);
            setNewDate(d.toISOString().split('T')[0]);
          }
        }
      }
    } catch (err: any) {
      console.error('Erro ao carregar simulador:', err);
      showToast('Falha ao carregar alunos do simulador.', 'error');
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    loadAlunosAndCards();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAlunoChange = (alunoId: string) => {
    setSelectedAlunoId(alunoId);
    const aluno = alunos.find(a => a.id === alunoId);
    if (aluno?.dataVencimento) {
      setNewDate(aluno.dataVencimento.split('T')[0]);
    } else {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      setNewDate(d.toISOString().split('T')[0]);
    }
  };

  const handleSimulate = async () => {
    if (!selectedAlunoId || !newDate) return;
    setLoading(true);

    try {
      const selected = alunos.find(a => a.id === selectedAlunoId);
      const isoDate = new Date(newDate + 'T23:59:59').toISOString();

      if (selected?.cardId) {
        // Atualiza carteirinha existente
        const { error } = await supabase
          .from('carteirinhas')
          .update({ data_vencimento: isoDate })
          .eq('id', selected.cardId);

        if (error) throw error;
      } else {
        // Cria carteirinha nova para teste se não existir
        const hashSecure = `rotaescola_arapongas_${selectedAlunoId}_secure_${Date.now().toString().slice(-4)}`;
        const { error } = await supabase
          .from('carteirinhas')
          .insert({
            aluno_id: selectedAlunoId,
            qr_code_hash: hashSecure,
            data_vencimento: isoDate,
            status_carteirinha: 'Ativa'
          });

        if (error) throw error;
      }

      showToast('Validade da carteirinha atualizada com sucesso!', 'success');
      // Recarrega dados
      await loadAlunosAndCards();
    } catch (err: any) {
      console.error('Erro ao simular validade:', err);
      showToast(err.message || 'Erro ao atualizar validade da carteirinha.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden">
      
      {/* Toast interno */}
      {toast && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn border text-[10px] font-bold text-white ${
          toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-rose-600 border-rose-500'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
          <span>{toast.text}</span>
        </div>
      )}

      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
          <Calendar size={16} />
        </div>
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider leading-none">
            Simulador de Validade de Carteirinhas
          </h3>
          <p className="text-[10px] text-slate-400 font-bold mt-1">
            Ferramenta de testes para alterar e simular o vencimento de credenciais (1 ano).
          </p>
        </div>
      </div>

      {fetching ? (
        <div className="flex items-center justify-center py-8 gap-2 text-slate-400 text-xs">
          <Loader2 size={16} className="animate-spin" />
          <span>Carregando estudantes...</span>
        </div>
      ) : alunos.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">Nenhum estudante municipal cadastrado para teste.</p>
      ) : (
        <div className="space-y-4">
          {/* Dropdown Aluno */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selecionar Estudante</label>
            <select
              value={selectedAlunoId}
              onChange={(e) => handleAlunoChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-amber-500 transition-colors cursor-pointer"
            >
              {alunos.map(a => (
                <option key={a.id} value={a.id}>
                  {a.nome} {a.dataVencimento ? ' (Tem Carteirinha)' : ' (Sem Carteirinha)'}
                </option>
              ))}
            </select>
          </div>

          {/* Datepicker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nova Data de Vencimento</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-amber-500 transition-colors cursor-pointer"
            />
            <span className="text-[9px] text-slate-400 font-medium">
              💡 Dica: escolha uma data no passado (ex: ontem) para ver a carteirinha expirar e bloquear na tela do responsável!
            </span>
          </div>

          {/* Botão Ação */}
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border-0"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <span>Definir e Testar Vencimento</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
