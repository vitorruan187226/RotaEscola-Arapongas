'use client';

import { useState } from 'react';
import { Bus, Users, HelpCircle, Check, MapPin, Accessibility } from 'lucide-react';

interface Aluno {
  id: number;
  nome: string;
  escola: string;
  nee: boolean;
  tipoNee?: string;
  aBordo: boolean;
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
      { id: 1, nome: 'Lucas Lima Souza', escola: 'Esc. Dorcelina Folador', nee: false, aBordo: false },
      { id: 2, nome: 'Enzo Gabriel Silva', escola: 'Esc. Dorcelina Folador', nee: false, aBordo: false },
      { id: 3, nome: 'Ana Beatriz Silveira', escola: 'Esc. Dorcelina Folador', nee: true, tipoNee: 'Autismo', aBordo: false },
      { id: 4, nome: 'Maria Eduarda Costa', escola: 'Esc. Dorcelina Folador', nee: false, aBordo: false },
      { id: 5, nome: 'Arthur Ramos Barbosa', escola: 'Esc. Dorcelina Folador', nee: true, tipoNee: 'Cadeirante', aBordo: false },
      { id: 6, nome: 'Vitória Camargo Santos', escola: 'Esc. Dorcelina Folador', nee: false, aBordo: false },
    ]
  },
  {
    id: '2',
    codigo: 'Rota 07',
    nome: 'Região Norte / Col. Olímpia',
    placa: 'AAA-1234',
    veiculo: 'Microônibus Volare',
    alunos: [
      { id: 7, nome: 'João Pedro Santos', escola: 'Col. Olímpia', nee: false, aBordo: false },
      { id: 8, nome: 'Júlia Nogueira Melo', escola: 'Col. Olímpia', nee: false, aBordo: false },
      { id: 9, nome: 'Gustavo Reis Pinheiro', escola: 'Col. Olímpia', nee: true, tipoNee: 'D. Visual', aBordo: false },
      { id: 10, nome: 'Mariana Almeida Ortiz', escola: 'Col. Olímpia', nee: false, aBordo: false },
    ]
  },
  {
    id: '3',
    codigo: 'Rota 22',
    nome: 'Centro / Col. Julia Wanderley',
    placa: 'CCC-9012',
    veiculo: 'Van Renault Master',
    alunos: [
      { id: 11, nome: 'Pedro Henrique Lima', escola: 'Col. Julia Wanderley', nee: false, aBordo: false },
      { id: 12, nome: 'Sophia Moraes Dias', escola: 'Col. Julia Wanderley', nee: true, tipoNee: 'D. Auditiva', aBordo: false },
      { id: 13, nome: 'Thiago Barbosa Souza', escola: 'Col. Julia Wanderley', nee: false, aBordo: false },
    ]
  }
];

export default function PainelMotorista() {
  const [selectedRotaId, setSelectedRotaId] = useState(ROTAS_MOCK[0].id);
  const [rotas, setRotas] = useState<RotaConfig[]>(ROTAS_MOCK);

  // Encontra a rota ativa
  const rotaAtiva = rotas.find(r => r.id === selectedRotaId) || rotas[0];
  const totalAlunos = rotaAtiva.alunos.length;
  const alunosABordo = rotaAtiva.alunos.filter(a => a.aBordo).length;

  const toggleAlunoABordo = (alunoId: number) => {
    setRotas(prevRotas => 
      prevRotas.map(r => {
        if (r.id === selectedRotaId) {
          return {
            ...r,
            alunos: r.alunos.map(aluno => 
              aluno.id === alunoId ? { ...aluno, aBordo: !aluno.aBordo } : aluno
            )
          };
        }
        return r;
      })
    );
  };

  const handleMarcarTodos = (embarcar: boolean) => {
    setRotas(prevRotas =>
      prevRotas.map(r => {
        if (r.id === selectedRotaId) {
          return {
            ...r,
            alunos: r.alunos.map(aluno => ({ ...aluno, aBordo: embarcar }))
          };
        }
        return r;
      })
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Turno e Seletor de Viagem */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Veículo & Rota da Viagem
        </label>
        <div className="relative">
          <select
            value={selectedRotaId}
            onChange={(e) => setSelectedRotaId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-3 text-sm font-semibold text-white focus:outline-none focus:border-amber-500 appearance-none cursor-pointer pr-10"
          >
            {rotas.map(r => (
              <option key={r.id} value={r.id}>
                {r.codigo} - {r.nome} ({r.placa})
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            ▼
          </div>
        </div>

        {/* Info do Veículo Selecionado */}
        <div className="mt-3 flex items-center gap-2.5 text-xs text-slate-400">
          <Bus size={14} className="text-amber-500" />
          <span>{rotaAtiva.veiculo} — Placa <strong className="text-white font-mono">{rotaAtiva.placa}</strong></span>
        </div>
      </div>

      {/* Contador Dinâmico de Alunos */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 text-slate-800/10 pointer-events-none">
          <Users size={120} />
        </div>
        
        <div>
          <h2 className="text-xs font-extrabold text-amber-500 uppercase tracking-widest">
            Alunos a Bordo
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Controle de presença em tempo real</p>
        </div>

        <div className="text-right">
          <div className="text-4xl font-black text-white font-mono">
            {alunosABordo}<span className="text-slate-500 text-2xl">/{totalAlunos}</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
            alunosABordo === totalAlunos 
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/30' 
              : 'bg-slate-800 text-slate-400'
          }`}>
            {alunosABordo === totalAlunos ? 'Todos a bordo' : 'Em trânsito'}
          </span>
        </div>
      </div>

      {/* Checklist Digital de Passageiros */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>Passageiros Esperados</span>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
              {totalAlunos}
            </span>
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleMarcarTodos(true)}
              className="text-[11px] font-bold text-amber-500 hover:text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 transition-colors"
            >
              Embarcar Todos
            </button>
            <button
              onClick={() => handleMarcarTodos(false)}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {rotaAtiva.alunos.map((aluno) => (
            <div
              key={aluno.id}
              onClick={() => toggleAlunoABordo(aluno.id)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                aluno.aBordo
                  ? 'bg-slate-900/90 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.05)]'
                  : aluno.nee
                  ? 'bg-slate-900/60 border-amber-500/40 hover:border-amber-500/60'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox Customizado Grande para Mobile */}
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                  aluno.aBordo
                    ? 'bg-emerald-500 border-emerald-500 text-slate-950 scale-105'
                    : aluno.nee
                    ? 'border-amber-500/50 bg-amber-500/5'
                    : 'border-slate-700 bg-slate-950'
                }`}>
                  {aluno.aBordo && <Check size={16} strokeWidth={3.5} />}
                </div>

                <div className="flex flex-col">
                  <span className={`text-sm font-semibold transition-colors ${
                    aluno.aBordo ? 'text-slate-300 line-through decoration-slate-600' : 'text-white'
                  }`}>
                    {aluno.nome}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-slate-500">{aluno.escola || 'Escola'}</span>
                    
                    {/* Destaque NEE */}
                    {aluno.nee && (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        <Accessibility size={10} />
                        NEE: {aluno.tipoNee || 'Autismo'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  aluno.aBordo
                    ? 'bg-emerald-950 text-emerald-400'
                    : 'bg-slate-800/60 text-slate-500'
                }`}>
                  {aluno.aBordo ? 'A Bordo' : 'Ausente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
