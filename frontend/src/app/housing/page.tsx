'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  MapPin, Heart, BedDouble, Bath, Maximize2, RotateCcw,
  Grid3X3, List, ChevronDown, CheckCircle2, Search,
  Wifi, Users, Star, Shield, Map, SlidersHorizontal,
  Sparkles, ArrowRight, Eye,
} from 'lucide-react';

const HousingMap = dynamic(() => import('@/components/HousingMap'), { ssr: false });

/* ── Badge Component ──────────────────────────────────── */

function Badge({ type }: { type: string }) {
  if (type === 'women') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        background: 'rgba(255,255,255,0.95)', padding: '5px 10px',
        borderRadius: '8px', fontSize: '10px', fontWeight: 700,
        color: 'var(--success)', letterSpacing: '0.03em',
        backdropFilter: 'blur(4px)',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} />
        WOMEN SAFE
      </div>
    );
  }
  if (type === 'superhost') {
    return (
      <div style={{
        padding: '5px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
        background: 'rgba(245,158,11,0.92)', color: '#fff', letterSpacing: '0.03em',
        backdropFilter: 'blur(4px)',
      }}>
        ★ SUPERHOST
      </div>
    );
  }
  if (type === 'verified') {
    return (
      <div style={{
        padding: '5px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
        background: 'rgba(99,102,241,0.92)', color: '#fff', letterSpacing: '0.03em',
        backdropFilter: 'blur(4px)',
      }}>
        VERIFIED
      </div>
    );
  }
  return null;
}

/* ── Housing Page ─────────────────────────────────────── */

