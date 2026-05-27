import { Bus, Plus, Filter, Download } from 'lucide-react';

export default function FrotaPage() {
  const veiculos = [
    { id: 1, placa: 'AAA-1234', modelo: 'Microônibus Volare W9', capacidade: 28, motorista: 'Carlos Alberto Silva',    tipo: 'Próprio',       status: 'Ativo'      },
    { id: 2, placa: 'BBB-5678', modelo: 'Ônibus Mercedes-Benz OF-1721', capacidade: 52, motorista: 'Marcos Vinícius Souza', tipo: 'Terceirizado',  status: 'Ativo'      },
    { id: 3, placa: 'CCC-9012', modelo: 'Van Renault Master',    capacidade: 15, motorista: 'Ana Julia Santos',       tipo: 'Próprio',       status: 'Manutenção' },
    { id: 4, placa: 'DDD-3456', modelo: 'Ônibus Volkswagen 17.230', capacidade: 46, motorista: 'Roberto Ferreira',      tipo: 'Terceirizado',  status: 'Ativo'      },
    { id: 5, placa: 'EEE-7890', modelo: 'Microônibus Iveco Daily', capacidade: 22, motorista: 'Sandra Aparecida Lima', tipo: 'Próprio',       status: 'Ativo'      },
  ];

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Frota e Veículos</h1>
          <p className="adm-page-sub">Gestão completa da frota escolar de Arapongas — {veiculos.length} veículos cadastrados.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
            <Download size={15} /> Exportar
          </button>
          <button className="btn-yellow" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
            <Plus size={15} /> Novo Veículo
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="table-filter-bar" style={{ marginBottom: '20px' }}>
          <div className="filter-item"><Filter size={15} /><span>Filtrar:</span></div>
          <button className="filter-badge active">Todos</button>
          <button className="filter-badge">Próprio</button>
          <button className="filter-badge">Terceirizado</button>
          <button className="filter-badge">Manutenção</button>
        </div>
        <div className="table-responsive">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Placa</th><th>Modelo</th><th>Capacidade</th><th>Motorista</th><th>Tipo</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map((v) => (
                <tr key={v.id}>
                  <td className="code-font adm-td-aluno">{v.placa}</td>
                  <td className="adm-td-escola">{v.modelo}</td>
                  <td style={{ color: '#64748B', fontSize: '0.88rem' }}>{v.capacidade} lugares</td>
                  <td className="adm-td-rota">{v.motorista}</td>
                  <td><span className={`badge-type ${v.tipo === 'Próprio' ? 'own' : 'partner'}`}>{v.tipo}</span></td>
                  <td><span className={`status-pill ${v.status.toLowerCase()}`}>{v.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .adm-page { display: flex; flex-direction: column; gap: 28px; }
        .adm-page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .adm-page-title { font-size: clamp(1.2rem, 3vw, 1.6rem); font-weight: 800; color: #0F172A; }
        .adm-page-sub { font-size: 0.87rem; color: #64748B; margin-top: 4px; }
        .adm-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; text-align: left; }
        .adm-table th { padding: 12px 16px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94A3B8; border-bottom: 2px solid #F1F5F9; white-space: nowrap; }
        .adm-table td { padding: 14px 16px; border-bottom: 1px solid #F8FAFC; vertical-align: middle; }
        .adm-table tbody tr:last-child td { border-bottom: none; }
        .adm-table tbody tr:hover td { background: #FAFAFA; }
        .adm-td-aluno { font-weight: 600; color: #0F172A; white-space: nowrap; }
        .adm-td-escola { color: #475569; }
        .adm-td-rota { color: #475569; white-space: nowrap; }
      `}</style>
    </div>
  );
}
