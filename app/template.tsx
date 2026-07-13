'use client';

import { ReactNode } from 'react';

/**
 * Este template embrulha todas as páginas da aplicação.
 * Como ele remonta a cada navegação, a classe 'animate-fade-in'
 * será reativada a cada nova tela, criando uma transição suave.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <div className="animate-fade-in w-full h-full">
      {children}
    </div>
  );
}
