import React, { useState } from 'react';
import { Navigation, MapPin, Compass, ExternalLink, X, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ProcurementRouteMap({ 
  centreName = 'Government Procurement Centre - Main DPC', 
  centreLocation = 'Thanjavur, Tamil Nadu', 
  currentToken = '#101',
  yourToken = '#120',
  distanceKm = '4.2',
  operatingStatus = 'Operational'
}) {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [geoState, setGeoState] = useState({
    loading: false,
    granted: false,
    error: null,
    coords: null,
    calculatedDistance: null,
  });

  // Default procurement centre coordinates (Thanjavur Main DPC)
  const centreCoords = {
    lat: 10.7870,
    lng: 79.1378,
    name: centreName,
    address: centreLocation,
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setGeoState(prev => ({ ...prev, error: 'Geolocation not supported by your browser.' }));
      return;
    }

    setGeoState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        
        // Haversine formula calculation
        const R = 6371;
        const dLat = (centreCoords.lat - uLat) * (Math.PI / 180);
        const dLng = (centreCoords.lng - uLng) * (Math.PI / 180);
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(uLat * (Math.PI / 180)) * Math.cos(centreCoords.lat * (Math.PI / 180)) * 
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const dist = (R * c).toFixed(1);

        setGeoState({
          loading: false,
          granted: true,
          error: null,
          coords: { lat: uLat, lng: uLng },
          calculatedDistance: dist,
        });
      },
      (err) => {
        setGeoState({
          loading: false,
          granted: false,
          error: 'Location access denied. Using assigned procurement route.',
          coords: null,
          calculatedDistance: null,
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleOpenModal = () => {
    setShowModal(true);
    if (!geoState.granted && !geoState.loading) {
      handleFetchLocation();
    }
  };

  const openGoogleMapsDirections = () => {
    let url = `https://www.google.com/maps/dir/?api=1&destination=${centreCoords.lat},${centreCoords.lng}`;
    if (geoState.coords) {
      url += `&origin=${geoState.coords.lat},${geoState.coords.lng}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const displayDistance = geoState.calculatedDistance || distanceKm;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-2xs space-y-4">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#16A34A]" />
          <h2 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
            My Procurement Centre
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          {operatingStatus}
        </span>
      </div>

      {/* Centre Sub-header */}
      <div>
        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
          {centreName}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
          <MapPin className="w-3.5 h-3.5 text-[#16A34A] flex-shrink-0" />
          {centreLocation}
        </p>
      </div>

      {/* Content Grid: 3 Metric Cards Left + Map Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch pt-1">
        
        {/* LEFT COLUMN: 3 Metric Cards (~5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-3 lg:grid-cols-1 gap-3 items-center">
          
          {/* Card 1: Current Token */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs text-center flex flex-col justify-center min-h-[90px]">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Current Token</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block mt-1 font-mono tracking-tight">
              {currentToken}
            </span>
          </div>

          {/* Card 2: Your Token */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs text-center flex flex-col justify-center min-h-[90px]">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Your Token</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block mt-1 font-mono tracking-tight">
              {yourToken}
            </span>
          </div>

          {/* Card 3: Distance */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs text-center flex flex-col justify-center min-h-[90px]">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Distance</span>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <Compass className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {displayDistance} km
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Real Map Area (~7 cols) */}
        <div className="lg:col-span-7 relative min-h-[200px] sm:min-h-[220px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xs bg-[#EBF4EC] dark:bg-slate-900 flex flex-col justify-between p-4">
          
          {/* Map Vector Graphic Layer (roads, water bodies, greenery) */}
          <svg className="absolute inset-0 w-full h-full object-cover opacity-60 dark:opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#E3F0E6"/>
            {/* Water path */}
            <path d="M 0 160 Q 150 180 300 140 T 600 170" fill="none" stroke="#B8E1F2" strokeWidth="18" />
            {/* Secondary roads */}
            <path d="M 50 0 L 120 220 M 200 0 L 250 220 M 450 0 L 400 220" stroke="#FFFFFF" strokeWidth="4" />
            {/* Primary Highway Blue Route Line */}
            <path d="M 40 50 C 120 90 200 150 380 150 L 480 150" fill="none" stroke="#2563EB" strokeWidth="6" strokeDasharray="8,4" className="animate-pulse" />
          </svg>

          {/* Map Overlay Markers */}
          <div className="relative z-10 flex items-center justify-between px-2 pt-2">
            
            {/* Farmer Location Pin */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-md">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 animate-bounce" />
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-white">Farmer Location</span>
            </div>

            {/* Procurement Centre Pin */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-md">
              <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[140px] sm:max-w-none">
                {centreName}
              </span>
            </div>

          </div>

          {/* Center Distance Badge along route */}
          <div className="relative z-10 flex justify-center my-auto">
            <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-extrabold shadow-sm">
              {displayDistance} km
            </span>
          </div>

          {/* Bottom Floating View Route Action Button */}
          <div className="relative z-10 flex justify-end">
            <button
              onClick={handleOpenModal}
              className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 inline-flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Navigation className="w-4 h-4" />
              <span>View Route →</span>
            </button>
          </div>

        </div>

      </div>

      {/* ROUTE NAVIGATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-[#16A34A] flex items-center justify-center">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Procurement Centre Route
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {centreCoords.name} • {centreCoords.address}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Geolocation Status Alert */}
            {geoState.loading && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>Acquiring GPS location...</span>
              </div>
            )}

            {geoState.granted && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                <span>Location detected! Distance to centre: <strong>{displayDistance} km</strong></span>
              </div>
            )}

            {geoState.error && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{geoState.error}</span>
              </div>
            )}

            {/* Interactive Map Visual */}
            <div className="relative w-full h-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="bg-slate-800/90 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>GPS Route ({displayDistance} km)</span>
                </div>
                <div className="bg-[#16A34A] text-white text-xs font-black px-3 py-1.5 rounded-full">
                  ~12-15 Mins Trip
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between px-8 py-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
                    <MapPin className="w-5 h-5 animate-bounce" />
                  </div>
                  <span className="mt-2 text-xs font-bold text-white bg-slate-800/90 px-2 py-0.5 rounded">Farmer Location</span>
                </div>

                <div className="flex-1 px-4 flex flex-col items-center">
                  <div className="w-full flex items-center relative">
                    <div className="w-full h-1.5 bg-emerald-500/40 rounded-full" />
                    <div className="absolute inset-0 border-t-2 border-dashed border-emerald-400 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300 mt-1">NH-83 Main Highway</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="mt-2 text-xs font-bold text-white bg-slate-800/90 px-2 py-0.5 rounded truncate max-w-[120px]">{centreName}</span>
                </div>
              </div>

              <div className="relative z-10 text-[11px] text-slate-300 bg-slate-800/90 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between">
                <span>Destination: <strong>{centreName}</strong></span>
                <span className="text-emerald-400 font-bold">Clear Traffic & Smooth Access</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={handleFetchLocation}
                disabled={geoState.loading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Compass className="w-4 h-4 text-[#16A34A]" />
                <span>{geoState.loading ? 'Updating GPS...' : 'Refresh Location'}</span>
              </button>

              <button
                onClick={openGoogleMapsDirections}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors"
              >
                <span>Open in Maps / Turn-by-Turn Navigation</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
