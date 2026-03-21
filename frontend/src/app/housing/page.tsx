'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  MapPin, Heart, BedDouble, Bath, Maximize2, RotateCcw,
  Grid3X3, List, ChevronDown, CheckCircle2, Search,
  Wifi, Users, Star, Shield, Map, SlidersHorizontal,
  Sparkles, ArrowRight, Eye,
} from 'lucide-react';

/* ── Demo Data ──────────────────────────────────────────── */

const imgs = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=350&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=350&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=350&fit=crop',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500&h=350&fit=crop',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&h=350&fit=crop',
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=500&h=350&fit=crop',
];

const demo = [
  {
    id: '1', title: 'Skyline Residency', area: 'Phase 1, Hinjewadi', city: 'Pune',
    rent: 18500, badge: 'verified', beds: 1, baths: 1, sqm: 45,
    womenSafe: true, proximity: '0.5 km to IT Park', type: '1 BHK',
    managedBy: null, amenities: ['WiFi', 'Power Backup'],
  },
  {
    id: '2', title: 'Green Terrace PG', area: 'Marunji, Hinjewadi', city: 'Pune',
    rent: 9000, badge: 'women', beds: 0, baths: 1, sqm: 0,
    womenSafe: true, proximity: 'Near IT Hub', type: 'Twin Sharing',
    managedBy: null, amenities: ['Free WiFi', 'Meals Included'],
    available: true, sharing: true,
  },
  {
    id: '3', title: 'The Heritage Suites', area: 'Phase 3, Hinjewadi', city: 'Pune',
    rent: 25000, badge: 'verified', beds: 2, baths: 2, sqm: 85,
    womenSafe: false, proximity: '1.2 km to Mall', type: '2 BHK Semi-Furnished',
    managedBy: 'Professional Concierge', amenities: ['Gym', 'Pool', 'Parking'],
  },
  {
    id: '4', title: 'Sunflower Heights', area: 'Wakad', city: 'Pune',
    rent: 15000, badge: 'superhost', beds: 1, baths: 1, sqm: 52,
    womenSafe: false, proximity: '0.8 km to Metro', type: '1 BHK Furnished',
    managedBy: null, amenities: ['AC', 'Geyser', 'Parking'],
  },
  {
    id: '5', title: 'Orchid Women PG', area: 'Baner', city: 'Pune',
    rent: 8500, badge: 'women', beds: 0, baths: 1, sqm: 0,
    womenSafe: true, proximity: 'Near Baner Road', type: 'Triple Sharing',
    managedBy: null, amenities: ['Free WiFi', 'Tiffin Service'],
    available: true, sharing: true,
  },
  {
    id: '6', title: 'Urban Nest Studio', area: 'Balewadi', city: 'Pune',
    rent: 20000, badge: 'verified', beds: 1, baths: 1, sqm: 38,
    womenSafe: false, proximity: '0.3 km to Stadium', type: 'Studio Apartment',
    managedBy: 'Nest Property Management', amenities: ['Smart Lock', 'Laundry'],
  },
];

/* ── Badge Component ──────────────────────────────────── */

