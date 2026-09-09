import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Users,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  Award,
  Sparkles,
  Info,
  Image as ImageIcon
} from 'lucide-react';
import { SportEventItem, District } from '../../types/index.ts';

interface EventEditModalProps {
  event: Partial<SportEventItem>;
  districts: District[];
  token: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<SportEventItem>) => Promise<void>;
}

const EVENT_TYPES = [
  'Турнир',
  'Марафон',
  'Фестиваль',
  'Кубок',
  'Первенство',
  'Сдача ГТО',
  'Семейные старты',
  'Эстафета',
  'Велопробег',
  'Заплыв',
  'Мастер-класс'
];

const COMMON_SPORTS = [
  'Легкая атлетика',
  'Баскетбол',
  'Волейбол',
  'Футбол',
  'Плавание',
  'Воркаут',
  'Настольный теннис',
  'Шахматы',
  'Водный спорт',
  'Единоборства',
  'Скандинавская ходьба',
  'ОФП',
  'Гимнастика',
  'Велоспорт'
];

const SPORT_PRESET_PHOTOS: Record<string, string> = {
  'Легкая атлетика': 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80',
  'Баскетбол': 'https://images.unsplash.com/photo-1547919307-1ecb10702e6f?auto=format&fit=crop&w=1200&q=80',
  'Футбол': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  'Плавание': 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=80',
  'Волейбол': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80',
  'Воркаут': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
  'Шахматы': 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80',
  'Настольный теннис': 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1200&q=80',
  'Водный спорт': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'Единоборства': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80'
};

const DAY_NAMES = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

