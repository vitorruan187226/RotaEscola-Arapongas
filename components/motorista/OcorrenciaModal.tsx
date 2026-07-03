'use client';

import { useState, useRef, useEffect } from 'react';
import { ShieldAlert, X, ScanLine, UserCheck, Search, ChevronRight, User, CheckCircle2, Send } from 'lucide-react';
import { createClient } from '../../utils/supabase/client';

// Reflete a estrutura do aluno e rota usada na página
interface Aluno {
  id: number | string;
  nome: string;
  escola: string;
  fotoUrl?: string;
  qrCodeHash?: string;
  [key: string]: any;
}

interface RotaConfig {
  id: string;
  alunos: Aluno[];
  [key: string]: any;
}

interface OcorrenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  rotas: RotaConfig[];
  rotaAtiva?: RotaConfig;
  onToast: (message: string, type: 'success' | 'error') => void;
}

export function OcorrenciaModal({ isOpen, onClose, rotas, rotaAtiva, onToast }: OcorrenciaModalProps) {
  const [ocorrenciaStage, setOcorrenciaStage] = useState<'scan' | 'descricao'>('scan');
  const [alunoOcorrencia, setAlunoOcorrencia] = useState<Aluno | null>(null);
  const [descricaoOcorrencia, setDescricaoOcorrencia] = useState('');
  const [enviandoOcorrencia, setEnviandoOcorrencia] = useState(false);
  const [ocorrenciaEnviada, setOcorrenciaEnviada] = useState(false);
  const [mostrarSelecaoManual, setMostrarSelecaoManual] = useState(false);
  const [buscaAlunoManual, setBuscaAlunoManual] = useState('');
  
  const ocorrenciaScannerRef = useRef<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      handleAbrirOcorrenciaModal();
    } else {
      pararScannerOcorrencia();
    }
    return () => {
      pararScannerOcorrencia();
    };
  }, [isOpen]);

  const iniciarScannerOcorrencia = () => {
    setTimeout(async () => {
      if (ocorrenciaScannerRef.current?.isScanning) return;
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('ocorrencia-reader');
        ocorrenciaScannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 12 },
          (decoded: string) => handleOcorrenciaScan(decoded),
          () => {}
        );
      } catch (err) {
        console.error('Erro ao iniciar scanner de ocorrência:', err);
      }
    }, 400);
  };

  const pararScannerOcorrencia = async () => {
    if (ocorrenciaScannerRef.current?.isScanning) {
      try { await ocorrenciaScannerRef.current.stop(); } catch(e) {}
    }
    ocorrenciaScannerRef.current = null;
  };

  const handleAbrirOcorrenciaModal = () => {
    setOcorrenciaStage('scan');
    setAlunoOcorrencia(null);
    setDescricaoOcorrencia('');
    setOcorrenciaEnviada(false);
    setMostrarSelecaoManual(false);
    setBuscaAlunoManual('');
    iniciarScannerOcorrencia();
  };

  const handleFechar = async () => {
    await pararScannerOcorrencia();
    onClose();
  };

  const handleOcorrenciaScan = async (decoded: string) => {
    const scannedId = decoded.trim();
    let alunoEncontrado: Aluno | null = null;
    
    for (const rota of rotas) {
      const found = rota.alunos.find(a => {
        if (a.id.toString() === scannedId) return true;
        if (a.qrCodeHash && a.qrCodeHash === scannedId) return true;
        if (scannedId.startsWith('rotaescola_arapongas_') && scannedId.endsWith('_2026')) {
          const extractedId = scannedId.replace('rotaescola_arapongas_', '').replace('_2026', '');
          if (a.id.toString() === extractedId) return true;
        }
        return false;
      });
      if (found) { alunoEncontrado = found; break; }
    }

    await pararScannerOcorrencia();

    if (alunoEncontrado) {
      setAlunoOcorrencia(alunoEncontrado);
      setOcorrenciaStage('descricao');
      try { if (navigator.vibrate) navigator.vibrate(80); } catch(e) {}
    } else {
      try {
        if (window.speechSynthesis) {
          const msg = new SpeechSynthesisUtterance('Aluno não encontrado. Tente novamente.');
          msg.lang = 'pt-BR';
          window.speechSynthesis.speak(msg);
        }
      } catch(e) {}
      setTimeout(() => iniciarScannerOcorrencia(), 500);
    }
  };

  const handleEnviarOcorrencia = async () => {
    if (!alunoOcorrencia || !descricaoOcorrencia.trim()) return;
    setEnviandoOcorrencia(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('ocorrencias').insert({
          aluno_id: alunoOcorrencia.id,
          motorista_id: user.id,
          descricao: descricaoOcorrencia.trim(),
          status: 'pendente'
        });
        if (error) throw error;
      }
      setEnviandoOcorrencia(false);
      setOcorrenciaEnviada(true);
      setTimeout(() => handleFechar(), 2500);
    } catch (err: any) {
      console.error('Erro ao enviar ocorrência:', err);
      onToast(err.message || 'Falha ao registrar ocorrência.', 'error');
      setEnviandoOcorrencia(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col rounded-[36px] overflow-hidden" style={{ backgroundColor: '#020617' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-slate-900/90">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-orange-500/15 flex items-center justify-center">
            <ShieldAlert size={16} className="text-orange-400" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-white tracking-tight">Prestar Ocorrência</h3>
            <p className="text-[9px] text-slate-400 mt-0.5">
              {ocorrenciaStage === 'scan' ? 'Aponte a câmera para a carteirinha do aluno' : 'Descreva o ocorrido'}
            </p>
          </div>
        </div>
        <button
          onClick={handleFechar}
          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5">

        {/* ── ESTÁGIO 1: SCAN ─────────────────────────── */}
        {ocorrenciaStage === 'scan' && !mostrarSelecaoManual && (
          <div className="flex flex-col items-center gap-5">
            <div className="text-center">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Estágio 1 de 2</p>
              <p className="text-xs text-white font-semibold mt-1">Escaneie a carteirinha do aluno</p>
            </div>

            <div className="relative w-52 h-52 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
              <div id="ocorrencia-reader" className="w-full h-full absolute inset-0 z-0" />
              <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_20px_#f97316,0_0_8px_#f97316] z-20 scanner-line pointer-events-none" />
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-orange-400 rounded-tl-md z-10 pointer-events-none" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-orange-400 rounded-tr-md z-10 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-orange-400 rounded-bl-md z-10 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-orange-400 rounded-br-md z-10 pointer-events-none" />
            </div>

            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-2.5">
                <ScanLine size={14} className="text-orange-400 shrink-0" />
                <p className="text-[10px] text-orange-300 font-semibold leading-snug">
                  Aguardando leitura da carteirinha...
                </p>
              </div>

              <div className="flex items-center justify-center w-full gap-2 px-6 py-1">
                <div className="h-[1px] bg-slate-800/85 flex-1" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">ou</span>
                <div className="h-[1px] bg-slate-800/85 flex-1" />
              </div>

              <button
                onClick={() => {
                  pararScannerOcorrencia();
                  setMostrarSelecaoManual(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer w-full"
              >
                <UserCheck size={14} className="text-amber-400" />
                <span>Selecionar Aluno Manualmente</span>
              </button>
            </div>
          </div>
        )}

        {/* ── ESTÁGIO 1 (FALLBACK): SELEÇÃO MANUAL ─────────────────── */}
        {ocorrenciaStage === 'scan' && mostrarSelecaoManual && (
          <div className="flex flex-col gap-4 flex-1">
            <div className="text-center">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Estágio 1 de 2</p>
              <p className="text-xs text-white font-semibold mt-1">Selecione o aluno manualmente</p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={buscaAlunoManual}
                onChange={(e) => setBuscaAlunoManual(e.target.value)}
                placeholder="Pesquisar aluno pelo nome..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/60 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder:text-slate-650 focus:outline-none transition-colors"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <Search size={14} />
              </div>
              {buscaAlunoManual && (
                <button
                  onClick={() => setBuscaAlunoManual('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs border-0 bg-transparent p-1 cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto max-h-72 pr-1 space-y-2 flex flex-col scrollbar-thin">
              {(() => {
                const filtrados = (rotaAtiva?.alunos || []).filter(aluno =>
                  aluno.nome.toLowerCase().includes(buscaAlunoManual.toLowerCase())
                );

                if (filtrados.length === 0) {
                  return (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      Nenhum aluno encontrado nesta rota.
                    </div>
                  );
                }

                return filtrados.map(aluno => (
                  <button
                    key={aluno.id}
                    onClick={() => {
                      setAlunoOcorrencia(aluno as Aluno);
                      setOcorrenciaStage('descricao');
                      setMostrarSelecaoManual(false);
                      setBuscaAlunoManual('');
                    }}
                    className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-orange-500/40 rounded-xl p-3 text-left transition-colors cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 overflow-hidden">
                      {aluno.fotoUrl ? (
                        <img src={aluno.fotoUrl} alt={aluno.nome} className="w-full h-full object-cover" />
                      ) : (
                        <User size={14} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{aluno.nome}</p>
                      <p className="text-[9px] text-slate-400 truncate">{aluno.escola}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-650 shrink-0" />
                  </button>
                ));
              })()}
            </div>

            <button
              onClick={async () => {
                setMostrarSelecaoManual(false);
                setBuscaAlunoManual('');
                iniciarScannerOcorrencia();
              }}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer w-full bg-transparent"
            >
              <ScanLine size={13} className="text-slate-400" />
              <span>Voltar para o Scanner QR</span>
            </button>
          </div>
        )}

        {/* ── ESTÁGIO 2: DESCRIÇÃO ────────────────────── */}
        {ocorrenciaStage === 'descricao' && !ocorrenciaEnviada && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Estágio 2 de 2</p>
              <p className="text-xs text-white font-semibold mt-1">Aluno identificado</p>
            </div>

            {alunoOcorrencia && (
              <div className="flex items-center gap-3 bg-slate-900 border border-orange-500/20 rounded-xl p-3.5">
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-slate-500">
                  {alunoOcorrencia.fotoUrl ? (
                    <img src={alunoOcorrencia.fotoUrl} alt={alunoOcorrencia.nome} className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{alunoOcorrencia.nome}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{alunoOcorrencia.escola}</p>
                </div>
                <span className="shrink-0 text-[9px] font-black px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25 uppercase tracking-wide">
                  Aluno
                </span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                O que aconteceu?
              </label>
              <textarea
                value={descricaoOcorrencia}
                onChange={(e) => setDescricaoOcorrencia(e.target.value)}
                placeholder="Ex: O aluno me xingou e está batendo nos colegas..."
                rows={5}
                className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500/60 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none resize-none transition-colors leading-relaxed"
              />
              <p className="text-[9px] text-slate-600 mt-1.5 text-right">{descricaoOcorrencia.length}/500 caracteres</p>
            </div>

            <button
              onClick={handleEnviarOcorrencia}
              disabled={enviandoOcorrencia || descricaoOcorrencia.trim().length < 5}
              className={`w-full py-4 rounded-2xl text-[10px] font-extrabold tracking-widest uppercase flex items-center justify-center gap-2 transition-all border-0 ${
                descricaoOcorrencia.trim().length >= 5 && !enviandoOcorrencia
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-[0_8px_20px_rgba(249,115,22,0.25)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(249,115,22,0.4)] active:translate-y-0 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {enviandoOcorrencia ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={13} />
                  <span>Enviar Ocorrência</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ── CONFIRMAÇÃO DE ENVIO ─────────────────────── */}
        {ocorrenciaEnviada && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-emerald-400 uppercase tracking-widest">Ocorrência Registrada!</h4>
              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                A secretaria foi notificada e tomará as devidas providências.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
