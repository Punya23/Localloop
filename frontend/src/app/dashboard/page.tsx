'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Building2, Users, Calendar, Trophy, Star, MapPin, ArrowRight, TrendingUp, Home } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && user && !user.isOnboarded) {
      router.push('/onboarding');
      return;
    }
    if (isAuthenticated) {
      api.getDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
    }
  }, [isAuthenticated, authLoading, user, router]);

  if (authLoading || loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="shimmer h-8 w-64 rounded-xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <div key={i} className="shimmer h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="shimmer h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const cityStats = data?.cityStats || {};

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Here&apos;s what&apos;s happening in {user?.city || 'Pune'}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Building2, label: 'Housing Listings', value: cityStats.totalListings || 0, color: '#6366f1' },
          { icon: Users, label: 'Communities', value: cityStats.totalCommunities || 0, color: '#06b6d4' },
          { icon: Home, label: 'Avg. Rent', value: `₹${cityStats.averageRent || 0}`, color: '#10b981' },
          { icon: TrendingUp, label: 'Active Users', value: cityStats.totalUsers || 0, color: '#f59e0b' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass-card p-4 hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Housing */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Building2 size={20} style={{ color: 'var(--primary)' }} /> Recommended Housing</h2>
            <Link href="/housing" className="text-sm font-medium flex items-center gap-1 no-underline" style={{ color: 'var(--primary-light)' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data?.recommendedHousing || []).slice(0, 4).map((h: any) => (
              <Link href={`/housing/${h.id}`} key={h.id} className="glass-card p-4 hover-lift no-underline" style={{ color: 'var(--text-primary)' }}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm truncate flex-1">{h.title}</h3>
                  {h.isWomenFriendly && <span className="badge badge-danger text-xs ml-2">Women Safe</span>}
                </div>
                <div className="flex items-center gap-2 text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                  <MapPin size={12} /> {h.area}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold gradient-text">₹{h.rent?.toLocaleString()}</span>
                  <div className="flex items-center gap-1 text-xs">
                    {h.avgRating ? (
                      <><Star size={12} className="star-filled" /> {h.avgRating}</>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No reviews</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {(!data?.recommendedHousing || data.recommendedHousing.length === 0) && (
              <div className="glass-card p-8 col-span-2 text-center">
                <Building2 size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-muted)' }}>No housing listings yet. Be the first to add one!</p>
                <Link href="/housing" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm no-underline">
                  Browse Housing <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Reputation */}
          <div className="glass-card p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Trophy size={20} style={{ color: 'var(--warning)' }} /> Your Reputation</h2>
            <div className="text-center py-3">
              <div className="text-4xl font-bold gradient-text">{user?.reputation?.points || 0}</div>
              <div className="badge badge-primary mt-2">{user?.reputation?.level || 'Explorer'}</div>
            </div>
            <div className="mt-4 text-xs flex justify-between" style={{ color: 'var(--text-muted)' }}>
              <span>Posts: {data?.user?._count?.posts || 0}</span>
              <span>Reviews: {data?.user?._count?.housingReviews || 0}</span>
            </div>
          </div>

          {/* Suggested Communities */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Users size={20} style={{ color: 'var(--accent)' }} /> Communities</h2>
              <Link href="/communities" className="text-xs font-medium no-underline" style={{ color: 'var(--primary-light)' }}>See all</Link>
            </div>
            <div className="flex flex-col gap-3">
              {(data?.suggestedCommunities || []).slice(0, 3).map((c: any) => (
                <Link href={`/communities/${c.id}`} key={c.id} className="flex items-center gap-3 p-3 rounded-xl no-underline transition-all"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                       style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                    {c.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.memberCount} members</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Calendar size={20} style={{ color: 'var(--success)' }} /> Events</h2>
              <Link href="/events" className="text-xs font-medium no-underline" style={{ color: 'var(--primary-light)' }}>See all</Link>
            </div>
            <div className="flex flex-col gap-3">
              {(data?.upcomingEvents || []).slice(0, 3).map((e: any) => (
                <div key={e.id} className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  <p className="text-sm font-medium">{e.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Calendar size={12} /> {new Date(e.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    <span>·</span>
                    <span>{e._count?.attendees || 0} attending</span>
                  </div>
                </div>
              ))}
              {(!data?.upcomingEvents || data.upcomingEvents.length === 0) && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No upcoming events</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      {data?.recentPosts && data.recentPosts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Recent Community Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recentPosts.slice(0, 4).map((post: any) => (
              <div key={post.id} className="glass-card p-4 hover-lift">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                       style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                    {post.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{post.user?.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>in {post.community?.name}</p>
                  </div>
                </div>
                <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{post.content}</p>
                <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {post._count?.comments || 0} comments
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