function Badge({ type }: { type: string }) {
  if (type === 'women') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        background: 'rgba(255,255,255,0.95)', padding: '5px 10px',
        borderRadius: '8px', fontSize: '10px', fontWeight: 700,
        color: '#10b981', letterSpacing: '0.03em',
        backdropFilter: 'blur(4px)',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
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
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    api.getHousings().then((r) => { if (r?.data?.length) setData(r.data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const listings = data.length > 0 ? data : demo;
  const toggleSave = (id: string) => setSaved((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ══════════ DESKTOP FILTER SIDEBAR ══════════ */}
      <div className="hidden lg:block" style={{
        width: 290, padding: '28px 24px', flexShrink: 0,
        borderRight: '1px solid #e5e7ee', background: '#fff',
        overflowY: 'auto', height: 'calc(100vh - 52px)', position: 'sticky', top: 52,
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>Filters</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 28 }}>Tailor your relocation search</p>

        {/* Target Area */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 8 }}>Target Area</label>
          <div style={{ position: 'relative' }}>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              style={{
                width: '100%', padding: '11px 36px 11px 14px', borderRadius: 12,
                border: '1px solid #e5e7ee', background: '#f8f9fc', fontSize: 14,
                color: '#1a1a2e', appearance: 'none' as const, fontFamily: 'Inter, sans-serif',
                outline: 'none', cursor: 'pointer',
              }}
            >
              <option>Hinjewadi, Pune</option>
              <option>Wakad, Pune</option>
              <option>Baner, Pune</option>
              <option>Balewadi, Pune</option>
              <option>Kharadi, Pune</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Budget Range */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Budget Range</label>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#6366f1' }}>₹5k – ₹{(budget / 1000).toFixed(0)}k</span>
          </div>
          <input type="range" min={5000} max={50000} step={1000} value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#6366f1' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
            <span>₹5,000</span><span>₹50,000+</span>
          </div>
        </div>

        {/* Preferences */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 10 }}>Preferences</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', 'Women Only', 'Mixed'].map((p) => (
              <button key={p} onClick={() => setPref(p)} style={{
                padding: '7px 16px', borderRadius: 24, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', border: pref === p ? 'none' : '1px solid #e5e7ee',
                background: pref === p ? '#6366f1' : '#fff', color: pref === p ? '#fff' : '#64748b',
                transition: 'all 0.15s',
              }}>{p}</button>
            ))}
          </div>
        </div>

        {/* Verified Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
          borderRadius: 14, background: '#f8f9fc', marginBottom: 28,
        }}>
          <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>Verified Hosts</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>Security first listings</div>
          </div>
          <button onClick={() => setVerified(!verified)} style={{
            width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', padding: 0,
            background: verified ? '#6366f1' : '#d4d6de', position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 2, left: verified ? 22 : 2, transition: 'left 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }} />
          </button>
        </div>

        <button onClick={() => { setPref('All'); setVerified(true); setBudget(30000); }} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 500,
          color: '#64748b', background: '#f8f9fc', border: '1px solid #e5e7ee',
          cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.15s',
        }}>
          <RotateCcw size={14} /> Reset Filters
        </button>
      </div>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div style={{ flex: 1, padding: '24px 28px 100px' }}>

        {/* ── Mobile Location Bar ── */}
        <div className="lg:hidden" style={{ marginBottom: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            background: '#fff', borderRadius: 14, border: '1px solid #e5e7ee',
          }}>
            <MapPin size={16} style={{ color: '#6366f1', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#1a1a2e' }}>{area}</span>
            <button onClick={() => setMobileFilters(!mobileFilters)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}>
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
              border: chip === 'Budget' ? 'none' : '1px solid #e5e7ee',
              background: chip === 'Budget' ? '#6366f1' : '#fff',
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
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e' }}>Available Sanctuary</h1>
            <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
              {listings.length} vetted properties matching your criteria
            </p>
          </div>
          <div className="hidden lg:flex" style={{ display: 'flex' }}>
            {[{ icon: Grid3X3, m: 'grid' as const }, { icon: List, m: 'list' as const }].map(({ icon: Icon, m }) => (
              <button key={m} onClick={() => setView(m)} style={{
                width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid #e5e7ee', cursor: 'pointer',
                background: view === m ? '#6366f1' : '#fff', color: view === m ? '#fff' : '#94a3b8',
                borderRadius: m === 'grid' ? '10px 0 0 10px' : '0 10px 10px 0',
                borderLeft: m === 'list' ? 'none' : undefined,
                transition: 'all 0.15s',
              }}><Icon size={16} /></button>
            ))}
          </div>
        </div>

        {/* ── Listings Grid ── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} style={{ height: 320, borderRadius: 16, background: '#f0f1f5', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
            gap: 20,
          }}>
            {listings.map((h: any, i: number) => {
              const img = imgs[i % imgs.length];
              const badge = h.badge || 'verified';
              const isSaved = saved.has(h.id);
              return (
                <div key={h.id} style={{
                  display: view === 'list' ? 'flex' : 'block',
                  background: '#fff', borderRadius: 18, overflow: 'hidden',
                  border: '1px solid #e5e7ee', transition: 'all 0.25s',
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
                      color: isSaved ? '#6366f1' : '#94a3b8',
                      transition: 'all 0.2s', backdropFilter: 'blur(4px)',
                    }}>
                      <Heart size={16} fill={isSaved ? '#6366f1' : 'none'} />
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
                      <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#1a1a2e' }}>{h.title}</h3>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: '#6366f1' }}>₹{(h.rent || 0).toLocaleString()}</span>
                        <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>
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
                            background: '#f0f1f5', color: '#64748b', fontWeight: 500,
                          }}>{a}</span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        {h.available && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#10b981' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}/>
                            Available Now
                          </span>
                        )}
                        {h.managedBy && (
                          <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
                            Managed by {h.managedBy}
                          </span>
                        )}
                      </div>
                      <Link href={`/housing/${h.id}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                        background: '#6366f1', color: '#fff', textDecoration: 'none',
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
            background: '#fff', color: '#1a1a2e', border: '1px solid #e5e7ee',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7ee'; e.currentTarget.style.color = '#1a1a2e'; }}
          >Show more listings</button>
        </div>
      </div>

      {/* ══════════ Mobile Map View Button ══════════ */}
      <button className="lg:hidden" style={{
        position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px',
        borderRadius: 30, background: '#1a1a2e', color: '#fff', border: 'none',
        fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 16px rgba(26,26,46,0.35)', zIndex: 40,
      }}>
        <Map size={16} /> Map View
      </button>
    </div>
  );
}
