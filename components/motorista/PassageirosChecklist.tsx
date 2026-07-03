import { Lock, Check, Accessibility, MapPin, Navigation, User } from 'lucide-react';

interface Aluno {
  id: number | string;
  nome: string;
  escola: string;
  statusLocal: string;
  ausenciaNotificada?: boolean;
  nee?: boolean;
  tipoNee?: string;
  endereco?: string;
  fotoUrl?: string;
  [key: string]: any;
}

interface RotaAtiva {
  ativa?: boolean;
  alunos: Aluno[];
  [key: string]: any;
}

interface PassageirosChecklistProps {
  loading: boolean;
  rotaAtiva?: RotaAtiva;
  rotas: any[];
  cycleAlunoStatus: (id: string | number) => void;
  temAlteracoes: boolean;
  isSentSuccessfully: boolean;
  handleSendBatch: () => void;
}

export function PassageirosChecklist({
  loading,
  rotaAtiva,
  rotas,
  cycleAlunoStatus,
  temAlteracoes,
  isSentSuccessfully,
  handleSendBatch
}: PassageirosChecklistProps) {
  return (
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
            rotaAtiva.alunos.map((aluno, index) => (
            <div
              key={aluno.id}
              onClick={() => cycleAlunoStatus(aluno.id)}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`flex items-center justify-between p-4 transition-all duration-200 select-none animate-slide-up ${
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
                  {aluno.endereco && (
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5 leading-snug">
                      <MapPin size={10} className="shrink-0 text-slate-500" />
                      <span className="truncate max-w-[200px]" title={aluno.endereco}>{aluno.endereco}</span>
                    </div>
                  )}
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
            className={`w-full py-4 px-6 rounded-2xl text-[10px] font-extrabold tracking-widest uppercase transition-all transform border-0 flex items-center justify-center gap-2 active-press ${
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
  );
}
