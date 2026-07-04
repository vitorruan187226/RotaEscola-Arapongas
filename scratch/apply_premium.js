const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/dashboard/motorista/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Substituir Wrapper (De f4f7fb para surface light)
const wrapperStartStr = `<div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center font-sans antialiased text-[#0b1c3c] p-0 sm:p-6 md:p-8">`;
const wrapperEndStr = `{/* Moldura Celular Simulada Premium (Bank Card Style) */}`;
const wrapperStartIdx = content.indexOf(wrapperStartStr);
const wrapperEndIdx = content.indexOf(wrapperEndStr, wrapperStartIdx);

if (wrapperStartIdx !== -1 && wrapperEndIdx !== -1) {
    const newWrapperStr = `<div className="min-h-screen bg-[#f7fafc] flex items-center justify-center font-sans antialiased text-[#181c1e] p-0 sm:p-6 md:p-8">
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

      {/* Moldura Celular Simulada Premium */}
      <div className="w-full max-w-md bg-[#f7fafc] sm:shadow-[0_24px_64px_rgba(0,0,0,0.08)] flex flex-col relative min-h-screen sm:min-h-[884px] sm:rounded-[40px] overflow-hidden border border-slate-200">
        
`;
    const nextDivIdx = content.indexOf('<div className="w-full max-w-md bg-[#f4f7fb]', wrapperEndIdx);
    const endOfNextDiv = content.indexOf('border-slate-200">', nextDivIdx) + 'border-slate-200">'.length;
    
    content = content.substring(0, wrapperStartIdx) + newWrapperStr + content.substring(endOfNextDiv);
}

// 2. Substituir Header
const headerStartStr = `{/* Header Minimalista (Bank Style) */}`;
const headerEndStr = `</header>`;
const headerStartIdx = content.indexOf(headerStartStr);
const headerEndIdx = content.indexOf(headerEndStr, headerStartIdx) + headerEndStr.length;

if (headerStartIdx !== -1 && headerEndIdx > headerStartIdx) {
    const newHeaderStr = `{/* Top Navigation Bar Premium */}
        <header className="flex items-center justify-between px-6 pt-12 pb-4 w-full sticky top-0 z-40 bg-transparent">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => {
                setEditNome(perfilMotorista?.nome || '');
                setEditTelefone(perfilMotorista?.telefone || '');
                setShowPerfilModal(true);
              }}
              className="w-12 h-12 rounded-full overflow-hidden bg-[#ebeef0] border-2 border-[#d6e3ff] cursor-pointer shadow-sm active:scale-95 transition-transform flex items-center justify-center p-0.5"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                {perfilMotorista?.foto_url ? (
                  <img src={perfilMotorista.foto_url} alt={perfilMotorista.nome} className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-blue-500 mt-2 ml-2" />
                )}
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-2xl leading-tight text-[#002045]">
                Olá, {perfilMotorista?.nome ? perfilMotorista.nome.split(' ')[0] : 'Motorista'}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <div className={\`w-2 h-2 rounded-full \${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}\`}></div>
                 <p className="text-xs font-semibold text-[#74777f]">{isOnline ? 'Seja bem-vindo de volta' : 'GPS Offline'}</p>
              </div>
            </div>
          </div>
          
          <button onClick={handleLogout} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f1f4f6] transition-colors active:scale-95 text-[#002045]">
            <LogOut size={22} />
          </button>
        </header>`;
    content = content.substring(0, headerStartIdx) + newHeaderStr + content.substring(headerEndIdx);
}

// 3. Substituir Main
const mainStartStr = `<main className="relative z-10 px-6 pb-32 overflow-y-auto flex-1 scrollbar-thin flex flex-col gap-6">`;
const mainEndStr = `</main>`;
const mainStartIdx = content.indexOf(mainStartStr);
const mainEndIdx = content.indexOf(mainEndStr, mainStartIdx) + mainEndStr.length;

