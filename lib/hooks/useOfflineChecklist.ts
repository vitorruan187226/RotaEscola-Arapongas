'use client';

import { get, set, del } from 'idb-keyval';

export function useOfflineChecklist(motoristaId: string | null) {
  const getStoreKey = () => `offline_checklist_${motoristaId}`;

  const saveOffline = async (rotas: any[]) => {
    if (!motoristaId) return;
    try {
      await set(getStoreKey(), rotas);
    } catch (err) {
      console.error('Erro ao salvar no IndexedDB:', err);
    }
  };

  const loadOffline = async (): Promise<any[] | null> => {
    if (!motoristaId) return null;
    try {
      return await get(getStoreKey()) || null;
    } catch (err) {
      console.error('Erro ao carregar do IndexedDB:', err);
      return null;
    }
  };

  const clearOffline = async () => {
    if (!motoristaId) return;
    try {
      await del(getStoreKey());
    } catch (err) {
      console.error('Erro ao limpar do IndexedDB:', err);
    }
  };

  return { saveOffline, loadOffline, clearOffline };
}
