'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Pune area coordinates lookup for housings without lat/lng
const PUNE_AREA_COORDS: Record<string, [number, number]> = {
  'hinjewadi': [18.5912, 73.7390],
  'wakad': [18.5997, 73.7553],
  'baner': [18.5591, 73.7852],
  'balewadi': [18.5764, 73.7719],
  'kharadi': [18.5530, 73.9400],
  'viman nagar': [18.5679, 73.9143],
  'koregaon park': [18.5362, 73.8930],
  'kothrud': [18.5074, 73.8077],
  'hadapsar': [18.5089, 73.9260],
  'aundh': [18.5580, 73.8070],
  'pimpri': [18.6278, 73.8007],
  'chinchwad': [18.6301, 73.7860],
  'shivajinagar': [18.5308, 73.8475],
  'katraj': [18.4575, 73.8663],
  'pune': [18.5204, 73.8567],
};

function guessCoords(area: string): [number, number] | null {
  if (!area) return null;
  const key = area.toLowerCase().trim();
  for (const [name, coords] of Object.entries(PUNE_AREA_COORDS)) {
    if (key.includes(name) || name.includes(key)) return coords;
  }
  return null;
}

// Custom marker icon using inline SVG to avoid Leaflet's missing default icon issue
function createMarkerIcon(rent: number, isWomenFriendly: boolean) {
  const color = isWomenFriendly ? '#10b981' : '#6366f1';
  const label = `₹${(rent / 1000).toFixed(0)}k`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="58" viewBox="0 0 48 58">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <path d="M24 0C10.745 0 0 10.745 0 24C0 42 24 58 24 58S48 42 48 24C48 10.745 37.255 0 24 0Z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="24" cy="22" r="14" fill="white"/>
      <text x="24" y="26" text-anchor="middle" font-size="11" font-weight="700" font-family="Inter, sans-serif" fill="${color}">${label}</text>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [48, 58],
    iconAnchor: [24, 58],
    popupAnchor: [0, -58],
  });
}

interface HousingMapProps {
  listings: any[];
  onClose: () => void;
}

export default function HousingMap({ listings, onClose }: HousingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Pune
    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([18.5204, 73.8567], 12);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Use CartoDB Voyager tiles — clean, modern aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Add markers for each listing
    const markers: L.Marker[] = [];

    listings.forEach((h) => {
      let lat = h.latitude;
      let lng = h.longitude;

      // If no coords, attempt to guess from area name
      if (!lat || !lng) {
        const guess = guessCoords(h.area || '');
        if (guess) {
          // Add small random jitter so markers don't stack perfectly
          lat = guess[0] + (Math.random() - 0.5) * 0.008;
          lng = guess[1] + (Math.random() - 0.5) * 0.008;
        }
      }

      if (!lat || !lng) return;

      const icon = createMarkerIcon(h.rent || 0, h.isWomenFriendly);

      const amenitiesHtml = h.amenities?.slice(0, 4).map((a: string) =>
        `<span style="display:inline-block;font-size:10px;padding:2px 8px;border-radius:10px;background:#f1f5f9;color:#475569;font-weight:500;margin-right:4px;margin-bottom:2px;">${a}</span>`
      ).join('') || '';

      const img = h.images?.[0]
        ? `<img src="${h.images[0]}" style="width:100%;height:110px;object-fit:cover;border-radius:10px;margin-bottom:8px;" onerror="this.style.display='none'" />`
        : '';

      const badgeHtml = h.isVerified
        ? '<span style="display:inline-block;font-size:9px;padding:2px 8px;border-radius:6px;background:#6366f1;color:#fff;font-weight:700;letter-spacing:0.04em;margin-right:4px;">VERIFIED</span>'
        : '';

      const womenBadge = h.isWomenFriendly
        ? '<span style="display:inline-block;font-size:9px;padding:2px 8px;border-radius:6px;background:#10b981;color:#fff;font-weight:700;letter-spacing:0.04em;">WOMEN SAFE</span>'
        : '';

      const popup = L.popup({
        maxWidth: 260,
        minWidth: 240,
        className: 'housing-map-popup',
      }).setContent(`
        <div style="font-family:Inter,sans-serif;">
          ${img}
          <div style="margin-bottom:6px;">${badgeHtml}${womenBadge}</div>
          <h3 style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 4px 0;line-height:1.3;">${h.title}</h3>
          <div style="display:flex;align-items:center;gap:4px;font-size:12px;color:#64748b;margin-bottom:6px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${h.area || 'Pune'}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:18px;font-weight:800;color:#6366f1;">₹${(h.rent || 0).toLocaleString()}</span>
            <span style="font-size:11px;color:#94a3b8;">/month</span>
          </div>
          ${amenitiesHtml ? `<div style="margin-bottom:8px;">${amenitiesHtml}</div>` : ''}
          <a href="/housing/${h.id}" style="
            display:block;text-align:center;padding:8px 16px;border-radius:10px;
            background:#6366f1;color:#fff;text-decoration:none;font-size:12px;
            font-weight:600;letter-spacing:0.02em;transition:background 0.2s;
          ">View Details</a>
        </div>
      `);

      const marker = L.marker([lat, lng], { icon }).addTo(map).bindPopup(popup);
      markers.push(marker);
    });

    // Fit bounds to show all markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.15));
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [listings]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#000',
      animation: 'fadeIn 0.3s ease',
    }}>
      {/* Top Bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          padding: '10px 18px', borderRadius: 14,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
            {listings.filter(h => h.latitude || h.longitude || guessCoords(h.area || '')).length} PGs on Map
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 22px', borderRadius: 14,
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
            border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            color: '#1e293b', fontFamily: 'Inter, sans-serif',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = ''}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          List View
        </button>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 90, left: 16, zIndex: 1000,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        padding: '12px 16px', borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#6366f1' }} />
          <span style={{ color: '#475569', fontWeight: 500 }}>Standard PG</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ color: '#475569', fontWeight: 500 }}>Women Safe</span>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Custom popup styles */}
      <style>{`
        .housing-map-popup .leaflet-popup-content-wrapper {
          border-radius: 14px !important;
          padding: 4px !important;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15) !important;
          border: 1px solid #e2e8f0 !important;
        }
        .housing-map-popup .leaflet-popup-content {
          margin: 10px 12px !important;
          font-size: 13px !important;
        }
        .housing-map-popup .leaflet-popup-tip {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        .leaflet-control-zoom a {
          border-radius: 10px !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 16px !important;
          background: rgba(255,255,255,0.95) !important;
          backdrop-filter: blur(8px) !important;
          border: 1px solid #e2e8f0 !important;
          color: #334155 !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: none !important;
        }
        .leaflet-control-zoom-in { border-radius: 10px 10px 0 0 !important; }
        .leaflet-control-zoom-out { border-radius: 0 0 10px 10px !important; margin-top: 2px !important; }
      `}</style>
    </div>
  );
}
