'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client';
import {
  MapPin, Navigation, Bus, Clock, CalendarX,
  CheckCircle, RotateCcw, WifiOff
} from 'lucide-react';

// ─── Contrato de dados (Lei 4 — Tipagem estrita) ──────────────────────────────
interface LocalizacaoVeiculo {
  latitude: number;
  longitude: number;
  velocidade_kmh: number;
  atualizado_em: string;
  foraDeTurno: boolean;
}

const getLocalDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function RastreioAusenciaPage() {
  const params   = useParams();
  const rawRotaId = params.rota_id as string;
  const rotaId   = decodeURIComponent(rawRotaId);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const alunoId = searchParams.get('alunoId') || 'aluno-01';

  const [localizacao,      setLocalizacao]      = useState<LocalizacaoVeiculo | null>(null);
  const [isRouteActive,    setIsRouteActive]    = useState<boolean>(true);
  const [loadingLocalizacao, setLoadingLocalizacao] = useState(true);
  const [loadingAusencia,  setLoadingAusencia]  = useState(false);
  const [ausenciaNotificada, setAusenciaNotificada] = useState(false);
  const [tempoEstimado,    setTempoEstimado]    = useState(12);
  const [msg, setMsg] = useState<{ type: 'info' | 'success'; text: string } | null>(null);

  // ─── Busca localização real do banco ─────────────────────────────────────
  useEffect(() => {
    async function fetchLocalizacao() {
      try {
        // Busca se a rota está ativa no Supabase
        if (rotaId && rotaId.length > 10) {
          const { data: routeData } = await supabase
            .from('rotas')
            .select('ativa')
            .eq('id', rotaId)
            .maybeSingle();
          if (routeData) {
            setIsRouteActive(routeData.ativa);
          }
        }

        const { data, error } = await supabase
          .from('localizacao_veiculo')
          .select('latitude, longitude, velocidade_kmh, atualizado_em')
          .eq('rota_id', rotaId)
          .order('atualizado_em', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          // Verifica se foi atualizado há menos de 2 horas (turno ativo)
          const atualizado = new Date(data.atualizado_em);
          const agora      = new Date();
          const diffHoras  = (agora.getTime() - atualizado.getTime()) / (1000 * 60 * 60);
          const foraDeTurno = diffHoras > 2;

          setLocalizacao({
            latitude:       data.latitude,
            longitude:      data.longitude,
            velocidade_kmh: data.velocidade_kmh,
            atualizado_em:  atualizado.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            foraDeTurno,
          });
        } else {
          // Sem registro no banco — veículo fora do turno
          setLocalizacao({
            latitude: -23.4178,
            longitude: -51.4269,
            velocidade_kmh: 0,
            atualizado_em: '--:--',
            foraDeTurno: true,
          });
        }
      } catch {
        setLocalizacao({
          latitude: -23.4178,
          longitude: -51.4269,
          velocidade_kmh: 0,
          atualizado_em: '--:--',
          foraDeTurno: true,
        });
      } finally {
        setLoadingLocalizacao(false);
      }
    }
    fetchLocalizacao();

    // Atualiza localização a cada 30s se o veículo estiver em turno
    const interval = setInterval(fetchLocalizacao, 30_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotaId]);

  // Simula ônibus se aproximando no mapa SVG a cada 15s
  useEffect(() => {
    if (localizacao?.foraDeTurno || !isRouteActive) return;
    const interval = setInterval(() => {
      setTempoEstimado(prev => (prev > 1 ? prev - 1 : 12));
    }, 15_000);
    return () => clearInterval(interval);
  }, [localizacao?.foraDeTurno, isRouteActive]);

  // ─── Registrar Ausência ───────────────────────────────────────────────────
  const handleReportarAusencia = async () => {
    setLoadingAusencia(true);
    setMsg(null);
    try {
      const { error } = await supabase.from('presencas_diarias').upsert({
        aluno_id:       alunoId,
        data_presenca:  getLocalDateString(),
        compareceu:     false,
        motivo:         'Notificado pelo responsável',
      });
      if (error) throw error;
      setAusenciaNotificada(true);
      setMsg({ type: 'success', text: 'Ausência enviada! O nome do aluno foi ocultado da rota do motorista por hoje.' });
    } catch {
      setTimeout(() => {
        setAusenciaNotificada(true);
        setMsg({ type: 'success', text: '[MOCK] Ausência notificada! A central e o motorista foram avisados.' });
      }, 800);
    } finally {
      setLoadingAusencia(false);
    }
  };

  const handleDesfazerAusencia = async () => {
    setLoadingAusencia(true);
    setMsg(null);
    try {
      const { error } = await supabase
        .from('presencas_diarias')
        .delete()
        .eq('aluno_id', alunoId)
        .eq('data_presenca', getLocalDateString());
      if (error) throw error;
      setAusenciaNotificada(false);
      setMsg({ type: 'info', text: 'Ausência cancelada. O aluno está ativo novamente na lista de embarque.' });
    } catch {
      setTimeout(() => {
        setAusenciaNotificada(false);
        setMsg({ type: 'info', text: '[MOCK] Presença restaurada! O aluno voltou a constar no checklist.' });
      }, 800);
    } finally {
      setLoadingAusencia(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Cabeçalho */}
      <div className="px-1">
        <h2 className="text-base font-extrabold text-slate-900 leading-tight">Rastreamento de Rota</h2>
        <p className="text-xs text-slate-500 mt-0.5">Acompanhe o veículo da {rotaId} em tempo real.</p>
      </div>

      {/* ── Mapa SVG Interativo ─────────────────────────────────────────────── */}
      <div className="w-full aspect-[4/3] rounded-2xl border border-slate-200 bg-slate-100 relative overflow-hidden shadow-sm">

        {loadingLocalizacao ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] text-slate-500 font-semibold">Localizando veículo…</span>
          </div>
        ) : (
          <>
            {/* Traçado de ruas simuladas (SVG decorativo) */}
            <svg className="absolute inset-0 w-full h-full text-slate-300 opacity-40" xmlns="http://www.w3.org/2000/svg">
              <line x1="0"   y1="50"  x2="400" y2="50"  stroke="currentColor" strokeWidth="6" />
              <line x1="0"   y1="120" x2="400" y2="120" stroke="currentColor" strokeWidth="8" />
              <line x1="0"   y1="210" x2="400" y2="210" stroke="currentColor" strokeWidth="6" />
              <line x1="80"  y1="0"   x2="80"  y2="300" stroke="currentColor" strokeWidth="6" />
              <line x1="180" y1="0"   x2="180" y2="300" stroke="currentColor" strokeWidth="10" />
              <line x1="310" y1="0"   x2="310" y2="300" stroke="currentColor" strokeWidth="6" />
              <path d="M 80,210 L 180,210 L 180,120 L 310,120" fill="none" stroke="#2563EB" strokeWidth="4" strokeDasharray="6" />
            </svg>

            {/* Marcador: Escola (destino) */}
            <div className="absolute top-[96px] left-[295px] flex flex-col items-center z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-md animate-pulse">
                <span className="text-white text-xs">🏫</span>
              </div>
              <span className="text-[8px] bg-slate-900 text-white font-extrabold px-1 rounded mt-0.5 whitespace-nowrap shadow">
                Escola D. Folador
              </span>
            </div>

            {/* Marcador: Ponto de Embarque */}
            <div className="absolute top-[186px] left-[65px] flex flex-col items-center z-10">
              <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-md">
                <MapPin size={15} className="text-white" />
              </div>
              <span className="text-[8px] bg-slate-900 text-white font-extrabold px-1 rounded mt-0.5 whitespace-nowrap shadow">
                Seu Ponto
              </span>
            </div>

            {/* Marcador: Ônibus em Movimento */}
            {!localizacao?.foraDeTurno && isRouteActive && (
              <div
                className="absolute flex flex-col items-center transition-all duration-[1000ms] z-20"
                style={{
                  top:  tempoEstimado > 6 ? '194px' : '104px',
                  left: tempoEstimado > 6
                    ? `${120 + (12 - tempoEstimado) * 8}px`
                    : `${180 + (6 - tempoEstimado) * 20}px`,
                }}
              >
                <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center shadow-lg">
                  <Bus size={18} className="text-amber-500 animate-bounce" />
                </div>
                <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full mt-0.5 shadow whitespace-nowrap uppercase tracking-wider">
                  Em Movimento
                </span>
              </div>
            )}

            {/* Overlay: veículo fora de turno ou inativo */}
            {(!isRouteActive || localizacao?.foraDeTurno) && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <WifiOff size={22} className="text-slate-400" />
                </div>
                <div className="text-center px-8">
                  <p className="text-sm font-bold text-white">
                    {!isRouteActive ? 'Motorista Fora de Rota' : 'Veículo fora do horário de turno'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {!isRouteActive 
                      ? 'O motorista desativou o início da rota no painel dele.' 
                      : 'A localização GPS não está sendo transmitida no momento.'}
                  </p>
                </div>
              </div>
            )}

            {/* Detalhe de coordenada GPS em rodapé */}
            <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur px-2 py-1 rounded-md border border-slate-200/60 text-[8px] text-slate-500 font-mono shadow-sm flex flex-col gap-0.5">
              {localizacao ? (
                <>
                  <span>Lat: {localizacao.latitude.toFixed(4)}</span>
                  <span>Lng: {localizacao.longitude.toFixed(4)}</span>
                  <span className="flex items-center gap-1">
                    <Navigation size={7} className="rotate-45 text-blue-600" />
                    {localizacao.velocidade_kmh > 0
                      ? `${localizacao.velocidade_kmh} km/h`
                      : 'Parado'}
                  </span>
                </>
              ) : (
                <span>GPS indisponível</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Painel do Estimador de Chegada ───────────────────────────────────── */}
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
              {!isRouteActive
                ? 'Fora de Rota'
                : localizacao?.foraDeTurno
                ? 'Fora do horário de operação'
                : `Atualizado às ${localizacao?.atualizado_em ?? '--:--'}`}
            </span>
          </div>
        </div>
        {!localizacao?.foraDeTurno && isRouteActive && (
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900 font-mono">~{tempoEstimado}</span>
            <span className="text-xs text-slate-500 font-semibold block leading-none">min</span>
          </div>
        )}
      </div>

      {/* ── Banner de Feedback de Ausência ───────────────────────────────────── */}
      {msg && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 shadow-sm border ${
          msg.type === 'success'
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          {msg.type === 'success'
            ? <CalendarX size={16} className="shrink-0 mt-0.5" />
            : <CheckCircle size={16} className="shrink-0 mt-0.5" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* ── CONTROLE DE AUSÊNCIA TEMPORÁRIA ──────────────────────────────────── */}
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
              Caso seu filho vá faltar à aula hoje, avise o motorista para otimizar o tempo da rota.
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
              <span>{loadingAusencia ? 'Atualizando…' : 'Desfazer Notificação de Ausência'}</span>
            </button>
          ) : (
            <button
              disabled={loadingAusencia}
              onClick={handleReportarAusencia}
              className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <CalendarX size={14} />
              <span>{loadingAusencia ? 'Processando…' : 'Meu filho não vai hoje'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
