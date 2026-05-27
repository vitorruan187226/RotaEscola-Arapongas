import { Users, Plus, Search } from 'lucide-react';

export default function AlunosPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800, color: '#0F172A' }}>
            Gestão de Alunos
          </h1>
          <p style={{ fontSize: '0.87rem', color: '#64748B', marginTop: '4px' }}>
            Cadastro, aprovação e gerenciamento dos 6.000 alunos transportados.
          </p>
        </div>
        <button className="btn-yellow" style={{ fontSize: '0.85rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={15} /> Novo Aluno
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '48px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(15,23,42,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#0F172A' }}>
          <Users size={28} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
          Módulo de Gestão de Alunos
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748B', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
          Esta seção será conectada ao Supabase para exibir e gerenciar os cadastros de alunos aprovados, pendentes e em análise.
        </p>
        <span style={{ display: 'inline-block', marginTop: '16px', fontSize: '0.75rem', fontWeight: 600, background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '4px 12px', borderRadius: '20px' }}>
          Em desenvolvimento — Sprint 2
        </span>
      </div>
    </div>
  );
}
