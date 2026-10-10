import React, { useState, useEffect, useMemo } from 'react';
import { 
  Navigation, MapPin, Compass, ExternalLink, X, 
  CheckCircle, AlertCircle, Building2, Loader2, 
  RefreshCw, Sparkles, ChevronDown, Check, Route, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getProcurementCentres } from '../../services/bookingService';

// Comprehensive Regional Government Procurement Centres Dataset
const REGIONAL_CENTRES = [
  // Villupuram, Puducherry & Northern Tamil Nadu
  {
    id: 'dpc-vanur-01',
    name: 'Vanur Government Direct Procurement Centre (DPC)',
    location: 'Vanur, Tamil Nadu (Near Puducherry Border)',
    district: 'Villupuram',
    state: 'Tamil Nadu',
    lat: 11.9965,
    lng: 79.7212,
    currentToken: '#104',
    yourToken: '#109',
    operatingStatus: 'Operational',
    capacityPerSlot: 15,
    openHours: '08:00 AM - 05:30 PM'
  },
  {
    id: 'dpc-pondy-02',
    name: 'Puducherry Central Agro Procurement Hub (APMC)',
    location: 'Thattanchavady, Puducherry',
    district: 'Puducherry',
    state: 'Puducherry',
    lat: 11.9488,
    lng: 79.8055,
    currentToken: '#112',
    yourToken: '#125',
    operatingStatus: 'Operational',
    capacityPerSlot: 12,
    openHours: '08:30 AM - 05:00 PM'
  },
  {
    id: 'dpc-tindivanam-03',
    name: 'Tindivanam Regulated Market & Paddy DPC',
    location: 'Tindivanam, Tamil Nadu',
    district: 'Villupuram',
    state: 'Tamil Nadu',
    lat: 12.2312,
    lng: 79.6521,
    currentToken: '#098',
    yourToken: '#115',
    operatingStatus: 'Operational',
    capacityPerSlot: 10,
    openHours: '09:00 AM - 06:00 PM'
  },
  {
    id: 'dpc-vpm-04',
    name: 'Villupuram Main Direct Grain Procurement Centre',
    location: 'Villupuram Town, Tamil Nadu',
    district: 'Villupuram',
    state: 'Tamil Nadu',
    lat: 11.9398,
    lng: 79.4977,
    currentToken: '#120',
    yourToken: '#135',
    operatingStatus: 'Operational',
    capacityPerSlot: 14,
    openHours: '08:30 AM - 05:30 PM'
  },
  {
    id: 'dpc-cuddalore-05',
    name: 'Cuddalore Port Grain & Dairy Hub',
    location: 'Cuddalore, Tamil Nadu',
    district: 'Cuddalore',
    state: 'Tamil Nadu',
    lat: 11.7480,
    lng: 79.7714,
    currentToken: '#088',
    yourToken: '#099',
    operatingStatus: 'Operational',
    capacityPerSlot: 10,
    openHours: '08:00 AM - 05:00 PM'
  },
  // Delta Region & Central Tamil Nadu
  {
    id: 'dpc-thanjavur-main',
    name: 'Thanjavur Government Main DPC',
    location: 'Old Bus Stand Road, Thanjavur, Tamil Nadu',
    district: 'Thanjavur',
    state: 'Tamil Nadu',
    lat: 10.7870,
    lng: 79.1378,
    currentToken: '#101',
    yourToken: '#120',
    operatingStatus: 'Operational',
    capacityPerSlot: 15,
    openHours: '08:00 AM - 05:30 PM'
  },
  {
    id: 'dpc-thiruvaiyaru-06',
    name: 'Thiruvaiyaru Paddy Procurement Hub',
    location: 'Thiruvaiyaru, Thanjavur, Tamil Nadu',
    district: 'Thanjavur',
    state: 'Tamil Nadu',
    lat: 10.8804,
    lng: 79.1039,
    currentToken: '#076',
    yourToken: '#089',
    operatingStatus: 'Operational',
    capacityPerSlot: 8,
    openHours: '08:30 AM - 05:00 PM'
  },
  {
    id: 'dpc-kumbakonam-07',
    name: 'Kumbakonam Grain Storage & DPC',
    location: 'Kumbakonam, Tamil Nadu',
    district: 'Thanjavur',
    state: 'Tamil Nadu',
    lat: 10.9602,
    lng: 79.3845,
    currentToken: '#110',
    yourToken: '#130',
    operatingStatus: 'Operational',
    capacityPerSlot: 12,
    openHours: '08:30 AM - 05:30 PM'
  },
  {
    id: 'dpc-trichy-08',
    name: 'Tiruchirappalli APMC Procurement Hub',
    location: 'Trichy Central, Tamil Nadu',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    lat: 10.7905,
    lng: 78.7047,
    currentToken: '#145',
    yourToken: '#160',
    operatingStatus: 'Operational',
    capacityPerSlot: 16,
    openHours: '08:00 AM - 06:00 PM'
  },
  {
    id: 'dpc-madurai-09',
    name: 'Madurai Agro Direct Procurement Centre',
    location: 'Madurai, Tamil Nadu',
    district: 'Madurai',
    state: 'Tamil Nadu',
    lat: 9.9252,
    lng: 78.1198,
    currentToken: '#092',
    yourToken: '#105',
    operatingStatus: 'Operational',
    capacityPerSlot: 12,
    openHours: '08:30 AM - 05:00 PM'
  },
  {
    id: 'dpc-salem-10',
    name: 'Salem Agricultural Cooperative Centre',
    location: 'Salem, Tamil Nadu',
    district: 'Salem',
    state: 'Tamil Nadu',
    lat: 11.6643,
    lng: 78.1460,
    currentToken: '#067',
    yourToken: '#080',
    operatingStatus: 'Operational',
    capacityPerSlot: 10,
    openHours: '09:00 AM - 05:00 PM'
  }
];

