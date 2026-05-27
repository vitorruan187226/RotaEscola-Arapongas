'use client';

import { useState, useEffect } from 'react';
import { QrCode, ShieldAlert, CheckCircle2, XCircle, WifiOff, Wifi, Play } from 'lucide-react';

type ScanState = 'idle' | 'success' | 'error-route' | 'error-expired';

interface ScanResult {
  nome: string;
  escola: string;
  rotaDesejada?: string;
  infoAdicional?: string;
}

export default function LeitorCarteirinha({ isOnline: parentIsOnline }: { isOnline?: boolean }) {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [offlineSimulado, setOfflineSimulado] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState<string | null>(null);

  // Determina se está online baseado no prop do layout ou no state de simulação local
  const isOnline = parentIsOnline !== undefined ? (parentIsOnline && !offlineSimulado) : !offlineSimulado;

  // Reseta o estado de feedback após alguns segundos para voltar ao modo de escaneamento
  useEffect(() => {
    if (scanState !== 'idle') {
      const timer = setTimeout(() => {
        setScanState('idle');
        setScanResult(null);
      }, 5000); // 5 segundos de exibição do feedback
      return () => clearTimeout(timer);
    }
  }, [scanState]);

  const handleSimulateScan = (type: ScanState) => {
    setScanState(type);
    
    // Tenta simular um feedback sonoro rápido usando a API do sintetizador ou gerador de áudio
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance();
        if (type === 'success') {
          msg.text = 'Embarque autorizado';
          msg.lang = 'pt-BR';
        } else if (type === 'error-route') {
          msg.text = 'Rota inválida';
          msg.lang = 'pt-BR';
        } else if (type === 'error-expired') {
          msg.text = 'Carteirinha vencida';
          msg.lang = 'pt-BR';
        }
        window.speechSynthesis.speak(msg);
      }
    } catch (e) {
      console.log('Audio feedback not supported');
    }

    if (type === 'success') {
      setScanResult({
        nome: 'Guilherme Augusto Nogueira',
        escola: 'Escola Municipal Dorcelina Folador',
      });
    } else if (type === 'error-route') {
      setScanResult({
        nome: 'Beatriz Martins Souza',
        escola: 'Colégio Estadual Julia Wanderley',
        rotaDesejada: 'Rota 19 - Zona Norte',
        infoAdicional: 'Este aluno pertence à Rota 19, e não à Rota 04.',
      });
    } else if (type === 'error-expired') {
      setScanResult({
        nome: 'Vinícius Silva Ramos',
        escola: 'Escola Municipal Dorcelina Folador',
        infoAdicional: 'Validade expirada em: 31/12/2024',
      });
    } else {
      setScanResult(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Área de Visualização da Câmera Simulada */}
      <div className="relative aspect-[4/3] w-full rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-lg">
        
        {/* Overlay de Câmera */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(9,12,22,0.85)_100%)] z-10 pointer-events-none" />
        
        {/* Linhas de grade simuladas */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-[0.03] z-10 pointer-events-none">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="border border-white" />
          ))}
        </div>

        {/* Visor de QR Code */}
        <div className="relative w-44 h-44 border border-slate-700/50 rounded-2xl flex items-center justify-center z-20">
          {/* Cantos do visor estilo scanner */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-500 rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-500 rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-500 rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-500 rounded-br-lg" />

          {/* Linha vermelha pulsante do laser de leitura */}
          <div className="absolute left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce z-20" />

          <QrCode size={64} className="text-slate-700/60 animate-pulse" />
        </div>

        {/* Informações da Câmera (Foco, Resolução) */}
        <div className="absolute bottom-3 left-3 text-[10px] text-slate-500 font-mono tracking-widest z-20">
          LENS: ACTIVE [AF-AUTO]
        </div>

        {/* Aviso de Offline Discreto */}
        {!isOnline && (
          <div className="absolute top-3 left-3 right-3 bg-rose-500/90 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow-md z-30 animate-pulse border border-rose-400/20">
            <WifiOff size={12} />
            <span>Modo Offline Ativo - Sincronização automática via Antigravity</span>
          </div>
        )}
      </div>

      {/* ÁREA DE FEEDBACK GIGANTE */}
      <div className="min-h-[140px] flex">
        {scanState === 'idle' && (
          <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-amber-500/80 mb-3 border border-slate-800">
              <QrCode size={22} className="animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Aguardando Carteirinha
            </h3>
            <p className="text-xs text-slate-400 max-w-[280px]">
              Aponte a câmera para o QR Code da carteirinha do estudante para autorizar o embarque.
            </p>
          </div>
        )}

        {scanState === 'success' && scanResult && (
          <div className="w-full bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between text-left animate-[pulse_1s_infinite_alternate] shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Validação Concluída
                </span>
                <h3 className="text-lg font-black text-emerald-400 uppercase tracking-wide mt-1.5">
                  EMBARQUE AUTORIZADO
                </h3>
              </div>
              <CheckCircle2 className="text-emerald-400 shrink-0" size={28} />
            </div>

            <div className="mt-2.5">
              <h4 className="text-sm font-bold text-white">{scanResult.nome}</h4>
              <p className="text-xs text-emerald-400/80 mt-0.5">{scanResult.escola}</p>
            </div>
          </div>
        )}

        {scanState === 'error-route' && scanResult && (
          <div className="w-full bg-rose-950/90 border border-rose-500/60 rounded-2xl p-5 flex flex-col justify-between text-left animate-shake shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold bg-rose-500 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Alerta de Segurança
                </span>
                <h3 className="text-base font-black text-rose-400 uppercase tracking-wide mt-1.5 leading-tight">
                  ALUNO NÃO PERTENCE A ESTA ROTA
                </h3>
              </div>
              <XCircle className="text-rose-400 shrink-0" size={28} />
            </div>

            <div className="mt-2">
              <h4 className="text-sm font-bold text-white">{scanResult.nome}</h4>
              <p className="text-xs text-rose-400/90 font-semibold">{scanResult.infoAdicional}</p>
            </div>
          </div>
        )}

        {scanState === 'error-expired' && scanResult && (
          <div className="w-full bg-red-950/90 border border-red-500/60 rounded-2xl p-5 flex flex-col justify-between text-left shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Erro de Validação
                </span>
                <h3 className="text-lg font-black text-red-400 uppercase tracking-wide mt-1.5 leading-none">
                  CARTEIRINHA VENCIDA
                </h3>
              </div>
              <ShieldAlert className="text-red-400 shrink-0" size={28} />
            </div>

            <div className="mt-2">
              <h4 className="text-sm font-bold text-white">{scanResult.nome}</h4>
              <p className="text-xs text-red-400/90 font-mono mt-0.5">{scanResult.infoAdicional}</p>
            </div>
          </div>
        )}
      </div>

      {/* CONTROLES DE SIMULAÇÃO */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
          Console de Simulação do Leitor
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleSimulateScan('success')}
            className="flex flex-col items-center justify-center p-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 rounded-xl text-center transition-colors"
          >
            <CheckCircle2 size={18} className="text-emerald-400 mb-1" />
            <span className="text-[10px] font-semibold text-emerald-300">Sucesso</span>
          </button>

          <button
            onClick={() => handleSimulateScan('error-route')}
            className="flex flex-col items-center justify-center p-3 bg-rose-950 hover:bg-rose-900 border border-rose-800 rounded-xl text-center transition-colors"
          >
            <XCircle size={18} className="text-rose-400 mb-1" />
            <span className="text-[10px] font-semibold text-rose-300">Rota Errada</span>
          </button>

          <button
            onClick={() => handleSimulateScan('error-expired')}
            className="flex flex-col items-center justify-center p-3 bg-red-950 hover:bg-red-900 border border-red-950 rounded-xl text-center transition-colors"
          >
            <ShieldAlert size={18} className="text-red-400 mb-1" />
            <span className="text-[10px] font-semibold text-red-300">Expirada</span>
          </button>
        </div>

        {/* Botão de Toggle de Conexão Local */}
        <button
          onClick={() => setOfflineSimulado(!offlineSimulado)}
          className={`w-full mt-3 py-2 px-4 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
            offlineSimulado 
              ? 'bg-rose-950/40 border-rose-800/80 text-rose-400' 
              : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
          }`}
        >
          {offlineSimulado ? (
            <>
              <Wifi size={14} className="text-emerald-400" />
              <span>Simular Voltar Online</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-rose-400" />
              <span>Simular Ficar Offline</span>
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
