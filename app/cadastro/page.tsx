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

    if (!validateCPF(cleanCpf)) {
      setError('CPF inválido. Verifique os dígitos informados.');
      setLoading(false);
      return;
    }

    try {
      // 2. Criação do usuário via API do Servidor (Supabase Admin Auth)
      const res = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCompleto,
          cpf: cleanCpf,
          telefone,
          senha
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Erro ao realizar o cadastro.');
        setLoading(false);
        return;
      }

      // 3. Login automático imediato no cliente para gerar a sessão local e cookies
      console.log('[Cadastro] Iniciando login automatico no cliente...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: emailDerivado,
        password: senha
      });

      if (loginError) {
        console.error('[Cadastro] Erro ao autenticar apos cadastro:', loginError);
        setError('Cadastro realizado, mas não conseguimos fazer o login automático. Por favor, acesse a tela de login.');
        setLoading(false);
        return;
      }

      // 4. Redirecionamento de Sucesso
      document.cookie = "sb-mock-login=responsavel; path=/";
      router.push('/responsavel/dashboard');

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
            width: 100%;
            max-width: 400px;
            padding: 40px 32px;
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
          width: 100%;
          max-width: 400px;
          padding: 40px 32px;
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
