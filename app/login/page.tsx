'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMotorista, setIsMotorista] = useState(false);
  
  const router = useRouter();

  // Efeito de montagem para evitar erros de hidratação (Mismatch SSR/Client)
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsMotorista(params.get('role') === 'motorista');
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="login-wrapper">
        <div className="login-card card-premium flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-semibold">Carregando portal...</span>
        </div>
      </div>
    );
  }



  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, senha }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Usuário ou senha inválidos.');
        setLoading(false);
        return;
      }

      const role = data.tipoUsuario;
      const primeiroAcesso = data.primeiroAcesso === true;

      if (role === 'Admin' || role === 'admin') {
        router.push('/dashboard/admin');
      } else if (role === 'Motorista' || role === 'motorista') {
        // Motorista no primeiro acesso → trocar senha obrigatoriamente
        router.push(primeiroAcesso ? '/motorista/primeiro-acesso' : '/dashboard/motorista');
      } else if (role === 'Secretaria' || role === 'secretaria') {
        router.push('/dashboard/secretaria');
      } else {
        router.push('/responsavel/dashboard');
      }
    } catch (err) {
      setError('Ocorreu um erro ao conectar ao servidor.');
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card card-premium">
        <div className="login-header">
          <span className="logo-badge">🚌</span>
          <h2>{isMotorista ? 'Acesso do Motorista' : 'RotaEscola'}</h2>
          <p>{isMotorista ? 'Primeiro Acesso ou Login' : 'Arapongas - PR'}</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="cpf">{isMotorista ? 'CPF do Motorista' : 'CPF do Responsável / Servidor'}</label>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha {isMotorista && '(Seu CPF no primeiro acesso)'}</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                id="senha"
                type="password"
                placeholder={isMotorista ? 'Digite seu CPF (ou senha definitiva)' : 'Sua senha secreta'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Acessando...' : isMotorista ? 'Ativar / Entrar no Sistema' : 'Entrar no Sistema'}
          </button>

          <div className="login-footer">
            {isMotorista ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: '1.5', display: 'block', maxWidth: '300px', margin: '0 auto', textAlign: 'center' }}>
                O cadastro de motoristas é feito pela Secretaria de Educação (SEMED). 
                No primeiro acesso, digite seu CPF nos campos de CPF e Senha para ativar sua conta.
              </span>
            ) : (
              <Link href="/cadastro" className="text-link">
                Não tem uma conta? Cadastre-se aqui
              </Link>
            )}
          </div>
        </form>
      </div>


      <style>{`
        .login-wrapper {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--background-gray);
        }

        .login-card {
          width: 92%;
          max-width: 400px;
          padding: 32px 20px;
          margin: 16px auto;
        }

        @media (min-width: 480px) {
          .login-card {
            width: 100%;
            padding: 40px 32px;
            margin: 0;
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-badge {
          font-size: 2.5rem;
          display: inline-block;
          margin-bottom: 8px;
        }

        .login-header h2 {
          color: var(--primary-navy);
          font-size: 1.8rem;
          font-weight: 700;
        }

        .login-header p {
          color: var(--text-light);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 0.85rem;
        }

        .alert-danger {
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-dark);
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-light);
        }

        .input-with-icon input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .input-with-icon input:focus {
          border-color: var(--primary-navy);
        }

        .w-full {
          width: 100%;
          justify-content: center;
          padding: 14px;
          font-size: 1rem;
        }

        .login-footer {
          text-align: center;
          margin-top: 16px;
        }

        .text-link {
          color: var(--primary-navy);
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
          display: inline-block;
        }

        .text-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

      `}</style>
    </div>
  );
}
