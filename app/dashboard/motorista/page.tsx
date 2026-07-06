'use client';

import { useState, useEffect, useRef } from 'react';
import { useGPSBroadcast } from '@/lib/hooks/useGPSBroadcast';
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus';
import { useOfflineChecklist } from '@/lib/hooks/useOfflineChecklist';
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
  Lock,
  MapPin,
  Camera,
  Phone,
  PieChart,
  Square,
  MessageSquareWarning,
  ArrowDownToLine,
  ArrowUpFromLine,
  Home,
  BarChart2,
  Wallet,
  UserCircle
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
  endereco?: string;
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
      { id: 1, nome: 'Lucas Lima Souza', escola: 'Esc. Dorcelina Folador', nee: false, aBordo: false, responsavelId: '1e45bfd4-2113-4e06-b231-e8f2f1136151', statusLocal: 'pendente', endereco: 'Colônia Esperança, Km 4 - Zona Rural, Arapongas' },
      { id: 2, nome: 'Enzo Gabriel Silva', escola: 'Esc. Dorcelina Folador', nee: false, aBordo: false, responsavelId: '2aec5cb3-45d0-4754-821d-ff00eecd7fbf', statusLocal: 'pendente', endereco: 'Estância Santa Maria, Chácara 12 - Arapongas' },
      { id: 3, nome: 'Ana Beatriz Silveira', escola: 'Esc. Dorcelina Folador', nee: true, tipoNee: 'Autismo', aBordo: false, fotoUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=150&auto=format&fit=crop&q=80', responsavelId: '1e45bfd4-2113-4e06-b231-e8f2f1136151', statusLocal: 'pendente', endereco: 'Sítio Novo Horizonte - Zona Rural, Arapongas' },
      { id: 4, nome: 'Maria Eduarda Costa', escola: 'Esc. Dorcelina Folador', nee: false, aBordo: false, statusLocal: 'pendente', endereco: 'Chácara São João, Lote 4B - Arapongas' },
      { id: 5, nome: 'Arthur Ramos Barbosa', escola: 'Esc. Dorcelina Folador', nee: true, tipoNee: 'Cadeirante', aBordo: false, statusLocal: 'pendente', endereco: 'Colônia Centenário - Zona Rural, Arapongas' }
    ]
  },
  {
    id: '2',
    codigo: 'Rota 07',
    nome: 'Região Norte / Col. Olímpia',
    placa: 'AAA-1234',
    veiculo: 'Microônibus Volare',
    alunos: [
      { id: 7, nome: 'João Pedro Santos', escola: 'Col. Olímpia', nee: false, aBordo: false, responsavelId: '1e45bfd4-2113-4e06-b231-e8f2f1136151', statusLocal: 'pendente', endereco: 'Rua Harpia, 452 - Jardim Bandeirantes, Arapongas' },
      { id: 8, nome: 'Júlia Nogueira Melo', escola: 'Col. Olímpia', nee: false, aBordo: false, statusLocal: 'pendente', endereco: 'Av. Gralha Azul, 890 - Jardim do Cafe, Arapongas' },
      { id: 9, nome: 'Gustavo Reis Pinheiro', escola: 'Col. Olímpia', nee: true, tipoNee: 'D. Visual', aBordo: false, statusLocal: 'pendente', endereco: 'Rua Garças, 123 - Centro, Arapongas' },
      { id: 10, nome: 'Mariana Almeida Ortiz', escola: 'Col. Olímpia', nee: false, aBordo: false, statusLocal: 'pendente', endereco: 'Rua Falcão, 789 - Jardim San Raphael, Arapongas' },
    ]
  }
];

