import { MapPin, BellRing, History } from 'lucide-react';

export function BeneficiosSection() {
  return (
    <section className="py-16 md:py-24 bg-slate-50" id="vantagens">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h3 className="text-3xl md:text-4xl font-bold text-primary mb-2">Para os Pais</h3>
            <p className="text-base text-slate-600">
              Controle total na palma da sua mão para garantir que o seu bem mais precioso esteja sempre seguro.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: Real-time */}
          <div className="bg-white/95 backdrop-blur-md border border-slate-100 p-8 rounded-2xl hover:shadow-xl transition-shadow group">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MapPin className="text-primary-700 w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-primary mb-2">Rastreamento Real</h4>
            <p className="text-slate-600 opacity-90 text-sm md:text-base">
              Veja a localização exata do ônibus no mapa durante todo o trajeto, da saída até a chegada na escola.
            </p>
          </div>
          
          {/* Feature 2: Notifications */}
          <div className="bg-white/95 backdrop-blur-md border border-slate-100 p-8 rounded-2xl hover:shadow-xl transition-shadow group">
            <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BellRing className="text-accent-700 w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-primary mb-2">Avisos de Chegada</h4>
            <p className="text-slate-600 opacity-90 text-sm md:text-base">
              Receba notificações instantâneas quando o motorista estiver a 5 minutos da sua casa e quando as crianças chegarem à escola.
            </p>
          </div>
          
          {/* Feature 3: History */}
          <div className="bg-white/95 backdrop-blur-md border border-slate-100 p-8 rounded-2xl hover:shadow-xl transition-shadow group">
            <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <History className="text-primary w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-primary mb-2">Histórico Seguro</h4>
            <p className="text-slate-600 opacity-90 text-sm md:text-base">
              Acesse o log completo de horários e rotas percorridas nos últimos 30 dias para total transparência.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
