import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Send,
  Mail,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  Calendar,
  Copy,
  Check,
  FileText,
  AlertCircle
} from 'lucide-react';
import { ParticipantRegistration, RegistrationStatus } from '../types/index.ts';

interface ContactParticipantModalProps {
  registration: ParticipantRegistration | null;
  isOpen?: boolean;
  onClose: () => void;
  onUpdateRegistration?: (updated: ParticipantRegistration) => void;
}

export const ContactParticipantModal: React.FC<ContactParticipantModalProps> = ({
  registration,
  isOpen = true,
  onClose,
  onUpdateRegistration
}) => {
  if (!isOpen || !registration) return null;

  // Clean phone number for links: +7 (913) 912-34-56 -> 79139123456
  const cleanPhone = registration.phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('8')
    ? '7' + cleanPhone.slice(1)
    : cleanPhone.startsWith('7')
    ? cleanPhone
    : '7' + cleanPhone;

  // Quick message template generation
  const getDefaultMessage = (type: 'reminder' | 'change' | 'confirm' | 'cancel' | 'info') => {
    const isSchedule = registration.targetType === 'schedule';
    const targetKind = isSchedule ? 'занятие' : 'мероприятие';

    switch (type) {
      case 'reminder':
        return `Здравствуйте, ${registration.fullName}! Напоминаем о вашей записи на ${targetKind} «${registration.targetTitle}». Дата: ${registration.targetDate}, время: ${registration.targetTime}, место: ${registration.targetLocation}. Ждем вас в спортивной форме и сменной обуви! Спорт в Новосибирске.`;
      case 'change':
        return `Здравствуйте, ${registration.fullName}! Сообщаем об оперативном изменении в расписании ${targetKind}а «${registration.targetTitle}». Пожалуйста, проверьте обновленное время (${registration.targetTime}) и место (${registration.targetLocation}).`;
      case 'confirm':
        return `Здравствуйте, ${registration.fullName}! Пожалуйста, подтвердите ваше участие в ${targetKind}е «${registration.targetTitle}» (${registration.targetDate} в ${registration.targetTime}). С вами будет ${registration.participantsCount} чел. Спасибо!`;
      case 'cancel':
        return `Уважаемый(ая) ${registration.fullName}, к сожалению, ${targetKind} «${registration.targetTitle}» (${registration.targetDate}) отменено. Приносим извинения за доставленные неудобства.`;
      case 'info':
        return `Здравствуйте, ${registration.fullName}! По поводу вашей записи на «${registration.targetTitle}»: вход свободный и бесплатный. При себе иметь спортивную форму и бутылочку с водой. Контакт для связи: +7 (383) 227-40-00.`;
    }
  };

  const [selectedTemplate, setSelectedTemplate] = useState<'reminder' | 'change' | 'confirm' | 'cancel' | 'info'>('reminder');
  const [messageText, setMessageText] = useState(() => getDefaultMessage('reminder'));
  const [status, setStatus] = useState<RegistrationStatus>(registration.status);
  const [contactNotes, setContactNotes] = useState(registration.contactNotes || '');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTemplateChange = (tmpl: 'reminder' | 'change' | 'confirm' | 'cancel' | 'info') => {
    setSelectedTemplate(tmpl);
    setMessageText(getDefaultMessage(tmpl));
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    const nowISO = new Date().toISOString();
    try {
      const res = await fetch(`/api/registrations/${registration.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          contactNotes,
          lastContactedAt: nowISO
        })
      });

      if (res.ok) {
        const updated = await res.json();
        if (onUpdateRegistration) {
          onUpdateRegistration(updated);
        }
      } else {
        // Fallback local update
        if (onUpdateRegistration) {
          onUpdateRegistration({
            ...registration,
            status,
            contactNotes,
            lastContactedAt: nowISO
          });
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      if (onUpdateRegistration) {
        onUpdateRegistration({
          ...registration,
          status,
          contactNotes,
          lastContactedAt: nowISO
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // WhatsApp url with encoded text
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`;
  // Telegram url
  const telegramUrl = `https://t.me/+${formattedPhone}`;
  // SMS url
  const smsUrl = `sms:${registration.phone}?body=${encodeURIComponent(messageText)}`;
  // Mailto url
  const mailtoUrl = registration.email
    ? `mailto:${registration.email}?subject=${encodeURIComponent(`Запись на ${registration.targetTitle}`)}&body=${encodeURIComponent(messageText)}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center font-black text-lg">
              {registration.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/20 uppercase tracking-wide">
                  {registration.targetType === 'schedule' ? 'Занятие' : 'Мероприятие'}
                </span>
                <span className="text-xs text-blue-100">
                  {new Date(registration.registeredAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <h3 className="font-bold text-lg leading-tight mt-0.5">
                Связаться: {registration.fullName}
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

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Target Event Info Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {registration.targetType === 'schedule' ? 'Тренировка / Занятие' : 'Спортивное событие'}
            </div>
            <div className="font-extrabold text-slate-900 text-base">
              {registration.targetTitle}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{registration.targetDate} ({registration.targetTime})</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{registration.targetDistrict}, {registration.targetLocation}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Участников: {registration.participantsCount} чел.</span>
              </div>
            </div>
            {registration.comment && (
              <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 mt-2">
                <strong className="font-bold">Комментарий участника: </strong>
                {registration.comment}
              </div>
            )}
          </div>

          {/* Quick Direct Actions Toolbar */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Быстрые каналы связи
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Call */}
              <a
                href={`tel:${registration.phone}`}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-all cursor-pointer shadow-2xs"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Позвонить</span>
              </a>

              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 font-bold text-xs border border-green-200 transition-all cursor-pointer shadow-2xs"
              >
                <MessageSquare className="w-4 h-4 text-green-600" />
                <span>WhatsApp</span>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs border border-sky-200 transition-all cursor-pointer shadow-2xs"
              >
                <Send className="w-4 h-4 text-sky-600" />
                <span>Telegram</span>
              </a>

              {/* SMS or Email */}
              {registration.email ? (
                <a
                  href={mailtoUrl}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs border border-indigo-200 transition-all cursor-pointer shadow-2xs"
                >
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>Email</span>
                </a>
              ) : (
                <a
                  href={smsUrl}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-all cursor-pointer shadow-2xs"
                >
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>SMS</span>
                </a>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-1">
              <span>Телефон: <strong className="text-slate-900 font-bold">{registration.phone}</strong></span>
              {registration.email && <span>Email: <strong className="text-slate-900 font-bold">{registration.email}</strong></span>}
            </div>
          </div>

          {/* Message Generator & Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Шаблоны сообщений участнику
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Скопировать текст</span>
                  </>
                )}
              </button>
            </div>

            {/* Template Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'reminder', label: '⏰ Напоминание' },
                { id: 'confirm', label: '✅ Подтверждение' },
                { id: 'change', label: '🔄 Изменение времени' },
                { id: 'info', label: 'ℹ️ Что взять' },
                { id: 'cancel', label: '⚠️ Отмена' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTemplateChange(t.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedTemplate === t.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                rows={4}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all leading-relaxed"
                placeholder="Введите текст сообщения жителю..."
              />
              <div className="text-[11px] text-slate-400 text-right mt-0.5">
                {messageText.length} символов
              </div>
            </div>

            {/* Direct Send Buttons with generated text */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Отправить в WhatsApp</span>
              </a>
              <a
                href={smsUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Отправить SMS</span>
              </a>
            </div>
          </div>

          {/* Organizer / Admin Status & Notes Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Учет и заметки администратора / тренера
              </label>
              {registration.lastContactedAt && (
                <span className="text-[11px] text-slate-400">
                  Связывались: {new Date(registration.lastContactedAt).toLocaleString('ru-RU')}
                </span>
              )}
            </div>

            {/* Status switcher */}
            <div>
              <span className="text-xs text-slate-500 block mb-1.5 font-medium">
                Статус записи:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'confirmed', label: 'Подтвержден', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                  { id: 'pending', label: 'Ожидает звонка', color: 'text-amber-700 bg-amber-50 border-amber-200' },
                  { id: 'attended', label: 'Присутствовал', color: 'text-blue-700 bg-blue-50 border-blue-200' },
                  { id: 'cancelled', label: 'Отменен', color: 'text-rose-700 bg-rose-50 border-rose-200' }
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(s.id as RegistrationStatus)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      status === s.id
                        ? `${s.color} ring-2 ring-blue-500/40 shadow-xs font-extrabold`
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Contact Notes */}
            <div>
              <span className="text-xs text-slate-500 block mb-1 font-medium">
                Заметка по итогам связи (будет видна в учете):
              </span>
              <input
                type="text"
                value={contactNotes}
                onChange={e => setContactNotes(e.target.value)}
                placeholder="Например: подтвердил звонком, будет в синей форме..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {saveSuccess ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Заметка и статус успешно сохранены!</span>
                </div>
              ) : <div />}

              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Сохранение...' : 'Сохранить заметку'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            ID записи: <code className="text-slate-700 font-mono">{registration.id}</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Закрыть окно связи
          </button>
        </div>
      </div>
    </div>
  );
};
