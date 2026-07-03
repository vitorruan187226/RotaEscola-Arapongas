import { Dispatch, SetStateAction } from 'react';

interface Rota {
  id: string;
  codigo: string;
  nome: string;
  [key: string]: any;
}

interface RotaAtiva {
  ativa?: boolean;
  placa?: string;
  veiculo?: string;
  [key: string]: any;
}

interface RotaStatusBarProps {
  rotaAtiva?: RotaAtiva;
  rotas: Rota[];
  handleToggleRotaAtiva: (status: boolean) => void;
  selectedTurno: string;
  setSelectedTurno: Dispatch<SetStateAction<string>>;
  selectedSentido: string;
  setSelectedSentido: Dispatch<SetStateAction<string>>;
  selectedRotaId: string;
  setSelectedRotaId: Dispatch<SetStateAction<string>>;
  alunosABordo: number;
  totalAlunos: number;
  percentualOcupacao: number;
}

export function RotaStatusBar({
  rotaAtiva,
  rotas,
  handleToggleRotaAtiva,
  selectedTurno,
  setSelectedTurno,
  selectedSentido,
  setSelectedSentido,
  selectedRotaId,
  setSelectedRotaId,
  alunosABordo,
  totalAlunos,
  percentualOcupacao
}: RotaStatusBarProps) {
  return (
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
          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 relative border-0 cursor-pointer active-press ${
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
              className={`py-2 rounded-lg text-[10px] font-bold tracking-wide transition-all border-0 active-press ${
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
              className={`py-2 rounded-lg text-[10px] font-bold tracking-wide transition-all border-0 active-press ${
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
  );
}