export const EventEditModal: React.FC<EventEditModalProps> = ({
  event,
  districts,
  token,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<SportEventItem>>({
    title: event.title || '',
    eventType: event.eventType || 'Турнир',
    sport: event.sport || 'Легкая атлетика',
    district: event.district || (districts[0]?.name || 'Центральный'),
    location: event.location || '',
    address: event.address || '',
    organizer: event.organizer || 'Управление физической культуры и спорта мэрии Новосибирска',
    organizerPhone: event.organizerPhone || '+7 (383) 227-40-00',
    organizerEmail: event.organizerEmail || 'sport@novo-sibirsk.ru',
    date: event.date || new Date().toISOString().slice(0, 10),
    dayOfWeek: event.dayOfWeek || 'СБ',
    time: event.time || '10:00',
    durationHours: event.durationHours || 4,
    format: event.format || 'outdoor',
    ageGroup: event.ageGroup || 'Все возраста',
    targetCategory: event.targetCategory || 'Все',
    expectedParticipants: event.expectedParticipants || 200,
    registeredCount: event.registeredCount || 0,
    registrationDeadline: event.registrationDeadline || '',
    photo: event.photo || SPORT_PRESET_PHOTOS['Легкая атлетика'],
    description: event.description || 'Городское физкультурно-спортивное мероприятие в Новосибирске.',
    prizes: event.prizes || 'Памятные кубки, медали, дипломы и призы от партнеров',
    requirements: event.requirements || 'Спортивная форма, обувь по сезону, регистрация на портале',
    price: event.price || 'Бесплатно',
    isFeatured: event.isFeatured || false,
    status: event.status || 'registration_open',
    statusLabel: event.statusLabel || 'Регистрация открыта'
  });

  const [activeTab, setActiveTab] = useState<'main' | 'timing' | 'org' | 'details' | 'photo'>('main');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isNew = !event.id;

  const handleDateChange = (newDate: string) => {
    let day = formData.dayOfWeek;
    if (newDate) {
      const d = new Date(newDate);
      if (!isNaN(d.getTime())) {
        day = DAY_NAMES[d.getDay()];
      }
    }
    setFormData(prev => ({
      ...prev,
      date: newDate,
      dayOfWeek: day
    }));
  };

  const handleSportChange = (sport: string) => {
    setFormData(prev => ({
      ...prev,
      sport,
      photo: SPORT_PRESET_PHOTOS[sport] || prev.photo
    }));
  };

  const handleStatusChange = (status: SportEventItem['status']) => {
    const statusLabels: Record<string, string> = {
      registration_open: 'Регистрация открыта',
      upcoming: 'Скоро',
      ongoing: 'Идет сейчас',
      finished: 'Завершено',
      rescheduled: 'Перенесено'
    };
    setFormData(prev => ({
      ...prev,
      status,
      statusLabel: statusLabels[status] || 'Скоро'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setErrorMessage('Укажите название мероприятия');
      setActiveTab('main');
      return;
    }
    if (!formData.location?.trim()) {
      setErrorMessage('Укажите место проведения мероприятия');
      setActiveTab('main');
      return;
    }
    if (!formData.date) {
      setErrorMessage('Укажите дату проведения');
      setActiveTab('timing');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка сохранения мероприятия');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-linear-to-r from-blue-50/70 via-indigo-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isNew ? 'Новое спортивное мероприятие' : 'Редактирование мероприятия'}
              </h3>
              <p className="text-xs text-slate-500">
                {isNew
                  ? 'Добавление турнира, марафона или фестиваля в городской календарь'
                  : `ID: ${event.id} • ${formData.title}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('main')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'main'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Основное</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timing')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timing'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Дата и время</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('org')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'org'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Организатор и квота</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Описание и награды</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'photo'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Афиша/Фото</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: MAIN INFO */}
          {activeTab === 'main' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Название мероприятия <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Открытый городской турнир по уличному баскетболу 3х3"
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Тип мероприятия
                  </label>
                  <select
                    value={formData.eventType || 'Турнир'}
                    onChange={e => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {EVENT_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Вид спорта
                  </label>
                  <select
                    value={formData.sport || 'Легкая атлетика'}
                    onChange={e => handleSportChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {COMMON_SPORTS.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Район Новосибирска
                  </label>
                  <select
                    value={formData.district || districts[0]?.name}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {districts.map(d => (
                      <option key={d.id} value={d.name}>
                        {d.name} район
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Формат площадки
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, format: 'outdoor' })}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        formData.format === 'outdoor'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      На улице
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, format: 'indoor' })}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        formData.format === 'indoor'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      В зале
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, format: 'combined' })}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        formData.format === 'combined'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Смешанный
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Место проведения (спорткомплекс, парк, стадион) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Михайловская набережная (главная сцена)"
                  value={formData.location || ''}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Точный адрес
                </label>
                <input
                  type="text"
                  placeholder="Например: ул. Большевистская, 12б"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: TIMING & AGE */}
          {activeTab === 'timing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Дата события <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date || ''}
                    onChange={e => handleDateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    День недели
                  </label>
                  <select
                    value={formData.dayOfWeek || 'СБ'}
                    onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Время начала
                  </label>
                  <input
                    type="time"
                    value={formData.time || '10:00'}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Продолжительность (часы)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={formData.durationHours || 4}
                    onChange={e => setFormData({ ...formData, durationHours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Возрастная группа
                  </label>
                  <input
                    type="text"
                    placeholder="Все возраста, 14+, Дети..."
                    value={formData.ageGroup || 'Все возраста'}
                    onChange={e => setFormData({ ...formData, ageGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Целевая категория
                  </label>
                  <select
                    value={formData.targetCategory || 'Все'}
                    onChange={e => setFormData({ ...formData, targetCategory: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Все">Все жители</option>
                    <option value="Дети">Дети и подростки</option>
                    <option value="Молодежь">Молодежь</option>
                    <option value="Взрослые">Взрослые</option>
                    <option value="Ветераны">Старшее поколение</option>
                    <option value="Семьи">Спортивные семьи</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Крайний срок онлайн-регистрации (дедлайн)
                </label>
                <input
                  type="date"
                  value={formData.registrationDeadline || ''}
                  onChange={e => setFormData({ ...formData, registrationDeadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Если не указано, регистрация закрывается в день проведения мероприятия.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: ORGANIZER & QUOTA */}
          {activeTab === 'org' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Организатор мероприятия
                </label>
                <input
                  type="text"
                  placeholder="Например: Федерация баскетбола Новосибирской области"
                  value={formData.organizer || ''}
                  onChange={e => setFormData({ ...formData, organizer: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Телефон для справок
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="+7 (383) 227-40-00"
                      value={formData.organizerPhone || ''}
                      onChange={e => setFormData({ ...formData, organizerPhone: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Электронная почта
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      placeholder="sport@novo-sibirsk.ru"
                      value={formData.organizerEmail || ''}
                      onChange={e => setFormData({ ...formData, organizerEmail: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ожидаемое количество участников (квота)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.expectedParticipants || 200}
                    onChange={e => setFormData({ ...formData, expectedParticipants: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Уже зарегистрировано участников
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.registeredCount || 0}
                    onChange={e => setFormData({ ...formData, registeredCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Стоимость участия
                </label>
                <input
                  type="text"
                  placeholder="Бесплатно"
                  value={formData.price || 'Бесплатно'}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: DETAILS & PRIZES */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Статус мероприятия
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'registration_open', label: 'Регистрация открыта', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                    { id: 'upcoming', label: 'Скоро', color: 'border-blue-500 bg-blue-50 text-blue-800' },
                    { id: 'ongoing', label: 'Идет сейчас', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                    { id: 'finished', label: 'Завершено', color: 'border-slate-400 bg-slate-100 text-slate-700' }
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleStatusChange(st.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        formData.status === st.id
                          ? st.color
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Призы, награды и памятные подарки
                </label>
                <input
                  type="text"
                  placeholder="Кубки победителей, медали за 1-3 место, памятные сувениры..."
                  value={formData.prizes || ''}
                  onChange={e => setFormData({ ...formData, prizes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Требования к участникам и форма
                </label>
                <input
                  type="text"
                  placeholder="Спортивная одежда, справка-допуск, сменная обувь..."
                  value={formData.requirements || ''}
                  onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Подробное описание мероприятия
                </label>
                <textarea
                  rows={4}
                  placeholder="Опишите программу соревнований, дистанции, правила участия и контактную информацию..."
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isFeatured)}
                    onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Закрепить мероприятие на главной странице (Бейдж «Главное событие»)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: PHOTO */}
          {activeTab === 'photo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ссылка на афишу / фотографию (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.photo || ''}
                  onChange={e => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {formData.photo && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-56 bg-slate-100 flex items-center justify-center">
                  <img
                    src={formData.photo}
                    alt="Превью афиши"
                    className="w-full h-full object-cover max-h-56"
                    onError={e => {
                      (e.target as HTMLImageElement).src = SPORT_PRESET_PHOTOS['Легкая атлетика'];
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Быстрый выбор качественной афиши по спорту:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {Object.entries(SPORT_PRESET_PHOTOS).map(([sportName, url]) => (
                    <button
                      key={sportName}
                      type="button"
                      onClick={() => setFormData({ ...formData, photo: url })}
                      className="group p-1.5 rounded-xl border border-slate-200 hover:border-blue-500 transition-all text-left bg-white overflow-hidden cursor-pointer"
                    >
                      <div className="h-14 rounded-lg overflow-hidden mb-1.5 bg-slate-100">
                        <img
                          src={url}
                          alt={sportName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="text-[11px] font-bold text-slate-800 truncate px-0.5">
                        {sportName}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Отмена
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Сохранение...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isNew ? 'Создать мероприятие' : 'Сохранить изменения'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
