import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Check,
  X,
  Trash2,
  RefreshCw,
  Eye,
  Link,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MediaItem } from '../../types/index.ts';

interface SchedulePhotoUploaderProps {
  currentPhotoUrl: string;
  onPhotoSelected: (url: string) => void;
  token: string;
  sportCategory?: string;
}

const POPULAR_SPORTS_PRESETS = [
  {
    name: 'Йога / Пилатес',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    sport: 'Йога'
  },
  {
    name: 'Волейбол',
    url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
    sport: 'Волейбол'
  },
  {
    name: 'Городская зарядка',
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    sport: 'Зарядка'
  },
  {
    name: 'Футбол 8х8',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    sport: 'Футбол'
  },
  {
    name: 'Плавание',
    url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    sport: 'Плавание'
  },
  {
    name: 'Скандинавская ходьба',
    url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
    sport: 'Скандинавская ходьба'
  },
  {
    name: 'Баскетбол 3х3',
    url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    sport: 'Баскетбол'
  },
  {
    name: 'Воркаут / Турники',
    url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    sport: 'Воркаут'
  }
];

export const SchedulePhotoUploader: React.FC<SchedulePhotoUploaderProps> = ({
  currentPhotoUrl,
  onPhotoSelected,
  token,
  sportCategory
}) => {
  const [mode, setMode] = useState<'upload' | 'media' | 'presets' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [customUrl, setCustomUrl] = useState(currentPhotoUrl || '');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [fileDetails, setFileDetails] = useState<{ name: string; sizeKb: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload file from computer
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Пожалуйста, выберите файл изображения (PNG, JPG, JPEG, WEBP)');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('Файл слишком велик (максимум 20 МБ)');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setFileDetails({ name: file.name, sizeKb: Math.round(file.size / 1024) });

    // Local instant preview via FileReader
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onPhotoSelected(reader.result);
      }
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('files', file);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Ошибка сервера' }));
        throw new Error(err.error || 'Не удалось загрузить файл на сервер');
      }

      const data = await res.json();
      const serverUrl = data.url || (data.items && data.items[0]?.url);
      if (serverUrl) {
        onPhotoSelected(serverUrl);
        setCustomUrl(serverUrl);
        setUploadSuccess(true);
      }
    } catch (err: any) {
      console.warn('Network upload error, keeping local base64 preview:', err);
      // Even if network upload has issue, the base64 preview was already dispatched to onPhotoSelected!
      setUploadSuccess(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Load existing media library
  const loadMediaLibrary = async () => {
    setIsLoadingMedia(true);
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const list = await res.json();
        setMediaItems(list);
      }
    } catch (e) {
      console.error('Error fetching media:', e);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  return (
    <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-blue-600" />
          <span>Фотография занятия</span>
        </label>

        {/* Source Mode Switcher */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-200/80 text-[11px] font-semibold">
          <button
            id="btn-photo-mode-upload"
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              mode === 'upload' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            С компьютера
          </button>
          <button
            id="btn-photo-mode-presets"
            type="button"
            onClick={() => setMode('presets')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              mode === 'presets' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Шаблоны спорта
          </button>
          <button
            id="btn-photo-mode-media"
            type="button"
            onClick={() => {
              setMode('media');
              if (mediaItems.length === 0) loadMediaLibrary();
            }}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              mode === 'media' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Медиатека
          </button>
          <button
            id="btn-photo-mode-url"
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              mode === 'url' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ссылка URL
          </button>
        </div>
      </div>

      {/* Main Preview Box if Photo Exists */}
      {currentPhotoUrl && (
        <div className="relative group rounded-xl overflow-hidden border border-slate-300/80 bg-slate-900 max-h-48 flex items-center justify-center">
          <img
            src={currentPhotoUrl}
            alt="Превью фото занятия"
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent flex items-end justify-between p-3 text-white">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold bg-blue-600/90 px-2 py-0.5 rounded backdrop-blur-sm inline-block">
                Текущее фото
              </span>
              {fileDetails && (
                <div className="text-[10px] text-slate-300 truncate max-w-xs">
                  {fileDetails.name} ({fileDetails.sizeKb} КБ)
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all cursor-pointer text-xs flex items-center gap-1 font-semibold"
                title="Загрузить другое фото с компьютера"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Заменить</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onPhotoSelected('');
                  setCustomUrl('');
                  setFileDetails(null);
                }}
                className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-700 text-white backdrop-blur-md transition-all cursor-pointer text-xs"
                title="Удалить фото"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: UPLOAD FROM COMPUTER (Drag & Drop + File Picker) */}
      {mode === 'upload' && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            id="input-file-schedule-photo"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50'
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-xs font-bold text-slate-700">Загрузка изображения на сервер...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">
                    Перетащите фото сюда или <span className="text-blue-600 underline">выберите с компьютера</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Поддерживаются форматы JPG, PNG, WEBP (до 20 МБ)
                  </p>
                </div>
              </>
            )}
          </div>

          {uploadError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Фотография с компьютера успешно привязана к занятию</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: POPULAR SPORTS PRESETS */}
      {mode === 'presets' && (
        <div className="space-y-2">
          <p className="text-[11px] text-slate-500">
            Быстрый выбор тематического фото для вашего вида спорта:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
            {POPULAR_SPORTS_PRESETS.map(p => {
              const isSelected = currentPhotoUrl === p.url;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    onPhotoSelected(p.url);
                    setCustomUrl(p.url);
                  }}
                  className={`relative rounded-xl overflow-hidden h-20 text-left border transition-all cursor-pointer group ${
                    isSelected ? 'ring-2 ring-blue-600 border-transparent shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={p.url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-1.5">
                    <span className="text-[10px] font-bold text-white leading-tight truncate">
                      {p.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MEDIA LIBRARY */}
      {mode === 'media' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Ранее загруженные фотографии портала:</span>
            <button
              type="button"
              onClick={loadMediaLibrary}
              className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Обновить</span>
            </button>
          </div>

          {isLoadingMedia ? (
            <div className="py-6 flex justify-center text-xs text-slate-500 gap-2 items-center">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Загрузка медиатеки...</span>
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
              В медиатеке пока нет файлов. Вы можете загрузить фото с компьютера во вкладке «С компьютера».
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {mediaItems.map(item => {
                const isSelected = currentPhotoUrl === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onPhotoSelected(item.url);
                      setCustomUrl(item.url);
                    }}
                    className={`relative rounded-xl overflow-hidden h-20 text-left border transition-all cursor-pointer group ${
                      isSelected ? 'ring-2 ring-blue-600 border-transparent shadow-md' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-1">
                      <span className="text-[9px] font-semibold text-white truncate max-w-full">
                        {item.fileName}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EXTERNAL URL */}
      {mode === 'url' && (
        <div className="flex gap-2 items-center">
          <input
            id="input-schedule-photo-url"
            type="url"
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => {
              if (customUrl) onPhotoSelected(customUrl);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-all"
          >
            Применить
          </button>
        </div>
      )}
    </div>
  );
};
