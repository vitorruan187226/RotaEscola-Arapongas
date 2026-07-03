'use client';

import { useState, useEffect } from 'react';
import { QrCode, WifiOff, CheckCircle2, XCircle } from 'lucide-react';

interface Aluno {
  nome: string;
  escola: string;
  [key: string]: any;
}

interface QrCodeReaderProps {
  onScan: (decodedText: string) => void;
  scanState: 'idle' | 'success' | 'error';
  scannedAluno: Aluno | null;
  scanErrorMsg: string;
}

export function QrCodeReader({ onScan, scanState, scannedAluno, scanErrorMsg }: QrCodeReaderProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let html5QrCode: any = null;

    async function startCamera() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        html5QrCode = new Html5Qrcode('reader');
        
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 15 },
          (decodedText: string) => {
            onScan(decodedText);
          },
          () => {
            // Ignorado
          }
        );
        setHasCameraPermission(true);
      } catch (err) {
        console.error('Erro ao iniciar camera:', err);
        setHasCameraPermission(false);
      }
    }

    startCamera();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop()
          .then(() => console.log('Camera desligada'))
          .catch((err: any) => console.error('Erro ao desligar camera:', err));
      }
    };
  }, [onScan]);

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">
        Validador de Carteirinha (Scanner)
      </h3>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center gap-5 relative">
        <div className="relative w-44 h-44 rounded-2xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800">
          <div id="reader" className="w-full h-full absolute inset-0 z-0"></div>
          
          {/* Overlay visual do Scanner (laser + cantoneiras) */}
          <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_20px_#ef4444,0_0_8px_#ef4444] z-20 scanner-line pointer-events-none" />
          
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-amber-400 rounded-tl-md z-10 pointer-events-none" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-amber-400 rounded-tr-md z-10 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-amber-400 rounded-bl-md z-10 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-amber-400 rounded-br-md z-10 pointer-events-none" />

          {/* Mostra o ícone fallback apenas se a permissão não foi concedida ou está carregando */}
          {hasCameraPermission === null && (
            <QrCode size={56} className="text-slate-800/60 animate-pulse z-10" />
          )}

          {hasCameraPermission === false && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-3 text-center gap-2 z-30">
              <WifiOff size={24} className="text-rose-500" />
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">Câmera Bloqueada</span>
              <p className="text-[8px] text-slate-400">Permita o acesso à câmera para escanear.</p>
            </div>
          )}
        </div>

        {/* CARD DE FEEDBACK VISUAL DE LEITURA */}
        {scanState !== 'idle' && (
          <div className={`w-full p-4 rounded-xl border flex items-center gap-3 animate-slideDown ${
            scanState === 'success' 
              ? 'bg-emerald-950/40 border-emerald-500/30' 
              : 'bg-rose-950/40 border-rose-500/30'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
              scanState === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
            }`}>
              {scanState === 'success' ? (
                <CheckCircle2 size={20} className="text-emerald-400" />
              ) : (
                <XCircle size={20} className="text-rose-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {scanState === 'success' && scannedAluno ? (
                <>
                  <p className="text-xs font-extrabold text-white truncate tracking-tight uppercase">{scannedAluno.nome}</p>
                  <p className="text-[9px] text-slate-400 truncate mt-0.5 font-medium">{scannedAluno.escola}</p>
                  <p className="text-[8px] text-emerald-400 font-bold uppercase mt-1">EMBARQUE CONFIRMADO</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-extrabold text-white truncate tracking-tight uppercase">ACESSO NEGADO</p>
                  <p className="text-[9px] text-rose-300 font-bold mt-0.5 leading-snug">{scanErrorMsg}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
