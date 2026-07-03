'use client';

import { useState } from 'react';
import { AlertOctagon } from 'lucide-react';
import { createClient } from '../../utils/supabase/client';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  rotaNome: string;
  placa?: string;
  sosAtivo: boolean;
  setSosAtivo: (ativo: boolean) => void;
  onToast: (message: string, type: 'success' | 'error') => void;
}

export function SOSModal({ isOpen, onClose, rotaNome, placa, sosAtivo, setSosAtivo, onToast }: SOSModalProps) {
  const [enviandoSos, setEnviandoSos] = useState(false);
  const supabase = createClient();

  const handleDispararSos = async () => {
    setEnviandoSos(true);
    try {
      const msg = `🚨 EMERGÊNCIA SOS DISPARADA! O motorista da Rota ${rotaNome} (Veículo Placa: ${placa || '...'}) enviou um sinal de pânico imediato.`;

      const { error } = await supabase.from('notificacoes').insert({
        aluno_id: null,
        titulo: '🚨 ALERTA DE EMERGÊNCIA (SOS) 🚨',
        mensagem: msg,
        lida: false
      });
      if (error) throw error;

      setSosAtivo(true);
      onClose();
    } catch (err: any) {
      console.error('Erro ao disparar SOS:', err);
      onToast(err.message || 'Falha ao disparar alerta SOS emergencial.', 'error');
    } finally {
      setEnviandoSos(false);
    }
  };

  const handleFinalizarSos = async () => {
    try {
      const { error } = await supabase.from('notificacoes').insert({
        aluno_id: null,
        titulo: '🔧 Sinal SOS Finalizado',
        mensagem: `O sinal de emergência SOS da Rota ${rotaNome} foi finalizado pelo motorista. Situação normalizada.`,
        lida: false
      });
      if (error) throw error;
      setSosAtivo(false);
    } catch(e: any) {
      console.error('Erro ao normalizar SOS:', e);
      onToast(e.message || 'Erro ao enviar normalização de emergência.', 'error');
    }
  };

  return (
    <>
      {isOpen && !sosAtivo && (
        <div className="absolute inset-0 z-[60] bg-slate-950/95 flex items-center justify-center p-6 animate-fadeIn">
          <div className="w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl relative text-center">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto shadow-inner animate-pulse">
              <AlertOctagon size={40} className="text-rose-500" />
            </div>

            <div>
              <h4 className="text-sm font-extrabold text-rose-500 uppercase tracking-widest font-mono">Confirmar Alerta SOS?</h4>
              <p className="text-[10.5px] text-slate-400 mt-3 leading-relaxed">
                Esta ação deve ser usada <strong>apenas em emergências graves</strong> (Acidente, Assalto, Pane de risco). A central receberá seu sinal imediatamente com prioridade máxima.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleDispararSos}
                disabled={enviandoSos}
                className="w-full py-4 rounded-xl text-xs font-black uppercase bg-rose-600 hover:bg-rose-500 text-white shadow-[0_8px_24px_rgba(225,29,72,0.3)] active:translate-y-0.5 transition-all border-0 cursor-pointer flex items-center justify-center gap-2"
              >
                {enviandoSos ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>CONFIRMAR E ENVIAR SOS</span>
                )}
              </button>

              <button
                onClick={onClose}
                disabled={enviandoSos}
                className="w-full py-3.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-all border-0 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY TELA INTEIRA: ALERTA SOS ATIVO */}
      {sosAtivo && (
        <div className="absolute inset-0 z-[100] bg-rose-950/95 flex flex-col justify-center items-center text-center p-6 select-none">
          <div className="absolute inset-0 flashing-bg -z-10" />

          <div className="w-24 h-24 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-[0_0_50px_rgba(244,63,94,0.8)] mb-8">
            <AlertOctagon size={48} className="text-white animate-pulse" />
          </div>

          <h2 className="text-xl font-black text-white uppercase tracking-widest font-mono mb-4 animate-pulse">
            🚨 SINAL SOS ATIVO 🚨
          </h2>

          <p className="text-xs text-rose-200 px-6 max-w-sm leading-relaxed mb-12">
            Os canais de emergência e a central de Arapongas receberam o sinal de pânico. A sua localização via GPS está sendo monitorada com prioridade máxima.
          </p>

          <button
            onClick={handleFinalizarSos}
            className="py-4 px-8 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest bg-white hover:bg-slate-150 text-slate-950 shadow-2xl hover:scale-105 active:scale-95 transition-all border-0 cursor-pointer font-black"
          >
            Finalizar Sinal / Normalizado
          </button>
        </div>
      )}
    </>
  );
}
