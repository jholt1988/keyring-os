'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PropertyMapItem {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  totalUnits?: number;
  vacantCount?: number;
  expiringCount?: number;
  repairRiskCount?: number;
  overdueAmount?: number;
  signals?: { type: string; message: string }[];
}

interface PropertyMapProps {
  properties: PropertyMapItem[];
  className?: string;
}

function hashToCoord(str: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return min + (Math.abs(hash) % 10000) / 10000 * (max - min);
}

function getPropertyCoords(p: PropertyMapItem): [number, number] {
  if (p.latitude != null && p.longitude != null) return [p.latitude, p.longitude];
  const seed = p.address || p.name || p.id;
  return [hashToCoord(seed + '_lat', 33.5, 40.5), hashToCoord(seed + '_lng', -118, -74)];
}

function createMarkerIcon(L: typeof Leaflet, hasRisk: boolean) {
  const color = hasRisk ? '#F43F5E' : '#3B82F6';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}" stroke="#0F1B31" stroke-width="1.5"/>
    <circle cx="14" cy="13" r="5" fill="#F8FAFC"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'property-marker',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

function buildTooltipHtml(p: PropertyMapItem): string {
  const riskDot = (p.repairRiskCount ?? 0) > 0 || (p.overdueAmount ?? 0) > 0
    ? '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#F43F5E;margin-right:6px"></span>'
    : '';
  return `
    <div style="font-family:var(--font-space,system-ui);min-width:180px">
      <div style="font-weight:700;font-size:13px;color:#F8FAFC;margin-bottom:4px">${riskDot}${p.name}</div>
      ${p.address ? `<div style="font-size:11px;color:#94A3B8;margin-bottom:6px">${p.address}</div>` : ''}
      <div style="display:flex;gap:10px;font-size:11px;color:#CBD5E1">
        <span><b>${p.totalUnits ?? 0}</b> Units</span>
        <span><b style="color:#F59E0B">${p.vacantCount ?? 0}</b> Vacant</span>
        <span><b style="color:#38BDF8">${p.expiringCount ?? 0}</b> Expiring</span>
      </div>
      ${(p.repairRiskCount ?? 0) > 0 ? `<div style="font-size:11px;color:#F43F5E;margin-top:4px">${p.repairRiskCount} risk flag${p.repairRiskCount === 1 ? '' : 's'}</div>` : ''}
      ${(p.overdueAmount ?? 0) > 0 ? `<div style="font-size:11px;color:#F43F5E;margin-top:2px">$${p.overdueAmount!.toLocaleString()} overdue</div>` : ''}
    </div>
  `;
}

