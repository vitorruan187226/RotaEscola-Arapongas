'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client';
import { Download, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// ─── Contrato de Dados (Lei 4 — Tipagem estrita, sem @ts-ignore) ─────────────
interface AlunoCarteirinha {
  id: string;
  nome: string;
  escola: string;
  serie: string;
  rota: string;
  matricula: string;
  qrCodeHash: string;
  fotoUrl?: string;
  validade: string;
}

// ─── Mock tipado de fallback ──────────────────────────────────────────────────
const MOCK_ALUNO: AlunoCarteirinha = {
  id: 'aluno-01',
  nome: 'Thiago Martins Nogueira',
  escola: 'Escola Municipal Dorcelina Folador',
  serie: '4º Ano B - Turno Matutino',
  rota: 'Rota 04 - Zona Rural / Dorcelina Folador',
  matricula: 'AR-2026-98745',
  qrCodeHash: 'rotaescola_arapongas_secure_aluno-01_2026',
  fotoUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=150&auto=format&fit=crop&q=80',
  validade: 'Dezembro / 2026',
};

export default function CarteirinhaDigitalPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [aluno, setAluno] = useState<AlunoCarteirinha | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAluno() {
      try {
        // Tenta buscar dados reais do aluno pelo ID da URL
        const { data, error } = await supabase
          .from('alunos')
          .select('id, nome, escola, serie, rota_id, foto_url')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          // Tenta buscar o qr_code_hash da carteirinha associada
          const { data: cartData } = await supabase
            .from('carteirinhas')
            .select('qr_code_hash')
            .eq('aluno_id', id)
            .maybeSingle();

          setAluno({
            id:         data.id,
            nome:       data.nome,
            escola:     data.escola,
            serie:      data.serie ?? '—',
            rota:       data.rota_id ?? 'Aguardando Atribuição',
            matricula:  `AR-2026-${data.id.slice(0, 5).toUpperCase()}`,
            qrCodeHash: cartData?.qr_code_hash ?? `rotaescola_arapongas_${data.id}_2026`,
            fotoUrl:    data.foto_url ?? undefined,
            validade:   'Dezembro / 2026',
          });
        } else {
          // Fallback mock tipado
          setAluno({ ...MOCK_ALUNO, id, qrCodeHash: `rotaescola_arapongas_${id}_2026` });
        }
      } catch {
        setAluno({ ...MOCK_ALUNO, id, qrCodeHash: `rotaescola_arapongas_${id}_2026` });
      } finally {
        setLoading(false);
      }
    }
    loadAluno();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-semibold">Carregando carteirinha...</span>
      </div>
    );
  }

  if (!aluno) return null;

  return (
    <div className="flex flex-col gap-5 items-center">
      {/* Cabeçalho */}
      <div className="w-full text-left px-1">
        <h2 className="text-base font-extrabold text-slate-900">Carteirinha Digital</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Apresente este QR Code ao motorista ao embarcar no veículo.
        </p>
      </div>

      {/* ── CREDENCIAL OFICIAL DE ARAPONGAS ──────────────────────────────── */}
      <div className="w-full max-w-[320px] bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative">

        {/* Linha Amarela Superior */}
        <div className="h-2.5 bg-amber-500" />

        {/* Cabeçalho do Crachá */}
        <div className="px-5 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">
              Prefeitura de Arapongas
            </h3>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
              Secretaria Municipal de Educação (SEMED)
            </span>
          </div>
        </div>

        {/* Corpo do Crachá */}
        <div className="px-5 pt-5 pb-4 flex flex-col items-center text-center relative">

          {/* Marca D'Água */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none text-[150px] select-none">
            🚌
          </div>

          {/* Foto do Estudante */}
          <div className="w-28 h-36 rounded-2xl bg-slate-800 border-2 border-amber-500 overflow-hidden shadow-lg relative z-10">
            {aluno.fotoUrl ? (
              <img src={aluno.fotoUrl} alt={aluno.nome} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500 text-4xl">
                👤
              </div>
            )}
          </div>

          {/* Dados do Aluno */}
          <div className="mt-4 z-10">
            <h4 className="text-base font-black text-white uppercase tracking-wide px-2 leading-tight">
              {aluno.nome}
            </h4>
            <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1.5 inline-block">
              Transporte Autorizado
            </span>
          </div>

          {/* Divisória */}
          <div className="w-full border-t border-slate-800/80 my-4" />

          {/* Detalhes Cadastrais em Grade */}
          <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 w-full text-left text-xs z-10 px-1">
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider block">Matrícula</span>
              <span className="font-mono text-slate-200 font-bold text-[10px]">{aluno.matricula}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider block">Validade</span>
              <span className="text-slate-200 font-bold text-[10px]">{aluno.validade}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider block">Instituição</span>
              <span className="text-slate-200 font-bold text-[10px] truncate block">{aluno.escola}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider block">Itinerário Escolar</span>
              <span className="text-amber-400 font-bold text-[10px] leading-tight block">{aluno.rota}</span>
            </div>
          </div>
        </div>

        {/* ── Seção do QR Code REAL (qrcode.react) ──────────────────────────── */}
        <div className="px-5 py-5 bg-slate-950 border-t border-slate-800 flex flex-col items-center justify-center gap-3">
          <div className="bg-white p-3.5 rounded-2xl border-2 border-amber-500 flex flex-col items-center justify-center gap-2 shadow-md">
            {/* QR Code dinâmico gerado com a hash do aluno */}
            <QRCodeSVG
              value={aluno.qrCodeHash}
              size={120}
              bgColor="#ffffff"
              fgColor="#0f172a"
              level="M"
            />
            <span className="text-[8px] font-mono text-slate-400 max-w-[140px] truncate">
              {aluno.qrCodeHash.slice(0, 24)}…
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">
            Passe pelo Validador de Embarque
          </span>
        </div>
      </div>

      {/* Botão de Ação */}
      <button
        onClick={() => alert('Função de salvar/compartilhar carteirinha em PDF simulada!')}
        className="w-full max-w-[320px] bg-slate-900 text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-md mt-2"
      >
        <Download size={14} className="text-amber-500" />
        <span>Salvar no Celular (PDF/Imagem)</span>
      </button>

      {/* Aviso de Segurança */}
      <div className="w-full max-w-[320px] bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
        <Shield size={14} className="shrink-0 text-slate-400 mt-0.5" />
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Este QR Code é único e vinculado ao matriculado. Não compartilhe com terceiros. Válido apenas para a rota indicada.
        </p>
      </div>
    </div>
  );
}
