'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../utils/supabase/client';
import { Lock, User, Phone, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CadastroPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cadastroSucesso, setCadastroSucesso] = useState(false);

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

  useEffect(() => {
    setIsMounted(true);
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


  // Máscaras de entrada em tempo real
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  };

  const formatTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatTelefone(e.target.value));
  };

  // Algoritmo matemático de validação de CPF
  const validateCPF = (rawCpf: string): boolean => {
    const clean = rawCpf.replace(/\D/g, '');
    if (clean.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(clean)) return false; // Evita CPFs com números repetidos

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(clean.charAt(i)) * (10 - i);
    }
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(clean.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(clean.charAt(i)) * (11 - i);
    }
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(clean.charAt(10))) return false;

    return true;
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanCpf = cpf.replace(/\D/g, '');
    const emailDerivado = `${cleanCpf}@rotaescola.com`;

    // 1. Validações client-side
    if (senha !== confirmarSenha) {
      setError('As senhas digitadas não coincidem.');
      setLoading(false);
      return;
    }

    /* DESATIVADO TEMPORARIAMENTE PARA TESTES (MOCK CPF)
    if (!validateCPF(cleanCpf)) {
      setError('CPF inválido. Verifique os dígitos informados.');
      setLoading(false);
      return;
    }
    */

    try {
      const response = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeCompleto, cpf: cleanCpf, telefone, senha })
      });

      const resultado = await response.json();

      if (!response.ok) {
        setError(resultado.error || 'Erro ao realizar o cadastro.');
        setLoading(false);
        return;
      }

      // Se deu sucesso, faz o login na sessão usando o e-mail gerado automaticamente
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: emailDerivado,
        password: senha
      });

      if (loginError) {
        console.error('[Cadastro] Erro ao autenticar apos cadastro:', loginError);
        setError('Cadastro realizado, mas não conseguimos fazer o login automático. Por favor, acesse a tela de login.');
        setLoading(false);
        return;
      }

      document.cookie = "sb-mock-login=responsavel; path=/";
      window.location.href = '/responsavel/dashboard';

    } catch (err: any) {
      setError('Erro ao conectar ao servidor de cadastro.');
    } finally {
      setLoading(false);
    }
  };


  if (cadastroSucesso) {
    return (
      <div className="login-wrapper">
        <div className="login-card card-premium text-center flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto">
            <CheckCircle2 size={38} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Cadastro Realizado!</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto">
              Sua conta foi criada com sucesso no sistema RotaEscola Arapongas. Agora você pode entrar usando seu CPF e a senha que acabou de cadastrar.
            </p>
          </div>
          <Link href="/login" className="btn-primary w-full block text-center py-3.5 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-450 text-decoration-none">
            Ir para a Tela de Login
          </Link>
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
        `}</style>
      </div>
    );
  }


  return (
    <div className="login-wrapper">
      <div className="login-card card-premium">
        <div className="login-header">
          <span className="logo-badge">📝</span>
          <h2>Criar Conta</h2>
          <p>RotaEscola Arapongas - Cadastro de Responsável</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCadastro} className="login-form">
          {/* Nome Completo */}
          <div className="form-group">
            <label htmlFor="nomeCompleto">Nome Completo</label>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input
                id="nomeCompleto"
                type="text"
                placeholder="Seu nome completo"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                required
              />
            </div>
          </div>

          {/* CPF */}
          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <div className="input-with-icon">
              <Shield className="input-icon" size={18} />
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

          {/* Telefone */}
          <div className="form-group">
            <label htmlFor="telefone">Telefone / WhatsApp</label>
            <div className="input-with-icon">
              <Phone className="input-icon" size={18} />
              <input
                id="telefone"
                type="text"
                placeholder="(43) 99999-9999"
                value={telefone}
                onChange={handleTelefoneChange}
                required
              />
            </div>
          </div>

          {/* Senha */}
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                id="senha"
                type="password"
                placeholder="Crie uma senha de acesso"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirmar Senha */}
          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                id="confirmarSenha"
                type="password"
                placeholder="Repita sua senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

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
            style={{ marginBottom: '8px' }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Cadastrar com o Google</span>
          </button>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar e Acessar'}
          </button>

          <div className="login-footer">
            <Link href="/login" className="text-link">
              Já tem uma conta? Faça login aqui
            </Link>
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
          margin-bottom: 24px;
        }

        .logo-badge {
          font-size: 2.2rem;
          display: inline-block;
          margin-bottom: 6px;
        }

        .login-header h2 {
          color: var(--primary-navy);
          font-size: 1.6rem;
          font-weight: 700;
        }

        .login-header p {
          color: var(--text-light);
          font-size: 0.85rem;
          font-weight: 500;
          margin-top: 4px;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.82rem;
        }

        .alert-danger {
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-group label {
          font-size: 0.82rem;
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
          padding: 10px 12px 10px 40px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .input-with-icon input:focus {
          border-color: var(--primary-navy);
        }

        .w-full {
          width: 100%;
          justify-content: center;
          padding: 12px;
          font-size: 0.95rem;
        }

        .login-footer {
          text-align: center;
          margin-top: 12px;
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
          font-size: 0.82rem;
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
