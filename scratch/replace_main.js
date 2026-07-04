const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/dashboard/motorista/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Substituir bloco <main> (da tag <main ...> até </main>)
const mainStartStr = '<main className="flex-1 overflow-y-auto px-5 py-5 space-y-6 pb-36 scrollbar-thin">';
const mainEndStr = '</main>';

const mainStartIdx = content.indexOf(mainStartStr);
const mainEndIdx = content.indexOf(mainEndStr, mainStartIdx) + mainEndStr.length;

if (mainStartIdx !== -1 && mainEndIdx > mainStartIdx) {
  const newMain = `<main className="flex-1 overflow-y-auto px-5 pt-24 pb-36 scrollbar-thin relative z-10 flex flex-col gap-6">
          
          {/* FASE 1: CONFIGURAÇÃO DE ROTA */}
          {!rotaAtiva?.ativa && (
            <div className="glass w-full rounded-[2.5rem] p-6 shadow-2xl flex flex-col gap-6 mt-4 animate-fadeIn">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-[#002045] mb-1">Configurar Rota</h1>
                <p className="text-sm text-slate-500">Selecione o turno e o sentido para começar</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-[#002045] px-2">Turno</span>
                  <div className="flex p-1 bg-slate-200/50 rounded-2xl gap-1">
                    {(['Manhã', 'Tarde', 'Noite'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTurno(t)}
                        className={\`flex-1 py-3 rounded-xl text-sm font-semibold transition-all \${selectedTurno === t ? 'bg-white shadow-sm text-[#002045] active-pill' : 'text-slate-500 hover:bg-white/40'}\`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-semibold text-[#002045] px-2">Sentido</span>
                  <div className="flex p-1 bg-slate-200/50 rounded-2xl gap-1">
                    {(['IDA', 'VOLTA'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSentido(s)}
                        className={\`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 \${selectedSentido === s ? 'bg-white shadow-sm text-[#002045] active-pill' : 'text-slate-500 hover:bg-white/40'}\`}
                      >
                        {s === 'IDA' ? <><span className="material-symbols-outlined text-[18px] mr-1">school</span> Escola</> : <><span className="material-symbols-outlined text-[18px] mr-1">home</span> Residência</>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-semibold text-[#002045] px-2">Itinerário</span>
                  <div className="relative">
                    <select
                      value={selectedRotaId}
                      onChange={(e) => setSelectedRotaId(e.target.value)}
                      className="w-full bg-white/60 border border-white/40 rounded-2xl px-4 py-4 text-sm font-semibold text-[#002045] focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                      disabled={rotas.length === 0}
                    >
                      {rotas.length === 0 ? <option value="">Nenhuma rota</option> : rotas.map(r => <option key={r.id} value={r.id}>{r.codigo} - {r.nome}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleToggleRotaAtiva(true)}
                disabled={!selectedRotaId}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 h-[64px] rounded-2xl flex items-center justify-center gap-3 shadow-[0_12px_24px_-8px_rgba(16,185,129,0.5)] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="text-white font-bold tracking-widest uppercase">Iniciar Rota</span>
                <span className="material-symbols-outlined text-white text-2xl">arrow_forward_ios</span>
              </button>
            </div>
          )}

          {/* FASE 2: EM VIAGEM (Scanner e Checklist) */}
          {rotaAtiva?.ativa && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* Top Banner Em Viagem */}
              <div className="glass rounded-[2rem] p-5 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#002045]">Em Viagem</h2>
                    <p className="text-xs text-slate-500">{rotaAtiva.codigo} • {selectedTurno} • {selectedSentido === 'IDA' ? 'Ida' : 'Volta'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-[#002045] font-mono">{alunosABordo}</span>
                    <span className="text-sm text-slate-500"> / {totalAlunos}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: \`\${percentualOcupacao}%\` }} />
                </div>
                <button
                  onClick={() => handleToggleRotaAtiva(false)}
                  className="w-full py-3 mt-2 bg-rose-100 text-rose-700 font-bold rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all"
                >
                  Encerrar Viagem
                </button>
              </div>

              {/* Scanner */}
              <div className="glass rounded-3xl p-5 shadow-lg flex flex-col items-center gap-4 relative">
                <div className="text-center w-full flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#002045] uppercase tracking-widest">Leitor QR</h3>
                </div>
                <div className="relative w-full h-48 rounded-2xl bg-slate-900 overflow-hidden border-2 border-slate-800">
                  <div id="reader" className="w-full h-full absolute inset-0 z-0"></div>
                  <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_20px_#10b981] z-20 scanner-line pointer-events-none" />
                  
                  {scanState === 'success' && scannedAluno && (
                    <div className="absolute inset-0 bg-emerald-900/90 z-30 flex flex-col items-center justify-center p-4">
                      <CheckCircle2 size={32} className="text-emerald-400 mb-2" />
                      <p className="text-white font-bold text-center">{scannedAluno.nome}</p>
                      <p className="text-emerald-200 text-xs">Embarque Confirmado</p>
                    </div>
                  )}
                  {scanState === 'error' && (
                    <div className="absolute inset-0 bg-rose-900/90 z-30 flex flex-col items-center justify-center p-4">
                      <XCircle size={32} className="text-rose-400 mb-2" />
                      <p className="text-white font-bold text-center">{scanErrorMsg}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de Passageiros */}
              <div className="glass rounded-3xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-white/40 bg-white/30">
                  <h3 className="text-xs font-bold text-[#002045] uppercase tracking-widest">Passageiros ({totalAlunos})</h3>
                </div>
                <div className="divide-y divide-white/40 max-h-96 overflow-y-auto scrollbar-thin">
                  {rotaAtiva.alunos.map(aluno => (
                    <div
                      key={aluno.id}
                      onClick={() => cycleAlunoStatus(aluno.id)}
                      className={\`flex items-center justify-between p-4 transition-all cursor-pointer \${
                        aluno.ausenciaNotificada ? 'bg-rose-50/50 opacity-75 cursor-not-allowed' :
                        aluno.statusLocal === 'presente' ? 'bg-emerald-50/80 border-l-4 border-emerald-500' :
                        aluno.statusLocal === 'ausente' ? 'bg-rose-50/80 border-l-4 border-rose-500' :
                        'hover:bg-white/40'
                      }\`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={\`w-6 h-6 rounded-full flex items-center justify-center border \${
                          aluno.statusLocal === 'presente' ? 'bg-emerald-500 border-emerald-500 text-white' :
                          aluno.statusLocal === 'ausente' ? 'bg-rose-500 border-rose-500 text-white' :
                          'border-slate-300 bg-white'
                        }\`}>
                          {aluno.statusLocal === 'presente' ? <Check size={14} strokeWidth={3} /> : aluno.statusLocal === 'ausente' ? <span className="text-[10px] font-black">X</span> : null}
                        </div>
                        <div>
                          <p className={\`text-sm font-bold \${aluno.statusLocal === 'presente' ? 'text-emerald-700' : aluno.statusLocal === 'ausente' ? 'text-rose-700 line-through opacity-80' : 'text-[#002045]'}\`}>
                            {aluno.nome}
                          </p>
                          <p className="text-[10px] text-slate-500">{aluno.escola}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {(temAlteracoes || isSentSuccessfully) && (
                  <div className="p-4 bg-white/50">
                    <button
                      onClick={handleSendBatch}
                      disabled={loading || isSentSuccessfully}
                      className={\`w-full py-4 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 \${
                        isSentSuccessfully ? 'bg-emerald-600 text-white' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg active:scale-95'
                      }\`}
                    >
                      {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : isSentSuccessfully ? "Enviado!" : "Finalizar Checklist"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>`;

  content = content.substring(0, mainStartIdx) + newMain + content.substring(mainEndIdx);
}

