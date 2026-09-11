import React, { useState, useMemo, useRef } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  RotateCcw,
  Users,
  Award,
  ChevronRight,
  ExternalLink,
  Info,
  CheckCircle2,
  CalendarCheck,
  Trophy,
  Flame,
  Sparkles,
  Share2,
  Phone,
  Mail,
  ShieldCheck,
  X,
  Compass,
  ArrowRight,
  Download
} from 'lucide-react';
import { SportEventItem, EventFilterState, AgeGroup, TimeOfDay } from '../types/index.ts';
import { ViewAttendeesModal } from './ViewAttendeesModal.tsx';

interface EventsSectionProps {
  events: SportEventItem[];
  selectedDistrict?: string;
  onDistrictSelect?: (district: string) => void;
  id?: string;
}

type EventViewMode = 'cards' | 'table' | 'day' | 'week';

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

const ALL_EVENT_TYPES = [
  'Все типы мероприятий',
  'Марафон',
  'Турнир',
  'Кубок',
  'Фестиваль',
  'Первенство',
  'Велопробег'
];

const ALL_SPORTS = [
  'Все виды спорта',
  'Легкая атлетика',
  'Баскетбол',
  'Волейбол',
  'ОФП',
  'Велоспорт',
  'Плавание',
  'Водный спорт',
  'Настольный теннис',
  'Воркаут',
  'Футбол',
  'Шахматы'
];

const DAYS_OF_WEEK = ['Все', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

// 3D Card tilt component for events
const EventCardTilt: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 0.18s cubic-bezier(0.2, 0, 0.2, 1)'
      }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
};

