'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '../../../../utils/supabase/client';
import {
  MapPin, Plus, Search, RefreshCw, X, Save,
  Bus, Clock, Users, AlertCircle, CheckCircle2,
  Wrench, Loader2, Eye, Pencil, Trash2
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────── */
interface Rota {
  id: string;
  codigo: string;
  nome: string;
  veiculo_id?: string | null;
  veiculo_placa?: string | null;
  motorista_id?: string | null;
  motorista_nome?: string | null;
  horario_saida?: string | null;
  horario_fim?: string | null;
  ativa?: boolean;
  turno?: string | null;
  status?: string | null;
  created_at?: string | null;
}

interface Motorista {
  id: string;
  nome: string;
  placa_veiculo?: string | null;
}

interface RotaForm {
  codigo: string;
  nome: string;
  veiculo_id: string;
  motorista_id: string;
  horario_inicio: string;
  horario_fim: string;
  ativa: boolean;
  turno: string;
}

const EMPTY_FORM: RotaForm = {
  codigo: '',
  nome: '',
  veiculo_id: '',
  motorista_id: '',
  horario_inicio: '06:30',
  horario_fim: '12:30',
  ativa: false,
  turno: 'Manhã',
};

/* ─── Mocks fallback (demonstração) ────────────────── */
const MOCK_ROTAS: Rota[] = [
  { id: '1', codigo: 'RT-07', nome: 'Região Norte',  veiculo_placa: 'AAA-1234', horario_saida: '06:30', horario_fim: '12:30', status: 'Ativo', ativa: true, turno: 'Manhã' },
  { id: '2', codigo: 'RT-14', nome: 'Zona Rural',    veiculo_placa: 'BBB-5678', horario_saida: '06:00', horario_fim: '12:00', status: 'Ativo', ativa: true, turno: 'Manhã' },
  { id: '3', codigo: 'RT-22', nome: 'Centro',         veiculo_placa: 'CCC-9012', horario_saida: '07:00', horario_fim: '13:00', status: 'Manutenção', ativa: false, turno: 'Tarde' },
  { id: '4', codigo: 'RT-03', nome: 'Região Sul',    veiculo_placa: 'DDD-3456', horario_saida: '06:45', horario_fim: '12:45', status: 'Ativo', ativa: true, turno: 'Manhã' },
  { id: '5', codigo: 'RT-19', nome: 'Leste',          veiculo_placa: 'EEE-7890', horario_saida: '07:15', horario_fim: '13:15', status: 'Ativo', ativa: true, turno: 'Tarde' },
];

/* ─── Helpers ───────────────────────────────────────── */
function statusColor(s: string | null | undefined) {
  if (s === 'Ativo')      return { bg: '#dcfce7', color: '#166534' };
  if (s === 'Manutenção') return { bg: '#fef9c3', color: '#854d0e' };
  return { bg: '#fee2e2', color: '#991b1b' };
}

function statusIcon(s: string | null | undefined) {
  if (s === 'Ativo')      return <CheckCircle2 size={12} />;
  if (s === 'Manutenção') return <Wrench size={12} />;
  return <AlertCircle size={12} />;
}

/* ─── Toast ─────────────────────────────────────────── */
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '10px',
      background: type === 'success' ? '#166534' : '#991b1b',
      color: '#fff', padding: '14px 20px', borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)', fontSize: '0.875rem', fontWeight: 600,
      animation: 'slideIn 0.3s ease',
    }}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '8px' }}>
        <X size={14} />
      </button>
    </div>
  );
}

