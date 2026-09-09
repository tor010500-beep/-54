import React from 'react';
import { MapPin, ArrowRight, Activity, Building2 } from 'lucide-react';
import { District } from '../types/index.ts';
import { CardTilt } from './CardTilt.tsx';

interface DistrictsSectionProps {
  districts: District[];
  onSelectDistrict: (districtName: string) => void;
  id?: string;
}

export const DistrictsSection: React.FC<DistrictsSectionProps> = ({
  districts,
  onSelectDistrict,
  id = 'districts'
}) => {
  return (
    <section id={id} className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span>10 административных районов</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            СПОРТ ВО ВСЕХ РАЙОНАХ
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            В каждом районе Новосибирска работают сертифицированные тренеры и инструкторы. Выберите ваш район, чтобы сразу увидеть ближайшие тренировки.
          </p>
        </div>

        {/* 10 Districts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {districts.map((district, idx) => (
            <CardTilt
              key={district.id}
              id={`district-card-${district.slug}`}
              onClick={() => onSelectDistrict(district.name)}
              className="h-full"
            >
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col h-full hover:border-sky-400 transition-colors group">
                {/* Photo banner */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <img
                    src={district.photo}
                    alt={district.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                  {/* Activity Count Badge */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-extrabold text-xs text-slate-900">{district.schedulesCount} занятий</span>
                  </div>

                  {/* District Name on Image */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="text-xs text-sky-300 font-semibold uppercase tracking-wider">Район</div>
                    <h3 className="text-xl font-black text-white leading-tight">
                      {district.name}
                    </h3>
                  </div>
                </div>

                {/* Description & Venues */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {district.description}
                  </p>

                  {/* Key Venues list */}
                  <div className="space-y-1 pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <Building2 className="w-3 h-3" />
                      <span>Ключевые локации:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {district.keyVenues.slice(0, 2).map((venue, vIdx) => (
                        <span
                          key={vIdx}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 truncate max-w-[170px]"
                        >
                          {venue}
                        </span>
                      ))}
                      {district.keyVenues.length > 2 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-200 text-[10px] font-bold text-slate-600">
                          +{district.keyVenues.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDistrict(district.name);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm group-hover:shadow cursor-pointer"
                    >
                      <span>Смотреть расписание</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </CardTilt>
          ))}
        </div>
      </div>
    </section>
  );
};
