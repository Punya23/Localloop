'use client';

import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { api } from '@/lib/api';
import {
  Users, Shield, Home, Star, CheckCircle2, XCircle,
  Search, ChevronDown, Eye, UserCheck, BarChart3,
  Building2, Award, AlertTriangle, Clock, Plus,
  ArrowRight, RefreshCw, MessageSquare, Trash2, Edit,
  X, Upload, Mail,
} from 'lucide-react';

/* ── Types ──────────────────────────────────────────────── */

type Tab = 'overview' | 'users' | 'verifications' | 'housing' | 'mentors' | 'messages';

/* ── Admin Panel ────────────────────────────────────────── */

export default function AdminPage() {
  const { user, isReady, accessDenied } = useAuthGuard({ requireAdmin: true });
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [userMeta, setUserMeta] = useState<any>({});
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [housings, setHousings] = useState<any[]>([]);
  const [housingMeta, setHousingMeta] = useState<any>({});
  const [pendingMentors, setPendingMentors] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageMeta, setMessageMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [housingPage, setHousingPage] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  const [showCreateHousing, setShowCreateHousing] = useState(false);

  // Create Housing form state
  const [newHousing, setNewHousing] = useState({
    title: '', description: '', address: '', area: '', city: 'Pune',
    rent: 0, deposit: 0, type: 'PG', genderPreference: 'ANY',
    amenities: '' as string, isWomenFriendly: false,
    contactPhone: '', contactEmail: '',
    images: [] as string[],
  });
  const [creatingHousing, setCreatingHousing] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Fetch data based on active tab
  useEffect(() => {
    if (!isReady || !user || accessDenied) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        if (activeTab === 'overview') {
          const s = await api.getAdminDashboard();
          setStats(s);
        } else if (activeTab === 'users') {
          const res = await api.getAdminUsers(userPage, 20, search || undefined);
          setUsers(res.data || []);
          setUserMeta(res.meta || {});
        } else if (activeTab === 'verifications') {
          const v = await api.getPendingVerifications();
          setPendingVerifications(v || []);
        } else if (activeTab === 'housing') {
          const h = await api.getAdminHousings(housingPage, 20);
          setHousings(h.data || []);
          setHousingMeta(h.meta || {});
        } else if (activeTab === 'mentors') {
          const m = await api.getPendingMentors();
          setPendingMentors(m || []);
        } else if (activeTab === 'messages') {
          const m = await api.getAdminMessages(messagePage, 20);
          setMessages(m.data || []);
          setMessageMeta(m.meta || {});
        }
      } catch (err) {
        console.error('Admin fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isReady, user, accessDenied, activeTab, userPage, housingPage, search, messagePage]);

  // Action handlers
  const handleVerifyUser = async (userId: string, approved: boolean) => {
    try {
      await api.verifyUserAdmin(userId, approved, approved ? 'Approved by admin' : 'Rejected by admin');
      setPendingVerifications((prev) => prev.filter((v) => v.id !== userId));
    } catch (err) {
      console.error('Verify error:', err);
    }
  };

  const handleVerifyHousing = async (housingId: string, verified: boolean) => {
    try {
      await api.verifyHousingAdmin(housingId, verified);
      setHousings((prev) => prev.map((h) => h.id === housingId ? { ...h, isVerified: verified } : h));
    } catch (err) {
      console.error('Verify housing error:', err);
    }
  };

  const handleDeleteHousing = async (housingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.adminDeleteHousing(housingId);
      setHousings((prev) => prev.filter((h) => h.id !== housingId));
    } catch (err) {
      console.error('Delete housing error:', err);
    }
  };

  const handleApproveMentor = async (profileId: string, approved: boolean) => {
    try {
      await api.approveMentorAdmin(profileId, approved);
      setPendingMentors((prev) => prev.filter((m) => m.id !== profileId));
    } catch (err) {
      console.error('Mentor approval error:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingImages(true);
    try {
      const fileArray = Array.from(files);
      const result = await api.uploadImages(fileArray, 'housing');
      setNewHousing((prev) => ({
        ...prev,
        images: [...prev.images, ...result.images.map((img: any) => img.url)],
      }));
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleCreateHousing = async () => {
    setCreatingHousing(true);
    try {
      await api.adminCreateHousing({
        ...newHousing,
        rent: Number(newHousing.rent),
        deposit: Number(newHousing.deposit) || undefined,
        amenities: newHousing.amenities.split(',').map((a: string) => a.trim()).filter(Boolean),
      });
      setShowCreateHousing(false);
      setNewHousing({
        title: '', description: '', address: '', area: '', city: 'Pune',
        rent: 0, deposit: 0, type: 'PG', genderPreference: 'ANY',
        amenities: '', isWomenFriendly: false, contactPhone: '', contactEmail: '',
        images: [],
      });
      // Refresh housing list
      const h = await api.getAdminHousings(housingPage, 20);
      setHousings(h.data || []);
      setHousingMeta(h.meta || {});
    } catch (err: any) {
      alert(err.message || 'Failed to create housing');
    } finally {
      setCreatingHousing(false);
    }
  };

  if (!isReady) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ height: '32px', width: '300px', borderRadius: '12px', background: '#f0f1f5', animation: 'pulse 1.5s infinite', margin: '0 auto' }} />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
          <Shield size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>Admin Access Required</h1>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>Only admin accounts can access this panel. Contact the system administrator.</p>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'verifications', label: 'Verifications', icon: Shield },
    { key: 'housing', label: 'Housing', icon: Building2 },
    { key: 'mentors', label: 'Mentors', icon: Award },
    { key: 'messages', label: 'Messages', icon: Mail },
  ];

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid #e5e7ee', fontSize: '14px', outline: 'none',
    fontFamily: 'Inter, sans-serif', color: '#1a1a2e', background: '#f8f9fc',
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 100px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={24} style={{ color: '#6366f1' }} /> Admin Panel
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>Manage users, verifications, housing, mentors, and messages</p>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '28px', overflowX: 'auto',
        background: '#f8f9fc', borderRadius: '14px', padding: '4px',
      }}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setLoading(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', border: 'none',
              background: activeTab === key ? '#fff' : 'transparent',
              color: activeTab === key ? '#6366f1' : '#94a3b8',
              boxShadow: activeTab === key ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* ══════════ OVERVIEW TAB ══════════ */}
      {activeTab === 'overview' && (
        <div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ height: '100px', borderRadius: '16px', background: '#f0f1f5', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : stats && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#6366f1' },
                  { label: 'Verified Users', value: stats.verifiedUsers, icon: UserCheck, color: '#10b981' },
                  { label: 'Pending Verifications', value: stats.pendingVerifications, icon: Clock, color: '#f59e0b' },
                  { label: 'Total Listings', value: stats.totalHousings, icon: Building2, color: '#06b6d4' },
                  { label: 'Verified Listings', value: stats.verifiedHousings, icon: CheckCircle2, color: '#10b981' },
                  { label: 'Communities', value: stats.totalCommunities, icon: MessageSquare, color: '#8b5cf6' },
                  { label: 'Active Mentors', value: stats.totalMentors, icon: Star, color: '#f59e0b' },
                  { label: 'Pending Mentors', value: stats.pendingMentors, icon: AlertTriangle, color: '#ef4444' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} style={{
                    background: '#fff', borderRadius: '16px', padding: '20px',
                    border: '1px solid #e5e7ee', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: `${color}15`,
                      }}>
                        <Icon size={18} style={{ color }} />
                      </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e' }}>{value}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginTop: '2px' }}>{label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════ USERS TAB ══════════ */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setUserPage(1); }}
                placeholder="Search users by name or email..."
                style={{
                  width: '100%', padding: '11px 14px 11px 40px', borderRadius: '12px',
                  border: '1px solid #e5e7ee', fontSize: '14px', outline: 'none',
                  fontFamily: 'Inter, sans-serif', color: '#1a1a2e', background: '#f8f9fc',
                }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: '60px', borderRadius: '12px', background: '#f0f1f5', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7ee', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fc' }}>
                    {['Name', 'Email', 'Role', 'City', 'Verified', 'Status', 'Joined'].map((h) => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderTop: '1px solid #f0f1f5' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1a1a2e' }}>{u.name}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: '#f0f1f5', color: '#64748b', fontWeight: 500 }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{u.city || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.isVerified ? (
                          <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                        ) : (
                          <XCircle size={16} style={{ color: '#cbd5e1' }} />
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                          ...(u.verificationStatus === 'PENDING' ? { background: '#fef3c7', color: '#92400e' } :
                            u.verificationStatus === 'VERIFIED' ? { background: '#d1fae5', color: '#065f46' } :
                              { background: '#f0f1f5', color: '#94a3b8' }),
                        }}>
                          {u.verificationStatus || 'NONE'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '12px' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {userMeta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px' }}>
                  <button onClick={() => setUserPage(Math.max(1, userPage - 1))} disabled={userPage <= 1}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, background: '#f8f9fc', border: '1px solid #e5e7ee', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Prev
                  </button>
                  <span style={{ padding: '6px 12px', fontSize: '13px', color: '#94a3b8' }}>{userPage} / {userMeta.totalPages}</span>
                  <button onClick={() => setUserPage(Math.min(userMeta.totalPages, userPage + 1))} disabled={userPage >= userMeta.totalPages}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════ VERIFICATIONS TAB ══════════ */}
      {activeTab === 'verifications' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: '#f59e0b' }} /> Pending ID Verifications
          </h2>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2].map((i) => (
                <div key={i} style={{ height: '120px', borderRadius: '16px', background: '#f0f1f5', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : pendingVerifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: '#f8f9fc', borderRadius: '16px', border: '1px solid #e5e7ee' }}>
              <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>All clear!</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>No pending verifications</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingVerifications.map((v) => (
                <div key={v.id} style={{
                  background: '#fff', borderRadius: '16px', padding: '20px',
                  border: '1px solid #e5e7ee', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>{v.name}</h3>
                      <p style={{ fontSize: '13px', color: '#94a3b8' }}>{v.email}</p>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
                        <span>Gender: {v.gender}</span>
                        <span>ID Type: {v.idProofType || 'N/A'}</span>
                      </div>
                    </div>
                    {v.idProofUrl && (
                      <a href={v.idProofUrl} target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
                          background: '#f8f9fc', color: '#6366f1', textDecoration: 'none', border: '1px solid #e5e7ee',
                        }}>
                        <Eye size={14} /> View ID
                      </a>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleVerifyUser(v.id, true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                        background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleVerifyUser(v.id, false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                        background: '#fff', color: '#ef4444', border: '1px solid #fca5a5', cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ HOUSING TAB ══════════ */}
      {activeTab === 'housing' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} style={{ color: '#06b6d4' }} /> All Housing Listings
            </h2>
            <button
              onClick={() => setShowCreateHousing(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <Plus size={14} /> Create Listing
            </button>
          </div>

          {/* ── Create Housing Modal ── */}
          {showCreateHousing && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            }}>
              <div style={{
                background: '#fff', borderRadius: '20px', padding: '28px',
                width: '100%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e' }}>Create Housing Listing</h2>
                  <button onClick={() => setShowCreateHousing(false)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                  }}><X size={22} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Title *</label>
                    <input value={newHousing.title} onChange={(e) => setNewHousing({ ...newHousing, title: e.target.value })}
                      placeholder="e.g. Sunny PG for Women" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Description *</label>
                    <textarea value={newHousing.description} onChange={(e) => setNewHousing({ ...newHousing, description: e.target.value })}
                      placeholder="Describe the property..." rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Address *</label>
                      <input value={newHousing.address} onChange={(e) => setNewHousing({ ...newHousing, address: e.target.value })}
                        placeholder="Full address" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Area *</label>
                      <input value={newHousing.area} onChange={(e) => setNewHousing({ ...newHousing, area: e.target.value })}
                        placeholder="e.g. Hinjewadi" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Rent (₹) *</label>
                      <input type="number" value={newHousing.rent || ''} onChange={(e) => setNewHousing({ ...newHousing, rent: Number(e.target.value) })}
                        placeholder="10000" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Deposit (₹)</label>
                      <input type="number" value={newHousing.deposit || ''} onChange={(e) => setNewHousing({ ...newHousing, deposit: Number(e.target.value) })}
                        placeholder="20000" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>City</label>
                      <input value={newHousing.city} onChange={(e) => setNewHousing({ ...newHousing, city: e.target.value })}
                        style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Type</label>
                      <select value={newHousing.type} onChange={(e) => setNewHousing({ ...newHousing, type: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="PG">PG</option>
                        <option value="HOSTEL">Hostel</option>
                        <option value="FLAT">Flat</option>
                        <option value="SHARED_ROOM">Shared Room</option>
                        <option value="SINGLE_ROOM">Single Room</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Gender Preference</label>
                      <select value={newHousing.genderPreference} onChange={(e) => setNewHousing({ ...newHousing, genderPreference: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="ANY">Any</option>
                        <option value="MALE_ONLY">Male Only</option>
                        <option value="FEMALE_ONLY">Female Only</option>
                        <option value="CO_ED">Co-Ed</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Amenities (comma-separated)</label>
                    <input value={newHousing.amenities} onChange={(e) => setNewHousing({ ...newHousing, amenities: e.target.value })}
                      placeholder="WiFi, AC, Parking, Gym" style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Contact Phone</label>
                      <input value={newHousing.contactPhone} onChange={(e) => setNewHousing({ ...newHousing, contactPhone: e.target.value })}
                        placeholder="+91..." style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Contact Email</label>
                      <input value={newHousing.contactEmail} onChange={(e) => setNewHousing({ ...newHousing, contactEmail: e.target.value })}
                        placeholder="owner@email.com" style={inputStyle} />
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 0' }}>
                    <input type="checkbox" checked={newHousing.isWomenFriendly}
                      onChange={(e) => setNewHousing({ ...newHousing, isWomenFriendly: e.target.checked })} />
                    <span style={{ fontSize: '14px', color: '#1a1a2e' }}>Women Friendly</span>
                  </label>

                  {/* Image Upload */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Images</label>
                    {newHousing.images.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {newHousing.images.map((url, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden' }}>
                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button onClick={() => setNewHousing({ ...newHousing, images: newHousing.images.filter((_, i) => i !== idx) })}
                              style={{
                                position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px',
                                borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff',
                                border: 'none', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                              }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '12px', border: '2px dashed #e5e7ee', borderRadius: '12px',
                      cursor: 'pointer', fontSize: '13px', color: '#94a3b8', fontWeight: 500,
                    }}>
                      <Upload size={16} />
                      {uploadingImages ? 'Uploading...' : 'Upload Images'}
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload}
                        style={{ display: 'none' }} disabled={uploadingImages} />
                    </label>
                  </div>

                  <button onClick={handleCreateHousing} disabled={creatingHousing || !newHousing.title || !newHousing.description || !newHousing.rent}
                    style={{
                      padding: '12px', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
                      background: creatingHousing || !newHousing.title ? '#e5e7ee' : '#6366f1',
                      color: creatingHousing || !newHousing.title ? '#94a3b8' : '#fff',
                      border: 'none', cursor: creatingHousing ? 'not-allowed' : 'pointer',
                      fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px', marginTop: '8px',
                    }}>
                    {creatingHousing ? 'Creating...' : <>
                      <Plus size={18} /> Create Listing
                    </>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: '80px', borderRadius: '12px', background: '#f0f1f5', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {housings.map((h) => (
                <div key={h.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#fff', borderRadius: '14px', padding: '16px 20px',
                  border: '1px solid #e5e7ee',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a2e' }}>{h.title}</h3>
                      {h.isVerified && (
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: '#d1fae5', color: '#065f46' }}>VERIFIED</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                      <span>{h.area}, {h.city}</span>
                      <span>₹{h.rent?.toLocaleString()}/mo</span>
                      <span>by {h.createdBy?.name || 'Admin'}</span>
                      <span>{h._count?.reviews || 0} reviews</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleVerifyHousing(h.id, !h.isVerified)}
                      style={{
                        padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                        background: h.isVerified ? '#fff' : '#6366f1',
                        color: h.isVerified ? '#ef4444' : '#fff',
                        border: h.isVerified ? '1px solid #fca5a5' : 'none',
                        cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                      }}
                    >
                      {h.isVerified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleDeleteHousing(h.id)}
                      style={{
                        padding: '8px 12px', borderRadius: '10px', fontSize: '13px',
                        background: '#fff', color: '#ef4444', border: '1px solid #fca5a5',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {housingMeta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                  <button onClick={() => setHousingPage(Math.max(1, housingPage - 1))} disabled={housingPage <= 1}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', background: '#f8f9fc', border: '1px solid #e5e7ee', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Prev
                  </button>
                  <span style={{ padding: '6px 12px', fontSize: '13px', color: '#94a3b8' }}>{housingPage} / {housingMeta.totalPages}</span>
                  <button onClick={() => setHousingPage(Math.min(housingMeta.totalPages, housingPage + 1))} disabled={housingPage >= housingMeta.totalPages}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════ MENTORS TAB ══════════ */}
      {activeTab === 'mentors' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} style={{ color: '#f59e0b' }} /> Pending Mentor Applications
          </h2>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2].map((i) => (
                <div key={i} style={{ height: '100px', borderRadius: '16px', background: '#f0f1f5', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : pendingMentors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: '#f8f9fc', borderRadius: '16px', border: '1px solid #e5e7ee' }}>
              <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>No pending applications</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>All mentor applications have been processed</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingMentors.map((m) => (
                <div key={m.id} style={{
                  background: '#fff', borderRadius: '16px', padding: '20px',
                  border: '1px solid #e5e7ee',
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>{m.user?.name || 'Unknown'}</h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8' }}>{m.user?.email}</p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
                      <span>Expertise: {m.expertise || 'N/A'}</span>
                      <span>City: {m.user?.city || '—'}</span>
                      {m.user?.isVerified && <span style={{ color: '#10b981' }}>✓ Verified</span>}
                    </div>
                    {m.bio && <p style={{ fontSize: '13px', color: '#475569', marginTop: '8px' }}>{m.bio}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleApproveMentor(m.id, true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button onClick={() => handleApproveMentor(m.id, false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: '#fff', color: '#ef4444', border: '1px solid #fca5a5', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ MESSAGES TAB ══════════ */}
      {activeTab === 'messages' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} style={{ color: '#6366f1' }} /> Incoming Messages & Inquiries
          </h2>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: '80px', borderRadius: '16px', background: '#f0f1f5', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: '#f8f9fc', borderRadius: '16px', border: '1px solid #e5e7ee' }}>
              <Mail size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>No messages yet</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Housing inquiries and user messages will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{
                  display: 'flex', gap: '16px', background: '#fff', borderRadius: '14px',
                  padding: '16px 20px', border: `1px solid ${msg.isRead ? '#e5e7ee' : '#c7d2fe'}`,
                  ...(msg.isRead ? {} : { boxShadow: '0 0 0 2px rgba(99,102,241,0.08)' }),
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                    fontSize: '16px', fontWeight: 700, color: '#6366f1',
                  }}>
                    {(msg.sender?.name || '?').charAt(0).toUpperCase()}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{msg.sender?.name}</span>
                        {msg.sender?.email && (
                          <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>{msg.sender.email}</span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {new Date(msg.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: 0,
                      ...(msg.content?.startsWith('[Housing Inquiry:') ? {
                        background: 'rgba(99,102,241,0.05)', padding: '8px 12px',
                        borderRadius: '8px', borderLeft: '3px solid #6366f1',
                      } : {}),
                    }}>{msg.content}</p>
                    {!msg.isRead && (
                      <span style={{
                        display: 'inline-block', marginTop: '6px', fontSize: '10px', fontWeight: 600,
                        padding: '2px 8px', borderRadius: '10px', background: '#6366f1', color: '#fff',
                      }}>NEW</span>
                    )}
                  </div>
                </div>
              ))}

              {messageMeta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                  <button onClick={() => setMessagePage(Math.max(1, messagePage - 1))} disabled={messagePage <= 1}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', background: '#f8f9fc', border: '1px solid #e5e7ee', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Prev
                  </button>
                  <span style={{ padding: '6px 12px', fontSize: '13px', color: '#94a3b8' }}>{messagePage} / {messageMeta.totalPages}</span>
                  <button onClick={() => setMessagePage(Math.min(messageMeta.totalPages, messagePage + 1))} disabled={messagePage >= messageMeta.totalPages}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
