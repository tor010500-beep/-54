import React, { useState } from 'react';
import { X, Save, Sparkles, Image, Tag, Calendar, User, MapPin } from 'lucide-react';
import { NewsItem } from '../../types/index.ts';

interface NewsEditModalProps {
  newsItem: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<NewsItem>) => void;
}

const PRESET_PHOTOS = [
  { label: 'Тренировка / Бег', url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Воркаут площадка', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Марафон / Город', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Бассейн / Плавание', url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Йога на траве', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Волейбол на пляже', url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Футбол / Стадион', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Зимний спорт / Лыжи', url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80' }
];

const CATEGORIES = [
  'Городской спорт',
  'Инфраструктура',
  'Соревнования',
  'Детский спорт',
  'Воркаут & ЗОЖ',
  'Мастер-классы',
  'Анонсы мероприятий'
];

const DISTRICTS = [
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

export const NewsEditModal: React.FC<NewsEditModalProps> = ({
  newsItem,
  isOpen,
  onClose,
  onSave
}) => {
  const isEditing = Boolean(newsItem?.id);

  const getTodayFormatted = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const [formData, setFormData] = useState<Partial<NewsItem>>(() => ({
    title: newsItem?.title || '',
    category: newsItem?.category || 'Городской спорт',
    summary: newsItem?.summary || newsItem?.preview || '',
    content: newsItem?.content || '',
    photo: newsItem?.photo || PRESET_PHOTOS[0].url,
    district: newsItem?.district || 'Все районы',
    date: newsItem?.date || getTodayFormatted(),
    author: newsItem?.author || 'Пресс-служба портала Спортивный Город 54',
    isPublished: newsItem?.isPublished !== false,
    views: newsItem?.views || 10
  }));

  // Update form if newsItem changes
  React.useEffect(() => {
    if (newsItem) {
      setFormData({
        title: newsItem.title || '',
        category: newsItem.category || 'Городской спорт',
        summary: newsItem.summary || newsItem.preview || '',
        content: newsItem.content || '',
        photo: newsItem.photo || PRESET_PHOTOS[0].url,
        district: newsItem.district || 'Все районы',
        date: newsItem.date || getTodayFormatted(),
        author: newsItem.author || 'Пресс-служба портала Спортивный Город 54',
        isPublished: newsItem.isPublished !== false,
        views: newsItem.views || 10
      });
    } else {
      setFormData({
        title: '',
        category: 'Городской спорт',
        summary: '',
        content: '',
        photo: PRESET_PHOTOS[0].url,
        district: 'Все районы',
        date: getTodayFormatted(),
        author: 'Пресс-служба портала Спортивный Город 54',
        isPublished: true,
        views: 10
      });
    }
  }, [newsItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Пожалуйста, укажите заголовок новости');
      return;
    }
    if (!formData.content?.trim()) {
      alert('Пожалуйста, укажите текст новости');
      return;
    }

    onSave({
      ...formData,
      preview: formData.summary,
      summary: formData.summary || formData.content?.slice(0, 140) + '...'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {isEditing ? 'Редактировать новость' : 'Добавить новость или событие'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing ? 'Обновите информацию и фото публикации' : 'Создайте новую публикацию для жителей Новосибирска'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Заголовок новости <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Например: В Октябрьском районе открылся новый спортивный кластер"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm font-semibold text-slate-900 outline-hidden transition-all"
            />
          </div>

          {/* Category & District Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                Категория
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-500 text-sm font-medium text-slate-800 outline-hidden"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Район города
              </label>
              <select
                value={formData.district}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-500 text-sm font-medium text-slate-800 outline-hidden"
              >
                {DISTRICTS.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Author Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Дата публикации
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                placeholder="09.09.2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 text-sm font-medium text-slate-800 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Автор / Источник
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                placeholder="Пресс-служба портала Спортивный Город 54"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 text-sm font-medium text-slate-800 outline-hidden"
              />
            </div>
          </div>

          {/* Summary / Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Краткое описание (лид / анонс)
            </label>
            <textarea
              rows={2}
              value={formData.summary}
              onChange={e => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Одно-два предложения, привлекающие внимание читателя в ленте новостей..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 text-sm font-medium text-slate-800 outline-hidden"
            />
          </div>

          {/* Full Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Полный текст новости <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              required
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="Подробный текст новости, расписание, цитаты организаторов и полезная информация..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 text-sm font-medium text-slate-800 outline-hidden"
            />
          </div>

          {/* Photo Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-blue-600" />
              Изображение публикации (URL)
            </label>
            <input
              type="url"
              value={formData.photo}
              onChange={e => setFormData({ ...formData, photo: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 text-sm font-mono text-slate-800 outline-hidden mb-2"
            />

            {/* Photo Presets */}
            <div className="mt-2">
              <span className="text-[11px] text-slate-500 font-semibold mb-1.5 block">
                Или выберите готовую качественную фотографию:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_PHOTOS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, photo: p.url })}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all group ${
                      formData.photo === p.url ? 'border-blue-600 ring-2 ring-blue-300' : 'border-transparent hover:opacity-90'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-14 object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-slate-900/75 text-white text-[9px] font-bold p-0.5 truncate text-center">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Published status toggle */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isPublishedToggle"
              checked={formData.isPublished}
              onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="isPublishedToggle" className="text-xs font-bold text-slate-700 cursor-pointer">
              Опубликовать на сайте сразу
            </label>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Сохранить изменения' : 'Опубликовать новость'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
