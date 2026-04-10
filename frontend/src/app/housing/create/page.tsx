'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { api } from '@/lib/api';
import { Building2, Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateHousingPage() {
  const router = useRouter();
  const { user, isReady } = useAuthGuard({ requireVerified: true });

  const [form, setForm] = useState({
    title: '', description: '', address: '', area: '', city: 'Pune',
    rent: '', deposit: '', type: 'PG', genderPreference: 'ANY',
    amenities: '', isWomenFriendly: false, contactPhone: '', contactEmail: '',
    images: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState('');

  if (!isReady || !user) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingImages(true);
    setError('');
    try {
      const fileArray = Array.from(files);
      const result = await api.uploadImages(fileArray, 'housing');
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...result.images.map((img: any) => img.url)],
      }));
    } catch (err: any) {
      setError(err.message || 'Image upload failed. Ensure Cloudinary is configured.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.area || !form.rent) {
      setError('Title, area, and rent are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.createHousing({
        ...form,
        rent: Number(form.rent) || 0,
        deposit: Number(form.deposit) || undefined,
        amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
      });
      router.push('/housing');
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)',
    fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', background: 'var(--bg-primary)',
  };

  return (
    <div className="min-h-screen px-4 py-8 relative">
      <div className="max-w-xl mx-auto z-10 relative">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={22} style={{ color: 'var(--text-muted)' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>List a Property</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Find flatmates or tenants quickly</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Property Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Spacious 2BHK in Baner" style={inputStyle} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Tell us about the property..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                  <option value="PG">PG</option>
                  <option value="FLAT">Flat (Entire)</option>
                  <option value="SHARED_ROOM">Shared Room</option>
                  <option value="SINGLE_ROOM">Single Room</option>
                  <option value="HOSTEL">Hostel</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Allowed</label>
                <select value={form.genderPreference} onChange={(e) => setForm({ ...form, genderPreference: e.target.value })} style={inputStyle}>
                  <option value="ANY">Anyone</option>
                  <option value="FEMALE_ONLY">Women Only</option>
                  <option value="MALE_ONLY">Men Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Rent per month *</label>
                <input type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })}
                  placeholder="₹" style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Deposit</label>
                <input type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })}
                  placeholder="₹" style={inputStyle} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Area *</label>
                <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
                  placeholder="e.g. Hinjewadi Phase 3" style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>City</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Full address" style={inputStyle} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Amenities (comma separated)</label>
              <input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                placeholder="WiFi, AC, Maid, Gym..." style={inputStyle} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Contact Phone</label>
                <input type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  placeholder="+91..." style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Contact Email</label>
                <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  placeholder="owner@email.com" style={inputStyle} />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer mt-2 mb-2">
              <input type="checkbox" checked={form.isWomenFriendly}
                onChange={(e) => setForm({ ...form, isWomenFriendly: e.target.checked })} />
              <span className="text-sm text-gray-700">Verified Women Safe Space <span className="text-rose-500 text-xs ml-1">(Requires strict approval)</span></span>
            </label>

            {/* Cloudinary Image Upload Section */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Property Pictures</label>
              {form.images.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {form.images.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })}
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
                cursor: 'pointer', fontSize: '13px', color: 'var(--primary)', fontWeight: 600, background: 'rgba(99,102,241,0.05)'
              }}>
                <Upload size={16} />
                {uploadingImages ? 'Uploading directly to Cloudinary...' : 'Add Pictures'}
                <input type="file" accept="image/*" multiple onChange={handleImageUpload}
                  style={{ display: 'none' }} disabled={uploadingImages} />
              </label>
              <p className="text-xs text-slate-400 mt-2">Images are powered by Cloudinary and will be served at lighting speed.</p>
            </div>
            
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

            <button type="submit" disabled={submitting || uploadingImages}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
                background: submitting || uploadingImages ? 'var(--border)' : 'var(--primary)',
                color: submitting || uploadingImages ? 'var(--text-muted)' : '#fff',
                border: 'none', cursor: submitting || uploadingImages ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', marginTop: '10px'
              }}>
              {submitting ? 'Creating Listing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
