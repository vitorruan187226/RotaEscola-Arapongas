import { MapPin } from 'lucide-react';

export default function RotasPage() {
  const rotas = [
    { id: 1, codigo: 'RT-07', nome: 'Região Norte', veículo: 'AAA-1234', alunos: 28, horario: '06:30', status: 'Ativo' },
    { id: 2, codigo: 'RT-14', nome: 'Zona Rural',   veículo: 'BBB-5678', alunos: 45, horario: '06:00', status: 'Ativo' },
    { id: 3, codigo: 'RT-22', nome: 'Centro',        veículo: 'CCC-9012', alunos: 12, horario: '07:00', status: 'Manutenção' },
    { id: 4, codigo: 'RT-03', nome: 'Região Sul',   veículo: 'DDD-3456', alunos: 38, horario: '06:45', status: 'Ativo' },
    { id: 5, codigo: 'RT-19', nome: 'Leste',        veículo: 'EEE-7890', alunos: 22, horario: '07:15', status: 'Ativo' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800, color: '#0F172A' }}>
          Rotas e Itinerários
        </h1>
        <p style={{ fontSize: '0.87rem', color: '#64748B', marginTop: '4px' }}>
          {rotas.length} rotas cadastradas para o município de Arapongas — PR.
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr>
                {['Código', 'Nome da Rota', 'Veículo', 'Alunos', 'Horário', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', borderBottom: '2px solid #F1F5F9', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rotas.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>{r.codigo}</td>
                  <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#0F172A' }}>
                    <MapPin size={14} style={{ color: '#FBBF24', flexShrink: 0 }} /> {r.nome}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#64748B' }}>{r.veículo}</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{r.alunos} alunos</td>
                  <td style={{ padding: '14px 16px', color: '#475569', fontFamily: 'monospace' }}>{r.horario}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: r.status === 'Ativo' ? '#dcfce7' : '#fee2e2', color: r.status === 'Ativo' ? '#166534' : '#991b1b' }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
