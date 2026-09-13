import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Users,
  LayoutGrid,
  Table as TableIcon,
  CalendarDays,
  Columns,
  RotateCcw,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Sun,
  Moon,
  Info,
  CheckCircle2,
  X,
  Phone,
  Zap,
  Building,
  AlertTriangle
} from 'lucide-react';
import { ScheduleItem, ViewMode, FilterState, TimeOfDay, AgeGroup, ActivityFormat } from '../types/index.ts';
import { CardTilt } from './CardTilt.tsx';
import { ScheduleRegistrationModal } from './ScheduleRegistrationModal.tsx';
import { ViewAttendeesModal } from './ViewAttendeesModal.tsx';

interface ScheduleSectionProps {
  schedules: ScheduleItem[];
  selectedDistrict?: string;
  onDistrictSelect?: (districtName: string) => void;
  id?: string;
}

const ALL_DISTRICTS = [
  'Все районы',
  'Центральный',
  'Железнодорожный',
  'Заельцовский',
  'Октябрьский',
  'Дзержинский',
  'Кировский',
  'Калининский',
  'Ленинский',
  'Первомайский',
  'Советский'
];

const ALL_SPORTS = [
  'Все виды спорта',
  'Йога',
  'Волейбол',
  'Футбол',
  'Плавание',
  'Зарядка',
  'Скандинавская ходьба',
  'Баскетбол',
  'Воркаут',
  'ОФП',
  'Шахматы',
  'Настольный теннис',
  'Бег'
];

