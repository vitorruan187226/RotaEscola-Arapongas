import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight } from 'lucide-react';

export function CtaBannerSection() {
  return (
    <section className="lp-cta-banner" aria-labelledby="cta-heading">
      <div className="lp-cta-banner-inner">
        <div className="lp-cta-badge">
          <Zap size={14} />
          <span>Recadastro Anual 2025 — Aberto</span>
        </div>
        <h2 id="cta-heading" className="lp-cta-title">
          Renove a matrícula do seu filho no transporte escolar
        </h2>
        <p className="lp-cta-desc">
          O recadastro anual é obrigatório para garantir a vaga no ônibus escolar. Agora você pode fazer tudo{' '}
          <strong>100% digital</strong>, sem sair de casa, pelo celular ou computador.
        </p>
        <div className="lp-cta-actions">
          <Button asChild variant="yellow" size="lg" id="btn-cta-recadastro">
            <Link href="/login">
              Fazer Recadastro Agora
              <ArrowRight size={18} />
            </Link>
          </Button>
          <Button asChild variant="white-outline" size="lg" id="btn-cta-saibamais">
            <Link href="#suporte">
              Tirar Dúvidas
            </Link>
          </Button>
        </div>
        <p className="lp-cta-hint">
          Documentos exigidos: RG, CPF e comprovante de matrícula
        </p>
      </div>
      {/* Decoração */}
      <div className="lp-cta-deco lp-cta-deco--1" aria-hidden="true" />
      <div className="lp-cta-deco lp-cta-deco--2" aria-hidden="true" />
    </section>
  );
}
