const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/dashboard/motorista/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Substituir Wrapper
const wrapperStartStr = `<div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans antialiased text-slate-100 p-0 sm:p-6 md:p-8">`;
const wrapperEndStr = `{/* Moldura Celular Simulada Premium */}`;
const wrapperStartIdx = content.indexOf(wrapperStartStr);
const wrapperEndIdx = content.indexOf(wrapperEndStr, wrapperStartIdx);

if (wrapperStartIdx !== -1 && wrapperEndIdx !== -1) {
    const newWrapperStr = `<div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center font-sans antialiased text-[#0b1c3c] p-0 sm:p-6 md:p-8">
      <style jsx global>{\`
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
      \`}</style>

      {/* Moldura Celular Simulada Premium (Bank Card Style) */}
      <div className="w-full max-w-md bg-[#f4f7fb] sm:shadow-[0_24px_64px_rgba(0,0,0,0.08)] flex flex-col relative min-h-screen sm:min-h-[840px] sm:rounded-[40px] overflow-hidden border border-slate-200">
        
`;
    const nextDivIdx = content.indexOf('<div className="w-full max-w-md bg-slate-950', wrapperEndIdx);
    const endOfNextDiv = content.indexOf('border-slate-900">', nextDivIdx) + 'border-slate-900">'.length;
    
    content = content.substring(0, wrapperStartIdx) + newWrapperStr + content.substring(endOfNextDiv);
}

// 2. Substituir Header
const headerStartStr = `{/* Header com Logout e Data */}`;
const headerEndStr = `</header>`;
const headerStartIdx = content.indexOf(headerStartStr);
const headerEndIdx = content.indexOf(headerEndStr, headerStartIdx) + headerEndStr.length;

if (headerStartIdx !== -1 && headerEndIdx > headerStartIdx) {
    const newHeaderStr = `{/* Header Minimalista (Bank Style) */}
        <header className="px-6 pt-12 pb-4 flex items-center justify-between z-10 bg-transparent">
          <div className="flex flex-col">
            <h1 className="font-extrabold text-2xl text-[#1a2b4c] leading-tight">
              Olá, {perfilMotorista?.nome ? perfilMotorista.nome.split(' ')[0] : 'Motorista'}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={\`w-2 h-2 rounded-full \${isOnline ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}\`}></div>
              <p className="text-sm text-slate-500 font-medium">{isOnline ? 'GPS Online' : 'GPS Offline'}</p>
            </div>
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
        </header>`;
    content = content.substring(0, headerStartIdx) + newHeaderStr + content.substring(headerEndIdx);
}

// 3. Substituir Main
const mainStartStr = `<main className="flex-1 overflow-y-auto px-5 py-5 space-y-6 pb-36 scrollbar-thin">`;
const mainEndStr = `</main>`;
const mainStartIdx = content.indexOf(mainStartStr);
const mainEndIdx = content.indexOf(mainEndStr, mainStartIdx) + mainEndStr.length;