export default function HousingPage() {
  const [data, setData] = useState<any[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [pref, setPref] = useState('All');
  const [verified, setVerified] = useState(true);
  const [budget, setBudget] = useState(30000);
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState('Hinjewadi, Pune');
  const [housingType, setHousingType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFilters, setMobileFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // ML Predictor States
  const [mlArea, setMlArea] = useState('Hinjewadi');
  const [mlRoomType, setMlRoomType] = useState('Single Room');
  const [mlHasAc, setMlHasAc] = useState(false);
  const [mlPredictedRent, setMlPredictedRent] = useState<number | null>(null);
  const [mlLoading, setMlLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Pass filter params to API so server-side can narrow
    const params: Record<string, string | number> = {};
    if (area && area !== 'All') {
      params.area = area.split(',')[0]?.trim();
    }
    params.budgetMax = budget;
    if (pref === 'Women Only') params.isWomenFriendly = 'true';
    if (housingType) params.type = housingType;
    
    Promise.all([
      api.getHousings(params).catch(() => null),
      api.getSavedHousings().catch(() => null)
    ]).then(([r, savedRes]) => {
      if (r?.data?.length) setData(r.data); else setData([]);
      
      if (savedRes && Array.isArray(savedRes)) {
        const savedIds = new Set<string>();
        savedRes.forEach((s: any) => savedIds.add(s.id || s.housingId));
        setSaved(savedIds);
      }
    }).finally(() => setLoading(false));
  }, [area, budget, pref, housingType]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const allListings = data;

  // ── Client-side filtering (backup for demo data + search) ──
  const listings = allListings.filter((h: any) => {
    const rent = h.rent || 0;
    if (rent > budget) return false;
    if (verified && h.badge !== 'verified' && h.isVerified !== true && h.badge !== 'women' && h.isWomenFriendly !== true) return false;
    if (pref === 'Women Only' && !h.womenSafe && h.badge !== 'women' && h.isWomenFriendly !== true) return false;
    if (pref === 'Mixed' && (h.womenSafe || h.badge === 'women')) return false;
    if (area && area !== 'All') {
      const areaName = area.split(',')[0]?.trim().toLowerCase();
      const hArea = (h.area || '').toLowerCase();
      if (areaName && !hArea.includes(areaName)) return false;
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      const matchTitle = (h.title || '').toLowerCase().includes(q);
      const matchArea = (h.area || '').toLowerCase().includes(q);
      const matchDesc = (h.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchArea && !matchDesc) return false;
    }
    return true;
  });

  const toggleSave = (id: string) => {
    setSaved((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    api.saveHousing(id).catch(console.error);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ══════════ DESKTOP FILTER SIDEBAR ══════════ */}
      <div className="hidden lg:block" style={{
        width: 290, padding: '28px 24px', flexShrink: 0,
        borderRight: '1px solid var(--border)', background: 'var(--bg-card)',
        overflowY: 'auto', height: 'calc(100vh - 52px)', position: 'sticky', top: 52,
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Filters</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Tailor your relocation search</p>

        {/* Search */}
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, area..."
            style={{
              width: '100%', padding: '11px 14px 11px 40px', borderRadius: 12,
              border: '1px solid var(--border)', background: 'var(--bg-primary)', fontSize: 14,
              color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', outline: 'none',
            }}
          />
        </div>

        {/* Target Area */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 8 }}>Target Area</label>
          <div style={{ position: 'relative' }}>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              style={{
                width: '100%', padding: '11px 36px 11px 14px', borderRadius: 12,
                border: '1px solid var(--border)', background: 'var(--bg-primary)', fontSize: 14,
                color: 'var(--text-primary)', appearance: 'none' as const, fontFamily: 'Inter, sans-serif',
                outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="All">All Areas</option>
              <option>Hinjewadi, Pune</option>
              <option>Wakad, Pune</option>
              <option>Baner, Pune</option>
              <option>Balewadi, Pune</option>
              <option>Kharadi, Pune</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Budget Range */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Budget Range</label>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>₹5k – ₹{(budget / 1000).toFixed(0)}k</span>
          </div>
          <input type="range" min={5000} max={50000} step={1000} value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            <span>₹5,000</span><span>₹50,000+</span>
          </div>
        </div>

        {/* Preferences */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 10 }}>Preferences</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', 'Women Only', 'Mixed'].map((p) => (
              <button key={p} onClick={() => setPref(p)} style={{
                padding: '7px 16px', borderRadius: 24, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', border: pref === p ? 'none' : '1px solid var(--border)',
                background: pref === p ? 'var(--primary)' : '#fff', color: pref === p ? '#fff' : '#64748b',
                transition: 'all 0.15s',
              }}>{p}</button>
            ))}
          </div>
        </div>

        {/* Housing Type */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 8 }}>Housing Type</label>
          <div style={{ position: 'relative' }}>
            <select
              value={housingType}
              onChange={(e) => setHousingType(e.target.value)}
              style={{
                width: '100%', padding: '11px 36px 11px 14px', borderRadius: 12,
                border: '1px solid var(--border)', background: 'var(--bg-primary)', fontSize: 14,
                color: 'var(--text-primary)', appearance: 'none' as const, fontFamily: 'Inter, sans-serif',
                outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">All Types</option>
              <option value="PG">PG</option>
              <option value="HOSTEL">Hostel</option>
              <option value="FLAT">Flat</option>
              <option value="SHARED_ROOM">Shared Room</option>
              <option value="SINGLE_ROOM">Single Room</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Verified Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
          borderRadius: 14, background: 'var(--bg-primary)', marginBottom: 28,
        }}>
          <CheckCircle2 size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Verified Hosts</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Security first listings</div>
          </div>
          <button onClick={() => setVerified(!verified)} style={{
            width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', padding: 0,
            background: verified ? 'var(--primary)' : '#d4d6de', position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-card)',
              position: 'absolute', top: 2, left: verified ? 22 : 2, transition: 'left 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }} />
          </button>
        </div>

        {/* ═══ ML Predicted Rent ═══ */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-primary), #f3f0ff)',
          borderRadius: 14, padding: 16, marginBottom: 28, border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Sparkles size={16} style={{ color: '#8b5cf6' }} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>AI Price Predictor</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>Location</label>
              <select 
                value={mlArea} onChange={e => setMlArea(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }}
              >
                <option>Hinjewadi</option>
                <option>Wakad</option>
                <option>Viman Nagar</option>
                <option>Kothrud</option>
                <option>Kharadi</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>Type</label>
              <select 
                value={mlRoomType} onChange={e => setMlRoomType(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }}
              >
                <option>Single Room</option>
                <option>Double Sharing</option>
                <option>Triple Sharing</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={mlHasAc} onChange={e => setMlHasAc(e.target.checked)} />
              <label style={{ fontSize: 12, color: 'var(--text-primary)' }}>Has AC</label>
            </div>
            
            <button
              onClick={async () => {
                setMlLoading(true);
                try {
                  const res = await api.predictRent({ area: mlArea, room_type: mlRoomType, has_ac: mlHasAc, has_food: true });
                  if (res.predicted_rent) setMlPredictedRent(res.predicted_rent);
                  else if (res.error) alert(res.error);
                } catch(e) { setMlPredictedRent(null); }
                setMlLoading(false);
              }}
              style={{
                background: '#8b5cf6', color: '#fff', border: 'none', padding: '8px', 
                borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 4,
              }}>
              {mlLoading ? 'Predicting...' : 'Predict Fair Rent'}
            </button>

            {mlPredictedRent !== null && (
              <div style={{ background: '#fff', borderRadius: 8, padding: 10, marginTop: 4, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ML Estimate</span>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>₹{mlPredictedRent.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        <button onClick={() => { setPref('All'); setVerified(true); setBudget(30000); setArea('All'); setHousingType(''); setSearchQuery(''); }} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 500,
          color: '#64748b', background: 'var(--bg-primary)', border: '1px solid var(--border)',
          cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.15s',
        }}>
          <RotateCcw size={14} /> Reset All Filters
        </button>
      </div>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div style={{ flex: 1, padding: '24px 28px 100px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 className="hidden lg:block" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {area === 'All' ? 'Showing all properties' : `Properties in ${area}`}
          </h1>
          <Link href="/housing/create" style={{ textDecoration: 'none', marginLeft: 'auto' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 12,
              border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer',
              fontWeight: 600, fontSize: 13, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            }}>
              + List Property
            </button>
          </Link>
        </div>

        {/* ── Mobile Location Bar ── */}
        <div className="lg:hidden" style={{ marginBottom: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)',
          }}>
            <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{area}</span>
            <button onClick={() => setMobileFilters(!mobileFilters)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* ── Mobile Filter Chips ── */}
        <div className="lg:hidden" style={{
          display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4,
        }}>
          {['Budget', 'Area', 'Gender', 'Verified'].map((chip) => (
            <button key={chip} style={{
              padding: '7px 16px', borderRadius: 24, fontSize: 12, fontWeight: 500,
              whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
              border: chip === 'Budget' ? 'none' : '1px solid var(--border)',
              background: chip === 'Budget' ? 'var(--primary)' : '#fff',
              color: chip === 'Budget' ? '#fff' : '#64748b', cursor: 'pointer',
            }}>{chip}</button>
          ))}
        </div>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: 24, flexWrap: 'wrap' as const, gap: 16,
        }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>Available Sanctuary</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              {listings.length} vetted properties matching your criteria
            </p>
          </div>
          <div className="hidden lg:flex" style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex' }}>
              {[{ icon: Grid3X3, m: 'grid' as const }, { icon: List, m: 'list' as const }].map(({ icon: Icon, m }) => (
                <button key={m} onClick={() => setView(m)} style={{
                  width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--border)', cursor: 'pointer',
                  background: view === m ? 'var(--primary)' : '#fff', color: view === m ? '#fff' : 'var(--text-muted)',
                  borderRadius: m === 'grid' ? '10px 0 0 10px' : '0 10px 10px 0',
                  borderLeft: m === 'list' ? 'none' : undefined,
                  transition: 'all 0.15s',
                }}><Icon size={16} /></button>
              ))}
            </div>
            <button onClick={() => setShowMap(true)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0 18px', height: 38, borderRadius: 10,
              border: '1px solid var(--border)', cursor: 'pointer',
              background: '#fff', color: 'var(--text-muted)',
              fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            ><Map size={15} /> Map View</button>
          </div>
        </div>

        {/* ── Listings Grid ── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} style={{ height: 320, borderRadius: 16, background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
            gap: 20,
          }}>
            {listings.map((h: any, i: number) => {
              const img = (h.images && h.images.length > 0) ? h.images[0] : 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=350&fit=crop';
              const badge = h.badge || 'verified';
              const isSaved = saved.has(h.id);
              return (
                <div key={h.id} style={{
                  display: view === 'list' ? 'flex' : 'block',
                  background: 'var(--bg-card)', borderRadius: 18, overflow: 'hidden',
                  border: '1px solid var(--border)', transition: 'all 0.25s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  {/* Image */}
                  <div style={{
                    width: view === 'list' ? 240 : '100%',
                    height: view === 'list' ? '100%' : 200,
                    minHeight: view === 'list' ? 180 : undefined,
                    backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center',
                    position: 'relative', flexShrink: 0,
                  }}>
                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <Badge type={badge} />
                      {h.womenSafe && badge !== 'women' && <Badge type="women" />}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleSave(h.id); }} style={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'rgba(255,255,255,0.92)', border: 'none',
                      borderRadius: 10, width: 34, height: 34, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      color: isSaved ? 'var(--primary)' : 'var(--text-muted)',
                      transition: 'all 0.2s', backdropFilter: 'blur(4px)',
                    }}>
                      <Heart size={16} fill={isSaved ? 'var(--primary)' : 'none'} />
                    </button>
                    {/* Area label on image */}
                    <div style={{
                      position: 'absolute', bottom: 12, left: 12,
                      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                      padding: '4px 10px', borderRadius: 8,
                      fontSize: 11, fontWeight: 500, color: '#fff',
                    }}>
                      {h.area}
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ padding: '16px 18px 18px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{h.title}</h3>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>₹{(h.rent || 0).toLocaleString()}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>
                          {h.sharing ? '/ sharing' : '/ month'}
                        </span>
                      </div>
                    </div>

                    {/* Property Specs */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                      {h.type && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <BedDouble size={14} /> {h.type}
                        </span>
                      )}
                      {h.beds > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Bath size={14} /> {h.baths} Bath
                        </span>
                      )}
                      {h.proximity && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} /> {h.proximity}
                        </span>
                      )}
                    </div>

                    {/* Amenities */}
                    {h.amenities && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        {h.amenities.slice(0, 3).map((a: string) => (
                          <span key={a} style={{
                            fontSize: 11, padding: '3px 10px', borderRadius: 20,
                            background: 'var(--border-light)', color: '#64748b', fontWeight: 500,
                          }}>{a}</span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        {h.available && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }}/>
                            Available Now
                          </span>
                        )}
                        {h.managedBy && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Managed by {h.managedBy}
                          </span>
                        )}
                      </div>
                      <Link href={`/housing/${h.id}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                        background: 'var(--primary)', color: '#fff', textDecoration: 'none',
                        transition: 'all 0.2s',
                      }}>
                        {h.available && !h.managedBy ? 'Contact' : 'View Details'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Show More */}
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <button style={{
            padding: '14px 40px', borderRadius: 14, fontSize: 14, fontWeight: 600,
            background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          >Show more listings</button>
        </div>
      </div>

      {/* ══════════ Mobile Map View Button ══════════ */}
      <button className="lg:hidden" onClick={() => setShowMap(true)} style={{
        position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px',
        borderRadius: 30, background: 'var(--text-primary)', color: '#fff', border: 'none',
        fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 16px rgba(26,26,46,0.35)', zIndex: 40,
      }}>
        <Map size={16} /> Map View
      </button>

      {/* ══════════ Map Overlay ══════════ */}
      {showMap && <HousingMap listings={listings} onClose={() => setShowMap(false)} />}
    </div>
  );
}
