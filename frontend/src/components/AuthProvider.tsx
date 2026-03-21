'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      // After checking auth, if still not authenticated (no backend), set demo user
      const state = useAuthStore.getState();
      if (!state.isAuthenticated) {
        useAuthStore.setState({
          user: {
            id: 'demo-user',
            name: 'Punya',
            email: 'punya@localloop.com',
            city: 'Pune',
            preferredArea: 'Hinjewadi',
            isOnboarded: true,
            isMentor: false,
            isWomenMode: false,
            gender: 'female',
            reputation: { points: 450, level: 'EXPLORER' },
          },
          isAuthenticated: true,
          isLoading: false,
        });
      }
    };
    init();
  }, [checkAuth]);

  return <>{children}</>;
}
