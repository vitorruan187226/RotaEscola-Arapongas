'use client';

import { useState } from 'react';
import { Clock, Wrench, AlertTriangle, AlertOctagon, Send, CheckCircle2, History, SendToBack } from 'lucide-react';

interface OcorrenciaEnviada {
  id: number;
  tipo: string;
  horario: string;
  status: 'Transmitido' | 'Pendente (Offline)';
  detalhes?: string;
}

export default function OcorrenciasMotorista({ isOnline = true }: { isOnline?: boolean }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [observacao, setObservacao] = useState('');
  const [historico, setHistorico] = useState<OcorrenciaEnviada[]>([
    { id: 1, tipo: 'Trânsito Intenso', horario: '06:45', status: 'Transmitido' },
  ]);

  const reportarOcorrencia = (tipo: string) => {
    setLoading(tipo);
    setSuccessMsg(null);

    // Simula um atraso de envio
    setTimeout(() => {
      const novaOcorrencia: OcorrenciaEnviada = {
        id: Date.now(),
        tipo,
        horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: isOnline ? 'Transmitido' : 'Pendente (Offline)',
        detalhes: observacao.trim() || undefined,
      };

      setHistorico(prev => [novaOcorrencia, ...prev]);
      setSuccessMsg(
        isOnline 
          ? `Ocorrência "${tipo}" registrada com sucesso!` 
          : `Modo Offline: "${tipo}" salva localmente para sincronização futura.`
      );
      setLoading(null);
      setObservacao('');

      // Esconde a mensagem de sucesso depois de 4 segundos
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 1200);
  };

  const botoesOcorrencia = [
    {
      tipo: 'Trânsito Intenso',
      descricao: 'Engarrafamento ou lentidão severa na rota',
      icon: Clock,
      bgColor: 'bg-blue-600 hover:bg-blue-500',
      activeColor: 'active:bg-blue-700',
      textColor: 'text-white',
    },
    {
      tipo: 'Problema Mecânico',
      descricao: 'Falha no veículo que impede de seguir viagem',
      icon: Wrench,
      bgColor: 'bg-amber-600 hover:bg-amber-500',
      activeColor: 'active:bg-amber-700',
      textColor: 'text-white',
    },
    {
      tipo: 'Via Interditada / Barro',
      descricao: 'Obstáculos físicos, buracos ou estrada intrafegável',
      icon: AlertTriangle,
      bgColor: 'bg-slate-700 hover:bg-slate-655',
      activeColor: 'active:bg-slate-800',
      textColor: 'text-slate-100',
    },
    {
      tipo: 'Emergência',
      descricao: 'Acidente ou necessidade médica urgente',
      icon: AlertOctagon,
      bgColor: 'bg-red-600 hover:bg-red-500 animate-[pulse_1.5s_infinite_alternate]',
      activeColor: 'active:bg-red-700',
      textColor: 'text-white border-2 border-red-400/30',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho explicativo */}
      <div className="text-left px-1">
        <h2 className="text-base font-extrabold text-white">
          Alertas Rápidos
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Toque em um botão para relatar problemas imediatamente à central SEMED.
        </p>
      </div>

      {/* Banner de Sucesso */}
      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 p-3.5 rounded-xl flex items-start gap-2.5 text-xs shadow-md animate-fadeIn">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white">Central Notificada</p>
            <p className="mt-0.5 text-emerald-300/95">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Grade de Botões Gigantes */}
      <div className="grid grid-cols-1 gap-3.5">
        {botoesOcorrencia.map((btn) => {
          const Icon = btn.icon;
          const isCurrentLoading = loading === btn.tipo;

          return (
            <button
              key={btn.tipo}
              disabled={loading !== null}
              onClick={() => reportarOcorrencia(btn.tipo)}
              className={`w-full min-h-[64px] ${btn.bgColor} ${btn.activeColor} ${btn.textColor} p-4 rounded-2xl flex items-center justify-between transition-all duration-150 disabled:opacity-50 select-none shadow-md`}
            >
              <div className="flex items-center gap-3.5 text-left">
                <div className="p-2 bg-black/20 rounded-xl">
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide uppercase leading-tight">
                    {btn.tipo}
                  </h3>
                  <span className="text-[11px] opacity-75 font-medium mt-0.5 block">
                    {btn.descricao}
                  </span>
                </div>
              </div>

              {isCurrentLoading && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
            </button>
          );
        })}
      </div>

      {/* Observações Adicionais */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <label htmlFor="obs" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Observação Adicional (Opcional)
        </label>
        <div className="flex gap-2">
          <input
            id="obs"
            type="text"
            placeholder="Digite detalhes do problema..."
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Histórico Recente do Turno */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
        <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-3.5">
          <History size={13} className="text-amber-500" />
          <span>Ocorrências de Hoje</span>
        </h4>
        
        {historico.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-2">
            Nenhuma ocorrência registrada no turno de hoje.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {historico.map((item) => (
              <div key={item.id} className="bg-slate-950/60 rounded-xl p-3 border border-slate-850 flex items-center justify-between text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-slate-200">{item.tipo}</span>
                  {item.detalhes && (
                    <span className="text-[10px] text-slate-400 italic">"{item.detalhes}"</span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono">{item.horario}</span>
                </div>

                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  item.status === 'Transmitido'
                    ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400'
                    : 'bg-amber-950/40 border-amber-900/50 text-amber-400 animate-pulse'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
