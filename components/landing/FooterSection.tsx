import Link from 'next/link';
import { Bus, Share2, Mail } from 'lucide-react';

export function FooterSection() {
  return (
    <footer className="bg-primary-900 w-full mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center py-12 px-6 md:px-12 gap-6 max-w-[1200px] mx-auto">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <div className="flex items-center gap-2">
            <Bus className="text-accent h-6 w-6" />
            <span className="text-2xl text-accent font-bold">Rota Escola</span>
          </div>
          <p className="text-base text-primary-100 opacity-80 text-center md:text-left">
            © {new Date().getFullYear()} Rota Escola Arapongas. Todos os direitos reservados.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="#" className="text-base text-primary-100 opacity-80 hover:text-accent transition-opacity">Privacidade</Link>
          <Link href="#" className="text-base text-primary-100 opacity-80 hover:text-accent transition-opacity">Termos de Uso</Link>
          <Link href="#" className="text-base text-primary-100 opacity-80 hover:text-accent transition-opacity">Contato</Link>
          <Link href="/login?role=motorista" className="text-base text-primary-100 opacity-80 hover:text-accent transition-opacity">Motoristas</Link>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white cursor-pointer hover:bg-accent hover:text-primary transition-all">
            <Share2 className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white cursor-pointer hover:bg-accent hover:text-primary transition-all">
            <Mail className="w-5 h-5" />
          </div>
        </div>
      </div>
    </footer>
  );
}
