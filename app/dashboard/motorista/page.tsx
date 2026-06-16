'use client';

import { useState, useEffect, useRef } from 'react';
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
  Calendar,
  ShieldAlert,
  Send,
  ScanLine,
  Search,
  UserCheck,
  ChevronRight,
  X,
  Lock
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
  ausenciaNotificada?: boolean;
  qrCodeHash?: string;
}

interface RotaConfig {
  id: string;
  codigo: string;
  nome: string;
  placa: string;
  veiculo: string;
  alunos: Aluno[];
  ativa?: boolean;
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

const getLocalDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function MotoristaDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [selectedRotaId, setSelectedRotaId] = useState(ROTAS_MOCK[0].id);
  const [selectedTurno, setSelectedTurno] = useState<'Manhã' | 'Tarde' | 'Noite'>('Manhã');
  const [selectedSentido, setSelectedSentido] = useState<'IDA' | 'VOLTA'>('IDA');
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

  // ── Estados do Modal de Ocorrência ─────────────────────────
  const [showOcorrenciaModal, setShowOcorrenciaModal] = useState(false);
  const [ocorrenciaStage, setOcorrenciaStage] = useState<'scan' | 'descricao'>('scan');
  const [alunoOcorrencia, setAlunoOcorrencia] = useState<Aluno | null>(null);
  const [descricaoOcorrencia, setDescricaoOcorrencia] = useState('');
  const [enviandoOcorrencia, setEnviandoOcorrencia] = useState(false);
  const [ocorrenciaEnviada, setOcorrenciaEnviada] = useState(false);
  const [mostrarSelecaoManual, setMostrarSelecaoManual] = useState(false);
  const [buscaAlunoManual, setBuscaAlunoManual] = useState('');
  const [realtimeAlert, setRealtimeAlert] = useState<{ title: string; message: string; type: 'info' | 'alert' } | null>(null);
  const ocorrenciaScannerRef = useRef<any>(null);

  // Rota ativa
  const rotaAtiva = rotas.find(r => r.id === selectedRotaId) || rotas[0];
  const totalAlunos = rotaAtiva ? rotaAtiva.alunos.length : 0;
  const alunosABordo = rotaAtiva ? rotaAtiva.alunos.filter(a => a.statusLocal === 'presente').length : 0;
  
  // Percentual de ocupação
  const percentualOcupacao = totalAlunos > 0 ? (alunosABordo / totalAlunos) * 100 : 0;

  // Botão habilitado apenas se houver alguma mudança de status
  const temAlteracoes = rotaAtiva ? rotaAtiva.alunos.some(a => a.statusLocal !== 'pendente') : false;

  // Estados do escâner real de câmera
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [lastScannedId, setLastScannedId] = useState<string>('');

  // Refs de segurança para callbacks do scanner
  const rotaAtivaRef = useRef(rotaAtiva);
  const selectedRotaIdRef = useRef(selectedRotaId);

  useEffect(() => {
    rotaAtivaRef.current = rotaAtiva;
  }, [rotaAtiva]);

  useEffect(() => {
    selectedRotaIdRef.current = selectedRotaId;
  }, [selectedRotaId]);