if (mainStartIdx !== -1 && mainEndIdx > mainStartIdx) {
    const newMainStr = `<main className="relative z-10 px-6 pb-32 overflow-y-auto flex-1 scrollbar-thin flex flex-col gap-6">
          
          {/* Fase 1: Cartão Azul de Configuração (Credit Card Style) */}
          {!rotaAtiva?.ativa && (
            <section className="animate-fadeIn mt-2">
              <div className="flex justify-between items-end mb-4 px-1">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Status do Veículo</p>
                  <p className="text-2xl font-black text-[#1a2b4c]">Aguardando Rota</p>
                </div>
              </div>

              {/* O "Cartão de Crédito" Azul */}
              <div className="w-full rounded-[1.5rem] p-6 shadow-[0_12px_32px_rgba(29,78,216,0.25)] bg-gradient-to-br from-blue-600 via-blue-700 to-[#1e3a8a] relative overflow-hidden flex flex-col gap-6">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -left-4 bottom-4 w-24 h-24 bg-blue-400/20 rounded-full blur-xl pointer-events-none"></div>
                
                <div className="flex justify-between items-start relative z-10">
                  <span className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Configuração</span>
                  <Bus size={20} className="text-white/80" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-white/10">
                    {(['Manhã', 'Tarde', 'Noite'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTurno(t)}
                        className={\`flex-1 py-2 rounded-lg text-xs font-bold transition-all \${selectedTurno === t ? 'bg-white text-blue-800 shadow-sm' : 'text-blue-100 hover:text-white'}\`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-white/10">
                    {(['IDA', 'VOLTA'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSentido(s)}
                        className={\`flex-1 py-2 rounded-lg text-xs font-bold transition-all \${selectedSentido === s ? 'bg-white text-blue-800 shadow-sm' : 'text-blue-100 hover:text-white'}\`}
                      >
                        {s === 'IDA' ? 'Ida (Escola)' : 'Volta (Casa)'}
                      </button>
                    ))}
                  </div>

                  <select
                    value={selectedRotaId}
                    onChange={(e) => setSelectedRotaId(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-white/50 appearance-none backdrop-blur-sm"
                    disabled={rotas.length === 0}
                  >
                    {rotas.length === 0 ? <option value="">Nenhuma rota carregada</option> : rotas.map(r => <option key={r.id} value={r.id} className="text-slate-900">{r.codigo} - {r.nome}</option>)}
                  </select>
                </div>
              </div>

              {/* Botão Principal Embaixo do Cartão (Simulando o 'Add Card') */}
              <button
                onClick={() => handleToggleRotaAtiva(true)}
                disabled={!selectedRotaId}
                className="w-full mt-4 bg-[#1a2b4c] hover:bg-[#111e38] disabled:opacity-50 text-white py-4 rounded-2xl flex justify-center items-center gap-2 shadow-[0_8px_16px_rgba(26,43,76,0.15)] active:scale-95 transition-all"
              >
                <span className="font-bold text-sm uppercase tracking-wider">Iniciar Operação</span>
              </button>
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
                  <div className="w-8 h-5 flex gap-1 items-center justify-end">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80 -ml-2"></div>
                  </div>
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
                    <div className="h-full bg-white transition-all duration-500 rounded-full" style={{ width: \`\${percentualOcupacao}%\` }} />
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

          {/* Quick Actions (Ações Rápidas em Grid Circular) */}
          <section className="grid grid-cols-4 gap-2 mb-6">
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => document.getElementById('camera-toggle-btn')?.click()}>
              <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 group-active:scale-90 transition-all shadow-sm">
                <QrCode size={22} />
              </div>
              <span className="text-[10px] font-bold text-slate-500">Scanner</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setShowOcorrenciaModal(true)}>
              <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 group-active:scale-90 transition-all shadow-sm">
                <MessageSquareWarning size={22} />
              </div>
              <span className="text-[10px] font-bold text-slate-500">Ocorrência</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setShowMecanicoModal(true)}>
              <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 group-active:scale-90 transition-all shadow-sm">
                <Wrench size={22} />
              </div>
              <span className="text-[10px] font-bold text-slate-500">Mecânico</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setShowViasModal(true)}>
              <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 group-active:scale-90 transition-all shadow-sm">
                <Map size={22} />
              </div>
              <span className="text-[10px] font-bold text-slate-500">Vias</span>
            </div>
          </section>

          {/* Câmera do Scanner */}
          {rotaAtiva?.ativa && (
            <section className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-6">
               <div className="flex items-center justify-between mb-3 px-1">
                 <h3 className="text-sm font-bold text-[#1a2b4c]">Câmera de Leitura</h3>
                 <button id="camera-toggle-btn" className="text-blue-700 font-bold text-[10px] uppercase bg-blue-50 px-3 py-1.5 rounded-full">Ligar</button>
               </div>
               <div className="relative w-full h-40 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
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
                    className={\`flex items-center justify-between p-3.5 bg-white rounded-2xl shadow-sm border border-slate-100 active:bg-slate-50 transition-colors cursor-pointer \${
                      aluno.ausenciaNotificada ? 'opacity-50 cursor-not-allowed' : ''
                    }\`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={\`w-12 h-12 rounded-full flex items-center justify-center \${
                        aluno.statusLocal === 'presente' ? 'bg-emerald-50 text-emerald-600' :
                        aluno.statusLocal === 'ausente' ? 'bg-rose-50 text-rose-600' :
                        'bg-slate-50 text-slate-400'
                      }\`}>
                        {aluno.statusLocal === 'presente' ? (
                          <ArrowDownToLine size={20} strokeWidth={2.5} />
                        ) : aluno.statusLocal === 'ausente' ? (
                          <ArrowUpFromLine size={20} strokeWidth={2.5} />
                        ) : (
                          <User size={20} strokeWidth={2.5} />
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-extrabold text-[#1a2b4c] leading-tight mb-0.5">{aluno.nome}</p>
                        <p className="text-[10px] font-semibold text-slate-400">
                          {aluno.statusLocal === 'presente' ? 'Embarque Realizado' : aluno.statusLocal === 'ausente' ? 'Faltou ao embarque' : 'Aguardando'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className={\`text-xs font-bold \${aluno.statusLocal === 'presente' ? 'text-emerald-600' : aluno.statusLocal === 'ausente' ? 'text-rose-600' : 'text-slate-400'}\`}>
                         {aluno.statusLocal === 'presente' ? '+1' : aluno.statusLocal === 'ausente' ? '-1' : '0'}
                       </p>
                    </div>
                  </div>
                ))}

                {(temAlteracoes || isSentSuccessfully) && (
                  <div className="pt-4">
                    <button
                      onClick={handleSendBatch}
                      disabled={loading || isSentSuccessfully}
                      className={\`w-full py-4 rounded-2xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 \${
                        isSentSuccessfully ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] active:scale-95'
                      }\`}
                    >
                      {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : isSentSuccessfully ? "Sincronizado" : "Sincronizar Relatório"}
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>`;
    content = content.substring(0, mainStartIdx) + newMainStr + content.substring(mainEndIdx);
}

