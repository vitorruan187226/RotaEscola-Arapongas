'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import {
  User, Shield, MapPin, UploadCloud, AlertCircle, FileText,
  CheckCircle, Clock, MessageCircle, X, Trash2, CalendarX,
  RotateCcw, WifiOff, Bus, Navigation, CheckCircle2, Image, Download, Plus, ShieldAlert, Camera, Pencil
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// ─── Contrato de Dados (Lei 4 — Tipagem estrita) ──────────────────────────────
interface Filho {
  id: string;
  nome: string;
  escola: string;
  escola_id?: string;
  serie: string;
  ano_serie?: string;
  turma?: string;
  statusCarteirinha: 'Pendente' | 'Em análise' | 'Aprovado';
  status?: 'aguardando' | 'aprovado' | 'rejeitado' | 'pendente_correcao';
  periodo?: 'manha' | 'tarde' | 'noite';
  observacao_secretaria?: string | null;
  rotaId?: string;
  rotaUuid?: string;
  fotoUrl?: string;
  motorista_nome?: string;
  motorista_telefone?: string | null;
  veiculo_numero?: string;
  rotaAtiva?: boolean;
  endereco?: string;
  data_nascimento?: string;
  dataVencimento?: string | null;
  notificadoExpiracao?: boolean;
}

const getSimulatedDate = () => {
  return new Date();
};

