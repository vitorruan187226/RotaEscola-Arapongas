'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '../utils/supabase/client';

/**
 * Botão de logout reutilizável (Client Component).
 * Executa supabase.auth.signOut(), limpa cookie mock e redireciona para /login.
 */
export default function LogoutButton({
  className,
  iconSize = 14,
  showLabel = true,
}: {
  className?: string;
  iconSize?: number;
  showLabel?: boolean;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = "sb-mock-login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push('/login');
  };

  return (
    <button onClick={handleLogout} className={className} title="Sair do sistema">
      <LogOut size={iconSize} />
      {showLabel && <span>Sair</span>}
    </button>
  );
}
