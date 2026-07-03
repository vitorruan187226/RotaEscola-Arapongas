'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface GPSPayload {
  lat: number;
  lng: number;
  speed: number | null;
  bearing: number | null;
  timestamp: string;
}

export function useGPSListener(rotaId: string | null) {
  const [position, setPosition] = useState<GPSPayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!rotaId) {
      setIsConnected(false);
      return;
    }

    const channel = supabase.channel(`gps:${rotaId}`);

    channel
      .on('broadcast', { event: 'position_update' }, (payload) => {
        setPosition(payload.payload as GPSPayload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [rotaId, supabase]);

  return { position, isConnected };
}
