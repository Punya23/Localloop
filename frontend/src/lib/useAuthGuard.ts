import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface UseAuthGuardOptions {
  /** Require the user to be onboarded */
  requireOnboarded?: boolean;
  /** Require specific gender for access */
  requireGender?: 'FEMALE' | 'MALE';
  /** Require user to be verified (ID proof approved) */
  requireVerified?: boolean;
  /** Require admin role */
  requireAdmin?: boolean;
}

/**
 * Reusable auth guard hook for protected pages.
 * Returns { user, isAuthenticated, isReady, accessDenied, denyReason }
 * 
 * Usage:
 *   const { user, isReady, accessDenied } = useAuthGuard({ requireOnboarded: true });
 *   if (!isReady) return <Spinner />;
 *   if (accessDenied) return <AccessDenied reason={denyReason} />;
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  const isReady = !isLoading;
  let accessDenied = false;
  let denyReason = '';

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Redirect unboarded users to onboarding (unless we're on the onboarding page)
    if (options.requireOnboarded && !user?.isOnboarded) {
      router.replace('/onboarding');
    }
  }, [isLoading, isAuthenticated, user, router, options.requireOnboarded]);

  if (isReady && isAuthenticated) {
    if (options.requireAdmin && user?.role !== 'ADMIN') {
      accessDenied = true;
      denyReason = 'Admin access required';
    }
    if (options.requireGender && user?.gender !== options.requireGender) {
      accessDenied = true;
      denyReason = `This area is restricted to ${options.requireGender === 'FEMALE' ? 'women' : 'men'} users`;
    }
    if (options.requireVerified && !user?.isVerified) {
      accessDenied = true;
      denyReason = 'ID verification required. Please upload your ID proof from your profile.';
    }
  }

  return {
    user,
    isAuthenticated,
    isReady,
    accessDenied,
    denyReason,
  };
}
