import Link from 'next/link';
import { CheckCircle, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RecursosSection() {
  return (
    <section className="py-16 md:py-24 bg-slate-100" id="recursos">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Bento Card */}
          <div className="col-span-12 md:col-span-8 bg-primary rounded-[2rem] p-8 md:p-12 text-white overflow-hidden relative min-h-[400px] flex flex-col justify-end">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
              style={{ backgroundImage: "url('/images/landing/dashboard-mockup.jpg')" }}
            ></div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Gestão Eficiente para Motoristas</h3>
              <p className="text-lg text-slate-300 max-w-xl mb-8">
                Nossa tecnologia automatiza suas rotas e a gestão de passageiros, permitindo que você foque no que realmente importa: dirigir com segurança.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-accent w-5 h-5" />
                  <span className="text-sm font-semibold">Otimização inteligente de trajetos</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-accent w-5 h-5" />
                  <span className="text-sm font-semibold">Confirmação de embarque digital</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Side Bento Card */}
          <div className="col-span-12 md:col-span-4 bg-accent rounded-[2rem] p-8 md:p-12 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Users className="text-primary w-10 h-10" />
              <span className="bg-primary/10 px-3 py-1 rounded-full text-primary text-xs font-bold">Novo Recurso</span>
            </div>
            <div className="mt-8 mb-8">
              <h4 className="text-2xl font-bold text-primary mb-2">Controle de Passageiros</h4>
              <p className="text-accent-900 text-base">
                Lista de presença digital com foto e avisos de ausência enviados pelos pais em tempo real.
              </p>
            </div>
            <Button asChild className="w-full bg-primary hover:bg-primary-800 text-white py-6 rounded-xl font-bold flex items-center justify-center gap-2 text-lg transition-colors">
              <Link href="/login?role=motorista">
                Seja Parceiro
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
