'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Bus,
  Users,
  FileCheck,
  MapPin,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Building2,
  FileWarning,
} from 'lucide-react';
import { useState } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { ALUNOS_MOCK_GLOBAL } from '../../../lib/mocks/alunos';

// ─── Itens de navegação da sidebar ─────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: 'Visão Geral',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Entidades Escolares',
    href: '/dashboard/admin/escolas',
    icon: Building2,
  },
  {
    label: 'Frota e Veículos',
    href: '/dashboard/admin/frota',
    icon: Bus,
  },
  {
    label: 'Gestão de Alunos',
    href: '/dashboard/admin/alunos',
    icon: Users,
  },
  {
    label: 'Rotas e Itinerários',
    href: '/dashboard/admin/rotas',
    icon: MapPin,
  },
  {
    label: 'Ocorrências',
    href: '/dashboard/admin/ocorrencias',
    icon: FileWarning,
  },
];

// ─── Componente de item da sidebar ─────────────────────────────────────────
function SidebarLink({
  item,
  active,
  onClick,
  badgeCount,
}: {
  item: (typeof NAV_ITEMS)[0];
  active: boolean;
  onClick?: () => void;
  badgeCount?: number;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`sidebar-nav-item ${active ? 'sidebar-nav-item--active' : ''}`}
    >
      <item.icon size={18} className="sidebar-nav-icon" />
      <span>{item.label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="sidebar-nav-badge">
          {badgeCount}
        </span>
      )}
      {active && <ChevronRight size={14} className="sidebar-nav-chevron" />}
    </Link>
  );
}

