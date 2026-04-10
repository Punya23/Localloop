'use client';

import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { api } from '@/lib/api';
import {
  Users, Shield, Home, Star, CheckCircle2, XCircle,
  Search, ChevronDown, Eye, UserCheck, BarChart3,
  Building2, Award, AlertTriangle, Clock, Plus,
  ArrowRight, RefreshCw, MessageSquare, Trash2, Edit,
  X, Upload, Mail, Bell, Send, Flag, ScrollText,
  Calendar, MapPin,
} from 'lucide-react';

/* ── Types ──────────────────────────────────────────────── */

type Tab = 'overview' | 'users' | 'verifications' | 'housing' | 'communities' | 'mentors' | 'messages' | 'notifications' | 'reports' | 'audit' | 'events';

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
  const [communities, setCommunities] = useState<any[]>([]);
  const [communityMeta, setCommunityMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [housingPage, setHousingPage] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  const [communityPage, setCommunityPage] = useState(1);
  const [showCreateHousing, setShowCreateHousing] = useState(false);
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushSending, setPushSending] = useState(false);

  // New feature states
  const [notifHistory, setNotifHistory] = useState<any[]>([]);
  const [notifHistoryMeta, setNotifHistoryMeta] = useState<any>({});
  const [notifHistoryPage, setNotifHistoryPage] = useState(1);
  const [reports, setReports] = useState<any[]>([]);
  const [reportMeta, setReportMeta] = useState<any>({});
  const [reportPage, setReportPage] = useState(1);
  const [reportFilter, setReportFilter] = useState('');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditMeta, setAuditMeta] = useState<any>({});
  const [auditPage, setAuditPage] = useState(1);
  const [events, setEvents] = useState<any[]>([]);
  const [eventMeta, setEventMeta] = useState<any>({});
  const [eventPage, setEventPage] = useState(1);

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
        } else if (activeTab === 'communities') {
          const c = await api.getAdminCommunities(communityPage, 20);
          setCommunities(c.data || []);
          setCommunityMeta(c.meta || {});
        } else if (activeTab === 'notifications') {
          const nh = await api.getNotificationHistory(notifHistoryPage, 20);
          setNotifHistory(nh.data || []);
          setNotifHistoryMeta(nh.meta || {});
        } else if (activeTab === 'reports') {
          const r = await api.getAdminReports(reportFilter || undefined, reportPage, 20);
          setReports(r.data || []);
          setReportMeta(r.meta || {});
        } else if (activeTab === 'audit') {
          const a = await api.getAuditLog(auditPage, 30);
          setAuditLogs(a.data || []);
          setAuditMeta(a.meta || {});
        } else if (activeTab === 'events') {
          const e = await api.getAdminEvents(eventPage, 20);
          setEvents(e.data || []);
          setEventMeta(e.meta || {});
        }
      } catch (err) {
        console.error('Admin fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isReady, user, accessDenied, activeTab, userPage, housingPage, search, messagePage, communityPage, notifHistoryPage, reportPage, reportFilter, auditPage, eventPage]);

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

  const handlePushNotification = async () => {
    if (!pushTitle || !pushMessage) return;
    setPushSending(true);
    try {
      await api.adminPushNotification(pushTitle, pushMessage);
      alert('Notification broadcasted successfully to all users!');
      setPushTitle('');
      setPushMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to push notification');
    } finally {
      setPushSending(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban/unban this user?')) return;
    try {
      const res = await api.adminBanUser(userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, verificationStatus: res.message.includes('unbanned') ? 'UNVERIFIED' : 'REJECTED' } : u));
      alert(res.message);
    } catch (err) {
      console.error('Ban error:', err);
    }
  };

  const handleDeleteCommunity = async (communityId: string) => {
    if (!confirm('Are you sure you want to delete this community? All posts will be lost.')) return;
    try {
      await api.adminDeleteCommunity(communityId);
      setCommunities((prev) => prev.filter((c) => c.id !== communityId));
    } catch (err) {
      console.error('Delete community error:', err);
    }
  };

  const handleVerifyCommunity = async (communityId: string, verified: boolean) => {
    try {
      await api.verifyCommunityAdmin(communityId, verified);
      setCommunities((prev) => prev.map((c) => c.id === communityId ? { ...c, isVerified: verified } : c));
    } catch (err) {
      console.error('Verify community error:', err);
    }
  };

  const handleResolveReport = async (reportId: string, status: string) => {
    const notes = prompt('Admin notes (optional):');
    try {
      await api.resolveReport(reportId, status, notes || undefined);
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status, adminNotes: notes } : r));
    } catch (err) {
      console.error('Resolve report error:', err);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.adminDeleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error('Delete event error:', err);
    }
  };

  if (!isReady) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ height: '32px', width: '300px', borderRadius: '12px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite', margin: '0 auto' }} />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
          <Shield size={48} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Admin Access Required</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Only admin accounts can access this panel. Contact the system administrator.</p>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'verifications', label: 'Verifications', icon: Shield },
    { key: 'housing', label: 'Housing', icon: Building2 },
    { key: 'communities', label: 'Communities', icon: MessageSquare },
    { key: 'mentors', label: 'Mentors', icon: Award },
    { key: 'events', label: 'Events', icon: Calendar },
    { key: 'reports', label: 'Reports', icon: Flag },
    { key: 'messages', label: 'Messages', icon: Mail },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'audit', label: 'Audit Log', icon: ScrollText },
  ];

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid var(--border)', fontSize: '14px', outline: 'none',
    fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', background: 'var(--bg-primary)',
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 100px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={24} style={{ color: 'var(--primary)' }} /> Admin Panel
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Manage users, verifications, housing, mentors, and messages</p>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '28px', overflowX: 'auto',
        background: 'var(--bg-primary)', borderRadius: '14px', padding: '4px',
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
              color: activeTab === key ? 'var(--primary)' : 'var(--text-muted)',
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
                <div key={i} style={{ height: '100px', borderRadius: '16px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : stats && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'var(--primary)' },
                  { label: 'Verified Users', value: stats.verifiedUsers, icon: UserCheck, color: 'var(--success)' },
                  { label: 'Pending Verifications', value: stats.pendingVerifications, icon: Clock, color: 'var(--warning)' },
                  { label: 'Total Listings', value: stats.totalHousings, icon: Building2, color: 'var(--accent)' },
                  { label: 'Verified Listings', value: stats.verifiedHousings, icon: CheckCircle2, color: 'var(--success)' },
                  { label: 'Communities', value: stats.totalCommunities, icon: MessageSquare, color: '#8b5cf6' },
                  { label: 'Active Mentors', value: stats.totalMentors, icon: Star, color: 'var(--warning)' },
                  { label: 'Pending Mentors', value: stats.pendingMentors, icon: AlertTriangle, color: 'var(--danger)' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} style={{
                    background: 'var(--bg-card)', borderRadius: '16px', padding: '20px',
                    border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
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
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* ═══ Quick Actions ═══ */}
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowRight size={16} style={{ color: 'var(--primary)' }} /> Quick Actions
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Pending Verifications', value: stats.pendingVerifications, tab: 'verifications' as Tab, icon: Shield, color: 'var(--warning)', desc: 'ID proofs awaiting review' },
                  { label: 'Pending Mentor Apps', value: stats.pendingMentors, tab: 'mentors' as Tab, icon: Award, color: 'var(--danger)', desc: 'Mentor applications to process' },
                ].filter(a => a.value > 0).map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <button key={action.label} onClick={() => { setActiveTab(action.tab); setLoading(true); }} style={{
                      display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px',
                      background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)',
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif', textAlign: 'left', width: '100%',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: `${action.color}15`, flexShrink: 0,
                      }}>
                        <ActionIcon size={20} style={{ color: action.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {action.value} {action.label}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{action.desc}</div>
                      </div>
                      <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  );
                })}
                <button onClick={() => { setPushTitle('System Test'); setPushMessage('This is a test notification from the Admin Dashboard.'); handlePushNotification(); }} style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px',
                  background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif', textAlign: 'left', width: '100%',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--primary)15', flexShrink: 0,
                  }}>
                    <Bell size={20} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Test Broadcast
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Send test alert to all users</div>
                  </div>
                  <Send size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
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
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setUserPage(1); }}
                placeholder="Search users by name or email..."
                style={{
                  width: '100%', padding: '11px 14px 11px 40px', borderRadius: '12px',
                  border: '1px solid var(--border)', fontSize: '14px', outline: 'none',
                  fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', background: 'var(--bg-primary)',
                }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: '60px', borderRadius: '12px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-primary)' }}>
                    {['Name', 'Email', 'Role', 'City', 'Verified', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'var(--border-light)', color: '#64748b', fontWeight: 500 }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{u.city || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.isVerified ? (
                          <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                        ) : (
                          <XCircle size={16} style={{ color: '#cbd5e1' }} />
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                          ...(u.verificationStatus === 'PENDING' ? { background: '#fef3c7', color: '#92400e' } :
                            u.verificationStatus === 'VERIFIED' ? { background: '#d1fae5', color: '#065f46' } :
                            u.verificationStatus === 'REJECTED' ? { background: '#fee2e2', color: '#b91c1c' } :
                              { background: 'var(--border-light)', color: 'var(--text-muted)' }),
                        }}>
                          {u.verificationStatus === 'REJECTED' ? 'BANNED' : u.verificationStatus || 'NONE'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleBanUser(u.id)}
                          style={{
                            padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                            background: u.verificationStatus === 'REJECTED' ? '#d1fae5' : '#fee2e2',
                            color: u.verificationStatus === 'REJECTED' ? '#065f46' : '#b91c1c', border: 'none',
                          }}
                        >
                          {u.verificationStatus === 'REJECTED' ? 'UNBAN' : 'BAN'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {userMeta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px' }}>
                  <button onClick={() => setUserPage(Math.max(1, userPage - 1))} disabled={userPage <= 1}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, background: 'var(--bg-primary)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Prev
                  </button>
                  <span style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>{userPage} / {userMeta.totalPages}</span>
                  <button onClick={() => setUserPage(Math.min(userMeta.totalPages, userPage + 1))} disabled={userPage >= userMeta.totalPages}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
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
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: 'var(--warning)' }} /> Pending ID Verifications
          </h2>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2].map((i) => (
                <div key={i} style={{ height: '120px', borderRadius: '16px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : pendingVerifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>All clear!</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No pending verifications</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingVerifications.map((v) => (
                <div key={v.id} style={{
                  background: 'var(--bg-card)', borderRadius: '16px', padding: '20px',
                  border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{v.name}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{v.email}</p>
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
                          background: 'var(--bg-primary)', color: 'var(--primary)', textDecoration: 'none', border: '1px solid var(--border)',
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
                        background: 'var(--success)', color: '#fff', border: 'none', cursor: 'pointer',
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
                        background: 'var(--bg-card)', color: 'var(--danger)', border: '1px solid #fca5a5', cursor: 'pointer',
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
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} style={{ color: 'var(--accent)' }} /> All Housing Listings
            </h2>
            <button
              onClick={() => setShowCreateHousing(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer',
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
                background: 'var(--bg-card)', borderRadius: '20px', padding: '28px',
                width: '100%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Create Housing Listing</h2>
                  <button onClick={() => setShowCreateHousing(false)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  }}><X size={22} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Title *</label>
                    <input value={newHousing.title} onChange={(e) => setNewHousing({ ...newHousing, title: e.target.value })}
                      placeholder="e.g. Sunny PG for Women" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Description *</label>
                    <textarea value={newHousing.description} onChange={(e) => setNewHousing({ ...newHousing, description: e.target.value })}
                      placeholder="Describe the property..." rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Address *</label>
                      <input value={newHousing.address} onChange={(e) => setNewHousing({ ...newHousing, address: e.target.value })}
                        placeholder="Full address" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Area *</label>
                      <input value={newHousing.area} onChange={(e) => setNewHousing({ ...newHousing, area: e.target.value })}
                        placeholder="e.g. Hinjewadi" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Rent (₹) *</label>
                      <input type="number" value={newHousing.rent || ''} onChange={(e) => setNewHousing({ ...newHousing, rent: Number(e.target.value) })}
                        placeholder="10000" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Deposit (₹)</label>
                      <input type="number" value={newHousing.deposit || ''} onChange={(e) => setNewHousing({ ...newHousing, deposit: Number(e.target.value) })}
                        placeholder="20000" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>City</label>
                      <input value={newHousing.city} onChange={(e) => setNewHousing({ ...newHousing, city: e.target.value })}
                        style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Type</label>
                      <select value={newHousing.type} onChange={(e) => setNewHousing({ ...newHousing, type: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="PG">PG</option>
                        <option value="HOSTEL">Hostel</option>
                        <option value="FLAT">Flat</option>
                        <option value="SHARED_ROOM">Shared Room</option>
                        <option value="SINGLE_ROOM">Single Room</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Gender Preference</label>
                      <select value={newHousing.genderPreference} onChange={(e) => setNewHousing({ ...newHousing, genderPreference: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="ANY">Any</option>
                        <option value="MALE_ONLY">Male Only</option>
                        <option value="FEMALE_ONLY">Female Only</option>
                        <option value="CO_ED">Co-Ed</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Amenities (comma-separated)</label>
                    <input value={newHousing.amenities} onChange={(e) => setNewHousing({ ...newHousing, amenities: e.target.value })}
                      placeholder="WiFi, AC, Parking, Gym" style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Contact Phone</label>
                      <input value={newHousing.contactPhone} onChange={(e) => setNewHousing({ ...newHousing, contactPhone: e.target.value })}
                        placeholder="+91..." style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Contact Email</label>
                      <input value={newHousing.contactEmail} onChange={(e) => setNewHousing({ ...newHousing, contactEmail: e.target.value })}
                        placeholder="owner@email.com" style={inputStyle} />
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 0' }}>
                    <input type="checkbox" checked={newHousing.isWomenFriendly}
                      onChange={(e) => setNewHousing({ ...newHousing, isWomenFriendly: e.target.checked })} />
                    <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Women Friendly</span>
                  </label>

                  {/* Image Upload */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Images</label>
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
                      padding: '12px', border: '2px dashed var(--border)', borderRadius: '12px',
                      cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500,
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
                      background: creatingHousing || !newHousing.title ? 'var(--border)' : 'var(--primary)',
                      color: creatingHousing || !newHousing.title ? 'var(--text-muted)' : '#fff',
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
                <div key={i} style={{ height: '80px', borderRadius: '12px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {housings.map((h) => (
                <div key={h.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--bg-card)', borderRadius: '14px', padding: '16px 20px',
                  border: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{h.title}</h3>
                      {h.isVerified && (
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: '#d1fae5', color: '#065f46' }}>VERIFIED</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
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
                        background: h.isVerified ? '#fff' : 'var(--primary)',
                        color: h.isVerified ? 'var(--danger)' : '#fff',
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
                        background: 'var(--bg-card)', color: 'var(--danger)', border: '1px solid #fca5a5',
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
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', background: 'var(--bg-primary)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Prev
                  </button>
                  <span style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>{housingPage} / {housingMeta.totalPages}</span>
                  <button onClick={() => setHousingPage(Math.min(housingMeta.totalPages, housingPage + 1))} disabled={housingPage >= housingMeta.totalPages}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════ COMMUNITIES TAB ══════════ */}
      {activeTab === 'communities' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} style={{ color: '#8b5cf6' }} /> All Communities
            </h2>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: '80px', borderRadius: '12px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {communities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <MessageSquare size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', opacity: 0.5 }} />
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>No communities found</p>
                </div>
              ) : communities.map((c) => (
                <div key={c.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--bg-card)', borderRadius: '14px', padding: '16px 20px',
                  border: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</h3>
                      {c.isVerified && (
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: '#d1fae5', color: '#065f46' }}>VERIFIED</span>
                      )}
                      {!c.isVerified && (
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: '#fef3c7', color: '#b45309' }}>UNVERIFIED</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span style={{ textTransform: 'capitalize' }}>{c.type?.toLowerCase()}</span>
                      <span>{c.city}</span>
                      <span>{c.memberCount || 0} members</span>
                      <span>{c._count?.posts || 0} posts</span>
                    </div>
                    {c.description && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleVerifyCommunity(c.id, !c.isVerified)}
                      style={{
                        padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                        background: c.isVerified ? '#fff' : 'var(--primary)',
                        color: c.isVerified ? 'var(--danger)' : '#fff',
                        border: c.isVerified ? '1px solid #fca5a5' : 'none',
                        cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                      }}
                    >
                      {c.isVerified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleDeleteCommunity(c.id)}
                      style={{
                        padding: '8px 12px', borderRadius: '10px', fontSize: '13px',
                        background: 'var(--bg-card)', color: 'var(--danger)', border: '1px solid #fca5a5',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {communityMeta?.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                  <button onClick={() => setCommunityPage(Math.max(1, communityPage - 1))} disabled={communityPage <= 1}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', background: 'var(--bg-primary)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Prev
                  </button>
                  <span style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>{communityPage} / {communityMeta.totalPages}</span>
                  <button onClick={() => setCommunityPage(Math.min(communityMeta.totalPages, communityPage + 1))} disabled={communityPage >= communityMeta.totalPages}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
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
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} style={{ color: 'var(--warning)' }} /> Pending Mentor Applications
          </h2>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2].map((i) => (
                <div key={i} style={{ height: '100px', borderRadius: '16px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : pendingMentors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>No pending applications</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>All mentor applications have been processed</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingMentors.map((m) => (
                <div key={m.id} style={{
                  background: 'var(--bg-card)', borderRadius: '16px', padding: '20px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.user?.name || 'Unknown'}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{m.user?.email}</p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
                      <span>Expertise: {m.expertise || 'N/A'}</span>
                      <span>City: {m.user?.city || '—'}</span>
                      {m.user?.isVerified && <span style={{ color: 'var(--success)' }}>✓ Verified</span>}
                    </div>
                    {m.bio && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>{m.bio}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleApproveMentor(m.id, true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: 'var(--success)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button onClick={() => handleApproveMentor(m.id, false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: 'var(--bg-card)', color: 'var(--danger)', border: '1px solid #fca5a5', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
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
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} style={{ color: 'var(--primary)' }} /> Incoming Messages & Inquiries
          </h2>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: '80px', borderRadius: '16px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <Mail size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>No messages yet</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Housing inquiries and user messages will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{
                  display: 'flex', gap: '16px', background: 'var(--bg-card)', borderRadius: '14px',
                  padding: '16px 20px', border: `1px solid ${msg.isRead ? 'var(--border)' : '#c7d2fe'}`,
                  ...(msg.isRead ? {} : { boxShadow: '0 0 0 2px rgba(99,102,241,0.08)' }),
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                    fontSize: '16px', fontWeight: 700, color: 'var(--primary)',
                  }}>
                    {(msg.sender?.name || '?').charAt(0).toUpperCase()}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{msg.sender?.name}</span>
                        {msg.sender?.email && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>{msg.sender.email}</span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {new Date(msg.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0,
                      ...(msg.content?.startsWith('[Housing Inquiry:') ? {
                        background: 'rgba(99,102,241,0.05)', padding: '8px 12px',
                        borderRadius: '8px', borderLeft: '3px solid var(--primary)',
                      } : {}),
                    }}>{msg.content}</p>
                    {!msg.isRead && (
                      <span style={{
                        display: 'inline-block', marginTop: '6px', fontSize: '10px', fontWeight: 600,
                        padding: '2px 8px', borderRadius: '10px', background: 'var(--primary)', color: '#fff',
                      }}>NEW</span>
                    )}
                  </div>
                </div>
              ))}

              {messageMeta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                  <button onClick={() => setMessagePage(Math.max(1, messagePage - 1))} disabled={messagePage <= 1}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', background: 'var(--bg-primary)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Prev
                  </button>
                  <span style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>{messagePage} / {messageMeta.totalPages}</span>
                  <button onClick={() => setMessagePage(Math.min(messageMeta.totalPages, messagePage + 1))} disabled={messagePage >= messageMeta.totalPages}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* ══════════ NOTIFICATIONS TAB ══════════ */}
      {activeTab === 'notifications' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} style={{ color: 'var(--primary)' }} /> Push Notifications
          </h2>
          <div style={{
            background: 'var(--bg-card)', borderRadius: '16px', padding: '24px',
            border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            maxWidth: '600px', marginBottom: '28px',
          }}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
              Broadcast a push notification to all LocalLoop users. This will appear in their notifications tab immediately.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Notification Title</label>
                <input
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  placeholder="e.g. New Feature Update!"
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)',
                    fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', background: 'var(--bg-primary)',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Message Body</label>
                <textarea
                  value={pushMessage}
                  onChange={(e) => setPushMessage(e.target.value)}
                  placeholder="Type the broadcast message..."
                  rows={4}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)',
                    fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', background: 'var(--bg-primary)',
                    resize: 'vertical',
                  }}
                />
              </div>
              <button
                onClick={handlePushNotification}
                disabled={pushSending || !pushTitle || !pushMessage}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                  background: pushSending || !pushTitle || !pushMessage ? 'var(--border)' : 'var(--primary)',
                  color: pushSending || !pushTitle || !pushMessage ? 'var(--text-muted)' : '#fff',
                  border: 'none', cursor: pushSending || !pushTitle || !pushMessage ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif', marginTop: '8px', transition: 'background 0.2s',
                }}
              >
                {pushSending ? 'Broadcasting...' : <>
                  <Send size={16} /> Broadcast Notification
                </>}
              </button>
            </div>
          </div>

          {/* ═══ Notification History ═══ */}
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} style={{ color: 'var(--text-muted)' }} /> Broadcast History
          </h3>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: '70px', borderRadius: '12px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : notifHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <Bell size={32} style={{ color: '#cbd5e1', margin: '0 auto 10px' }} />
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No broadcasts sent yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifHistory.map((n: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--bg-card)', borderRadius: '14px', padding: '16px 20px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Bell size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{n.title}</h4>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '500px' }}>{n.description}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>{n.recipientCount} users</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ REPORTS TAB ══════════ */}
      {activeTab === 'reports' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flag size={18} style={{ color: 'var(--danger)' }} /> Flagged Content & Reports
            </h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['', 'pending', 'resolved', 'dismissed'].map((f) => (
                <button key={f} onClick={() => { setReportFilter(f); setReportPage(1); }} style={{
                  padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  border: reportFilter === f ? 'none' : '1px solid var(--border)',
                  background: reportFilter === f ? 'var(--primary)' : '#fff',
                  color: reportFilter === f ? '#fff' : '#64748b', transition: 'all 0.15s',
                }}>{f || 'All'}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: '80px', borderRadius: '12px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>No reports</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No flagged content to review</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reports.map((r: any) => (
                <div key={r.id} style={{
                  background: 'var(--bg-card)', borderRadius: '14px', padding: '18px 20px',
                  border: `1px solid ${r.status === 'pending' ? '#fca5a5' : 'var(--border)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase',
                          ...(r.status === 'pending' ? { background: '#fef3c7', color: '#92400e' } :
                            r.status === 'resolved' ? { background: '#d1fae5', color: '#065f46' } :
                            { background: 'var(--border-light)', color: 'var(--text-muted)' }),
                        }}>{r.status}</span>
                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px', background: '#fee2e2', color: '#b91c1c' }}>{r.reason}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.targetType} → {r.targetId?.slice(0, 8)}...</span>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Reported by {r.reporter?.name || 'Unknown'}</p>
                      {r.description && <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{r.description}</p>}
                      {r.adminNotes && <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontStyle: 'italic' }}>Admin: {r.adminNotes}</p>}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {r.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button onClick={() => handleResolveReport(r.id, 'resolved')} style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '10px',
                        fontSize: '12px', fontWeight: 600, background: 'var(--success)', color: '#fff',
                        border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      }}><CheckCircle2 size={13} /> Resolve</button>
                      <button onClick={() => handleResolveReport(r.id, 'dismissed')} style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '10px',
                        fontSize: '12px', fontWeight: 600, background: 'var(--bg-card)', color: 'var(--text-muted)',
                        border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      }}><XCircle size={13} /> Dismiss</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ AUDIT LOG TAB ══════════ */}
      {activeTab === 'audit' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ScrollText size={18} style={{ color: '#64748b' }} /> Admin Activity Log
          </h2>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ height: '48px', borderRadius: '10px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : auditLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <ScrollText size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No audit trail yet. Actions will be logged here automatically.</p>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-primary)' }}>
                    {['Admin', 'Action', 'Target', 'Details', 'Time'].map((h) => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log: any) => (
                    <tr key={log.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-primary)' }}>{log.admin?.name || '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px',
                          background: log.action.includes('delete') ? '#fee2e2' :
                            log.action.includes('ban') ? '#fef3c7' :
                            log.action.includes('verify') || log.action.includes('approve') ? '#d1fae5' :
                            log.action.includes('broadcast') ? '#e0e7ff' : 'var(--border-light)',
                          color: log.action.includes('delete') ? '#b91c1c' :
                            log.action.includes('ban') ? '#92400e' :
                            log.action.includes('verify') || log.action.includes('approve') ? '#065f46' :
                            log.action.includes('broadcast') ? '#4338ca' : '#64748b',
                        }}>{log.action.replace(/_/g, ' ')}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '12px' }}>
                        {log.targetType && <span style={{ textTransform: 'capitalize' }}>{log.targetType}</span>}
                        {log.targetId && <span style={{ color: '#cbd5e1' }}> #{log.targetId.slice(0, 8)}</span>}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.details || '—'}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {auditMeta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px' }}>
                  <button onClick={() => setAuditPage(Math.max(1, auditPage - 1))} disabled={auditPage <= 1}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', background: 'var(--bg-primary)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Prev
                  </button>
                  <span style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>{auditPage} / {auditMeta.totalPages}</span>
                  <button onClick={() => setAuditPage(Math.min(auditMeta.totalPages, auditPage + 1))} disabled={auditPage >= auditMeta.totalPages}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════ EVENTS TAB ══════════ */}
      {activeTab === 'events' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: '#8b5cf6' }} /> Events Management
          </h2>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: '80px', borderRadius: '12px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <Calendar size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>No events</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No events have been created yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {events.map((e: any) => {
                const isPast = new Date(e.date) < new Date();
                return (
                  <div key={e.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--bg-card)', borderRadius: '14px', padding: '16px 20px',
                    border: '1px solid var(--border)', opacity: isPast ? 0.6 : 1,
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{e.title}</h3>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase',
                          background: isPast ? 'var(--border-light)' : '#d1fae5',
                          color: isPast ? 'var(--text-muted)' : '#065f46',
                        }}>{isPast ? 'PAST' : e.type}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {new Date(e.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {e.location}
                        </span>
                        <span><Users size={12} style={{ verticalAlign: 'middle' }} /> {e._count?.attendees || 0} attendees</span>
                        {e.community && <span>Community: {e.community.name}</span>}
                        <span>by {e.createdBy?.name || 'Unknown'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(e.id)}
                      style={{
                        padding: '8px 12px', borderRadius: '10px', fontSize: '13px',
                        background: 'var(--bg-card)', color: 'var(--danger)', border: '1px solid #fca5a5',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}

              {eventMeta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                  <button onClick={() => setEventPage(Math.max(1, eventPage - 1))} disabled={eventPage <= 1}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', background: 'var(--bg-primary)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Prev
                  </button>
                  <span style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>{eventPage} / {eventMeta.totalPages}</span>
                  <button onClick={() => setEventPage(Math.min(eventMeta.totalPages, eventPage + 1))} disabled={eventPage >= eventMeta.totalPages}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
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
