'use client';

import dynamic from 'next/dynamic';

const RastreioMapInner = dynamic(() => import('./RastreioMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <span className="text-xs font-bold text-slate-500 animate-pulse">Carregando mapa...</span>
    </div>
  )
});

interface RastreioMapProps {
  busLat: number;
  busLng: number;
  studentLat?: number | null;
  studentLng?: number | null;
  studentName: string;
}

export function RastreioMap(props: RastreioMapProps) {
  return <RastreioMapInner {...props} />;
}