// 4. Substituir Menu Inferior (Bottom Nav azul sólido com botão circular no meio)
const navStartStr = `{/* MENU INFERIOR DE OCORRÊNCIAS */}`;
const navEndStr = `</div>
      </div>
    </div>
  );`;
const navStartIdx = content.indexOf(navStartStr);
const navEndIdx = content.indexOf(navEndStr, navStartIdx);

if (navStartIdx !== -1 && navEndIdx > navStartIdx) {
    const newNavStr = `{/* Bottom Navigation Bar (Solid Blue Bank Style) */}
        <nav className="absolute bottom-0 left-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-blue-700 shadow-[0_-8px_32px_rgba(29,78,216,0.3)] rounded-b-[40px] sm:rounded-b-[40px] rounded-t-3xl border-t border-blue-600">
          
          <div className="flex gap-8">
             <div className="flex flex-col items-center justify-center text-white font-bold cursor-pointer">
               <Home size={22} className="mb-1" strokeWidth={2.5} />
             </div>
             <div className="flex flex-col items-center justify-center text-blue-300 hover:text-white cursor-pointer transition-colors">
               <BarChart2 size={22} className="mb-1" strokeWidth={2.5} />
             </div>
          </div>

          {/* O Botão Central Flutuante (SOS) */}
          <div className="absolute left-1/2 -top-6 -translate-x-1/2">
             <div 
               onClick={() => setShowSosModal(true)}
               className="w-16 h-16 rounded-full bg-white p-1 shadow-lg shadow-blue-900/20"
             >
               <div className="w-full h-full bg-rose-500 rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform shadow-inner text-white">
                 <AlertTriangle size={26} strokeWidth={2.5} className="animate-pulse" />
               </div>
             </div>
          </div>

          <div className="flex gap-8">
             <div className="flex flex-col items-center justify-center text-blue-300 hover:text-white cursor-pointer transition-colors">
               <Wallet size={22} className="mb-1" strokeWidth={2.5} />
             </div>
             <div onClick={() => setShowPerfilModal(true)} className="flex flex-col items-center justify-center text-blue-300 hover:text-white cursor-pointer transition-colors">
               <UserCircle size={22} className="mb-1" strokeWidth={2.5} />
             </div>
          </div>
          
        </nav>
`;
    content = content.substring(0, navStartIdx) + newNavStr + '\n' + content.substring(navEndIdx);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Layout Bank Card adaptado de forma segura!');
