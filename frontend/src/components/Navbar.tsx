'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  Home, Building2, Users, MessageCircle, Bell, User,
  LogOut, Search, Settings, Globe, Shield, LayoutDashboard,
  UserSearch, Calendar, Menu, X
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't show navbar on public pages or when not authenticated
  if (!isAuthenticated) return null;
  if (['/', '/login', '/register'].includes(pathname || '')) return null;

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');
  const isFemale = user?.gender === 'FEMALE';
  const isAdmin = user?.role === 'ADMIN';

  // Build sidebar items dynamically based on user role/gender
  const sidebarItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/housing', label: 'Housing', icon: Building2 },
    { href: '/people', label: 'Find People', icon: UserSearch },
    { href: '/communities', label: 'Communities', icon: Users },
    { href: '/events', label: 'Events', icon: Calendar },
    // Only show Women Only for verified female users
    ...(isFemale ? [{ href: '/women-only', label: 'Women Only', icon: Shield }] : []),
    { href: '/chat', label: 'Chat', icon: MessageCircle },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/profile', label: 'Profile', icon: User },
    // Show admin panel for admin users
    ...(isAdmin ? [{ href: '/admin', label: 'Admin Panel', icon: LayoutDashboard }] : []),
  ];

  const mobileNavItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/housing', label: 'Housing', icon: Building2 },
    { href: '/people', label: 'People', icon: UserSearch },
    { href: '/communities', label: 'Groups', icon: Users },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* ─── Mobile Menu Override Overlay ─── */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 z-[55] backdrop-blur-sm transition-all"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ─── Sidebar (Desktop & Mobile Drawer) ─── */}
      <nav style={{
        position: 'fixed', left: 0, top: 0, height: '100%', width: 220,
        background: 'var(--bg-sidebar)', backdropFilter: 'var(--blur-effect)', WebkitBackdropFilter: 'var(--blur-effect)', borderRight: '1px solid var(--border-light)', zIndex: 60,
      }} className={`flex flex-col transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Mobile Close Button */}
        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden absolute top-4 right-4 p-2 text-slate-500">
          <X size={20} />
        </button>

        {/* Logo */}
        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '20px 24px 8px', textDecoration: 'none', display: 'block' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em', marginTop: '10px' }}>LocalLoop</div>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginTop: 2 }}>Relocation Concierge</div>
        </Link>

        {/* Nav Items */}
        <div style={{ flex: 1, padding: '24px 12px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {sidebarItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                borderRadius: 12, fontSize: 13, fontWeight: active ? 600 : 500,
                color: active ? 'var(--primary)' : '#64748b',
                background: active ? 'rgba(99,102,241,0.08)' : 'transparent',
                textDecoration: 'none', position: 'relative', transition: 'all 0.15s',
              }}>
                <Icon size={18} />
                {item.label}
                {active && <div style={{
                  position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 20, borderRadius: '3px 0 0 3px', background: 'var(--primary)',
                }} />}
              </Link>
            );
          })}
        </div>

        {/* User + Verification Badge */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
              background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', flexShrink: 0,
            }}>{(user?.name || 'U').charAt(0)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {user?.name || 'User'}
                {user?.isVerified && (
                  <span style={{
                    width: 14, height: 14, borderRadius: '50%', background: 'var(--success)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, color: '#fff', flexShrink: 0,
                  }}>✓</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {isAdmin ? 'Admin' : user?.isVerified ? 'Verified' : 'Unverified'}
              </div>
            </div>
          </div>
          <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            width: '100%', fontSize: 12, color: 'var(--danger)', background: 'none',
            border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', borderRadius: 8,
          }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      {/* ─── Desktop Top Bar ─── */}
      <div style={{
        position: 'fixed', top: 0, left: 220, right: 0, height: 52,
        background: 'var(--bg-sidebar)', backdropFilter: 'var(--blur-effect)', WebkitBackdropFilter: 'var(--blur-effect)',
        borderBottom: '1px solid var(--border-light)', zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
      }} className="hidden lg:!flex">
        <div style={{ position: 'relative', width: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Search neighborhoods or streets..." style={{
            width: '100%', padding: '9px 16px 9px 40px', borderRadius: 10,
            border: '1px solid var(--border)', background: 'rgba(0,0,0,0.03)', fontSize: 14,
            outline: 'none', color: 'var(--text-primary)', fontFamily: 'inherit',
          }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {[{ href: '/housing', label: 'Housing' }, { href: '/communities', label: 'Communities' }].map((l) => (
            <Link key={l.href} href={l.href} style={{
              fontSize: 14, fontWeight: 500, color: isActive(l.href) ? 'var(--primary)' : 'var(--text-secondary)',
              textDecoration: isActive(l.href) ? 'none' : 'none',
            }}>{l.label}</Link>
          ))}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><Globe size={20} /></button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><Settings size={20} /></button>
          {!user?.isOnboarded && (
            <Link href="/onboarding" style={{
              background: 'var(--primary)', color: '#fff', padding: '8px 20px',
              borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}>Complete Profile</Link>
          )}
        </div>
      </div>

      {/* ─── Mobile Top Bar ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 56,
        background: 'var(--bg-sidebar)', backdropFilter: 'var(--blur-effect)', WebkitBackdropFilter: 'var(--blur-effect)',
        borderBottom: '1px solid var(--border-light)', zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
      }} className="lg:!hidden">
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-500">
          <Menu size={22} />
        </button>
        <Link href="/dashboard" style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', textDecoration: 'none', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>LocalLoop</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/notifications"><Bell size={20} style={{ color: '#64748b' }} /></Link>
          <Link href="/profile" style={{
            width: 32, height: 32, borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
            background: 'var(--primary)', color: '#fff', textDecoration: 'none'
          }}>{(user?.name || 'U').charAt(0)}</Link>
        </div>
      </nav>

      {/* ─── Mobile Bottom Nav (Optional overlay navigation layer) ─── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 64,
        background: 'var(--bg-card)', borderTop: '1px solid var(--border)', zIndex: 50,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        paddingBottom: 'env(safe-area-inset-bottom, 4px)',
      }} className="lg:!hidden">
        {mobileNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              color: active ? 'var(--primary)' : 'var(--text-muted)', fontSize: 10, fontWeight: 500,
              textDecoration: 'none',
            }}>
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
