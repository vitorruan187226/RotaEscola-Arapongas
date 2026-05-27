'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import {
  User, Shield, MapPin, UploadCloud, AlertCircle, FileText,
  CheckCircle, Clock, MessageCircle
} from 'lucide-react';

// ─── Contrato de Dados (Lei 4 — Tipagem estrita) ──────────────────────────────
interface Filho {
  id: string;
  nome: string;
  escola: string;
  serie: string;
  statusCarteirinha: 'Pendente' | 'Em análise' | 'Aprovado';
  rotaId: string;
  fotoUrl?: string;
}

// ─── Mock tipado de fallback (lei 4 — sem @ts-ignore) ────────────────────────
const FILHOS_MOCK: Filho[] = [
  {
    id: 'aluno-01',
    nome: 'Thiago Martins Nogueira',
    escola: 'Escola Municipal Dorcelina Folador',
    serie: '4º Ano B',
    statusCarteirinha: 'Aprovado',
    rotaId: 'Rota 04',
    fotoUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'aluno-02',
    nome: 'Beatriz Martins Nogueira',
    escola: 'Colégio Estadual Julia Wanderley',
    serie: '7º Ano A',
    statusCarteirinha: 'Em análise',
    rotaId: 'Rota 22',
    fotoUrl: undefined,
  },
];

// ─── Helpers de badge ─────────────────────────────────────────────────────────
function getStatusBadgeClass(status: Filho['statusCarteirinha']) {
  switch (status) {
    case 'Aprovado':      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Em análise':   return 'bg-blue-100 text-blue-700 border-blue-200';
    default:              return 'bg-amber-100 text-amber-700 border-amber-200';
  }
}

function getStatusIcon(status: Filho['statusCarteirinha']) {
  switch (status) {
    case 'Aprovado':    return <CheckCircle size={13} />;
    case 'Em análise': return <Clock size={13} />;
    default:            return <AlertCircle size={13} />;
  }
}

// ─── Mapeamento do campo do banco para o tipo TypeScript ─────────────────────
function mapStatus(raw: string | null): Filho['statusCarteirinha'] {
  if (raw === 'Aprovado')    return 'Aprovado';
  if (raw === 'Em análise') return 'Em análise';
  return 'Pendente';
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function ResponsavelDashboard() {
  const router   = useRouter();
  const supabase = createClient();

  const [userName, setUserName] = useState<string>('');
  const [filhos,   setFilhos]   = useState<Filho[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [usandoMock, setUsandoMock] = useState(false);

  useEffect(() => {
    async function loadUserAndFilhos() {
      try {
        // 1. Busca usuário autenticado
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // 2. Extrai primeiro nome — tenta perfil, fallback para e-mail
          const { data: perfil } = await supabase
            .from('perfis')
            .select('nome')
            .eq('id', user.id)
            .maybeSingle();

          if (perfil?.nome) {
            setUserName(perfil.nome.split(' ')[0]);
          } else if (user.email) {
            const emailName = user.email.split('@')[0];
            setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
          }

          // 3. Busca filhos vinculados via RLS (responsavel_id = auth.uid())
          const { data: alunosDB, error: alunosErr } = await supabase
            .from('alunos')
            .select('id, nome, escola, serie, rota_id, status_carteirinha, foto_url')
            .eq('responsavel_id', user.id);

          if (!alunosErr && alunosDB && alunosDB.length > 0) {
            const mapeados: Filho[] = alunosDB.map((a: {
              id: string;
              nome: string;
              escola: string;
              serie: string;
              rota_id: string;
              status_carteirinha: string | null;
              foto_url: string | null;
            }) => ({
              id:                a.id,
              nome:              a.nome,
              escola:            a.escola,
              serie:             a.serie,
              statusCarteirinha: mapStatus(a.status_carteirinha),
              rotaId:            a.rota_id ?? 'Aguardando Atribuição',
              fotoUrl:           a.foto_url ?? undefined,
            }));
            setFilhos(mapeados);
          } else {
            // Fallback: sem filhos no banco — exibe mock com aviso visual
            setFilhos(FILHOS_MOCK);
            setUsandoMock(true);
          }
        } else {
          // Sem sessão Supabase (login mock) — usa dados de demonstração
          setUserName('José');
          setFilhos(FILHOS_MOCK);
          setUsandoMock(true);
        }
      } catch {
        setUserName('Responsável');
        setFilhos(FILHOS_MOCK);
        setUsandoMock(true);
      } finally {
        setLoading(false);
      }
    }
    loadUserAndFilhos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Estado de Carregamento ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-semibold">Carregando seu painel...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

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
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
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
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Estudantes Vinculados ({filhos.length})
        </h3>

        {filhos.length === 0 ? (
          /* ── Empty State ──────────────────────────────────────────────────── */
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <User size={28} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Nenhum aluno vinculado</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[240px]">
                Ainda não há estudantes associados ao seu CPF neste sistema. Entre em contato com a SEMED para regularizar o cadastro.
              </p>
            </div>
            <button
              onClick={() => router.push('/responsavel/documentos')}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              <MessageCircle size={14} />
              <span>Falar com a SEMED</span>
            </button>
          </div>
        ) : (
          filhos.map((filho) => (
            <div
              key={filho.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* ── Linha: Foto + Detalhes + Status ──────────────────────────── */}
              <div className="flex gap-3">
                {/* Foto 3x4 / Avatar */}
                <div className="w-16 h-20 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden flex items-center justify-center shrink-0">
                  {filho.fotoUrl ? (
                    <img src={filho.fotoUrl} alt={filho.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2 flex flex-col items-center gap-1">
                      <User size={24} className="text-slate-400" />
                      <span className="text-[8px] text-slate-500 font-bold uppercase leading-none">Sem Foto</span>
                    </div>
                  )}
                </div>

                {/* Informações Escolares */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${getStatusBadgeClass(filho.statusCarteirinha)}`}>
                    {getStatusIcon(filho.statusCarteirinha)}
                    <span>{filho.statusCarteirinha}</span>
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 truncate mt-1.5">{filho.nome}</h4>
                  <span className="text-xs text-slate-500 mt-0.5 truncate">{filho.escola}</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {filho.serie} · {filho.rotaId}
                  </span>
                </div>
              </div>

              {/* ── Ações Rápidas ─────────────────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                {/* Documentos */}
                <button
                  onClick={() => router.push(`/responsavel/documentos?alunoId=${filho.id}`)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200/40"
                >
                  <UploadCloud size={14} />
                  <span>Documentos</span>
                </button>

                {/* Rastreio */}
                <button
                  onClick={() => router.push(`/responsavel/rastreio/${encodeURIComponent(filho.rotaId)}`)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
                >
                  <MapPin size={14} />
                  <span>Ver Rastreio</span>
                </button>

                {/* Carteirinha Digital — ativo apenas se Aprovado */}
                {filho.statusCarteirinha === 'Aprovado' ? (
                  <button
                    onClick={() => router.push(`/responsavel/carteirinha/${filho.id}`)}
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
            </div>
          ))
        )}
      </div>

      {/* ── Cartão Informativo SEMED ─────────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-850 leading-relaxed flex gap-3">
        <Shield size={18} className="shrink-0 text-amber-600 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-900 mb-0.5">Importante para a liberação:</h4>
          Anexe a declaração escolar atualizada e o comprovante de residência de Arapongas.
          A validação cadastral é feita pela central da SEMED em até 48 horas úteis.
        </div>
      </div>

    </div>
  );
}
