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
  LogOut,
  Calendar
} from 'lucide-react';

interface Aluno {
  id: number | string;
  nome: string;
  escola: string;
  nee: boolean;
  tipoNee?: string;
  aBordo: boolean;
  fotoUrl?: string;
  responsavelId?: string;
  statusLocal: 'pendente' | 'presente' | 'ausente';
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
      { id: 1, nome: 'Lucas Lima Souza', escola: 'Esc. Dorcelina Folador', nee: false, aBordo: false, responsavelId: '1e45bfd4-2113-4e06-b231-e8f2f1136151', statusLocal: 'pendente' },
      { id: 2, nome: 'Enzo Gabriel Silva', escola: 'Esc. Dorcelina Folador', nee: false, aBordo: false, responsavelId: '2aec5cb3-45d0-4754-821d-ff00eecd7fbf', statusLocal: 'pendente' },
      { id: 3, nome: 'Ana Beatriz Silveira', escola: 'Esc. Dorcelina Folador', nee: true, tipoNee: 'Autismo', aBordo: false, fotoUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=150&auto=format&fit=crop&q=80', responsavelId: '1e45bfd4-2113-4e06-b231-e8f2f1136151', statusLocal: 'pendente' },
      { id: 4, nome: 'Maria Eduarda Costa', escola: 'Esc. Dorcelina Folador', nee: false, aBordo: false, statusLocal: 'pendente' },
      { id: 5, nome: 'Arthur Ramos Barbosa', escola: 'Esc. Dorcelina Folador', nee: true, tipoNee: 'Cadeirante', aBordo: false, statusLocal: 'pendente' }
    ]
  },
  {
    id: '2',
    codigo: 'Rota 07',
    nome: 'Região Norte / Col. Olímpia',
    placa: 'AAA-1234',
    veiculo: 'Microônibus Volare',
    alunos: [
      { id: 7, nome: 'João Pedro Santos', escola: 'Col. Olímpia', nee: false, aBordo: false, responsavelId: '1e45bfd4-2113-4e06-b231-e8f2f1136151', statusLocal: 'pendente' },
      { id: 8, nome: 'Júlia Nogueira Melo', escola: 'Col. Olímpia', nee: false, aBordo: false, statusLocal: 'pendente' },
      { id: 9, nome: 'Gustavo Reis Pinheiro', escola: 'Col. Olímpia', nee: true, tipoNee: 'D. Visual', aBordo: false, statusLocal: 'pendente' },
      { id: 10, nome: 'Mariana Almeida Ortiz', escola: 'Col. Olímpia', nee: false, aBordo: false, statusLocal: 'pendente' },
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

  // Estados do Feedback/Toast consolidado
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSentSuccessfully, setIsSentSuccessfully] = useState(false);

  // Rota ativa
  const rotaAtiva = rotas.find(r => r.id === selectedRotaId) || rotas[0];
  const totalAlunos = rotaAtiva ? rotaAtiva.alunos.length : 0;
  const alunosABordo = rotaAtiva ? rotaAtiva.alunos.filter(a => a.statusLocal === 'presente').length : 0;
  
  // Percentual de ocupação
  const percentualOcupacao = totalAlunos > 0 ? (alunosABordo / totalAlunos) * 100 : 0;

  // Botão habilitado apenas se houver alguma mudança de status
  const temAlteracoes = rotaAtiva ? rotaAtiva.alunos.some(a => a.statusLocal !== 'pendente') : false;

  // Carregar dados dinamicamente do Supabase
  const loadData = async (turno: 'Manhã' | 'Tarde' | 'Noite') => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: perfil } = await supabase
          .from('perfis')
          .select('id, nome')
          .eq('auth_user_id', user.id)
          .single();
          
        if (perfil) {
          const { data: driverPerfil } = await supabase
            .from('motoristas_perfil')
            .select('id, placa_veiculo, modelo_veiculo')
            .eq('perfil_id', perfil.id)
            .single();

          if (driverPerfil) {
            const { data: dbRotas } = await supabase
              .from('rotas')
              .select('id, nome_rota, turno')
              .eq('motorista_id', driverPerfil.id);

            if (dbRotas && dbRotas.length > 0) {
              const mappedRotas: RotaConfig[] = [];
              
              for (const r of dbRotas) {
                const { data: dbAlunos } = await supabase
                  .from('alunos')
                  .select('id, nome, escola, foto_url, responsavel_id')
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
                    statusLocal: 'pendente',
                    fotoUrl: aluno.foto_url || undefined,
                    responsavelId: aluno.responsavel_id || undefined
                  }))
                });
              }

              setRotas(mappedRotas);
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
    
    // Fallback Mock
    const fallbackRotas = ROTAS_MOCK.map(r => {
      let filteredAlunos = r.alunos;
      if (turno === 'Tarde') {
        filteredAlunos = [
          { id: '101', nome: 'Davi Lucas Santos', escola: r.alunos[0].escola, nee: false, aBordo: false, responsavelId: '1e45bfd4-2113-4e06-b231-e8f2f1136151', statusLocal: 'pendente' },
          { id: '102', nome: 'Mariana Silva', escola: r.alunos[0].escola, nee: true, tipoNee: 'Autismo', aBordo: false, responsavelId: '2aec5cb3-45d0-4754-821d-ff00eecd7fbf', statusLocal: 'pendente' }
        ];
      } else if (turno === 'Noite') {
        filteredAlunos = [
          { id: '201', nome: 'Rodrigo Barbosa', escola: r.alunos[0].escola, nee: false, aBordo: false, responsavelId: '2aec5cb3-45d0-4754-821d-ff00eecd7fbf', statusLocal: 'pendente' }
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

  useEffect(() => {
    loadData(selectedTurno);
  }, [selectedTurno]);

  useEffect(() => {
    if (scanState !== 'idle') {
      const timer = setTimeout(() => {
        setScanState('idle');
        setScannedAluno(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [scanState]);

  // Cicla o status entre Pendente -> Presente -> Ausente -> Pendente ao clicar
  const cycleAlunoStatus = (alunoId: number | string) => {
    setRotas(prevRotas => 
      prevRotas.map(r => {
        if (r.id === selectedRotaId) {
          return {
            ...r,
            alunos: r.alunos.map(aluno => {
              if (aluno.id === alunoId) {
                const currentStatus = aluno.statusLocal;
                let nextStatus: 'pendente' | 'presente' | 'ausente' = 'pendente';
                if (currentStatus === 'pendente') nextStatus = 'presente';
                else if (currentStatus === 'presente') nextStatus = 'ausente';
                else nextStatus = 'pendente';
                
                return { 
                  ...aluno, 
                  statusLocal: nextStatus, 
                  aBordo: nextStatus === 'presente' 
                };
              }
              return aluno;
            })
          };
        }
        return r;
      })
    );
  };

  const handleSimulateScanSuccess = () => {
    if (!rotaAtiva || rotaAtiva.alunos.length === 0) return;
    const aluno = rotaAtiva.alunos.find(a => a.statusLocal === 'pendente') || rotaAtiva.alunos[0];
    
    // Marca como presente
    setRotas(prevRotas => 
      prevRotas.map(r => {
        if (r.id === selectedRotaId) {
          return {
            ...r,
            alunos: r.alunos.map(a => 
              a.id === aluno.id ? { ...a, statusLocal: 'presente', aBordo: true } : a
            )
          };
        }
        return r;
      })
    );
    
    setScannedAluno(aluno);
    setScanState('success');

    // Feedback por voz
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance('Embarque registrado');
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

  // Envio consolidado em lote (Batch)
  const handleSendBatch = async () => {
    if (!temAlteracoes) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const todayDate = new Date().toISOString().split('T')[0];

      if (user && selectedRotaId.length > 10) {
        const dbTipoMovimento = selectedTurno === 'Manhã' ? 'IDA' : 'VOLTA';

        let dbTurno: 'Matutino' | 'Vespertino' | 'Noturno' = 'Matutino';
        if (selectedTurno === 'Tarde') dbTurno = 'Vespertino';
        else if (selectedTurno === 'Noite') dbTurno = 'Noturno';

        // 1. Preparar logs em lote para logs_embarque
        // Alunos presentes entram com PRESENTE. Alunos não escaneados (pendentes) ou marcados ausentes entram como AUSENTE.
        const logsToInsert = rotaAtiva.alunos.map(aluno => ({
          aluno_id: aluno.id,
          motorista_id: user.id,
          rota_id: selectedRotaId,
          tipo_movimento: dbTipoMovimento,
          status: aluno.statusLocal === 'presente' ? 'PRESENTE' : 'AUSENTE',
          data_registro: todayDate,
          turno: dbTurno
        }));

        // 2. Preparar notificações em lote para a tabela public.notificacoes (somente para os presentes)
        const notificationsToInsert = rotaAtiva.alunos
          .filter(aluno => aluno.statusLocal === 'presente' && aluno.responsavelId)
          .map(aluno => ({
            destinatario_id: aluno.responsavelId,
            remetente_id: user.id,
            tipo: 'embarque',
            titulo: 'Embarque Escolar Confirmado',
            canal: 'app',
            mensagem: `Seu filho(a) ${aluno.nome} acabou de embarcar na RotaEscola (${selectedTurno}).`,
            lida: false
          }));

        // 3. Executa todas as inserções no banco em paralelo
        await Promise.all([
          logsToInsert.length > 0 ? supabase.from('logs_embarque').insert(logsToInsert) : Promise.resolve(),
          notificationsToInsert.length > 0 ? supabase.from('notificacoes').insert(notificationsToInsert) : Promise.resolve(),
          
          // 4. Atualizar a localização/status da rota para em trânsito
          supabase.from('localizacao_veiculo').insert({
            rota_id: rotaAtiva.codigo,
            latitude: -23.4178,
            longitude: -51.4269,
            velocidade_kmh: 40,
            atualizado_em: new Date().toISOString()
          })
        ]);
      }
    } catch (err) {
      console.error('Erro ao enviar lote para o banco de dados:', err);
    }

    // Feedback visual do Toast consolidado
    setToastMessage('Lista enviada com sucesso!');
    setShowSuccessToast(true);
    setIsSentSuccessfully(true);
    setLoading(false);

    // Auto reset e fadeout do Toast após 3 segundos
    setTimeout(() => {
      // Reset local da lista de alunos na rota ativa de volta para 'pendente'
      setRotas(prevRotas => 
        prevRotas.map(r => {
          if (r.id === selectedRotaId) {
            return {
              ...r,
              alunos: r.alunos.map(aluno => ({
                ...aluno,
                statusLocal: 'pendente',
                aBordo: false
              }))
            };
          }
          return r;
        })
      );
      
      setIsSentSuccessfully(false);
      setShowSuccessToast(false);
    }, 3000);
  };

  const handleReportOcorrencia = (tipo: string) => {
    alert(`Ocorrência de "${tipo}" enviada com sucesso à prefeitura!`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-mock-login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push('/login');
  };

  // Data atual formatada (ex: 28/05/2026) - Hydration-safe
  const [dataAtualFormatada, setDataAtualFormatada] = useState('');
  useEffect(() => {
    setDataAtualFormatada(new Date().toLocaleDateString('pt-BR'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans antialiased text-slate-100 p-0 sm:p-6 md:p-8">
      <style jsx global>{`
        @keyframes scan-animation {
          0%, 100% { top: 5%; }
          50% { top: 95%; }
        }
        @keyframes slideDown {
          0% { transform: translateY(-20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .scanner-line {
          animation: scan-animation 2.5s infinite ease-in-out;
        }
        .animate-slideDown {
          animation: slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Moldura Celular Simulada Premium */}
      <div className="w-full max-w-md bg-slate-950 sm:shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col relative min-h-screen sm:min-h-[840px] sm:rounded-[36px] overflow-hidden border border-slate-900">
        
        {/* Toast Consolidado */}
        {showSuccessToast && (
          <div className="absolute top-16 left-5 right-5 z-[60] bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3 shadow-2xl animate-slideDown">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-450 shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Checklist Concluído</p>
              <p className="text-[10px] text-slate-400 mt-1">{toastMessage}</p>
            </div>
          </div>
        )}

        {/* Header com Logout e Data */}
        <header className="bg-slate-900/90 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-slate-800/60 sticky top-0 z-50">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚌</span>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight text-white leading-none flex items-center gap-2">
                RotaEscola
                <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                  <Calendar size={8} />
                  {dataAtualFormatada}
                </span>
              </h2>
              <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest block mt-1">
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
                    Alunos Presentes
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
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-450 rounded-full transition-all duration-500 ease-out"
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
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-450">
                        <CheckCircle2 size={26} />
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-extrabold text-emerald-450 uppercase tracking-widest">
                          Embarque Registrado
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1">Aguardando finalização do lote</p>
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
                    onClick={() => cycleAlunoStatus(aluno.id)}
                    className={`flex items-center justify-between p-4 transition-all duration-200 cursor-pointer select-none ${
                      aluno.statusLocal === 'presente' 
                        ? 'bg-emerald-950/10 border-l-4 border-emerald-500' 
                        : aluno.statusLocal === 'ausente'
                        ? 'bg-rose-950/10 border-l-4 border-rose-500'
                        : 'hover:bg-slate-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                        aluno.statusLocal === 'presente' 
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                          : aluno.statusLocal === 'ausente'
                          ? 'bg-rose-500 border-rose-500 text-slate-950'
                          : 'border-slate-700 bg-slate-950/60 text-transparent'
                      }`}>
                        {aluno.statusLocal === 'presente' ? (
                          <Check size={11} strokeWidth={4} />
                        ) : aluno.statusLocal === 'ausente' ? (
                          <span className="text-[9px] font-black leading-none">X</span>
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <p className={`text-xs font-bold transition-all truncate flex items-center gap-2 ${
                          aluno.statusLocal === 'presente' 
                            ? 'text-emerald-400 font-extrabold' 
                            : aluno.statusLocal === 'ausente'
                            ? 'text-rose-500 font-extrabold'
                            : 'text-slate-100'
                        }`}>
                          {aluno.statusLocal === 'ausente' && (
                            <span className="text-[9px] bg-rose-500/25 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0">
                              Faltou
                            </span>
                          )}
                          {aluno.statusLocal === 'presente' && (
                            <span className="text-[9px] bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0">
                              Presente
                            </span>
                          )}
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

                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 border ${
                      aluno.statusLocal === 'presente' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : aluno.statusLocal === 'ausente'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                      {aluno.statusLocal === 'presente' ? 'Presente' : aluno.statusLocal === 'ausente' ? 'Faltou' : 'Pendente'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Nenhum aluno cadastrado nesta rota para o turno selecionado.
                </div>
              )}
            </div>
            
            {/* Botão de Envio em Lote (Checklist Finalizado) */}
            {(temAlteracoes || isSentSuccessfully) && (
              <div className="pt-4 pb-2">
                <button
                  onClick={handleSendBatch}
                  disabled={loading || isSentSuccessfully}
                  className={`w-full py-4 px-6 rounded-2xl text-[10px] font-extrabold tracking-widest uppercase transition-all transform border-0 flex items-center justify-center gap-2 ${
                    isSentSuccessfully
                      ? 'bg-emerald-600 text-white shadow-[0_8px_20px_rgba(16,185,129,0.2)]'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 shadow-[0_8px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_12px_24px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                  }`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : isSentSuccessfully ? (
                    <>
                      <Check size={14} />
                      <span>Lista Enviada com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={14} className="animate-pulse" />
                      <span>Finalizar Checklist e Notificar</span>
                    </>
                  )}
                </button>
              </div>
            )}
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
