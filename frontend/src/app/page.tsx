'use client';

import Link from 'next/link';
import { MapPin, Building2, Users, Shield, Star, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

const features = [
  { icon: Building2, title: 'Verified Housing', desc: 'Curated PG, hostel & flat listings with reviews and safety ratings.', color: '#6366f1' },
  { icon: Users, title: 'Community Groups', desc: 'Connect with university peers, professionals & newcomer batches.', color: '#06b6d4' },
  { icon: Shield, title: 'Women Mode', desc: 'Women-only communities, safety tags & verified women mentors.', color: '#ec4899' },
  { icon: Star, title: 'Mentor System', desc: 'Get guidance from experienced locals who\'ve been through it.', color: '#f59e0b' },
];

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '2,500+', label: 'Housing Listings' },
  { value: '450+', label: 'Communities' },
  { value: '98%', label: 'Satisfaction' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
               style={{ background: 'var(--primary)' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
               style={{ background: 'var(--accent)' }} />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
              <MapPin size={22} color="white" />
            </div>
            <span className="text-2xl font-bold gradient-text">LocalLoop</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-primary text-sm no-underline flex items-center gap-2">
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm no-underline">Log In</Link>
                <Link href="/register" className="btn-primary text-sm no-underline flex items-center gap-2">
                  Get Started <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="max-w-3xl">
            <div className="badge badge-primary mb-6 flex items-center gap-2 w-fit">
              <Sparkles size={14} /> Now in Pune
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6" style={{ color: 'var(--text-primary)' }}>
              Relocating to a new city?
              <br />
              <span className="gradient-text">We&apos;ve got your back.</span>
            </h1>
            <p className="text-lg lg:text-xl mb-10 max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Find verified housing, join local communities, connect with mentors, and settle into your new city with confidence. Built for students & young professionals.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="btn-primary text-base px-8 py-3 no-underline flex items-center gap-2">
                Start Your Journey <ArrowRight size={18} />
              </Link>
              <Link href="/housing" className="btn-secondary text-base px-8 py-3 no-underline flex items-center gap-2">
                <Building2 size={18} /> Browse Housing
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-5 text-center hover-lift">
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything you need to <span className="gradient-text">settle in</span></h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>One platform. All the tools for a smooth relocation.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="glass-card p-6 hover-lift">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                     style={{ background: `${feature.color}20` }}>
                  <Icon size={24} style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">How <span className="gradient-text">LocalLoop</span> works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Sign Up & Tell Us About You', desc: 'Share your budget, move-in month, preferred area, and more to personalize your experience.' },
            { step: '02', title: 'Explore & Connect', desc: 'Browse housing, join communities, attend events, and connect with mentors.' },
            { step: '03', title: 'Settle & Give Back', desc: 'Once settled, help other newcomers. Earn reputation points, become a mentor.' },
          ].map((item) => (
            <div key={item.step} className="relative glass-card p-8 hover-lift">
              <div className="text-5xl font-black mb-4 opacity-20 gradient-text">{item.step}</div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="glass-card p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }} />
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to make your move easier?</h2>
            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>Join thousands of students and professionals who relocated with confidence.</p>
            <Link href="/register" className="btn-primary text-lg px-10 py-4 no-underline inline-flex items-center gap-2">
              Join LocalLoop <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 lg:px-12 max-w-7xl mx-auto" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MapPin size={18} style={{ color: 'var(--primary)' }} />
            <span className="font-semibold gradient-text">LocalLoop</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>— Built with</span>
            <Heart size={14} style={{ color: 'var(--danger)' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>by Punya Surana</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>© 2024 LocalLoop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
