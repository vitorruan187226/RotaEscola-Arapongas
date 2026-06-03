'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';

export default function PrimeiroAcessoPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showNova, setShowNova] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const router = useRouter();

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  /* ── Validações de senha ── */
  const regras = [
    { label: 'Mínimo de 8 caracteres', ok: novaSenha.length >= 8 },
    { label: 'Pelo menos uma letra maiúscula', ok: /[A-Z]/.test(novaSenha) },
    { label: 'Pelo menos um número', ok: /\d/.test(novaSenha) },
  ];
  const senhaValida = regras.every(r => r.ok);
  const senhasIguais = novaSenha === confirmarSenha && confirmarSenha.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!senhaValida || !senhasIguais) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/motorista/trocar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novaSenha }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Erro ao salvar nova senha. Tente novamente.');
        setLoading(false);
        return;
      }

      setSucesso(true);
      // Redireciona após 2 segundos mostrando a mensagem de sucesso
      setTimeout(() => {
        router.push('/dashboard/motorista');
      }, 2000);

    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      padding: '16px',
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes successPop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .regra-item { transition: color 0.2s, opacity 0.2s; }
        .input-senha:focus { border-color: #FBBF24 !important; outline: none; }
      `}</style>

      <div style={{
        width: '100%', maxWidth: '420px',
        animation: 'fadeUp 0.4s ease',
      }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            boxShadow: '0 8px 24px rgba(245,158,11,0.35)', marginBottom: '16px',
          }}>
            <ShieldCheck size={30} style={{ color: '#fff' }} />
          </div>
          <h1 style={{
            fontSize: '1.5rem', fontWeight: 800, color: '#F8FAFC',
            marginBottom: '6px',
          }}>
            Bem-vindo ao RotaEscola!
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.5 }}>
            Por segurança, crie uma senha pessoal<br />antes de acessar seu painel.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px',
          padding: '32px',
        }}>
          {sucesso ? (
            <div style={{ textAlign: 'center', animation: 'successPop 0.5s ease' }}>
              <CheckCircle2 size={56} style={{ color: '#22c55e', marginBottom: '16px' }} />
              <h2 style={{ color: '#F8FAFC', fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px' }}>
                Senha definida com sucesso!
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
                Redirecionando para o seu painel...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px', padding: '12px 14px',
                  color: '#FCA5A5', fontSize: '0.85rem',
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  {error}
                </div>
              )}

              {/* Nova Senha */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{
                  fontSize: '0.78rem', fontWeight: 700, color: '#CBD5E1',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  Nova Senha
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{
                    position: 'absolute', left: '14px', top: '50%',
                    transform: 'translateY(-50%)', color: '#64748B',
                  }} />
                  <input
                    id="nova-senha"
                    className="input-senha"
                    type={showNova ? 'text' : 'password'}
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    placeholder="Crie uma senha segura"
                    required
                    style={{
                      width: '100%', padding: '12px 42px 12px 40px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1.5px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px', color: '#F8FAFC', fontSize: '0.9rem',
                      boxSizing: 'border-box', transition: 'border-color 0.2s',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNova(v => !v)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', color: '#64748B',
                    }}
                  >
                    {showNova ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Regras de senha */}
              {novaSenha.length > 0 && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                  padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px',
                }}>
                  {regras.map(r => (
                    <div key={r.label} className="regra-item" style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      fontSize: '0.78rem', fontWeight: 600,
                      color: r.ok ? '#4ade80' : '#64748B',
                    }}>
                      <CheckCircle2 size={13} style={{ opacity: r.ok ? 1 : 0.3 }} />
                      {r.label}
                    </div>
                  ))}
                </div>
              )}

              {/* Confirmar Senha */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{
                  fontSize: '0.78rem', fontWeight: 700, color: '#CBD5E1',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  Confirmar Nova Senha
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{
                    position: 'absolute', left: '14px', top: '50%',
                    transform: 'translateY(-50%)', color: '#64748B',
                  }} />
                  <input
                    id="confirmar-senha"
                    className="input-senha"
                    type={showConfirmar ? 'text' : 'password'}
                    value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a senha"
                    required
                    style={{
                      width: '100%', padding: '12px 42px 12px 40px',
                      background: confirmarSenha.length > 0
                        ? (senhasIguais ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)')
                        : 'rgba(255,255,255,0.06)',
                      border: `1.5px solid ${confirmarSenha.length > 0
                        ? (senhasIguais ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)')
                        : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '10px', color: '#F8FAFC', fontSize: '0.9rem',
                      boxSizing: 'border-box', transition: 'border-color 0.2s, background 0.2s',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmar(v => !v)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', color: '#64748B',
                    }}
                  >
                    {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmarSenha.length > 0 && !senhasIguais && (
                  <span style={{ fontSize: '0.75rem', color: '#FCA5A5', fontWeight: 600 }}>
                    As senhas não coincidem.
                  </span>
                )}
              </div>

              {/* Botão */}
              <button
                id="btn-definir-senha"
                type="submit"
                disabled={loading || !senhaValida || !senhasIguais}
                style={{
                  padding: '14px', borderRadius: '12px', border: 'none',
                  background: (senhaValida && senhasIguais && !loading)
                    ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                    : 'rgba(255,255,255,0.08)',
                  color: (senhaValida && senhasIguais && !loading) ? '#fff' : '#64748B',
                  fontWeight: 700, fontSize: '0.95rem', cursor: (senhaValida && senhasIguais && !loading) ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'background 0.3s, color 0.3s',
                  boxShadow: (senhaValida && senhasIguais && !loading)
                    ? '0 4px 16px rgba(245,158,11,0.35)' : 'none',
                }}
              >
                {loading
                  ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Salvando...</>
                  : <><ShieldCheck size={18} /> Definir Minha Senha</>
                }
              </button>

            </form>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.78rem', color: '#475569' }}>
          RotaEscola Arapongas · Acesso Seguro 🔒
        </p>
      </div>
    </div>
  );
}
