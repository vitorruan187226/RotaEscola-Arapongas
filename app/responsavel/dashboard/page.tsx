'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import { User, Shield, MapPin, UploadCloud, AlertCircle, FileText, CheckCircle, Clock } from 'lucide-react';

interface Filho {
  id: string;
  nome: string;
  escola: string;
  serie: string;
  statusCarteirinha: 'Pendente' | 'Em análise' | 'Aprovado';
  rotaId: string;
  fotoUrl?: string;
}

export default function ResponsavelDashboard() {
  const router = useRouter();
  const supabase = createClient();
  
  const [userName, setUserName] = useState<string>('Responsável');
  const [loading, setLoading] = useState(true);

  // Mocks de dados dos filhos (Lei 4 - Dados tipados para fallback/desenvolvimento)
  const FILHOS_MOCK: Filho[] = [
    {
      id: 'aluno-01',
      nome: 'Thiago Martins Nogueira',
      escola: 'Escola Municipal Dorcelina Folador',
      serie: '4º Ano B',
      statusCarteirinha: 'Aprovado',
      rotaId: 'Rota 04',
      fotoUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=150&auto=format&fit=crop&q=80' // Foto simulada premium
    },
    {
      id: 'aluno-02',
      nome: 'Beatriz Martins Nogueira',
      escola: 'Colégio Estadual Julia Wanderley',
      serie: '7º Ano A',
      statusCarteirinha: 'Em análise',
      rotaId: 'Rota 22',
      fotoUrl: undefined
    }
  ];

  const [filhos, setFilhos] = useState<Filho[]>(FILHOS_MOCK);

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Busca nome do perfil associado ao ID do usuário
          const { data: perfil } = await supabase
            .from('perfis')
            .select('nome')
            .eq('id', user.id)
            .single();

          if (perfil?.nome) {
            setUserName(perfil.nome);
          } else if (user.email) {
            // Extrai nome amigável do email
            const emailName = user.email.split('@')[0];
            setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
          }
        }
      } catch (err) {
        console.log('Utilizando fallback mock do usuário responsável');
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [supabase]);

  const getStatusBadgeClass = (status: Filho['statusCarteirinha']) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Em análise':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pendente':
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status: Filho['statusCarteirinha']) => {
    switch (status) {
      case 'Aprovado':
        return <CheckCircle size={13} />;
      case 'Em análise':
        return <Clock size={13} />;
      case 'Pendente':
      default:
        return <AlertCircle size={13} />;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Bloco de Boas-Vindas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 text-slate-800/20 pointer-events-none">
          <User size={120} />
        </div>
        <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest">
          Painel de Controle Familiar
        </span>
        <h2 className="text-xl font-black mt-1">
          Olá, {userName}!
        </h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Acompanhe o transporte escolar de seus filhos e faça o envio de novos documentos.
        </p>
      </div>

      {/* Cards dos Filhos */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Estudantes Vinculados ({filhos.length})
        </h3>

        {filhos.map((filho) => (
          <div 
            key={filho.id} 
            className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Linha Principal (Foto + Detalhes + Status) */}
            <div className="flex gap-3">
              {/* Foto 3x4 / Avatar */}
              <div className="w-16 h-20 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden flex items-center justify-center shrink-0">
                {filho.fotoUrl ? (
                  <img 
                    src={filho.fotoUrl} 
                    alt={filho.nome} 
                    className="w-full h-full object-cover" 
                  />
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
                
                <h4 className="text-sm font-bold text-slate-900 truncate mt-1.5">
                  {filho.nome}
                </h4>
                
                <span className="text-xs text-slate-500 mt-0.5 truncate">
                  {filho.escola}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {filho.serie} · {filho.rotaId}
                </span>
              </div>
            </div>

            {/* Ações Rápidas do Filho */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <button
                onClick={() => router.push(`/responsavel/documentos?alunoId=${filho.id}`)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200/40"
              >
                <UploadCloud size={14} />
                <span>Documentos</span>
              </button>

              <button
                onClick={() => router.push(`/responsavel/rastreio/${filho.rotaId}`)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
              >
                <MapPin size={14} />
                <span>Ver Rastreio</span>
              </button>

              {filho.statusCarteirinha === 'Aprovado' && (
                <button
                  onClick={() => router.push(`/responsavel/carteirinha/${filho.id}`)}
                  className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  <FileText size={14} className="text-amber-500" />
                  <span>Visualizar Carteirinha Digital</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Cartão Informativo SEMED */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-850 leading-relaxed flex gap-3">
        <Shield size={18} className="shrink-0 text-amber-600 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-900 mb-0.5">Importante para a liberação:</h4>
          Anexe a declaração escolar atualizada e o comprovante de residência de Arapongas. A validação cadastral é feita pela central da SEMED em até 48 horas úteis.
        </div>
      </div>
    </div>
  );
}
