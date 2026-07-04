import { UserPlus, Settings, ShieldCheck } from 'lucide-react';

export function CtaBannerSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
        <h3 className="text-3xl md:text-4xl font-bold text-primary mb-12">Simples como deve ser</h3>
        <div className="flex flex-col md:flex-row gap-12 items-center justify-center relative">
          
          {/* Step 1 */}
          <div className="flex-1 max-w-xs relative z-10">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 text-primary relative">
              <UserPlus className="w-10 h-10" />
              <span className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-primary rounded-full flex items-center justify-center font-bold">1</span>
            </div>
            <h5 className="text-2xl font-bold text-primary mb-2">Cadastre-se</h5>
            <p className="text-slate-600">Crie sua conta em minutos e adicione as informações dos seus filhos.</p>
          </div>
          
          {/* Line Divider (Desktop) */}
          <div className="hidden md:block flex-shrink-0 w-24 h-px bg-slate-300 relative -top-8"></div>
          
          {/* Step 2 */}
          <div className="flex-1 max-w-xs relative z-10">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 text-primary relative">
              <Settings className="w-10 h-10" />
              <span className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-primary rounded-full flex items-center justify-center font-bold">2</span>
            </div>
            <h5 className="text-2xl font-bold text-primary mb-2">Vincule a Rota</h5>
            <p className="text-slate-600">Encontre o motorista da sua região ou convide o seu atual para a plataforma.</p>
          </div>
          
          {/* Line Divider (Desktop) */}
          <div className="hidden md:block flex-shrink-0 w-24 h-px bg-slate-300 relative -top-8"></div>
          
          {/* Step 3 */}
          <div className="flex-1 max-w-xs relative z-10">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 text-primary relative">
              <ShieldCheck className="w-10 h-10" />
              <span className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-primary rounded-full flex items-center justify-center font-bold">3</span>
            </div>
            <h5 className="text-2xl font-bold text-primary mb-2">Viaje Tranquilo</h5>
            <p className="text-slate-600">Acompanhe tudo pelo celular e receba alertas de cada etapa do transporte.</p>
          </div>
          
        </div>
      </div>
    </section>
  );
}
