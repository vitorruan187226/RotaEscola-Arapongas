'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, QrCode, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function MotoristaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  // Simula alternar status de conexão para demonstração offline
  useEffect(() => {
    const handleConnectionChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
    };
  }, []);

  const navItems = [
    {
      label: 'Início',
      href: '/motorista/painel',
      icon: Home,
    },
    {
      label: 'Escanear QR',
      href: '/motorista/leitor',
      icon: QrCode,
    },
    {
      label: 'Ocorrências',
      href: '/motorista/ocorrencias',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans antialiased text-slate-100">
      {/* Container de Simulação do Celular */}
      <div className="w-full max-w-md min-h-screen bg-slate-900 shadow-2xl flex flex-col relative md:border-x md:border-slate-800 overflow-hidden">
        
        {/* Status Bar Simulada / Cabeçalho do App */}
        <header className="bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚌</span>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white leading-none">
                RotaEscola
              </h1>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                Arapongas · Motorista
              </span>
            </div>
          </div>

          {/* Conexão Simulada */}
          <button 
            onClick={() => setIsOnline(!isOnline)} 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-300 ${
              isOnline 
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' 
                : 'bg-rose-950/80 text-rose-400 border border-rose-800/50 animate-pulse'
            }`}
            title="Clique para alternar conectividade simulada"
          >
            {isOnline ? (
              <>
                <Wifi size={11} />
                <span>ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff size={11} />
                <span>OFFLINE</span>
              </>
            )}
          </button>
        </header>

        {/* Área de Conteúdo Scrollable */}
        <main className="flex-1 overflow-y-auto pb-24 px-4 py-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {/* Injetando o estado de conectividade como prop se os filhos forem elementos React válidos */}
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { isOnline } as any);
            }
            return child;
          })}
        </main>

        {/* Bottom Navigation Fixo */}
        <nav className="absolute bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2.5 flex justify-around items-center z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Corrigindo correspondência de subrotas ou rota exata
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'text-amber-500 scale-105 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors duration-200 ${
                  isActive ? 'bg-amber-500/10' : 'bg-transparent'
                }`}>
                  <Icon size={20} className="transition-transform duration-200" />
                </div>
                <span className="text-[11px] tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
