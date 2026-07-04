import { Play, Apple } from 'lucide-react';

export function SuporteSection() {
  return (
    <section className="py-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="bg-primary rounded-[3rem] p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0 0 L100 100 M100 0 L0 100" stroke="white" strokeWidth="0.1"></path>
            </svg>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para dar mais segurança aos seus filhos?</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
              Junte-se a centenas de famílias em Arapongas que já confiam na Rota Escola.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              
              {/* Store Badge Mockups */}
              <div className="cursor-pointer bg-slate-900 rounded-xl px-6 py-3 flex items-center gap-3 border border-slate-700 hover:bg-slate-800 transition-colors">
                <Play className="text-white w-8 h-8 fill-white" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold leading-none opacity-70">Disponível no</p>
                  <p className="text-lg font-bold leading-none mt-1">Google Play</p>
                </div>
              </div>
              
              <div className="cursor-pointer bg-slate-900 rounded-xl px-6 py-3 flex items-center gap-3 border border-slate-700 hover:bg-slate-800 transition-colors">
                <Apple className="text-white w-8 h-8 fill-white" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold leading-none opacity-70">Baixar na</p>
                  <p className="text-lg font-bold leading-none mt-1">App Store</p>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
