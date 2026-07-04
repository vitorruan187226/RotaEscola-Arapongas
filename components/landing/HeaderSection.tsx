'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bus, Download } from 'lucide-react';

export function HeaderSection() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white shadow-sm border-b border-slate-100">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Bus className="text-primary h-7 w-7" />
          <h1 className="font-bold text-xl text-primary">Rota Escola</h1>
        </Link>
        <div className="flex gap-4">
          <Button asChild variant="outline" className="hidden md:flex">
            <Link href="/login?role=motorista">Sou Motorista</Link>
          </Button>
          <Button asChild className="bg-primary text-white rounded-full px-6 active:scale-95 transition-transform hover:bg-primary-800">
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