export const EventsSection: React.FC<EventsSectionProps> = ({
  events = [],
  selectedDistrict = 'Все районы',
  onDistrictSelect,
  id = 'events'
}) => {
  const [viewMode, setViewMode] = useState<EventViewMode>('cards');
  const [selectedEvent, setSelectedEvent] = useState<SportEventItem | null>(null);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [eventForRegistration, setEventForRegistration] = useState<SportEventItem | null>(null);
  const [viewingAttendeesEvent, setViewingAttendeesEvent] = useState<SportEventItem | null>(null);

  // Form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regParticipants, setRegParticipants] = useState('1');
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local list of registered events IDs
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nsk_sport54_registered_events');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dedicated independent filter state for events
  const [filters, setFilters] = useState<EventFilterState>({
    search: '',
    district: selectedDistrict || 'Все районы',
    eventType: 'Все типы мероприятий',
    sport: 'Все виды спорта',
    date: '',
    dayOfWeek: 'Все',
    timeOfDay: 'all',
    ageGroup: 'all',
    format: 'all',
    status: 'all',
    sortBy: 'date_asc'
  });

  // Keep district in sync when selected from district section
  React.useEffect(() => {
    if (selectedDistrict && selectedDistrict !== 'Все районы') {
      setFilters(prev => ({ ...prev, district: selectedDistrict }));
    }
  }, [selectedDistrict]);

  const resetFilters = () => {
    setFilters({
      search: '',
      district: 'Все районы',
      eventType: 'Все типы мероприятий',
      sport: 'Все виды спорта',
      date: '',
      dayOfWeek: 'Все',
      timeOfDay: 'all',
      ageGroup: 'all',
      format: 'all',
      status: 'all',
      sortBy: 'date_asc'
    });
    if (onDistrictSelect) {
      onDistrictSelect('Все районы');
    }
  };

  // Filtered & Sorted Events
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const matches =
          ev.title.toLowerCase().includes(q) ||
          ev.sport.toLowerCase().includes(q) ||
          ev.eventType.toLowerCase().includes(q) ||
          ev.location.toLowerCase().includes(q) ||
          ev.district.toLowerCase().includes(q) ||
          ev.organizer.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // District
      if (filters.district && filters.district !== 'Все районы' && filters.district !== 'Все') {
        if (ev.district.toLowerCase() !== filters.district.toLowerCase()) {
          return false;
        }
      }

      // Event Type
      if (filters.eventType && filters.eventType !== 'Все типы мероприятий' && filters.eventType !== 'Все') {
        if (ev.eventType.toLowerCase() !== filters.eventType.toLowerCase()) {
          return false;
        }
      }

      // Sport
      if (filters.sport && filters.sport !== 'Все виды спорта' && filters.sport !== 'Все') {
        if (ev.sport.toLowerCase() !== filters.sport.toLowerCase()) {
          return false;
        }
      }

      // Day of week
      if (filters.dayOfWeek && filters.dayOfWeek !== 'Все') {
        if (ev.dayOfWeek.toUpperCase() !== filters.dayOfWeek.toUpperCase()) {
          return false;
        }
      }

      // Date
      if (filters.date) {
        if (ev.date !== filters.date) {
          return false;
        }
      }

      // Format (indoor / outdoor)
      if (filters.format && filters.format !== 'all') {
        if (ev.format !== filters.format) {
          return false;
        }
      }

      // Status
      if (filters.status && filters.status !== 'all') {
        if (ev.status !== filters.status) {
          return false;
        }
      }

      // Time of Day
      if (filters.timeOfDay && filters.timeOfDay !== 'all') {
        const hour = parseInt(ev.time.split(':')[0], 10);
        if (filters.timeOfDay === 'morning' && (hour < 6 || hour >= 12)) return false;
        if (filters.timeOfDay === 'day' && (hour < 12 || hour >= 17)) return false;
        if (filters.timeOfDay === 'evening' && (hour < 17 || hour >= 24)) return false;
      }

      // Age Group
      if (filters.ageGroup && filters.ageGroup !== 'all') {
        const cat = (ev.targetCategory || ev.ageGroup).toLowerCase();
        if (filters.ageGroup === 'kids' && !cat.includes('дет') && !cat.includes('все')) return false;
        if (filters.ageGroup === 'teens' && !cat.includes('подр') && !cat.includes('14+') && !cat.includes('все')) return false;
        if (filters.ageGroup === 'adults' && !cat.includes('взрос') && !cat.includes('18+') && !cat.includes('все')) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'date_asc') {
        return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
      }
      if (filters.sortBy === 'date_desc') {
        return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
      }
      if (filters.sortBy === 'popularity') {
        return (b.registeredCount || 0) - (a.registeredCount || 0);
      }
      if (filters.sortBy === 'district') {
        return a.district.localeCompare(b.district);
      }
      if (filters.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [events, filters]);

  // Handle registration submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForRegistration) return;

    setIsSubmitting(true);
    try {
      // Attempt backend register endpoint
      await fetch(`/api/events/${eventForRegistration.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          phone: regPhone,
          email: regEmail,
          participants: parseInt(regParticipants, 10) || 1
        })
      }).catch(() => null);

      // Save locally
      const updated = Array.from(new Set([...registeredEventIds, eventForRegistration.id]));
      setRegisteredEventIds(updated);
      localStorage.setItem('nsk_sport54_registered_events', JSON.stringify(updated));

      // Update event participant count locally in view
      eventForRegistration.registeredCount = (eventForRegistration.registeredCount || 0) + (parseInt(regParticipants, 10) || 1);

      setRegSuccessMessage(`Вы успешно зарегистрированы на мероприятие «${eventForRegistration.title}»! Напоминание и электронный билет отправлены на ${regEmail || regPhone}.`);
      setRegistrationModalOpen(false);

      setTimeout(() => {
        setRegSuccessMessage(null);
      }, 7000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate .ics calendar file download
  const handleDownloadCalendar = (ev: SportEventItem) => {
    const [year, month, day] = ev.date.split('-');
    const [hour, min] = ev.time.split(':');
    const startStr = `${year}${month}${day}T${hour}${min}00`;
    const endHour = String(parseInt(hour, 10) + (ev.durationHours || 2)).padStart(2, '0');
    const endStr = `${year}${month}${day}T${endHour}${min}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Спортивный Город 54//События Новосибирска//RU',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `SUMMARY:${ev.title}`,
      `DESCRIPTION:${ev.description.replace(/\n/g, ' ')}`,
      `LOCATION:${ev.location}, ${ev.address}, Новосибирск`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${ev.title.slice(0, 30)}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date helper
  const formatDateRu = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <section id={id} className="py-16 sm:py-24 bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Subtle background ambient gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Title & View Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider mb-3">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Календарь спортивных событий • 2026</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Расписание мероприятий
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-medium">
              Городские полумарафоны, открытые кубки мэрии, чемпионаты районов, семейные эстафеты ГТО и фестивали спорта на открытом воздухе.
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-800/90 rounded-2xl border border-slate-700/80 shrink-0 self-start md:self-auto shadow-inner">
            <button
              id="view-events-cards"
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>▦ Карточки</span>
            </button>

            <button
              id="view-events-table"
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>☷ Таблица</span>
            </button>

            <button
              id="view-events-day"
              type="button"
              onClick={() => setViewMode('day')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>▣ Хронология</span>
            </button>

            <button
              id="view-events-week"
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>▦ По дням</span>
            </button>
          </div>
        </div>

        {/* Separate Event Filters Box */}
        <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 p-5 sm:p-6 mb-8 shadow-2xl">
          {/* Row 1: Search & Primary Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label htmlFor="event-filter-search" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Поиск по событиям
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="event-filter-search"
                  type="text"
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  placeholder="Марафон, Сибирь-Арена, баскетбол, ГТО..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => setFilters(f => ({ ...f, search: '' }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* District Selector */}
            <div>
              <label htmlFor="event-filter-district" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Район города
              </label>
              <select
                id="event-filter-district"
                value={filters.district}
                onChange={e => {
                  const val = e.target.value;
                  setFilters(f => ({ ...f, district: val }));
                  if (onDistrictSelect) onDistrictSelect(val);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {ALL_DISTRICTS.map(d => (
                  <option key={d} value={d} className="bg-slate-800 text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Type */}
            <div>
              <label htmlFor="event-filter-type" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Тип события
              </label>
              <select
                id="event-filter-type"
                value={filters.eventType}
                onChange={e => setFilters(f => ({ ...f, eventType: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {ALL_EVENT_TYPES.map(t => (
                  <option key={t} value={t} className="bg-slate-800 text-white">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Sport Selector */}
            <div>
              <label htmlFor="event-filter-sport" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Вид спорта
              </label>
              <select
                id="event-filter-sport"
                value={filters.sport}
                onChange={e => setFilters(f => ({ ...f, sport: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {ALL_SPORTS.map(s => (
                  <option key={s} value={s} className="bg-slate-800 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Secondary Quick Chips (Day of week, Format, Status, Sort) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/80">
            {/* Days of Week */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
              <span className="text-xs font-bold text-slate-400 mr-1">День:</span>
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setFilters(f => ({ ...f, dayOfWeek: day }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filters.dayOfWeek === day
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Format Chips */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 mr-1">Формат:</span>
              <button
                type="button"
                onClick={() => setFilters(f => ({ ...f, format: 'all' }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  filters.format === 'all'
                    ? 'bg-white text-slate-900 font-bold'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Все
              </button>
              <button
                type="button"
                onClick={() => setFilters(f => ({ ...f, format: 'outdoor' }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  filters.format === 'outdoor'
                    ? 'bg-lime-500 text-slate-950 font-bold'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                На улице
              </button>
              <button
                type="button"
                onClick={() => setFilters(f => ({ ...f, format: 'indoor' }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  filters.format === 'indoor'
                    ? 'bg-blue-500 text-white font-bold'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                В зале
              </button>
            </div>

            {/* Status Chips */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 mr-1">Статус:</span>
              <button
                type="button"
                onClick={() => setFilters(f => ({ ...f, status: 'all' }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  filters.status === 'all'
                    ? 'bg-white text-slate-900 font-bold'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Все
              </button>
              <button
                type="button"
                onClick={() => setFilters(f => ({ ...f, status: 'registration_open' }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  filters.status === 'registration_open'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Открыта запись
              </button>
              <button
                type="button"
                onClick={() => setFilters(f => ({ ...f, status: 'upcoming' }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  filters.status === 'upcoming'
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Скоро
              </button>
            </div>

            {/* Sort Order Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Сортировка:</span>
              <select
                id="event-filter-sort"
                value={filters.sortBy}
                onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value as any }))}
                className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="date_asc" className="bg-slate-800 text-white">Ближайшие по дате</option>
                <option value="date_desc" className="bg-slate-800 text-white">Сначала поздние</option>
                <option value="popularity" className="bg-slate-800 text-white">По популярности (участники)</option>
                <option value="district" className="bg-slate-800 text-white">По району</option>
                <option value="title" className="bg-slate-800 text-white">По названию</option>
              </select>
            </div>

            {/* Reset */}
            <button
              id="btn-reset-event-filters"
              type="button"
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить</span>
            </button>
          </div>
        </div>

        {/* Success feedback notification */}
        {regSuccessMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-900/40 border border-emerald-500/50 text-emerald-200 flex items-center gap-3 animate-fade-in shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-sm">{regSuccessMessage}</span>
          </div>
        )}

        {/* Counter of found events */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
          <span>Найдено актуальных мероприятий: <strong className="text-white">{filteredEvents.length}</strong> из {events.length}</span>
          {filters.district !== 'Все районы' && (
            <span className="text-blue-400 font-semibold">Фильтр по району: {filters.district}</span>
          )}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16 bg-slate-800/80 rounded-3xl border border-slate-700 p-8">
            <Info className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white">Мероприятий по выбранным фильтрам не найдено</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
              Попробуйте выбрать другой район, изменить вид спорта или сбросить фильтры.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md hover:bg-blue-500 transition-all cursor-pointer"
            >
              Показать все мероприятия
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1: 3D CARDS (Default primary view)                  */}
        {/* ======================================================== */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(ev => {
              const isRegistered = registeredEventIds.includes(ev.id);
              const progressPct = Math.min(
                100,
                Math.round(((ev.registeredCount || 0) / (ev.expectedParticipants || 100)) * 100)
              );

              return (
                <EventCardTilt key={ev.id} className="h-full">
                  <div className="h-full bg-slate-800 rounded-3xl border border-slate-700/80 overflow-hidden shadow-xl hover:border-blue-500/60 hover:shadow-2xl transition-all flex flex-col group">
                    {/* Event Photo with badging */}
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
                      <img
                        src={ev.photo}
                        alt={ev.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full bg-blue-600/90 text-white text-xs font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md">
                          {ev.eventType}
                        </span>

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-extrabold backdrop-blur-md shadow-md ${
                            ev.status === 'registration_open'
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-sky-500/90 text-slate-950'
                          }`}
                        >
                          {ev.statusLabel || (ev.status === 'registration_open' ? 'Регистрация открыта' : 'Скоро')}
                        </span>
                      </div>

                      {/* Bottom Date & Time on image */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-bold">
                        <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                          <Calendar className="w-3.5 h-3.5 text-lime-400" />
                          <span>{formatDateRu(ev.date)} ({ev.dayOfWeek})</span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
                          <Clock className="w-3.5 h-3.5 text-sky-400" />
                          <span>{ev.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* District & Sport tags */}
                        <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-400 mb-2">
                          <span className="text-blue-400">{ev.district} район</span>
                          <span className="bg-slate-700/60 px-2 py-0.5 rounded-md text-slate-300">
                            {ev.sport}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2.5">
                          {ev.title}
                        </h3>

                        {/* Location */}
                        <div className="flex items-start gap-2 text-xs text-slate-300 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{ev.location} • {ev.address}</span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed font-normal">
                          {ev.description}
                        </p>

                        {/* Progress of registration */}
                        <div className="mb-4 bg-slate-900/70 p-3 rounded-2xl border border-slate-700/50">
                          <button
                            type="button"
                            onClick={() => setViewingAttendeesEvent(ev)}
                            className="w-full flex justify-between items-center text-[11px] font-bold text-slate-400 mb-1.5 hover:text-blue-300 transition-colors cursor-pointer text-left"
                            title="Посмотреть список записавшихся участников"
                          >
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-blue-400" />
                              <span>Участники (список)</span>
                            </span>
                            <span className="text-white font-mono hover:underline">
                              {ev.registeredCount || 0} / {ev.expectedParticipants} чел.
                            </span>
                          </button>
                          <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-lime-400 rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-700/60 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEventForRegistration(ev);
                            setRegistrationModalOpen(true);
                          }}
                          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                            isRegistered
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-600 hover:bg-blue-500 text-white'
                          }`}
                        >
                          {isRegistered ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Вы записаны</span>
                            </>
                          ) : (
                            <>
                              <Flame className="w-4 h-4 text-amber-300" />
                              <span>Принять участие</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setViewingAttendeesEvent(ev)}
                          title={`Список записавшихся участников (${ev.registeredCount || 0})`}
                          className="p-2.5 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-purple-200 hover:text-white transition-all cursor-pointer border border-purple-500/30"
                        >
                          <Users className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedEvent(ev)}
                          title="Подробная информация о мероприятии"
                          className="p-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer"
                        >
                          <Info className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadCalendar(ev)}
                          title="Добавить в личный календарь (.ics)"
                          className="p-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-lime-400 transition-all cursor-pointer"
                        >
                          <CalendarCheck className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </EventCardTilt>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: TABLE VIEW                                       */}
        {/* ======================================================== */}
        {viewMode === 'table' && (
          <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-900/90 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-4 px-4">Дата & Время</th>
                    <th className="py-4 px-4">Мероприятие</th>
                    <th className="py-4 px-4">Район & Место</th>
                    <th className="py-4 px-4">Спорт / Тип</th>
                    <th className="py-4 px-4">Участники</th>
                    <th className="py-4 px-4">Статус</th>
                    <th className="py-4 px-4 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  {filteredEvents.map(ev => {
                    const isRegistered = registeredEventIds.includes(ev.id);
                    return (
                      <tr key={ev.id} className="hover:bg-slate-750/70 transition-colors">
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-bold text-white">{formatDateRu(ev.date)}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-sky-400" />
                            <span>{ev.time} ({ev.dayOfWeek})</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <div className="font-bold text-white hover:text-blue-400 transition-colors cursor-pointer" onClick={() => setSelectedEvent(ev)}>
                            {ev.title}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 truncate">
                            Организатор: {ev.organizer}
                          </div>
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <div className="text-xs font-bold text-blue-400">{ev.district} район</div>
                          <div className="text-xs text-slate-300 truncate">{ev.location}</div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-700 text-xs text-slate-200 font-semibold mr-1">
                            {ev.sport}
                          </span>
                          <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-semibold">
                            {ev.eventType}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-xs font-mono">
                          <button
                            type="button"
                            onClick={() => setViewingAttendeesEvent(ev)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-900/40 hover:bg-purple-900/80 border border-purple-500/30 text-purple-200 transition-colors cursor-pointer"
                            title="Посмотреть список записавшихся участников"
                          >
                            <Users className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-white font-bold">{ev.registeredCount || 0}</span>
                            <span className="text-slate-400">/ {ev.expectedParticipants}</span>
                          </button>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              ev.status === 'registration_open'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            }`}
                          >
                            {ev.statusLabel || (ev.status === 'registration_open' ? 'Открыта' : 'Скоро')}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEventForRegistration(ev);
                                setRegistrationModalOpen(true);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isRegistered
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white'
                              }`}
                            >
                              {isRegistered ? 'Записан' : 'Участвовать'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedEvent(ev)}
                              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
                              title="Инфо"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: DAY TIMELINE VIEW                                */}
        {/* ======================================================== */}
        {viewMode === 'day' && (
          <div className="space-y-6">
            {['morning', 'day', 'evening'].map(period => {
              const periodTitle =
                period === 'morning'
                  ? '🌅 Утренние старты и забеги (06:00 - 12:00)'
                  : period === 'day'
                  ? '☀️ Дневные турниры и семейные фестивали (12:00 - 17:00)'
                  : '🌙 Вечерние финалы и первенства (17:00 - 23:00)';

              const periodEvents = filteredEvents.filter(ev => {
                const hour = parseInt(ev.time.split(':')[0], 10);
                if (period === 'morning') return hour >= 6 && hour < 12;
                if (period === 'day') return hour >= 12 && hour < 17;
                return hour >= 17;
              });

              if (periodEvents.length === 0) return null;

              return (
                <div key={period} className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-700/80 flex items-center gap-2">
                    <span>{periodTitle}</span>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                      {periodEvents.length}
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {periodEvents.map(ev => (
                      <div
                        key={ev.id}
                        className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 hover:border-blue-500/50 transition-all flex gap-4 items-center"
                      >
                        <img
                          src={ev.photo}
                          alt={ev.title}
                          className="w-20 h-20 rounded-2xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-1">
                            <Clock className="w-3 h-3" />
                            <span>{ev.time}</span>
                            <span>•</span>
                            <span>{formatDateRu(ev.date)}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white truncate hover:text-blue-400 transition-colors cursor-pointer" onClick={() => setSelectedEvent(ev)}>
                            {ev.title}
                          </h4>
                          <div className="text-xs text-slate-400 truncate mt-0.5">
                            {ev.district} район • {ev.location}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setEventForRegistration(ev);
                            setRegistrationModalOpen(true);
                          }}
                          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 cursor-pointer shadow-md"
                        >
                          Участвовать
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: WEEK / DAY GROUPING VIEW                         */}
        {/* ======================================================== */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {['СБ', 'ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ'].map(day => {
              const dayEvents = filteredEvents.filter(e => e.dayOfWeek === day);
              if (dayEvents.length === 0) return null;

              return (
                <div key={day} className="bg-slate-800 rounded-3xl border border-slate-700 p-5 shadow-xl flex flex-col">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700">
                    <span className="text-base font-extrabold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-lime-400" />
                      <span>{day === 'СБ' ? 'Суббота (СБ)' : day === 'ВС' ? 'Воскресенье (ВС)' : day}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-400 text-xs font-bold font-mono">
                      {dayEvents.length} соб.
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {dayEvents.map(ev => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700/60 hover:border-blue-500/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                          <span className="text-lime-400">{ev.time}</span>
                          <span className="text-blue-400">{ev.district}</span>
                        </div>
                        <div className="text-xs font-bold text-white line-clamp-2 mb-1">
                          {ev.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          📍 {ev.location}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: EVENT DETAIL MODAL                              */}
      {/* ======================================================== */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-white">
            {/* Close */}
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner Image */}
            <div className="relative h-56 sm:h-64 w-full overflow-hidden rounded-t-3xl bg-slate-950">
              <img
                src={selectedEvent.photo}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-600 text-xs font-bold uppercase tracking-wider shadow">
                  {selectedEvent.eventType}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold shadow">
                  {selectedEvent.price || 'Бесплатно'}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-2">
                  <span>{selectedEvent.district} район</span>
                  <span>•</span>
                  <span>{selectedEvent.sport}</span>
                  <span>•</span>
                  <span>{selectedEvent.ageGroup}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {selectedEvent.title}
                </h3>
              </div>

              {/* Key event parameters grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Дата:</span>
                  <span className="font-bold text-white">{formatDateRu(selectedEvent.date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Время:</span>
                  <span className="font-bold text-white">{selectedEvent.time} ({selectedEvent.dayOfWeek})</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Формат:</span>
                  <span className="font-bold text-white">
                    {selectedEvent.format === 'outdoor' ? 'На открытом воздухе' : 'В помещении'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Участники:</span>
                  <span className="font-bold text-lime-400 font-mono">
                    {selectedEvent.registeredCount || 0} / {selectedEvent.expectedParticipants}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">
                  О мероприятии
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Prizes & Requirements */}
              {(selectedEvent.prizes || selectedEvent.requirements) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedEvent.prizes && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                        <Award className="w-4 h-4" />
                        <span>Награды и призы:</span>
                      </div>
                      <p className="text-slate-300">{selectedEvent.prizes}</p>
                    </div>
                  )}

                  {selectedEvent.requirements && (
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-blue-400 mb-1">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Требования к участникам:</span>
                      </div>
                      <p className="text-slate-300">{selectedEvent.requirements}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Location & Venue */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block mb-1">Место проведения:</span>
                    <div className="font-bold text-sm text-white">{selectedEvent.location}</div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{selectedEvent.address}, Новосибирск</span>
                    </div>
                  </div>
                  <a
                    href={`https://yandex.ru/maps/?text=${encodeURIComponent(selectedEvent.location + ' ' + selectedEvent.address + ' Новосибирск')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-blue-400 border border-slate-600 flex items-center gap-1 shrink-0"
                  >
                    <span>На карте</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Organizer contacts */}
              <div className="text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-700">
                <div>Организатор: <strong className="text-white">{selectedEvent.organizer}</strong></div>
                {selectedEvent.organizerPhone && (
                  <a href={`tel:${selectedEvent.organizerPhone}`} className="text-blue-400 hover:underline flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedEvent.organizerPhone}</span>
                  </a>
                )}
              </div>

              {/* Modal footer buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEventForRegistration(selectedEvent);
                    setSelectedEvent(null);
                    setRegistrationModalOpen(true);
                  }}
                  className="flex-1 min-w-[200px] py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>Подать заявку на участие</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const ev = selectedEvent;
                    setSelectedEvent(null);
                    setViewingAttendeesEvent(ev);
                  }}
                  className="py-3 px-4 rounded-2xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/30 text-purple-200 hover:text-white font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
                  title="Посмотреть список записавшихся участников"
                >
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Участники ({selectedEvent.registeredCount || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadCalendar(selectedEvent)}
                  className="py-3 px-4 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-lime-400" />
                  <span>В календарь</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: REGISTRATION FORM MODAL                         */}
      {/* ======================================================== */}
      {registrationModalOpen && eventForRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-white">
            <button
              type="button"
              onClick={() => setRegistrationModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider mb-3">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Бесплатная регистрация</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              Заявка на участие
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-5">
              «{eventForRegistration.title}» • {formatDateRu(eventForRegistration.date)}, {eventForRegistration.time}
            </p>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  ФИО участника или представителя команды *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Иванов Алексей Сергеевич"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Номер телефона для подтверждения *
                </label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="+7 (913) 000-00-00"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Электронная почта (для билета и регламента)
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="alexey@mail.ru"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Количество участников
                </label>
                <select
                  value={regParticipants}
                  onChange={e => setRegParticipants(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1 человек (индивидуальное участие)</option>
                  <option value="2">2 человека (парный зачет)</option>
                  <option value="3">3 человека (семейный старт)</option>
                  <option value="4">4 человека (команда)</option>
                  <option value="6">6+ человек (групповая заявка)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 text-xs text-slate-400 leading-relaxed">
                Нажимая «Подтвердить участие», вы соглашаетесь с правилами безопасности спортивного мероприятия и регламентом проведения соревнований в г. Новосибирске.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Регистрация...' : 'Подтвердить участие в мероприятии'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Attendees list modal for events */}
      {viewingAttendeesEvent && (
        <ViewAttendeesModal
          isOpen={Boolean(viewingAttendeesEvent)}
          targetType="event"
          targetId={viewingAttendeesEvent.id}
          targetTitle={viewingAttendeesEvent.title}
          targetDate={viewingAttendeesEvent.date}
          targetTime={viewingAttendeesEvent.time}
          targetLocation={viewingAttendeesEvent.location}
          targetDistrict={viewingAttendeesEvent.district}
          targetSport={viewingAttendeesEvent.sport}
          capacity={viewingAttendeesEvent.expectedParticipants || 100}
          onClose={() => setViewingAttendeesEvent(null)}
        />
      )}
    </section>
  );
};
