'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import {
  Shield, Upload, CheckCircle2, XCircle, ArrowLeft, AlertTriangle,
  FileText, CreditCard, Globe, GraduationCap, Check, Camera,
} from 'lucide-react';

const ID_TYPES = [
  { value: 'AADHAAR', label: 'Aadhaar Card', icon: FileText },
  { value: 'PAN', label: 'PAN Card', icon: CreditCard },
  { value: 'PASSPORT', label: 'Passport', icon: Globe },
  { value: 'COLLEGE_ID', label: 'College/University ID', icon: GraduationCap },
];



export default function VerifyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser } = useAuthStore();
  const [selectedType, setSelectedType] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'uploaded' | 'pending' | 'approved' | 'rejected'>('idle');
  const [error, setError] = useState('');

  // Guard: must be authenticated
  if (isLoading) return null;
  if (!isAuthenticated) { router.replace('/login'); return null; }
  if (user?.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle2 size={64} className="mx-auto mb-4" style={{ color: 'var(--success)' }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>You're Already Verified</h1>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Your identity has been verified. You have full access to all features.</p>
          <Link href="/dashboard" className="btn-primary no-underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File must be under 10MB');
        return;
      }
      setUploadedFile(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) { setError('Please select an ID type'); return; }
    if (!imageUrl && !uploadedFile) { setError('Please upload an image of your ID'); return; }

    setSubmitting(true);
    setError('');

    try {
      let finalUrl = imageUrl;
      if (uploadedFile) {
        setUploading(true);
        try {
          const result = await api.uploadImage(uploadedFile, 'id_proofs');
          finalUrl = result.url;
          setUploading(false);
        } catch (uploadErr: any) {
          // If upload endpoint fails (e.g. Cloudinary not configured), fall back
          if (!imageUrl) {
            setError('Image upload is not configured yet. Please paste an image URL instead, or contact admin.');
            setUploading(false);
            setSubmitting(false);
            return;
          }
          setUploading(false);
        }
      }

      await api.uploadIdProof({ idProofUrl: finalUrl, idProofType: selectedType });
      setStatus('pending');
      updateUser({ verificationStatus: 'PENDING' as any });
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If already pending, show status
  const isPending = user?.verificationStatus === 'PENDING' || status === 'pending';
  const isRejected = user?.verificationStatus === 'REJECTED' || status === 'rejected';

  if (isPending || user?.verificationStatus === 'PENDING') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <Shield size={32} style={{ color: 'var(--warning)' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Verification In Progress</h1>
          <p className="mb-2" style={{ color: 'var(--text-muted)' }}>
            Your {user?.idProofType?.replace('_', ' ') || 'ID'} has been submitted and is awaiting admin review.
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>This typically takes 24–48 hours.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard" className="btn-secondary no-underline">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <XCircle size={64} className="mx-auto mb-4" style={{ color: 'var(--danger)' }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Verification Rejected</h1>
          <p className="mb-2" style={{ color: 'var(--text-muted)' }}>
            {user?.verificationNotes || 'Your ID verification was not successful. Please try uploading a clearer image or a different ID type.'}
          </p>
          {/* Let them re-upload */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] rounded-full opacity-10 blur-[100px]" style={{ background: 'var(--primary)' }} />

      <div className="max-w-lg mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={22} style={{ color: 'var(--text-muted)' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Identity Verification</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Upload a government-issued ID to unlock all features.</p>
          </div>
        </div>

        <div className="glass-card p-8">
          {/* Info Banner */}
          <div style={{
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 12, padding: '12px 16px', marginBottom: 24,
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, color: '#92400e' }}>
              <strong>Why verify?</strong> Verification unlocks Women Mode, verified badge, mentor eligibility, and community trust. Your ID is only seen by admins.
            </div>
          </div>

          {/* ID Type Selection */}
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Select ID Type</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ID_TYPES.map(({ value, label, icon: Icon }) => (
              <button key={value} onClick={() => setSelectedType(value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
                  borderRadius: 12, border: `2px solid ${selectedType === value ? 'var(--primary)' : 'var(--border)'}`,
                  background: selectedType === value ? 'rgba(99,102,241,0.06)' : '#fff',
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                }}>
                <Icon size={20} style={{ color: selectedType === value ? 'var(--primary)' : 'var(--text-muted)' }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: selectedType === value ? 'var(--text-primary)' : '#64748b' }}>{label}</span>
              </button>
            ))}
          </div>

          {/* Upload Area */}
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Upload ID Image</h3>
          <div style={{
            border: `2px dashed ${uploadedFile ? 'var(--success)' : 'var(--border)'}`,
            borderRadius: 16, padding: 32, textAlign: 'center',
            background: uploadedFile ? 'rgba(16,185,129,0.04)' : '#fafbfe',
            transition: 'all 0.2s', cursor: 'pointer', position: 'relative',
          }}>
            <input type="file" accept="image/*" onChange={handleFileChange}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
            {uploadedFile ? (
              <div>
                <CheckCircle2 size={28} className="mx-auto mb-2" style={{ color: 'var(--success)' }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{uploadedFile.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <Camera size={28} className="mx-auto mb-2" style={{ color: '#cbd5e1' }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>Click or drag to upload</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>JPG, PNG — max 10MB</p>
              </div>
            )}
          </div>

          {/* URL input (fall back if no file) */}
          <div className="mt-4">
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Or paste image URL</label>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-primary)', outline: 'none', fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)' }} />
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={submitting || uploading || !selectedType}
            style={{
              marginTop: 20, width: '100%', padding: '12px', borderRadius: 12, fontSize: 15, fontWeight: 600,
              background: submitting || uploading || !selectedType ? 'var(--border)' : 'var(--primary)',
              color: submitting || uploading || !selectedType ? 'var(--text-muted)' : '#fff',
              border: 'none', cursor: submitting || uploading || !selectedType ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, transition: 'all 0.2s',
            }}>
            {uploading ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Uploading...
              </>
            ) : submitting ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Shield size={18} /> Submit for Verification
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
