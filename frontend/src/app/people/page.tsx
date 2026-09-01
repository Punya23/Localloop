'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { api } from '@/lib/api';
import {
  Search, MapPin, GraduationCap, Briefcase, Filter,
  Shield, MessageCircle, Star, Sparkles, SlidersHorizontal,
  Users, Heart, ArrowRight, UserCheck, ChevronDown,
} from 'lucide-react';

/* ── People Page ─────────────────────────────────────────── */

export default function PeoplePage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAi, setLoadingAi] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch AI smart matches
  useEffect(() => {
    if (!isReady || !user) return;
    setLoadingAi(true);
    api.getAIMatches('friends', 6)
      .then((res) => {
        setAiMatches(res || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingAi(false));
  }, [isReady, user]);

  // Fetch users from backend search endpoint
  useEffect(() => {
    if (!isReady || !user) return;

    setLoading(true);
    const params: Record<string, string | number> = { page, limit: 20 };
    if (search) params.search = search;
    if (cityFilter) params.city = cityFilter;
    if (roleFilter) params.role = roleFilter;

    api.searchUsers(params)
      .then((res) => {
        setAllUsers(res.data || []);
        setTotalPages(res.meta?.totalPages || 1);
      })
      .catch(() => setAllUsers([]))
      .finally(() => setLoading(false));
  }, [isReady, user, page, search, cityFilter, roleFilter]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  if (!isReady || !user) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ height: '32px', width: '300px', borderRadius: '12px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
      </div>
    );
  }

  const roleEmoji: Record<string, string> = {
    STUDENT: '🎓',
    PROFESSIONAL: '💼',
    INTERN: '🔬',
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-6 py-6 pb-28">

      {/* ── Header ── */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.5px' }}>
          <Users size={32} style={{ color: 'var(--primary)' }} /> Find Your Tribe
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
          Discover and connect with like-minded people. Build your community.
        </p>
      </div>

      {/* ── 🔥 AI Vibe Matched ── */}
      {!loadingAi && aiMatches.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={20} style={{ color: '#ec4899' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 700, background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              Top Vibe Matches
            </h2>
            <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', fontWeight: 600, marginLeft: '8px' }}>
              AI Recommended
            </span>
          </div>

          <div style={{ 
            display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', 
            scrollbarWidth: 'none', msOverflowStyle: 'none' 
          }}>
            {aiMatches.map((m: any) => (
              <div key={m.id} style={{
                minWidth: '260px', maxWidth: '260px', background: 'rgba(255, 255, 255, 0.03)', 
                backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '20px', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative', overflow: 'hidden'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
              >
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f472b6, #8b5cf6)',
                    fontSize: '22px', fontWeight: 700, color: '#fff',
                    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                  }}>
                    {m.avatar ? <img src={m.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'cover' }} /> : (m.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>{m.name}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{m.compatibilityScore}% Match</span>
                    </div>
                  </div>
                </div>

                {m.matchReasons && m.matchReasons.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    {m.matchReasons.map((reason: string, idx: number) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ec4899' }} />
                        {reason}
                      </div>
                    ))}
                  </div>
                )}

                <Link href={`/chat?userId=${m.id}&name=${encodeURIComponent(m.name || '')}`} style={{
                  marginTop: 'auto', paddingTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '10px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
                  background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', textDecoration: 'none',
                  transition: 'all 0.2s', border: '1px solid rgba(139, 92, 246, 0.2)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#8b5cf6'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.color = '#8b5cf6'; }}
                >
                  <MessageCircle size={15} /> Slide into DMs
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Community Search ── */}
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Explore Network</h2>
      {/* ── Search + Filters ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, university, company..."
            style={{
              width: '100%', padding: '11px 14px 11px 40px', borderRadius: '12px',
              border: '1px solid var(--border)', fontSize: '14px', outline: 'none',
              fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', background: 'var(--bg-primary)',
            }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <select
            value={cityFilter}
            onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
            style={{
              padding: '11px 32px 11px 14px', borderRadius: '12px',
              border: '1px solid var(--border)', fontSize: '14px', outline: 'none',
              fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', background: 'var(--bg-primary)',
              appearance: 'none' as const, cursor: 'pointer', minWidth: '120px',
            }}
          >
            <option value="">All Cities</option>
            <option>Pune</option>
            <option>Mumbai</option>
            <option>Bangalore</option>
            <option>Delhi</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            style={{
              padding: '11px 32px 11px 14px', borderRadius: '12px',
              border: '1px solid var(--border)', fontSize: '14px', outline: 'none',
              fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', background: 'var(--bg-primary)',
              appearance: 'none' as const, cursor: 'pointer', minWidth: '130px',
            }}
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="INTERN">Intern</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* ── Results Count ── */}
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {loading ? 'Searching...' : `${allUsers.length} people found`}
      </p>

      {/* ── Loading Skeleton ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: '100px', borderRadius: '16px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : allUsers.length === 0 ? (
        /* ── Empty State ── */
        <div style={{
          textAlign: 'center', padding: '60px 20px', background: 'var(--bg-primary)',
          borderRadius: '20px', border: '1px solid var(--border)',
        }}>
          <Users size={40} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>No people found</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Try adjusting your filters or search query</p>
        </div>
      ) : (
        /* ── User Cards ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {allUsers.map((u: any) => (
            <div key={u.id} style={{
              display: 'flex', gap: '16px', background: 'var(--bg-card)', borderRadius: '16px',
              padding: '18px', border: '1px solid var(--border)', transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Avatar */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '14px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                fontSize: '22px', fontWeight: 700, color: 'var(--primary)',
              }}>
                {u.avatar ? (
                  <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '14px', objectFit: 'cover' }} />
                ) : (
                  (u.name || '?').charAt(0).toUpperCase()
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{u.name}</h3>
                  {u.isVerified && <Shield size={14} style={{ color: 'var(--success)' }} />}
                  {u.isMentor && <Star size={14} style={{ color: 'var(--warning)' }} />}
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap', marginBottom: '6px' }}>
                  {u.role && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{roleEmoji[u.role] || '👤'}</span> {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
                    </span>
                  )}
                  {u.city && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {u.city}
                    </span>
                  )}
                  {u.university && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <GraduationCap size={12} /> {u.university}
                    </span>
                  )}
                  {u.company && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Briefcase size={12} /> {u.company}
                    </span>
                  )}
                </div>
                {/* Interests */}
                {u.interests?.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {u.interests.slice(0, 4).map((interest: string) => (
                      <span key={interest} style={{
                        fontSize: '11px', padding: '2px 10px', borderRadius: '20px',
                        background: 'var(--border-light)', color: '#64748b', fontWeight: 500,
                      }}>{interest}</span>
                    ))}
                    {u.interests.length > 4 && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center' }}>+{u.interests.length - 4}</span>
                    )}
                  </div>
                )}
                {u.bio && (
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: 1.4 }}>
                    {u.bio.length > 80 ? u.bio.slice(0, 80) + '...' : u.bio}
                  </p>
                )}
              </div>

              {/* Action */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                {u.reputation && (
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px',
                    background: 'rgba(99,102,241,0.08)', color: 'var(--primary)',
                  }}>{u.reputation.points} pts</span>
                )}
                <Link href={`/chat?userId=${u.id}&name=${encodeURIComponent(u.name || '')}`} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                  background: 'var(--primary)', color: '#fff', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}>
                  <MessageCircle size={14} /> Message
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '28px' }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            style={{
              padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              background: page <= 1 ? 'var(--border-light)' : '#fff', color: page <= 1 ? '#cbd5e1' : 'var(--primary)',
              border: '1px solid var(--border)', cursor: page <= 1 ? 'default' : 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >Previous</button>
          <span style={{ padding: '8px 14px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            style={{
              padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              background: page >= totalPages ? 'var(--border-light)' : 'var(--primary)', color: page >= totalPages ? '#cbd5e1' : '#fff',
              border: 'none', cursor: page >= totalPages ? 'default' : 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >Next</button>
        </div>
      )}
    </div>
  );
}
