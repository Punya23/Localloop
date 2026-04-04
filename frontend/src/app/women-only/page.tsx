'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthGuard } from '@/lib/useAuthGuard';
import {
  Shield, MapPin, Heart, Search, CheckCircle2, BedDouble,
  Bath, Users, Calendar, Lock, Sparkles,
} from 'lucide-react';

const womenHousing = [
  { id: 'w1', title: 'Skyline Residency', area: 'Phase 1, Hinjewadi', rent: 18500, type: '1 BHK', bath: 1, detail: '0.5 km to IT Park', verified: true, img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=280&fit=crop', users: 3 },
  { id: 'w2', title: 'Green Terrace PG', area: 'Marunji, Hinjewadi', rent: 9000, type: 'Twin Sharing', bath: 1, detail: 'Free WiFi', verified: false, available: true, img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=280&fit=crop' },
  { id: 'w3', title: 'The Heritage Suites', area: 'Phase 3, Hinjewadi', rent: 25000, type: '2 BHK Semi-Furnished', bath: 2, detail: 'Professional Concierge', verified: true, img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=280&fit=crop' },
  { id: 'w4', title: "Serene Women's PG", area: 'Wakad', rent: 8500, type: 'Triple Sharing', bath: 1, detail: '1 km to Metro', verified: true, available: true, img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&h=280&fit=crop' },
];

const womenCommunities = [
  { id: 'wc1', name: 'Women in Tech Pune', desc: 'Network with women techies, share job leads, and attend meetups.', members: 420 },
  { id: 'wc2', name: 'Safe Spaces Network', desc: 'Verified women-friendly spaces, safety tips, and community support.', members: 680 },
  { id: 'wc3', name: 'Women Relocators', desc: 'Support group for women moving to new cities. Share experiences.', members: 310 },
];

const womenEvents = [
  { id: 'we1', title: 'Coffee & Connect: Women in Pune', date: '2026-03-25', location: 'Blue Tokai, Baner', attendees: 28 },
  { id: 'we2', title: 'Self-Defense Workshop', date: '2026-03-28', location: 'Fitness Hub, Kothrud', attendees: 15 },
  { id: 'we3', title: "Women's Housing Fair", date: '2026-04-02', location: 'Marriott Convention Center', attendees: 120 },
];

export default function WomenOnlyPage() {
  const { user, isReady, accessDenied, denyReason } = useAuthGuard({
    requireGender: 'FEMALE',
    requireVerified: true,
  });
  
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('Hinjewadi');
  // Show loading spinner while checking auth
  if (!isReady) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ height: '32px', width: '300px', borderRadius: '12px', background: '#f0f1f5', animation: 'pulse 1.5s infinite' }} />
      </div>
    );
  }

  // Show access denied if not verified female
  if (accessDenied) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
          <Shield size={48} style={{ color: '#ec4899', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>Access Restricted</h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px', lineHeight: 1.5 }}>
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
              display: 'block', padding: '12px', background: '#f8f9fc', color: '#64748b',
              borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', border: '1px solid #e5e7ee',
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
        background: 'linear-gradient(135deg, #ede9fe, #e0e7ff, #dbeafe)', border: '1px solid #e5e7ee',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Shield size={20} style={{ color: '#6366f1' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#6366f1' }}>WOMEN ONLY</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
          Safe Spaces, <span style={{ color: '#6366f1' }}>Verified Homes</span>
        </h1>
        <p style={{ fontSize: '14px', color: '#475569' }}>
          All listings verified for safety. Women-only communities and events curated just for you.
        </p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} style={{ color: '#10b981' }} /> Safety Verified
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={14} style={{ color: '#6366f1' }} /> Women-Only Access
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={14} style={{ color: '#f59e0b' }} /> Curated Picks
          </span>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search location..."
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '12px', border: '1px solid #e5e7ee', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', color: '#1a1a2e', background: '#fff' }} />
        </div>
        <button style={{ background: '#fff', border: '1px solid #e5e7ee', borderRadius: '12px', padding: '10px', cursor: 'pointer', color: '#64748b' }}>
          <Search size={18} />
        </button>
      </div>

      {/* Housing Section */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Shield size={18} style={{ color: '#10b981' }} /> Women-Safe Housing
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        {womenHousing.map((h) => (
          <div key={h.id} style={{
            background: '#fff', borderRadius: '16px', overflow: 'hidden',
            border: '1px solid #e5e7ee', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              height: '200px', backgroundImage: `url(${h.img})`, backgroundSize: 'cover',
              backgroundPosition: 'center', position: 'relative',
            }}>
              {h.verified && (
                <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(99,102,241,0.9)', color: '#fff' }}>VERIFIED</div>
              )}
              <div style={{
                position: 'absolute', top: h.verified ? '40px' : '12px', left: '12px', display: 'flex', alignItems: 'center', gap: '4px',
                background: 'rgba(255,255,255,0.95)', padding: '4px 10px', borderRadius: '6px',
                fontSize: '11px', fontWeight: 600, color: '#10b981',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> WOMEN SAFE
              </div>
              <button onClick={() => setSavedIds((p) => { const n = new Set(p); n.has(h.id) ? n.delete(h.id) : n.add(h.id); return n; })} style={{
                position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)',
                border: 'none', borderRadius: '8px', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                color: savedIds.has(h.id) ? '#6366f1' : '#94a3b8',
              }}>
                <Heart size={16} fill={savedIds.has(h.id) ? '#6366f1' : 'none'} />
              </button>
              <div style={{
                position: 'absolute', bottom: '12px', left: '12px', padding: '4px 10px',
                borderRadius: '6px', fontSize: '11px', fontWeight: 500, color: '#fff',
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
              }}>{h.area}</div>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>{h.title}</h3>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#6366f1' }}>₹{h.rent?.toLocaleString()}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{h.type?.includes('Sharing') ? ' / sharing' : ' / month'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BedDouble size={14} /> {h.type}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Bath size={14} /> {h.bath} Bath</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {h.detail}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {h.available && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: '#10b981' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> Available Now
                  </span>
                )}
                <Link href={`/housing/${h.id}`} style={{
                  padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                  background: '#6366f1', color: '#fff', textDecoration: 'none',
                }}>View Details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Women Communities */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Users size={18} style={{ color: '#6366f1' }} /> Women-Only Communities
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {womenCommunities.map((c) => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: '16px', background: '#fff',
            borderRadius: '16px', padding: '16px', border: '1px solid #e5e7ee',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', background: 'rgba(236,72,153,0.1)', flexShrink: 0,
            }}>
              <Shield size={22} style={{ color: '#ec4899' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a2e' }}>{c.name}</h3>
                <Lock size={12} style={{ color: '#94a3b8' }} />
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{c.desc}</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginTop: '4px' }}>{c.members} members</p>
            </div>
            <button style={{
              padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
              background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', flexShrink: 0,
            }}>Join</button>
          </div>
        ))}
      </div>

      {/* Women Events */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Calendar size={18} style={{ color: '#f59e0b' }} /> Upcoming Women-Only Events
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {womenEvents.map((e) => (
          <div key={e.id} style={{
            background: '#fff', borderRadius: '16px', padding: '16px',
            border: '1px solid #e5e7ee',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a2e', marginBottom: '6px' }}>{e.title}</h3>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> {new Date(e.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> {e.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={12} /> {e.attendees} attending
              </span>
            </div>
            <button style={{
              marginTop: '12px', padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}>RSVP</button>
          </div>
        ))}
      </div>
    </div>
  );
}
