'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface GPSPayload {
  lat: number;
  lng: number;
  speed: number | null;
  bearing: number | null;
  timestamp: string;
}

export function useGPSBroadcast(rotaId: string | null, motoristaId: string | null) {
  const [error, setError] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastPersistRef = useRef<number>(0);
  const supabase = createClient();

  useEffect(() => {
    if (!rotaId || !motoristaId) {
      setIsBroadcasting(false);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    const channel = supabase.channel(`gps:${rotaId}`, {
      config: {
        broadcast: { ack: false }
      }
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsBroadcasting(true);
        setError(null);
        
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude, speed, heading } = position.coords;
            const payload: GPSPayload = {
              lat: latitude,
              lng: longitude,
              speed: speed,
              bearing: heading,
              timestamp: new Date().toISOString()
            };

            // Envia para o realtime channel (latência < 1s)
            channel.send({
              type: 'broadcast',
              event: 'position_update',
              payload
            });

            // Persiste no banco a cada 60 segundos
            const now = Date.now();
            if (now - lastPersistRef.current > 60000) {
              lastPersistRef.current = now;
              await supabase.from('localizacao_veiculo').insert({
                rota_id: rotaId,
                latitude: latitude,
                longitude: longitude,
                velocidade: speed, // Assuming we have these or we can just send null if they don't exist
                timestamp_registro: payload.timestamp
              });
            }
          },
          (err) => {
            console.error('Erro de GPS:', err);
            setError('Permissão de GPS negada ou sinal fraco.');
          },
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000
          }
        );
      }
    });

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      supabase.removeChannel(channel);
      setIsBroadcasting(false);
    };
  }, [rotaId, motoristaId, supabase]);

  return { isBroadcasting, error };
}
