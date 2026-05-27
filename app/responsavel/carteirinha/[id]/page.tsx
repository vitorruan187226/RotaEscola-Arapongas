'use client';

import { useParams, useRouter } from 'next/navigation';
import { Shield, QrCode, ArrowLeft, Download, CheckCircle, Bookmark } from 'lucide-react';

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

export default function CarteirinhaDigitalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Mock de dados do aluno aprovado (Lei 4 - Dados tipados para demonstração)
  const alunoData: AlunoCarteirinha = {
    id: id || 'aluno-01',
    nome: 'Thiago Martins Nogueira',
    escola: 'Escola Municipal Dorcelina Folador',
    serie: '4º Ano B - Turno Matutino',
    rota: 'Rota 04 - Zona Rural / Dorcelina Folador',
    matricula: 'AR-2026-98745',
    qrCodeHash: `rotaescola_arapongas_secure_${id || 'aluno-01'}_2026`,
    fotoUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=150&auto=format&fit=crop&q=80',
    validade: 'Dezembro / 2026',
  };

  return (
    <div className="flex flex-col gap-5 items-center">
      {/* Cabeçalho */}
      <div className="w-full text-left px-1 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            Carteirinha Digital
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Apresente este QR Code ao motorista ao embarcar no veículo.
          </p>
        </div>
      </div>

      {/* CREDENCIAL ESTILO CRACHÁ OFICIAL */}
      <div className="w-full max-w-[320px] bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative">
        
        {/* Linha Amarela Superior */}
        <div className="h-2.5 bg-amber-500" />

        {/* Cabeçalho do Crachá */}
        <div className="px-5 py-4 bg-slate-950/60 border-b border-slate-850 flex items-center gap-3">
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
          
          {/* Marca D'Água Fundo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none text-[150px]">
            🚌
          </div>

          {/* Foto do Estudante */}
          <div className="w-28 h-36 rounded-2xl bg-slate-800 border-2 border-amber-500 overflow-hidden shadow-lg relative z-10">
            {alunoData.fotoUrl ? (
              <img 
                src={alunoData.fotoUrl} 
                alt={alunoData.nome} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-850 text-slate-400">
                👤
              </div>
            )}
          </div>

          {/* Dados do Aluno */}
          <div className="mt-4 z-10">
            <h4 className="text-base font-black text-white uppercase tracking-wide px-2 leading-tight">
              {alunoData.nome}
            </h4>
            <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1.5 inline-block">
              Transporte Autorizado
            </span>
          </div>

          {/* Linha Divisória */}
          <div className="w-full border-t border-slate-800/80 my-4" />

          {/* Grade de Detalhes Cadastrais */}
          <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 w-full text-left text-xs z-10 px-1">
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider block">Matrícula</span>
              <span className="font-mono text-slate-200 font-bold text-[10px]">{alunoData.matricula}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider block">Validade</span>
              <span className="text-slate-200 font-bold text-[10px]">{alunoData.validade}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider block">Instituição</span>
              <span className="text-slate-200 font-bold text-[10px] truncate block">{alunoData.escola}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider block">Itinerário Escolar</span>
              <span className="text-amber-400 font-bold text-[10px] leading-tight block">{alunoData.rota}</span>
            </div>
          </div>
        </div>

        {/* Seção Inferior do QR Code (Cor de fundo escura com contraste) */}
        <div className="px-5 py-5 bg-slate-950 border-t border-slate-850 flex flex-col items-center justify-center gap-3">
          {/* Caixa do QR Code com visual simulado */}
          <div className="bg-white p-3.5 rounded-2xl border-2 border-amber-500 flex flex-col items-center justify-center gap-1.5 shadow-md">
            <QrCode size={120} className="text-slate-950" />
            <span className="text-[8px] font-mono text-slate-400">HASH: {alunoData.qrCodeHash.substring(0, 18)}...</span>
          </div>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">
            Passe pelo Validador de Embarque
          </span>
        </div>
      </div>

      {/* Botão de Ação */}
      <button 
        onClick={() => {
          alert('Função de download do PDF do crachá de Arapongas simulada com sucesso!');
        }}
        className="w-full max-w-[320px] bg-slate-900 text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-md mt-2"
      >
        <Download size={14} className="text-amber-500" />
        <span>Salvar no Celular (PDF/Imagem)</span>
      </button>
    </div>
  );
}
