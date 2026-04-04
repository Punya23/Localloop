'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import {
  GraduationCap, Briefcase, Calendar, MapPin, DollarSign, Shield,
  ArrowRight, ArrowLeft, Sparkles, Utensils, Clock, Globe2, Heart,
  Car, Dog, Users, BookOpen, Cigarette, Wine, Sun, Moon, PartyPopper,
  BookMarked, Camera, Music, Dumbbell, Gamepad2, Plane,
  CookingPot, Code, Palette,
} from 'lucide-react';

const steps = ['Role', 'Details', 'Lifestyle', 'Preferences', 'Safety'];

const interestOptions = [
  { value: 'fitness', label: 'Fitness', icon: Dumbbell },
  { value: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { value: 'travel', label: 'Travel', icon: Plane },
  { value: 'cooking', label: 'Cooking', icon: CookingPot },
  { value: 'photography', label: 'Photography', icon: Camera },
  { value: 'music', label: 'Music', icon: Music },
  { value: 'reading', label: 'Reading', icon: BookMarked },
  { value: 'tech', label: 'Tech', icon: Code },
  { value: 'art', label: 'Art & Design', icon: Palette },
  { value: 'partying', label: 'Socializing', icon: PartyPopper },
];

const languageOptions = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati', 'Malayalam', 'Punjabi'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, updateUser, welcomeMessage, clearWelcomeMessage } = useAuthStore();
  const router = useRouter();

  const [form, setForm] = useState({
    role: '' as string,
    gender: '' as string,
    city: 'Pune',
    preferredArea: '',
    moveMonth: '',
    budgetMin: 3000,
    budgetMax: 15000,
    isWomenMode: false,
    university: '',
    company: '',
    bio: '',
    phone: '',
    // ML-ready fields
    interests: [] as string[],
    foodPreference: '',
    workSchedule: '',
    languages: [] as string[],
    lifestyle: '',
    transportMode: '',
    smoking: 'no',
    drinking: 'no',
    petFriendly: false,
    ageRange: '',
    hometown: '',
    courseOrDept: '',
    monthlyIncome: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleInterest = (interest: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleLanguage = (lang: string) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const userData = await api.completeOnboarding(form);
      updateUser({ ...userData, isOnboarded: true });
      clearWelcomeMessage();
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] rounded-full opacity-10 blur-[100px]" style={{ background: 'var(--primary)' }} />

      <div className="w-full max-w-lg relative z-10">
        {/* Welcome Message */}
        {welcomeMessage && step === 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.1))',
            border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: '16px 20px',
            marginBottom: 20, fontSize: 14, color: 'var(--text-primary)',
          }}>
            🎉 {welcomeMessage}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="badge badge-primary mb-4 mx-auto flex items-center gap-1 w-fit"><Sparkles size={14} /> Personalize Your Experience</div>
          <h1 className="text-3xl font-bold mb-2">Let&apos;s get you settled</h1>
          <p style={{ color: 'var(--text-muted)' }}>Step {step + 1} of {steps.length}: {steps[step]}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-500"
                 style={{ background: i <= step ? 'var(--primary)' : 'var(--border)' }} />
          ))}
        </div>

        <div className="glass-card p-8">
          {/* ═══ Step 1: Role & Gender ═══ */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">What brings you here?</h2>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { value: 'STUDENT', label: 'Student', desc: 'Moving for education', icon: GraduationCap },
                  { value: 'PROFESSIONAL', label: 'Working Professional', desc: 'Moving for career', icon: Briefcase },
                  { value: 'INTERN', label: 'Intern', desc: 'Temporary relocation', icon: Calendar },
                ].map(({ value, label, desc, icon: Icon }) => (
                  <button key={value} onClick={() => update('role', value)}
                          className="flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
                          style={{
                            background: form.role === value ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                            border: `2px solid ${form.role === value ? 'var(--primary)' : 'var(--border)'}`,
                            cursor: 'pointer', color: 'var(--text-primary)',
                          }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: form.role === value ? 'rgba(99,102,241,0.2)' : 'var(--bg-card)' }}>
                      <Icon size={22} style={{ color: form.role === value ? 'var(--primary-light)' : 'var(--text-muted)' }} />
                    </div>
                    <div>
                      <div className="font-semibold">{label}</div>
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <h3 className="text-lg font-semibold mt-8 mb-4">Gender</h3>
              <div className="grid grid-cols-2 gap-3">
                {['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'].map((g) => (
                  <button key={g} onClick={() => update('gender', g)}
                          className="p-3 rounded-xl text-sm font-medium transition-all"
                          style={{
                            background: form.gender === g ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                            border: `1px solid ${form.gender === g ? 'var(--primary)' : 'var(--border)'}`,
                            color: form.gender === g ? 'var(--primary-light)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                          }}>
                    {g.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <h3 className="text-lg font-semibold mt-8 mb-4">Age Range</h3>
              <div className="grid grid-cols-4 gap-3">
                {['18-22', '23-27', '28-32', '33+'].map((a) => (
                  <button key={a} onClick={() => update('ageRange', a)}
                          className="p-3 rounded-xl text-sm font-medium transition-all"
                          style={{
                            background: form.ageRange === a ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                            border: `1px solid ${form.ageRange === a ? 'var(--primary)' : 'var(--border)'}`,
                            color: form.ageRange === a ? 'var(--primary-light)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                          }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ Step 2: Details ═══ */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-semibold mb-2">Tell us more about yourself</h2>
              {form.role === 'STUDENT' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>University / College</label>
                    <input className="input-field" placeholder="e.g., Pimpri Chinchwad University" value={form.university} onChange={(e) => update('university', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Course / Department</label>
                    <input className="input-field" placeholder="e.g., Computer Science, MBA" value={form.courseOrDept} onChange={(e) => update('courseOrDept', e.target.value)} />
                  </div>
                </>
              )}
              {(form.role === 'PROFESSIONAL' || form.role === 'INTERN') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Company</label>
                    <input className="input-field" placeholder="e.g., TCS, Infosys" value={form.company} onChange={(e) => update('company', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Monthly Income Bracket</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['< ₹20k', '₹20k–40k', '₹40k–70k', '₹70k+'].map((inc) => (
                        <button key={inc} onClick={() => update('monthlyIncome', inc)}
                                className="p-3 rounded-xl text-sm font-medium transition-all"
                                style={{
                                  background: form.monthlyIncome === inc ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                                  border: `1px solid ${form.monthlyIncome === inc ? 'var(--primary)' : 'var(--border)'}`,
                                  color: form.monthlyIncome === inc ? 'var(--primary-light)' : 'var(--text-secondary)',
                                  cursor: 'pointer',
                                }}>
                          {inc}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>When are you moving?</label>
                <input className="input-field" placeholder="e.g., April 2026" value={form.moveMonth} onChange={(e) => update('moveMonth', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Hometown</label>
                <input className="input-field" placeholder="e.g., Mumbai, Delhi, Nagpur" value={form.hometown} onChange={(e) => update('hometown', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Phone (optional)</label>
                <input className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Short bio (optional)</label>
                <textarea className="input-field" rows={3} placeholder="Tell newcomers a bit about yourself..." value={form.bio} onChange={(e) => update('bio', e.target.value)} />
              </div>
            </div>
          )}

          {/* ═══ Step 3: Lifestyle ═══ */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-semibold mb-2">Your Lifestyle</h2>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <Heart size={14} className="inline mr-1" /> Interests & Hobbies (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {interestOptions.map(({ value, label, icon: Icon }) => {
                    const selected = form.interests.includes(value);
                    return (
                      <button key={value} onClick={() => toggleInterest(value)}
                              className="flex items-center gap-3 p-3 rounded-xl text-sm transition-all"
                              style={{
                                background: selected ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                                border: `1px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                                color: selected ? 'var(--primary-light)' : 'var(--text-secondary)',
                                cursor: 'pointer', textAlign: 'left',
                              }}>
                        <Icon size={16} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Food Preference */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <Utensils size={14} className="inline mr-1" /> Food Preference
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'veg', label: '🥗 Vegetarian' },
                    { value: 'non-veg', label: '🍖 Non-Vegetarian' },
                    { value: 'vegan', label: '🌱 Vegan' },
                    { value: 'eggetarian', label: '🥚 Eggetarian' },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => update('foodPreference', opt.value)}
                            className="p-3 rounded-xl text-sm font-medium transition-all"
                            style={{
                              background: form.foodPreference === opt.value ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                              border: `1px solid ${form.foodPreference === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                              color: form.foodPreference === opt.value ? 'var(--primary-light)' : 'var(--text-secondary)',
                              cursor: 'pointer',
                            }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lifestyle Type */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <Sun size={14} className="inline mr-1" /> Lifestyle Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'early_bird', label: '🌅 Early Bird', icon: Sun },
                    { value: 'night_owl', label: '🌙 Night Owl', icon: Moon },
                    { value: 'social', label: '🎉 Social Butterfly', icon: PartyPopper },
                    { value: 'introvert', label: '📚 Introvert', icon: BookOpen },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => update('lifestyle', opt.value)}
                            className="p-3 rounded-xl text-sm font-medium transition-all"
                            style={{
                              background: form.lifestyle === opt.value ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                              border: `1px solid ${form.lifestyle === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                              color: form.lifestyle === opt.value ? 'var(--primary-light)' : 'var(--text-secondary)',
                              cursor: 'pointer',
                            }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smoking / Drinking */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                    <Cigarette size={14} className="inline mr-1" /> Smoking
                  </label>
                  <div className="flex flex-col gap-2">
                    {['no', 'occasionally', 'yes'].map((opt) => (
                      <button key={opt} onClick={() => update('smoking', opt)}
                              className="p-2 rounded-lg text-sm transition-all"
                              style={{
                                background: form.smoking === opt ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                                border: `1px solid ${form.smoking === opt ? 'var(--primary)' : 'var(--border)'}`,
                                color: form.smoking === opt ? 'var(--primary-light)' : 'var(--text-secondary)',
                                cursor: 'pointer', textTransform: 'capitalize',
                              }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                    <Wine size={14} className="inline mr-1" /> Drinking
                  </label>
                  <div className="flex flex-col gap-2">
                    {['no', 'occasionally', 'yes'].map((opt) => (
                      <button key={opt} onClick={() => update('drinking', opt)}
                              className="p-2 rounded-lg text-sm transition-all"
                              style={{
                                background: form.drinking === opt ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                                border: `1px solid ${form.drinking === opt ? 'var(--primary)' : 'var(--border)'}`,
                                color: form.drinking === opt ? 'var(--primary-light)' : 'var(--text-secondary)',
                                cursor: 'pointer', textTransform: 'capitalize',
                              }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pet Friendly */}
              <button
                onClick={() => update('petFriendly', !form.petFriendly)}
                className="flex items-center gap-3 p-4 rounded-xl transition-all"
                style={{
                  background: form.petFriendly ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                  border: `1px solid ${form.petFriendly ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left',
                }}>
                <Dog size={20} style={{ color: form.petFriendly ? 'var(--primary-light)' : 'var(--text-muted)' }} />
                <div className="flex-1">
                  <div className="text-sm font-semibold">Pet Friendly</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>I'm okay living with pets around</div>
                </div>
                <div className="w-10 h-6 rounded-full transition-all duration-300 relative"
                     style={{ background: form.petFriendly ? 'var(--primary)' : 'var(--border)' }}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300"
                       style={{ left: form.petFriendly ? '18px' : '2px' }} />
                </div>
              </button>
            </div>
          )}

          {/* ═══ Step 4: Preferences ═══ */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-semibold mb-2">Your Preferences</h2>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <MapPin size={14} className="inline mr-1" /> City
                </label>
                <input className="input-field" value={form.city} onChange={(e) => update('city', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Preferred Area</label>
                <input className="input-field" placeholder="e.g., Kothrud, Hinjewadi, Wakad" value={form.preferredArea} onChange={(e) => update('preferredArea', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <DollarSign size={14} className="inline mr-1" /> Monthly Housing Budget
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Min (₹)</label>
                    <input type="number" className="input-field" value={form.budgetMin} onChange={(e) => update('budgetMin', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Max (₹)</label>
                    <input type="number" className="input-field" value={form.budgetMax} onChange={(e) => update('budgetMax', Number(e.target.value))} />
                  </div>
                </div>
              </div>

              {/* Work Schedule */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <Clock size={14} className="inline mr-1" /> Work Schedule
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'morning', label: '☀️ Morning (6-2 PM)' },
                    { value: 'day', label: '🌤️ Day (9-6 PM)' },
                    { value: 'night', label: '🌙 Night Shift' },
                    { value: 'flexible', label: '🔄 Flexible / WFH' },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => update('workSchedule', opt.value)}
                            className="p-3 rounded-xl text-sm font-medium transition-all"
                            style={{
                              background: form.workSchedule === opt.value ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                              border: `1px solid ${form.workSchedule === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                              color: form.workSchedule === opt.value ? 'var(--primary-light)' : 'var(--text-secondary)',
                              cursor: 'pointer',
                            }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transport */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <Car size={14} className="inline mr-1" /> How do you commute?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'own_vehicle', label: '🏍️ Own Vehicle' },
                    { value: 'public', label: '🚌 Public Transport' },
                    { value: 'cab', label: '🚕 Cab / Auto' },
                    { value: 'walking', label: '🚶 Walking / Cycle' },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => update('transportMode', opt.value)}
                            className="p-3 rounded-xl text-sm font-medium transition-all"
                            style={{
                              background: form.transportMode === opt.value ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                              border: `1px solid ${form.transportMode === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                              color: form.transportMode === opt.value ? 'var(--primary-light)' : 'var(--text-secondary)',
                              cursor: 'pointer',
                            }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <Globe2 size={14} className="inline mr-1" /> Languages You Speak
                </label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((lang) => {
                    const selected = form.languages.includes(lang);
                    return (
                      <button key={lang} onClick={() => toggleLanguage(lang)}
                              className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                              style={{
                                background: selected ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                                border: `1px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                                color: selected ? 'var(--primary-light)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                              }}>
                        {selected ? '✓ ' : ''}{lang}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══ Step 5: Safety & Summary ═══ */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Safety & Privacy</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Customize your experience for maximum comfort.</p>

              {form.gender === 'FEMALE' && (
                <button
                  onClick={() => update('isWomenMode', !form.isWomenMode)}
                  className="w-full flex items-center gap-4 p-5 rounded-xl transition-all duration-200 mb-6"
                  style={{
                    background: form.isWomenMode ? 'rgba(236,72,153,0.1)' : 'var(--bg-secondary)',
                    border: `2px solid ${form.isWomenMode ? '#ec4899' : 'var(--border)'}`,
                    cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left',
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: form.isWomenMode ? 'rgba(236,72,153,0.2)' : 'var(--bg-card)' }}>
                    <Shield size={22} style={{ color: form.isWomenMode ? '#ec4899' : 'var(--text-muted)' }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Enable Women Mode</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Women-only communities, safety tags, women mentor priority</div>
                    <div className="text-xs mt-1" style={{ color: '#f59e0b' }}>⚠️ Requires ID verification for access</div>
                  </div>
                  <div className="w-12 h-7 rounded-full transition-all duration-300 relative"
                       style={{ background: form.isWomenMode ? '#ec4899' : 'var(--border)' }}>
                    <div className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all duration-300"
                         style={{ left: form.isWomenMode ? '22px' : '2px' }} />
                  </div>
                </button>
              )}

              {/* Summary */}
              <div className="glass-card p-5">
                <h3 className="font-semibold mb-3">📋 Profile Summary</h3>
                <div className="flex flex-col gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex justify-between"><span>Role:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{form.role}</span></div>
                  <div className="flex justify-between"><span>Age:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{form.ageRange || 'Not set'}</span></div>
                  <div className="flex justify-between"><span>City:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{form.city}</span></div>
                  <div className="flex justify-between"><span>Area:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{form.preferredArea || 'Any'}</span></div>
                  <div className="flex justify-between"><span>Budget:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>₹{form.budgetMin} - ₹{form.budgetMax}</span></div>
                  <div className="flex justify-between"><span>Moving:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{form.moveMonth || 'Not set'}</span></div>
                  <div className="flex justify-between"><span>Food:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{form.foodPreference || 'Not set'}</span></div>
                  <div className="flex justify-between"><span>Lifestyle:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{form.lifestyle?.replace('_', ' ') || 'Not set'}</span></div>
                  {form.interests.length > 0 && (
                    <div className="flex justify-between"><span>Interests:</span> <span className="font-medium text-right" style={{ color: 'var(--text-primary)', maxWidth: '60%' }}>{form.interests.join(', ')}</span></div>
                  )}
                  {form.languages.length > 0 && (
                    <div className="flex justify-between"><span>Languages:</span> <span className="font-medium text-right" style={{ color: 'var(--text-primary)', maxWidth: '60%' }}>{form.languages.join(', ')}</span></div>
                  )}
                  {form.isWomenMode && <div className="badge badge-danger w-fit mt-2"><Shield size={12} className="mr-1" /> Women Mode Active</div>}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="btn-secondary flex items-center gap-2">
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div />}

            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="btn-primary flex items-center gap-2"
                      disabled={step === 0 && (!form.role || !form.gender)}>
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleFinish} className="btn-accent flex items-center gap-2" disabled={loading}>
                {loading ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <>Finish Setup <Sparkles size={16} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
