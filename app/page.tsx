import { createClient as createServerClient } from '../utils/supabase/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  let todos: { id: number; name: string }[] = [];
  try {
    const { data, error } = await supabase.from('todos').select('id, name');
    if (!error && data) {
      todos = data;
    }
  } catch (err) {
    // Falha silenciosa para usar mock se a tabela não existir
  }

  // Dados mock se o banco estiver vazio ou falhar
  if (todos.length === 0) {
    todos = [
      { id: 1, name: 'Mapear rotas escolares da região norte (Arapongas)' },
      { id: 2, name: 'Cadastrar motoristas da van escolar' },
      { id: 3, name: 'Sincronizar horários com a central Arapongas' },
    ];
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo-glow"></div>
        <h1 className="title">🚌 RotaEscola Arapongas</h1>
        <p className="subtitle">Painel de gerenciamento do transporte escolar municipal</p>
      </header>

      <main className="main-content">
        <div className="card">
          <div className="card-header">
            <span className="badge">Supabase SSR</span>
            <h2>Lista de Tarefas Ativas</h2>
          </div>
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className="todo-item">
                <div className="todo-icon">✓</div>
                <span className="todo-text">{todo.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <style>{`
        .container {
          max-width: 600px;
          width: 100%;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .header {
          text-align: center;
          position: relative;
        }

        .logo-glow {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 80px;
          background: #e2b714;
          filter: blur(40px);
          opacity: 0.15;
          pointer-events: none;
        }

        .title {
          font-size: 2.2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #ffd000, #ff8c00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .subtitle {
          font-size: 0.95rem;
          color: #8b949e;
          font-weight: 400;
        }

        .card {
          background: rgba(22, 27, 34, 0.4);
          border: 1px solid rgba(240, 246, 252, 0.1);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(240, 246, 252, 0.05);
          padding-bottom: 12px;
        }

        .card-header h2 {
          font-size: 1.15rem;
          font-weight: 600;
          color: #f0f6fc;
        }

        .badge {
          font-size: 0.75rem;
          font-weight: 600;
          color: #ffd000;
          background: rgba(255, 208, 0, 0.1);
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid rgba(255, 208, 0, 0.25);
        }

        .todo-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .todo-item {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          padding: 14px 18px;
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }

        .todo-item:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 208, 0, 0.2);
          box-shadow: 0 4px 12px rgba(255, 208, 0, 0.05);
        }

        .todo-icon {
          color: #39d353;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .todo-text {
          font-size: 0.95rem;
          color: #c9d1d9;
        }
      `}</style>
    </div>
  );
}