  // Carregar dados dinamicamente do Supabase
  const loadData = async (turno: 'Manhã' | 'Tarde' | 'Noite') => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: perfil } = await supabase
          .from('perfis')
          .select('id, nome')
          .eq('id', user.id)
          .maybeSingle();
          
        if (perfil) {
          const { data: driverPerfil } = await supabase
            .from('motoristas_perfil')
            .select('id, placa_veiculo, modelo_veiculo')
            .eq('perfil_id', perfil.id)
            .maybeSingle();

          // Na tabela public.rotas, a coluna motorista_id referencia public.perfis.id
          const { data: dbRotas } = await supabase
            .from('rotas')
            .select('id, nome, codigo, turno, ativa')
            .eq('motorista_id', perfil.id);

          if (dbRotas && dbRotas.length > 0) {
            const mappedRotas: RotaConfig[] = [];
            
            for (const r of dbRotas) {
              const { data: dbAlunos } = await supabase
                .from('alunos')
                .select(`
                  id, 
                  nome, 
                  escola, 
                  foto_url, 
                  responsavel_id,
                  carteirinhas (
                    qr_code_hash
                  )
                `)
                .eq('rota_id', r.id)
                .eq('turno', turno === 'Manhã' ? 'Manhã' : turno === 'Tarde' ? 'Tarde' : 'Noite');

              // Busca ausências para os alunos desta rota no dia de hoje
              const dbAlunosIds = (dbAlunos || []).map(a => a.id);
              let dbPresencas: any[] = [];
              if (dbAlunosIds.length > 0) {
                const todayStr = getLocalDateString();
                const { data } = await supabase
                  .from('presencas_diarias')
                  .select('aluno_id, compareceu')
                  .in('aluno_id', dbAlunosIds)
                  .eq('data_presenca', todayStr)
                  .eq('compareceu', false);
                dbPresencas = data || [];
              }

              mappedRotas.push({
                id: r.id,
                codigo: r.codigo || 'RT',
                nome: r.nome || 'Rota sem Nome',
                placa: driverPerfil?.placa_veiculo || 'SEM PLACA',
                veiculo: driverPerfil?.modelo_veiculo || 'Veículo',
                ativa: r.ativa,
                alunos: (dbAlunos || []).map((aluno: any) => {
                  const hash = (aluno.carteirinhas && aluno.carteirinhas.length > 0)
                    ? aluno.carteirinhas[0].qr_code_hash
                    : undefined;
                  const isAusente = dbPresencas.some(p => p.aluno_id === aluno.id);
                  return {
                    id: aluno.id,
                    nome: aluno.nome,
                    escola: aluno.escola || 'Escola Municipal',
                    nee: false,
                    aBordo: false,
                    statusLocal: isAusente ? 'ausente' : 'pendente',
                    ausenciaNotificada: isAusente,
                    fotoUrl: aluno.foto_url || undefined,
                    responsavelId: aluno.responsavel_id || undefined,
                    qrCodeHash: hash
                  };
                })
              });
            }

            setRotas(mappedRotas);
            if (mappedRotas.length > 0 && !mappedRotas.some(r => r.id === selectedRotaId)) {
              setSelectedRotaId(mappedRotas[0].id);
            }
            setLoading(false);
            return;
          } else {
            // Perfil de motorista existe no banco, mas não tem rotas atribuídas.
            // Limpa as rotas e retorna para evitar carregar o fallback mock de desenvolvimento.
            setRotas([]);
            setSelectedRotaId('');
            setLoading(false);
            return;
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
      return { ...r, ativa: true, alunos: filteredAlunos };
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

  // Desativa a rota caso o motorista feche a aba/janela do navegador/app
  useEffect(() => {
    const handleUnload = () => {
      if (selectedRotaId && selectedRotaId.length > 10) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        if (supabaseUrl && supabaseKey) {
          // Usando fetch nativo com keepalive para persistir a requisição mesmo após destruição da página
          fetch(`${supabaseUrl}/rest/v1/rotas?id=eq.${selectedRotaId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ ativa: false }),
            keepalive: true
          }).catch(() => {});
        }
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [selectedRotaId]);

  useEffect(() => {
    setSelectedSentido(selectedTurno === 'Manhã' ? 'IDA' : 'VOLTA');
  }, [selectedTurno]);

  useEffect(() => {
    if (scanState !== 'idle') {
      const timer = setTimeout(() => {
        setScanState('idle');
        setScannedAluno(null);
        setLastScannedId('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [scanState]);

  // Escuta atualizações de ausência (presencas_diarias) via Realtime do Supabase
  useEffect(() => {
    const channel = supabase
      .channel('realtime-presencas')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'presencas_diarias',
        },
        (payload) => {
          const newRow = payload.new as any;
          if (newRow && newRow.compareceu === false) {
            const activeRoute = rotaAtivaRef.current;
            if (activeRoute) {
              const student = activeRoute.alunos.find(a => a.id === newRow.aluno_id);
              if (student) {
                setRealtimeAlert({
                  title: 'Ausência Reportada',
                  message: `O responsável por ${student.nome.split(' ')[0]} informou que ele(a) não irá hoje.`,
                  type: 'alert'
                });
                setTimeout(() => setRealtimeAlert(null), 6000);
              }
            }
          }
          loadData(selectedTurno);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTurno]);

  // Cicla o status entre Pendente -> Presente -> Ausente -> Pendente ao clicar
  const cycleAlunoStatus = (alunoId: number | string) => {
    // Se a rota não estiver ativa (Fora de Rota), o motorista não pode fazer alterações
    if (!rotaAtiva?.ativa) {
      setToastMessage('A rota precisa estar ativa para fazer alterações.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      return;
    }

    // Se a ausência foi notificada pelo responsável, o motorista não pode alterar o status
    const targetAluno = rotaAtiva?.alunos.find(a => a.id === alunoId);
    if (targetAluno?.ausenciaNotificada) {
      setToastMessage(`A ausência de ${targetAluno.nome.split(' ')[0]} foi reportada pelo responsável.`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4500);
      return;
    }

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

  const handleQrCodeScanned = (decodedText: string) => {
    const activeRoute = rotaAtivaRef.current;
    if (!activeRoute || !activeRoute.ativa) {
      setScanState('error');
      setScanErrorMsg('A ROTA DEVE ESTAR ATIVA PARA VALIDAR');
      return;
    }

    // Evita múltiplas leituras em lote do mesmo ID em seguida
    if (decodedText === lastScannedId && scanState === 'success') return;
    
    const scannedId = decodedText.trim();
    setLastScannedId(scannedId);
    
    if (!activeRoute) return;
    const currentSelectedRotaId = selectedRotaIdRef.current;
    
    const alunoEncontrado = activeRoute.alunos.find(a => {
      if (a.id.toString() === scannedId) return true;
      if (a.qrCodeHash && a.qrCodeHash === scannedId) return true;
      if (scannedId.startsWith('rotaescola_arapongas_') && scannedId.endsWith('_2026')) {
        const extractedId = scannedId
          .replace('rotaescola_arapongas_', '')
          .replace('_2026', '');
        if (a.id.toString() === extractedId) return true;
      }
      return false;
    });
    
    if (alunoEncontrado) {
      if (alunoEncontrado.ausenciaNotificada) {
        setScanState('error');
        setScanErrorMsg('ESTUDANTE REPORTADO AUSENTE PELO RESPONSÁVEL');
        
        // Feedback sonoro/de voz de erro
        try {
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance('Atenção, aluno ausente hoje');
            msg.lang = 'pt-BR';
            window.speechSynthesis.speak(msg);
          }
        } catch(e) {}
        return;
      }
      if (alunoEncontrado.statusLocal === 'presente') return;

      // Marca como presente
      setRotas(prevRotas => 
        prevRotas.map(r => {
          if (r.id === currentSelectedRotaId) {
            return {
              ...r,
              alunos: r.alunos.map(a => 
                a.id === alunoEncontrado.id ? { ...a, statusLocal: 'presente', aBordo: true } : a
              )
            };
          }
          return r;
        })
      );
      
      setScannedAluno(alunoEncontrado);
      setScanState('success');
      
      // Feedback sonoro: beep agudo (Web Audio API)
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Tom agudo
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.12);
      } catch (e) {}
      
      // Feedback por voz
      try {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const msg = new SpeechSynthesisUtterance(`${alunoEncontrado.nome.split(' ')[0]} confirmado`);
          msg.lang = 'pt-BR';
          window.speechSynthesis.speak(msg);
        }
      } catch(e) {}

      // Feedback vibratório (100ms)
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(100);
        }
      } catch(e) {}
      
    } else {
      setScanState('error');
      setScanErrorMsg('ALUNO NÃO PERTENCE A ESTA ROTA');
      
      // Feedback sonoro: dois beeps graves
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.frequency.setValueAtTime(220, audioCtx.currentTime);
        gain1.gain.setValueAtTime(0.12, audioCtx.currentTime);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.18);
        
        setTimeout(() => {
          try {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.frequency.setValueAtTime(180, audioCtx.currentTime);
            gain2.gain.setValueAtTime(0.12, audioCtx.currentTime);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.22);
          } catch(e){}
        }, 220);
      } catch(e) {}
      
      // Feedback por voz
      try {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const msg = new SpeechSynthesisUtterance('Atenção, rota incorreta');
          msg.lang = 'pt-BR';
          window.speechSynthesis.speak(msg);
        }
      } catch(e) {}

      // Feedback vibratório de erro
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([150, 100, 150]);
        }
      } catch(e) {}
    }
  };

  // Inicializa o Scanner real usando a camera do dispositivo
  useEffect(() => {
    let html5QrCode: any = null;

    async function startCamera() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        html5QrCode = new Html5Qrcode("reader");
        
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15
          },
          (decodedText: string) => {
            handleQrCodeScanned(decodedText);
          },
          () => {
            // Ignorado
          }
        );
        setHasCameraPermission(true);
      } catch (err) {
        console.error("Erro ao iniciar camera:", err);
        setHasCameraPermission(false);
      }
    }

    startCamera();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop()
          .then(() => console.log("Camera desligada"))
          .catch((err: any) => console.error("Erro ao desligar camera:", err));
      }
    };
  }, []);

  // Envio consolidado em lote (Batch)
  const handleSendBatch = async () => {
    if (!temAlteracoes) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const todayDate = getLocalDateString();

      if (user && rotaAtiva && selectedRotaId.length > 10) {
        const dbTipoMovimento = selectedSentido;

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
            rota_id: rotaAtiva.id,
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

  // ── Inicia o scanner de ocorrência ──────────────────────────
  const iniciarScannerOcorrencia = () => {
    setTimeout(async () => {
      if (ocorrenciaScannerRef.current?.isScanning) return;
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('ocorrencia-reader');
        ocorrenciaScannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 12
          },
          (decoded: string) => handleOcorrenciaScan(decoded),
          () => {}
        );
      } catch (err) {
        console.error('Erro ao iniciar scanner de ocorrência:', err);
      }
    }, 400);
  };

  // ── Abre o modal e inicia o scanner de ocorrência ──────────
  const handleAbrirOcorrenciaModal = () => {
    setShowOcorrenciaModal(true);
    setOcorrenciaStage('scan');
    setAlunoOcorrencia(null);
    setDescricaoOcorrencia('');
    setOcorrenciaEnviada(false);
    setMostrarSelecaoManual(false);
    setBuscaAlunoManual('');

    iniciarScannerOcorrencia();
  };

  // ── Para o scanner de ocorrência ────────────────────────────
  const pararScannerOcorrencia = async () => {
    if (ocorrenciaScannerRef.current?.isScanning) {
      try { await ocorrenciaScannerRef.current.stop(); } catch(e) {}
    }
    ocorrenciaScannerRef.current = null;
  };

  // ── Fecha o modal e para o scanner ──────────────────────────
  const handleFecharOcorrenciaModal = async () => {
    await pararScannerOcorrencia();
    setShowOcorrenciaModal(false);
    setOcorrenciaStage('scan');
    setAlunoOcorrencia(null);
    setDescricaoOcorrencia('');
    setOcorrenciaEnviada(false);
    setMostrarSelecaoManual(false);
    setBuscaAlunoManual('');
  };

  // ── Callback do scan no modal de ocorrência ─────────────────
  const handleOcorrenciaScan = async (decoded: string) => {
    const scannedId = decoded.trim();
    // Busca o aluno em todas as rotas carregadas
    let alunoEncontrado: Aluno | null = null;
    for (const rota of rotas) {
      const found = rota.alunos.find(a => {
        if (a.id.toString() === scannedId) return true;
        if (a.qrCodeHash && a.qrCodeHash === scannedId) return true;
        if (scannedId.startsWith('rotaescola_arapongas_') && scannedId.endsWith('_2026')) {
          const extractedId = scannedId
            .replace('rotaescola_arapongas_', '')
            .replace('_2026', '');
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
      // Feedback vibratório
      try { if (navigator.vibrate) navigator.vibrate(80); } catch(e) {}
    } else {
      // Aluno não encontrado — tenta de novo
      try {
        if (window.speechSynthesis) {
          const msg = new SpeechSynthesisUtterance('Aluno não encontrado. Tente novamente.');
          msg.lang = 'pt-BR';
          window.speechSynthesis.speak(msg);
        }
      } catch(e) {}
      // Reinicia o scanner
      setTimeout(handleAbrirOcorrenciaModal, 500);
    }
  };

  // ── Envia a ocorrência ao Supabase ───────────────────────────
  const handleEnviarOcorrencia = async () => {
    if (!alunoOcorrencia || !descricaoOcorrencia.trim()) return;
    setEnviandoOcorrencia(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ocorrencias').insert({
          aluno_id: alunoOcorrencia.id,
          motorista_id: user.id,
          descricao: descricaoOcorrencia.trim(),
          status: 'pendente'
        });
      }
    } catch (err) {
      console.error('Erro ao enviar ocorrência:', err);
    }

    setEnviandoOcorrencia(false);
    setOcorrenciaEnviada(true);

    // Fecha o modal após 2.5s
    setTimeout(() => handleFecharOcorrenciaModal(), 2500);
  };

  const handleToggleRotaAtiva = async (newVal: boolean) => {
    if (!rotaAtiva) return;
    try {
      const { error } = await supabase
        .from('rotas')
        .update({ ativa: newVal })
        .eq('id', selectedRotaId);

      if (error) throw error;

      setRotas(prev => prev.map(r => r.id === selectedRotaId ? { ...r, ativa: newVal } : r));
      setToastMessage(newVal ? 'Rota iniciada com sucesso!' : 'Rota encerrada com sucesso!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      console.error('Erro ao alternar status da rota:', err);
      setRotas(prev => prev.map(r => r.id === selectedRotaId ? { ...r, ativa: newVal } : r));
      setToastMessage(newVal ? '[MOCK] Rota iniciada!' : '[MOCK] Rota encerrada!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  const handleLogout = async () => {
    if (selectedRotaId && selectedRotaId.length > 10) {
      try {
        await supabase
          .from('rotas')
          .update({ ativa: false })
          .eq('id', selectedRotaId);
      } catch (err) {
        console.error('Erro ao desativar rota no logout:', err);
      }
    }
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
        #reader, #ocorrencia-reader {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          background: transparent !important;
        }
        #reader video, #ocorrencia-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 1rem;
        }
        #reader img, #reader span, #reader a,
        #ocorrencia-reader img, #ocorrencia-reader span, #ocorrencia-reader a {
          display: none !important;
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

        {/* Toast de Alerta em Tempo Real (Ausência Reportada pelos Pais) */}
        {realtimeAlert && (
          <div 
            className="absolute left-5 right-5 z-[60] bg-slate-900 border border-amber-500/40 rounded-2xl p-4 flex items-center gap-3 shadow-2xl animate-slideDown transition-all duration-300"
            style={{ top: showSuccessToast ? '140px' : '64px' }}
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white leading-tight">{realtimeAlert.title}</p>
              <p className="text-[10px] text-slate-400 mt-1 truncate">{realtimeAlert.message}</p>
            </div>
            <button 
              onClick={() => setRealtimeAlert(null)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
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
            
            {/* Controle de Rota Ativa (Iniciar/Parar Rota) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between shadow-inner">
              <div className="flex-1 pr-3">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                  Status de Operação
                </label>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`w-2 h-2 rounded-full ${rotaAtiva?.ativa ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="text-xs font-black text-white uppercase tracking-wide">
                    {rotaAtiva?.ativa ? 'Em Rota (Ativo)' : 'Fora de Rota'}
                  </span>
                </div>
                <span className="text-[8px] text-slate-500 font-medium block mt-1 leading-snug">
                  {rotaAtiva?.ativa ? 'Pais e secretaria visualizam GPS ativo' : 'Acesso ao mapa suspenso para os pais'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleRotaAtiva(!rotaAtiva?.ativa)}
                className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 relative border-0 cursor-pointer ${
                  rotaAtiva?.ativa ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
                aria-label="Alternar status em rota"
              >
                <div 
                  className={`w-5 h-5 rounded-full bg-white transition-all duration-300 absolute top-0.5 ${
                    rotaAtiva?.ativa ? 'left-[22px]' : 'left-0.5'
                  }`} 
                />
              </button>
            </div>

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

            {/* Sentido da Viagem (Ida / Volta) */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">
                Sentido da Viagem
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                {(['IDA', 'VOLTA'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSentido(s)}
                    className={`py-2 rounded-lg text-[10px] font-bold tracking-wide transition-all border-0 ${
                      selectedSentido === s 
                        ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' 
                        : 'text-slate-400 hover:text-white bg-transparent hover:bg-slate-900/40'
                    }`}
                  >
                    {s === 'IDA' ? 'Ida (Escola)' : 'Volta (Casa)'}
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
                  disabled={rotas.length === 0}
                >
                  {rotas.length === 0 ? (
                    <option value="">Nenhuma rota vinculada</option>
                  ) : (
                    rotas.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.codigo} - {r.nome}
                      </option>
                    ))
                  )}
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
                <div id="reader" className="w-full h-full absolute inset-0 z-0"></div>
                
                {/* Overlay visual do Scanner (laser + cantoneiras) */}
                <div className="absolute left-4 right-4 h-0.5 bg-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] z-20 scanner-line pointer-events-none" />
                
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

            <div className="relative bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-inner">
              {/* Overlay de Bloqueio: Rota Inativa (Fora de Rota) */}
              {rotaAtiva && !rotaAtiva.ativa && (
                <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1.5px] z-30 flex flex-col items-center justify-center gap-2 select-none pointer-events-auto transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-450">
                    <Lock size={16} />
                  </div>
                  <span className="text-xs font-black text-white uppercase tracking-wider">Fora de Rota</span>
                  <p className="text-[9px] text-slate-400 text-center px-6 leading-relaxed">
                    Ative a operação no painel superior para liberar o checklist.
                  </p>
                </div>
              )}

              <div className={`divide-y divide-slate-800/40 transition-opacity duration-300 ${rotaAtiva && !rotaAtiva.ativa ? 'opacity-30 pointer-events-none select-none' : ''}`}>
                {rotas.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    Você não possui nenhuma rota vinculada ao seu perfil.
                  </div>
                ) : rotaAtiva && rotaAtiva.alunos.length > 0 ? (
                  rotaAtiva.alunos.map((aluno) => (
                  <div
                    key={aluno.id}
                    onClick={() => cycleAlunoStatus(aluno.id)}
                    className={`flex items-center justify-between p-4 transition-all duration-200 select-none ${
                      aluno.ausenciaNotificada 
                        ? 'bg-rose-950/5 border-l-4 border-rose-600/40 opacity-75 cursor-not-allowed'
                        : aluno.statusLocal === 'presente' 
                        ? 'bg-emerald-950/10 border-l-4 border-emerald-500 cursor-pointer' 
                        : aluno.statusLocal === 'ausente'
                        ? 'bg-rose-950/10 border-l-4 border-rose-500 cursor-pointer'
                        : 'hover:bg-slate-900/30 cursor-pointer'
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
                            ? `text-rose-500 font-extrabold ${aluno.ausenciaNotificada ? 'line-through opacity-60' : ''}`
                            : 'text-slate-100'
                        }`}>
                          {aluno.ausenciaNotificada && (
                            <Lock size={10} className="text-rose-450 shrink-0" />
                          )}
                          {aluno.statusLocal === 'ausente' && !aluno.ausenciaNotificada && (
                            <span className="text-[9px] bg-rose-500/25 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0">
                              Faltou
                            </span>
                          )}
                          {aluno.ausenciaNotificada && (
                            <span className="text-[9px] bg-rose-500/20 text-rose-350 border border-rose-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0">
                              Falta Avisada
                            </span>
                          )}
                          {aluno.statusLocal === 'presente' && (
                            <span className="text-[9px] bg-emerald-555/25 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0">
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
                        : aluno.ausenciaNotificada
                        ? 'bg-rose-900/20 border-rose-900/30 text-rose-350'
                        : aluno.statusLocal === 'ausente'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                      {aluno.statusLocal === 'presente' 
                        ? 'Presente' 
                        : aluno.ausenciaNotificada
                        ? 'Avisado' 
                        : aluno.statusLocal === 'ausente' 
                        ? 'Faltou' 
                        : 'Pendente'}
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
            
            {/* Botão de Envio em Lote (Checklist Finalizado) */}
            {(temAlteracoes || isSentSuccessfully) && (
              <div className="pt-4 pb-2">
                <button
                  onClick={handleSendBatch}
                  disabled={loading || isSentSuccessfully || !rotaAtiva?.ativa}
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

        {/* ══════════════════════════════════════════════════════
            MODAL DE PRESTAR OCORRÊNCIA
        ══════════════════════════════════════════════════════ */}
        {showOcorrenciaModal && (
          <div className="absolute inset-0 z-50 flex flex-col rounded-[36px] overflow-hidden" style={{ backgroundColor: '#020617' }}>
            {/* Header do Modal */}
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
                onClick={handleFecharOcorrenciaModal}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5">

              {/* ── ESTÁGIO 1: SCAN ─────────────────────────── */}
              {ocorrenciaStage === 'scan' && !mostrarSelecaoManual && (
                <div className="flex flex-col items-center gap-5">
                  <div className="text-center">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Estágio 1 de 2</p>
                    <p className="text-xs text-white font-semibold mt-1">Escaneie a carteirinha do aluno</p>
                  </div>

                  {/* Visor do scanner */}
                  <div className="relative w-52 h-52 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                    <div id="ocorrencia-reader" className="w-full h-full absolute inset-0 z-0" />
                    {/* Laser */}
                    <div className="absolute left-4 right-4 h-0.5 bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)] z-20 scanner-line pointer-events-none" />
                    {/* Cantoneiras */}
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

                  {/* Campo de Busca */}
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

                  {/* Lista de Alunos */}
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
                            setAlunoOcorrencia(aluno);
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

                  {/* Botão Voltar para o Scanner */}
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

                  {/* Card do Aluno */}
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

                  {/* Campo de Descrição */}
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

                  {/* Botão Enviar */}
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
        )}

        {/* MENU INFERIOR DE OCORRÊNCIAS */}
        <div className="absolute bottom-0 left-0 right-0 backdrop-blur-md bg-slate-900/80 border-t border-slate-800/60 p-4 grid grid-cols-4 gap-3 z-40 rounded-b-[36px]">
          <button
            onClick={handleAbrirOcorrenciaModal}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-2xl bg-orange-950/20 hover:bg-orange-950/40 transition-all cursor-pointer border border-orange-900/20 active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center shadow-inner">
              <ShieldAlert size={16} className="text-orange-400" />
            </div>
            <span className="text-[9px] font-bold text-orange-400">Ocorrência</span>
          </button>

          <button
            onClick={() => alert('Ocorrência de "Problema Mecânico" enviada à prefeitura!')}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-2xl bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer border border-transparent hover:border-slate-800/50 active:scale-95 border-0"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 shadow-inner">
              <Wrench size={16} />
            </div>
            <span className="text-[9px] font-semibold text-slate-400">Mecânico</span>
          </button>

          <button
            onClick={() => alert('Ocorrência de "Via Interditada" enviada à prefeitura!')}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-2xl bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer border border-transparent hover:border-slate-800/50 active:scale-95 border-0"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800/40 flex items-center justify-center text-slate-300 shadow-inner">
              <Map size={16} />
            </div>
            <span className="text-[9px] font-semibold text-slate-400">Vias</span>
          </button>

          <button
            onClick={() => alert('Emergência reportada à prefeitura!')}
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
