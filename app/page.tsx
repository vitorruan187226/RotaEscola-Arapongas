import { HeaderSection } from '../components/landing/HeaderSection';
import { HeroSection } from '../components/landing/HeroSection';
import { BeneficiosSection } from '../components/landing/BeneficiosSection';
import { RecursosSection } from '../components/landing/RecursosSection';
import { CtaBannerSection } from '../components/landing/CtaBannerSection';
import { SuporteSection } from '../components/landing/SuporteSection';
import { FooterSection } from '../components/landing/FooterSection';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-inter text-slate-900 selection:bg-accent-200 selection:text-accent-900">
      <HeaderSection />
      <main className="pt-16">
        <HeroSection />
        <BeneficiosSection />
        <RecursosSection />
        <CtaBannerSection />
        <SuporteSection />
      </main>
      <FooterSection />
    </div>
  );
}
