'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, AlertCircle } from 'lucide-react';
import { createClient } from '../../utils/supabase/client';

export default function LoginPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMotorista, setIsMotorista] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/login`,
        },
      });
      if (error) {
        setError('Erro ao conectar com o Google: ' + error.message);
        setLoading(false);
      }
    } catch (err) {
      setError('Ocorreu um erro ao iniciar a autenticação com o Google.');
      setLoading(false);
    }
  };

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

          {!isMotorista && (
            <>
              <div className="divider-container">
                <span className="divider-line"></span>
                <span className="divider-text">ou</span>
                <span className="divider-line"></span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="btn-google w-full"
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Continuar com o Google</span>
              </button>
            </>
          )}

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

        .divider-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 4px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background-color: var(--border-color);
        }

        .divider-text {
          font-size: 0.8rem;
          color: var(--text-light);
          font-weight: 500;
        }

        .btn-google {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ffffff;
          color: #1e293b;
          border: 1px solid #e2e8f0;
          padding: 12px;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .btn-google:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        }

        .btn-google:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        
        .btn-google:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
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