if (mainStartIdx !== -1 && mainEndIdx > mainStartIdx) {
    const newMainStr = `<main className="flex-grow px-6 pb-36 overflow-y-auto scrollbar-thin">
          
          {/* Alunos a Bordo & Iniciar Rota (Phase 1) */}
          {!rotaAtiva?.ativa && (
            <section className="mt-4 flex items-center justify-between mb-6 animate-fadeIn">
              <div>
                <p className="text-xs font-bold text-[#74777f] uppercase tracking-wider mb-1">Status</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#002045]">Off</span>
                </div>
              </div>
              <button
                onClick={() => handleToggleRotaAtiva(true)}
                disabled={!selectedRotaId}
                className="bg-emerald-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                Iniciar Rota
              </button>
            </section>
          )}

          {/* Alunos a Bordo & Encerrar Rota (Phase 2) */}
          {rotaAtiva?.ativa && (
            <section className="mt-4 flex items-center justify-between mb-6 animate-fadeIn">
              <div>
                <p className="text-xs font-bold text-[#74777f] uppercase tracking-wider mb-1">Alunos a Bordo</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#002045]">{alunosABordo}</span>
                  <span className="text-2xl font-bold text-[#74777f]">/{totalAlunos}</span>
                </div>
              </div>
              <button
                onClick={() => handleToggleRotaAtiva(false)}
                className="bg-rose-500 text-white font-bold px-5 py-3 rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                Encerrar
              </button>
            </section>
          )}

          {/* Main Card: Próxima Parada (Gradient Premium) */}
          <section className="mt-2">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#002045] to-[#004a8f] p-6 rounded-3xl text-white shadow-lg">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none"></div>
              
              {!rotaAtiva?.ativa ? (
                /* Configuração de Rota */
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Configuração</p>
                      <h2 className="text-xl font-bold mt-1">Aguardando Início</h2>
                    </div>
                    <Bus size={24} className="text-[#ffb55c]" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-white/10">
                      {(['Manhã', 'Tarde', 'Noite'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setSelectedTurno(t)}
                          className={\`flex-1 py-2 rounded-lg text-xs font-bold transition-all \${selectedTurno === t ? 'bg-white text-[#002045] shadow-sm' : 'text-blue-100 hover:text-white'}\`}
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
                          className={\`flex-1 py-2 rounded-lg text-xs font-bold transition-all \${selectedSentido === s ? 'bg-white text-[#002045] shadow-sm' : 'text-blue-100 hover:text-white'}\`}
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
              ) : (
                /* Viagem Ativa */
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Rota em Execução</p>
                      <h2 className="text-2xl font-bold mt-1">{rotaAtiva.codigo}</h2>
                    </div>
                    <MapPin size={24} className="text-[#ffb55c]" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-white/70" />
                      <span className="font-medium text-sm">Turno: {selectedTurno}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Navigation size={18} className="text-white/70 mt-0.5" />
                      <span className="font-medium text-sm leading-snug">Sentido: {selectedSentido === 'IDA' ? 'Ida para a Escola' : 'Volta para Casa'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Final Goal / Progress Bar */}
          {rotaAtiva?.ativa && (
            <section className="mt-4">
              <div className="bg-white p-4 rounded-2xl flex items-center justify-between border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#d6e3ff] flex items-center justify-center text-[#002045]">
                    <PieChart size={20} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#002045]">Ocupação Atual</p>
                    <p className="text-[11px] font-semibold text-[#74777f]">Meta: {totalAlunos} alunos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-[#002045]">{percentualOcupacao.toFixed(0)}%</p>
                  <div className="w-24 h-1.5 bg-[#ebeef0] rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-[#ffb55c] transition-all duration-500 rounded-full" style={{ width: \`\${percentualOcupacao}%\` }}></div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Action Grid */}
          <section className="mt-6 grid grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => document.getElementById('camera-toggle-btn')?.click()}>
              <div className="w-16 h-16 rounded-full bg-[#ebeef0] flex items-center justify-center text-[#002045] group-hover:bg-[#002045] group-hover:text-white transition-all active:scale-90">
                <QrCode size={24} />
              </div>
              <span className="text-[11px] font-bold text-[#74777f]">Leitor QR</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setShowOcorrenciaModal(true)}>
              <div className="w-16 h-16 rounded-full bg-[#ebeef0] flex items-center justify-center text-[#002045] group-hover:bg-[#002045] group-hover:text-white transition-all active:scale-90">
                <MessageSquareWarning size={24} />
              </div>
              <span className="text-[11px] font-bold text-[#74777f]">Ocorrência</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setShowMecanicoModal(true)}>
              <div className="w-16 h-16 rounded-full bg-[#ebeef0] flex items-center justify-center text-[#002045] group-hover:bg-[#002045] group-hover:text-white transition-all active:scale-90">
                <Wrench size={24} />
              </div>
              <span className="text-[11px] font-bold text-[#74777f]">Mecânico</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setShowViasModal(true)}>
              <div className="w-16 h-16 rounded-full bg-[#ebeef0] flex items-center justify-center text-[#002045] group-hover:bg-[#002045] group-hover:text-white transition-all active:scale-90">
                <Map size={24} />
              </div>
              <span className="text-[11px] font-bold text-[#74777f]">Vias</span>
            </div>
          </section>

          {/* Câmera do Scanner */}
          {rotaAtiva?.ativa && (
            <section className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 mb-6">
               <div className="flex items-center justify-between mb-3 px-1">
                 <h3 className="text-sm font-bold text-[#1a2b4c]">Câmera de Leitura</h3>
                 <button id="camera-toggle-btn" className="text-[#002045] font-bold text-[10px] uppercase bg-[#d6e3ff] px-3 py-1.5 rounded-full">Ligar</button>
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

          {/* Recent Passengers List */}
          {rotaAtiva?.ativa && (
            <section className="mt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-[#002045]">Passageiros</h3>
                <button className="text-[#875200] font-bold text-[13px] hover:underline">Ver todos</button>
              </div>
              <div className="space-y-3 pb-8">
                {rotaAtiva.alunos.map(aluno => (
                  <div
                    key={aluno.id}
                    onClick={() => cycleAlunoStatus(aluno.id)}
                    className={\`bg-white p-4 rounded-2xl flex items-center justify-between border border-slate-200 shadow-sm cursor-pointer hover:bg-[#f7fafc] transition-colors \${
                      aluno.ausenciaNotificada ? 'opacity-50 cursor-not-allowed' : ''
                    }\`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={\`w-12 h-12 rounded-full flex items-center justify-center \${
                        aluno.statusLocal === 'presente' ? 'bg-[#d6e3ff] text-[#002045]' :
                        aluno.statusLocal === 'ausente' ? 'bg-[#ffdad6] text-[#93000a]' :
                        'bg-[#ebeef0] text-[#74777f]'
                      }\`}>
                        {aluno.statusLocal === 'presente' ? (
                          <ArrowDownToLine size={24} />
                        ) : aluno.statusLocal === 'ausente' ? (
                          <ArrowUpFromLine size={24} />
                        ) : (
                          <User size={24} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[15px] text-[#002045] leading-tight mb-1">{aluno.nome}</p>
                        <p className="text-[11px] font-semibold text-[#74777f]">
                          {aluno.statusLocal === 'presente' ? 'Embarque Realizado' : aluno.statusLocal === 'ausente' ? 'Falta Registrada' : 'Aguardando embarque'}
                        </p>
                      </div>
                    </div>
                    <span className={\`font-bold text-sm \${aluno.statusLocal === 'presente' ? 'text-[#002045]' : aluno.statusLocal === 'ausente' ? 'text-[#93000a]' : 'text-[#74777f]'}\`}>
                      {aluno.statusLocal === 'presente' ? 'Confirmado' : aluno.statusLocal === 'ausente' ? 'Ausente' : '---'}
                    </span>
                  </div>
                ))}

                {(temAlteracoes || isSentSuccessfully) && (
                  <div className="pt-4">
                    <button
                      onClick={handleSendBatch}
                      disabled={loading || isSentSuccessfully}
                      className={\`w-full py-4 rounded-2xl text-[13px] font-bold uppercase transition-all flex items-center justify-center gap-2 \${
                        isSentSuccessfully ? 'bg-emerald-500 text-white' : 'bg-[#002045] text-white shadow-lg active:scale-95'
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

// 4. Substituir Menu Inferior (Bottom Nav azul sólido com FAB flutuante no canto)
const navStartStr = `{/* Bottom Navigation Bar (Solid Blue Bank Style) */}`;
const navEndStr = `</div>
      </div>
    </div>
  );`;
const navStartIdx = content.indexOf(navStartStr);
const navEndIdx = content.indexOf(navEndStr, navStartIdx);

if (navStartIdx !== -1 && navEndIdx > navStartIdx) {
    const newNavStr = `{/* Floating Action Button (FAB) SOS */}
        <button 
          onClick={() => setShowSosModal(true)}
          className="absolute bottom-28 right-6 w-14 h-14 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(225,29,72,0.4)] hover:scale-105 active:scale-95 transition-all z-40 border-2 border-white"
        >
          <AlertTriangle size={26} strokeWidth={2.5} className="animate-pulse" />
        </button>

        {/* Bottom Navigation Bar (Premium Solid Blue) */}
        <nav className="absolute bottom-0 left-0 w-full z-30 flex justify-around items-center px-4 pb-6 pt-4 bg-[#002045] shadow-lg rounded-t-3xl sm:rounded-b-[40px] border-t border-[#1a365d]">
          <button className="flex flex-col items-center justify-center bg-[#ffb55c] text-[#744600] rounded-xl px-4 py-2 active:scale-95 duration-200 transition-all shadow-inner">
            <Home size={22} className="mb-1" strokeWidth={2.5} />
            <span className="font-bold text-[10px]">Dashboard</span>
          </button>
          
          <button className="flex flex-col items-center justify-center text-white/70 hover:bg-[#1a365d]/50 rounded-xl px-4 py-2 active:scale-95 duration-200 transition-all">
            <Map size={22} className="mb-1" />
            <span className="font-bold text-[10px]">Rotas</span>
          </button>
          
          <button className="flex flex-col items-center justify-center text-white/70 hover:bg-[#1a365d]/50 rounded-xl px-4 py-2 active:scale-95 duration-200 transition-all">
            <Users size={22} className="mb-1" />
            <span className="font-bold text-[10px]">Alunos</span>
          </button>
          
          <button onClick={() => setShowPerfilModal(true)} className="flex flex-col items-center justify-center text-white/70 hover:bg-[#1a365d]/50 rounded-xl px-4 py-2 active:scale-95 duration-200 transition-all">
            <UserCircle size={22} className="mb-1" />
            <span className="font-bold text-[10px]">Perfil</span>
          </button>
        </nav>
`;
    content = content.substring(0, navStartIdx) + newNavStr + '\n' + content.substring(navEndIdx);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Layout Premium adaptado de forma segura!');