// ─── Layout principal ───────────────────────────────────────────────────────
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emAnaliseCount, setEmAnaliseCount] = useState<number>(0);
  const [ocorrenciasCount, setOcorrenciasCount] = useState<number>(0);

  // Busca e escuta a contagem global de alunos com status 'Em análise'
  useState(() => {
    async function fetchEmAnaliseCount() {
      try {
        const supabase = createClient();
        
        // 1. Verifica se existem escolas no banco para determinar se estamos em simulação ou produção real
        const { count: escolasCount, error: escolasErr } = await supabase
          .from('escolas')
          .select('id', { count: 'exact', head: true });

        if (!escolasErr && escolasCount !== null && escolasCount > 0) {
          // Produção Real: executa a contagem direta no banco
          const { count, error } = await supabase
            .from('alunos')
            .select('*', { count: 'exact', head: true })
            .eq('status_carteirinha', 'Em análise');

          if (!error && count !== null) {
            setEmAnaliseCount(count);
          }
        } else {
          // Modo Simulação: calcula a contagem total baseada no mock global de alunos
          const mockCount = ALUNOS_MOCK_GLOBAL.filter(a => a.statusCarteirinha === 'Em análise').length;
          setEmAnaliseCount(mockCount);
        }
      } catch (err) {
        console.error('Erro ao buscar total de alunos em análise:', err);
      }
    }

    fetchEmAnaliseCount();
    const interval = setInterval(fetchEmAnaliseCount, 20000); // pooling leve de 20s
    return () => clearInterval(interval);
  });

  // Busca contagem de ocorrências pendentes
  useState(() => {
    async function fetchOcorrenciasCount() {
      try {
        const supabase = createClient();
        const { count, error } = await supabase
          .from('ocorrencias')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pendente');
        if (!error && count !== null) setOcorrenciasCount(count);
      } catch (err) {
        console.error('Erro ao buscar ocorrências pendentes:', err);
      }
    }
    fetchOcorrenciasCount();
    const interval = setInterval(fetchOcorrenciasCount, 20000);
    return () => clearInterval(interval);
  });

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = "sb-mock-login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push('/login');
  };

  return (
    <div className="admin-shell">

      {/* ── Overlay mobile ── */}
      {sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ═══════════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════════ */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}
        aria-label="Navegação administrativa"
      >
        {/* Logo da sidebar */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Building2 size={20} />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">RotaEscola</span>
            <span className="sidebar-logo-sub">Painel Admin</span>
          </div>
        </div>

        {/* Rótulo da seção */}
        <p className="sidebar-section-label">MENU PRINCIPAL</p>

        {/* Links de navegação */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isEscolas = item.label === 'Entidades Escolares';
            const isOcorrencias = item.label === 'Ocorrências';
            return (
              <SidebarLink
                key={item.href}
                item={item}
                active={pathname === item.href}
                onClick={() => setSidebarOpen(false)}
                badgeCount={
                  isEscolas ? emAnaliseCount
                  : isOcorrencias ? ocorrenciasCount
                  : undefined
                }
              />
            );
          })}
        </nav>

        {/* Rodapé da sidebar */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">A</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">Administrador SEMED</span>
              <span className="sidebar-user-role">Secretaria de Educação</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-logout"
            id="btn-admin-logout"
            title="Sair do sistema"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════
          CONTEÚDO PRINCIPAL
      ═══════════════════════════════════════ */}
      <div className="admin-main">

        {/* Topbar */}
        <header className="admin-topbar">
          {/* Hamburguer mobile */}
          <button
            id="btn-admin-menu"
            className="admin-topbar-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Abrir menu lateral"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Breadcrumb / título da seção atual */}
          <div className="admin-topbar-breadcrumb">
            {NAV_ITEMS.find((i) => i.href === pathname)?.label ??
              NAV_ITEMS.find((i) => pathname.startsWith(i.href) && i.href !== '/dashboard/admin')?.label ??
              'Painel Administrativo'}
          </div>

          {/* Usuário no topbar (desktop) */}
          <div className="admin-topbar-user">
            <div className="topbar-user-avatar">A</div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">Administrador SEMED</span>
              <span className="topbar-user-role">Secretaria de Educação</span>
            </div>
            <button onClick={handleLogout} className="topbar-logout-btn" id="btn-topbar-logout">
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Área de conteúdo das páginas */}
        <main className="admin-content">
          {children}
        </main>
      </div>

      {/* ═══════════════════════════════════════
          ESTILOS DO LAYOUT ADMIN
      ═══════════════════════════════════════ */}
      <style>{`
        /* ── Shell ── */
        .admin-shell {
          display: flex;
          min-height: 100vh;
          min-height: 100dvh;
          background: #F1F5F9;
          font-family: var(--font-inter), system-ui, sans-serif;
        }

        /* ── Overlay mobile ── */
        .admin-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 39;
        }

        /* ══ SIDEBAR ══ */
        .admin-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 260px;
          background: #0F172A;
          display: flex;
          flex-direction: column;
          z-index: 40;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        @media (min-width: 1024px) {
          .admin-sidebar {
            transform: translateX(0);
            position: sticky;
            height: 100vh;
          }
        }
        .admin-sidebar--open {
          transform: translateX(0);
          box-shadow: 4px 0 24px rgba(0,0,0,0.3);
        }

        /* Logo */
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .sidebar-logo-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #FBBF24, #F59E0B);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0F172A;
          flex-shrink: 0;
        }
        .sidebar-logo-name {
          display: block;
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
        }
        .sidebar-logo-sub {
          display: block;
          font-size: 0.68rem;
          color: #FBBF24;
          font-weight: 500;
          margin-top: 1px;
        }

        /* Rótulo de seção */
        .sidebar-section-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: rgba(255,255,255,0.28);
          letter-spacing: 0.10em;
          padding: 20px 20px 8px;
        }

        /* Links de nav */
        .sidebar-nav {
          flex: 1;
          padding: 0 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }
        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          color: rgba(255,255,255,0.62);
          font-size: 0.88rem;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          position: relative;
        }
        .sidebar-nav-item:hover {
          background: rgba(255,255,255,0.07);
          color: #fff;
        }
        .sidebar-nav-item--active {
          background: rgba(251,191,36,0.12);
          color: #FBBF24;
          font-weight: 600;
        }
        .sidebar-nav-item--active:hover {
          background: rgba(251,191,36,0.17);
          color: #FBBF24;
        }
        .sidebar-nav-icon { flex-shrink: 0; }
        .sidebar-nav-chevron { margin-left: auto; opacity: 0.6; }
        .sidebar-nav-badge {
          background-color: #EF4444;
          color: #ffffff;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 9999px;
          margin-left: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          line-height: 1;
        }

        /* Rodapé sidebar */
        .sidebar-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 16px calc(16px + var(--safe-area-bottom, 0px));
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }
        .sidebar-user-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FBBF24, #F59E0B);
          color: #0F172A;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sidebar-user-name {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-user-role {
          display: block;
          font-size: 0.65rem;
          color: rgba(255,255,255,0.4);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px; height: 34px;
          border-radius: 8px;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .sidebar-logout:hover {
          background: rgba(239,68,68,0.15);
          color: #ef4444;
        }

        /* ══ MAIN ══ */
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        @media (min-width: 1024px) {
          .admin-main { margin-left: 0; }
        }

        /* Topbar */
        .admin-topbar {
          background: #fff;
          border-bottom: 1px solid #E2E8F0;
          height: 64px;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 30;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .admin-topbar-hamburger {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748B;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: background 0.15s, color 0.15s;
        }
        .admin-topbar-hamburger:hover { background: #F1F5F9; color: #0F172A; }
        @media (min-width: 1024px) {
          .admin-topbar-hamburger { display: none; }
        }
        .admin-topbar-breadcrumb {
          font-size: 0.95rem;
          font-weight: 600;
          color: #0F172A;
          flex: 1;
        }

        .admin-topbar-user {
          display: none;
          align-items: center;
          gap: 12px;
        }
        @media (min-width: 768px) {
          .admin-topbar-user { display: flex; }
        }
        .topbar-user-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0F172A, #1e3a70);
          color: #FBBF24;
          font-weight: 800;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .topbar-user-name {
          display: block;
          font-size: 0.82rem;
          font-weight: 600;
          color: #0F172A;
          line-height: 1.2;
        }
        .topbar-user-role {
          display: block;
          font-size: 0.7rem;
          color: #64748B;
        }
        .topbar-logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #64748B;
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .topbar-logout-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: #fef2f2;
        }

        /* Conteúdo */
        .admin-content {
          flex: 1;
          padding: 32px 24px;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }
        @media (max-width: 639px) {
          .admin-content { padding: 20px 16px; }
        }
      `}</style>
    </div>
  );
}
