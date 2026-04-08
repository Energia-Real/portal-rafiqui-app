'use client';

import { useSyncExternalStore } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function useHydration() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const unsub = useAuthStore.persist.onFinishHydration(onStoreChange);
      return unsub;
    },
    () => useAuthStore.persist.hasHydrated(),
    () => false
  );
}
