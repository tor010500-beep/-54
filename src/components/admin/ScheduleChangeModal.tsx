import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  History,
  MessageSquare,
  Sparkles,
  Zap,
  Info,
  Calendar
} from 'lucide-react';
import { ScheduleItem, ScheduleChangeRecord } from '../../types/index.ts';

interface ScheduleChangeModalProps {
  schedule: ScheduleItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSchedule: ScheduleItem) => Promise<void>;
}

const COMMON_CHANGE_TEMPLATES = [
  {
    title: '🌧️ Перенос в зал из-за дождя',
    note: 'Внимание! Из-за неблагоприятных погодных условий тренировка перенесена в крытый спортивный зал. При себе иметь сменную обувь.',
    status: 'moved_indoor' as const
  },
  {
    title: '⏰ Сдвиг времени начала',
    note: 'Время начала занятия перенесено на 30 минут позже. Сбор участников в назначенном месте.',
    status: 'rescheduled' as const
  },
  {
    title: '👤 Замена тренера-инструктора',
    note: 'Сегодня занятие проведёт сертифицированный тренер-дублёр. Программа остаётся без изменений.',
    status: 'active' as const
  },
  {
    title: '🧘 С собой: коврики и вода',
    note: 'Напоминание: для тренировки на траве желательно иметь собственный коврик и питьевую воду.',
    status: 'active' as const
  },
  {
    title: '🚫 Занятие отменено',
    note: 'Внимание! Занятие отменено по техническим причинам. Приносим извинения за неудобства.',
    status: 'cancelled' as const
  }
];

export const ScheduleChangeModal: React.FC<ScheduleChangeModalProps> = ({
  schedule,
  isOpen,
  onClose,
  onSave
}) => {
  const [status, setStatus] = useState<'active' | 'rescheduled' | 'cancelled' | 'moved_indoor'>(
    schedule.status || 'active'
  );
  const [changeNote, setChangeNote] = useState<string>(schedule.changeNote || '');
  const [newTime, setNewTime] = useState<string>(schedule.time);
  const [newLocation, setNewLocation] = useState<string>(schedule.location);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    try {
      const now = new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Construct change record
      const newRecord: ScheduleChangeRecord = {
        id: `chg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        author: 'Администратор',
        type: status === 'cancelled' ? 'cancellation' : status === 'rescheduled' ? 'reschedule' : 'update',
        note: changeNote || (status === 'cancelled' ? 'Занятие отменено' : 'Обновлены данные занятия'),
        status
      };

      const updated: ScheduleItem = {
        ...schedule,
        status,
        changeNote: changeNote.trim(),
        time: newTime.trim() || schedule.time,
        location: newLocation.trim() || schedule.location,
        lastModified: now,
        changesHistory: [newRecord, ...(schedule.changesHistory || [])]
      };

      await onSave(updated);
      onClose();
    } catch (err: any) {
      setSaveError(err.message || 'Ошибка сохранения изменений');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearNotice = async () => {
    if (!confirm('Очистить оперативное изменение и вернуть расписание в штатный режим?')) return;
    setIsSaving(true);
    try {
      const now = new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const updated: ScheduleItem = {
        ...schedule,
        status: 'active',
        changeNote: '',
        lastModified: now,
        changesHistory: [
          {
            id: `chg-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: 'Администратор',
            type: 'general',
            note: 'Оперативная пометка снята, занятие проводится штатно',
            status: 'active'
          },
          ...(schedule.changesHistory || [])
        ]
      };
      await onSave(updated);
      onClose();
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Zap className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Оперативное изменение в расписании
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Занятие: <strong className="text-slate-800">{schedule.title}</strong> ({schedule.district} р-н, {schedule.time})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Status selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">
              Статус занятия
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  status === 'active'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🟢 Активно
              </button>
              <button
                type="button"
                onClick={() => setStatus('rescheduled')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  status === 'rescheduled'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🟡 Перенесено
              </button>
              <button
                type="button"
                onClick={() => setStatus('moved_indoor')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  status === 'moved_indoor'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🔵 В зал / под навес
              </button>
              <button
                type="button"
                onClick={() => setStatus('cancelled')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  status === 'cancelled'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🔴 Отменено
              </button>
            </div>
          </div>

          {/* Change Note Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="input-change-note" className="font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Текст изменения для участников (будет отображаться в карточке):</span>
              </label>
            </div>
            <textarea
              id="input-change-note"
              rows={3}
              value={changeNote}
              onChange={e => setChangeNote(e.target.value)}
              placeholder="Например: Занятие перенесено в крытый манеж из-за грозы. Начало в 18:30..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Quick Preset Templates */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-500 text-[11px] block">
              Быстрые шаблоны частых ситуаций:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CHANGE_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setChangeNote(tmpl.note);
                    setStatus(tmpl.status);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-all text-[11px] cursor-pointer border border-slate-200/80"
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Adjusted Time & Place if rescheduled */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Время проведения
              </label>
              <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-slate-200">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <input
                  type="text"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  placeholder="08:30"
                  className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Место / Локация
              </label>
              <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-slate-200">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  placeholder="Стадион, сквер, зал..."
                  className="w-full text-xs font-semibold text-slate-900 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* History of past changes */}
          {schedule.changesHistory && schedule.changesHistory.length > 0 && (
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 text-[11px]">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>История изменений этого занятия ({schedule.changesHistory.length}):</span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                {schedule.changesHistory.map(rec => (
                  <div key={rec.id} className="text-[11px] bg-white p-2 rounded-lg border border-slate-100 flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-800">{rec.note}</span>
                      <div className="text-[10px] text-slate-400">
                        {rec.author} • {new Date(rec.timestamp).toLocaleString('ru-RU')}
                      </div>
                    </div>
                    {rec.status && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                        rec.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                        rec.status === 'rescheduled' ? 'bg-amber-100 text-amber-800' :
                        rec.status === 'moved_indoor' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {rec.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {saveError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {schedule.changeNote ? (
              <button
                type="button"
                onClick={handleClearNotice}
                className="px-3 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-colors"
              >
                Снять пометку
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Сохранение...' : 'Применить изменение'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
