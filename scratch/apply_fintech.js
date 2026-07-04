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
    const newWrapperStr = `<div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans antialiased text-slate-900 p-0 sm:p-6 md:p-8">
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

      {/* Moldura Celular Simulada Premium (Fintech Style) */}
      <div className="w-full max-w-md bg-slate-50 sm:shadow-[0_24px_64px_rgba(0,0,0,0.1)] flex flex-col relative min-h-screen sm:min-h-[840px] sm:rounded-[36px] overflow-hidden border border-slate-200">
        
`;
    // Skip to next div after 'Moldura Celular Simulada Premium'
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
    const newHeaderStr = `{/* Header Azul (Fintech) */}
        <header className="bg-[#002045] rounded-b-[2.5rem] h-56 w-full shadow-md absolute top-0 left-0 z-0 flex flex-col">
          <div className="flex justify-between items-start px-5 pt-8 w-full">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => {
                  setEditNome(perfilMotorista?.nome || '');
                  setEditTelefone(perfilMotorista?.telefone || '');
                  setShowPerfilModal(true);
                }}
                className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm cursor-pointer active:scale-95 transition-transform bg-white flex items-center justify-center"
              >
                {perfilMotorista?.foto_url ? (
                  <img src={perfilMotorista.foto_url} alt={perfilMotorista.nome} className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-slate-400" />
                )}
              </div>
              <div className="flex flex-col">
                <h1 className="font-bold text-lg text-white leading-tight">
                  {perfilMotorista?.nome ? perfilMotorista.nome.split(' ')[0] : 'Motorista'}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={\`w-2 h-2 rounded-full \${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}\`}></div>
                  <p className="text-xs text-blue-200 font-semibold">{isOnline ? 'GPS Online' : 'Offline'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={handleLogout} className="text-white hover:opacity-80 active:scale-95 transition-all p-1">
                <LogOut size={22} />
              </button>
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
    const newMainStr = `<main className="relative z-10 pt-32 px-5 pb-32 overflow-y-auto flex-1 scrollbar-thin">
          
          {/* Cartão Sobreposto (Fase de Configuração) */}
          {!rotaAtiva?.ativa && (
            <section className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] mb-8 animate-fadeIn">
              <div className="flex flex-col items-center text-center">
                <p className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-widest">Configurar Viagem</p>
                
                <div className="w-full space-y-4 mb-6">
                  <div className="bg-slate-50 p-1.5 rounded-2xl flex border border-slate-100">
                    {(['Manhã', 'Tarde', 'Noite'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTurno(t)}
                        className={\`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all \${selectedTurno === t ? 'bg-white shadow-sm text-[#002045]' : 'text-slate-400 hover:text-slate-600'}\`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-50 p-1.5 rounded-2xl flex border border-slate-100">
                    {(['IDA', 'VOLTA'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSentido(s)}
                        className={\`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all \${selectedSentido === s ? 'bg-white shadow-sm text-[#002045]' : 'text-slate-400 hover:text-slate-600'}\`}
                      >
                        {s === 'IDA' ? 'Ida (Escola)' : 'Volta (Casa)'}
                      </button>
                    ))}
                  </div>

                  <select
                    value={selectedRotaId}
                    onChange={(e) => setSelectedRotaId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-[#002045] focus:outline-none focus:border-blue-400 appearance-none text-center"
                    disabled={rotas.length === 0}
                  >
                    {rotas.length === 0 ? <option value="">Nenhuma rota</option> : rotas.map(r => <option key={r.id} value={r.id}>{r.codigo} - {r.nome}</option>)}
                  </select>
                </div>

                <button
                  onClick={() => handleToggleRotaAtiva(true)}
                  disabled={!selectedRotaId}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-4 rounded-2xl flex justify-center items-center gap-2 shadow-[0_8px_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  <span className="font-bold text-sm uppercase tracking-wider">Iniciar Rota</span>
                </button>
              </div>
            </section>
          )}

          {/* Cartão Sobreposto (Fase de Viagem) */}
          {rotaAtiva?.ativa && (
            <section className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] mb-6 animate-fadeIn">
              <div className="flex flex-col items-center text-center relative">
                
                <p className="text-sm font-semibold text-slate-500 mb-1">Alunos a Bordo</p>
                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-5xl font-extrabold text-[#002045] tracking-tighter">{alunosABordo}</span>
                  <span className="text-2xl font-bold text-slate-400">/ {totalAlunos}</span>
                </div>
                
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: \`\${percentualOcupacao}%\` }} />
                </div>

                <button
                  onClick={() => handleToggleRotaAtiva(false)}
                  className="w-full bg-rose-50 text-rose-600 border border-rose-100 py-3.5 rounded-2xl flex justify-center items-center gap-2 active:scale-95 transition-all font-bold text-sm uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>stop</span>
                  Encerrar Viagem
                </button>
              </div>
            </section>
          )}

          {/* Quick Actions Grid */}
          <section className="grid grid-cols-4 gap-3 mb-8">
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => document.getElementById('camera-toggle-btn')?.click()}>
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-active:scale-90 transition-all shadow-sm">
                <span className="material-symbols-outlined text-[26px]">qr_code_scanner</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-600">Leitor QR</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setShowOcorrenciaModal(true)}>
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-active:scale-90 transition-all shadow-sm">
                <span className="material-symbols-outlined text-[26px]">warning</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-600">Alunos</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setShowMecanicoModal(true)}>
              <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 group-active:scale-90 transition-all shadow-sm">
                <span className="material-symbols-outlined text-[26px]">handyman</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-600">Mecânico</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setShowViasModal(true)}>
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-active:scale-90 transition-all shadow-sm">
                <span className="material-symbols-outlined text-[26px]">map</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-600">Vias</span>
            </div>
          </section>

          {/* Câmera do Scanner (Oculta por padrão no novo layout, mas ativa em rota) */}
          {rotaAtiva?.ativa && (
            <section className="bg-white rounded-[1.5rem] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-6 border border-slate-100">
               <div className="flex items-center justify-between mb-3 px-2">
                 <h3 className="text-sm font-bold text-slate-800">Câmera</h3>
                 <button id="camera-toggle-btn" className="text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1 rounded-full">Ativar</button>
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

          {/* Passenger List (Transactions Style) */}
          {rotaAtiva?.ativa && (
            <section>
              <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-lg font-extrabold text-slate-800">Passageiros</h2>
                <span className="text-sm font-bold text-blue-600">{totalAlunos} Total</span>
              </div>
              <div className="space-y-3 pb-8">
                {rotaAtiva.alunos.map(aluno => (
                  <div
                    key={aluno.id}
                    onClick={() => cycleAlunoStatus(aluno.id)}
                    className={\`flex items-center justify-between p-4 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 active:bg-slate-50 transition-colors cursor-pointer \${
                      aluno.ausenciaNotificada ? 'opacity-50 cursor-not-allowed' : ''
                    }\`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={\`w-11 h-11 rounded-full flex items-center justify-center \${
                        aluno.statusLocal === 'presente' ? 'bg-emerald-100 text-emerald-700' :
                        aluno.statusLocal === 'ausente' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-500'
                      }\`}>
                        {aluno.statusLocal === 'presente' ? (
                          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        ) : aluno.statusLocal === 'ausente' ? (
                          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                        ) : (
                          <span className="material-symbols-outlined text-[20px]">person</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1a1c1e]">{aluno.nome}</p>
                        <p className="text-xs font-medium text-slate-400">
                          {aluno.statusLocal === 'presente' ? 'Embarque Realizado' : aluno.statusLocal === 'ausente' ? 'Faltou ao embarque' : 'Aguardando'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {(temAlteracoes || isSentSuccessfully) && (
                  <div className="pt-4">
                    <button
                      onClick={handleSendBatch}
                      disabled={loading || isSentSuccessfully}
                      className={\`w-full py-4 rounded-2xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 \${
                        isSentSuccessfully ? 'bg-emerald-500 text-white' : 'bg-[#002045] text-white shadow-[0_8px_20px_rgba(0,32,69,0.25)] active:scale-95'
                      }\`}
                    >
                      {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : isSentSuccessfully ? "Enviado!" : "Sincronizar Relatório"}
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>`;
    content = content.substring(0, mainStartIdx) + newMainStr + content.substring(mainEndIdx);
}

// 4. Substituir Menu Inferior
const navStartStr = `{/* MENU INFERIOR DE OCORRÊNCIAS */}`;
const navEndStr = `</div>
      </div>
    </div>
  );`;
const navStartIdx = content.indexOf(navStartStr);
const navEndIdx = content.indexOf(navEndStr, navStartIdx);

if (navStartIdx !== -1 && navEndIdx > navStartIdx) {
    const newNavStr = `{/* Bottom Navigation Bar (Fintech Style) */}
        <nav className="absolute bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.04)] rounded-b-[36px] border-t border-slate-100">
          <div className="flex flex-col items-center justify-center text-blue-600 font-bold active:scale-90 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
            <span className="text-[10px] mt-1 relative after:content-[''] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-blue-600 after:rounded-full">Painel</span>
          </div>
          <div onClick={() => setShowOcorrenciaModal(true)} className="flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 active:scale-90 transition-all px-4 py-2 cursor-pointer">
            <span className="material-symbols-outlined text-[26px]">chat</span>
            <span className="text-[10px] font-semibold mt-1">Alertas</span>
          </div>
          <div onClick={() => {
                setEditNome(perfilMotorista?.nome || '');
                setEditTelefone(perfilMotorista?.telefone || '');
                setShowPerfilModal(true);
              }} className="flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 active:scale-90 transition-all px-4 py-2 cursor-pointer">
            <span className="material-symbols-outlined text-[26px]">settings</span>
            <span className="text-[10px] font-semibold mt-1">Ajustes</span>
          </div>
          
          <div onClick={() => setShowSosModal(true)} className="flex flex-col items-center justify-center text-rose-500 active:scale-90 transition-all px-4 py-2 cursor-pointer">
            <span className="material-symbols-outlined text-[30px] animate-pulse">emergency_home</span>
            <span className="text-[10px] font-bold mt-1 text-rose-500">SOS</span>
          </div>
        </nav>
`;
    content = content.substring(0, navStartIdx) + newNavStr + '\n' + content.substring(navEndIdx);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Layout Fintech adaptado de forma segura!');
