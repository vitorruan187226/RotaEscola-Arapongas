'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bus, ChevronRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { label: 'Vantagens', href: '#vantagens' },
  { label: 'Recursos', href: '#recursos' },
  { label: 'Suporte', href: '#suporte' },
];

export function HeaderSection() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="lp-header">
      <div className="lp-header-inner">
        {/* Logo */}
        <Link href="/" className="lp-logo" id="lp-logo-link">
          <div className="lp-logo-icon">
            <Bus size={22} />
          </div>
          <div className="lp-logo-text">
            <span className="lp-logo-name">RotaEscola</span>
            <span className="lp-logo-city">Arapongas · PR</span>
          </div>
        </Link>

        {/* Nav Links — desktop */}
        <nav className="lp-nav-links" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="lp-nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA Botão — desktop */}
        <div className="lp-header-cta">
          <Button asChild variant="yellow" size="sm" id="btn-header-acessar">
            <Link href="/login">
              Acessar Sistema
              <ChevronRight size={16} />
            </Link>
          </Button>
        </div>

        {/* Hambúrguer — mobile */}
        <button
          id="btn-mobile-menu"
          className="lp-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu de navegação"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu mobile expandido */}
      {menuOpen && (
        <div className="lp-mobile-menu" role="navigation" aria-label="Menu mobile">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="lp-mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
              <ChevronRight size={16} />
            </a>
          ))}
          <div className="lp-mobile-cta">
            <Button asChild variant="yellow" className="w-full justify-center" id="btn-mobile-acessar">
              <Link href="/login">Acessar Sistema</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
