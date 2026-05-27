// Redirect canônico: /dashboard/responsavel → /responsavel/dashboard
// O painel premium do responsável vive em app/responsavel/dashboard/page.tsx
// Este arquivo garante que qualquer link legado ainda funcione.
import { redirect } from 'next/navigation';

export default function RedirectToResponsavelDashboard() {
  redirect('/responsavel/dashboard');
}
