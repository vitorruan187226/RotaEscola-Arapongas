'use client';

import { useState } from 'react';
import { Wrench, X, CheckCircle2, Send } from 'lucide-react';
import { createClient } from '../../utils/supabase/client';

interface MecanicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  rotaNome: string;
  onToast: (message: string, type: 'success' | 'error') => void;
}

export function MecanicoModal({ isOpen, onClose, rotaNome, onToast }: MecanicoModalProps) {
  const [mecanicoOption, setMecanicoOption] = useState('');
  const [mecanicoDetalhes, setMecanicoDetalhes] = useState('');
  const [enviandoMecanico, setEnviandoMecanico] = useState(false);
  const [mecanicoEnviado, setMecanicoEnviado] = useState(false);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleEnviarMecanico = async () => {
    if (!mecanicoOption) return;
    setEnviandoMecanico(true);
    try {
      const msg = `O motorista relatou um problema de "${mecanicoOption}" na Rota ${rotaNome}. Detalhes: ${mecanicoDetalhes.trim() || 'Nenhum.'}`;
      
      const { error } = await supabase.from('notificacoes').insert({
        aluno_id: null,
        titulo: '🔧 Falha Mecânica Reportada',
        mensagem: msg,
        lida: false
      });
      if (error) throw error;

      setMecanicoEnviado(true);
      setTimeout(() => {
        onClose();
        setMecanicoOption('');
        setMecanicoDetalhes('');
        setMecanicoEnviado(false);
      }, 2500);
    } catch (err: any) {
      console.error('Erro ao enviar relatório mecânico:', err);
      onToast(err.message || 'Falha ao enviar alerta mecânico à central.', 'error');
    } finally {
      setEnviandoMecanico(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col rounded-[36px] overflow-hidden animate-fadeIn" style={{ backgroundColor: '#020617' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-slate-900/90">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400">
            <Wrench size={16} />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-white tracking-tight">Problema Mecânico</h3>
            <p className="text-[9px] text-slate-400 mt-0.5">Informe o estado do veículo para a central</p>
          </div>
        </div>
        <button
          onClick={() => {
            onClose();
            setMecanicoOption('');
            setMecanicoDetalhes('');
          }}
          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors border-0 cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5">
        {!mecanicoEnviado ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                Selecione o Tipo de Falha
              </label>
              <div className="flex flex-col gap-2">
                {[
                  'Pneu Furado',
                  'Superaquecimento do Motor',
                  'Problema Elétrico / Bateria',
                  'Falha no Freio / Direção',
                  'Pane Mecânica Geral'
                ].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMecanicoOption(option)}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      mecanicoOption === option
                        ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                        : 'bg-slate-900 border-slate-805 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                Informações Adicionais (Opcional)
              </label>
              <textarea
                value={mecanicoDetalhes}
                onChange={(e) => setMecanicoDetalhes(e.target.value)}
                placeholder="Descreva detalhes como a sua localização exata ou gravidade da pane..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-750 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none resize-none transition-colors leading-relaxed"
              />
            </div>

            <button
              onClick={handleEnviarMecanico}
              disabled={!mecanicoOption || enviandoMecanico}
              className={`w-full py-4 rounded-2xl text-[10px] font-extrabold tracking-widest uppercase flex items-center justify-center gap-2 transition-all border-0 ${
                mecanicoOption && !enviandoMecanico
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_8px_20px_rgba(245,158,11,0.25)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer font-black'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {enviandoMecanico ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={13} />
                  <span>Enviar Relatório à Central</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-emerald-400 uppercase tracking-widest font-mono">ENVIADO COM SUCESSO!</h4>
              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                A central operacional SEMED recebeu seu alerta mecânico e iniciará o protocolo de assistência.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
