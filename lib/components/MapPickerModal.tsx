'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { X, Check } from 'lucide-react';

const MapPickerInner = dynamic(() => import('./MapPickerInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <span className="text-sm font-bold text-slate-500 animate-pulse">Carregando mapa...</span>
    </div>
  )
});

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export function MapPickerModal({ isOpen, onClose, onConfirm, initialLat, initialLng }: MapPickerModalProps) {
  // Padrão: Centro de Arapongas, PR
  const defaultLat = -23.4178;
  const defaultLng = -51.4269;
  
  const [selectedLat, setSelectedLat] = useState<number>(initialLat || defaultLat);
  const [selectedLng, setSelectedLng] = useState<number>(initialLng || defaultLng);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-fadeIn">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-black text-slate-900 text-sm">Selecione o Local no Mapa</h3>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
              Clique no mapa para posicionar o pino com precisão
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 w-full h-[60vh] min-h-[300px] relative bg-slate-100">
          <MapPickerInner 
            initialLat={selectedLat} 
            initialLng={selectedLng} 
            onLocationSelect={(lat, lng) => {
              setSelectedLat(lat);
              setSelectedLng(lng);
            }} 
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-150 flex items-center justify-between bg-slate-50">
          <div className="text-[10px] font-mono text-slate-500 bg-white px-3 py-1.5 rounded-lg border">
            Lat: {selectedLat.toFixed(6)} | Lng: {selectedLng.toFixed(6)}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(selectedLat, selectedLng)}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
            >
              <Check size={14} />
              Confirmar Local
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
