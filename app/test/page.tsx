'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SquareData {
  id: number;
  title: string;
  description: string;
  color: string;
  glowColor: string;
}

export default function TestPage() {
  const [clicks, setClicks] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const squares: SquareData[] = [
    {
      id: 1,
      title: 'Escarlate Cósmico',
      description: 'Testa tons avermelhados de alta energia.',
      color: 'hsl(340, 85%, 55%)',
      glowColor: 'rgba(236, 27, 107, 0.4)',
    },
    {
      id: 2,
      title: 'Neon Ciano',
      description: 'Testa tons futuristas de azul ciber.',
      color: 'hsl(190, 95%, 50%)',
      glowColor: 'rgba(20, 203, 236, 0.4)',
    },
    {
      id: 3,
      title: 'Esmeralda Bio',
      description: 'Testa cores vibrantes de aprovação/sucesso.',
      color: 'hsl(145, 80%, 48%)',
      glowColor: 'rgba(25, 219, 93, 0.4)',
    },
    {
      id: 4,
      title: 'Âmbar Solar',
      description: 'Testa cores de atenção e sinalização de rotas.',
      color: 'hsl(42, 95%, 52%)',
      glowColor: 'rgba(247, 174, 14, 0.4)',
    },
  ];

  const handleSquareClick = (id: number) => {
    setClicks((prev) => ({
      ...prev,
      [id]: prev[id] + 1,
    }));
    setSelectedId(id);
  };

  const resetClicks = () => {
    setClicks({ 1: 0, 2: 0, 3: 0, 4: 0 });
    setSelectedId(null);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo-glow"></div>
        <h1 className="title">🧪 Painel de Testes</h1>
        <p className="subtitle">Verificação de Hydration, Client Hooks, Estados e Animações HSL</p>
      </header>

      <main className="main-content">
        <div className="status-bar">
          <div className="status-info">
            <span>Último Selecionado:</span>
            <strong>
              {selectedId ? squares.find((s) => s.id === selectedId)?.title : 'Nenhum'}
            </strong>
          </div>
          <button className="reset-btn" onClick={resetClicks}>
            Zerar Cliques
          </button>
        </div>

        <div className="grid">
          {squares.map((sq) => {
            const isSelected = selectedId === sq.id;
            return (
              <div
                key={sq.id}
                className={`square-card ${isSelected ? 'selected' : ''}`}
                style={{
                  '--theme-color': sq.color,
                  '--glow-color': sq.glowColor,
                } as React.CSSProperties}
                onClick={() => handleSquareClick(sq.id)}
              >
                <div className="square-header">
                  <div className="color-dot"></div>
                  <h3>{sq.title}</h3>
                </div>
                <p className="square-desc">{sq.description}</p>
                <div className="square-counter">
                  <span>Cliques:</span>
                  <strong>{clicks[sq.id]}</strong>
                </div>
              </div>
            );
          })}
        </div>

        <div className="nav-footer">
          <Link href="/" className="back-link">
            ← Voltar para o Dashboard
          </Link>
        </div>
      </main>

      <style>{`
        .container {
          max-width: 800px;
          width: 100%;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
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
          width: 120px;
          height: 120px;
          background: #14cbec;
          filter: blur(50px);
          opacity: 0.15;
          pointer-events: none;
        }

        .title {
          font-size: 2.4rem;
          font-weight: 700;
          background: linear-gradient(135deg, #14cbec, #a154ff);
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

        .status-bar {
          background: rgba(22, 27, 34, 0.4);
          border: 1px solid rgba(240, 246, 252, 0.1);
          border-radius: 12px;
          padding: 14px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(12px);
          margin-bottom: 8px;
        }

        .status-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #c9d1d9;
        }

        .status-info strong {
          color: #14cbec;
          font-weight: 600;
        }

        .reset-btn {
          background: rgba(240, 246, 252, 0.05);
          border: 1px solid rgba(240, 246, 252, 0.1);
          color: #f0f6fc;
          padding: 6px 14px;
          font-size: 0.85rem;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .reset-btn:hover {
          background: rgba(236, 27, 107, 0.15);
          border-color: rgba(236, 27, 107, 0.3);
          color: #ff5d9e;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .square-card {
          background: rgba(22, 27, 34, 0.3);
          border: 1px solid rgba(240, 246, 252, 0.08);
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .square-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--theme-color);
          opacity: 0.6;
          transition: width 0.25s ease;
        }

        .square-card:hover {
          transform: translateY(-4px);
          background: rgba(22, 27, 34, 0.6);
          border-color: var(--theme-color);
          box-shadow: 0 8px 24px var(--glow-color);
        }

        .square-card:hover::before {
          width: 8px;
        }

        .square-card.selected {
          border-color: var(--theme-color);
          background: rgba(22, 27, 34, 0.7);
          box-shadow: 0 12px 30px var(--glow-color);
          transform: scale(1.02);
        }

        .square-card.selected::before {
          width: 100%;
          height: 4px;
          top: 0;
          left: 0;
        }

        .square-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--theme-color);
          box-shadow: 0 0 8px var(--theme-color);
        }

        .square-header h3 {
          font-size: 1.15rem;
          font-weight: 600;
          color: #f0f6fc;
        }

        .square-desc {
          font-size: 0.85rem;
          color: #8b949e;
          line-height: 1.4;
        }

        .square-counter {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.85rem;
          color: #c9d1d9;
          border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .square-counter strong {
          color: var(--theme-color);
          font-size: 1rem;
        }

        .nav-footer {
          text-align: center;
          margin-top: 16px;
        }

        .back-link {
          color: #8b949e;
          font-size: 0.9rem;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: #14cbec;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
