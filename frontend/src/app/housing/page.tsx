'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Building2, MapPin, Star, Filter, Search, X, Shield, Wifi, ChefHat, Car, Dumbbell, BookOpen } from 'lucide-react';

const amenityIcons: Record<string, any> = { WiFi: Wifi, Meals: ChefHat, Parking: Car, Gym: Dumbbell, 'Study Room': BookOpen };

export default function HousingPage() {
  const [housings, setHousings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ area: '', budgetMin: '', budgetMax: '', type: '', isWomenFriendly: false });
  const [search, setSearch] = useState('');

  const fetchHousings = async (params?: any) => {
    setLoading(true);
    try {
      const cleanParams: any = {};
      if (params?.area) cleanParams.area = params.area;
      if (params?.budgetMin) cleanParams.budgetMin = params.budgetMin;
      if (params?.budgetMax) cleanParams.budgetMax = params.budgetMax;
      if (params?.type) cleanParams.type = params.type;
      if (params?.isWomenFriendly) cleanParams.isWomenFriendly = 'true';
      const res = await api.getHousings(cleanParams);
      setHousings(res.data || []);
      setMeta(res.meta || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHousings(); }, []);

  const applyFilters = () => {
    fetchHousings(filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ area: '', budgetMin: '', budgetMax: '', type: '', isWomenFriendly: false });
    fetchHousings();
    setShowFilters(false);
  };

  const filtered = search
    ? housings.filter((h) => h.title.toLowerCase().includes(search.toLowerCase()) || h.area.toLowerCase().includes(search.toLowerCase()))
    : housings;

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 size={24} style={{ color: 'var(--primary)' }} /> Housing</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{meta.total || 0} listings available</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input-field pl-10 text-sm" placeholder="Search by name or area..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2 text-sm whitespace-nowrap">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="glass-card p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Area</label>
              <input className="input-field text-sm" placeholder="e.g., Kothrud" value={filters.area} onChange={(e) => setFilters({...filters, area: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Min Budget (₹)</label>
              <input type="number" className="input-field text-sm" value={filters.budgetMin} onChange={(e) => setFilters({...filters, budgetMin: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Max Budget (₹)</label>
              <input type="number" className="input-field text-sm" value={filters.budgetMax} onChange={(e) => setFilters({...filters, budgetMax: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Type</label>
              <select className="input-field text-sm" value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}
                      style={{ appearance: 'none' }}>
                <option value="">All Types</option>
                <option value="PG">PG</option>
                <option value="HOSTEL">Hostel</option>
                <option value="FLAT">Flat</option>
                <option value="SHARED_ROOM">Shared Room</option>
                <option value="SINGLE_ROOM">Single Room</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={filters.isWomenFriendly} onChange={(e) => setFilters({...filters, isWomenFriendly: e.target.checked})} className="accent-pink-500" />
              <Shield size={14} style={{ color: '#ec4899' }} /> Women-friendly only
            </label>
            <div className="flex gap-2">
              <button onClick={clearFilters} className="btn-secondary text-xs flex items-center gap-1"><X size={12} /> Clear</button>
              <button onClick={applyFilters} className="btn-primary text-xs">Apply Filters</button>
            </div>
          </div>
        </div>
      )}

      {/* Listing Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="shimmer h-56 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Building2 size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-2">No listings found</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((h) => (
            <Link href={`/housing/${h.id}`} key={h.id} className="glass-card overflow-hidden hover-lift no-underline" style={{ color: 'var(--text-primary)' }}>
              {/* Placeholder image area */}
              <div className="h-36 relative" style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-card-hover))' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                </div>
                {h.isVerified && <span className="absolute top-3 left-3 badge badge-success text-xs">✓ Verified</span>}
                {h.isWomenFriendly && <span className="absolute top-3 right-3 badge badge-danger text-xs"><Shield size={10} className="mr-1" />Women Safe</span>}
                <div className="absolute bottom-3 left-3 badge" style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}>
                  {h.type?.replace('_', ' ')}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm truncate mb-1">{h.title}</h3>
                <div className="flex items-center gap-1 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  <MapPin size={12} /> {h.area}, {h.city || 'Pune'}
                </div>
                {/* Amenities */}
                {h.amenities && h.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {h.amenities.slice(0, 4).map((a: string) => (
                      <span key={a} className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{a}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold gradient-text">₹{h.rent?.toLocaleString()}<span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>/mo</span></span>
                  <div className="flex items-center gap-1 text-xs">
                    {h.avgRating ? (
                      <><Star size={12} className="star-filled" /> {h.avgRating} <span style={{ color: 'var(--text-muted)' }}>({h.reviewCount})</span></>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>New</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
