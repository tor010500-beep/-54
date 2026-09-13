import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  Phone,
  Mail,
  FileText,
  Download,
  Share2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ScheduleItem, ParticipantRegistration } from '../types/index.ts';

interface ScheduleRegistrationModalProps {
  item?: ScheduleItem | null;
  schedule?: ScheduleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (reg: ParticipantRegistration) => void;
  onSuccessRegistered?: (item: ScheduleItem, reg: ParticipantRegistration) => void;
}

export const ScheduleRegistrationModal: React.FC<ScheduleRegistrationModalProps> = ({
  item: itemProp,
  schedule,
  isOpen,
  onClose,
  onSuccess,
  onSuccessRegistered
}) => {
  const item = itemProp || schedule;
  if (!isOpen || !item) return null;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [participantsCount, setParticipantsCount] = useState('1');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ registration: ParticipantRegistration; schedule: ScheduleItem } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setError('Пожалуйста, укажите имя и телефон для связи');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/schedules/${item.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          participantsCount: parseInt(participantsCount, 10) || 1,
          comment: comment.trim()
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Не удалось зарегистрироваться на занятие');
      }

      const result = await res.json();
      setSuccessData(result);

      // Save to local storage for resident's device
      try {
        const saved = localStorage.getItem('nsk_sport54_my_registrations');
        const list = saved ? JSON.parse(saved) : [];
        list.push(result.registration);
        localStorage.setItem('nsk_sport54_my_registrations', JSON.stringify(list));
      } catch {}

      if (onSuccess) {
        onSuccess(result.registration);
      }
      if (onSuccessRegistered) {
        onSuccessRegistered(result.schedule || item, result.registration);
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при отправке заявки');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate .ics calendar download
  const handleDownloadIcs = () => {
    const [year, month, day] = item.date.split('-');
    const [hour, min] = item.time.split(':');
    const startStr = `${year}${month}${day}T${hour}${min}00`;
    const endMinutes = (parseInt(hour, 10) * 60 + parseInt(min, 10)) + (item.durationMinutes || 60);
    const endH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
    const endM = String(endMinutes % 60).padStart(2, '0');
    const endStr = `${year}${month}${day}T${endH}${endM}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Спорт Новосибирск//Спортивный календарь//RU',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:sport-sch-${item.id}-${Date.now()}@sport54.nsk.ru`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${item.title}`,
      `DESCRIPTION:Тренер: ${item.instructor}. Инструктор тел: ${item.instructorPhone || '—'}. ${item.description || ''}`,
      `LOCATION:${item.location}, ${item.address}, г. Новосибирск`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Zanyatie_${item.sport}_${item.date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center font-black">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/20 uppercase tracking-wide">
                Бесплатная запись на тренировку
              </span>
              <h3 className="font-extrabold text-lg leading-tight mt-0.5 text-white">
                Запись на занятие
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {successData ? (
            /* Success Screen */
            <div className="space-y-5 text-center py-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-600/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                  Вы успешно записаны!
                </h4>
                <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
                  Ваша заявка принята и внесена в электронный список тренера. Занятие бесплатное!
                </p>
              </div>

              {/* Electronic Pass Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Электронный пропуск</span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                    Подтверждено
                  </span>
                </div>
                <div className="font-extrabold text-slate-900 text-base">
                  {item.title}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Дата и время:</span>
                    <strong className="text-slate-800 font-bold">{item.date} в {item.time} ({item.dayOfWeek})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Место:</span>
                    <strong className="text-slate-800 font-bold">{item.location}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Участник:</span>
                    <strong className="text-slate-800 font-bold">{successData.registration.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Инструктор:</span>
                    <strong className="text-slate-800 font-bold">{item.instructor}</strong>
                  </div>
                </div>

                {item.requirements && (
                  <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 mt-2">
                    <strong className="font-bold">Что взять с собой: </strong>
                    {item.requirements}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Добавить в календарь (.ics)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Workout Preview Card */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    {item.sport}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    Бесплатно
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                  {item.title}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{item.date}, {item.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{item.district}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">{item.instructor}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Ваше имя и фамилия (ФИО) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Иванова Анна Сергеевна"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Номер телефона *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+7 (913) 000-00-00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email & Participants Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Электронная почта (для напоминания)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="anna@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Сколько человек придет?
                  </label>
                  <select
                    value={participantsCount}
                    onChange={e => setParticipantsCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="1">1 человек (только я)</option>
                    <option value="2">2 человека (с другом/семьей)</option>
                    <option value="3">3 человека</option>
                    <option value="4">4 человека</option>
                    <option value="5">5 человек (группа)</option>
                  </select>
                </div>
              </div>

              {/* Comment / Questions to Trainer */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Вопрос или комментарий тренеру (необязательно)
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Например: есть ли раздевалки, впервые занимаюсь, беру личные палки..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Нажимая «Подтвердить запись», вы соглашаетесь на обработку контактных данных для уведомления о проведении тренировки и оперативных изменениях в расписании.
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Оформление записи...' : 'Подтвердить запись бесплатно'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
