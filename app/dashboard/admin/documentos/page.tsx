import { FileCheck, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function DocumentosPage() {
  const docs = [
    { id: 1, aluno: 'Pedro Augusto Lima',       doc: 'RG do Responsável',          enviado: '26/05/2025', status: 'Pendente'   },
    { id: 2, aluno: 'Mariana Costa Souza',       doc: 'Comprovante de Matrícula',   enviado: '26/05/2025', status: 'Em análise' },
    { id: 3, aluno: 'Thiago Moraes Barbosa',     doc: 'CPF do Responsável',         enviado: '25/05/2025', status: 'Pendente'   },
    { id: 4, aluno: 'Letícia Campos Ribeiro',    doc: 'Foto 3x4 do Aluno',          enviado: '25/05/2025', status: 'Pendente'   },
    { id: 5, aluno: 'Felipe Nascimento Torres',  doc: 'Comprovante de Residência',  enviado: '24/05/2025', status: 'Em análise' },
  ];

  const statusMap: Record<string, { cls: string; label: string }> = {
    'Pendente':   { cls: 'pill-yellow', label: 'Pendente' },
    'Em análise': { cls: 'pill-blue',   label: 'Em análise' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800, color: '#0F172A' }}>
          Aprovação de Documentos
        </h1>
        <p style={{ fontSize: '0.87rem', color: '#64748B', marginTop: '4px' }}>
          {docs.length} documentos aguardando análise e aprovação da SEMED.
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr>
                {['Aluno', 'Documento', 'Enviado em', 'Status', 'Ações'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', borderBottom: '2px solid #F1F5F9', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>{d.aluno}</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{d.doc}</td>
                  <td style={{ padding: '14px 16px', color: '#94A3B8', fontSize: '0.8rem', fontFamily: 'monospace' }}>{d.enviado}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`adm-pill ${statusMap[d.status].cls}`}>{d.status}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: 600, background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}>
                        <Eye size={13} /> Ver
                      </button>
                      <button style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: 600, background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', color: '#166534' }}>
                        <CheckCircle size={13} /> Aprovar
                      </button>
                      <button style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: 600, background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', color: '#991b1b' }}>
                        <XCircle size={13} /> Rejeitar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .adm-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 0.72rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; white-space: nowrap; }
        .pill-yellow { background: #FEF3C7; color: #92400E; }
        .pill-blue   { background: #dbeafe; color: #1d4ed8; }
      `}</style>
    </div>
  );
}
