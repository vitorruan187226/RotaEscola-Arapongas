'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
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
  Navigation,
  LogOut
} from 'lucide-react';

interface Aluno {
  id: number | string;
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
  const router = useRouter();
  const supabase = createClient();

  const [selectedRotaId, setSelectedRotaId] = useState(ROTAS_MOCK[0].id);
  const [selectedTurno, setSelectedTurno] = useState<'Manhã' | 'Tarde' | 'Noite'>('Manhã');
  const [rotas, setRotas] = useState<RotaConfig[]>(ROTAS_MOCK);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scannedAluno, setScannedAluno] = useState<Aluno | null>(null);
  const [scanErrorMsg, setScanErrorMsg] = useState<string>('');
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);

  // Rota ativa
  const rotaAtiva = rotas.find(r => r.id === selectedRotaId) || rotas[0];
  const totalAlunos = rotaAtiva ? rotaAtiva.alunos.length : 0;
  const alunosABordo = rotaAtiva ? rotaAtiva.alunos.filter(a => a.aBordo).length : 0;
  
  // Percentual de ocupação
  const percentualOcupacao = totalAlunos > 0 ? (alunosABordo / totalAlunos) * 100 : 0;

  // Carregar dados dinamicamente do Supabase com base no Turno
  const loadData = async (turno: 'Manhã' | 'Tarde' | 'Noite') => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Obter perfil do motorista logado
        const { data: perfil } = await supabase
          .from('perfis')
          .select('id, nome')
          .eq('auth_user_id', user.id)
          .single();
          
        if (perfil) {
          // 2. Obter perfil de motorista específico
          const { data: driverPerfil } = await supabase
            .from('motoristas_perfil')
            .select('id, placa_veiculo, modelo_veiculo')
            .eq('perfil_id', perfil.id)
            .single();

          if (driverPerfil) {
            // 3. Obter rotas deste motorista
            const { data: dbRotas } = await supabase
              .from('rotas')
              .select('id, nome_rota, turno')
              .eq('motorista_id', driverPerfil.id);

            if (dbRotas && dbRotas.length > 0) {
              const mappedRotas: RotaConfig[] = [];
              
              for (const r of dbRotas) {
                // 4. Obter alunos da rota e do turno selecionado
                const { data: dbAlunos } = await supabase
                  .from('alunos')
                  .select('id, nome, escola, foto_url')
                  .eq('rota_id', r.id)
                  .eq('turno', turno);

                mappedRotas.push({
                  id: r.id,
                  codigo: r.nome_rota.includes('—') ? r.nome_rota.split('—')[0].trim() : 'Rota',
                  nome: r.nome_rota.includes('—') ? r.nome_rota.split('—')[1].trim() : r.nome_rota,
                  placa: driverPerfil.placa_veiculo || 'SEM PLACA',
                  veiculo: driverPerfil.modelo_veiculo || 'Veículo',
                  alunos: (dbAlunos || []).map((aluno) => ({
                    id: aluno.id,
                    nome: aluno.nome,
                    escola: aluno.escola || 'Escola Municipal',
                    nee: false,
                    aBordo: false,
                    fotoUrl: aluno.foto_url || undefined
                  }))
                });
              }

              setRotas(mappedRotas);
              // Garante seleção de rota ativa se existir
              if (mappedRotas.length > 0 && !mappedRotas.some(r => r.id === selectedRotaId)) {
                setSelectedRotaId(mappedRotas[0].id);
              }
              setLoading(false);
              return;
            }
          }
        }
      }
    } catch (err) {
      console.error('Erro ao obter dados do banco:', err);
    }
    
    // Fallback Mock se não conectado ou offline
    const fallbackRotas = ROTAS_MOCK.map(r => {
      let filteredAlunos = r.alunos;
      if (turno === 'Tarde') {
        filteredAlunos = [
          { id: '101', nome: 'Davi Lucas Santos', escola: r.alunos[0].escola, nee: false, aBordo: false },
          { id: '102', nome: 'Mariana Silva', escola: r.alunos[0].escola, nee: true, tipoNee: 'Autismo', aBordo: false }
        ];
      } else if (turno === 'Noite') {
        filteredAlunos = [
          { id: '201', nome: 'Rodrigo Barbosa', escola: r.alunos[0].escola, nee: false, aBordo: false }
        ];
      }
      return { ...r, alunos: filteredAlunos };
    });

    setRotas(fallbackRotas);
    if (!fallbackRotas.some(r => r.id === selectedRotaId)) {
      setSelectedRotaId(fallbackRotas[0].id);
    }
    setLoading(false);
  };

  // Carrega sempre que o turno mudar
  useEffect(() => {
    loadData(selectedTurno);
  }, [selectedTurno]);

  // Auto-reset do visor de escaneamento
  useEffect(() => {
    if (scanState !== 'idle') {
      const timer = setTimeout(() => {
        setScanState('idle');
        setScannedAluno(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [scanState]);

  const toggleAlunoABordo = (alunoId: number | string) => {
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

  const handleSimulateScanSuccess = async () => {
    if (!rotaAtiva || rotaAtiva.alunos.length === 0) return;
    const aluno = rotaAtiva.alunos.find(a => !a.aBordo) || rotaAtiva.alunos[0];
    
    toggleAlunoABordo(aluno.id);
    setScannedAluno(aluno);
    setScanState('success');

    // Salva o log na tabela real
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const dbTipoMovimento = selectedTurno === 'Manhã' ? 'IDA' : 'VOLTA';
      
      if (user && typeof aluno.id === 'string' && selectedRotaId.length > 10) {
        await supabase.from('logs_embarque').insert({
          aluno_id: aluno.id,
          motorista_id: user.id,
          rota_id: selectedRotaId,
          tipo_movimento: dbTipoMovimento
        });
      }
    } catch (e) {
      console.error('Erro de persistência de log:', e);
    }

    // Feedback por voz
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
    setScanErrorMsg('ALUNO NÃO PERTENCE A ESTA ROTA');

    // Feedback por voz
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance('Atenção, rota incorreta');
        msg.lang = 'pt-BR';
        window.speechSynthesis.speak(msg);
      }
    } catch(e) {}
  };

  const handleReportOcorrencia = (tipo: string) => {
    alert(`Ocorrência de "${tipo}" enviada com sucesso à prefeitura!`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-mock-login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans antialiased text-slate-100 p-0 sm:p-6 md:p-8">
      <style jsx global>{`
        @keyframes scan-animation {
          0%, 100% { top: 5%; }
          50% { top: 95%; }
        }
        .scanner-line {
          animation: scan-animation 2.5s infinite ease-in-out;
        }
      `}</style>

      {/* Moldura Celular Simulada Premium */}
      <div className="w-full max-w-md bg-slate-950 sm:shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col relative min-h-screen sm:min-h-[840px] sm:rounded-[36px] overflow-hidden border border-slate-900">
        
        {/* Header minimalista com Logout */}
        <header className="bg-slate-900/90 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-slate-800/60 sticky top-0 z-50">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚌</span>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight text-white leading-none">
                RotaEscola
              </h2>
              <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest block mt-0.5">
                Arapongas · Bordo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider transition-all duration-300 ${
                isOnline 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi size={10} />
                  <span>ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff size={10} />
                  <span>OFFLINE</span>
                </>
              )}
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/35 text-slate-400 hover:text-rose-400 transition-colors"
              title="Sair do Sistema"
            >
              <LogOut size={12} />
            </button>
          </div>
        </header>

        {/* Área Principal de Scroll */}
        <main className="flex-1 overflow-y-auto px-5 py-5 space-y-6 pb-36 scrollbar-thin">
          
          {/* Card de Rota e Turno (Topo) */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            
            {/* Seletor de Turno Premium */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">
                Turno de Trabalho
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                {(['Manhã', 'Tarde', 'Noite'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTurno(t)}
                    className={`py-2 rounded-lg text-[10px] font-bold tracking-wide transition-all border-0 ${
                      selectedTurno === t 
                        ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' 
                        : 'text-slate-400 hover:text-white bg-transparent hover:bg-slate-900/40'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                Itinerário da Viagem
              </label>
              <div className="relative">
                <select
                  value={selectedRotaId}
                  onChange={(e) => setSelectedRotaId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 appearance-none cursor-pointer pr-10 transition-colors"
                >
                  {rotas.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.codigo} - {r.nome}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                  ▼
                </div>
              </div>
            </div>

            {/* Lotação e Contador */}
            <div className="pt-2 border-t border-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                    Alunos a Bordo
                  </span>
                  <span className="text-xs text-slate-500 font-medium block mt-0.5">
                    Placa: {rotaAtiva ? rotaAtiva.placa : '...'} | {rotaAtiva ? rotaAtiva.veiculo : '...'}
                  </span>
                </div>
                <span className="text-xl font-extrabold text-white font-mono tracking-tight">
                  {alunosABordo} <span className="text-slate-500 text-sm font-semibold">/ {totalAlunos}</span>
                </span>
              </div>
              
              {/* Barra de Progresso */}
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/40">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentualOcupacao}%` }}
                />
              </div>
            </div>
          </div>

          {/* SCANNER DE QR CODE */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">
              Validador de Carteirinha (Scanner)
            </h3>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center gap-5 relative">
              <div className="relative w-44 h-44 rounded-2xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800">
                <div className="absolute left-4 right-4 h-0.5 bg-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] z-20 scanner-line" />
                
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-amber-400 rounded-tl-md" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-amber-400 rounded-tr-md" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-amber-400 rounded-bl-md" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-amber-400 rounded-br-md" />

                <QrCode size={56} className="text-slate-800/60 animate-pulse" />
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={handleSimulateScanSuccess}
                  className="flex-1 py-3 px-5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition-all text-center cursor-pointer border-0"
                >
                  Simular Sucesso
                </button>
                <button
                  onClick={handleSimulateScanError}
                  className="flex-1 py-3 px-5 rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md active:scale-95 transition-all text-center cursor-pointer border-0"
                >
                  Simular Erro
                </button>
              </div>

              {/* CARD DE FEEDBACK VISUAL DE LEITURA */}
              {scanState !== 'idle' && (
                <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center p-5 rounded-2xl z-30 animate-fadeIn">
                  {scanState === 'success' && scannedAluno && (
                    <div className="w-full bg-slate-900 border border-emerald-500/20 rounded-xl p-5 flex flex-col items-center text-center gap-4 shadow-xl">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 size={26} />
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">
                          Embarque Autorizado
                        </h4>
                      </div>

                      {/* Info do Aluno */}
                      <div className="flex items-center gap-3 bg-slate-950 border border-slate-800/80 p-3 rounded-lg w-full text-left">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-slate-500">
                          {scannedAluno.fotoUrl ? (
                            <img src={scannedAluno.fotoUrl} alt={scannedAluno.nome} className="w-full h-full object-cover" />
                          ) : (
                            <User size={18} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{scannedAluno.nome}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{scannedAluno.escola}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {scanState === 'error' && (
                    <div className="w-full bg-slate-900 border border-rose-500/20 rounded-xl p-5 flex flex-col items-center text-center gap-4 shadow-xl">
                      <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                        <XCircle size={26} />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-rose-450 uppercase tracking-widest">
                          Validação Recusada
                        </h4>
                        <p className="text-xs text-white font-bold mt-2 leading-relaxed">
                          {scanErrorMsg}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* LISTA DE PASSAGEIROS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Lista de Passageiros
              </h3>
              {loading && <span className="text-[9px] text-amber-500 font-bold animate-pulse">CARREGANDO...</span>}
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/40">
              {rotaAtiva && rotaAtiva.alunos.length > 0 ? (
                rotaAtiva.alunos.map((aluno) => (
                  <div
                    key={aluno.id}
                    onClick={() => toggleAlunoABordo(aluno.id)}
                    className={`flex items-center justify-between p-4 transition-all duration-200 cursor-pointer select-none ${
                      aluno.aBordo ? 'bg-slate-900/20' : 'hover:bg-slate-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                        aluno.aBordo 
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                          : 'border-slate-700 bg-slate-950/60 text-transparent'
                      }`}>
                        <Check size={11} strokeWidth={4} />
                      </div>

                      <div className="min-w-0">
                        <p className={`text-xs font-bold transition-all truncate ${aluno.aBordo ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                          {aluno.nome}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 min-w-0">
                          <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{aluno.escola}</span>
                          {aluno.nee && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              <Accessibility size={8} />
                              {aluno.tipoNee}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      aluno.aBordo 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {aluno.aBordo ? 'Presente' : 'Falta'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Nenhum aluno cadastrado nesta rota para o turno selecionado.
                </div>
              )}
            </div>
          </div>
        </main>

        {/* MENU INFERIOR DE OCORRÊNCIAS */}
        <div className="absolute bottom-0 left-0 right-0 backdrop-blur-md bg-slate-900/80 border-t border-slate-800/60 p-4 grid grid-cols-4 gap-3 z-40 rounded-b-[36px]">
          <button
            onClick={() => handleReportOcorrencia('Trânsito Intenso')}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-2xl bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer border border-transparent hover:border-slate-800/50 active:scale-95 border-0"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-inner">
              <Clock size={16} />
            </div>
            <span className="text-[9px] font-semibold text-slate-400">Trânsito</span>
          </button>

          <button
            onClick={() => handleReportOcorrencia('Problema Mecânico')}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-2xl bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer border border-transparent hover:border-slate-800/50 active:scale-95 border-0"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 shadow-inner">
              <Wrench size={16} />
            </div>
            <span className="text-[9px] font-semibold text-slate-400">Mecânico</span>
          </button>

          <button
            onClick={() => handleReportOcorrencia('Via Interditada')}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-2xl bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer border border-transparent hover:border-slate-800/50 active:scale-95 border-0"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800/40 flex items-center justify-center text-slate-300 shadow-inner">
              <Map size={16} />
            </div>
            <span className="text-[9px] font-semibold text-slate-400">Vias</span>
          </button>

          <button
            onClick={() => handleReportOcorrencia('Emergência')}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-2xl bg-rose-950/20 hover:bg-rose-950/40 transition-all cursor-pointer border border-rose-900/20 active:scale-95 border-0"
          >
            <div className="w-10 h-10 rounded-full bg-rose-900/80 flex items-center justify-center text-rose-200 border border-rose-800/50 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse">
              <AlertOctagon size={16} className="text-rose-400" />
            </div>
            <span className="text-[9px] font-bold text-rose-400">SOS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