const DAYS_OF_WEEK = ['Все', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  schedules,
  selectedDistrict,
  onDistrictSelect,
  id = 'schedule'
}) => {
  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    district: selectedDistrict || 'Все районы',
    sport: 'Все виды спорта',
    date: '',
    dayOfWeek: 'Все',
    timeOfDay: 'all',
    ageGroup: 'all',
    format: 'all',
    sortBy: 'time_asc' // Default to earliest first (numeric time sorting)
  });

  // Active detail modal
  const [activeItem, setActiveItem] = useState<ScheduleItem | null>(null);
  const [enrolledSuccess, setEnrolledSuccess] = useState<string | null>(null);

  // Registration & Attendees modals
  const [registeringItem, setRegisteringItem] = useState<ScheduleItem | null>(null);
  const [viewingAttendeesItem, setViewingAttendeesItem] = useState<ScheduleItem | null>(null);

  // Sync selectedDistrict prop if changed
  React.useEffect(() => {
    if (selectedDistrict) {
      setFilters(f => ({ ...f, district: selectedDistrict }));
    }
  }, [selectedDistrict]);

  const resetFilters = () => {
    setFilters({
      search: '',
      district: 'Все районы',
      sport: 'Все виды спорта',
      date: '',
      dayOfWeek: 'Все',
      timeOfDay: 'all',
      ageGroup: 'all',
      format: 'all',
      sortBy: 'time_asc'
    });
    if (onDistrictSelect) {
      onDistrictSelect('Все районы');
    }
  };

  // Filter and sort items with STRICT time-as-time logic
  const filteredSchedules = useMemo(() => {
    return schedules
      .filter(item => {
        // District
        if (filters.district !== 'Все районы' && item.district.toLowerCase() !== filters.district.toLowerCase()) {
          return false;
        }
        // Sport
        if (filters.sport !== 'Все виды спорта' && item.sport.toLowerCase() !== filters.sport.toLowerCase()) {
          return false;
        }
        // Date
        if (filters.date && item.date !== filters.date) {
          return false;
        }
        // Day of week
        if (filters.dayOfWeek !== 'Все' && item.dayOfWeek.toUpperCase() !== filters.dayOfWeek.toUpperCase()) {
          return false;
        }
        // Format
        if (filters.format !== 'all' && item.format !== filters.format) {
          return false;
        }
        // Time of day
        if (filters.timeOfDay !== 'all') {
          const hour = parseInt(item.time.split(':')[0], 10);
          if (filters.timeOfDay === 'morning' && (hour < 6 || hour >= 12)) return false;
          if (filters.timeOfDay === 'day' && (hour < 12 || hour >= 17)) return false;
          if (filters.timeOfDay === 'evening' && (hour < 17 || hour >= 24)) return false;
        }
        // Age group
        if (filters.ageGroup !== 'all') {
          const group = (item.targetCategory || item.ageGroup).toLowerCase();
          if (filters.ageGroup === 'kids' && !(group.includes('дет') || group.includes('7-') || group.includes('все'))) return false;
          if (filters.ageGroup === 'teens' && !(group.includes('подр') || group.includes('все'))) return false;
          if (filters.ageGroup === 'adults' && !(group.includes('взрос') || group.includes('18+') || group.includes('все'))) return false;
        }
        // Search
        if (filters.search) {
          const q = filters.search.toLowerCase().trim();
          const matches =
            item.title.toLowerCase().includes(q) ||
            item.sport.toLowerCase().includes(q) ||
            item.instructor.toLowerCase().includes(q) ||
            item.location.toLowerCase().includes(q) ||
            item.address.toLowerCase().includes(q) ||
            item.district.toLowerCase().includes(q);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Precise numeric time converter: "08:30" -> 510 minutes
        const toMinutes = (timeStr: string) => {
          const parts = timeStr.split(':');
          const h = parseInt(parts[0], 10) || 0;
          const m = parseInt(parts[1], 10) || 0;
          return h * 60 + m;
        };

        if (filters.sortBy === 'time_asc') {
          return toMinutes(a.time) - toMinutes(b.time);
        }
        if (filters.sortBy === 'time_desc') {
          return toMinutes(b.time) - toMinutes(a.time);
        }
        if (filters.sortBy === 'sport') {
          return a.sport.localeCompare(b.sport, 'ru');
        }
        if (filters.sortBy === 'district') {
          return a.district.localeCompare(b.district, 'ru');
        }
        if (filters.sortBy === 'title') {
          return a.title.localeCompare(b.title, 'ru');
        }
        // Default closest: date first, then time
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return toMinutes(a.time) - toMinutes(b.time);
      });
  }, [schedules, filters]);

  const handleEnroll = (item: ScheduleItem) => {
    setEnrolledSuccess(`Вы успешно записаны на «${item.title}»! Напоминание отправлено.`);
    setTimeout(() => setEnrolledSuccess(null), 4000);
  };

  return (
    <section id={id} className="py-16 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              <span>Единый спортивный календарь города</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Спортивный календарь
            </h2>
            <p className="text-slate-600 mt-1 text-base max-w-xl">
              Найдено актуальных занятий: <span className="font-bold text-blue-600">{filteredSchedules.length}</span> из {schedules.length}
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm self-start md:self-auto overflow-x-auto max-w-full">
            <button
              id="view-mode-cards"
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>▦ КАРТОЧКИ</span>
            </button>

            <button
              id="view-mode-table"
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>☷ ТАБЛИЦА</span>
            </button>

            <button
              id="view-mode-day"
              type="button"
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Columns className="w-4 h-4" />
              <span>▣ ДЕНЬ</span>
            </button>

            <button
              id="view-mode-week"
              type="button"
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>▦ НЕДЕЛЯ</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm mb-8 space-y-4">
          {/* Row 1: Search & Primary Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <label htmlFor="filter-search" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Поиск
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="filter-search"
                  type="text"
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  placeholder="Поиск по названию, инструктору, адресу..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
                />
              </div>
            </div>

            {/* District Selector */}
            <div>
              <label htmlFor="filter-district" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Район
              </label>
              <select
                id="filter-district"
                value={filters.district}
                onChange={e => {
                  setFilters(f => ({ ...f, district: e.target.value }));
                  if (onDistrictSelect) onDistrictSelect(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-medium"
              >
                {ALL_DISTRICTS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Sport Selector */}
            <div>
              <label htmlFor="filter-sport" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Вид спорта
              </label>
              <select
                id="filter-sport"
                value={filters.sport}
                onChange={e => setFilters(f => ({ ...f, sport: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-medium"
              >
                {ALL_SPORTS.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="filter-sort" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Сортировка
              </label>
              <select
                id="filter-sort"
                value={filters.sortBy}
                onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value as any }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-medium"
              >
                <option value="time_asc">Сначала ранние (08:30 → 20:00)</option>
                <option value="time_desc">Сначала поздние (20:00 → 08:30)</option>
                <option value="closest">Ближайшие по дате</option>
                <option value="sport">По виду спорта (А-Я)</option>
                <option value="district">По району города</option>
                <option value="title">По названию занятия</option>
              </select>
            </div>
          </div>

          {/* Row 2: Secondary Quick Chips (Day of week, Time of day, Age, Format) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
            {/* Days of Week chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <span className="text-xs font-bold text-slate-500 mr-1">День:</span>
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setFilters(f => ({ ...f, dayOfWeek: day }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filters.dayOfWeek === day
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Time of Day */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">Время:</span>
              {(['all', 'morning', 'day', 'evening'] as TimeOfDay[]).map(t => {
                const labels: Record<TimeOfDay, string> = {
                  all: 'Любое',
                  morning: 'Утро (06-12)',
                  day: 'День (12-17)',
                  evening: 'Вечер (17-23)'
                };
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilters(f => ({ ...f, timeOfDay: t }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      filters.timeOfDay === t
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {labels[t]}
                  </button>
                );
              })}
            </div>

            {/* Age Group */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">Возраст:</span>
              {(['all', 'kids', 'teens', 'adults'] as AgeGroup[]).map(ag => {
                const labels: Record<AgeGroup, string> = {
                  all: 'Все',
                  kids: 'Дети',
                  teens: 'Подростки',
                  adults: 'Взрослые',
                  seniors: '55+'
                };
                return (
                  <button
                    key={ag}
                    type="button"
                    onClick={() => setFilters(f => ({ ...f, ageGroup: ag }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      filters.ageGroup === ag
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {labels[ag]}
                  </button>
                );
              })}
            </div>

            {/* Format: Indoor / Outdoor */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">Формат:</span>
              <button
                type="button"
                onClick={() => setFilters(f => ({ ...f, format: 'all' }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  filters.format === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Все
              </button>
              <button
                type="button"
                onClick={() => setFilters(f => ({ ...f, format: 'outdoor' }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  filters.format === 'outdoor' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                На улице
              </button>
              <button
                type="button"
                onClick={() => setFilters(f => ({ ...f, format: 'indoor' }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  filters.format === 'indoor' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                В помещении
              </button>
            </div>

            {/* Reset Filters */}
            <button
              id="btn-reset-filters"
              type="button"
              onClick={resetFilters}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить фильтры</span>
            </button>
          </div>
        </div>

        {/* Feedback alert after enrollment */}
        {enrolledSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-sm">{enrolledSuccess}</span>
          </div>
        )}

        {/* Empty State */}
        {filteredSchedules.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <Info className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-slate-800">Занятий по выбранным фильтрам не найдено</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              Попробуйте выбрать другой район, снять ограничения по времени или сбросить фильтры.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md hover:bg-blue-700 transition-all cursor-pointer"
            >
              Показать все занятия
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1: 3D CARDS (Primary requested view)                */}
        {/* ======================================================== */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map(item => (
              <CardTilt
                key={item.id}
                id={`card-schedule-${item.id}`}
                onClick={() => setActiveItem(item)}
                className="h-full"
              >
                <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col h-full hover:border-blue-400/80 transition-colors">
                  {/* Photo with badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.photo}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                    {/* Time Badge (Prominent) */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-md border border-white/60 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600 font-bold" />
                      <span className="font-extrabold text-sm text-slate-900 tracking-tight">{item.time}</span>
                      <span className="text-[11px] font-semibold text-slate-500">({item.dayOfWeek})</span>
                    </div>

                    {/* Format / Age Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold shadow-sm ${
                        item.format === 'outdoor'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-blue-600 text-white'
                      }`}>
                        {item.format === 'outdoor' ? 'Улица' : 'Зал'}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-900/80 text-white text-[11px] font-bold backdrop-blur-sm">
                        {item.ageGroup}
                      </span>
                    </div>

                    {/* Sport Tag at Bottom Left of Photo */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/90 text-white text-xs font-bold tracking-wide backdrop-blur-sm uppercase">
                        {item.sport}
                      </span>
                    </div>

                    {/* Operational Status Overlays */}
                    {item.status === 'cancelled' && (
                      <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-[2px] flex items-center justify-center p-3 text-center z-10">
                        <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg">
                          Занятие отменено
                        </span>
                      </div>
                    )}
                    {item.status === 'rescheduled' && (
                      <div className="absolute bottom-3 right-3 z-10">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-black text-[10px] uppercase shadow-md flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Перенесено
                        </span>
                      </div>
                    )}
                    {item.status === 'moved_indoor' && (
                      <div className="absolute bottom-3 right-3 z-10">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-black text-[10px] uppercase shadow-md flex items-center gap-1">
                          <Building className="w-3 h-3" /> В зал
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>

                      {/* Operational Change Alert Note */}
                      {item.changeNote && (
                        <div className="mt-2.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2 shadow-xs">
                          <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div className="leading-snug">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-amber-700 block">
                              Внимание (изменение):
                            </span>
                            <span className="font-semibold">{item.changeNote}</span>
                          </div>
                        </div>
                      )}

                      {/* Instructor */}
                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-2.5">
                        <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-medium">Инструктор: <strong className="text-slate-800">{item.instructor}</strong></span>
                      </div>

                      {/* District & Location */}
                      <div className="flex items-start gap-2 text-xs text-slate-600 mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          <strong className="text-slate-800">{item.district} район</strong> • {item.location}
                        </span>
                      </div>
                    </div>

                    {/* Enrolled Participants tracker */}
                    <div className="pt-2 pb-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingAttendeesItem(item);
                          }}
                          className="flex items-center gap-1 font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                          title="Посмотреть список записавшихся участников"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Записались: {item.enrolled || 0} / {item.capacity || 20}</span>
                        </button>
                        <span className="font-extrabold text-emerald-600 text-xs">Бесплатно</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            ((item.enrolled || 0) / (item.capacity || 20)) >= 1
                              ? 'bg-rose-500'
                              : ((item.enrolled || 0) / (item.capacity || 20)) >= 0.7
                              ? 'bg-amber-500'
                              : 'bg-blue-600'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.round(((item.enrolled || 0) / (item.capacity || 20)) * 100))}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Footer with Actions */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveItem(item);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                      >
                        <span>Инфо</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRegisteringItem(item);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Записаться</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardTilt>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: COMPACT TABLE                                    */}
        {/* ======================================================== */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100/80 text-xs uppercase font-extrabold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Время</th>
                    <th className="py-3.5 px-4">Занятие</th>
                    <th className="py-3.5 px-4">Вид спорта</th>
                    <th className="py-3.5 px-4">Район</th>
                    <th className="py-3.5 px-4">Место проведения</th>
                    <th className="py-3.5 px-4">Инструктор</th>
                    <th className="py-3.5 px-4">Группа</th>
                    <th className="py-3.5 px-4 text-center">Записались</th>
                    <th className="py-3.5 px-4 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchedules.map(item => (
                    <tr key={item.id} className="hover:bg-sky-50/50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-blue-700 text-base">{item.time}</span>
                        <span className="text-xs text-slate-400 block font-semibold">{item.dayOfWeek}, {item.date}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 max-w-xs">{item.title}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-bold">
                          {item.sport}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">{item.district}</td>
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-xs">
                        <div className="font-medium text-slate-800">{item.location}</div>
                        <div className="text-slate-400 truncate">{item.address}</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-800 whitespace-nowrap">{item.instructor}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                          {item.ageGroup}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => setViewingAttendeesItem(item)}
                          className="inline-flex items-center gap-1 font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-xl text-xs transition-colors cursor-pointer border border-purple-200"
                          title="Посмотреть список записавшихся участников"
                        >
                          <Users className="w-3.5 h-3.5 text-purple-600" />
                          <span>{item.enrolled || 0} / {item.capacity || 20}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setRegisteringItem(item)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
                        >
                          Записаться
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveItem(item)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Инфо
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: DAY TIMELINE (Vertical timeline)                 */}
        {/* ======================================================== */}
        {viewMode === 'day' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-900 text-xs sm:text-sm font-medium flex items-center justify-between">
              <span>Хронологическая шкала дня: упорядочено строго по времени проведения</span>
              <span className="font-bold">{filteredSchedules.length} занятий</span>
            </div>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-300 space-y-6">
              {filteredSchedules.map((item, idx) => (
                <div key={item.id} className="relative group">
                  {/* Timeline node dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm ring-2 ring-blue-300 group-hover:scale-125 transition-transform" />

                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-extrabold text-sm tracking-wide">
                          {item.time}
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase">{item.sport} • {item.dayOfWeek}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                          {item.ageGroup}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          {item.instructor}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {item.district} район ({item.location})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveItem(item)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Подробнее →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: WEEK CALENDAR GRID                               */}
        {/* ======================================================== */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map(day => {
              const dayItems = filteredSchedules.filter(s => s.dayOfWeek.toUpperCase() === day);
              return (
                <div key={day} className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col h-full min-h-[350px]">
                  <div className="pb-2 mb-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-extrabold text-sm text-blue-700">{day}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {dayItems.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[460px] pr-1">
                    {dayItems.length === 0 ? (
                      <div className="text-xs text-slate-400 text-center py-8">Нет занятий</div>
                    ) : (
                      dayItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => setActiveItem(item)}
                          className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-sky-50 hover:border-blue-300 transition-all cursor-pointer text-left space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-blue-600">{item.time}</span>
                            <span className="text-slate-500 truncate max-w-[80px]">{item.sport}</span>
                          </div>
                          <div className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {item.district}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* DETAILS MODAL                                            */}
        {/* ======================================================== */}
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
            <div
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-scale-up"
              onClick={e => e.stopPropagation()}
            >
              {/* Image banner */}
              <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                <img
                  src={activeItem.photo}
                  alt={activeItem.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  aria-label="Закрыть"
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-5 right-5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-xs font-bold uppercase tracking-wider">
                      {activeItem.sport}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-lime-500 text-slate-950 text-xs font-bold">
                      {activeItem.format === 'outdoor' ? 'На улице' : 'В зале'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                      {activeItem.ageGroup}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {activeItem.title}
                  </h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                {/* Operational Change Notice */}
                {(activeItem.changeNote || (activeItem.status && activeItem.status !== 'active')) && (
                  <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xs ${
                    activeItem.status === 'cancelled'
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : activeItem.status === 'rescheduled'
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : activeItem.status === 'moved_indoor'
                      ? 'bg-blue-50 border-blue-200 text-blue-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                      activeItem.status === 'cancelled' ? 'text-rose-600' : 'text-amber-600'
                    }`} />
                    <div>
                      <span className="font-extrabold text-xs uppercase tracking-wider block">
                        {activeItem.status === 'cancelled'
                          ? 'Занятие отменено'
                          : activeItem.status === 'rescheduled'
                          ? 'Внимание: Время или дата изменены'
                          : activeItem.status === 'moved_indoor'
                          ? 'Перенесено в крытое помещение'
                          : 'Оперативное изменение в расписании'}
                      </span>
                      {activeItem.changeNote && (
                        <p className="text-xs font-semibold mt-1 leading-relaxed">
                          {activeItem.changeNote}
                        </p>
                      )}
                      {activeItem.lastModified && (
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Обновлено: {new Date(activeItem.lastModified).toLocaleDateString('ru-RU')}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Highlights grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Время</span>
                    <span className="font-extrabold text-blue-600 text-base">{activeItem.time}</span>
                    <span className="text-xs text-slate-500 block">{activeItem.dayOfWeek}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Длительность</span>
                    <span className="font-bold text-slate-800 text-sm">{activeItem.durationMinutes || 60} мин</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Район</span>
                    <span className="font-bold text-slate-800 text-sm truncate block">{activeItem.district}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Стоимость</span>
                    <span className="font-extrabold text-emerald-600 text-sm">Бесплатно</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">О занятии</h4>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {activeItem.description || 'Регулярная тренировка под руководством сертифицированного тренера. Приглашаются жители города Новосибирска.'}
                  </p>
                </div>

                {/* Venue & Address */}
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{activeItem.location}</span>
                  </div>
                  <div className="text-xs text-slate-600 pl-5">
                    Адрес: {activeItem.address}
                  </div>
                </div>

                {/* Instructor Contacts */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {activeItem.instructor.substring(0, 2)}
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-bold block">Инструктор</span>
                      <span className="font-bold text-sm text-slate-900">{activeItem.instructor}</span>
                    </div>
                  </div>
                  {activeItem.instructorPhone && (
                    <a
                      href={`tel:${activeItem.instructorPhone}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{activeItem.instructorPhone}</span>
                    </a>
                  )}
                </div>

                {/* Requirements */}
                {activeItem.requirements && (
                  <div className="text-xs text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-200/50">
                    <strong className="text-amber-900 block mb-0.5">Что взять с собой:</strong>
                    {activeItem.requirements}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm cursor-pointer"
                >
                  Закрыть
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const it = activeItem;
                      setActiveItem(null);
                      setViewingAttendeesItem(it);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-purple-200 transition-colors"
                  >
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>Записались ({activeItem.enrolled || 0})</span>
                  </button>

                  <button
                    id="btn-enroll-activity"
                    type="button"
                    onClick={() => {
                      const it = activeItem;
                      setActiveItem(null);
                      setRegisteringItem(it);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Записаться онлайн</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registration Modal */}
        {registeringItem && (
          <ScheduleRegistrationModal
            isOpen={Boolean(registeringItem)}
            schedule={registeringItem}
            onClose={() => setRegisteringItem(null)}
            onSuccess={(reg) => {
              setEnrolledSuccess(`Вы успешно записаны на «${reg.targetTitle}»! Номер вашей брони: #${reg.id.slice(-6)}`);
              registeringItem.enrolled = (registeringItem.enrolled || 0) + (reg.participantsCount || 1);
              setTimeout(() => setEnrolledSuccess(null), 6000);
            }}
          />
        )}

        {/* Attendees list modal */}
        {viewingAttendeesItem && (
          <ViewAttendeesModal
            isOpen={Boolean(viewingAttendeesItem)}
            targetType="schedule"
            targetId={viewingAttendeesItem.id}
            targetTitle={viewingAttendeesItem.title}
            targetDate={viewingAttendeesItem.date || viewingAttendeesItem.dayOfWeek}
            targetTime={viewingAttendeesItem.time}
            targetLocation={viewingAttendeesItem.location}
            targetDistrict={viewingAttendeesItem.district}
            targetSport={viewingAttendeesItem.sport}
            capacity={viewingAttendeesItem.capacity || 20}
            onClose={() => setViewingAttendeesItem(null)}
          />
        )}
      </div>
    </section>
  );
};
