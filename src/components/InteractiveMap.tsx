import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, Search, Building2, Phone, Calendar, ArrowRight, Layers, Check } from 'lucide-react';
import { SportsVenue } from '../types/index.ts';

interface InteractiveMapProps {
  venues: SportsVenue[];
  onSelectVenueSchedule: (district: string) => void;
  id?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  venues,
  onSelectVenueSchedule,
  id = 'map'
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Все районы');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeVenue, setActiveVenue] = useState<SportsVenue | null>(venues[0] || null);

  const districts = useMemo(() => {
    const set = new Set<string>();
    venues.forEach(v => set.add(v.district));
    return ['Все районы', ...Array.from(set)];
  }, [venues]);

  const filteredVenues = useMemo(() => {
    return venues.filter(v => {
      if (selectedDistrict !== 'Все районы' && v.district !== selectedDistrict) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          v.name.toLowerCase().includes(q) ||
          v.address.toLowerCase().includes(q) ||
          v.district.toLowerCase().includes(q) ||
          v.sports.some(s => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [venues, selectedDistrict, searchQuery]);

  // Novosibirsk map coordinate bounds for plotting on SVG
  // Novosibirsk approx bounds: Lat 54.85 to 55.15, Lng 82.75 to 83.15
  const minLat = 54.82;
  const maxLat = 55.15;
  const minLng = 82.75;
  const maxLng = 83.15;

  const projectToMap = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    // Invert Y because latitude goes north (up) but SVG coordinates go down
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return { x: Math.min(Math.max(x, 5), 95), y: Math.min(Math.max(y, 5), 95) };
  };

  return (
    <section id={id} className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-400/30">
              <Navigation className="w-3.5 h-3.5" />
              <span>Карта спортивных площадок</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              СПОРТИВНЫЕ ОБЪЕКТЫ НОВОСИБИРСКА
            </h2>
            <p className="text-slate-400 mt-2 text-base max-w-xl">
              Стадионы, парковые площадки, бассейны и уличные воркаут-зоны на интерактивной карте города.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 bg-slate-800/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-700">
            <div>
              <span className="text-xl font-black text-sky-400">{venues.length}</span>
              <span className="text-xs text-slate-400 block font-medium">Объектов на карте</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-700" />
            <div>
              <span className="text-xl font-black text-lime-400">10</span>
              <span className="text-xs text-slate-400 block font-medium">Районов покрытия</span>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* District select pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            {districts.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDistrict(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedDistrict === d
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск объекта или улицы..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>

        {/* Map Layout Grid: Map Canvas + Details Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Map Interactive Visualizer */}
          <div className="lg:col-span-8 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl h-[480px] sm:h-[540px]">
            {/* Map styling header */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>г. Новосибирск • Координаты объектов</span>
            </div>

            {/* Stylized Ob River SVG Representation (Novosibirsk's defining landmark) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Ob River Flow from South-East to North-West */}
              <path
                d="M 85 100 C 70 80, 60 70, 50 50 C 40 30, 42 20, 20 0 L 28 0 C 48 20, 48 30, 58 50 C 68 70, 78 80, 93 100 Z"
                fill="#0284c7"
                fillOpacity="0.35"
              />
              {/* Novosibirsk Reservoir (Ob Sea) */}
              <ellipse cx="80" cy="92" rx="14" ry="7" fill="#0284c7" fillOpacity="0.4" />
              {/* Bridges indications */}
              <line x1="47" y1="45" x2="55" y2="48" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="1,1" />
              <line x1="44" y1="38" x2="52" y2="41" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="1,1" />
              <line x1="41" y1="32" x2="49" y2="35" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="1,1" />
            </svg>

            {/* Geographical Markers */}
            <div className="absolute inset-0 p-4">
              {filteredVenues.map(venue => {
                const lat = Array.isArray(venue.coordinates) ? venue.coordinates[0] : (venue.coordinates as any)?.lat ?? 55.03;
                const lng = Array.isArray(venue.coordinates) ? venue.coordinates[1] : (venue.coordinates as any)?.lng ?? 82.92;
                const { x, y } = projectToMap(lat, lng);
                const isSelected = activeVenue?.id === venue.id;

                return (
                  <div
                    key={venue.id}
                    onClick={() => setActiveVenue(venue)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    {/* Ripple on active */}
                    {isSelected && (
                      <span className="absolute -inset-2 rounded-full bg-sky-400/40 animate-ping" />
                    )}

                    {/* Marker Pin */}
                    <div
                      className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                        isSelected
                          ? 'w-10 h-10 bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/50 scale-110'
                          : 'w-7 h-7 bg-slate-800/90 text-sky-400 border border-slate-600 hover:scale-110 hover:bg-sky-500 hover:text-white'
                      }`}
                    >
                      <MapPin className={`${isSelected ? 'w-5 h-5' : 'w-4 h-4'}`} />
                    </div>

                    {/* Hover label */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex items-center px-2.5 py-1 rounded-lg bg-slate-900/95 border border-slate-700 text-[11px] font-bold text-white whitespace-nowrap shadow-xl z-40 pointer-events-none">
                      {venue.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend / River Note */}
            <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] text-slate-400 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-600 inline-block" />
              <span>р. Обь и Новосибирское водохранилище</span>
            </div>
          </div>

          {/* Right: Active Venue Card Details */}
          <div className="lg:col-span-4 bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700 p-6 flex flex-col justify-between shadow-xl">
            {activeVenue ? (
              <div className="space-y-4">
                {/* Photo */}
                <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900">
                  <img
                    src={activeVenue.photo}
                    alt={activeVenue.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold uppercase">
                    {activeVenue.district} район
                  </div>
                </div>

                {/* Name & Address */}
                <div>
                  <h3 className="text-xl font-black text-white leading-tight">{activeVenue.name}</h3>
                  <div className="flex items-start gap-1.5 text-xs text-slate-300 mt-2">
                    <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>{activeVenue.address}</span>
                  </div>
                </div>

                {/* Sports tags */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Виды спорта на площадке:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeVenue.sports.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-700 text-slate-200 text-xs font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                {activeVenue.features && activeVenue.features.length > 0 && (
                  <div className="pt-2 border-t border-slate-700/60">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Оснащение:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {activeVenue.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => onSelectVenueSchedule(activeVenue.district)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Смотреть занятия в этом районе</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <Building2 className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p>Выберите объект на карте</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