interface MotoristaPerfil {
  id: string;
  nome: string;
  telefone?: string;
  foto_url?: string;
  placa_veiculo?: string;
  modelo_veiculo?: string;
  cnh?: string;
  cnh_categoria?: string;
}

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
  const isOnline = useNetworkStatus();
  const [loading, setLoading] = useState(false);

  // Estados do Perfil do Motorista
  const [perfilMotorista, setPerfilMotorista] = useState<MotoristaPerfil | null>(null);
  const { saveOffline, loadOffline, clearOffline } = useOfflineChecklist(perfilMotorista?.id || null);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [enviandoPerfil, setEnviandoPerfil] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editTelefone, setEditTelefone] = useState('');

  // Estados do Feedback/Toast consolidado
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSentSuccessfully, setIsSentSuccessfully] = useState(false);
  const rotaAtivaTemp = rotas.find(r => r.id === selectedRotaId);
  useGPSBroadcast(rotaAtivaTemp?.ativa ? selectedRotaId : null, perfilMotorista?.id || null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

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

  // Estados dos novos Modais Operacionais (Mecânico, Vias, SOS)
  const [showMecanicoModal, setShowMecanicoModal] = useState(false);
  const [mecanicoOption, setMecanicoOption] = useState('');
  const [mecanicoDetalhes, setMecanicoDetalhes] = useState('');
  const [enviandoMecanico, setEnviandoMecanico] = useState(false);
  const [mecanicoEnviado, setMecanicoEnviado] = useState(false);

  const [showViasModal, setShowViasModal] = useState(false);
  const [viasOption, setViasOption] = useState('');
  const [viasDetalhes, setViasDetalhes] = useState('');
  const [enviandoVias, setEnviandoVias] = useState(false);
  const [viasEnviado, setViasEnviado] = useState(false);

  const [showSosModal, setShowSosModal] = useState(false);
  const [enviandoSos, setEnviandoSos] = useState(false);
  const [sosAtivo, setSosAtivo] = useState(false);

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
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string>('');
  const [isCameraLigada, setIsCameraLigada] = useState(false);
  const mainScannerRef = useRef<any>(null);
  const [lastScannedId, setLastScannedId] = useState<string>('');

  // Refs de segurança para callbacks do scanner
  const rotaAtivaRef = useRef(rotaAtiva);
  const selectedRotaIdRef = useRef(selectedRotaId);
  const motoristaIdRef = useRef<string>('');

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
        motoristaIdRef.current = user.id;
        const { data: perfil } = await supabase
          .from('perfis')
          .select('id, nome, telefone, foto_url')
          .eq('id', user.id)
          .maybeSingle();
          
        if (perfil) {
          const { data: driverPerfil } = await supabase
            .from('motoristas_perfil')
            .select('id, placa_veiculo, modelo_veiculo, cnh, cnh_categoria')
            .eq('perfil_id', perfil.id)
            .maybeSingle();

          setPerfilMotorista({
            id: perfil.id,
            nome: perfil.nome || '',
            telefone: perfil.telefone || '',
            foto_url: perfil.foto_url || '',
            placa_veiculo: driverPerfil?.placa_veiculo || '',
            modelo_veiculo: driverPerfil?.modelo_veiculo || '',
            cnh: driverPerfil?.cnh || '',
            cnh_categoria: driverPerfil?.cnh_categoria || ''
          });
          setEditNome(perfil.nome || '');
          setEditTelefone(perfil.telefone || '');

          // Na tabela public.rotas, a coluna motorista_id referencia public.perfis.id
          const { data: dbRotas } = await supabase
            .from('rotas')
            .select('id, nome, codigo, turno, ativa')
            .eq('motorista_id', perfil.id);

          if (dbRotas && dbRotas.length > 0) {
            const mappedRotas: RotaConfig[] = [];
            
            for (const r of dbRotas) {
              const primaryAlunosRes = await supabase
                .from('alunos')
                .select(`
                  id, 
                  nome, 
                  escola, 
                  foto_url, 
                  responsavel_id,
                  endereco,
                  carteirinhas (
                    qr_code_hash
                  )
                `)
                .eq('rota_id', r.id)
                .eq('turno', turno === 'Manhã' ? 'Manhã' : turno === 'Tarde' ? 'Tarde' : 'Noite');

              let dbAlunos: any[] | null = null;

              if (primaryAlunosRes.error && (primaryAlunosRes.error.message?.includes('endereco') || primaryAlunosRes.error.code === 'PGRST100' || primaryAlunosRes.error.message?.includes('column'))) {
                console.warn('Coluna endereco não encontrada na tabela alunos. Tentando sem endereco.');
                const secondaryAlunosRes = await supabase
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
                dbAlunos = secondaryAlunosRes.data;
              } else {
                dbAlunos = primaryAlunosRes.data;
              }

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
                    qrCodeHash: hash,
                    endereco: aluno.endereco || undefined
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
    
    // Fallback Mock Perfil
    setPerfilMotorista({
      id: '33333333-3333-3333-3333-333333333333',
      nome: 'Silvio Roberto (Tio Silvio)',
      telefone: '43999999990',
      foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      placa_veiculo: 'BBB-5678',
      modelo_veiculo: 'Ônibus Mercedes-Benz',
      cnh: '12345678900',
      cnh_categoria: 'Categoria D'
    });
    setEditNome('Silvio Roberto (Tio Silvio)');
    setEditTelefone('43999999990');
    
    // Fallback Mock
    const fallbackRotas = ROTAS_MOCK.map(r => {
      const existing = rotas.find(ex => ex.id === r.id);
      const isAtiva = existing ? existing.ativa : false;
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
      return { ...r, ativa: isAtiva, alunos: filteredAlunos };
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
      const mId = motoristaIdRef.current;
      if (mId) {
        // Usando fetch nativo com keepalive para persistir a requisição mesmo após destruição da página
        fetch('/api/motorista/status-rota', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: false, global: true }),
          keepalive: true
        }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

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
          const newRow = payload.new as { compareceu: boolean, aluno_id: number | string };
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
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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
    async function startCamera() {
      try {
        setCameraErrorMsg('');
        const { Html5Qrcode } = await import('html5-qrcode');
        
        // Verifica se o elemento existe antes de tentar instanciar
        const readerElement = document.getElementById('reader');
        if (!readerElement) {
           console.error("Elemento #reader não encontrado no DOM!");
           setCameraErrorMsg("Elemento do scanner não está pronto na tela.");
           setHasCameraPermission(false);
           return;
        }

        mainScannerRef.current = new Html5Qrcode("reader");
        
        await mainScannerRef.current.start(
          { facingMode: "environment" },
          { fps: 15 },
          (decodedText: string) => {
            handleQrCodeScanned(decodedText);
          },
          () => {}
        );
        setHasCameraPermission(true);
      } catch (err: any) {
        console.error("Erro ao iniciar camera:", err);
        setCameraErrorMsg(err?.message || String(err));
        setHasCameraPermission(false);
      }
    }

    if (isCameraLigada) {
      setTimeout(() => startCamera(), 200);
    } else {
      if (mainScannerRef.current && mainScannerRef.current.isScanning) {
        mainScannerRef.current.stop().catch((e: any) => console.log(e));
      }
    }

    return () => {
      if (mainScannerRef.current && mainScannerRef.current.isScanning) {
        mainScannerRef.current.stop().catch((e: any) => console.log(e));
      }
    };
  }, [isCameraLigada]);

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
          .filter(aluno => aluno.statusLocal === 'presente')
          .map(aluno => ({
            aluno_id: aluno.id,
            titulo: 'Embarque Escolar Confirmado',
            mensagem: `Seu filho(a) ${aluno.nome} acabou de embarcar na RotaEscola (${selectedTurno}).`,
            lida: false
          }));

        // 3. Executa todas as inserções no banco em paralelo
        const [logsRes, notificationsRes] = await Promise.all([
          logsToInsert.length > 0 ? supabase.from('logs_embarque').insert(logsToInsert) : Promise.resolve({ error: null }),
          notificationsToInsert.length > 0 ? supabase.from('notificacoes').insert(notificationsToInsert) : Promise.resolve({ error: null }),
          supabase.from('localizacao_veiculo').insert({
            rota_id: rotaAtiva.id,
            latitude: -23.4178,
            longitude: -51.4269,
            velocidade_kmh: 40,
            atualizado_em: new Date().toISOString()
          })
        ]);

        if (logsRes?.error) throw logsRes.error;
        if (notificationsRes?.error) throw notificationsRes.error;

        setToastType('success');
        setToastMessage('Lista enviada com sucesso!');
        setShowSuccessToast(true);
        setIsSentSuccessfully(true);

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
      }
    } catch (err: any) {
      console.error('Erro ao enviar lote para o banco de dados:', err);
      setToastType('error');
      setToastMessage(err.message || 'Erro ao sincronizar dados com o servidor.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } finally {
      setLoading(false);
    }
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
      // Fecha o modal após 2.5s
      setTimeout(() => handleFecharOcorrenciaModal(), 2500);
    } catch (err: any) {
      console.error('Erro ao enviar ocorrência:', err);
      setToastType('error');
      setToastMessage(err.message || 'Falha ao registrar ocorrência.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
      setEnviandoOcorrencia(false);
    }
  };

  const handleEnviarMecanico = async () => {
    if (!mecanicoOption) return;
    setEnviandoMecanico(true);
    try {
      const rotaNome = rotaAtiva ? `${rotaAtiva.codigo} - ${rotaAtiva.nome}` : 'Não Identificada';
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
        setShowMecanicoModal(false);
        setMecanicoOption('');
        setMecanicoDetalhes('');
        setMecanicoEnviado(false);
      }, 2500);
    } catch (err: any) {
      console.error('Erro ao enviar relatório mecânico:', err);
      setToastType('error');
      setToastMessage(err.message || 'Falha ao enviar alerta mecânico à central.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } finally {
      setEnviandoMecanico(false);
    }
  };

  const handleEnviarVias = async () => {
    if (!viasOption) return;
    setEnviandoVias(true);
    try {
      const rotaNome = rotaAtiva ? `${rotaAtiva.codigo} - ${rotaAtiva.nome}` : 'Não Identificada';
      const msg = `O motorista relatou "${viasOption}" no trajeto da Rota ${rotaNome}. Detalhes: ${viasDetalhes.trim() || 'Nenhum.'}`;

      const { error } = await supabase.from('notificacoes').insert({
        aluno_id: null,
        titulo: '🚧 Alerta de Via / Tráfego',
        mensagem: msg,
        lida: false
      });
      if (error) throw error;

      setViasEnviado(true);
      setTimeout(() => {
        setShowViasModal(false);
        setViasOption('');
        setViasDetalhes('');
        setViasEnviado(false);
      }, 2500);
    } catch (err: any) {
      console.error('Erro ao enviar relatório de via:', err);
      setToastType('error');
      setToastMessage(err.message || 'Falha ao enviar alerta de via à central.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } finally {
      setEnviandoVias(false);
    }
  };

  const handleDispararSos = async () => {
    setEnviandoSos(true);
    try {
      const rotaNome = rotaAtiva ? `${rotaAtiva.codigo} - ${rotaAtiva.nome}` : 'Não Identificada';
      const msg = `🚨 EMERGÊNCIA SOS DISPARADA! O motorista da Rota ${rotaNome} (Veículo Placa: ${rotaAtiva?.placa || '...'}) enviou um sinal de pânico imediato.`;

      const { error } = await supabase.from('notificacoes').insert({
        aluno_id: null,
        titulo: '🚨 ALERTA DE EMERGÊNCIA (SOS) 🚨',
        mensagem: msg,
        lida: false
      });
      if (error) throw error;

      setSosAtivo(true);
      setShowSosModal(false);
    } catch (err: any) {
      console.error('Erro ao disparar SOS:', err);
      setToastType('error');
      setToastMessage(err.message || 'Falha ao disparar alerta SOS emergencial.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } finally {
      setEnviandoSos(false);
    }
  };

  const handleToggleRotaAtiva = async (newVal: boolean) => {
    if (!rotaAtiva) return;
    try {
      const res = await fetch('/api/motorista/status-rota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newVal,
          global: newVal === false,
          rotaId: selectedRotaId
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao alternar status da rota');
      }

      setRotas(prev => prev.map(r => {
        if (newVal === false) {
          return { ...r, ativa: false };
        } else {
          return r.id === selectedRotaId ? { ...r, ativa: true } : r;
        }
      }));
      setToastMessage(newVal ? 'Rota iniciada com sucesso!' : 'Rota encerrada com sucesso!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      console.error('Erro ao alternar status da rota:', err);
      setRotas(prev => prev.map(r => {
        if (newVal === false) {
          return { ...r, ativa: false };
        } else {
          return r.id === selectedRotaId ? { ...r, ativa: true } : r;
        }
      }));
      setToastMessage(newVal ? '[MOCK] Rota iniciada!' : '[MOCK] Rota encerrada!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/motorista/status-rota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: false,
          global: true
        })
      });
    } catch (err) {
      console.error('Erro ao desativar rota no logout:', err);
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

  // Lógica de Upload da Foto de Perfil do Motorista
  const handleUploadPhoto = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToastType('error');
      setToastMessage('Por favor, selecione uma imagem válida.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToastType('error');
      setToastMessage('A imagem deve ter no máximo 5MB.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      return;
    }

    setUploadingPhoto(true);
    try {
      const mId = motoristaIdRef.current || perfilMotorista?.id;
      if (!mId) throw new Error('Identificação do motorista ausente.');

      const ext = file.name.split('.').pop() || 'png';
      const fileName = `fotos-motoristas/${mId}_${Date.now()}.${ext}`;

      if (mId.startsWith('33333333')) {
        // Simulação em modo mock/demonstração
        setTimeout(() => {
          const fakeUrl = `https://picsum.photos/300/300?random=${mId}`;
          setPerfilMotorista(prev => prev ? { ...prev, foto_url: fakeUrl } : null);
          setUploadingPhoto(false);
          setToastType('success');
          setToastMessage('Foto do perfil atualizada (modo demonstração)!');
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 3000);
        }, 1200);
        return;
      }

      // Upload para o bucket documentos-transporte
      const { error: storageError } = await supabase.storage
        .from('documentos-transporte')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (storageError) throw storageError;

      // URL Pública
      const publicUrl = supabase.storage
        .from('documentos-transporte')
        .getPublicUrl(fileName).data.publicUrl;

      // Salva no banco de dados na tabela perfis
      const { error: dbError } = await supabase
        .from('perfis')
        .update({ foto_url: publicUrl })
        .eq('id', mId);

      if (dbError) throw dbError;

      setPerfilMotorista(prev => prev ? { ...prev, foto_url: publicUrl } : null);
      setToastType('success');
      setToastMessage('Foto de perfil atualizada com sucesso!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err: any) {
      console.error('Erro no upload da foto do motorista:', err);
      setToastType('error');
      setToastMessage(err.message || 'Erro ao salvar a foto de perfil.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Lógica de Gravação de Perfil do Motorista
  const handleSalvarPerfil = async () => {
    if (!editNome.trim()) {
      setToastType('error');
      setToastMessage('O nome completo é obrigatório.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      return;
    }

    setEnviandoPerfil(true);
    try {
      const mId = motoristaIdRef.current || perfilMotorista?.id;
      if (!mId) throw new Error('Identificação do motorista ausente.');

      if (mId.startsWith('33333333')) {
        // Simulação em modo mock
        setTimeout(() => {
          setPerfilMotorista(prev => prev ? { ...prev, nome: editNome.trim(), telefone: editTelefone.trim() } : null);
          setEnviandoPerfil(false);
          setToastType('success');
          setToastMessage('Perfil atualizado (modo demonstração)!');
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 3000);
          setShowPerfilModal(false);
        }, 1000);
        return;
      }

      const { error } = await supabase
        .from('perfis')
        .update({
          nome: editNome.trim(),
          telefone: editTelefone.trim()
        })
        .eq('id', mId);

      if (error) throw error;

      setPerfilMotorista(prev => prev ? { ...prev, nome: editNome.trim(), telefone: editTelefone.trim() } : null);
      setToastType('success');
      setToastMessage('Perfil atualizado com sucesso!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      setShowPerfilModal(false);
    } catch (err: any) {
      console.error('Erro ao salvar dados do perfil:', err);
      setToastType('error');
      setToastMessage(err.message || 'Falha ao atualizar dados do perfil.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } finally {
      setEnviandoPerfil(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center font-sans antialiased text-[#0b1c3c] p-0 sm:p-6 md:p-8">
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
        @keyframes flashBg {
          from { background-color: rgba(67, 10, 20, 0.95); }
          to { background-color: rgba(136, 19, 36, 0.98); }
        }
        .flashing-bg {
          animation: flashBg 1.5s infinite alternate;
        }
      `}</style>

      {/* Moldura Celular Simulada Premium (Bank Card Style) */}
      <div className="w-full max-w-md bg-[#f4f7fb] sm:shadow-[0_24px_64px_rgba(0,0,0,0.08)] flex flex-col relative min-h-screen sm:min-h-[840px] sm:rounded-[40px] overflow-hidden border border-slate-200">
        

        
        {/* Toast Consolidado */}
        {showSuccessToast && (
          <div className={`absolute top-16 left-5 right-5 z-[60] bg-slate-900 border ${
            toastType === 'success' ? 'border-emerald-500/30' : 'border-rose-500/30'
          } rounded-2xl p-4 flex items-center gap-3 shadow-2xl animate-slideDown`}>
            <div className={`w-8 h-8 rounded-full ${
              toastType === 'success' ? 'bg-emerald-500/10 text-emerald-450' : 'bg-rose-500/10 text-rose-450'
            } flex items-center justify-center shrink-0`}>
              {toastType === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                {toastType === 'success' ? 'Sucesso' : 'Falha na Operação'}
              </p>
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

        {/* Header Minimalista (Bank Style) */}
        <header className="px-6 pt-12 pb-4 flex items-center justify-between z-10 bg-transparent">
          <div className="flex flex-col">
            <h1 className="font-extrabold text-2xl text-[#1a2b4c] leading-tight">
              Olá, {perfilMotorista?.nome ? perfilMotorista.nome.split(' ')[0] : 'Motorista'}
            </h1>
          </div>
          
          <div className="flex gap-3 items-center">
            <button onClick={handleLogout} className="text-slate-400 hover:text-slate-600 active:scale-95 transition-all p-1 mr-1">
              <LogOut size={20} />
            </button>
            <div 
              onClick={() => {
                setEditNome(perfilMotorista?.nome || '');
                setEditTelefone(perfilMotorista?.telefone || '');
                setShowPerfilModal(true);
              }}
              className="w-12 h-12 rounded-full border border-slate-200 overflow-hidden shadow-sm cursor-pointer active:scale-95 transition-transform bg-blue-100 flex items-center justify-center p-0.5"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                {perfilMotorista?.foto_url ? (
                  <img src={perfilMotorista.foto_url} alt={perfilMotorista.nome} className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-blue-500 mt-2 ml-2" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Área Principal de Scroll */}
        <main className="relative z-10 px-6 pb-8 overflow-y-auto flex-1 scrollbar-thin flex flex-col gap-6">
          
          {/* Fase 1: Cartão Limpo de Configuração Inicial (Premium Layout) */}
          {!rotaAtiva?.ativa && (
            <section className="animate-fadeIn mt-2 flex flex-col flex-1">
              <div className="mb-6 px-1 shrink-0">
                <h2 className="text-2xl font-extrabold text-[#002045]">Preparar Viagem</h2>
                <p className="text-sm text-[#74777f] mt-1">Configure os detalhes antes de iniciar sua rota.</p>
              </div>

              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 flex flex-col relative overflow-hidden flex-1">
                {/* Decorative blob */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#d6e3ff]/30 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col flex-1">
                  <div className="space-y-6">
                  {/* Turno */}
                  <div>
                    <label className="text-xs font-bold text-[#74777f] uppercase tracking-wider mb-2 block">Turno</label>
                    <div className="flex bg-[#f1f4f6] p-1.5 rounded-2xl">
                      {(['Manhã', 'Tarde', 'Noite'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setSelectedTurno(t)}
                          className={`flex-1 py-3 rounded-xl text-[13px] font-bold transition-all shadow-sm ${selectedTurno === t ? 'bg-white text-[#002045]' : 'text-[#74777f] shadow-none hover:text-[#002045]'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sentido */}
                  <div>
                    <label className="text-xs font-bold text-[#74777f] uppercase tracking-wider mb-2 block">Sentido</label>
                    <div className="flex bg-[#f1f4f6] p-1.5 rounded-2xl">
                      {(['IDA', 'VOLTA'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedSentido(s)}
                          className={`flex-1 py-3 rounded-xl text-[13px] font-bold transition-all shadow-sm ${selectedSentido === s ? 'bg-white text-[#002045]' : 'text-[#74777f] shadow-none hover:text-[#002045]'}`}
                        >
                          {s === 'IDA' ? 'Ida (Escola)' : 'Volta (Casa)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Linha / Rota */}
                  <div>
                    <label className="text-xs font-bold text-[#74777f] uppercase tracking-wider mb-2 block">Linha de Ônibus</label>
                    <div className="relative">
                      <select
                        value={selectedRotaId}
                        onChange={(e) => setSelectedRotaId(e.target.value)}
                        className="w-full bg-[#f7fafc] border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-extrabold text-[#002045] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all"
                        disabled={rotas.length === 0}
                      >
                        {rotas.length === 0 ? <option value="">Nenhuma rota carregada</option> : rotas.map(r => <option key={r.id} value={r.id}>{r.codigo} - {r.nome}</option>)}
                      </select>
                      <Bus size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#74777f]" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronRight size={18} className="text-[#74777f] rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Radar Gráfico (Preenchimento Elegante do Vazio) */}
                <div className="flex-1 flex flex-col items-center justify-center relative mt-6 min-h-[140px] pointer-events-none select-none">
                   <div className="absolute w-full h-full flex items-center justify-center opacity-60">
                      <div className="w-24 h-24 rounded-full border-2 border-blue-200 absolute animate-ping" style={{ animationDuration: '2.5s' }}></div>
                      <div className="w-32 h-32 rounded-full border border-slate-200 absolute"></div>
                      <div className="w-40 h-40 rounded-full border border-slate-100 absolute"></div>
                   </div>
                   <div className="w-16 h-16 bg-gradient-to-br from-white to-blue-50 rounded-full flex items-center justify-center shadow-sm border border-blue-100 z-10 mb-4 relative overflow-hidden">
                      <div className="absolute w-12 h-12 bg-blue-400/10 rounded-full blur-xl"></div>
                      <Navigation size={26} className="text-blue-500 relative z-10 ml-0.5 mt-0.5" />
                   </div>
                   <p className="text-[10px] font-extrabold text-slate-400 z-10 text-center uppercase tracking-[0.2em]">
                     Pronto Para Partir
                   </p>
                </div>

                {/* Botão de Iniciar */}
                <div className="mt-auto">
                    <button
                      onClick={() => handleToggleRotaAtiva(true)}
                      disabled={!selectedRotaId}
                      className="w-full bg-emerald-600 disabled:opacity-50 disabled:scale-100 text-white font-extrabold text-[15px] py-4 rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all shadow-[0_8px_20px_rgba(5,150,105,0.25)] flex items-center justify-center gap-2"
                    >
                      Iniciar Operação
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Fase 2: Rota Ativa (Cartão Azul de Viagem e Goal Bar) */}
          {rotaAtiva?.ativa && (
            <section className="animate-fadeIn mt-2">
              {/* O "Cartão de Crédito" Azul em Viagem */}
              <div className="w-full rounded-[1.5rem] p-6 shadow-[0_12px_32px_rgba(29,78,216,0.25)] bg-gradient-to-br from-blue-600 via-blue-700 to-[#1e3a8a] relative overflow-hidden mb-4">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -left-4 bottom-4 w-24 h-24 bg-blue-400/20 rounded-full blur-xl pointer-events-none"></div>
                
                <div className="flex justify-between items-start relative z-10 mb-8">
                  <span className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Rota Ativa</span>
                </div>

                <div className="relative z-10 flex flex-col">
                  <h2 className="text-2xl font-extrabold text-white tracking-widest mb-1">{rotaAtiva.codigo}</h2>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-blue-200 text-[10px] uppercase tracking-wider mb-0.5">Turno</p>
                      <p className="text-white text-xs font-bold">{selectedTurno}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-[10px] uppercase tracking-wider mb-0.5">Sentido</p>
                      <p className="text-white text-xs font-bold">{selectedSentido === 'IDA' ? 'Escola' : 'Casa'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Goal Bar (Barra de Metas / Lotação) */}
              <div className="bg-[#5984ef] rounded-2xl p-4 flex items-center justify-between shadow-sm mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                     <PieChart size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">Ocupação</p>
                    <p className="text-white text-xs font-medium">Alunos a Bordo</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-xl font-black text-white">{alunosABordo}</span>
                    <span className="text-sm font-bold text-blue-200">/ {totalAlunos}</span>
                  </div>
                  <div className="w-24 h-1.5 bg-blue-800/50 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-white transition-all duration-500 rounded-full" style={{ width: `${percentualOcupacao}%` }} />
                  </div>
                </div>
              </div>

              <button
                  onClick={() => handleToggleRotaAtiva(false)}
                  className="w-full bg-white border border-rose-100 text-rose-600 py-3 rounded-2xl flex justify-center items-center gap-2 active:scale-95 transition-all font-bold text-sm shadow-sm"
              >
                  <Square size={16} fill="currentColor" />
                  Encerrar Viagem
              </button>
            </section>
          )}



          {/* Câmera do Scanner */}
          {rotaAtiva?.ativa && (
            <section className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-6">
               <div className="flex items-center justify-between mb-3 px-1">
                 <h3 className="text-sm font-bold text-[#1a2b4c]">Câmera de Leitura</h3>
                 <button 
                   onClick={() => setIsCameraLigada(!isCameraLigada)}
                   className={`font-bold text-[10px] uppercase px-3 py-1.5 rounded-full transition-all ${isCameraLigada ? 'bg-rose-100 text-rose-700' : 'bg-blue-50 text-blue-700'}`}
                 >
                   {isCameraLigada ? 'Desligar' : 'Ligar'}
                 </button>
               </div>
               
               {isCameraLigada ? (
                 <div className="relative w-full h-40 rounded-2xl bg-slate-900 overflow-hidden border border-slate-200 flex items-center justify-center">
                    {hasCameraPermission === false && (
                      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 bg-slate-900 text-center">
                         <AlertTriangle size={32} className="text-amber-500 mb-2" />
                         <p className="text-amber-500 font-bold text-xs mb-1">Erro na Câmera</p>
                         <p className="text-slate-400 text-[10px] break-words">{cameraErrorMsg}</p>
                      </div>
                    )}
                    <div id="reader" className="w-full h-full absolute inset-0 z-0"></div>
                    <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_#3b82f6] z-20 scanner-line pointer-events-none" />
                    
                    {scanState === 'success' && scannedAluno && (
                      <div className="absolute inset-0 bg-emerald-500/95 z-30 flex flex-col items-center justify-center p-4">
                        <CheckCircle2 size={36} className="text-white mb-2" />
                        <p className="text-white font-bold text-center text-sm">{scannedAluno.nome}</p>
                      </div>
                    )}
                    {scanState === 'error' && (
                      <div className="absolute inset-0 bg-rose-500/95 z-30 flex flex-col items-center justify-center p-4">
                        <XCircle size={36} className="text-white mb-2" />
                        <p className="text-white font-bold text-center text-sm">{scanErrorMsg}</p>
                      </div>
                    )}
                 </div>
               ) : (
                 <div className="relative w-full h-40 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                   <Camera size={32} className="mb-2 opacity-40" />
                   <p className="text-xs font-semibold">Câmera Desligada</p>
                 </div>
               )}
            </section>
          )}

          {/* Recent Transactions (Passageiros) */}
          {rotaAtiva?.ativa && (
            <section>
              <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="text-base font-extrabold text-[#1a2b4c]">Passageiros Recentes</h2>
                <span className="text-xs font-bold text-slate-400">Ver todos</span>
              </div>
              <div className="space-y-3 pb-8">
                {rotaAtiva.alunos.map(aluno => (
                  <div
                    key={aluno.id}
                    onClick={() => cycleAlunoStatus(aluno.id)}
                    className={`flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border ${
                      aluno.statusLocal === 'presente' ? 'border-emerald-100 border-l-4 border-l-emerald-500 bg-emerald-50/30' :
                      aluno.statusLocal === 'ausente' ? 'border-rose-100 border-l-4 border-l-rose-500 bg-rose-50/30' :
                      'border-slate-100'
                    } active:bg-slate-50 transition-all cursor-pointer ${
                      aluno.ausenciaNotificada ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Left Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        aluno.statusLocal === 'presente' ? 'bg-emerald-500 text-white' :
                        aluno.statusLocal === 'ausente' ? 'bg-rose-500 text-white' :
                        'border-2 border-slate-300 text-transparent'
                      }`}>
                        {aluno.statusLocal === 'presente' ? (
                          <Check size={18} strokeWidth={3} />
                        ) : aluno.statusLocal === 'ausente' ? (
                          <X size={18} strokeWidth={3} />
                        ) : null}
                      </div>

                      {/* Middle Info */}
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          {aluno.statusLocal === 'presente' && (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm tracking-wider">
                              Presente
                            </span>
                          )}
                          {aluno.statusLocal === 'ausente' && (
                            <span className="bg-rose-100 text-rose-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm tracking-wider">
                              Faltou
                            </span>
                          )}
                          <p className={`text-[13px] font-extrabold leading-tight ${
                            aluno.statusLocal === 'presente' ? 'text-emerald-700' : 
                            aluno.statusLocal === 'ausente' ? 'text-rose-700' : 
                            'text-[#1a2b4c]'
                          }`}>
                            {aluno.nome}
                          </p>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500">
                          {aluno.escola}
                        </p>
                        {aluno.statusLocal === 'pendente' && aluno.endereco && (
                          <div className="flex items-center gap-1 text-slate-400 mt-1">
                            <MapPin size={10} className="shrink-0" />
                            <p className="text-[10px] font-medium leading-tight truncate max-w-[200px]">
                              {aluno.endereco}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Right Pill */}
                    <div className="text-right shrink-0">
                       <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                         aluno.statusLocal === 'presente' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                         aluno.statusLocal === 'ausente' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                         'bg-transparent border-slate-200 text-slate-500'
                       }`}>
                         {aluno.statusLocal === 'presente' ? 'Presente' : aluno.statusLocal === 'ausente' ? 'Faltou' : 'Pendente'}
                       </div>
                    </div>
                  </div>
                ))}

                {(temAlteracoes || isSentSuccessfully) && (
                  <div className="pt-4">
                    <button
                      onClick={handleSendBatch}
                      disabled={loading || isSentSuccessfully}
                      className={`w-full py-4 rounded-2xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                        isSentSuccessfully ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] active:scale-95'
                      }`}
                    >
                      {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : isSentSuccessfully ? "Sincronizado" : "Sincronizar Relatório"}
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
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
                    <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_20px_#f97316,0_0_8px_#f97316] z-20 scanner-line pointer-events-none" />
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

        {/* ══════════════════════════════════════════════════════
            MODAL OPERACIONAL: RELATAR PROBLEMA MECÂNICO
        ══════════════════════════════════════════════════════ */}
        {showMecanicoModal && (
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
                  setShowMecanicoModal(false);
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
        )}

        {/* ══════════════════════════════════════════════════════
            MODAL OPERACIONAL: RELATAR BLOQUEIO DE VIA
        ══════════════════════════════════════════════════════ */}
        {showViasModal && (
          <div className="absolute inset-0 z-50 flex flex-col rounded-[36px] overflow-hidden animate-fadeIn" style={{ backgroundColor: '#020617' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400">
                  <Map size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white tracking-tight">Alerta de Trânsito / Vias</h3>
                  <p className="text-[9px] text-slate-400 mt-0.5">Avise a central sobre interrupções na rota</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowViasModal(false);
                  setViasOption('');
                  setViasDetalhes('');
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors border-0 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5">
              {!viasEnviado ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                      Selecione o Tipo de Obstáculo
                    </label>
                    <div className="flex flex-col gap-2">
                      {[
                        'Acidente de Trânsito',
                        'Via Interditada por Obras',
                        'Alagamento / Enchente',
                        'Congestionamento Intenso / Bloqueio',
                        'Outro Obstáculo na Via'
                      ].map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setViasOption(option)}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                            viasOption === option
                              ? 'bg-blue-500/15 border-blue-500 text-blue-400'
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
                      Localização / Detalhes (Recomendado)
                    </label>
                    <textarea
                      value={viasDetalhes}
                      onChange={(e) => setViasDetalhes(e.target.value)}
                      placeholder="Ex: Rua Harpia interditada próximo ao semáforo..."
                      rows={4}
                      className="w-full bg-slate-900 border border-slate-750 focus:border-blue-500 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-650 focus:outline-none resize-none transition-colors leading-relaxed"
                    />
                  </div>

                  <button
                    onClick={handleEnviarVias}
                    disabled={!viasOption || enviandoVias}
                    className={`w-full py-4 rounded-2xl text-[10px] font-extrabold tracking-widest uppercase flex items-center justify-center gap-2 transition-all border-0 ${
                      viasOption && !enviandoVias
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_8px_20px_rgba(59,130,246,0.25)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer font-bold'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {enviandoVias ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Enviar Alerta</span>
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
                    <h4 className="text-sm font-extrabold text-emerald-400 uppercase tracking-widest font-mono">ALERTA ENVIADO!</h4>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                      A central operacional recebeu sua notificação de via. Rotas alternativas serão calculadas.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            MODAL OPERACIONAL: DISPARO DE SINAL SOS
        ══════════════════════════════════════════════════════ */}
        {showSosModal && (
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
                  onClick={() => setShowSosModal(false)}
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
              onClick={async () => {
                try {
                  const rotaNome = rotaAtiva ? `${rotaAtiva.codigo} - ${rotaAtiva.nome}` : 'Não Identificada';
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
                  setToastType('error');
                  setToastMessage(e.message || 'Erro ao enviar normalização de emergência.');
                  setShowSuccessToast(true);
                  setTimeout(() => setShowSuccessToast(false), 4000);
                }
              }}
              className="py-4 px-8 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest bg-white hover:bg-slate-150 text-slate-950 shadow-2xl hover:scale-105 active:scale-95 transition-all border-0 cursor-pointer font-black"
            >
              Finalizar Sinal / Normalizado
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            MODAL DE PERFIL DO MOTORISTA
        ══════════════════════════════════════════════════════ */}
        {showPerfilModal && (
          <div className="absolute inset-0 z-50 flex flex-col rounded-[36px] overflow-hidden animate-fadeIn" style={{ backgroundColor: '#020617' }}>
            {/* Header do Modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white tracking-tight">Meu Perfil</h3>
                  <p className="text-[9px] text-slate-400 mt-0.5">Gerencie seus dados pessoais e profissionais</p>
                </div>
              </div>
              <button
                onClick={() => setShowPerfilModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors border-0 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6 scrollbar-thin">
              
              {/* Upload de Foto de Perfil */}
              <div className="flex flex-col items-center gap-2.5">
                <div 
                  onClick={() => document.getElementById('upload-avatar-motorista')?.click()}
                  className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden cursor-pointer relative group hover:border-amber-500 hover:scale-[1.03] transition-all shrink-0"
                  title="Clique para alterar sua foto de perfil"
                >
                  {perfilMotorista?.foto_url ? (
                    <img src={perfilMotorista.foto_url} alt={perfilMotorista.nome} className="w-full h-full object-cover" />
                  ) : (
                    <User size={36} className="text-slate-700" />
                  )}
                  
                  {/* Overlay de Hover */}
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-amber-400 gap-1 text-[8px] font-black uppercase tracking-wider">
                    <Camera size={16} />
                    <span>Alterar</span>
                  </div>

                  {/* Indicador de Upload */}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center z-10">
                      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  id="upload-avatar-motorista"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadPhoto(file);
                  }}
                />
                <span className="text-[8.5px] text-slate-500 font-medium">Toque no círculo para alterar sua foto</span>
              </div>

              {/* Dados Pessoais Editáveis */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    placeholder="Digite seu nome completo..."
                    className="w-full bg-slate-900 border border-slate-850 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-750 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                    Telefone / WhatsApp (Contato)
                  </label>
                  <input
                    type="text"
                    value={editTelefone}
                    onChange={(e) => setEditTelefone(e.target.value)}
                    placeholder="Ex: 43999999999"
                    className="w-full bg-slate-900 border border-slate-850 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-750 focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Dados Operacionais e de Habilitação (Apenas Leitura) */}
              <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 space-y-3.5 shadow-inner">
                <h4 className="text-[9.5px] font-black text-amber-500 uppercase tracking-widest border-b border-slate-800/60 pb-2">
                  Informações Operacionais
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8.5px] text-slate-500 uppercase tracking-wider block">Veículo Associado</span>
                    <span className="text-xs font-bold text-white mt-1 block">
                      {perfilMotorista?.modelo_veiculo || 'Não Atribuído'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-slate-500 uppercase tracking-wider block">Placa da Van</span>
                    <span className="text-xs font-mono font-bold text-amber-400 mt-1 block">
                      {perfilMotorista?.placa_veiculo || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-slate-500 uppercase tracking-wider block">CNH (Documento)</span>
                    <span className="text-xs font-mono font-bold text-white mt-1 block">
                      {perfilMotorista?.cnh || 'Não Cadastrado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-slate-500 uppercase tracking-wider block">Categoria da CNH</span>
                    <span className="text-xs font-bold text-white mt-1 block">
                      {perfilMotorista?.cnh_categoria ? (
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[9.5px] font-mono text-emerald-450">
                          {perfilMotorista.cnh_categoria}
                        </span>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-800/40 text-center">
                  <p className="text-[8.5px] text-slate-500 leading-normal">
                    Os dados operacionais de frota e CNH são gerenciados exclusivamente pela administração SEMED.
                  </p>
                </div>
              </div>

              {/* Botão de Salvar Alterações */}
              <button
                onClick={handleSalvarPerfil}
                disabled={enviandoPerfil || !editNome.trim()}
                className={`w-full py-4 rounded-2xl text-[10px] font-extrabold tracking-widest uppercase flex items-center justify-center gap-2 transition-all border-0 ${
                  editNome.trim() && !enviandoPerfil
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_8px_20px_rgba(245,158,11,0.25)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer font-black'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {enviandoPerfil ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={13} />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>

            </div>
          </div>
        )}


      </div>
    </div>
  );
}




