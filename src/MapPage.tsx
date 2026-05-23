import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Search, X, Calendar, Star, Menu } from 'lucide-react';
import { supabase, Doctor } from '../lib/supabase';

declare global {
  interface Window {
    L: typeof import('leaflet');
  }
}

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const focusDoctorId = searchParams.get('doctor');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [query, setQuery] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<ReturnType<typeof window.L.map> | null>(null);
  const markersRef = useRef<Record<string, ReturnType<typeof window.L.marker>>>({});

  useEffect(() => {
    supabase.from('doctors').select('*').eq('is_active', true).then(({ data }) => {
      setDoctors(data || []);
    });
  }, []);

  const loadLeaflet = useCallback(() => {
    if (!mapRef.current || mapReady) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, [mapReady]);

  useEffect(() => {
    loadLeaflet();
  }, [loadLeaflet]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || leafletMapRef.current) return;

    const L = window.L;
    const map = L.map(mapRef.current).setView([30.5085, 47.7835], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    leafletMapRef.current = map;

    // Invalidate size after sidebar animation
    setTimeout(() => map.invalidateSize(), 300);
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady || !leafletMapRef.current || doctors.length === 0) return;
    const L = window.L;
    const map = leafletMapRef.current;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    doctors.forEach((doc) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width: 36px; height: 36px; background: linear-gradient(135deg, #2563EB, #0891B2);
          border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
          border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        ">
          <div style="transform: rotate(45deg); color: white; font-size: 14px;">+</div>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([doc.latitude, doc.longitude], { icon })
        .addTo(map)
        .on('click', () => setSelected(doc));

      markersRef.current[doc.id] = marker;
    });

    if (focusDoctorId) {
      const doc = doctors.find((d) => d.id === focusDoctorId);
      if (doc) {
        map.setView([doc.latitude, doc.longitude], 15);
        setSelected(doc);
      }
    }
  }, [mapReady, doctors, focusDoctorId]);

  // Invalidate map size when sidebar toggles
  useEffect(() => {
    if (leafletMapRef.current) {
      setTimeout(() => leafletMapRef.current?.invalidateSize(), 300);
    }
  }, [sidebarOpen]);

  const focusDoctor = (doc: Doctor) => {
    setSelected(doc);
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([doc.latitude, doc.longitude], 15);
    }
  };

  const filtered = query
    ? doctors.filter((d) =>
        d.full_name.toLowerCase().includes(query.toLowerCase()) ||
        d.specialty.toLowerCase().includes(query.toLowerCase())
      )
    : doctors;

  return (
    <div className="h-screen pt-16 flex flex-col">
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden absolute top-3 left-3 z-20 bg-white rounded-xl shadow-lg p-2.5 border border-gray-100"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 absolute md:relative z-10 w-80 bg-white border-r border-gray-100 flex flex-col shadow-lg md:shadow-sm transition-transform duration-300 h-full`}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              Doctors Near You
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search doctors..."
                className="input-field pl-9 pr-8"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {filtered.map((doc) => (
              <button
                key={doc.id}
                onClick={() => { focusDoctor(doc); if (window.innerWidth < 768) setSidebarOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  selected?.id === doc.id ? 'bg-primary-50 border-r-2 border-primary-600' : ''
                }`}
              >
                <img
                  src={doc.avatar_url}
                  alt={doc.full_name}
                  className="w-10 h-10 rounded-xl object-cover object-top shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{doc.full_name}</p>
                  <p className="text-xs text-primary-600 truncate">{doc.specialty}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-gray-500">{doc.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-300 ml-1">&middot;</span>
                    <MapPin className="w-3 h-3 text-gray-400 ml-1" />
                    <span className="text-xs text-gray-400 truncate">{doc.location.split(',')[0]}</span>
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No doctors found</p>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />

          {/* Selected doctor popup */}
          {selected && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-modal border border-gray-100 p-4 z-[1000] animate-scale-in">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={selected.avatar_url}
                  alt={selected.full_name}
                  className="w-14 h-14 rounded-xl object-cover object-top"
                  loading="lazy"
                />
                <div>
                  <p className="font-bold text-gray-900 text-sm">{selected.full_name}</p>
                  <p className="text-xs text-primary-600 font-medium">{selected.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-gray-700">{selected.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({selected.review_count} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {selected.location}
              </div>
              <Link
                to={`/book/${selected.id}`}
                className="btn-primary flex items-center justify-center gap-2 w-full py-2.5 text-sm"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </Link>
            </div>
          )}

          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
