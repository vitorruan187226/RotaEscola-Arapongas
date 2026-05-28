'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, LogOut } from 'lucide-react';
import { createClient } from '../../utils/supabase/client';
import React from 'react';

export default function ResponsavelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Define se exibe botão voltar (exibe em todas as páginas exceto no dashboard inicial)
  const showBackButton = pathname !== '/responsavel/dashboard';

  const handleLogout = async () => {
    // Derruba a sessão real no backend do Supabase
    const supabase = createClient();
    await supabase.auth.signOut();
    // Limpa o cookie mock e redireciona
    document.cookie = "sb-mock-login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans antialiased text-slate-800">
      {/* Moldura celular simulada */}
      <div className="w-full max-w-md min-h-screen bg-[#F8FAFC] shadow-2xl flex flex-col relative md:border-x md:border-slate-800 overflow-hidden">
        
        {/* Header Superior Premium */}
        <header className="bg-slate-900 text-white px-4 py-4 flex items-center justify-between border-b-4 border-amber-500 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button 
                onClick={() => router.back()}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
                title="Voltar"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white leading-none">
                RotaEscola
              </h1>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                Arapongas · Responsável
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
            title="Sair do Portal"
          >
            <LogOut size={13} />
            <span>Sair</span>
          </button>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-y-auto px-4 py-5 pb-20">
          {children}
        </main>
      </div>
    </div>
  );
}
