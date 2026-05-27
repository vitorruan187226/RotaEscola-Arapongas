'use client';

import { useState } from 'react';
import { createClient } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanCpf = cpf.replace(/\D/g, '');

    // Validação contra os dados simulados
    if (cleanCpf === '11111111111' && senha === 'secretariasenha') {
      document.cookie = "sb-mock-login=secretaria; path=/";
      router.push('/dashboard/secretaria');
      setLoading(false);
      return;
    }
    if (cleanCpf === '22222222222' && senha === 'responsavelsenha') {
      document.cookie = "sb-mock-login=responsavel; path=/";
      router.push('/responsavel/dashboard');
      setLoading(false);
      return;
    }
    if (cleanCpf === '33333333333' && senha === 'motoristasenha') {
      document.cookie = "sb-mock-login=motorista; path=/";
      router.push('/dashboard/motorista');
      setLoading(false);
      return;
    }
    if (cleanCpf === '99999999999' && senha === 'adminisenha') {
      document.cookie = "sb-mock-login=admin; path=/";
      router.push('/dashboard/admin');
      setLoading(false);
      return;
    }

    const email = `${cleanCpf}@rotaescola.com`;

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (authError) {
        setError('Usuário ou senha inválidos.');
        setLoading(false);
        return;
      }

      if (data?.user) {
        const { data: perfil, error: perfilError } = await supabase
          .from('perfis')
          .select('tipo_usuario')
          .eq('id', data.user.id)
          .single();

        if (!perfilError && perfil) {
          const role = perfil.tipo_usuario;
          if (role === 'Secretaria') {
            router.push('/dashboard/secretaria');
          } else {
            router.push('/responsavel/dashboard');
          }
        } else {
          router.push('/responsavel/dashboard');
        }
      }
    } catch (err) {
      setError('Ocorreu um erro no servidor.');
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card card-premium">
        <div className="login-header">
          <span className="logo-badge">🚌</span>
          <h2>RotaEscola</h2>
          <p>Arapongas - PR</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="cpf">CPF do Responsável / Servidor</label>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                id="senha"
                type="password"
                placeholder="Sua senha secreta"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Acessando...' : 'Entrar no Sistema'}
          </button>
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
      `}</style>
    </div>
  );
}
