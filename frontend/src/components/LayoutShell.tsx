'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Navbar from './Navbar';
import AIChatbot from './AIChatbot';

// Pages where we hide navbar and don't apply sidebar margins
const PUBLIC_PATHS = ['/', '/login', '/register', '/onboarding'];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  const isPublicPage = PUBLIC_PATHS.includes(pathname || '');
  // Show navbar only when authenticated AND not on a public page
  const showNavbar = isAuthenticated && !isPublicPage;

  return (
    <>
      {showNavbar && <Navbar />}
      <main
        className={showNavbar ? 'md:ml-[220px] min-h-screen pt-[56px] pb-[72px] md:pt-[52px] md:pb-0' : 'min-h-screen'}
      >
        {children}
      </main>
      {showNavbar && <AIChatbot />}
    </>
  );
}