// Accurate Haversine Distance Formula in Kilometers
function calcDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export default function ProcurementRouteMap({
  centreName: defaultName,
  centreLocation: defaultLocation,
  currentToken: defaultCurrentToken = '#101',
  yourToken: defaultYourToken = '#120',
  distanceKm: defaultDistance = '4.2',
  operatingStatus: defaultStatus = 'Operational',
}) {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [mapType, setMapType] = useState('m'); // 'm' = Roadmap, 'k' = Satellite
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [centresList, setCentresList] = useState(REGIONAL_CENTRES);
  const [selectedCentreId, setSelectedCentreId] = useState(null);

  // 1. Fetch any extra centres from Supabase database and merge
  useEffect(() => {
    async function loadCentres() {
      try {
        const dbCentres = await getProcurementCentres();
        if (dbCentres && dbCentres.length > 0) {
          // Merge Supabase centres with our regional dataset
          const merged = [...REGIONAL_CENTRES];
          dbCentres.forEach(dbc => {
            if (!merged.some(m => m.id === dbc.id || m.name === dbc.name)) {
              merged.push({
                id: dbc.id || `dbc-${Math.random()}`,
                name: dbc.name,
                location: dbc.location || `${dbc.district || ''}, ${dbc.state || ''}`,
                district: dbc.district || 'Tamil Nadu',
                state: dbc.state || 'Tamil Nadu',
                lat: dbc.latitude || 11.9965,
                lng: dbc.longitude || 79.7212,
                currentToken: '#105',
                yourToken: '#120',
                operatingStatus: dbc.operating_status || 'Operational',
                capacityPerSlot: dbc.capacity_per_slot || 10,
                openHours: '08:00 AM - 05:30 PM'
              });
            }
          });
          setCentresList(merged);
        }
      } catch (err) {
        console.warn('Using regional procurement centres catalog:', err);
      }
    }
    loadCentres();
  }, []);

  // 2. Real-Time Device Geolocation Detection
  const detectLiveLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserCoords({ lat, lng });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setGeoError('Location permission denied. You can still select your nearest centre from the dropdown.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  // Auto-detect location on initial load
  useEffect(() => {
    detectLiveLocation();
  }, []);

  // 3. Dynamic Distance Calculation & Sorting by Proximity
  const sortedCentres = useMemo(() => {
    if (!userCoords) {
      return centresList.map(c => ({
        ...c,
        distanceKm: defaultDistance,
        isNearest: false,
      }));
    }

    const calculated = centresList.map(c => {
      const dist = calcDistanceKm(userCoords.lat, userCoords.lng, c.lat, c.lng);
      return {
        ...c,
        distanceKm: dist || '10.0',
        numericDist: dist ? parseFloat(dist) : 9999,
      };
    });

    calculated.sort((a, b) => a.numericDist - b.numericDist);
    if (calculated.length > 0) {
      calculated[0].isNearest = true;
    }
    return calculated;
  }, [userCoords, centresList, defaultDistance]);

  // 4. Auto-select Nearest Centre as default when user coordinates are found
  useEffect(() => {
    if (sortedCentres.length > 0) {
      // If no centre selected yet, pick the nearest
      if (!selectedCentreId || !sortedCentres.some(c => c.id === selectedCentreId)) {
        setSelectedCentreId(sortedCentres[0].id);
      }
    }
  }, [sortedCentres, selectedCentreId]);

  // Current Active Selected Centre
  const activeCentre = useMemo(() => {
    return sortedCentres.find(c => c.id === selectedCentreId) || sortedCentres[0] || REGIONAL_CENTRES[0];
  }, [sortedCentres, selectedCentreId]);

  // 5. Dynamic Google Maps Embed URL Generator
  const buildDynamicEmbedUrl = (isFullModal = false) => {
    const zoom = isFullModal ? 15 : 13;
    if (userCoords) {
      // Live turn-by-turn route from user's live GPS coordinates to selected centre
      return `https://maps.google.com/maps?saddr=${userCoords.lat},${userCoords.lng}&daddr=${activeCentre.lat},${activeCentre.lng}&t=${mapType}&z=${zoom}&hl=en&output=embed`;
    }
    // Centre marker view
    return `https://maps.google.com/maps?q=${activeCentre.lat},${activeCentre.lng}+(${encodeURIComponent(activeCentre.name)})&t=${mapType}&z=${zoom}&hl=en&output=embed`;
  };

  // Open native Google Maps app with live driving navigation
  const openExternalMaps = () => {
    let url = `https://www.google.com/maps/dir/?api=1&destination=${activeCentre.lat},${activeCentre.lng}&destination_place_id=${encodeURIComponent(activeCentre.name)}&travelmode=driving`;
    if (userCoords) {
      url += `&origin=${userCoords.lat},${userCoords.lng}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleViewRoute = () => {
    setShowModal(true);
    if (!userCoords && !isLocating) {
      detectLiveLocation();
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-sm space-y-4 transition-all">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight leading-tight">
                My Procurement Centre
              </h2>
              {activeCentre.isNearest && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  NEAREST
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Live GPS route & smart proximity suggestion
            </p>
          </div>
        </div>

        {/* Status Badge + Location Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={detectLiveLocation}
            disabled={isLocating}
            className="px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh your live device GPS location"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'GPS Refresh'}</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {activeCentre.operatingStatus || 'Operational'}
          </span>
        </div>
      </div>

      {/* Dynamic Centre Selector Dropdown with Proximity Badges */}
      <div className="bg-slate-50/70 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <label className="block text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1">
            Selected Centre (Closest by Live Distance)
          </label>
          <div className="relative">
            <select
              value={selectedCentreId || ''}
              onChange={(e) => setSelectedCentreId(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-black focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer shadow-2xs"
            >
              {sortedCentres.map((c, idx) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-1">
                  {idx === 0 ? '⭐ [Nearest] ' : '🌾 '}
                  {c.name} — {c.distanceKm} km ({c.district})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Map Type toggle (Map / Satellite) */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-end md:self-auto flex-shrink-0">
          <button
            onClick={() => setMapType('m')}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
              mapType === 'm'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Map View
          </button>
          <button
            onClick={() => setMapType('k')}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
              mapType === 'k'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Location Details Sub-header */}
      <div className="flex items-center justify-between text-xs">
        <p className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5 truncate">
          <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="truncate">{activeCentre.location}</span>
        </p>
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex-shrink-0">
          🕒 {activeCentre.openHours}
        </span>
      </div>

      {/* Content Grid: 3 Metric Cards + Real-Time Dynamic Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch pt-1">

        {/* LEFT: 3 Metric Cards */}
        <div className="lg:col-span-5 grid grid-cols-3 lg:grid-cols-1 gap-3">

          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center flex flex-col justify-center min-h-[90px] relative overflow-hidden group">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Current Token</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block mt-1 font-mono tracking-tight">
              {activeCentre.currentToken || defaultCurrentToken}
            </span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 p-4 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/60 shadow-sm text-center flex flex-col justify-center min-h-[90px] relative overflow-hidden group">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">Your Token</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 block mt-1 font-mono tracking-tight">
              {activeCentre.yourToken || defaultYourToken}
            </span>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center flex flex-col justify-center min-h-[90px]">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Live Distance</span>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeCentre.distanceKm} km
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Real Dynamic Google Map Embed */}
        <div className="lg:col-span-7 relative min-h-[250px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md bg-slate-900 group">

          {/* Loading Indicator */}
          {isLocating && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/75 backdrop-blur-xs gap-2 text-white">
              <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
              <span className="text-xs font-black">Calculating nearest procurement centre...</span>
            </div>
          )}

          {/* Real Google Maps iframe pointing from user's live GPS to nearest centre */}
          <iframe
            key={`${activeCentre.id}-${mapType}-${userCoords ? `${userCoords.lat},${userCoords.lng}` : 'no-geo'}`}
            title="Dynamic Procurement Centre Route"
            src={buildDynamicEmbedUrl(false)}
            className="w-full h-full min-h-[250px] border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Floated Action Button with Theme Palette */}
          <div className="absolute bottom-3 right-3 z-10">
            <button
              onClick={handleViewRoute}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/40 inline-flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>View Route →</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── FULL-SCREEN ROUTE MODAL ─────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden animate-slide-up" style={{ maxHeight: '92vh' }}>

            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 flex-shrink-0">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {activeCentre.name}
                    {activeCentre.isNearest && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        Nearest DPC
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    {activeCentre.location} · Distance: <strong>{activeCentre.distanceKm} km</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Live Status Banner */}
            <div className="px-4 sm:px-5 pt-3 flex-shrink-0 space-y-2">
              {userCoords ? (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Live GPS route connected directly to <strong>{activeCentre.name}</strong></span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-bold">
                    {activeCentre.distanceKm} km
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Click "GPS Refresh" to calculate precise live turn-by-turn driving route from your current location.</span>
                </div>
              )}
            </div>

            {/* Full-size Real Google Maps Embed */}
            <div className="flex-1 min-h-0 mx-4 sm:mx-5 my-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-slate-900">
              <iframe
                key={`modal-${activeCentre.id}-${mapType}-${userCoords ? `${userCoords.lat},${userCoords.lng}` : 'no-geo'}`}
                title="Full Google Maps Dynamic Route"
                src={buildDynamicEmbedUrl(true)}
                className="w-full h-full border-0 min-h-[360px]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Modal Action Buttons with Theme Green Palette */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Target Hub: <strong className="text-slate-800 dark:text-slate-200">{activeCentre.district}, {activeCentre.state}</strong>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={detectLiveLocation}
                  disabled={isLocating}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Locating...' : 'Refresh GPS'}</span>
                </button>

                <button
                  onClick={openExternalMaps}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Start Navigation in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
