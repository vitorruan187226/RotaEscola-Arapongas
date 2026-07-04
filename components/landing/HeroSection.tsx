import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary text-white pt-32 pb-24 md:pb-32" id="hero">
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-800" />
      <div className="relative max-w-[1200px] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
        <div className="z-10 text-center md:text-left">
          <span className="inline-block px-4 py-1 rounded-full bg-accent text-accent-900 text-xs font-bold mb-6">
            #1 em Segurança Escolar
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Transporte Escolar com Segurança em Arapongas
          </h2>
          <p className="text-lg text-slate-300 mb-8 opacity-90 max-w-lg mx-auto md:mx-0">
            A tranquilidade que sua família merece. Acompanhe o trajeto dos seus filhos em tempo real com a tecnologia líder da região.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button asChild className="bg-accent hover:bg-accent-600 text-primary font-bold px-8 py-6 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 text-lg">
              <Link href="/login">
                <Download className="w-5 h-5" />
                Baixar App
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-2 border-white/30 text-white bg-transparent hover:bg-white/10 px-8 py-6 rounded-xl font-bold transition-colors text-lg">
              <Link href="/login?role=motorista">
                Área do Motorista
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative mt-12 md:mt-0 flex justify-center">
          <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full"></div>
          <Image 
            src="/images/landing/hero-bus.jpg" 
            alt="Ônibus escolar moderno" 
            width={600} 
            height={400} 
            className="w-full max-w-md rounded-2xl shadow-2xl relative z-10 animate-pulse-soft"
          />
        </div>
      </div>
      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg className="relative block w-full h-[60px]" data-name="Layer 1" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.21,104.72,115,117.21,173.27,110.83,235,104.05,282.25,70.83,321.39,56.44Z" fill="#F8FAFC"></path>
        </svg>
      </div>
    </section>
  );
}
