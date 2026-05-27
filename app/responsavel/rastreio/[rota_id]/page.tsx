'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client';
import { MapPin, Navigation, Bus, Clock, CalendarX, CheckCircle, RotateCcw, AlertTriangle } from 'lucide-react';

export default function RastreioAusenciaPage() {
  const params = useParams();
  const router = useRouter();
  const rawRotaId = params.rota_id as string;
  // Decodifica rota_id caso venha com caracteres especiais de URL
  const rotaId = decodeURIComponent(rawRotaId);

  const supabase = createClient();

  const [loadingAusencia, setLoadingAusencia] = useState(false);
  const [ausenciaNotificada, setAusenciaNotificada] = useState(false);
  const [tempoEstimado, setTempoEstimado] = useState(12); // Em minutos
  const [msg, setMsg] = useState<{ type: 'info' | 'success'; text: string } | null>(null);

  // Efeito para simular o ônibus se aproximando no mapa a cada 15 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setTempoEstimado(prev => (prev > 1 ? prev - 1 : 12));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleReportarAusencia = async () => {
    setLoadingAusencia(true);
    setMsg(null);

    try {
      // Dispara o update na tabela de presença diária do Supabase
      const { data, error } = await supabase
        .from('presencas_diarias')
        .upsert({
          aluno_id: 'aluno-01', // ID fixado do Thiago para fins de demonstração
          data_presenca: new Date().toISOString().split('T')[0],
          compareceu: false, // Indica ausência temporária
          motivo: 'Notificado pelo responsável',
        });

      if (error) throw error;

      setAusenciaNotificada(true);
      setMsg({
        type: 'success',
        text: 'Ausência enviada! O nome do aluno foi temporariamente ocultado da rota do motorista.'
      });

    } catch (err: any) {
      console.log('Utilizando modo simulação para registro de falta/ausência temporária:', err.message);
      
      // Fallback local simulado para fins de demonstração
      setTimeout(() => {
        setAusenciaNotificada(true);
        setMsg({
          type: 'success',
          text: '[MOCK] Ausência notificada com sucesso! A central e o motorista foram avisados.'
        });
      }, 1000);
    } finally {
      setLoadingAusencia(false);
    }
  };

  const handleDesfazerAusencia = async () => {
    setLoadingAusencia(true);
    setMsg(null);

    try {
      // Remove o registro de ausência do banco para restaurar
      const { error } = await supabase
        .from('presencas_diarias')
        .delete()
        .eq('aluno_id', 'aluno-01')
        .eq('data_presenca', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      setAusenciaNotificada(false);
      setMsg({
        type: 'info',
        text: 'Ausência cancelada. O aluno está ativo novamente na lista de embarque de hoje.'
      });

    } catch (err) {
      setTimeout(() => {
        setAusenciaNotificada(false);
        setMsg({
          type: 'info',
          text: '[MOCK] Presença restaurada! O aluno voltou a constar no checklist do veículo.'
        });
      }, 1000);
    } finally {
      setLoadingAusencia(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho */}
      <div className="px-1 flex justify-between items-start">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 leading-tight">
            Rastreamento de Rota
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe o veículo da {rotaId} em tempo real.
          </p>
        </div>
      </div>

      {/* RENDERIZAÇÃO DO MAPBOX PLACEHOLDER INTERATIVO */}
      <div className="w-full aspect-[4/3] rounded-2xl border border-slate-200 bg-slate-100 relative overflow-hidden shadow-sm">
        
        {/* Simulação de Traçados de Ruas de Arapongas (Grade SVG decorativa) */}
        <svg className="absolute inset-0 w-full h-full text-slate-350 opacity-30" xmlns="http://www.w3.org/2000/svg">
          {/* Ruas Horizontais */}
          <line x1="0" y1="50" x2="400" y2="50" stroke="currentColor" strokeWidth="6" />
          <line x1="0" y1="120" x2="400" y2="120" stroke="currentColor" strokeWidth="8" />
          <line x1="0" y1="210" x2="400" y2="210" stroke="currentColor" strokeWidth="6" />
          {/* Ruas Verticais */}
          <line x1="80" y1="0" x2="80" y2="300" stroke="currentColor" strokeWidth="6" />
          <line x1="180" y1="0" x2="180" y2="300" stroke="currentColor" strokeWidth="10" />
          <line x1="310" y1="0" x2="310" y2="300" stroke="currentColor" strokeWidth="6" />
          {/* Rota traçada (Linha azul pontilhada) */}
          <path d="M 80,210 L 180,210 L 180,120 L 310,120" fill="none" stroke="#2563EB" strokeWidth="4" strokeDasharray="6" />
        </svg>

        {/* Marcador: Escola (Destino final) */}
        <div className="absolute top-[96px] left-[295px] flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-md animate-pulse">
            <span className="text-white text-xs font-bold">🏫</span>
          </div>
          <span className="text-[8px] bg-slate-900 text-white font-extrabold px-1 rounded mt-0.5 whitespace-nowrap shadow">
            Escola D. Folador
          </span>
        </div>

        {/* Marcador: Ponto de Embarque do Estudante */}
        <div className="absolute top-[186px] left-[65px] flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-md">
            <MapPin size={15} className="text-white" />
          </div>
          <span className="text-[8px] bg-slate-900 text-white font-extrabold px-1 rounded mt-0.5 whitespace-nowrap shadow">
            Seu Ponto
          </span>
        </div>

        {/* Marcador: Ônibus Escolar em Movimento */}
        {/* A posição do ônibus é alterada de forma sutil baseada no tempoEstimado */}
        <div 
          className="absolute flex flex-col items-center transition-all duration-1000 z-20"
          style={{
            top: tempoEstimado > 6 ? '194px' : '104px',
            left: tempoEstimado > 6 
              ? `${120 + (12 - tempoEstimado) * 8}px` 
              : `${180 + (6 - tempoEstimado) * 20}px`
          }}
        >
          <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center shadow-lg">
            <Bus size={18} className="text-amber-500 animate-bounce" />
          </div>
          <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full mt-0.5 shadow whitespace-nowrap uppercase tracking-wider">
            Em Movimento
          </span>
        </div>

        {/* Detalhe de Bússola e Escala */}
        <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur px-2 py-1 rounded-md border border-slate-200/60 text-[8px] text-slate-500 font-mono shadow-sm flex items-center gap-1.5">
          <Navigation size={8} className="rotate-45 text-blue-600" />
          <span>MAPBOX API ACTIVE</span>
        </div>
      </div>

      {/* Painel do Estimador de Tempo */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">
              Chegada ao Ponto
            </h3>
            <span className="text-sm font-extrabold text-slate-900 mt-1 block">
              Aproximando-se da sua rua
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-slate-900 font-mono">
            ~{tempoEstimado}
          </span>
          <span className="text-xs text-slate-500 font-semibold block leading-none">
            minutos
          </span>
        </div>
      </div>

      {/* Banner de Feedback de Ausência */}
      {msg && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 shadow-sm animate-fadeIn border ${
          msg.type === 'success'
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          {msg.type === 'success' ? (
            <CalendarX size={16} className="shrink-0 mt-0.5" />
          ) : (
            <CheckCircle size={16} className="shrink-0 mt-0.5" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* CONTROLE DE AUSÊNCIA TEMPORÁRIA */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-800 rounded-xl text-amber-500">
            <CalendarX size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Comunicado de Ausência Diária
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Caso seu filho vá faltar à aula hoje ou não precise utilizar o transporte escolar, avise o motorista para otimizar o tempo da rota.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800">
          {ausenciaNotificada ? (
            <button
              disabled={loadingAusencia}
              onClick={handleDesfazerAusencia}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <RotateCcw size={14} className="text-amber-500" />
              <span>{loadingAusencia ? 'Atualizando...' : 'Desfazer Notificação de Ausência'}</span>
            </button>
          ) : (
            <button
              disabled={loadingAusencia}
              onClick={handleReportarAusencia}
              className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <CalendarX size={14} />
              <span>{loadingAusencia ? 'Processando...' : 'Meu filho não vai hoje'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
