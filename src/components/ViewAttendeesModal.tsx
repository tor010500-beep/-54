import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Search,
  Phone,
  MessageSquare,
  Mail,
  UserPlus,
  Download,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ChevronDown,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { ParticipantRegistration, RegistrationStatus } from '../types/index.ts';
import { ContactParticipantModal } from './ContactParticipantModal.tsx';

interface ViewAttendeesModalProps {
  targetType: 'schedule' | 'event';
  targetId: string;
  targetTitle: string;
  targetDate: string;
  targetTime: string;
  targetLocation: string;
  targetDistrict: string;
  targetSport?: string;
  capacity?: number;
  isOpen?: boolean;
  token?: string;
  onClose: () => void;
  onAttendeeCountChanged?: (newCount: number) => void;
  onRegistrationChanged?: () => void;
}

export const ViewAttendeesModal: React.FC<ViewAttendeesModalProps> = ({
  targetType,
  targetId,
  targetTitle,
  targetDate,
  targetTime,
  targetLocation,
  targetDistrict,
  targetSport,
  capacity,
  isOpen = true,
  token,
  onClose,
  onAttendeeCountChanged,
  onRegistrationChanged
}) => {
  const [attendees, setAttendees] = useState<ParticipantRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Contact Modal State
  const [contactParticipant, setContactParticipant] = useState<ParticipantRegistration | null>(null);

  // Manual Add Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCount, setNewCount] = useState('1');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Load attendees
  const fetchAttendees = async () => {
    if (!targetId) return;
    setIsLoading(true);
    try {
      const endpoint = targetType === 'schedule'
        ? `/api/schedules/${targetId}/registrations`
        : `/api/events/${targetId}/registrations`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAttendees(data);
          if (onAttendeeCountChanged) {
            const total = data.reduce((acc, curr) => acc + (curr.participantsCount || 1), 0);
            onAttendeeCountChanged(total);
          }
          return;
        }
      }
      // Fallback to generic endpoint
      const genRes = await fetch(`/api/registrations?targetType=${targetType}&targetId=${targetId}`);
      if (genRes.ok) {
        const genData = await genRes.json();
        if (Array.isArray(genData)) {
          setAttendees(genData);
        }
      }
    } catch (e) {
      console.warn('Could not fetch registrations:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAttendees();
    }
  }, [isOpen, targetId]);

  if (!isOpen) return null;

  // Calculate totals
  const totalCount = attendees.reduce((acc, r) => acc + (r.participantsCount || 1), 0);
  const fillPercentage = capacity && capacity > 0 ? Math.min(100, Math.round((totalCount / capacity) * 100)) : 0;

  // Filter attendees
  const filteredAttendees = attendees.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matches =
        a.fullName.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        (a.comment && a.comment.toLowerCase().includes(q)) ||
        (a.contactNotes && a.contactNotes.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });

  // Handle quick status change
  const handleStatusChange = async (id: string, newStatus: RegistrationStatus) => {
    try {
      await fetch(`/api/registrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setAttendees(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (e) {
      console.error(e);
    }
  };

  // Handle delete
  const handleDeleteAttendee = async (id: string) => {
    if (!window.confirm('Вы действительно хотите удалить запись этого участника?')) return;
    try {
      await fetch(`/api/registrations/${id}`, { method: 'DELETE' });
      setAttendees(prev => {
        const next = prev.filter(a => a.id !== id);
        const newTotal = next.reduce((acc, curr) => acc + (curr.participantsCount || 1), 0);
        if (onAttendeeCountChanged) onAttendeeCountChanged(newTotal);
        return next;
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Handle manual submit
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    setIsSubmittingNew(true);
    try {
      const endpoint = targetType === 'schedule'
        ? `/api/schedules/${targetId}/register`
        : `/api/events/${targetId}/register`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newName.trim(),
          phone: newPhone.trim(),
          email: newEmail.trim(),
          participantsCount: parseInt(newCount, 10) || 1,
          comment: newComment.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.registration) {
          setAttendees(prev => [data.registration, ...prev]);
        } else {
          fetchAttendees();
        }
        setShowAddForm(false);
        setNewName('');
        setNewPhone('');
        setNewEmail('');
        setNewComment('');
        setNewCount('1');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Excel export download
  const handleExportExcel = () => {
    window.open(`/api/registrations/export.xlsx?targetType=${targetType}&targetId=${targetId}`, '_blank');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center font-black">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/20 uppercase tracking-wide">
                    {targetType === 'schedule' ? 'Учет занятия' : 'Учет мероприятия'}
                  </span>
                  <span className="text-xs text-blue-200">
                    {targetDistrict}
                  </span>
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl leading-tight mt-0.5">
                  Записавшиеся: {targetTitle}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchAttendees}
                title="Обновить список"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Details Bar & Capacity Progress */}
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{targetDate} ({targetTime})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{targetLocation}</span>
                </div>
                {targetSport && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-bold text-[11px]">
                    {targetSport}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Экспорт в Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{showAddForm ? 'Скрыть форму' : '+ Записать жителя'}</span>
                </button>
              </div>
            </div>

            {/* Capacity Meter */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Заполняемость группы:</span>
                  <span className="text-blue-600 font-extrabold text-sm">{totalCount}</span>
                  {capacity ? <span>из {capacity} мест</span> : <span>человек зарегистрировано</span>}
                </span>
                {capacity && (
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                    fillPercentage >= 95
                      ? 'bg-rose-100 text-rose-800'
                      : fillPercentage >= 70
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {fillPercentage >= 100 ? 'Группа укомплектована' : `Свободно: ${Math.max(0, capacity - totalCount)} мест`}
                  </span>
                )}
              </div>

              {capacity && (
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      fillPercentage >= 95
                        ? 'bg-rose-500'
                        : fillPercentage >= 70
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Manual Add Form Drawer */}
          {showAddForm && (
            <form onSubmit={handleManualAdd} className="p-4 sm:p-5 bg-blue-50/60 border-b border-blue-200 space-y-3 animate-fadeIn shrink-0">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-blue-950 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Быстрая запись участника (по телефону или лично)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-blue-700 hover:text-blue-900 font-bold"
                >
                  Отмена
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">ФИО жителя *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Например: Иванов Иван Сергеевич"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Телефон *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="+7 (913) ..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Кол-во человек</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newCount}
                    onChange={e => setNewCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">E-mail (необязательно)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="ivanov@mail.ru"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Комментарий / пожелание</label>
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Инвентарь, уровень подготовки..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {isSubmittingNew ? 'Сохранение...' : 'Записать в список'}
                </button>
              </div>
            </form>
          )}

          {/* Search and Filters Bar */}
          <div className="p-4 bg-white border-b border-slate-200 flex flex-col gap-3 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Поиск по имени, телефону, комментарию..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Counter summary */}
              <div className="text-xs text-slate-500 font-medium">
                Показано: <strong className="text-slate-900">{filteredAttendees.length}</strong> из <strong className="text-slate-900">{totalCount}</strong> участников
              </div>
            </div>

            {/* Status Filter Tabs with dynamic counts */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              {[
                { id: 'all', label: 'Все', count: attendees.length },
                { id: 'confirmed', label: 'Подтвержден', count: attendees.filter(a => a.status === 'confirmed').length },
                { id: 'pending', label: 'Ожидает', count: attendees.filter(a => a.status === 'pending').length },
                { id: 'attended', label: 'Присутствовал', count: attendees.filter(a => a.status === 'attended').length },
                { id: 'cancelled', label: 'Отменен', count: attendees.filter(a => a.status === 'cancelled').length }
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === st.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{st.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    statusFilter === st.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {st.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Attendees List Table / Cards */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <span className="text-sm font-semibold">Загрузка списка записавшихся...</span>
              </div>
            ) : filteredAttendees.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-base">Записавшихся пока нет</h4>
                <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1">
                  {search || statusFilter !== 'all'
                    ? 'По указанным фильтрам ничего не найдено.'
                    : 'Жители могут записаться через форму на портале, либо вы можете добавить участника вручную кнопкой выше.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAttendees.map((att, idx) => {
                  const cleanPhone = att.phone.replace(/\D/g, '');
                  const formattedPhone = cleanPhone.startsWith('8')
                    ? '7' + cleanPhone.slice(1)
                    : cleanPhone.startsWith('7')
                    ? cleanPhone
                    : '7' + cleanPhone;

                  return (
                    <div
                      key={att.id || idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left side: Avatar + info */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <span className="text-[10px] font-black text-slate-400">#{idx + 1}</span>
                          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-sm shadow-2xs">
                            {att.fullName.substring(0, 2).toUpperCase()}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm truncate">
                              {att.fullName}
                            </span>
                            {att.participantsCount > 1 && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px]">
                                +{att.participantsCount - 1} чел.
                              </span>
                            )}
                            {/* Status badge */}
                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                              att.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : att.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : att.status === 'attended'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {att.status === 'confirmed' ? 'Подтвержден' :
                               att.status === 'pending' ? 'Ожидает' :
                               att.status === 'attended' ? 'Присутствовал' : 'Отменен'}
                            </span>
                          </div>

                          {/* Contact Details */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="font-semibold text-slate-700">{att.phone}</span>
                            {att.email && <span>{att.email}</span>}
                            <span>Записан: {new Date(att.registeredAt).toLocaleDateString('ru-RU')}</span>
                          </div>

                          {/* Comment or contact notes */}
                          {att.comment && (
                            <div className="text-xs text-amber-900 bg-amber-50/80 p-2 rounded-xl border border-amber-200/50 mt-1.5">
                              <strong>Комментарий: </strong>{att.comment}
                            </div>
                          )}

                          {att.contactNotes && (
                            <div className="text-xs text-blue-900 bg-blue-50/70 p-2 rounded-xl border border-blue-200/50 mt-1.5">
                              <strong>Заметка по связи: </strong>{att.contactNotes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side: Action tools */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Status select */}
                        <select
                          value={att.status}
                          onChange={e => handleStatusChange(att.id, e.target.value as RegistrationStatus)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none cursor-pointer"
                        >
                          <option value="confirmed">Подтвержден</option>
                          <option value="pending">Ожидает</option>
                          <option value="attended">Присутствовал</option>
                          <option value="cancelled">Отменен</option>
                        </select>

                        {/* Direct Call */}
                        <a
                          href={`tel:${att.phone}`}
                          title="Позвонить участнику"
                          className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        {/* Direct WhatsApp */}
                        <a
                          href={`https://wa.me/${formattedPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Написать в WhatsApp"
                          className="w-8 h-8 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        {/* Comprehensive Contact Modal Opener */}
                        <button
                          type="button"
                          onClick={() => setContactParticipant(att)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Связаться</span>
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteAttendee(att.id)}
                          title="Удалить запись"
                          className="w-8 h-8 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500 font-semibold">
              Всего в списке: <strong className="text-slate-900">{filteredAttendees.length}</strong> человек
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Закрыть список
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modal: Contact Participant */}
      {contactParticipant && (
        <ContactParticipantModal
          registration={contactParticipant}
          isOpen={!!contactParticipant}
          onClose={() => setContactParticipant(null)}
          onUpdateRegistration={(updated) => {
            setAttendees(prev => prev.map(a => a.id === updated.id ? updated : a));
          }}
        />
      )}
    </>
  );
};