function buildPopupHtml(p: PropertyMapItem): string {
  const signals = (p.signals ?? []).slice(0, 3);
  const signalsHtml = signals.map(s => {
    const dotColor = s.type === 'CRITICAL' ? '#F43F5E' : s.type === 'WARNING' ? '#F59E0B' : '#38BDF8';
    return `<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#CBD5E1;margin-top:3px">
      <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${dotColor};flex-shrink:0"></span>
      ${s.message}
    </div>`;
  }).join('');

  return `
    <div style="font-family:var(--font-space,system-ui);min-width:220px;max-width:280px">
      <div style="font-weight:700;font-size:14px;color:#F8FAFC;margin-bottom:2px">${p.name}</div>
      ${p.address ? `<div style="font-size:11px;color:#94A3B8;margin-bottom:8px">${p.address}</div>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
        <div style="background:#0F1B31;border:1px solid #1E3350;border-radius:10px;padding:6px 8px;text-align:center">
          <div style="font-size:16px;font-weight:700;color:#F8FAFC">${p.totalUnits ?? 0}</div>
          <div style="font-size:9px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Units</div>
        </div>
        <div style="background:#0F1B31;border:1px solid #1E3350;border-radius:10px;padding:6px 8px;text-align:center">
          <div style="font-size:16px;font-weight:700;color:#F59E0B">${p.vacantCount ?? 0}</div>
          <div style="font-size:9px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Vacant</div>
        </div>
        <div style="background:#0F1B31;border:1px solid #1E3350;border-radius:10px;padding:6px 8px;text-align:center">
          <div style="font-size:16px;font-weight:700;color:#38BDF8">${p.expiringCount ?? 0}</div>
          <div style="font-size:9px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Expiring</div>
        </div>
        <div style="background:#0F1B31;border:1px solid #1E3350;border-radius:10px;padding:6px 8px;text-align:center">
          <div style="font-size:16px;font-weight:700;color:#F43F5E">${p.repairRiskCount ?? 0}</div>
          <div style="font-size:9px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Risk</div>
        </div>
      </div>
      ${signalsHtml ? `<div style="margin-bottom:8px">${signalsHtml}</div>` : ''}
      <div style="text-align:center;padding-top:4px;border-top:1px solid #1E3350">
        <span class="property-map-view-link" data-property-id="${p.id}" style="font-size:12px;font-weight:600;color:#3B82F6;cursor:pointer">View Property &rarr;</span>
      </div>
    </div>
  `;
}

export function PropertyMap({ properties, className }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Leaflet.Map | null>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const coords = useMemo(
    () => properties.map(p => ({ ...p, coords: getPropertyCoords(p) })),
    [properties],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current || properties.length === 0) return;

    const mapElement = mapRef.current;
    let cancelled = false;
    let activeMap: Leaflet.Map | null = null;
    let popupClickHandler: ((e: MouseEvent) => void) | null = null;

    async function initializeMap() {
      const L = await import('leaflet');
      if (cancelled) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapElement, {
      zoomControl: true,
      attributionControl: false,
      });
      activeMap = map;
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      }).addTo(map);

      const markers: Leaflet.Marker[] = [];

      coords.forEach(p => {
        const hasRisk = (p.repairRiskCount ?? 0) > 0 || (p.overdueAmount ?? 0) > 0;
        const marker = L.marker(p.coords, { icon: createMarkerIcon(L, hasRisk) }).addTo(map);

      marker.bindTooltip(buildTooltipHtml(p), {
        direction: 'top',
        offset: [0, -38],
        className: 'property-map-tooltip',
        opacity: 1,
      });

      marker.bindPopup(buildPopupHtml(p), {
        className: 'property-map-popup',
        maxWidth: 300,
        closeButton: true,
      });

        markers.push(marker);
      });

      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords.map(p => p.coords));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }

      const handlePopupClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('.property-map-view-link') as HTMLElement | null;
      if (link?.dataset.propertyId) {
        router.push(`/properties/${link.dataset.propertyId}`);
      }
      };
      popupClickHandler = handlePopupClick;
      mapElement.addEventListener('click', handlePopupClick);

      activeMap = map;
    }

    initializeMap();

    return () => {
      cancelled = true;
      if (popupClickHandler) {
        mapElement.removeEventListener('click', popupClickHandler);
      }
      activeMap?.remove();
      mapInstanceRef.current = null;
    };
  }, [mounted, coords, router, properties.length]);

  if (!mounted) {
    return (
      <div className={className}>
        <div className="flex h-[500px] items-center justify-center rounded-[24px] border border-[#1E3350] bg-[#13233C]">
          <p className="text-sm text-[#94A3B8]">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <style>{`
        .property-marker { background: none !important; border: none !important; }
        .property-map-tooltip {
          background: #13233C !important;
          border: 1px solid #1E3350 !important;
          border-radius: 14px !important;
          padding: 10px 14px !important;
          box-shadow: 0 8px 30px rgba(2,6,23,0.4) !important;
          color: #F8FAFC !important;
        }
        .property-map-tooltip::before {
          border-top-color: #1E3350 !important;
        }
        .property-map-popup .leaflet-popup-content-wrapper {
          background: #13233C !important;
          border: 1px solid #1E3350 !important;
          border-radius: 18px !important;
          box-shadow: 0 8px 30px rgba(2,6,23,0.4) !important;
          color: #F8FAFC !important;
        }
        .property-map-popup .leaflet-popup-tip {
          background: #13233C !important;
          border: 1px solid #1E3350 !important;
        }
        .property-map-popup .leaflet-popup-close-btn {
          color: #94A3B8 !important;
          font-size: 18px !important;
          top: 6px !important;
          right: 8px !important;
        }
        .property-map-popup .leaflet-popup-close-btn:hover {
          color: #F8FAFC !important;
        }
        .leaflet-control-zoom a {
          background: #13233C !important;
          border-color: #1E3350 !important;
          color: #94A3B8 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #17304E !important;
          color: #F8FAFC !important;
        }
      `}</style>
      <div
        ref={mapRef}
        className="h-[500px] w-full rounded-[24px] border border-[#1E3350] overflow-hidden"
        style={{ background: '#0B1628' }}
      />
    </div>
  );
}