const getLocalDateString = () => {
  const date = getSimulatedDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ─── Mock tipado de fallback (lei 4 — sem @ts-ignore) ────────────────────────
const FILHOS_MOCK: Filho[] = [
  {
    id: 'aluno-01',
    nome: 'Thiago Martins Nogueira',
    escola: 'Escola Municipal Dorcelina Folador',
    serie: '4º Ano B',
    statusCarteirinha: 'Aprovado',
    rotaId: 'Rota 04',
    rotaUuid: '9d0f2832-7288-4682-9642-17cb25e36928',
    fotoUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=150&auto=format&fit=crop&q=80',
    motorista_nome: 'Silvio Roberto',
    motorista_telefone: '43999999990',
    veiculo_numero: 'BEX-1234 (Van Escolar)',
    dataVencimento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    notificadoExpiracao: false
  },
  {
    id: 'aluno-02',
    nome: 'carlos',
    escola: 'C.E.C.M Marques de Caravelas',
    serie: '6º Ano C',
    statusCarteirinha: 'Aprovado',
    rotaId: 'RT-88 — Região centro',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    motorista_nome: 'teste 2',
    motorista_telefone: '43999999991',
    veiculo_numero: '555ÇÇÇ (tetse)',
    dataVencimento: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    notificadoExpiracao: true
  },
  {
    id: 'aluno-03',
    nome: 'Beatriz Martins Nogueira',
    escola: 'Colégio Estadual Julia Wanderley',
    serie: '7º Ano A',
    statusCarteirinha: 'Em análise',
    rotaId: 'Pendente de Atribuição',
    fotoUrl: undefined,
  },
];

// ─── Helpers de badge ─────────────────────────────────────────────────────────
function getStatusBadgeClass(status: Filho['statusCarteirinha']) {
  switch (status) {
    case 'Aprovado':      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Em análise':
    case 'Pendente':      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:              return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function getStatusIcon(status: Filho['statusCarteirinha']) {
  switch (status) {
    case 'Aprovado':    return <CheckCircle size={13} />;
    case 'Em análise':
    case 'Pendente':    return <Clock size={13} />;
    default:            return <AlertCircle size={13} />;
  }
}

function mapStatus(raw: string | null): Filho['statusCarteirinha'] {
  if (raw === 'Aprovado')    return 'Aprovado';
  if (raw === 'Em análise') return 'Em análise';
  return 'Pendente';
}

function formatarCpfVisual(rawCpf: string) {
  const clean = rawCpf.replace(/\D/g, '');
  if (clean.length !== 11) return rawCpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function ResponsavelDashboard() {
  const router   = useRouter();
  const supabase = createClient();


  const [userName, setUserName] = useState<string>('');
  const [userCpf, setUserCpf] = useState<string>('');
  const [filhos,   setFilhos]   = useState<Filho[]>([]);
  const [escolas,  setEscolas]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [usandoMock, setUsandoMock] = useState(false);
  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null);

  // Estados dos Modais
  const [selectedFilhoDoc, setSelectedFilhoDoc] = useState<Filho | null>(null);
  const [selectedFilhoCart, setSelectedFilhoCart] = useState<Filho | null>(null);
  const [selectedFilhoRastreio, setSelectedFilhoRastreio] = useState<Filho | null>(null);
  const [activeModalCadastro, setActiveModalCadastro] = useState(false);
  const [selectedFilhoEdicao, setSelectedFilhoEdicao] = useState<Filho | null>(null);
  const [selectedFilhoRecadastro, setSelectedFilhoRecadastro] = useState<Filho | null>(null);

  // Estado de Toast Premium
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Carrega Usuário e Alunos
  useEffect(() => {
    async function loadUserAndFilhos() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Busca o perfil real no Supabase
          const { data: perfil } = await supabase
            .from('perfis')
            .select('nome, cpf')
            .eq('id', user.id)
            .maybeSingle();

          if (perfil) {
            setUserName(perfil.nome || '');
            setUserCpf(perfil.cpf || '');
          } else if (user.email) {
            const emailName = user.email.split('@')[0];
            setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
            setUserCpf('');
          }

          // Busca os alunos reais no Supabase com JOIN multinível para motorista e ônibus ajustado (resiliente para endereco)
          const primaryRes = await supabase
            .from('alunos')
            .select(`
              id, nome, data_nascimento, escola, escola_id, serie, ano_serie, turma, turno, periodo, status, status_carteirinha, foto_url, rota_id, observacao_secretaria, endereco,
              rotas (
                id,
                nome,
                ativa,
                perfis (
                  id,
                  nome,
                  telefone,
                  motoristas_perfil (
                    placa_veiculo,
                    modelo_veiculo
                  )
                )
              ),
              carteirinhas (
                data_vencimento,
                notificado_expiracao
              )
            `)
            .eq('responsavel_id', user.id);

          let alunosDB: any[] | null = null;
          let alunosErr = null;

          if (primaryRes.error && (primaryRes.error.message?.includes('endereco') || primaryRes.error.code === 'PGRST100' || primaryRes.error.message?.includes('column'))) {
            console.warn('Coluna endereco não encontrada na tabela alunos. Tentando sem endereco.');
            const secondaryRes = await supabase
              .from('alunos')
              .select(`
                id, nome, data_nascimento, escola, escola_id, serie, ano_serie, turma, turno, periodo, status, status_carteirinha, foto_url, rota_id, observacao_secretaria,
                rotas (
                  id,
                  nome,
                  ativa,
                  perfis (
                    id,
                    nome,
                    telefone,
                    motoristas_perfil (
                      placa_veiculo,
                      modelo_veiculo
                    )
                  )
                ),
                carteirinhas (
                  data_vencimento,
                  notificado_expiracao
                )
              `)
              .eq('responsavel_id', user.id);
            alunosDB = secondaryRes.data;
            alunosErr = secondaryRes.error;
          } else {
            alunosDB = primaryRes.data;
            alunosErr = primaryRes.error;
          }

          if (!alunosErr && alunosDB) {
            const mapeados: Filho[] = alunosDB.map((a: any) => {
              const rota = a.rotas;
              const motoristaPerfil = rota?.perfis;
              const motoristaNome = motoristaPerfil?.nome || 'Aguardando Atribuição';
              const motoristaTelefone = motoristaPerfil?.telefone || null;
              const veiculoInfo = motoristaPerfil?.motoristas_perfil;
              const veiculoNumero = veiculoInfo 
                ? `${veiculoInfo.placa_veiculo} (${veiculoInfo.modelo_veiculo || 'Ônibus'})` 
                : 'Aguardando Atribuição';

              return {
                id:                a.id,
                nome:              a.nome,
                data_nascimento:   a.data_nascimento ?? '',
                escola:            a.escola,
                escola_id:         a.escola_id,
                serie:             a.serie ?? '—',
                ano_serie:         a.ano_serie ?? '',
                turma:             a.turma ?? '',
                status:            a.status ?? 'aguardando',
                statusCarteirinha: mapStatus(a.status_carteirinha),
                rotaId:            rota?.nome ?? 'Aguardando Atribuição',
                rotaUuid:          a.rota_id ?? undefined,
                fotoUrl:           a.foto_url ?? undefined,
                motorista_nome:    motoristaNome,
                motorista_telefone: motoristaTelefone,
                veiculo_numero:    veiculoNumero,
                periodo:           a.periodo ?? 'manha',
                observacao_secretaria: a.observacao_secretaria ?? null,
                rotaAtiva:         rota?.ativa ?? false,
                endereco:          a.endereco ?? undefined,
                dataVencimento:    a.carteirinhas?.[0]?.data_vencimento ?? null,
                notificadoExpiracao: a.carteirinhas?.[0]?.notificado_expiracao ?? false
              };
            });
            setFilhos(mapeados);
            setUsandoMock(false);
          } else {
            setFilhos([]);
            setUsandoMock(false);
          }

          // Carrega as escolas do Supabase para o dropdown
          const { data: escolasDB } = await supabase
            .from('escolas')
            .select('id, nome, turnos, series')
            .order('nome', { ascending: true });
          
          if (escolasDB && escolasDB.length > 0) {
            setEscolas(escolasDB);
          } else {
            setEscolas([
              { id: 'b73e2840-7288-4682-9642-17cb25e36001', nome: 'Escola Municipal Dorcelina Folador', turnos: ['Manhã', 'Tarde'], series: ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'] },
              { id: 'b73e2840-7288-4682-9642-17cb25e36002', nome: 'Colégio Estadual Julia Wanderley', turnos: ['Manhã', 'Tarde', 'Noite'], series: ['6º Ano', '7º Ano', '8º Ano', '9º Ano', '1º Grau', '2º Grau', '3º Grau'] },
              { id: 'b73e2840-7288-4682-9642-17cb25e36003', nome: 'Escola Municipal Codorna', turnos: ['Manhã', 'Tarde'], series: ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'] }
            ]);
          }
        } else {
          // Modo Demonstração (Sem Usuário Logado)
          setUserName('José Martins');
          setUserCpf('12345678900');
          setFilhos(FILHOS_MOCK);
          setUsandoMock(true);
          setEscolas([
            { id: 'b73e2840-7288-4682-9642-17cb25e36001', nome: 'Escola Municipal Dorcelina Folador', turnos: ['Manhã', 'Tarde'], series: ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'] },
            { id: 'b73e2840-7288-4682-9642-17cb25e36002', nome: 'Colégio Estadual Julia Wanderley', turnos: ['Manhã', 'Tarde', 'Noite'], series: ['6º Ano', '7º Ano', '8º Ano', '9º Ano', '1º Grau', '2º Grau', '3º Grau'] },
            { id: 'b73e2840-7288-4682-9642-17cb25e36003', nome: 'Escola Municipal Codorna', turnos: ['Manhã', 'Tarde'], series: ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'] }
          ]);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do responsável:', err);
        setUserName('Responsável');
        setUserCpf('');
        setFilhos([]);
        setUsandoMock(false);
        setEscolas([
          { id: 'b73e2840-7288-4682-9642-17cb25e36001', nome: 'Escola Municipal Dorcelina Folador', turnos: ['Manhã', 'Tarde'], series: ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'] },
          { id: 'b73e2840-7288-4682-9642-17cb25e36002', nome: 'Colégio Estadual Julia Wanderley', turnos: ['Manhã', 'Tarde', 'Noite'], series: ['6º Ano', '7º Ano', '8º Ano', '9º Ano', '1º Grau', '2º Grau', '3º Grau'] },
          { id: 'b73e2840-7288-4682-9642-17cb25e36003', nome: 'Escola Municipal Codorna', turnos: ['Manhã', 'Tarde'], series: ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'] }
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadUserAndFilhos();
  }, [supabase]);

  // Escuta atualizações de rota ativa em tempo real para refletir nos cards dos filhos
  useEffect(() => {
    const channel = supabase
      .channel('realtime-rotas-responsavel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rotas',
        },
        (payload) => {
          const updatedRoute = payload.new as { id: string, ativa: boolean };
          if (updatedRoute) {
            setFilhos(prev => 
              prev.map(filho => {
                if (filho.rotaUuid === updatedRoute.id) {
                  return { ...filho, rotaAtiva: updatedRoute.ativa };
                }
                return filho;
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);



  // Função para atualizar o status do aluno localmente após upload bem-sucedido
  const handleUpdateStatusLocal = (alunoId: string, newStatus: Filho['statusCarteirinha']) => {
    setFilhos(prev => prev.map(filho => filho.id === alunoId ? { ...filho, statusCarteirinha: newStatus } : filho));
  };

  // Função para fazer upload da foto do aluno
  const handleUploadPhoto = async (alunoId: string, file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('A imagem deve ter no máximo 5MB.', 'error');
      return;
    }

    setUploadingPhotoId(alunoId);

    try {
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `fotos-alunos/${alunoId}_${Date.now()}.${ext}`;

      if (usandoMock) {
        setTimeout(() => {
          const fakeUrl = `https://picsum.photos/300/400?random=${alunoId}`;
          setFilhos(prev => prev.map(f => f.id === alunoId ? { ...f, fotoUrl: fakeUrl } : f));
          setUploadingPhotoId(null);
          showToast('Foto do aluno atualizada (modo demonstração)!', 'success');
        }, 1500);
        return;
      }

      // Upload para Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('documentos-transporte')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (storageError) throw storageError;

      // Pegar URL Pública
      const publicUrl = supabase.storage
        .from('documentos-transporte')
        .getPublicUrl(fileName).data.publicUrl;

      // Atualizar coluna foto_url na tabela alunos
      const { data: updateData, error: dbError } = await supabase
        .from('alunos')
        .update({ foto_url: publicUrl })
        .eq('id', alunoId)
        .select();

      if (dbError) throw dbError;

      if (!updateData || updateData.length === 0) {
        throw new Error('Erro ao salvar no banco de dados. O registro do aluno não pôde ser atualizado (RLS/Permissão).');
      }

      // Atualizar estado local
      setFilhos(prev => prev.map(f => f.id === alunoId ? { ...f, fotoUrl: publicUrl } : f));
      showToast('Foto do aluno atualizada com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao fazer upload da foto:', err);
      showToast(err.message || 'Erro ao enviar a foto do aluno.', 'error');
    } finally {
      setUploadingPhotoId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-semibold">Carregando seu painel...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 relative">

      {/* ── TOAST PREMIUM VISUAL ────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn border backdrop-blur-md max-w-sm w-[90%] text-white font-bold text-xs ${
          toast.type === 'success' 
            ? 'bg-emerald-600/95 border-emerald-500/20' 
            : 'bg-rose-600/95 border-rose-500/20'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="leading-tight flex-1">{toast.text}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors">
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Bloco de Boas-Vindas ────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 text-slate-800/20 pointer-events-none">
          <User size={120} />
        </div>
        <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest">
          Painel de Controle Familiar
        </span>
        <h2 className="text-xl font-black mt-1">
          Olá, {userName || 'Responsável'}!
        </h2>
        {userCpf && (
          <p className="text-xs text-amber-500 font-bold font-mono mt-0.5">
            CPF: {formatarCpfVisual(userCpf)}
          </p>
        )}
        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
          Acompanhe o transporte escolar de seus filhos e faça o envio de novos documentos.
        </p>
        {usandoMock && (
          <span className="mt-3 inline-block text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Modo Demonstração
          </span>
        )}
      </div>

      {/* ── Cards dos Filhos ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        
        {/* Cabeçalho com Título + Botão de Solicitação */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Estudantes Vinculados ({filhos.length})
          </h3>
          <button
            onClick={() => setActiveModalCadastro(true)}
            className="flex items-center gap-1.5 py-2 px-3 rounded-full text-[10px] font-black bg-slate-900 text-white hover:bg-slate-800 border border-slate-800 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-sm uppercase tracking-wider"
          >
            <Plus size={12} className="text-amber-500" />
            <span>Solicitar Transporte Escolar</span>
          </button>
        </div>

        {filhos.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <User size={28} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Nenhum estudante vinculado</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[280px]">
                Você ainda não possui estudantes cadastrados. Clique no botão 'Solicitar Transporte Escolar' acima para iniciar a auditoria de documentos.
              </p>
            </div>
            <button
              onClick={() => setActiveModalCadastro(true)}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow"
            >
              <Plus size={14} className="text-amber-500" />
              <span>Solicitar Transporte Escolar</span>
            </button>
          </div>
        ) : (
          filhos.map((filho) => {
            const isExpired = filho.statusCarteirinha === 'Aprovado' && filho.dataVencimento && new Date(filho.dataVencimento) < getSimulatedDate();
            const cardBgClass = isExpired
              ? "bg-rose-50/40 border-rose-300 shadow-rose-50/50 hover:shadow-rose-100/60"
              : "bg-white border-slate-200/80 hover:shadow-md";

            return (
              <div
                key={filho.id}
                className={`${cardBgClass} border rounded-2xl p-4 flex flex-col gap-4 shadow-sm transition-all duration-200`}
              >
              {/* Foto + Detalhes + Status */}
              <div className="flex gap-3">
                <div 
                  onClick={() => document.getElementById(`upload-photo-${filho.id}`)?.click()}
                  className="w-16 h-20 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer relative group transition-all duration-200 hover:border-amber-500 hover:scale-[1.03]"
                  title="Clique para alterar a foto do aluno"
                >
                  {filho.fotoUrl ? (
                    <img src={filho.fotoUrl} alt={filho.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2 flex flex-col items-center gap-1">
                      <User size={24} className="text-slate-400" />
                      <span className="text-[8px] text-slate-500 font-bold uppercase leading-none">Sem Foto</span>
                    </div>
                  )}

                  {/* Overlay interativo de Hover */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-1 select-none">
                    <Camera size={14} className="text-amber-400" />
                    <span className="text-[7.5px] font-black uppercase tracking-wider text-amber-400">Alterar</span>
                  </div>

                  {/* Loading Spinner overlay */}
                  {uploadingPhotoId === filho.id && (
                    <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center z-10">
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Input de arquivo oculto */}
                  <input
                    type="file"
                    id={`upload-photo-${filho.id}`}
                    accept="image/*"
                    className="hidden"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUploadPhoto(filho.id, file);
                      }
                    }}
                  />
                </div>

                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    {isExpired ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border bg-rose-100 border-rose-300 text-rose-700 shadow-sm animate-pulse">
                        <AlertCircle size={13} />
                        <span>Carteirinha Expirada</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${getStatusBadgeClass(filho.statusCarteirinha)}`}>
                        {getStatusIcon(filho.statusCarteirinha)}
                        <span>{filho.statusCarteirinha === 'Aprovado' ? 'Aprovado' : 'Em Análise pela Secretaria'}</span>
                      </span>
                    )}
                    <button
                      onClick={() => setSelectedFilhoEdicao(filho)}
                      className="p-1.5 hover:bg-slate-150 rounded-lg text-slate-500 hover:text-slate-900 transition-colors border border-slate-100 shrink-0"
                      title="Editar dados do aluno"
                    >
                      <Pencil size={13} />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate mt-1.5">{filho.nome}</h4>
                  <span className="text-xs text-slate-500 mt-0.5 truncate">{filho.escola}</span>
                  {filho.endereco && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 leading-snug">
                      <MapPin size={11} className="shrink-0 text-slate-400" />
                      <span className="truncate" title={filho.endereco}>{filho.endereco}</span>
                    </div>
                  )}
                  
                  {filho.status === 'pendente_correcao' && filho.observacao_secretaria && (
                    <div className="mt-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold flex flex-col gap-1.5 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-rose-900 font-black uppercase text-[9px] tracking-wider">
                        <ShieldAlert size={12} className="text-rose-600 animate-pulse" />
                        <span>Solicitação de Correção pela SEMED</span>
                      </div>
                      <p className="leading-relaxed font-medium">"{filho.observacao_secretaria}"</p>
                      <span className="text-[9.5px] text-rose-500 font-bold block mt-0.5">ℹ Substitua o arquivo sinalizado no botão "Documentos" abaixo e reenvie para análise.</span>
                    </div>
                  )}
                  
                  {filho.statusCarteirinha === 'Aprovado' ? (
                    <div className="mt-1.5 flex flex-col gap-1 text-[10px] text-emerald-800 bg-emerald-50/60 border border-emerald-100 p-2 rounded-xl font-medium shadow-sm">
                      <span className="flex items-center gap-1.5"><User size={11} className="text-emerald-600" /> Motorista: <strong className="font-bold text-slate-800">{filho.motorista_nome || 'Aguardando'}</strong></span>
                      <span className="flex items-center gap-1.5"><Bus size={11} className="text-emerald-600" /> Veículo: <strong className="font-bold text-slate-800">{filho.veiculo_numero || 'Aguardando'}</strong></span>
                      <div className="flex items-center gap-1.5 mt-1 pt-1.5 border-t border-emerald-100/50">
                        <span className={`w-2 h-2 rounded-full ${filho.rotaAtiva ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span className="font-bold uppercase tracking-wider text-[9px] text-slate-700">
                          {filho.rotaAtiva ? 'Motorista em Rota' : 'Motorista Fora de Rota'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {filho.serie} · {filho.rotaId || 'Sem Rota'}
                    </span>
                  )}
                </div>
              </div>

              {/* Histórico de Embarque ou Alerta de Expirado */}
              {isExpired && filho.notificadoExpiracao ? (
                <div className="p-4 rounded-2xl bg-rose-100 border-2 border-rose-300 text-rose-900 text-xs font-extrabold flex items-start gap-2.5 shadow-sm animate-fadeIn">
                  <ShieldAlert size={18} className="text-rose-600 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <span className="font-black uppercase text-[9px] tracking-wider text-rose-700 block mb-1">Aviso da Secretaria</span>
                    <p className="leading-relaxed">A carteirinha do seu filho expirou, faça o cadastro novamente.</p>
                  </div>
                </div>
              ) : (
                <HistoricoEmbarque alunoId={filho.id} usandoMock={usandoMock} />
              )}

              {/* Ocorrências Disciplinares do Aluno */}
              <OcorrenciasFilho alunoId={filho.id} usandoMock={usandoMock} />

              {/* Ações Rápidas ou Botão Único de Re-cadastro (Carteirinha Expirada) */}
              {isExpired ? (
                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedFilhoRecadastro(filho)}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm uppercase tracking-wider w-full"
                  >
                    <RotateCcw size={14} />
                    <span>Realizar Re-cadastro</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  {/* Documentos */}
                  <button
                    onClick={() => setSelectedFilhoDoc(filho)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200/40"
                  >
                    <UploadCloud size={14} />
                    <span>Documentos</span>
                  </button>

                  {/* Rastreio */}
                  <button
                    onClick={() => setSelectedFilhoRastreio(filho)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
                  >
                    <MapPin size={14} />
                    <span>Ver Rastreio</span>
                  </button>

                  {/* Carteirinha Digital — ativo apenas se Aprovado */}
                  {filho.statusCarteirinha === 'Aprovado' ? (
                    <button
                      onClick={() => setSelectedFilhoCart(filho)}
                      className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                      <FileText size={14} className="text-amber-500" />
                      <span>Visualizar Carteirinha Digital</span>
                    </button>
                  ) : (
                    <div className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 border border-dashed border-slate-200 cursor-not-allowed select-none">
                      <FileText size={14} className="opacity-50" />
                      <span>
                        Carteirinha {filho.statusCarteirinha === 'Em análise'
                          ? 'em análise pela SEMED…'
                          : '— aguardando envio de documentos'}
                      </span>
                    </div>
                  )}
                </div>
              )}
              </div>
            );
          })
        )}
      </div>

      {/* Cartão Informativo SEMED */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed flex gap-3">
        <Shield size={18} className="shrink-0 text-amber-600 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-900 mb-0.5">Importante para a liberação:</h4>
          Anexe a declaração escolar atualizada e o comprovante de residência de Arapongas.
          A validação cadastral é feita pela central da SEMED em até 48 horas úteis.
        </div>
      </div>

      {/* ── MODAL 1: UPLOAD DE DOCUMENTOS ────────────────────────────────────── */}
      {selectedFilhoDoc && (
        <DocumentosModal
          aluno={selectedFilhoDoc}
          onClose={() => setSelectedFilhoDoc(null)}
          onSuccess={(newStatus) => {
            handleUpdateStatusLocal(selectedFilhoDoc.id, newStatus);
            setSelectedFilhoDoc(null);
          }}
        />
      )}

      {/* ── MODAL 2: CARTEIRINHA DIGITAL ─────────────────────────────────────── */}
      {selectedFilhoCart && (
        <CarteirinhaModal
          aluno={selectedFilhoCart}
          onClose={() => setSelectedFilhoCart(null)}
        />
      )}

      {/* ── MODAL 3: RASTREIO GPS ────────────────────────────────────────────── */}
      {selectedFilhoRastreio && (
        <RastreioModal
          aluno={selectedFilhoRastreio}
          onClose={() => setSelectedFilhoRastreio(null)}
        />
      )}

      {/* ── MODAL 4: CADASTRO E VÍNCULO DE FILHO ─────────────────────────────── */}
      {activeModalCadastro && (
        <CadastroFilhoModal
          escolas={escolas}
          onClose={() => setActiveModalCadastro(false)}
          onSuccess={(novoFilho) => {
            setFilhos(prev => {
              const semFicticios = usandoMock ? [] : prev;
              return [...semFicticios, novoFilho];
            });
            setUsandoMock(false);
            setActiveModalCadastro(false);
            showToast('Cadastro realizado! Aguardando validação da SEMED.', 'success');
          }}
          onError={(errText) => {
            showToast(errText, 'error');
          }}
        />
      )}

      {/* ── MODAL 5: EDIÇÃO DE FILHO ────────────────────────────────────────── */}
      {selectedFilhoEdicao && (
        <EditarFilhoModal
          aluno={selectedFilhoEdicao}
          escolas={escolas}
          onClose={() => setSelectedFilhoEdicao(null)}
          onSuccess={(filhoAtualizado) => {
            setFilhos(prev => prev.map(f => f.id === filhoAtualizado.id ? filhoAtualizado : f));
            setSelectedFilhoEdicao(null);
            showToast('Alterações salvas! O cadastro passará por uma nova análise da SEMED.', 'success');
          }}
          onError={(errText) => {
            showToast(errText, 'error');
          }}
        />
      )}

      {/* ── MODAL 6: RE-CADASTRO DE FILHO ─────────────────────────────────────── */}
      {selectedFilhoRecadastro && (
        <RecadastroModal
          aluno={selectedFilhoRecadastro}
          escolas={escolas}
          onClose={() => setSelectedFilhoRecadastro(null)}
          onSuccess={(filhoAtualizado) => {
            setFilhos(prev => prev.map(f => f.id === filhoAtualizado.id ? filhoAtualizado : f));
            setSelectedFilhoRecadastro(null);
            showToast('Re-cadastro enviado! O estudante passará por uma nova análise da SEMED.', 'success');
          }}
          onError={(errText) => {
            showToast(errText, 'error');
          }}
        />
      )}



    </div>
  );
}

// ─── SUB-COMPONENTE: MODAL DE INSCRIÇÃO (AUDITORIA DOCUMENTAL) ───────────────
interface CadastroFilhoModalProps {
  escolas: any[];
  onClose: () => void;
  onSuccess: (novoFilho: Filho) => void;
  onError: (text: string) => void;
}

function CadastroFilhoModal({ escolas, onClose, onSuccess, onError }: CadastroFilhoModalProps) {
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Campos - Etapa 1
  const [nomeAluno, setNomeAluno] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [escolaIdAluno, setEscolaIdAluno] = useState(escolas[0]?.id || '');
  const [escolaAluno, setEscolaAluno] = useState(escolas[0]?.nome || '');
  const [anoSerie, setAnoSerie] = useState('');
  const [turma, setTurma] = useState('');
  const [periodo, setPeriodo] = useState<'manha' | 'tarde' | 'noite'>('manha');
  const [endereco, setEndereco] = useState('');

  const selectedSchool = escolas.find(esc => esc.id === escolaIdAluno);
  const schoolSeries = selectedSchool?.series || ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'];

  useEffect(() => {
    if (escolas.length > 0 && !escolaIdAluno) {
      setEscolaIdAluno(escolas[0].id);
      setEscolaAluno(escolas[0].nome);
    }
  }, [escolas]);

  useEffect(() => {
    const activeSchool = escolas.find(esc => esc.id === escolaIdAluno);
    const activeSeries = activeSchool?.series || [];
    if (activeSeries.length > 0 && (!anoSerie || !activeSeries.includes(anoSerie))) {
      setAnoSerie(activeSeries[0]);
    }
  }, [escolaIdAluno, escolas]);

  // Campos - Etapa 2 (Arquivos)
  const [fileComprovante, setFileComprovante] = useState<File | null>(null);
  const [fileDocAluno, setFileDocAluno] = useState<File | null>(null);
  const [fileDocResponsavel, setFileDocResponsavel] = useState<File | null>(null);
  const [fileMatricula, setFileMatricula] = useState<File | null>(null);

  const handleSalvarFilho = async () => {
    if (!nomeAluno.trim() || !endereco.trim() || !anoSerie.trim() || !turma.trim() || !dataNascimento) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let alunoSalvoId = `aluno-new-${Date.now()}`;

      if (user) {
        // Insere aluno com status Em análise e rota indefinida (será definida pela SEMED)
        const insertCompleto = {
          nome: nomeAluno,
          data_nascimento: dataNascimento,
          escola: escolaAluno,
          escola_id: escolaIdAluno,
          ano_serie: anoSerie,
          turma: turma,
          periodo: periodo,
          status: 'aguardando',
          responsavel_id: user.id,
          endereco: endereco
        };

        const { data: insertData, error: insertError } = await supabase
          .from('alunos')
          .insert(insertCompleto)
          .select('id')
          .maybeSingle();

        if (insertError) {
          console.error('Erro na primeira tentativa de insert de aluno:', insertError);
          // Retry de resiliência caso schema difira
          const { data: retryData, error: retryError } = await supabase
            .from('alunos')
            .insert({
              nome: nomeAluno,
              escola: escolaAluno,
              escola_id: escolaIdAluno,
              ano_serie: anoSerie,
              turma: turma,
              periodo: periodo,
              status: 'aguardando',
              responsavel_id: user.id
            })
            .select('id')
            .maybeSingle();

          if (retryError) {
            console.error('Erro no retry de insert de aluno:', retryError);
            throw new Error(`Falha ao salvar o estudante no banco de dados: ${retryError.message}`);
          }
          if (retryData?.id) alunoSalvoId = retryData.id;
        } else if (insertData?.id) {
          alunoSalvoId = insertData.id;
        }

        // Tenta fazer upload dos 4 arquivos para o novo bucket documentos-transporte
        const arquivosUpload = [
          { file: fileComprovante, tipo: 'Comprovante_Residencia' },
          { file: fileDocAluno, tipo: 'Documento_Aluno' },
          { file: fileDocResponsavel, tipo: 'Documento_Responsavel' },
          { file: fileMatricula, tipo: 'Declaracao_Matricula' }
        ];

        for (const item of arquivosUpload) {
          if (item.file) {
            try {
              const ext = item.file.name.split('.').pop() || 'jpg';
              const fileName = `${alunoSalvoId}_${item.tipo}_${Date.now()}.${ext}`;
              
              const { error: storageError } = await supabase.storage
                .from('documentos-transporte')
                .upload(`documentos/${fileName}`, item.file, { upsert: true });
                
              if (storageError) {
                console.error(`Erro no storage ao subir arquivo ${item.tipo}:`, storageError.message);
              }

              if (!storageError) {
                const publicUrl = supabase.storage
                  .from('documentos-transporte')
                  .getPublicUrl(`documentos/${fileName}`).data.publicUrl;
                  
                const { error: docInsertError } = await supabase.from('documentos_aluno').insert({
                  aluno_id: alunoSalvoId,
                  tipo_documento: item.tipo,
                  url_arquivo: publicUrl,
                  url_documento: publicUrl
                });

                if (docInsertError) {
                  console.error(`Erro ao salvar referência do documento ${item.tipo}:`, docInsertError.message);
                }
              }
            } catch (err) {
              console.warn(`Falha no upload do documento ${item.tipo}`, err);
            }
          }
        }
        
        // Conclui retornando o objeto reativo real
        const novoFilho: Filho = {
          id: alunoSalvoId,
          nome: nomeAluno,
          escola: escolaAluno,
          serie: `${anoSerie} - ${turma}`,
          statusCarteirinha: 'Pendente',
          status: 'aguardando',
          periodo: periodo,
          rotaId: 'Aguardando Atribuição',
          fotoUrl: undefined,
          motorista_nome: 'Aguardando Atribuição',
          veiculo_numero: 'Aguardando Atribuição',
          endereco: endereco
        };

        onSuccess(novoFilho);
      } else {
        // Modo Demonstração (Sem Usuário Logado)
        console.log('Realizando cadastro em modo demonstração local');
        const novoFilho: Filho = {
          id: `aluno-new-${Date.now()}`,
          nome: nomeAluno,
          escola: escolaAluno,
          serie: `${anoSerie} - ${turma}`,
          statusCarteirinha: 'Pendente',
          status: 'aguardando',
          periodo: periodo,
          rotaId: 'Aguardando Atribuição',
          fotoUrl: undefined,
          motorista_nome: 'Aguardando Atribuição',
          veiculo_numero: 'Aguardando Atribuição',
          endereco: endereco
        };
        onSuccess(novoFilho);
      }
    } catch (err: any) {
      console.error('Erro detectado no fluxo do cadastro:', err);
      onError(err.message || 'Erro ao realizar cadastro do aluno no Supabase. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-fadeIn max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div>
            <h3 className="font-black text-slate-900 text-sm">Solicitar Transporte Escolar</h3>
            <span className="text-[9px] text-slate-500 font-bold block mt-0.5 uppercase tracking-wide">
              {step === 1 ? 'Etapa 1: Dados do Aluno' : 'Etapa 2: Auditoria Documental'}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={16} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          
          {step === 1 ? (
            /* ETAPA 1: Dados do Aluno */
            <div className="flex flex-col gap-3">
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nomeAluno}
                  onChange={(e) => setNomeAluno(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 transition-all uppercase"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Endereço Residencial do Aluno
                </label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ex: Av. Paraná, 123 - Centro, Arapongas - PR"
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Instituição de Ensino
                </label>
                <select
                  value={escolaIdAluno}
                  onChange={(e) => {
                    const selId = e.target.value;
                    setEscolaIdAluno(selId);
                    const selNome = escolas.find(esc => esc.id === selId)?.nome || '';
                    setEscolaAluno(selNome);
                  }}
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                >
                  <option value="" disabled>-- Selecione uma Escola --</option>
                  {escolas.map((esc) => (
                    <option key={esc.id} value={esc.id}>{esc.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Ano / Série
                  </label>
                  <select
                    value={anoSerie}
                    onChange={(e) => setAnoSerie(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                  >
                    <option value="" disabled>-- Série --</option>
                    {schoolSeries.map((s: string) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Turma
                  </label>
                  <input
                    type="text"
                    value={turma}
                    onChange={(e) => setTurma(e.target.value.toUpperCase())}
                    placeholder="Ex: B"
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Turno
                </label>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value as 'Hoje' | 'Últimos 7 dias' | 'Este Mês')}
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                >
                  <option value="manha">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="noite">Noite</option>
                </select>
              </div>

              <button
                disabled={!nomeAluno.trim() || !endereco.trim() || !anoSerie.trim() || !turma.trim() || !dataNascimento}
                onClick={() => setStep(2)}
                className={`w-full py-3.5 mt-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
                  nomeAluno.trim() && endereco.trim() && anoSerie.trim() && turma.trim() && dataNascimento
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-450 border cursor-not-allowed'
                }`}
              >
                <span>Avançar para Documentos</span>
              </button>
            </div>
          ) : (
            /* ETAPA 2: Upload de Documentos */
            <div className="flex flex-col gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10px] text-amber-800 font-medium">
                <Shield size={14} className="inline mr-1 text-amber-600 mb-0.5" />
                Os documentos são obrigatórios para a aprovação da carteirinha pela SEMED. Você pode usar a câmera do celular.
              </div>

              <div className="flex flex-col gap-3">
                {/* Comprovante */}
                <div className="border border-slate-200 rounded-xl p-3 relative hover:border-amber-500 transition-colors">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Comprovante de Residência
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setFileComprovante(e.target.files?.[0] || null)}
                      className="text-[10px] w-full text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Doc Aluno */}
                <div className="border border-slate-200 rounded-xl p-3 relative hover:border-amber-500 transition-colors">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Documento do Aluno (RG/Certidão)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setFileDocAluno(e.target.files?.[0] || null)}
                      className="text-[10px] w-full text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Doc Responsavel */}
                <div className="border border-slate-200 rounded-xl p-3 relative hover:border-amber-500 transition-colors">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Documento do Responsável (RG/CPF)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setFileDocResponsavel(e.target.files?.[0] || null)}
                      className="text-[10px] w-full text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Comprovante de Matricula */}
                <div className="border border-slate-200 rounded-xl p-3 relative hover:border-amber-500 transition-colors">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Declaração de Matrícula
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setFileMatricula(e.target.files?.[0] || null)}
                      className="text-[10px] w-full text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-2 sticky bottom-0 bg-white py-2">
                <button
                  disabled={loading}
                  onClick={() => setStep(1)}
                  className="py-3 px-4 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Voltar
                </button>

                <button
                  disabled={loading || !fileComprovante || !fileDocAluno || !fileDocResponsavel || !fileMatricula}
                  onClick={handleSalvarFilho}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
                    (fileComprovante && fileDocAluno && fileDocResponsavel && fileMatricula && !loading)
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-slate-100 text-slate-400 border cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Enviar para Análise</span>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTE: MODAL DE EDIÇÃO DE FILHO ────────────────────────────────
interface EditarFilhoModalProps {
  aluno: Filho;
  escolas: any[];
  onClose: () => void;
  onSuccess: (filhoAtualizado: Filho) => void;
  onError: (text: string) => void;
}

function EditarFilhoModal({ aluno, escolas, onClose, onSuccess, onError }: EditarFilhoModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // Inicializa os campos com os valores atuais do aluno
  const [nomeAluno, setNomeAluno] = useState(aluno.nome || '');
  const [dataNascimento, setDataNascimento] = useState(aluno.data_nascimento || '');
  const [escolaIdAluno, setEscolaIdAluno] = useState(aluno.escola_id || escolas[0]?.id || '');
  const [escolaAluno, setEscolaAluno] = useState(aluno.escola || escolas[0]?.nome || '');
  const [anoSerie, setAnoSerie] = useState(aluno.ano_serie || '');
  const [turma, setTurma] = useState(aluno.turma || '');
  const [periodo, setPeriodo] = useState<'manha' | 'tarde' | 'noite'>(aluno.periodo || 'manha');
  const [endereco, setEndereco] = useState(aluno.endereco || '');

  const selectedSchool = escolas.find(esc => esc.id === escolaIdAluno);
  const schoolSeries = selectedSchool?.series || ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'];

  useEffect(() => {
    const activeSchool = escolas.find(esc => esc.id === escolaIdAluno);
    const activeSeries = activeSchool?.series || [];
    if (activeSeries.length > 0 && (!anoSerie || !activeSeries.includes(anoSerie))) {
      setAnoSerie(activeSeries[0]);
    }
  }, [escolaIdAluno, escolas]);

  const handleSalvarEdicao = async () => {
    if (!nomeAluno.trim() || !endereco.trim() || !anoSerie.trim() || !turma.trim() || !dataNascimento) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Ao atualizar, o status volta a ficar pendente de aprovação pela SEMED
        let updateCompleto: any = {
          nome: nomeAluno.trim(),
          data_nascimento: dataNascimento,
          escola: schoolAlunoSelectName(escolaIdAluno),
          escola_id: escolaIdAluno,
          ano_serie: anoSerie,
          turma: turma.trim().toUpperCase(),
          serie: `${anoSerie} - ${turma.trim().toUpperCase()}`,
          periodo: periodo,
          turno: periodo === 'manha' ? 'Manhã' : periodo === 'tarde' ? 'Tarde' : 'Noite',
          status: 'aguardando',
          status_carteirinha: 'Pendente',
          endereco: endereco.trim()
        };

        let { error: updateError } = await supabase
          .from('alunos')
          .update(updateCompleto)
          .eq('id', aluno.id);

        if (updateError && (updateError.message?.includes('endereco') || updateError.code === 'PGRST100' || updateError.message?.includes('column'))) {
          console.warn('Erro ao atualizar aluno com endereco (coluna ausente). Tentando sem endereco.');
          delete updateCompleto.endereco;
          const retry = await supabase
            .from('alunos')
            .update(updateCompleto)
            .eq('id', aluno.id);
          updateError = retry.error;
        }

        if (updateError) {
          throw new Error(updateError.message);
        }
      }

      const filhoAtualizado: Filho = {
        ...aluno,
        nome: nomeAluno.trim(),
        data_nascimento: dataNascimento,
        escola: schoolAlunoSelectName(escolaIdAluno),
        escola_id: escolaIdAluno,
        ano_serie: anoSerie,
        turma: turma.trim().toUpperCase(),
        serie: `${anoSerie} - ${turma.trim().toUpperCase()}`,
        periodo: periodo,
        status: 'aguardando',
        statusCarteirinha: 'Pendente',
        endereco: endereco.trim(),
        motorista_nome: 'Aguardando Atribuição',
        veiculo_numero: 'Aguardando Atribuição',
        rotaId: 'Aguardando Atribuição'
      };

      onSuccess(filhoAtualizado);
    } catch (err: any) {
      console.error('Erro detectado ao editar aluno:', err);
      onError(err.message || 'Erro ao atualizar dados do aluno no Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const schoolAlunoSelectName = (id: string) => {
    return escolas.find(esc => esc.id === id)?.nome || escolaAluno;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-fadeIn max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div>
            <h3 className="font-black text-slate-900 text-sm">Editar Cadastro do Estudante</h3>
            <span className="text-[9px] text-rose-500 font-bold block mt-0.5 uppercase tracking-wide">
              ⚠️ A alteração exigirá nova aprovação da SEMED
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={16} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-3">
            
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                value={nomeAluno}
                onChange={(e) => setNomeAluno(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 transition-all uppercase"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                Endereço Residencial do Aluno
              </label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Ex: Av. Paraná, 123 - Centro, Arapongas - PR"
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                Instituição de Ensino
              </label>
              <select
                value={escolaIdAluno}
                onChange={(e) => {
                  const selId = e.target.value;
                  setEscolaIdAluno(selId);
                  const selNome = escolas.find(esc => esc.id === selId)?.nome || '';
                  setEscolaAluno(selNome);
                }}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
              >
                <option value="" disabled>-- Selecione uma Escola --</option>
                {escolas.map((esc) => (
                  <option key={esc.id} value={esc.id}>{esc.nome}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Ano / Série
                </label>
                <select
                  value={anoSerie}
                  onChange={(e) => setAnoSerie(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                >
                  <option value="" disabled>-- Série --</option>
                  {schoolSeries.map((s: string) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Turma
                </label>
                <input
                  type="text"
                  value={turma}
                  onChange={(e) => setTurma(e.target.value.toUpperCase())}
                  placeholder="Ex: B"
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                Turno
              </label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value as 'Hoje' | 'Últimos 7 dias' | 'Este Mês')}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
              >
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
            </div>

            <button
              disabled={loading || !nomeAluno.trim() || !endereco.trim() || !anoSerie.trim() || !turma.trim() || !dataNascimento}
              onClick={handleSalvarEdicao}
              className={`w-full py-3.5 mt-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
                nomeAluno.trim() && endereco.trim() && anoSerie.trim() && turma.trim() && dataNascimento && !loading
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-slate-100 text-slate-400 border cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Concluir Alterações</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTE: MODAL DE RE-CADASTRO DE FILHO (HÍBRIDO CADASTRO + DOCUMENTOS) ───
interface RecadastroModalProps {
  aluno: Filho;
  escolas: any[];
  onClose: () => void;
  onSuccess: (filhoAtualizado: Filho) => void;
  onError: (text: string) => void;
}

function RecadastroModal({ aluno, escolas, onClose, onSuccess, onError }: RecadastroModalProps) {
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Campos - Etapa 1 (Pré-preenchidos com os dados do aluno)
  const [nomeAluno, setNomeAluno] = useState(aluno.nome || '');
  const [dataNascimento, setDataNascimento] = useState(aluno.data_nascimento || '');
  const [escolaIdAluno, setEscolaIdAluno] = useState(aluno.escola_id || escolas[0]?.id || '');
  const [escolaAluno, setEscolaAluno] = useState(aluno.escola || escolas[0]?.nome || '');
  const [anoSerie, setAnoSerie] = useState(aluno.ano_serie || '');
  const [turma, setTurma] = useState(aluno.turma || '');
  const [periodo, setPeriodo] = useState<'manha' | 'tarde' | 'noite'>(aluno.periodo || 'manha');
  const [endereco, setEndereco] = useState(aluno.endereco || '');

  const selectedSchool = escolas.find(esc => esc.id === escolaIdAluno);
  const schoolSeries = selectedSchool?.series || ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'];

  // Campos - Etapa 2 (Arquivos novos selecionados)
  const [fileComprovante, setFileComprovante] = useState<File | null>(null);
  const [fileDocAluno, setFileDocAluno] = useState<File | null>(null);
  const [fileDocResponsavel, setFileDocResponsavel] = useState<File | null>(null);
  const [fileMatricula, setFileMatricula] = useState<File | null>(null);

  // Status de documentos já existentes no banco
  const [existingDocs, setExistingDocs] = useState<Record<DocType, { enviado: boolean; url: string | null }>>({
    Comprovante_Residencia: { enviado: false, url: null },
    Documento_Aluno: { enviado: false, url: null },
    Documento_Responsavel: { enviado: false, url: null },
    Declaracao_Matricula: { enviado: false, url: null }
  });

  useEffect(() => {
    const activeSchool = escolas.find(esc => esc.id === escolaIdAluno);
    const activeSeries = activeSchool?.series || [];
    if (activeSeries.length > 0 && (!anoSerie || !activeSeries.includes(anoSerie))) {
      setAnoSerie(activeSeries[0]);
    }
  }, [escolaIdAluno, escolas]);

  // Carrega documentos já existentes para que o pai não seja obrigado a reenviar todos se não quiser
  useEffect(() => {
    async function loadExistingDocs() {
      try {
        const { data, error } = await supabase
          .from('documentos_aluno')
          .select('tipo_documento, url_arquivo, url_documento')
          .eq('aluno_id', aluno.id);

        if (!error && data) {
          const updated = { ...existingDocs };
          data.forEach((doc: any) => {
            const t = doc.tipo_documento as DocType;
            if (updated[t]) {
              updated[t] = {
                enviado: true,
                url: doc.url_arquivo || doc.url_documento || null
              };
            }
          });
          setExistingDocs(updated);
        }
      } catch (err) {
        console.error('Erro ao buscar documentos existentes para recadastro:', err);
      } finally {
        setLoadingDocs(false);
      }
    }
    loadExistingDocs();
  }, [aluno.id, supabase]);

  const handleSalvarRecadastro = async () => {
    if (!nomeAluno.trim() || !endereco.trim() || !anoSerie.trim() || !turma.trim() || !dataNascimento) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 1. Atualiza dados do aluno e reseta o status para análise com resiliência de endereço
        const updateCompleto: any = {
          nome: nomeAluno.trim(),
          data_nascimento: dataNascimento,
          escola: schoolAlunoSelectName(escolaIdAluno),
          escola_id: escolaIdAluno,
          ano_serie: anoSerie,
          turma: turma.trim().toUpperCase(),
          serie: `${anoSerie} - ${turma.trim().toUpperCase()}`,
          periodo: periodo,
          turno: periodo === 'manha' ? 'Manhã' : periodo === 'tarde' ? 'Tarde' : 'Noite',
          status: 'aguardando',
          status_carteirinha: 'Pendente',
          rota_id: null, // Reseta a rota para re-alocação após aprovação
          observacao_secretaria: null, // Limpa observações antigas
          endereco: endereco.trim()
        };

        let { error: updateError } = await supabase
          .from('alunos')
          .update(updateCompleto)
          .eq('id', aluno.id);

        if (updateError && (updateError.message?.includes('endereco') || updateError.code === 'PGRST100' || updateError.message?.includes('column'))) {
          console.warn('Erro ao atualizar aluno com endereco (coluna ausente). Tentando sem endereco.');
          delete updateCompleto.endereco;
          const retry = await supabase
            .from('alunos')
            .update(updateCompleto)
            .eq('id', aluno.id);
          updateError = retry.error;
        }

        if (updateError) throw updateError;

        // 2. Reseta o status da carteirinha para "não expirada" e "não notificada"
        const { error: carteirinhaError } = await supabase
          .from('carteirinhas')
          .update({
            notificado_expiracao: false,
            data_vencimento: null // Deixa nulo ou define data futura. Ao aprovar, a secretaria definirá uma nova data.
          })
          .eq('aluno_id', aluno.id);

        if (carteirinhaError) {
          console.warn('Aviso: erro ao atualizar a tabela carteirinhas:', carteirinhaError.message);
        }

        // 3. Processa uploads de documentos novos (se selecionados)
        const novosArquivos = [
          { file: fileComprovante, tipo: 'Comprovante_Residencia' as DocType },
          { file: fileDocAluno, tipo: 'Documento_Aluno' as DocType },
          { file: fileDocResponsavel, tipo: 'Documento_Responsavel' as DocType },
          { file: fileMatricula, tipo: 'Declaracao_Matricula' as DocType }
        ];

        for (const item of novosArquivos) {
          if (item.file) {
            try {
              const ext = item.file.name.split('.').pop() || 'jpg';
              const fileName = `${aluno.id}_${item.tipo}_${Date.now()}.${ext}`;

              // Remove o registro de documento antigo
              await supabase
                .from('documentos_aluno')
                .delete()
                .eq('aluno_id', aluno.id)
                .eq('tipo_documento', item.tipo);

              // Upload do novo arquivo
              const { error: storageError } = await supabase.storage
                .from('documentos-transporte')
                .upload(`documentos/${fileName}`, item.file, { upsert: true });

              if (storageError) throw storageError;

              const publicUrl = supabase.storage
                .from('documentos-transporte')
                .getPublicUrl(`documentos/${fileName}`).data.publicUrl;

              // Insere a referência do novo documento
              const { error: docInsertError } = await supabase.from('documentos_aluno').insert({
                aluno_id: aluno.id,
                tipo_documento: item.tipo,
                url_arquivo: publicUrl,
                url_documento: publicUrl
              });

              if (docInsertError) throw docInsertError;
            } catch (err: any) {
              console.error(`Erro ao atualizar documento ${item.tipo}:`, err.message);
            }
          }
        }
      }

      // Constrói objeto de sucesso
      const filhoAtualizado: Filho = {
        ...aluno,
        nome: nomeAluno.trim(),
        data_nascimento: dataNascimento,
        escola: schoolAlunoSelectName(escolaIdAluno),
        escola_id: escolaIdAluno,
        ano_serie: anoSerie,
        turma: turma.trim().toUpperCase(),
        serie: `${anoSerie} - ${turma.trim().toUpperCase()}`,
        periodo: periodo,
        status: 'aguardando',
        statusCarteirinha: 'Pendente',
        endereco: endereco.trim(),
        motorista_nome: 'Aguardando Atribuição',
        veiculo_numero: 'Aguardando Atribuição',
        rotaId: 'Aguardando Atribuição',
        dataVencimento: null,
        notificadoExpiracao: false
      };

      onSuccess(filhoAtualizado);
    } catch (err: any) {
      console.error('Erro no fluxo de re-cadastro:', err);
      onError(err.message || 'Erro ao realizar re-cadastro del aluno.');
    } finally {
      setLoading(false);
    }
  };

  const schoolAlunoSelectName = (id: string) => {
    return escolas.find(esc => esc.id === id)?.nome || escolaAluno;
  };

  const getDocLabel = (tipo: DocType) => {
    if (tipo === 'Comprovante_Residencia')  return 'Comprovante de Residência';
    if (tipo === 'Documento_Aluno') return 'Documento do Aluno (RG/Certidão)';
    if (tipo === 'Documento_Responsavel') return 'Documento do Responsável (RG/CPF)';
    if (tipo === 'Declaracao_Matricula') return 'Declaração de Matrícula';
    return 'Documento';
  };

  // Um documento é considerado válido para envio se:
  // - Ou já existia anteriormente no banco
  // - Ou o pai selecionou um novo arquivo agora
  const isDocumentValid = (tipo: DocType) => {
    return existingDocs[tipo].enviado || !!(tipo === 'Comprovante_Residencia' ? fileComprovante :
                                           tipo === 'Documento_Aluno' ? fileDocAluno :
                                           tipo === 'Documento_Responsavel' ? fileDocResponsavel : fileMatricula);
  };

  const isAllDocsValid = isDocumentValid('Comprovante_Residencia') &&
                         isDocumentValid('Documento_Aluno') &&
                         isDocumentValid('Documento_Responsavel') &&
                         isDocumentValid('Declaracao_Matricula');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-fadeIn max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div>
            <h3 className="font-black text-slate-900 text-sm">Realizar Re-cadastro</h3>
            <span className="text-[9px] text-amber-600 font-bold block mt-0.5 uppercase tracking-wide">
              {step === 1 ? 'Etapa 1: Confirmar Dados' : 'Etapa 2: Atualizar Documentos'}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={16} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          
          {step === 1 ? (
            /* ETAPA 1: Confirmar Dados */
            <div className="flex flex-col gap-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10.5px] text-amber-850 font-medium leading-relaxed">
                ℹ️ <strong>Informações pré-preenchidas:</strong> Verifique se os dados escolares e endereço continuam corretos e altere o que for necessário antes de prosseguir.
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nomeAluno}
                  onChange={(e) => setNomeAluno(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 transition-all uppercase"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Endereço Residencial do Aluno
                </label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ex: Av. Paraná, 123 - Centro, Arapongas - PR"
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Instituição de Ensino
                </label>
                <select
                  value={escolaIdAluno}
                  onChange={(e) => {
                    const selId = e.target.value;
                    setEscolaIdAluno(selId);
                    const selNome = escolas.find(esc => esc.id === selId)?.nome || '';
                    setEscolaAluno(selNome);
                  }}
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                >
                  <option value="" disabled>-- Selecione uma Escola --</option>
                  {escolas.map((esc) => (
                    <option key={esc.id} value={esc.id}>{esc.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Ano / Série
                  </label>
                  <select
                    value={anoSerie}
                    onChange={(e) => setAnoSerie(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                  >
                    <option value="" disabled>-- Série --</option>
                    {schoolSeries.map((s: string) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Turma
                  </label>
                  <input
                    type="text"
                    value={turma}
                    onChange={(e) => setTurma(e.target.value.toUpperCase())}
                    placeholder="Ex: B"
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Turno
                </label>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value as 'Hoje' | 'Últimos 7 dias' | 'Este Mês')}
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                >
                  <option value="manha">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="noite">Noite</option>
                </select>
              </div>

              <button
                disabled={!nomeAluno.trim() || !endereco.trim() || !anoSerie.trim() || !turma.trim() || !dataNascimento}
                onClick={() => setStep(2)}
                className={`w-full py-3.5 mt-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
                  nomeAluno.trim() && endereco.trim() && anoSerie.trim() && turma.trim() && dataNascimento
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-450 border cursor-not-allowed'
                }`}
              >
                <span>Avançar para Documentos</span>
              </button>
            </div>
          ) : (
            /* ETAPA 2: Upload de Documentos */
            <div className="flex flex-col gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[10px] text-emerald-850 font-medium">
                📁 Os documentos enviados anteriormente estão preservados. Você pode selecionar e enviar novos arquivos para atualizar aqueles que expiraram ou precisam de correção.
              </div>

              {loadingDocs ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-slate-400 font-bold">Verificando documentos salvos...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Comprovante */}
                  <div className="border border-slate-200 rounded-xl p-3 hover:border-amber-500 transition-colors flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                        Comprovante de Residência
                      </label>
                      {existingDocs.Comprovante_Residencia.enviado && !fileComprovante && (
                        <span className="text-[8px] bg-emerald-150 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase">Cadastrado</span>
                      )}
                      {fileComprovante && (
                        <span className="text-[8px] bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold uppercase">Substituído</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setFileComprovante(e.target.files?.[0] || null)}
                      className="text-[10px] w-full text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                    />
                  </div>

                  {/* Doc Aluno */}
                  <div className="border border-slate-200 rounded-xl p-3 hover:border-amber-500 transition-colors flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                        Documento do Aluno (RG/Certidão)
                      </label>
                      {existingDocs.Documento_Aluno.enviado && !fileDocAluno && (
                        <span className="text-[8px] bg-emerald-150 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase">Cadastrado</span>
                      )}
                      {fileDocAluno && (
                        <span className="text-[8px] bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold uppercase">Substituído</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setFileDocAluno(e.target.files?.[0] || null)}
                      className="text-[10px] w-full text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                    />
                  </div>

                  {/* Doc Responsavel */}
                  <div className="border border-slate-200 rounded-xl p-3 hover:border-amber-500 transition-colors flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                        Documento do Responsável (RG/CPF)
                      </label>
                      {existingDocs.Documento_Responsavel.enviado && !fileDocResponsavel && (
                        <span className="text-[8px] bg-emerald-150 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase">Cadastrado</span>
                      )}
                      {fileDocResponsavel && (
                        <span className="text-[8px] bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold uppercase">Substituído</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setFileDocResponsavel(e.target.files?.[0] || null)}
                      className="text-[10px] w-full text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                    />
                  </div>

                  {/* Comprovante de Matricula */}
                  <div className="border border-slate-200 rounded-xl p-3 hover:border-amber-500 transition-colors flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                        Declaração de Matrícula
                      </label>
                      {existingDocs.Declaracao_Matricula.enviado && !fileMatricula && (
                        <span className="text-[8px] bg-emerald-150 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase">Cadastrado</span>
                      )}
                      {fileMatricula && (
                        <span className="text-[8px] bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold uppercase">Substituído</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setFileMatricula(e.target.files?.[0] || null)}
                      className="text-[10px] w-full text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-2 sticky bottom-0 bg-white py-2">
                <button
                  disabled={loading}
                  onClick={() => setStep(1)}
                  className="py-3 px-4 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Voltar
                </button>

                <button
                  disabled={loading || loadingDocs || !isAllDocsValid}
                  onClick={handleSalvarRecadastro}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
                    (isAllDocsValid && !loading && !loadingDocs)
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-slate-100 text-slate-400 border cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Enviar Re-cadastro</span>
                  )}
                </button>
              </div>
              {!isAllDocsValid && !loadingDocs && (
                <p className="text-[8.5px] text-center text-rose-500 font-bold leading-tight">
                  Aviso: Garanta que todos os 4 tipos de documentos estejam cadastrados ou anexados para concluir.
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTE: MODAL DE DOCUMENTOS ──────────────────────────────────────
interface DocumentosModalProps {
  aluno: Filho;
  onClose: () => void;
  onSuccess: (newStatus: Filho['statusCarteirinha']) => void;
}

type DocType = 'Comprovante_Residencia' | 'Documento_Aluno' | 'Documento_Responsavel' | 'Declaracao_Matricula';

interface DocStatus {
  enviado: boolean;
  nomeArquivo: string | null;
  url: string | null;
  loading: boolean;
}

function DocumentosModal({ aluno, onClose, onSuccess }: DocumentosModalProps) {
  const supabase = createClient();
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const [docs, setDocs] = useState<Record<DocType, DocStatus>>({
    Comprovante_Residencia: { enviado: false, nomeArquivo: null, url: null, loading: false },
    Documento_Aluno: { enviado: false, nomeArquivo: null, url: null, loading: false },
    Documento_Responsavel: { enviado: false, nomeArquivo: null, url: null, loading: false },
    Declaracao_Matricula: { enviado: false, nomeArquivo: null, url: null, loading: false },
  });

  useEffect(() => {
    async function fetchDocs() {
      try {
        const { data, error } = await supabase
          .from('documentos_aluno')
          .select('tipo_documento, url_arquivo, url_documento')
          .eq('aluno_id', aluno.id);

        if (!error && data && data.length > 0) {
          const updated = { ...docs };
          data.forEach((doc: any) => {
            const t = doc.tipo_documento as DocType;
            if (updated[t]) {
              updated[t] = {
                enviado: true,
                nomeArquivo: `doc_cadastrado_${t}.pdf`,
                url: doc.url_arquivo || doc.url_documento || null,
                loading: false
              };
            }
          });
          setDocs(updated);
        }
      } catch {
        // Fallback silencioso
      }
    }
    fetchDocs();
  }, [aluno.id, supabase]);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, tipo: DocType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocs(prev => ({ ...prev, [tipo]: { ...prev[tipo], loading: true } }));
    setMsg(null);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${aluno.id}_${tipo}_${Date.now()}.${ext}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('documentos-transporte')
        .upload(`documentos/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (storageError) throw storageError;

      const publicUrl = supabase.storage
        .from('documentos-transporte')
        .getPublicUrl(`documentos/${fileName}`).data.publicUrl;

      // Deleta anterior para evitar duplicidades
      await supabase
        .from('documentos_aluno')
        .delete()
        .eq('aluno_id', aluno.id)
        .eq('tipo_documento', tipo);

      const { error: dbError } = await supabase
        .from('documentos_aluno')
        .insert({
          aluno_id: aluno.id,
          tipo_documento: tipo,
          url_arquivo: publicUrl,
          url_documento: publicUrl, // legado
        });

      if (dbError) throw dbError;

      setDocs(prev => ({
        ...prev,
        [tipo]: { enviado: true, nomeArquivo: file.name, url: publicUrl, loading: false }
      }));
      setMsg({ type: 'success', text: `Documento "${getDocLabel(tipo)}" enviado com sucesso!` });
    } catch (err: any) {
      console.log('Utilizando simulação de upload por restrições locais de Storage:', err.message);
      // Fallback amigável de simulação
      setTimeout(() => {
        setDocs(prev => ({
          ...prev,
          [tipo]: { enviado: true, nomeArquivo: file.name, url: `https://picsum.photos/400/300?random=${tipo}`, loading: false }
        }));
        setMsg({ type: 'success', text: `[MOCK] "${getDocLabel(tipo)}" enviado no modo demonstração!` });
      }, 1000);
    }
  };

  const removeDoc = (tipo: DocType) => {
    setDocs(prev => ({ ...prev, [tipo]: { enviado: false, nomeArquivo: null, url: null, loading: false } }));
  };

  const getDocLabel = (tipo: DocType) => {
    if (tipo === 'Comprovante_Residencia')  return 'Comprovante de Residência';
    if (tipo === 'Documento_Aluno') return 'Documento do Aluno (RG/Certidão)';
    if (tipo === 'Documento_Responsavel') return 'Documento do Responsável (RG/CPF)';
    if (tipo === 'Declaracao_Matricula') return 'Declaração de Matrícula';
    return 'Documento';
  };

  const isAllUploaded = docs.Comprovante_Residencia.enviado && 
                        docs.Documento_Aluno.enviado && 
                        docs.Documento_Responsavel.enviado && 
                        docs.Declaracao_Matricula.enviado;

  const handleFinalize = async () => {
    setLoadingAction(true);
    try {
      // 1. Atualiza no Supabase real
      const { error } = await supabase
        .from('alunos')
        .update({ 
          status: 'aguardando',
          status_carteirinha: 'Em análise',
          observacao_secretaria: null 
        })
        .eq('id', aluno.id);

      if (error) throw error;

      setMsg({ type: 'success', text: '✅ Documentos enviados com sucesso para a SEMED!' });
      setTimeout(() => onSuccess('Em análise'), 1500);
    } catch {
      // Fallback de demonstração
      setTimeout(() => {
        onSuccess('Em análise');
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-fadeIn">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-black text-slate-900 text-sm">Enviar Documentos</h3>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5 truncate max-w-[280px]">
              Estudante: {aluno.nome}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
          {msg && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 border ${
              msg.type === 'success' ? 'bg-emerald-50 border-emerald-250 text-emerald-700' : 'bg-rose-50 border-rose-250 text-rose-700'
            }`}>
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              <span>{msg.text}</span>
            </div>
          )}

          {(['Comprovante_Residencia', 'Documento_Aluno', 'Documento_Responsavel', 'Declaracao_Matricula'] as DocType[]).map((tipo) => {
            const doc = docs[tipo];
            return (
              <div key={tipo} className={`border rounded-2xl p-3 flex flex-col gap-2 transition-all ${
                doc.enviado ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${doc.enviado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {tipo === 'Declaracao_Matricula' ? <FileText size={15} /> : <Image size={15} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-950">{getDocLabel(tipo)}</h4>
                      <span className="text-[9px] text-slate-400 block">
                        {tipo === 'Comprovante_Residencia' ? 'Luz, Água ou Telefone' : 
                         tipo === 'Documento_Aluno' ? 'RG ou Certidão' : 
                         tipo === 'Documento_Responsavel' ? 'RG ou CPF' : 'Declaração Escolar'}
                      </span>
                    </div>
                  </div>
                  {doc.enviado && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">OK</span>}
                </div>

                {doc.loading ? (
                  <div className="py-4 border border-dashed rounded-xl flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-slate-550 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] text-slate-500 font-bold">Enviando...</span>
                  </div>
                ) : doc.enviado ? (
                  <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between border">
                    <span className="text-[10px] text-slate-600 truncate font-mono font-medium max-w-[200px]">
                      {doc.nomeArquivo}
                    </span>
                    <button onClick={() => removeDoc(tipo)} className="p-1 hover:bg-rose-100 hover:text-rose-600 rounded-lg text-slate-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  <label className="border border-dashed hover:border-slate-400 rounded-xl py-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors group">
                    <UploadCloud size={20} className="text-slate-400 group-hover:scale-105 transition-transform" />
                    <span className="text-[10px] font-bold text-slate-600">Escolher Arquivo</span>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleUploadFile(e, tipo)} className="hidden" />
                  </label>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex flex-col gap-2 bg-slate-50">
          <button
            disabled={!isAllUploaded || loadingAction}
            onClick={handleFinalize}
            className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
              isAllUploaded ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed border'
            }`}
          >
            {loadingAction ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Atualizando status...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>Finalizar e Enviar para SEMED</span>
              </>
            )}
          </button>
          {!isAllUploaded && (
            <p className="text-[9px] text-center text-slate-400 font-bold">
              Todos os 4 documentos anexos são obrigatórios para a re-análise.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTE: MODAL DA CARTEIRINHA DIGITAL ─────────────────────────────
interface CarteirinhaModalProps {
  aluno: Filho;
  onClose: () => void;
}

function CarteirinhaModal({ aluno, onClose }: CarteirinhaModalProps) {
  const supabase = createClient();
  const [hash, setHash] = useState<string>(`rotaescola_arapongas_${aluno.id}_2026`);
  const [validade, setValidade] = useState<string>('Dezembro / 2026');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSaveCredential = () => {
    setIsDownloading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsDownloading(false);
      return;
    }

    // Helper to draw image like object-fit: cover
    const drawImageCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
      const imgRatio = img.width / img.height;
      const targetRatio = w / h;
      let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

      if (imgRatio > targetRatio) {
        sWidth = img.height * targetRatio;
        sx = (img.width - sWidth) / 2;
      } else {
        sHeight = img.width / targetRatio;
        sy = (img.height - sHeight) / 2;
      }
      ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
    };

    // Background gradient (navy blue)
    const grad = ctx.createLinearGradient(0, 0, 0, 600);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 600);

    // Border / decoration
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 384, 584);

    // Header Text
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PREFEITURA DE ARAPONGAS', 200, 40);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('SECRETARIA DE EDUCAÇÃO (SEMED)', 200, 55);

    // Divider line
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 75);
    ctx.lineTo(370, 75);
    ctx.stroke();

    // Student Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(aluno.nome.toUpperCase(), 200, 215);

    // Subtitle "TRANSPORTE AUTORIZADO"
    if (isExpired) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('CARTEIRINHA EXPIRADA - RENOVE O RECADASTRO', 200, 235);
    } else {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('TRANSPORTE AUTORIZADO', 200, 235);
    }

    // Details box background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(30, 260, 340, 100);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(30, 260, 340, 100);

    // Details layout (two columns)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('MATRÍCULA', 45, 285);
    ctx.fillText('VALIDADE', 220, 285);
    ctx.fillText('INSTITUIÇÃO', 45, 325);
    ctx.fillText('ITINERÁRIO', 220, 325);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`AR-26-${aluno.id.slice(0, 5).toUpperCase()}`, 45, 302);
    ctx.fillText(validade, 220, 302);
    
    const instText = aluno.escola.length > 25 ? aluno.escola.slice(0, 22) + '...' : aluno.escola;
    const itinText = aluno.rotaId && aluno.rotaId.length > 25 ? aluno.rotaId.slice(0, 22) + '...' : (aluno.rotaId || 'Não definido');
    
    ctx.fillText(instText, 45, 342);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(itinText, 220, 342);

    // Render QR Code SVG and Student Photo asynchronously
    const svgElement = document.querySelector('#carteirinha-qr-code svg');
    if (svgElement) {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = window.URL.createObjectURL(svgBlob);
      
      const imgQR = new window.Image();
      const imgFoto = new window.Image();
      
      let qrLoaded = false;
      let fotoLoaded = false;
      let fotoFailed = false;

      const finishDrawing = () => {
        // Confirm both QR and Foto (if applicable) are resolved
        if (!qrLoaded) return;
        if (aluno.fotoUrl && !fotoLoaded && !fotoFailed) return;

        // Draw Student Photo/Silhouette
        if (aluno.fotoUrl && fotoLoaded) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(155, 75, 90, 115, 16);
          ctx.clip();
          drawImageCover(ctx, imgFoto, 155, 75, 90, 115);
          ctx.restore();

          // Stroke border around photo
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#f59e0b';
          ctx.beginPath();
          ctx.roundRect(155, 75, 90, 115, 16);
          ctx.stroke();
        } else {
          // Silhouette placeholder
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(155, 75, 90, 115, 16);
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#f59e0b';
          ctx.stroke();
          
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(155, 75, 90, 115, 16);
          ctx.clip();
          
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(200, 115, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(200, 165, 28, Math.PI, 0, false);
          ctx.fill();
          ctx.restore();
        }

        // Draw QR Code Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(135, 385, 130, 130);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.strokeRect(135, 385, 130, 130);

        // Draw QR Code
        ctx.drawImage(imgQR, 140, 390, 120, 120);

        if (isExpired) {
          // Semi-transparent red overlay over the QR code
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(140, 390, 120, 120);
          
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('EXPIRADA', 200, 445);
          ctx.fillStyle = '#cbd5e1';
          ctx.font = 'bold 8px sans-serif';
          ctx.fillText('RENOVE RECADASTRO', 200, 465);
        }

        // Footer message
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('APRESENTE AO MOTORISTA', 200, 540);
        ctx.font = '8px monospace';
        ctx.fillText(hash, 200, 555);

        // Trigger download
        const png = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = png;
        downloadLink.download = `carteirinha-${aluno.nome.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(blobURL);
        setIsDownloading(false);
      };

      imgQR.onload = () => {
        qrLoaded = true;
        finishDrawing();
      };
      imgQR.src = blobURL;

      if (aluno.fotoUrl) {
        imgFoto.crossOrigin = 'anonymous';
        imgFoto.onload = () => {
          fotoLoaded = true;
          finishDrawing();
        };
        imgFoto.onerror = () => {
          fotoFailed = true;
          finishDrawing();
        };
        imgFoto.src = aluno.fotoUrl + (aluno.fotoUrl.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
      }
    } else {
      // Fallback silhouette when QR SVG is not found
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(155, 75, 90, 115, 16);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();
      
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(155, 75, 90, 115, 16);
      ctx.clip();
      
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(200, 115, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(200, 165, 28, Math.PI, 0, false);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(135, 385, 130, 130);
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('QR CODE', 200, 450);
      
      const png = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = png;
      downloadLink.download = `carteirinha-${aluno.nome.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    async function fetchHash() {
      try {
        const { data } = await supabase
          .from('carteirinhas')
          .select('qr_code_hash, data_vencimento')
          .eq('aluno_id', aluno.id)
          .maybeSingle();

        if (data) {
          if (data.qr_code_hash) {
            setHash(data.qr_code_hash);
          }
          if (data.data_vencimento) {
            const date = new Date(data.data_vencimento);
            const meses = [
              'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            setValidade(`${meses[date.getMonth()]} / ${date.getFullYear()}`);
            setIsExpired(getSimulatedDate() > date);
          }
        }
      } catch {
        // Fallback seguro
      } finally {
        setLoading(false);
      }
    }
    fetchHash();
  }, [aluno.id, supabase]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-[325px] flex flex-col items-center bg-transparent animate-fadeIn my-auto">
        
        {/* Botão de Fechar Absoluto */}
        <button onClick={onClose} className="absolute -top-11 right-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full p-2 transition-all shadow-md">
          <X size={18} />
        </button>

        {/* ── CREDENCIAL OFICIAL ── */}
        <div className="w-full bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative">
          <div className="h-2.5 bg-amber-500" />

          {/* Cabeçalho */}
          <div className="px-5 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3">
            <span className="text-xl">🏛️</span>
            <div>
              <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Prefeitura de Arapongas</h3>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Secretaria de Educação (SEMED)</span>
            </div>
          </div>

          {/* Corpo */}
          <div className="px-5 pt-5 pb-4 flex flex-col items-center text-center relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none text-[150px] select-none">🚌</div>

            {/* Foto */}
            <div className="w-24 h-32 rounded-2xl bg-slate-800 border-2 border-amber-500 overflow-hidden shadow-lg relative z-10 flex items-center justify-center">
              {aluno.fotoUrl ? (
                <img src={aluno.fotoUrl} alt={aluno.nome} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-slate-500">👤</span>
              )}
            </div>

            {/* Dados */}
            <div className="mt-3.5 z-10">
              <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight px-1">{aluno.nome}</h4>
              <span className={`text-[8px] font-bold border px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-1 inline-block ${
                isExpired 
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {isExpired ? 'Carteirinha Expirada' : 'Transporte Autorizado'}
              </span>
            </div>

            <div className="w-full border-t border-slate-800/80 my-3.5" />

            {/* Detalhes */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 w-full text-left text-xs z-10 px-1">
              <div>
                <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">Matrícula</span>
                <span className="font-mono text-slate-200 font-bold text-[9px]">AR-26-{aluno.id.slice(0, 5).toUpperCase()}</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">Validade</span>
                <span className="text-slate-200 font-bold text-[9px]">{validade}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">Instituição</span>
                <span className="text-slate-200 font-bold text-[9px] truncate block">{aluno.escola}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">Itinerário</span>
                <span className="text-amber-400 font-bold text-[9px] block leading-tight truncate">{aluno.rotaId}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="px-5 py-4 bg-slate-950 border-t border-slate-800 flex flex-col items-center justify-center gap-2">
            <div id="carteirinha-qr-code" className="bg-white p-3 rounded-2xl border-2 border-amber-500 flex flex-col items-center justify-center gap-1.5 shadow-md relative overflow-hidden">
              {loading ? (
                <div className="w-[100px] h-[100px] flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <QRCodeSVG value={hash} size={100} bgColor="#ffffff" fgColor="#0f172a" level="M" />
                  {isExpired && (
                    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-1">
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none">EXPIRADA</span>
                      <span className="text-[6.5px] text-slate-300 font-bold mt-1 leading-tight">Renove o<br/>Recadastro</span>
                    </div>
                  )}
                </>
              )}
              <span className="text-[7px] font-mono text-slate-400 truncate max-w-[120px]">{hash}</span>
            </div>
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
              {isExpired ? 'Acesso Bloqueado' : 'Apresente ao Motorista'}
            </span>
          </div>
        </div>

        {/* Botão de download real */}
        <button
          onClick={handleSaveCredential}
          disabled={isDownloading}
          className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors shadow-md mt-3.5 border border-slate-850 disabled:opacity-50"
        >
          <Download size={13} className="text-amber-500" />
          <span>{isDownloading ? 'Salvando...' : 'Salvar Credencial no Celular'}</span>
        </button>
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTE: MODAL DE RASTREIO GPS REAL ──────────────────────────────
interface LocalizacaoVeiculo {
  latitude: number;
  longitude: number;
  velocidade_kmh: number;
  atualizado_em: string;
  foraDeTurno: boolean;
}

interface RastreioModalProps {
  aluno: Filho;
  onClose: () => void;
}

function RastreioModal({ aluno, onClose }: RastreioModalProps) {
  const supabase = createClient();
  const [localizacao, setLocalizacao] = useState<LocalizacaoVeiculo | null>(null);
  const [isRouteActive, setIsRouteActive] = useState<boolean>(true);
  const [loadingLoc, setLoadingLoc] = useState(true);
  const [loadingAusencia, setLoadingAusencia] = useState(false);
  const [ausenciaNotificada, setAusenciaNotificada] = useState(false);
  const [tempoEstimado, setTempoEstimado] = useState(12);
  const [msg, setMsg] = useState<{ type: 'info' | 'success'; text: string } | null>(null);

  // Busca Localização GPS
  useEffect(() => {
    async function fetchLoc() {
      try {
        const queryRouteId = aluno.rotaUuid || aluno.rotaId;

        // Busca o status ativo da rota
        if (queryRouteId && queryRouteId.length > 10) {
          const { data: routeData } = await supabase
            .from('rotas')
            .select('ativa')
            .eq('id', queryRouteId)
            .maybeSingle();
          if (routeData) {
            setIsRouteActive(routeData.ativa);
          }
        } else {
          setIsRouteActive(aluno.rotaAtiva ?? true);
        }

        const { data, error } = await supabase
          .from('localizacao_veiculo')
          .select('latitude, longitude, velocidade_kmh, atualizado_em')
          .eq('rota_id', queryRouteId)
          .order('atualizado_em', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const updated = new Date(data.atualizado_em);
          const diffHoras = (new Date().getTime() - updated.getTime()) / (1000 * 60 * 60);
          const foraDeTurno = diffHoras > 2;

          setLocalizacao({
            latitude: data.latitude,
            longitude: data.longitude,
            velocidade_kmh: data.velocidade_kmh,
            atualizado_em: updated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            foraDeTurno,
          });
        } else {
          setLocalizacao({
            latitude: -23.4178,
            longitude: -51.4269,
            velocidade_kmh: 0,
            atualizado_em: '--:--',
            foraDeTurno: true,
          });
        }
      } catch {
        setLocalizacao({
          latitude: -23.4178,
          longitude: -51.4269,
          velocidade_kmh: 0,
          atualizado_em: '--:--',
          foraDeTurno: true,
        });
      } finally {
        setLoadingLoc(false);
      }
    }

    fetchLoc();
    const interval = setInterval(fetchLoc, 10000); // Pooling rápido de 10s para modal ativo
    return () => clearInterval(interval);
  }, [aluno.rotaId, aluno.rotaUuid, supabase]);

  // Carrega status anterior de ausência diária
  useEffect(() => {
    async function checkAusencia() {
      try {
        const { data } = await supabase
          .from('presencas_diarias')
          .select('id')
          .eq('aluno_id', aluno.id)
          .eq('data_presenca', getLocalDateString())
          .eq('compareceu', false)
          .maybeSingle();

        if (data) setAusenciaNotificada(true);
      } catch {
        // Fallback
      }
    }
    checkAusencia();
  }, [aluno.id, supabase]);

  // Simulação de aproximação se estiver em turno
  useEffect(() => {
    if (localizacao?.foraDeTurno || !isRouteActive) return;
    const interval = setInterval(() => {
      setTempoEstimado(prev => (prev > 1 ? prev - 1 : 12));
    }, 12000);
    return () => clearInterval(interval);
  }, [localizacao?.foraDeTurno, isRouteActive]);

  const handleReportarAusencia = async () => {
    setLoadingAusencia(true);
    setMsg(null);
    try {
      const { error } = await supabase.from('presencas_diarias').upsert({
        aluno_id:       aluno.id,
        data_presenca:  getLocalDateString(),
        compareceu:     false,
        motivo:         'Ausência reportada pelo painel móvel',
      });
      if (error) throw error;

      setAusenciaNotificada(true);
      setMsg({ type: 'success', text: 'Ausência enviada! O motorista já foi notificado.' });
    } catch {
      setTimeout(() => {
        setAusenciaNotificada(true);
        setMsg({ type: 'success', text: '[MOCK] Ausência notificada com sucesso no modo demonstração!' });
      }, 600);
    } finally {
      setLoadingAusencia(false);
    }
  };

  const handleDesfazerAusencia = async () => {
    setLoadingAusencia(true);
    setMsg(null);
    try {
      const { error } = await supabase
        .from('presencas_diarias')
        .delete()
        .eq('aluno_id', aluno.id)
        .eq('data_presenca', getLocalDateString());
      
      if (error) throw error;

      setAusenciaNotificada(false);
      setMsg({ type: 'info', text: 'Ausência cancelada. O aluno está ativo novamente.' });
    } catch {
      setTimeout(() => {
        setAusenciaNotificada(false);
        setMsg({ type: 'info', text: '[MOCK] Notificação removida! Embarque reativado.' });
      }, 600);
    } finally {
      setLoadingAusencia(false);
    }
  };

  // Coordenadas limites de Arapongas (Bounding Box)
  const LAT_MIN = -23.4300;
  const LAT_MAX = -23.4100;
  const LNG_MIN = -51.4350;
  const LNG_MAX = -51.4150;

  function getProjectedCoords(lat: number, lng: number) {
    const clampedLat = Math.min(Math.max(lat, LAT_MIN), LAT_MAX);
    const clampedLng = Math.min(Math.max(lng, LNG_MIN), LNG_MAX);

    const x = ((clampedLng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
    const y = ((LAT_MAX - clampedLat) / (LAT_MAX - LAT_MIN)) * 100;
    return { x, y };
  }

  // Pontos fixos projetados para Escola e Stop (Ponto)
  const schoolCoords = getProjectedCoords(-23.4120, -51.4200);
  const stopCoords = getProjectedCoords(-23.4240, -51.4280);

  // Posição projetada do ônibus
  const busCoords = localizacao && !localizacao.foraDeTurno
    ? getProjectedCoords(localizacao.latitude, localizacao.longitude)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[95vh] animate-fadeIn">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-black text-slate-900 text-sm">Rastreamento GPS</h3>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
              Itinerário: {aluno.rotaId}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
          
          {/* Mapa SVG */}
          <div className="w-full aspect-[4/3] rounded-2xl border bg-slate-50 relative overflow-hidden shadow-inner flex flex-col shrink-0">
            {loadingLoc ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-slate-400 font-bold">Localizando ônibus...</span>
              </div>
            ) : (
              <>
                <svg className="absolute inset-0 w-full h-full text-slate-200 opacity-60" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="40" x2="400" y2="40" stroke="currentColor" strokeWidth="4" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="currentColor" strokeWidth="6" />
                  <line x1="0" y1="170" x2="400" y2="170" stroke="currentColor" strokeWidth="4" />
                  <line x1="60" y1="0" x2="60" y2="300" stroke="currentColor" strokeWidth="4" />
                  <line x1="150" y1="0" x2="150" y2="300" stroke="currentColor" strokeWidth="8" />
                  <line x1="260" y1="0" x2="260" y2="300" stroke="currentColor" strokeWidth="4" />
                  <path d="M 60,170 L 150,170 L 150,100 L 260,100" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="5" />
                </svg>

                {/* Escola */}
                <div 
                  className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${schoolCoords.x}%`, top: `${schoolCoords.y}%` }}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] shadow animate-pulse">🏫</div>
                  <span className="text-[7px] bg-slate-900 text-white font-extrabold px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap shadow uppercase">
                    Escola
                  </span>
                </div>

                {/* Ponto de Embarque */}
                <div 
                  className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${stopCoords.x}%`, top: `${stopCoords.y}%` }}
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow">
                    <MapPin size={11} className="text-white" />
                  </div>
                  <span className="text-[7px] bg-slate-900 text-white font-extrabold px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap shadow uppercase">
                    Seu Ponto
                  </span>
                </div>

                {/* Ônibus (Baseado em Coordenadas GPS Reais) */}
                {busCoords && isRouteActive ? (
                  <div
                    className="absolute flex flex-col items-center transition-all duration-1000 z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${busCoords.x}%`, top: `${busCoords.y}%` }}
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-950 border border-amber-500 flex items-center justify-center shadow-md animate-bounce">
                      <Bus size={13} className="text-amber-500" />
                    </div>
                    <span className="text-[7px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full mt-0.5 shadow whitespace-nowrap uppercase tracking-wider scale-90">
                      Ônibus
                    </span>
                  </div>
                ) : (
                  null
                )}

                {/* Fora de turno ou Rota Inativa */}
                {(!isRouteActive || localizacao?.foraDeTurno) && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5 p-4 z-20">
                    <WifiOff size={20} className="text-slate-400" />
                    <span className="text-xs font-black text-white">
                      {!isRouteActive ? 'Motorista Fora de Rota' : 'Veículo Fora de Turno'}
                    </span>
                    <span className="text-[9px] text-slate-300 text-center">
                      {!isRouteActive 
                        ? 'O motorista desativou o início da rota no painel dele.' 
                        : 'Nenhum sinal de GPS ativo para esta linha no momento.'}
                    </span>
                  </div>
                )}

                {/* GPS Info */}
                <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur px-2 py-1 rounded-lg border text-[7px] font-mono text-slate-500 shadow-sm flex flex-col gap-0.5">
                  {localizacao ? (
                    <>
                      <span>Lat: {localizacao.latitude.toFixed(4)}</span>
                      <span>Lng: {localizacao.longitude.toFixed(4)}</span>
                      <span className="flex items-center gap-0.5 text-[6.5px]">
                        <Navigation size={6} className="rotate-45 text-blue-500" />
                        {localizacao.velocidade_kmh > 0 ? `${localizacao.velocidade_kmh} km/h` : 'Parado'}
                      </span>
                    </>
                  ) : (
                    <span>Sem coordenadas</span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Estimativa */}
          <div className="bg-slate-50 border rounded-2xl p-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock size={16} />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none">Estimativa de Chegada</h4>
                <span className="text-xs font-extrabold text-slate-900 mt-1 block">
                  {!isRouteActive ? 'Fora de Rota' : localizacao?.foraDeTurno ? 'Fora de turno' : `Atualizado às ${localizacao?.atualizado_em}`}
                </span>
              </div>
            </div>
            {!localizacao?.foraDeTurno && isRouteActive && (
              <div className="text-right">
                <span className="text-xl font-black font-mono text-slate-900">~{tempoEstimado}</span>
                <span className="text-[9px] text-slate-500 block leading-none font-bold">min</span>
              </div>
            )}
          </div>

          {/* Linha do Tempo de Paradas */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col gap-3 shrink-0">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest leading-none mb-1">
              Itinerário & Paradas
            </h4>
            
            <div className="flex flex-col gap-4 relative pl-5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              {/* Parada 1: Partida */}
              <div className="relative flex flex-col gap-0.5">
                <span className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full border-2 border-emerald-500 bg-white flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-slate-900 leading-tight">Partida da Garagem</span>
                <span className="text-[9px] text-slate-500">Checklist inicial concluído pelo motorista</span>
              </div>

              {/* Parada 2: Ponto do Aluno */}
              <div className="relative flex flex-col gap-0.5">
                <span className={`absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-white flex items-center justify-center ${
                  ausenciaNotificada 
                    ? 'border-rose-500' 
                    : (localizacao?.foraDeTurno || !isRouteActive) 
                    ? 'border-slate-350' 
                    : 'border-amber-500 animate-pulse'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    ausenciaNotificada 
                      ? 'bg-rose-500' 
                      : (localizacao?.foraDeTurno || !isRouteActive) 
                      ? 'bg-slate-350' 
                      : 'bg-amber-500'
                  }`} />
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 leading-tight">Seu Ponto (Embarque)</span>
                  {ausenciaNotificada ? (
                    <span className="text-[8px] bg-rose-500/10 text-rose-600 border border-rose-500/20 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                      Falta Avisada
                    </span>
                  ) : (!localizacao?.foraDeTurno && isRouteActive) ? (
                    <span className="text-[8px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                      A Caminho
                    </span>
                  ) : null}
                </div>
                <span className="text-[9px] text-slate-500">
                  {ausenciaNotificada 
                    ? 'Ausência notificada — veículo não parará neste ponto por hoje' 
                    : (!isRouteActive || localizacao?.foraDeTurno) 
                    ? 'Previsão indisponível' 
                    : `Previsão de chegada: ~${tempoEstimado} min`}
                </span>
              </div>

              {/* Parada 3: Escola */}
              <div className="relative flex flex-col gap-0.5">
                <span className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-350 bg-white flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-350" />
                </span>
                <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[280px]">
                  Destino: {aluno.escola}
                </span>
                <span className="text-[9px] text-slate-500">Desembarque seguro dos estudantes</span>
              </div>
            </div>
          </div>

          {msg && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 border ${
              msg.type === 'success' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <CalendarX size={15} className="shrink-0 mt-0.5 text-red-500" />
              <span>{msg.text}</span>
            </div>
          )}

          {/* Card do Motorista e Veículo */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-white flex flex-col gap-3.5 shadow-md relative overflow-hidden shrink-0">
            <div className="absolute -right-4 -bottom-4 text-slate-800/15 pointer-events-none text-8xl select-none">
              🚌
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-amber-500 border border-slate-700 overflow-hidden flex items-center justify-center text-lg text-slate-950 font-bold shrink-0 shadow">
                {aluno.motorista_nome ? aluno.motorista_nome.charAt(0) : '👤'}
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">
                  Motorista Responsável
                </h4>
                <span className="text-sm font-black text-white mt-1 block truncate">
                  {aluno.motorista_nome || 'Aguardando atribuição'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate">
                  Veículo: {aluno.veiculo_numero || 'Não atribuído'}
                </span>
              </div>
            </div>

            {aluno.motorista_telefone && (
              <div className="border-t border-slate-800 pt-3 flex gap-2">
                <a
                  href={`https://wa.me/55${aluno.motorista_telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${aluno.motorista_nome?.split(' ')[0]}, sou responsável pelo aluno ${aluno.nome}. Gostaria de obter informações da rota de hoje.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <MessageCircle size={14} />
                  <span>Falar no WhatsApp</span>
                </a>
              </div>
            )}
          </div>

          {/* Controle de Ausência */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shrink-0">
            <div className="flex gap-2.5 items-start">
              <CalendarX size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Comunicado de Ausência Diária</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Notifique o motorista da ausência do estudante para poupar tempo e paradas na rota.</p>
              </div>
            </div>
            <div className="mt-3.5 pt-3 border-t border-slate-800">
              {ausenciaNotificada ? (
                <button
                  disabled={loadingAusencia}
                  onClick={handleDesfazerAusencia}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw size={13} className="text-amber-500" />
                  <span>{loadingAusencia ? 'Cancelando...' : 'Desfazer Notificação de Ausência'}</span>
                </button>
              ) : (
                <button
                  disabled={loadingAusencia}
                  onClick={handleReportarAusencia}
                  className="w-full bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <CalendarX size={13} />
                  <span>{loadingAusencia ? 'Enviando...' : 'Meu filho não vai hoje'}</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

interface LogEmbarque {
  id: string;
  tipo_movimento: 'IDA' | 'VOLTA';
  status: 'PRESENTE' | 'AUSENTE';
  data_registro: string;
  turno?: 'Matutino' | 'Vespertino' | 'Noturno';
  criado_em?: string;
}

function HistoricoEmbarque({ alunoId, usandoMock }: { alunoId: string; usandoMock: boolean }) {
  const supabase = createClient();
  const [logs, setLogs] = useState<LogEmbarque[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      if (usandoMock || alunoId.startsWith('aluno-')) {
        // Mock data fallback
        const todayStr = getLocalDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const dayBefore = new Date();
        dayBefore.setDate(dayBefore.getDate() - 2);
        const dayBeforeStr = dayBefore.toISOString().split('T')[0];

        setLogs([
          { id: 'mock-1', tipo_movimento: 'VOLTA', status: 'PRESENTE', data_registro: todayStr, turno: 'Vespertino' },
          { id: 'mock-2', tipo_movimento: 'IDA', status: 'PRESENTE', data_registro: todayStr, turno: 'Matutino' },
          { id: 'mock-3', tipo_movimento: 'VOLTA', status: 'PRESENTE', data_registro: yesterdayStr, turno: 'Vespertino' },
          { id: 'mock-4', tipo_movimento: 'IDA', status: 'AUSENTE', data_registro: yesterdayStr, turno: 'Matutino' },
          { id: 'mock-5', tipo_movimento: 'VOLTA', status: 'PRESENTE', data_registro: dayBeforeStr, turno: 'Vespertino' },
        ]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('logs_embarque')
          .select('id, tipo_movimento, status, data_registro, turno')
          .eq('aluno_id', alunoId)
          .order('data_registro', { ascending: false })
          .order('criado_em', { ascending: false })
          .limit(4);

        if (!error && data) {
          setLogs(data as LogEmbarque[]);
        }
      } catch (err) {
        console.error('Erro ao buscar logs de embarque:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, [alunoId, usandoMock, supabase]);

  if (loading) {
    return (
      <div className="py-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
        <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        <span>Carregando histórico...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-2 px-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-400 font-semibold text-center uppercase tracking-wider">
        Nenhum registro de embarque recente
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
        Histórico de Embarque Recente
      </span>
      <div className="grid grid-cols-2 gap-2">
        {logs.map((log) => {
          const isPresente = log.status === 'PRESENTE';
          // Format date from YYYY-MM-DD to DD/MM
          let dateStr = log.data_registro;
          if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            dateStr = `${parts[2]}/${parts[1]}`;
          }
          
          return (
            <div 
              key={log.id} 
              className={`flex items-center justify-between p-2 rounded-xl border text-[10px] font-bold ${
                isPresente 
                  ? 'bg-emerald-50/60 border-emerald-100 text-emerald-700' 
                  : 'bg-rose-50/60 border-rose-100 text-rose-700'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPresente ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="truncate">{dateStr} · {log.tipo_movimento} ({log.turno || 'Matutino'})</span>
              </div>
              <span className="font-extrabold uppercase text-[8px] tracking-wider shrink-0 ml-1">
                {isPresente ? 'Presente' : 'Faltou'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTE: OCORRÊNCIAS DO FILHO ────────────────────────────────────
interface Ocorrencia {
  id: string;
  descricao: string;
  status: 'pendente' | 'enviada_ao_pai';
  criado_em: string;
}

function OcorrenciasFilho({ alunoId, usandoMock }: { alunoId: string; usandoMock: boolean }) {
  const supabase = createClient();
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOcorrencias() {
      if (usandoMock || alunoId.startsWith('aluno-')) {
        // No mock do pai, simulamos que o segundo filho tem uma ocorrência para demonstrar
        if (alunoId === 'aluno-02' || alunoId === 'aluno-mock-2') {
          setOcorrencias([
            {
              id: 'mock-occ-1',
              descricao: 'O aluno se recusou a sentar e ficou andando no corredor com o ônibus em movimento.',
              status: 'enviada_ao_pai',
              criado_em: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
            }
          ]);
        } else {
          setOcorrencias([]);
        }
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ocorrencias')
          .select('id, descricao, status, criado_em')
          .eq('aluno_id', alunoId)
          .eq('status', 'enviada_ao_pai')
          .order('criado_em', { ascending: false });

        if (!error && data) {
          setOcorrencias(data as Ocorrencia[]);
        }
      } catch (err) {
        console.error('Erro ao buscar ocorrências do filho:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOcorrencias();
  }, [alunoId, usandoMock, supabase]);

  if (loading) return null;
  if (ocorrencias.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
      <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block flex items-center gap-1">
        <ShieldAlert size={10} /> Ocorrências Disciplinares Registradas
      </span>
      <div className="flex flex-col gap-1.5">
        {ocorrencias.map((occ) => {
          let dateStr = occ.criado_em;
          if (dateStr.includes('T')) {
            const datePart = dateStr.split('T')[0];
            const parts = datePart.split('-');
            dateStr = `${parts[2]}/${parts[1]}`;
          }
          return (
            <div key={occ.id} className="bg-rose-50 border border-rose-150 rounded-xl p-3 text-[10px] text-rose-950 flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-rose-200/50 pb-1">
                <span className="font-extrabold uppercase text-[8px] tracking-wider text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded-full">
                  Notificado em {dateStr}
                </span>
              </div>
              <p className="font-medium italic leading-relaxed text-slate-800">
                "{occ.descricao}"
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}



