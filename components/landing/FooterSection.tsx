import Link from 'next/link';
import { Bus } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Vantagens', href: '#vantagens' },
  { label: 'Recursos', href: '#recursos' },
  { label: 'Suporte', href: '#suporte' },
];

export function FooterSection() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="lp-footer-brand">
          <div className="lp-footer-logo">
            <div className="lp-logo-icon">
              <Bus size={22} />
            </div>
            <div className="lp-logo-text">
              <span className="lp-logo-name">RotaEscola</span>
              <span className="lp-logo-city">Arapongas · PR</span>
            </div>
          </div>
          <p>
            Sistema oficial de gestão do transporte escolar de Arapongas. Segurança e transparência para a comunidade.
          </p>
        </div>

        <div className="lp-footer-links-col">
          <h4>Para Pais</h4>
          <ul>
            <li><Link href="/login">Área do Responsável</Link></li>
            <li><Link href="/login">Rastreamento ao Vivo</Link></li>
            <li><Link href="/login">Justificar Falta</Link></li>
          </ul>
        </div>

        <div className="lp-footer-links-col">
          <h4>Navegação</h4>
          <ul>
            {NAV_LINKS.map((l) => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
            <li><Link href="/login">Acessar Sistema</Link></li>
          </ul>
        </div>
      </div>

      <div className="lp-footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Prefeitura de Arapongas. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
