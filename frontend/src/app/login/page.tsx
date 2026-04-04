'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { MapPin, Mail, Lock, ArrowRight, Eye, EyeOff, Shield, ChevronDown, ChevronUp } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const { login, isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'ADMIN') {
        router.replace('/admin');
      } else {
        router.replace(user?.isOnboarded ? '/dashboard' : '/onboarding');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const state = useAuthStore.getState();
      if (state.user?.role === 'ADMIN') {
        router.push('/admin');
      } else if (state.user?.isOnboarded) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-30%] right-[-20%] w-[600px] h-[600px] rounded-full opacity-10 blur-[120px]" style={{ background: 'var(--primary)' }} />
      <div className="absolute bottom-[-30%] left-[-20%] w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]" style={{ background: 'var(--accent)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
            <MapPin size={26} color="white" />
          </div>
          <span className="text-3xl font-bold gradient-text">LocalLoop</span>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
          <p className="text-center mb-8" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sign in to continue your journey</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setIsAdminLogin(false); }}
                  placeholder="you@example.com"
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-11 pr-11"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2" disabled={loading}
              style={isAdminLogin ? { background: 'linear-gradient(135deg, #1e1b4b, #312e81)' } : {}}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : isAdminLogin ? (
                <><Shield size={18} /> Sign In as Admin</>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold no-underline" style={{ color: 'var(--primary-light)' }}>
            Create one
          </Link>
        </p>

        {/* ══════════ ADMIN ACCESS PANEL ══════════ */}
        <div style={{ marginTop: '24px' }}>
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: '14px', fontSize: '13px', fontWeight: 600,
              background: 'rgba(30, 27, 75, 0.06)', color: '#64748b',
              border: '1px dashed rgba(99, 102, 241, 0.25)', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            }}
          >
            <Shield size={14} style={{ color: '#6366f1' }} />
            Admin Login
            {showAdminPanel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdminPanel && (
            <div style={{
              marginTop: '12px', padding: '20px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 8px 32px rgba(30, 27, 75, 0.25)',
              animation: 'slideDown 0.2s ease-out',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.3)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Shield size={18} style={{ color: '#a5b4fc' }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#e0e7ff', margin: 0 }}>
                    Admin Dashboard
                  </p>
                  <p style={{ fontSize: '11px', color: '#818cf8', margin: 0 }}>
                    Authorized personnel only
                  </p>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                setEmail(adminEmail);
                setPassword(adminPassword);
                setIsAdminLogin(true);
                // Trigger login directly
                setError('');
                setLoading(true);
                login(adminEmail, adminPassword)
                  .then(() => {
                    const state = useAuthStore.getState();
                    if (state.user?.role === 'ADMIN') {
                      router.push('/admin');
                    } else {
                      setError('This account does not have admin privileges.');
                      setLoading(false);
                    }
                  })
                  .catch((err: any) => {
                    setError(err.message || 'Login failed');
                    setLoading(false);
                  });
              }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#818cf8' }} />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Admin email"
                    required
                    style={{
                      width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.12)', fontSize: '13px', outline: 'none',
                      fontFamily: 'Inter, sans-serif', color: '#e0e7ff',
                      background: 'rgba(255,255,255,0.06)', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#818cf8' }} />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Admin password"
                    required
                    style={{
                      width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.12)', fontSize: '13px', outline: 'none',
                      fontFamily: 'Inter, sans-serif', color: '#e0e7ff',
                      background: 'rgba(255,255,255,0.06)', boxSizing: 'border-box',
                    }}
                  />
                </div>

                {error && isAdminLogin && (
                  <div style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '11px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading && isAdminLogin ? (
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite' }} />
                  ) : (
                    <><Shield size={15} /> Sign In as Admin</>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        <style>{`
          @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
