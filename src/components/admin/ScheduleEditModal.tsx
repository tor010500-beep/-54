import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Layers,
  Sparkles,
  Info,
  Shield,
  FileText,
  AlertTriangle,
  Upload,
  MessageSquare
} from 'lucide-react';
import { ScheduleItem, District, ScheduleChangeRecord } from '../../types/index.ts';
import { SchedulePhotoUploader } from './SchedulePhotoUploader.tsx';

interface ScheduleEditModalProps {
  schedule: Partial<ScheduleItem>;
  districts: District[];
  token: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (scheduleData: Partial<ScheduleItem>) => Promise<void>;
}

const COMMON_SPORTS = [
  'Йога',
  'Волейбол',
  'Зарядка',
  'Футбол',
  'Плавание',
  'Скандинавская ходьба',
  'Баскетбол',
  'Воркаут',
  'ОФП',
  'Шахматы',
  'Настольный теннис',
  'Пилатес',
  'Лёгкая атлетика'
];

export const ScheduleEditModal: React.FC<ScheduleEditModalProps> = ({
  schedule,
  districts,
  token,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    title: schedule.title || '',
    sport: schedule.sport || 'Йога',
    district: schedule.district || (districts[0]?.name || 'Центральный'),
    location: schedule.location || '',
    address: schedule.address || '',
    instructor: schedule.instructor || '',
    instructorPhone: schedule.instructorPhone || '+7 (383) 227-40-00',
    date: schedule.date || '2026-09-08',
    dayOfWeek: schedule.dayOfWeek || 'ВТ',
    time: schedule.time || '10:00',
    durationMinutes: schedule.durationMinutes || 60,
    format: schedule.format || 'outdoor',
    ageGroup: schedule.ageGroup || 'Все возраста',
    targetCategory: schedule.targetCategory || 'Все',
    capacity: schedule.capacity || 25,
    enrolled: schedule.enrolled || 8,
    photo: schedule.photo || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    description: schedule.description || 'Бесплатное городское занятие с сертифицированным инструктором. Разминка, упражнения на свежем воздухе и растяжка.',
    requirements: schedule.requirements || 'Удобная спортивная одежда, кроссовки, бутылочка питьевой воды.',
    price: schedule.price || 'Бесплатно',
    isFeatured: schedule.isFeatured || false,
    status: schedule.status || 'active',
    changeNote: schedule.changeNote || ''
  });

  const [activeSection, setActiveSection] = useState<'main' | 'photo' | 'changes'>('main');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isNew = !schedule.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setErrorMessage('Укажите название занятия');
      return;
    }
    if (!formData.location?.trim()) {
      setErrorMessage('Укажите место проведения');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const now = new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      let changesHistory = [...(schedule.changesHistory || [])];
      if (formData.changeNote && formData.changeNote !== schedule.changeNote) {
        changesHistory.unshift({
          id: `chg-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: 'Администратор',
          type: 'update',
          note: formData.changeNote,
          status: formData.status
        });
      }

      await onSave({
        ...schedule,
        ...formData,
        lastModified: now,
        changesHistory
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка сохранения данных');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{isNew ? 'Добавление нового занятия' : 'Редактирование данных занятия'}</span>
              {formData.status && formData.status !== 'active' && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase">
                  {formData.status === 'cancelled' ? 'Отменено' : 'Перенесено'}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Новосибирск • Городской спорт • Все изменения мгновенно отражаются на портале
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 shrink-0">
          <button
            id="tab-edit-main"
            type="button"
            onClick={() => setActiveSection('main')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'main'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. Основные параметры
          </button>
          <button
            id="tab-edit-photo"
            type="button"
            onClick={() => setActiveSection('photo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'photo'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>2. Фотография с компьютера</span>
            {formData.photo && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          </button>
          <button
            id="tab-edit-changes"
            type="button"
            onClick={() => setActiveSection('changes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'changes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>3. Оперативные изменения</span>
            {formData.changeNote && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs flex-1">
          {/* ======================================================== */}
          {/* SECTION 1: MAIN INFO                                     */}
          {/* ======================================================== */}
          {activeSection === 'main' && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="field-schedule-title" className="block font-bold text-slate-800 mb-1">
                  Название занятия <span className="text-rose-500">*</span>
                </label>
                <input
                  id="field-schedule-title"
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Например: Утренняя городская зарядка для всех возрастов"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Sport Category & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-schedule-sport" className="block font-bold text-slate-800 mb-1">
                    Вид спорта <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="field-schedule-sport"
                    type="text"
                    required
                    value={formData.sport || ''}
                    onChange={e => setFormData({ ...formData, sport: e.target.value })}
                    placeholder="Йога, Волейбол, ОФП..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-1.5"
                  />
                  {/* Quick sport tag suggestions */}
                  <div className="flex flex-wrap gap-1">
                    {COMMON_SPORTS.slice(0, 6).map(sp => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => setFormData({ ...formData, sport: sp })}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[10px] font-semibold text-slate-600 transition-colors cursor-pointer"
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="field-schedule-district" className="block font-bold text-slate-800 mb-1">
                    Район Новосибирска <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="field-schedule-district"
                    value={formData.district || 'Центральный'}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {districts.map(d => (
                      <option key={d.id} value={d.name}>
                        {d.name} район
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Автоматически связывается с разделом «10 Районов города»
                  </p>
                </div>
              </div>

              {/* Location & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-schedule-location" className="block font-bold text-slate-800 mb-1">
                    Название спортивной площадки / объекта <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <input
                      id="field-schedule-location"
                      type="text"
                      required
                      value={formData.location || ''}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Стадион «Спартак», Центральный парк"
                      className="w-full text-xs font-medium text-slate-900 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="field-schedule-address" className="block font-bold text-slate-800 mb-1">
                    Точный адрес <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="field-schedule-address"
                    type="text"
                    required
                    value={formData.address || ''}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="ул. Мичурина, 10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Time, Day of Week, Duration, Format */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label htmlFor="field-schedule-time" className="block font-bold text-slate-800 mb-1">
                    Время начала
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <input
                      id="field-schedule-time"
                      type="text"
                      required
                      placeholder="08:30"
                      value={formData.time || ''}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                      className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="field-schedule-day" className="block font-bold text-slate-800 mb-1">
                    День недели
                  </label>
                  <select
                    id="field-schedule-day"
                    value={formData.dayOfWeek || 'ВТ'}
                    onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none"
                  >
                    {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="field-schedule-duration" className="block font-bold text-slate-800 mb-1">
                    Длительность
                  </label>
                  <select
                    id="field-schedule-duration"
                    value={formData.durationMinutes || 60}
                    onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none"
                  >
                    <option value={30}>30 минут</option>
                    <option value={45}>45 минут</option>
                    <option value={60}>60 минут (1 час)</option>
                    <option value={90}>90 минут (1.5 ч)</option>
                    <option value={120}>120 минут (2 ч)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="field-schedule-format" className="block font-bold text-slate-800 mb-1">
                    Формат локации
                  </label>
                  <select
                    id="field-schedule-format"
                    value={formData.format || 'outdoor'}
                    onChange={e => setFormData({ ...formData, format: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="outdoor">На улице (Outdoor)</option>
                    <option value="indoor">В помещении (Indoor)</option>
                  </select>
                </div>
              </div>

              {/* Instructor & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-schedule-instructor" className="block font-bold text-slate-800 mb-1">
                    Инструктор / Тренер <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white">
                    <User className="w-4 h-4 text-blue-600 shrink-0" />
                    <input
                      id="field-schedule-instructor"
                      type="text"
                      required
                      value={formData.instructor || ''}
                      onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                      placeholder="Иванов Алексей Петрович"
                      className="w-full text-xs font-semibold text-slate-900 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="field-schedule-phone" className="block font-bold text-slate-800 mb-1">
                    Телефон для записи и справок
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <input
                      id="field-schedule-phone"
                      type="text"
                      value={formData.instructorPhone || ''}
                      onChange={e => setFormData({ ...formData, instructorPhone: e.target.value })}
                      placeholder="+7 (383) 227-40-00"
                      className="w-full text-xs font-medium text-slate-900 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Age Group, Capacity, Price */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="field-schedule-age" className="block font-bold text-slate-800 mb-1">
                    Возрастная группа
                  </label>
                  <input
                    id="field-schedule-age"
                    type="text"
                    value={formData.ageGroup || 'Все возраста'}
                    onChange={e => setFormData({ ...formData, ageGroup: e.target.value })}
                    placeholder="18+, Дети, 55+..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="field-schedule-capacity" className="block font-bold text-slate-800 mb-1">
                    Вместимость (чел.)
                  </label>
                  <input
                    id="field-schedule-capacity"
                    type="number"
                    min={1}
                    max={200}
                    value={formData.capacity || 30}
                    onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="field-schedule-price" className="block font-bold text-slate-800 mb-1">
                    Стоимость
                  </label>
                  <input
                    id="field-schedule-price"
                    type="text"
                    value={formData.price || 'Бесплатно'}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description & Requirements */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="field-schedule-description" className="block font-bold text-slate-800 mb-1">
                    Описание занятия
                  </label>
                  <textarea
                    id="field-schedule-description"
                    rows={2}
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Краткое описание программы тренировки..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="field-schedule-requirements" className="block font-bold text-slate-800 mb-1">
                    Что взять с собой (инвентарь, форма)
                  </label>
                  <input
                    id="field-schedule-requirements"
                    type="text"
                    value={formData.requirements || ''}
                    onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="Удобная обувь, коврик, вода..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 2: PHOTO FROM COMPUTER (Uploader)                */}
          {/* ======================================================== */}
          {activeSection === 'photo' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900 leading-relaxed">
                  Вы можете загрузить фотографию прямо с вашего компьютера (кликните или перетащите файл мышью). Фотография будет сохранена на сервере и отобразится в карточке расписания.
                </p>
              </div>

              <SchedulePhotoUploader
                currentPhotoUrl={formData.photo || ''}
                onPhotoSelected={url => setFormData({ ...formData, photo: url })}
                token={token}
                sportCategory={formData.sport}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 3: OPERATIONAL CHANGES & STATUS                  */}
          {/* ======================================================== */}
          {activeSection === 'changes' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Статус расписания
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'active' })}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      formData.status === 'active'
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🟢 Активно
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'rescheduled' })}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      formData.status === 'rescheduled'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🟡 Перенесено
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'moved_indoor' })}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      formData.status === 'moved_indoor'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🔵 В крытый зал
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'cancelled' })}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      formData.status === 'cancelled'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🔴 Отменено
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="field-change-note" className="block font-bold text-slate-800 mb-1">
                  Оперативная пометка об изменении (отобразится пользователям на сайте)
                </label>
                <textarea
                  id="field-change-note"
                  rows={3}
                  value={formData.changeNote || ''}
                  onChange={e => setFormData({ ...formData, changeNote: e.target.value })}
                  placeholder="Например: Внимание! Тренировка 09.09 перенесена в зал из-за дождя. Начало в 18:30..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Quick Template buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 block">Быстрые шаблоны:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '🌧️ Перенос в крытый спортивный зал из-за дождя',
                    '⏰ Начало смещено на 30 минут',
                    '👤 Замена тренера-инструктора',
                    '🧘 При себе обязательно иметь гимнастический коврик',
                    '🚫 Занятие отменено по техническим причинам'
                  ].map(note => (
                    <button
                      key={note}
                      type="button"
                      onClick={() => setFormData({ ...formData, changeNote: note })}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer border border-slate-200/60"
                    >
                      {note}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Save & Cancel Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
            <button
              id="btn-cancel-schedule-edit"
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer transition-colors"
            >
              Отмена
            </button>

            <div className="flex items-center gap-2">
              {activeSection !== 'main' && (
                <button
                  type="button"
                  onClick={() => setActiveSection('main')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
                >
                  Назад к параметрам
                </button>
              )}
              <button
                id="btn-save-schedule-item"
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Сохранение...' : isNew ? 'Создать занятие' : 'Сохранить изменения'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