/* ─── Modal ─────────────────────────────────────────── */
function RotaModal({
  open, onClose, onSave, editData, veiculos, motoristas,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (form: RotaForm, id?: string) => Promise<void>;
  editData?: Rota | null;
  veiculos: any[];
  motoristas: Motorista[];
}) {
  const [form, setForm] = useState<RotaForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        codigo: editData.codigo ?? '',
        nome: editData.nome ?? '',
        veiculo_id: editData.veiculo_id ?? '',
        motorista_id: editData.motorista_id ?? '',
        horario_inicio: editData.horario_saida ?? '06:30',
        horario_fim: editData.horario_fim ?? '12:30',
        ativa: editData.ativa ?? (editData.status === 'Ativo'),
        turno: editData.turno ?? 'Manhã',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editData, open]);

  if (!open) return null;

  const field = (label: string, key: keyof RotaForm, placeholder?: string, type = 'text') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <input
        type={type}
        value={form[key] as string}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        style={{
          padding: '10px 14px', borderRadius: '10px',
          border: '1.5px solid #E2E8F0', fontSize: '0.875rem',
          outline: 'none', background: '#F8FAFC', color: '#0F172A',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => (e.target.style.borderColor = '#FBBF24')}
        onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
      />
    </div>
  );

  async function handleSubmit() {
    if (!form.codigo.trim() || !form.nome.trim()) return;
    setSaving(true);
    await onSave(form, editData?.id);
    setSaving(false);
    onClose();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '480px',
        padding: '28px', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        animation: 'fadeUp 0.25s ease',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#FEF3C7', borderRadius: '10px', padding: '8px' }}>
              <MapPin size={20} style={{ color: '#D97706' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                {editData ? 'Editar Rota' : 'Nova Rota'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                {editData ? 'Atualize os dados da rota' : 'Preencha os dados da nova rota'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
            <X size={16} style={{ color: '#64748B' }} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {field('Código da Rota', 'codigo', 'Ex: RT-07')}
            {field('Horário de Saída', 'horario_inicio', '06:30', 'time')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {field('Horário de Retorno', 'horario_fim', '12:30', 'time')}
            {/* Turno */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Turno
              </label>
              <select
                value={form.turno}
                onChange={e => setForm(p => ({ ...p, turno: e.target.value }))}
                style={{
                  padding: '10px 14px', borderRadius: '10px',
                  border: '1.5px solid #E2E8F0', fontSize: '0.875rem',
                  outline: 'none', background: '#F8FAFC', color: '#0F172A', cursor: 'pointer',
                }}
              >
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
              </select>
            </div>
          </div>
          
          {field('Nome da Rota', 'nome', 'Ex: Região Norte / Zona Rural')}

          {/* Veículo removido: Atribuição é feita via Frota e Veículos */}
          {/* Motorista removido: Atribuição é feita via Frota e Veículos */}

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Status da Rota
            </label>
            <select
              value={form.ativa ? 'Ativo' : 'Inativo'}
              onChange={e => setForm(p => ({ ...p, ativa: e.target.value === 'Ativo' }))}
              style={{
                padding: '10px 14px', borderRadius: '10px',
                border: '1.5px solid #E2E8F0', fontSize: '0.875rem',
                outline: 'none', background: '#F8FAFC', color: '#0F172A', cursor: 'pointer',
              }}
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #E2E8F0',
            background: '#fff', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.codigo.trim() || !form.nome.trim()}
            style={{
              flex: 2, padding: '12px', borderRadius: '10px', border: 'none',
              background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'opacity 0.2s',
            }}
          >
            {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
            {saving ? 'Salvando...' : editData ? 'Salvar Alterações' : 'Criar Rota'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────── */
export default function RotasPage() {
  const supabase = createClient();

  const [rotas, setRotas] = useState<Rota[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [filtered, setFiltered] = useState<Rota[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRota, setEditRota] = useState<Rota | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [usingMock, setUsingMock] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  /* ── Fetch Veículos ── */
  const fetchVeiculos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .select('id, placa, tipo, motorista_id')
        .order('placa', { ascending: true });
      if (!error && data) {
        setVeiculos(data);
      }
    } catch (err) {
      console.warn('Erro ao carregar veículos para rotas:', err);
    }
  }, [supabase]);

  /* ── Fetch Motoristas ── */
  const fetchMotoristas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('id, nome, motoristas_perfil(placa_veiculo)')
        .eq('tipo_usuario', 'Motorista')
        .order('nome', { ascending: true });
      if (!error && data) {
        setMotoristas(
          (data as { id: string; nome: string; motoristas_perfil: { placa_veiculo: string | null }[] }[]).filter(m => !m.id.startsWith('33333333-')).map(m => ({
            id: m.id,
            nome: m.nome,
            placa_veiculo: m.motoristas_perfil?.[0]?.placa_veiculo ?? null,
          }))
        );
      }
    } catch (err) {
      console.warn('Erro ao carregar motoristas para rotas:', err);
    }
  }, [supabase]);

  /* ── Fetch Rotas ── */
  const fetchRotas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rotas')
        .select(`
          id, codigo, nome, horario_inicio, horario_fim, ativa, turno, veiculo_id, motorista_id, created_at,
          veiculos (
            id,
            placa,
            tipo
          ),
          perfis (
            id,
            nome
          )
        `)
        .order('codigo', { ascending: true });

      if (error) throw error;
      
      const lista = (data ?? []).map((r: any) => ({
        id: r.id,
        codigo: r.codigo || 'RT-00',
        nome: r.nome || 'Rota Geral',
        veiculo_id: r.veiculo_id ?? null,
        veiculo_placa: r.veiculos?.placa ?? '—',
        motorista_id: r.motorista_id ?? null,
        motorista_nome: r.perfis?.nome ?? null,
        horario_saida: r.horario_inicio ? r.horario_inicio.substring(0, 5) : '00:00',
        horario_fim: r.horario_fim ? r.horario_fim.substring(0, 5) : '00:00',
        ativa: r.ativa,
        turno: r.turno ?? 'Manhã',
        status: r.ativa ? 'Ativo' : 'Inativo',
        created_at: r.created_at
      })) as Rota[];

      setRotas(lista);
      setUsingMock(false);
    } catch (err) {
      console.warn('Erro ao carregar rotas do Supabase, caindo no mock:', err);
      setRotas(MOCK_ROTAS);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { 
    fetchRotas(); 
    fetchVeiculos();
    fetchMotoristas();
  }, [fetchRotas, fetchVeiculos, fetchMotoristas]);

  /* ── Search filter ── */
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? rotas.filter(r =>
            r.codigo.toLowerCase().includes(q) ||
            r.nome.toLowerCase().includes(q) ||
            (r.veiculo_placa ?? '').toLowerCase().includes(q) ||
            (r.status ?? '').toLowerCase().includes(q)
          )
        : rotas,
    );
  }, [search, rotas]);

  /* ── Save (create / update) ── */
  async function handleSave(form: RotaForm, id?: string) {
    if (usingMock) {
      if (id) {
        setRotas(prev => prev.map(r => r.id === id ? { 
          ...r, 
          codigo: form.codigo,
          nome: form.nome,
          veiculo_id: form.veiculo_id,
          veiculo_placa: veiculos.find(v => v.id === form.veiculo_id)?.placa ?? '—',
          horario_saida: form.horario_inicio,
          horario_fim: form.horario_fim,
          status: form.ativa ? 'Ativo' : 'Inativo',
          ativa: form.ativa,
          turno: form.turno
        } : r));
        setToast({ msg: 'Rota atualizada (modo demo)', type: 'success' });
      } else {
        const nova: Rota = { 
          id: String(Date.now()), 
          codigo: form.codigo,
          nome: form.nome,
          veiculo_id: form.veiculo_id,
          veiculo_placa: veiculos.find(v => v.id === form.veiculo_id)?.placa ?? '—',
          horario_saida: form.horario_inicio,
          horario_fim: form.horario_fim,
          status: form.ativa ? 'Ativo' : 'Inativo',
          ativa: form.ativa,
          turno: form.turno
        };
        setRotas(prev => [nova, ...prev]);
        setToast({ msg: 'Rota criada (modo demo)', type: 'success' });
      }
      return;
    }

    try {
      const payload = {
        codigo: form.codigo,
        nome: form.nome,
        horario_inicio: form.horario_inicio ? `${form.horario_inicio}:00` : null,
        horario_fim: form.horario_fim ? `${form.horario_fim}:00` : null,
        ativa: form.ativa,
        turno: form.turno
      };

      if (id) {
        const { error } = await supabase.from('rotas').update(payload).eq('id', id);
        if (error) throw error;
        setToast({ msg: 'Rota atualizada com sucesso!', type: 'success' });
      } else {
        const { error } = await supabase.from('rotas').insert(payload);
        if (error) throw error;
        setToast({ msg: 'Nova rota criada com sucesso!', type: 'success' });
      }
      await fetchRotas();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao salvar rota';
      setToast({ msg, type: 'error' });
    }
  }

  /* ── Delete ── */
  async function handleDelete(rota: Rota) {
    if (!confirm(`Excluir a rota "${rota.nome} (${rota.codigo})"? Esta ação é irreversível.`)) return;
    setDeleting(rota.id);

    if (usingMock) {
      setRotas(prev => prev.filter(r => r.id !== rota.id));
      setToast({ msg: 'Rota removida (modo demo)', type: 'success' });
      setDeleting(null);
      return;
    }

    try {
      const { error } = await supabase.from('rotas').delete().eq('id', rota.id);
      if (error) throw error;
      setToast({ msg: 'Rota excluída com sucesso!', type: 'success' });
      await fetchRotas();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao excluir rota';
      setToast({ msg, type: 'error' });
    } finally {
      setDeleting(null);
    }
  }

  /* ─── KPIs ── */
  const ativas = rotas.filter(r => r.status === 'Ativo').length;
  const manutencao = rotas.filter(r => r.status === 'Manutenção').length;

  /* ─── Render ─────────────────────────────────────── */
  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideIn { from { opacity:0; transform:translateX(40px) } to { opacity:1; transform:translateX(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.5 } }
        tr.rota-row:hover td { background: #F8FAFC !important; }
        .action-btn:hover { opacity: 0.8; transform: scale(1.05); }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800, color: '#0F172A' }}>
              Rotas e Itinerários
            </h1>
            <p style={{ fontSize: '0.87rem', color: '#64748B', marginTop: '4px' }}>
              {loading ? 'Carregando...' : `${rotas.length} rotas cadastradas para o município de Arapongas — PR`}
              {usingMock && !loading && (
                <span style={{ marginLeft: '8px', fontSize: '0.72rem', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>
                  Modo Demo
                </span>
              )}
            </p>
          </div>
          <button
            id="btn-nova-rota"
            onClick={() => { setEditRota(null); setModalOpen(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '11px 20px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: '#fff', fontWeight: 700, fontSize: '0.875rem',
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,158,11,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            <Plus size={16} /> Nova Rota
          </button>
        </div>

        {/* ── KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Total de Rotas', value: rotas.length, icon: <MapPin size={18} style={{ color: '#FBBF24' }} />, bg: '#FEF3C7', border: '#FDE68A' },
            { label: 'Rotas Ativas', value: ativas, icon: <CheckCircle2 size={18} style={{ color: '#22c55e' }} />, bg: '#dcfce7', border: '#bbf7d0' },
            { label: 'Em Manutenção', value: manutencao, icon: <Wrench size={18} style={{ color: '#f59e0b' }} />, bg: '#fef9c3', border: '#fde68a' },
            { label: 'Inativas', value: rotas.length - ativas - manutencao, icon: <AlertCircle size={18} style={{ color: '#ef4444' }} />, bg: '#fee2e2', border: '#fecaca' },
          ].map(k => (
            <div key={k.label} style={{
              background: '#fff', borderRadius: '14px', padding: '18px 20px',
              border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{ background: k.bg, border: `1px solid ${k.border}`, borderRadius: '10px', padding: '8px' }}>
                {k.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px', fontWeight: 600 }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table Card ── */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

          {/* Toolbar */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                id="search-rotas"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por código, nome, placa ou status..."
                style={{
                  width: '100%', padding: '9px 12px 9px 36px',
                  border: '1.5px solid #E2E8F0', borderRadius: '10px',
                  fontSize: '0.875rem', outline: 'none', background: '#F8FAFC',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              onClick={fetchRotas}
              title="Recarregar"
              style={{
                padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #E2E8F0',
                background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                color: '#64748B', fontSize: '0.8rem', fontWeight: 600,
              }}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Recarregar
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div className="flex flex-col animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3 w-1/4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
                      <div className="flex flex-col gap-2 w-full">
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                        <div className="h-2 bg-slate-100 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="w-1/6">
                      <div className="h-4 bg-slate-100 rounded w-20" />
                    </div>
                    <div className="w-1/4">
                      <div className="h-4 bg-slate-100 rounded w-24" />
                    </div>
                    <div className="w-1/6">
                      <div className="h-5 bg-slate-100 rounded-full w-16" />
                    </div>
                    <div className="flex gap-2 justify-end w-1/6">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                      <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
                <MapPin size={32} style={{ opacity: 0.4, marginBottom: '12px' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Nenhuma rota encontrada</p>
                <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                  {search ? 'Tente buscar por outros termos.' : 'Clique em "+ Nova Rota" para começar.'}
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Código', 'Nome da Rota', 'Veículo', 'Motorista', 'Horário', 'Status', 'Ações'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', fontSize: '0.72rem', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: '#94A3B8', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const sc = statusColor(r.status);
                    return (
                      <tr key={r.id} className="rota-row">
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                          {r.codigo}
                        </td>
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#0F172A' }}>
                            <MapPin size={13} style={{ color: '#FBBF24', flexShrink: 0 }} />
                            {r.nome}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#64748B', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Bus size={13} style={{ color: '#94A3B8' }} />
                            {r.veiculo_placa ?? '—'}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#475569', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={13} style={{ color: '#94A3B8' }} />
                            {r.motorista_nome ?? <span style={{ color: '#CBD5E1', fontStyle: 'italic', fontSize: '0.8rem' }}>Sem motorista</span>}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#475569', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={13} style={{ color: '#94A3B8' }} />
                            {r.horario_saida ?? '—'}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px',
                            borderRadius: '20px', background: sc.bg, color: sc.color,
                          }}>
                            {statusIcon(r.status)} {r.status ?? 'Desconhecido'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              id={`btn-edit-rota-${r.id}`}
                              className="action-btn"
                              onClick={() => { setEditRota(r); setModalOpen(true); }}
                              title="Editar"
                              style={{
                                padding: '7px', borderRadius: '8px', border: '1px solid #E2E8F0',
                                background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                transition: 'all 0.15s',
                              }}
                            >
                              <Pencil size={13} style={{ color: '#475569' }} />
                            </button>
                            <button
                              id={`btn-delete-rota-${r.id}`}
                              className="action-btn"
                              onClick={() => handleDelete(r)}
                              disabled={deleting === r.id}
                              title="Excluir"
                              style={{
                                padding: '7px', borderRadius: '8px', border: '1px solid #FCA5A5',
                                background: '#FEF2F2', cursor: deleting === r.id ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', transition: 'all 0.15s',
                              }}
                            >
                              {deleting === r.id
                                ? <Loader2 size={13} style={{ color: '#EF4444', animation: 'spin 1s linear infinite' }} />
                                : <Trash2 size={13} style={{ color: '#EF4444' }} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                {filtered.length} de {rotas.length} rota{rotas.length !== 1 ? 's' : ''}
              </span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: usingMock ? '#F59E0B' : '#22c55e' }} />
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>
                  {usingMock ? 'Dados de demonstração' : 'Supabase — dados reais'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      <RotaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editData={editRota}
        veiculos={veiculos}
        motoristas={motoristas}
      />

      {/* ── Toast ── */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}