// 2. Substituir bloco Bottom Nav
const navStartStr = '{/* MENU INFERIOR DE OCORRÊNCIAS */}';
const navEndStr = `</div>\n      </div>\n    </div>\n  );\n}`;

const navStartIdx = content.indexOf(navStartStr);
const navEndIdx = content.indexOf(navEndStr, navStartIdx);

if (navStartIdx !== -1 && navEndIdx > navStartIdx) {
  const newNav = `{/* Menu Inferior (Floating Nav Glassmorphism) */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-40">
          <div className="glass rounded-full px-4 py-2 flex justify-between items-center shadow-2xl relative">
            <div className="flex items-center justify-between w-full pr-16">
              <button className="flex flex-col items-center justify-center bg-[#002045] text-white rounded-full w-14 h-14 shadow-lg transform -translate-y-2 active:scale-90 transition-all">
                <span className="material-symbols-outlined text-white">home</span>
                <span className="text-[8px] font-bold uppercase tracking-tighter">Painel</span>
              </button>
              <button onClick={() => setShowMecanicoModal(true)} className="flex flex-col items-center justify-center text-slate-500 hover:text-[#002045] active:scale-90 px-4 transition-all bg-transparent border-0 cursor-pointer">
                <span className="material-symbols-outlined text-slate-500">build</span>
                <span className="text-[8px] font-bold uppercase tracking-tighter">Oficina</span>
              </button>
              <button onClick={() => setShowViasModal(true)} className="flex flex-col items-center justify-center text-slate-500 hover:text-[#002045] active:scale-90 px-4 transition-all bg-transparent border-0 cursor-pointer">
                <span className="material-symbols-outlined text-slate-500">map</span>
                <span className="text-[8px] font-bold uppercase tracking-tighter">Vias</span>
              </button>
            </div>
            
            <button 
              onClick={() => setShowSosModal(true)}
              className="absolute -right-2 -top-6 w-[72px] h-[72px] bg-gradient-to-br from-rose-500 to-rose-700 text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(225,29,72,0.6)] border-4 border-white active:scale-90 transition-all overflow-hidden cursor-pointer"
            >
              <div className="relative flex flex-col items-center">
                <span className="material-symbols-outlined text-white text-3xl animate-pulse">emergency_home</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-white">SOS</span>
              </div>
            </button>
          </div>
        </nav>
`;
  content = content.substring(0, navStartIdx) + newNav + '\n' + content.substring(navEndIdx);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Substituição do Main e Nav concluída.');
