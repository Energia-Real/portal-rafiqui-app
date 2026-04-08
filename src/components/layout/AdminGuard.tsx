'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useHydration } from '@/hooks/useHydration';

const PROTECTED_PATH = '/panel-interno';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydration();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated && pathname.startsWith(PROTECTED_PATH)) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, pathname, router]);

  return <>{children}</>;
}
