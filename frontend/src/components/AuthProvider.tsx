'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

/**
 * AuthProvider — ONLY handles auth state hydration.
 * NO routing logic here. Each page handles its own guards.
 * This is architectural separation: auth state ≠ route protection.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading spinner ONLY during initial auth hydration
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '3px solid var(--border)', borderTopColor: 'var(--primary)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Loading...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
