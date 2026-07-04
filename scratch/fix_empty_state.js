const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/dashboard/motorista/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const startStr = `{/* Alunos a Bordo & Iniciar Rota (Phase 1) */}`;
const endStr = `/* Viagem Ativa */`;

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const newContent = `{/* Configuração Inicial (Phase 1) */}
          {!rotaAtiva?.ativa && (
            <section className="mt-2 animate-fadeIn">
              <div className="mb-6 px-1">
                <h2 className="text-2xl font-extrabold text-[#002045]">Preparar Viagem</h2>
                <p className="text-sm text-[#74777f] mt-1">Configure os detalhes antes de iniciar sua rota.</p>
              </div>

              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 flex flex-col gap-6 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="relative z-10 space-y-6">
                  {/* Turno */}
                  <div>
                    <label className="text-xs font-bold text-[#74777f] uppercase tracking-wider mb-2 block">Turno</label>
                    <div className="flex bg-[#f1f4f6] p-1.5 rounded-2xl">
                      {(['Manhã', 'Tarde', 'Noite'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setSelectedTurno(t)}
                          className={\`flex-1 py-3 rounded-xl text-[13px] font-bold transition-all shadow-sm \${selectedTurno === t ? 'bg-white text-[#002045]' : 'text-[#74777f] shadow-none hover:text-[#002045]'}\`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sentido */}
                  <div>
                    <label className="text-xs font-bold text-[#74777f] uppercase tracking-wider mb-2 block">Sentido</label>
                    <div className="flex bg-[#f1f4f6] p-1.5 rounded-2xl">
                      {(['IDA', 'VOLTA'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedSentido(s)}
                          className={\`flex-1 py-3 rounded-xl text-[13px] font-bold transition-all shadow-sm \${selectedSentido === s ? 'bg-white text-[#002045]' : 'text-[#74777f] shadow-none hover:text-[#002045]'}\`}
                        >
                          {s === 'IDA' ? 'Ida (Escola)' : 'Volta (Casa)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Linha / Rota */}
                  <div>
                    <label className="text-xs font-bold text-[#74777f] uppercase tracking-wider mb-2 block">Linha de Ônibus</label>
                    <div className="relative">
                      <select
                        value={selectedRotaId}
                        onChange={(e) => setSelectedRotaId(e.target.value)}
                        className="w-full bg-[#f7fafc] border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-extrabold text-[#002045] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all"
                        disabled={rotas.length === 0}
                      >
                        {rotas.length === 0 ? <option value="">Nenhuma rota carregada</option> : rotas.map(r => <option key={r.id} value={r.id}>{r.codigo} - {r.nome}</option>)}
                      </select>
                      <Bus size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#74777f]" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronRight size={18} className="text-[#74777f] rotate-90" />
                      </div>
                    </div>
                  </div>

                  {/* Botão de Iniciar */}
                  <button
                    onClick={() => handleToggleRotaAtiva(true)}
                    disabled={!selectedRotaId}
                    className="w-full mt-2 bg-emerald-600 disabled:opacity-50 disabled:scale-100 text-white font-extrabold text-[15px] py-4 rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all shadow-[0_8px_20px_rgba(5,150,105,0.25)] flex items-center justify-center gap-2"
                  >
                    Iniciar Operação
                  </button>
                </div>
              </div>
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
                className="bg-rose-500 text-white font-bold px-5 py-3 rounded-2xl hover:bg-rose-600 active:scale-95 transition-all shadow-[0_8px_20px_rgba(244,63,94,0.25)]"
              >
                Encerrar
              </button>
            </section>
          )}

          {/* Main Card: Próxima Parada (Gradient Premium) */}
          {rotaAtiva?.ativa && (
            <section className="mt-2 animate-fadeIn">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#002045] to-[#004a8f] p-6 rounded-[2rem] text-white shadow-lg">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none"></div>
                
                `;
    
    content = content.substring(0, startIdx) + newContent + content.substring(endIdx);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fase 1 corrigida com sucesso!');
} else {
    console.log('Não encontrou os blocos de substituição.');
}
