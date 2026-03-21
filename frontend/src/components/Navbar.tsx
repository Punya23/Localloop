'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  Home,
  Building2,
  Users,
  MessageCircle,
  Calendar,
  Trophy,
  User,
  LogOut,
  Menu,
  X,
  MapPin,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/housing', label: 'Housing', icon: Building2 },
  { href: '/communities', label: 'Communities', icon: Users },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="fixed left-0 top-0 h-full w-[240px] hidden lg:flex flex-col z-50"
           style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 px-6 py-6 no-underline">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
            <MapPin size={22} color="white" />
          </div>
          <span className="text-xl font-bold gradient-text">LocalLoop</span>
        </Link>

        {/* Nav Items */}
        <div className="flex-1 px-3 py-2 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all duration-200"
                style={{
                  color: isActive ? 'var(--primary-light)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                }}
              >
                <Icon size={20} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl no-underline transition-all duration-200"
            style={{ color: 'var(--text-secondary)' }}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                 style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.reputation?.level || 'Explorer'}</p>
            </div>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-sm mt-1 transition-all duration-200"
            style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="fixed top-0 left-0 right-0 lg:hidden z-50 flex items-center justify-between px-4 py-3"
           style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/dashboard" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
            <MapPin size={18} color="white" />
          </div>
          <span className="text-lg font-bold gradient-text">LocalLoop</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
          <div className="absolute top-[60px] left-0 right-0 p-4"
               style={{ background: 'var(--bg-secondary)' }}
               onClick={(e) => e.stopPropagation()}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline"
                  style={{
                    color: isActive ? 'var(--primary-light)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  }}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm no-underline"
                style={{ color: 'var(--text-secondary)' }}
              >
                <User size={20} />
                Profile
              </Link>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sm"
                style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
