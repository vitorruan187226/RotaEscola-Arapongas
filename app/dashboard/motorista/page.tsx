'use client';

import { useState, useEffect } from 'react';
import { 
  Bus, 
  Users, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Wrench, 
  Map, 
  AlertOctagon, 
  Accessibility, 
  Check, 
  Wifi, 
  WifiOff,
  User,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface Aluno {
  id: number;
  nome: string;
  escola: string;
  nee: boolean;
  tipoNee?: string;
  aBordo: boolean;
  fotoUrl?: string;
}

interface RotaConfig {
  id: string;
  codigo: string;
  nome: string;
  placa: string;
  veiculo: string;
  alunos: Aluno[];
}

const ROTAS_MOCK: RotaConfig[] = [
  {
    id: '1',
    codigo: 'Rota 04',
    nome: 'Zona Rural / Esc. Dorcelina Folador',
    placa: 'BBB-5678',
    veiculo: 'Ônibus Mercedes-Benz',
    alunos: [
      { id: 1, nome: 'Lucas Lima Souza', escola: 'Esc. Dorcelina Folador', nee: false, aBordo: false },
      { id: 2, nome: 'Enzo Gabriel Silva', escola: 'Esc. Dorcelina Folador', nee: false, aBordo: false },
      { id: 3, nome: 'Ana Beatriz Silveira', escola: 'Esc. Dorcelina Folador', nee: true, tipoNee: 'Autismo', aBordo: false, fotoUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=150&auto=format&fit=crop&q=80' },
      { id: 4, nome: 'Maria Eduarda Costa', escola: 'Esc. Dorcelina Folador', nee: false, aBordo: false },
      { id: 5, nome: 'Arthur Ramos Barbosa', escola: 'Esc. Dorcelina Folador', nee: true, tipoNee: 'Cadeirante', aBordo: false }
    ]
  },
  {
    id: '2',
    codigo: 'Rota 07',
    nome: 'Região Norte / Col. Olímpia',
    placa: 'AAA-1234',
    veiculo: 'Microônibus Volare',
    alunos: [
      { id: 7, nome: 'João Pedro Santos', escola: 'Col. Olímpia', nee: false, aBordo: false },
      { id: 8, nome: 'Júlia Nogueira Melo', escola: 'Col. Olímpia', nee: false, aBordo: false },
      { id: 9, nome: 'Gustavo Reis Pinheiro', escola: 'Col. Olímpia', nee: true, tipoNee: 'D. Visual', aBordo: false },
      { id: 10, nome: 'Mariana Almeida Ortiz', escola: 'Col. Olímpia', nee: false, aBordo: false },
    ]
  }
];

type ScanState = 'idle' | 'success' | 'error';

export default function MotoristaDashboardPage() {
  const [selectedRotaId, setSelectedRotaId] = useState(ROTAS_MOCK[0].id);
  const [rotas, setRotas] = useState<RotaConfig[]>(ROTAS_MOCK);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scannedAluno, setScannedAluno] = useState<Aluno | null>(null);
  const [scanErrorMsg, setScanErrorMsg] = useState<string>('');
  const [isOnline, setIsOnline] = useState(true);

  // Rota ativa selecionada
  const rotaAtiva = rotas.find(r => r.id === selectedRotaId) || rotas[0];
  const totalAlunos = rotaAtiva.alunos.length;
  const alunosABordo = rotaAtiva.alunos.filter(a => a.aBordo).length;

  // Reseta estado do leitor QR após 4 segundos
  useEffect(() => {
    if (scanState !== 'idle') {
      const timer = setTimeout(() => {
        setScanState('idle');
        setScannedAluno(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [scanState]);

  const toggleAlunoABordo = (alunoId: number) => {
    setRotas(prevRotas => 
      prevRotas.map(r => {
        if (r.id === selectedRotaId) {
          return {
            ...r,
            alunos: r.alunos.map(aluno => 
              aluno.id === alunoId ? { ...aluno, aBordo: !aluno.aBordo } : aluno
            )
          };
        }
        return r;
      })
    );
  };

  const handleSimulateScanSuccess = () => {
    const aluno = rotaAtiva.alunos.find(a => !a.aBordo) || rotaAtiva.alunos[0];
    
    // Marca o aluno a bordo
    toggleAlunoABordo(aluno.id);
    setScannedAluno(aluno);
    setScanState('success');

    // Emite áudio sintetizado
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance('Embarque autorizado');
        msg.lang = 'pt-BR';
        window.speechSynthesis.speak(msg);
      }
    } catch(e) {}
  };

  const handleSimulateScanError = () => {
    setScanState('error');
    setScanErrorMsg('CARTEIRINHA EXPIRADA OU ROTA INCORRETA');

    // Emite áudio de erro
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance('Atenção, erro de validação');
        msg.lang = 'pt-BR';
        window.speechSynthesis.speak(msg);
      }
    } catch(e) {}
  };

  const handleReportOcorrencia = (tipo: string) => {
    alert(`Ocorrência de "${tipo}" registrada com sucesso e transmitida à SEMED!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans antialiased text-slate-100 p-0 sm:p-4">
      
      {/* Moldura Mobile-First Forçada */}
      <div className="w-full max-w-md bg-slate-900 shadow-2xl flex flex-col relative min-h-screen sm:min-h-[850px] sm:rounded-3xl border border-slate-800 overflow-hidden pb-10">
        
        {/* Cabeçalho de Identidade e Status Bar */}
        <header className="bg-slate-950/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚌</span>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight text-white leading-none">
                RotaEscola
              </h2>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block mt-0.5">
                Arapongas · Painel do Veículo
              </span>
            </div>
          </div>

          {/* Toggle de Sinal de Rede */}
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
              isOnline 
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50' 
                : 'bg-rose-950/80 text-rose-400 border-rose-800/50 animate-pulse'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi size={11} />
                <span>CONECTADO</span>
              </>
            ) : (
              <>
                <WifiOff size={11} />
                <span>OFFLINE</span>
              </>
            )}
          </button>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-28">
          
          {/* Seletor de Rota / Viagem */}
          <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Selecione o Turno & Placa
            </label>
            <div className="relative">
              <select
                value={selectedRotaId}
                onChange={(e) => setSelectedRotaId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-3 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 appearance-none cursor-pointer pr-10"
              >
                {rotas.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.codigo} - {r.nome}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <Bus size={13} className="text-amber-500" />
              <span>Placa: <strong className="text-white font-mono">{rotaAtiva.placa}</strong> · {rotaAtiva.veiculo}</span>
            </div>
          </div>

          {/* Contador Grande de Alunos a Bordo */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-850 rounded-2xl p-4.5 flex items-center justify-between shadow-lg relative overflow-hidden">
            <div>
              <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                Presença de Alunos
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Embarque controlado</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-white font-mono tracking-tighter">
                {alunosABordo}<span className="text-slate-500 text-xl">/{totalAlunos}</span>
              </span>
            </div>
          </div>

          {/* SIMULADOR DE LEITOR DE CARTEIRINHA (QR CODE) */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Validador de Embarque (QR Code)
            </h3>

            <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 flex flex-col items-center gap-4 relative">
              
              {/* Visor do Leitor */}
              <div className="relative w-40 h-40 border border-slate-800 rounded-2xl flex items-center justify-center bg-slate-950 overflow-hidden">
                {/* Linha vermelha pulsante do laser de leitura */}
                <div className="absolute left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce z-20" />
                
                {/* Visor de Foco */}
                <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-amber-500 rounded-tl" />
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-amber-500 rounded-tr" />
                <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-amber-500 rounded-bl" />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-amber-500 rounded-br" />

                <QrCode size={52} className="text-slate-800/60 animate-pulse" />
              </div>

              {/* Botões Simuladores */}
              <div className="grid grid-cols-2 gap-2.5 w-full">
                <button
                  onClick={handleSimulateScanSuccess}
                  className="py-2.5 px-3 rounded-xl text-[10px] font-bold bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-900/60 transition-colors cursor-pointer"
                >
                  Simular Sucesso
                </button>
                <button
                  onClick={handleSimulateScanError}
                  className="py-2.5 px-3 rounded-xl text-[10px] font-bold bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-900/60 transition-colors cursor-pointer"
                >
                  Simular Erro
                </button>
              </div>

              {/* CARD DE FEEDBACK VISUAL GIGANTE */}
              {scanState !== 'idle' && (
                <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center p-4 rounded-2xl z-30 animate-fadeIn">
                  {scanState === 'success' && scannedAluno && (
                    <div className="w-full bg-emerald-950 border border-emerald-500/50 rounded-xl p-5 flex flex-col items-center text-center gap-3.5 shadow-lg">
                      <CheckCircle2 size={36} className="text-emerald-400 shrink-0" />
                      <div>
                        <h4 className="text-lg font-black text-emerald-400 uppercase tracking-wide leading-none">
                          EMBARQUE AUTORIZADO
                        </h4>
                      </div>
                      
                      {/* Dados e Foto do Aluno */}
                      <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-lg w-full text-left">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-amber-500/30 overflow-hidden flex items-center justify-center shrink-0">
                          {scannedAluno.fotoUrl ? (
                            <img src={scannedAluno.fotoUrl} alt={scannedAluno.nome} className="w-full h-full object-cover" />
                          ) : (
                            <User size={18} className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{scannedAluno.nome}</p>
                          <p className="text-[9px] text-slate-400 truncate mt-0.5">{scannedAluno.escola}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {scanState === 'error' && (
                    <div className="w-full bg-rose-950 border border-rose-500/50 rounded-xl p-5 flex flex-col items-center text-center gap-3 shadow-lg">
                      <XCircle size={36} className="text-rose-400 shrink-0" />
                      <div>
                        <h4 className="text-base font-black text-rose-400 uppercase tracking-wide">
                          VALIDAÇÃO RECUSADA
                        </h4>
                        <p className="text-xs text-white font-semibold mt-2 px-1">
                          {scanErrorMsg}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* LISTA DE PASSAGEIROS RÁPIDA (CHECKLIST) */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Lista de Passageiros do Turno
            </h3>

            <div className="flex flex-col gap-2">
              {rotaAtiva.alunos.map((aluno) => (
                <div
                  key={aluno.id}
                  onClick={() => toggleAlunoABordo(aluno.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    aluno.aBordo
                      ? 'bg-slate-900 border-emerald-500/50'
                      : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox customizado grande para celular */}
                    <div className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center border transition-all ${
                      aluno.aBordo
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950 scale-105'
                        : 'border-slate-700 bg-slate-950'
                    }`}>
                      {aluno.aBordo && <Check size={14} strokeWidth={3.5} />}
                    </div>

                    <div>
                      <p className={`text-xs font-bold text-white ${aluno.aBordo ? 'line-through text-slate-500' : ''}`}>
                        {aluno.nome}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] text-slate-500 truncate max-w-[150px]">{aluno.escola}</span>
                        {aluno.nee && (
                          <span className="flex items-center gap-0.5 text-[8px] font-extrabold bg-amber-500 text-slate-950 px-1 py-0.2 rounded uppercase">
                            <Accessibility size={8} />
                            NEE: {aluno.tipoNee}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    aluno.aBordo ? 'bg-emerald-950/60 text-emerald-400' : 'bg-slate-900 text-slate-500'
                  }`}>
                    {aluno.aBordo ? 'A bordo' : 'Falta'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* BOTOES DE OCORRÊNCIA DE 1 CLIQUE */}
        <div className="absolute bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-850 p-2.5 grid grid-cols-4 gap-2 z-40">
          
          <button
            onClick={() => handleReportOcorrencia('Trânsito Intenso')}
            className="flex flex-col items-center justify-center gap-1 h-[58px] bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300 active:scale-95 transition-all text-center cursor-pointer"
          >
            <Clock size={16} className="text-blue-400" />
            <span className="text-[8px] font-bold uppercase leading-none">Trânsito</span>
          </button>

          <button
            onClick={() => handleReportOcorrencia('Problema Mecânico')}
            className="flex flex-col items-center justify-center gap-1 h-[58px] bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300 active:scale-95 transition-all text-center cursor-pointer"
          >
            <Wrench size={16} className="text-amber-500" />
            <span className="text-[8px] font-bold uppercase leading-none">Mecânico</span>
          </button>

          <button
            onClick={() => handleReportOcorrencia('Via Interditada')}
            className="flex flex-col items-center justify-center gap-1 h-[58px] bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300 active:scale-95 transition-all text-center cursor-pointer"
          >
            <Map size={16} className="text-slate-400" />
            <span className="text-[8px] font-bold uppercase leading-none">Barro</span>
          </button>

          <button
            onClick={() => handleReportOcorrencia('Emergência')}
            className="flex flex-col items-center justify-center gap-1 h-[58px] bg-red-650/80 border border-red-500 rounded-xl hover:bg-red-600 text-white active:scale-95 transition-all text-center animate-pulse cursor-pointer"
          >
            <AlertOctagon size={16} className="text-white" />
            <span className="text-[8px] font-black uppercase leading-none">SOS</span>
          </button>

        </div>
      </div>
    </div>
  );
}
