'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { api } from '@/lib/api';
import {
  Shield, MapPin, Heart, Search, CheckCircle2, BedDouble,
  Bath, Users, Calendar, Lock, Sparkles, Loader2,
} from 'lucide-react';

export default function WomenOnlyPage() {
  const { user, isReady, accessDenied, denyReason } = useAuthGuard({
    requireGender: 'FEMALE',
    requireVerified: true,
  });

  const [housings, setHousings] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !user || accessDenied) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [housingRes, communityRes, eventRes] = await Promise.all([
          api.getHousings({ isWomenFriendly: 'true', limit: 20 }),
          api.getCommunities(),
          api.getEvents(true),
        ]);

        // Housing: take women-friendly listings
        setHousings(housingRes?.data || []);

        // Communities: filter women-only ones
        const allCommunities = Array.isArray(communityRes) ? communityRes : communityRes?.data || [];
        setCommunities(allCommunities.filter((c: any) => c.isWomenOnly));

        // Events: pick all upcoming (in future, can filter by women-only community)
        const allEvents = Array.isArray(eventRes) ? eventRes : eventRes?.data || [];
        // Show events linked to women-only communities, or standalone ones
        const womenCommunityIds = new Set(allCommunities.filter((c: any) => c.isWomenOnly).map((c: any) => c.id));
        const womenEvents = allEvents.filter((e: any) =>
          !e.communityId || womenCommunityIds.has(e.communityId)
        );
        setEvents(womenEvents);
      } catch (err) {
        console.error('Women-only page fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isReady, user, accessDenied]);

  const filteredHousings = search
    ? housings.filter((h) =>
      (h.area || '').toLowerCase().includes(search.toLowerCase()) ||
      (h.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (h.city || '').toLowerCase().includes(search.toLowerCase())
    )
    : housings;

  const handleSave = async (housingId: string) => {
    try {
      await api.saveHousing(housingId);
      setSavedIds((p) => {
        const n = new Set(p);
        n.has(housingId) ? n.delete(housingId) : n.add(housingId);
        return n;
      });
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await api.joinCommunity(communityId);
      setCommunities((prev) => prev.map((c) => c.id === communityId ? { ...c, isMember: true } : c));
    } catch (err: any) {
      alert(err.message || 'Failed to join');
    }
  };

  const handleRSVP = async (eventId: string) => {
    try {
      await api.attendEvent(eventId);
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, _count: { ...e._count, attendees: (e._count?.attendees || 0) + 1 }, attending: true } : e));
    } catch (err: any) {
      alert(err.message || 'Failed to RSVP');
    }
  };

  // Show loading spinner while checking auth
  if (!isReady) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ height: '32px', width: '300px', borderRadius: '12px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
      </div>
    );
  }

  // Show access denied if not verified female
  if (accessDenied) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
          <Shield size={48} style={{ color: '#ec4899', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Access Restricted</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
            {denyReason || 'This sanctuary is exclusive to verified female users.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/profile/verify" style={{
              display: 'block', padding: '12px', background: '#ec4899', color: '#fff',
              borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px',
            }}>
              Verify My Identity
            </Link>
            <Link href="/dashboard" style={{
              display: 'block', padding: '12px', background: 'var(--bg-primary)', color: '#64748b',
              borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', border: '1px solid var(--border)',
            }}>
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px' }}>
      {/* Hero Banner */}
      <div style={{
        borderRadius: '20px', padding: '28px', marginBottom: '24px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #ede9fe, #e0e7ff, #dbeafe)', border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Shield size={20} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>WOMEN ONLY</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Safe Spaces, <span style={{ color: 'var(--primary)' }}>Verified Homes</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          All listings verified for safety. Women-only communities and events curated just for you.
        </p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> Safety Verified
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={14} style={{ color: 'var(--primary)' }} /> Women-Only Access
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={14} style={{ color: 'var(--warning)' }} /> Curated Picks
          </span>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by location or name..."
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', background: 'var(--bg-card)' }} />
        </div>
        <button style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px', cursor: 'pointer', color: '#64748b' }}>
          <Search size={18} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '48px' }}>
          <Loader2 size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading curated content...</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* Housing Section */}
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Shield size={18} style={{ color: 'var(--success)' }} /> Women-Safe Housing
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>({filteredHousings.length})</span>
          </h2>

          {filteredHousings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '32px' }}>
              <Shield size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>No women-safe listings yet</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Check back soon — new verified listings are added daily.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
              {filteredHousings.map((h) => (
                <div key={h.id} style={{
                  background: 'var(--bg-card)', borderRadius: '16px', overflow: 'hidden',
                  border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <div style={{
                    height: '200px',
                    backgroundImage: h.images?.[0] ? `url(${h.images[0]})` : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                    backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative',
                  }}>
                    {h.isVerified && (
                      <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(99,102,241,0.9)', color: '#fff' }}>VERIFIED</div>
                    )}
                    <div style={{
                      position: 'absolute', top: h.isVerified ? '40px' : '12px', left: '12px', display: 'flex', alignItems: 'center', gap: '4px',
                      background: 'rgba(255,255,255,0.95)', padding: '4px 10px', borderRadius: '6px',
                      fontSize: '11px', fontWeight: 600, color: 'var(--success)',
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} /> WOMEN SAFE
                    </div>
                    <button onClick={() => handleSave(h.id)} style={{
                      position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)',
                      border: 'none', borderRadius: '8px', width: '32px', height: '32px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      color: savedIds.has(h.id) ? 'var(--primary)' : 'var(--text-muted)',
                    }}>
                      <Heart size={16} fill={savedIds.has(h.id) ? 'var(--primary)' : 'none'} />
                    </button>
                    <div style={{
                      position: 'absolute', bottom: '12px', left: '12px', padding: '4px 10px',
                      borderRadius: '6px', fontSize: '11px', fontWeight: 500, color: '#fff',
                      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    }}>{h.area || h.city || 'Pune'}</div>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{h.title}</h3>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>₹{h.rent?.toLocaleString()}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}> / month</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BedDouble size={14} /> {h.type}</span>
                      {h.amenities?.length > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Sparkles size={14} /> {h.amenities.slice(0, 2).join(', ')}</span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {h.area || h.city}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {h.avgRating && (
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--warning)' }}>
                          ⭐ {h.avgRating} ({h.reviewCount} reviews)
                        </span>
                      )}
                      <Link href={`/housing/${h.id}`} style={{
                        padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                        background: 'var(--primary)', color: '#fff', textDecoration: 'none', marginLeft: 'auto',
                      }}>View Details</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Women Communities */}
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Users size={18} style={{ color: 'var(--primary)' }} /> Women-Only Communities
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>({communities.length})</span>
          </h2>

          {communities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '32px' }}>
              <Users size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>No women-only communities yet</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Be the first to create one from the Communities page!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {communities.map((c) => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)',
                  borderRadius: '16px', padding: '16px', border: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', background: 'rgba(236,72,153,0.1)', flexShrink: 0,
                  }}>
                    <Shield size={22} style={{ color: '#ec4899' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</h3>
                      <Lock size={12} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>{c.memberCount || c._count?.members || 0} members</p>
                  </div>
                  {c.isMember ? (
                    <Link href={`/communities/${c.id}`} style={{
                      padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                      background: 'var(--bg-primary)', color: 'var(--primary)', textDecoration: 'none',
                      border: '1px solid var(--border)', flexShrink: 0,
                    }}>Open</Link>
                  ) : (
                    <button onClick={() => handleJoinCommunity(c.id)} style={{
                      padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                      background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', flexShrink: 0,
                    }}>Join</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Women Events */}
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Calendar size={18} style={{ color: 'var(--warning)' }} /> Upcoming Events
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>({events.length})</span>
          </h2>

          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '32px' }}>
              <Calendar size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>No upcoming events</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>New women-focused events will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {events.map((e) => (
                <div key={e.id} style={{
                  background: 'var(--bg-card)', borderRadius: '16px', padding: '16px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>{e.title}</h3>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {new Date(e.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {e.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={12} /> {e._count?.attendees || 0} attending
                        </span>
                      </div>
                      {e.community && (
                        <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '8px', background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}>
                          {e.community.name}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRSVP(e.id)}
                      disabled={e.attending}
                      style={{
                        padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                        background: e.attending ? 'var(--bg-primary)' : 'var(--primary)',
                        color: e.attending ? 'var(--text-muted)' : '#fff',
                        border: e.attending ? '1px solid var(--border)' : 'none',
                        cursor: e.attending ? 'default' : 'pointer',
                        fontFamily: 'Inter, sans-serif', flexShrink: 0,
                      }}
                    >{e.attending ? 'Going ✓' : 'RSVP'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
