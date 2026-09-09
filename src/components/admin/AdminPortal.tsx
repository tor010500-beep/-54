import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Upload,
  Image as ImageIcon,
  Building2,
  MapPin,
  Newspaper,
  Users,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Archive,
  Download,
  RotateCcw,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Eye,
  Layers,
  ArrowRight,
  Zap,
  Camera,
  Clock
} from 'lucide-react';
import {
  ScheduleItem,
  SportsVenue,
  District,
  NewsItem,
  MediaItem,
  ImportHistoryItem,
  ImportPreviewResult,
  ImportRow
} from '../../types/index.ts';
import { ScheduleEditModal } from './ScheduleEditModal.tsx';
import { ScheduleChangeModal } from './ScheduleChangeModal.tsx';
import { NewsEditModal } from './NewsEditModal.tsx';
import { INITIAL_NEWS, INITIAL_SCHEDULES, INITIAL_LOCATIONS, INITIAL_DISTRICTS } from '../../data/initialData.ts';

interface AdminPortalProps {
  onClose: () => void;
  token: string;
  onLogout: () => void;
  onDataChanged: () => void;
}

type AdminTab = 'schedules' | 'import' | 'media' | 'venues' | 'districts' | 'news' | 'users' | 'settings';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onClose,
  token,
  onLogout,
  onDataChanged
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('schedules');
  const [stats, setStats] = useState({
    schedulesCount: 0,
    districtsCount: 10,
    venuesCount: 0,
    mediaCount: 0,
    lastUpdate: '08.09.2026'
  });

  // Data collections
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [venues, setVenues] = useState<SportsVenue[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([]);
  const [settings, setSettings] = useState<any>({
    portalName: 'СПОРТИВНЫЙ ГОРОД 54',
    city: 'Новосибирск',
    contactPhone: '+7 (383) 227-40-00',
    contactEmail: 'sport54@novo-sibirsk.ru'
  });

  // Selection for bulk schedule actions
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleFilterDistrict, setScheduleFilterDistrict] = useState('Все');

  // Modals state
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Partial<ScheduleItem> | null>(null);
  const [scheduleForChanges, setScheduleForChanges] = useState<ScheduleItem | null>(null);
  const [isChangesModalOpen, setIsChangesModalOpen] = useState(false);
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);

  // News management state
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsSearch, setNewsSearch] = useState('');
  const [newsFilterCategory, setNewsFilterCategory] = useState('Все');

  // Import Engine State
  const [importStep, setImportStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreviewResult | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [isImportLoading, setIsImportLoading] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Media Library state
  const [mediaFolder, setMediaFolder] = useState<string>('all');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaMessage, setMediaMessage] = useState<string | null>(null);

  // Fetch all initial admin data
  const refreshAdminData = async () => {
    try {
      const [schRes, venRes, distRes, newsRes, medRes, histRes, stRes, setRes] = await Promise.allSettled([
        fetch('/api/schedules'),
        fetch('/api/locations'),
        fetch('/api/districts'),
        fetch('/api/news?all=true'),
        fetch('/api/media'),
        fetch('/api/import/history', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/stats'),
        fetch('/api/settings')
      ]);

      if (schRes.status === 'fulfilled' && schRes.value.ok) {
        const d = await schRes.value.json().catch(() => null);
        if (d && Array.isArray(d) && d.length > 0) setSchedules(d);
        else {
          const saved = localStorage.getItem('nsk_sport54_schedules');
          setSchedules(saved ? JSON.parse(saved) : INITIAL_SCHEDULES);
        }
      } else {
        const saved = localStorage.getItem('nsk_sport54_schedules');
        setSchedules(saved ? JSON.parse(saved) : INITIAL_SCHEDULES);
      }

      if (venRes.status === 'fulfilled' && venRes.value.ok) {
        const d = await venRes.value.json().catch(() => null);
        if (d && Array.isArray(d) && d.length > 0) setVenues(d);
        else {
          const saved = localStorage.getItem('nsk_sport54_venues');
          setVenues(saved ? JSON.parse(saved) : INITIAL_LOCATIONS);
        }
      } else {
        const saved = localStorage.getItem('nsk_sport54_venues');
        setVenues(saved ? JSON.parse(saved) : INITIAL_LOCATIONS);
      }

      if (distRes.status === 'fulfilled' && distRes.value.ok) {
        const d = await distRes.value.json().catch(() => null);
        if (d && Array.isArray(d) && d.length > 0) setDistricts(d);
        else {
          const saved = localStorage.getItem('nsk_sport54_districts');
          setDistricts(saved ? JSON.parse(saved) : INITIAL_DISTRICTS);
        }
      } else {
        const saved = localStorage.getItem('nsk_sport54_districts');
        setDistricts(saved ? JSON.parse(saved) : INITIAL_DISTRICTS);
      }
      if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
        const d = await newsRes.value.json().catch(() => null);
        if (d) {
          setNewsList(d);
          try { localStorage.setItem('nsk_sport54_news', JSON.stringify(d)); } catch {}
        }
      } else {
        try {
          const saved = localStorage.getItem('nsk_sport54_news');
          if (saved) {
            setNewsList(JSON.parse(saved));
          } else {
            setNewsList(INITIAL_NEWS);
          }
        } catch {
          setNewsList(INITIAL_NEWS);
        }
      }
      if (medRes.status === 'fulfilled' && medRes.value.ok) {
        const d = await medRes.value.json().catch(() => null);
        if (d) setMediaList(d);
      }
      if (histRes.status === 'fulfilled' && histRes.value.ok) {
        const d = await histRes.value.json().catch(() => null);
        if (d) setImportHistory(d);
      }
      if (stRes.status === 'fulfilled' && stRes.value.ok) {
        const d = await stRes.value.json().catch(() => null);
        if (d) setStats(d);
      }
      if (setRes.status === 'fulfilled' && setRes.value.ok) {
        const d = await setRes.value.json().catch(() => null);
        if (d) setSettings(d);
      }
    } catch (e) {
      console.warn('Note: using local cached data for admin', e);
    }
  };

  useEffect(() => {
    refreshAdminData();
  }, [token]);

  // News Actions
  const handleOpenAddNews = () => {
    setEditingNews(null);
    setIsNewsModalOpen(true);
  };

  const handleOpenEditNews = (item: NewsItem) => {
    setEditingNews(item);
    setIsNewsModalOpen(true);
  };

  const handleSaveNews = async (itemData: Partial<NewsItem>) => {
    try {
      if (editingNews?.id) {
        // Edit existing
        const res = await fetch(`/api/news/${editingNews.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(itemData)
        }).catch(() => null);

        let updatedItem: NewsItem;
        if (res && res.ok) {
          updatedItem = await res.json();
        } else {
          updatedItem = { ...(editingNews as NewsItem), ...itemData } as NewsItem;
        }

        const nextList = newsList.map(n => n.id === updatedItem.id ? updatedItem : n);
        setNewsList(nextList);
        try { localStorage.setItem('nsk_sport54_news', JSON.stringify(nextList)); } catch {}
      } else {
        // Create new
        const res = await fetch('/api/news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(itemData)
        }).catch(() => null);

        let createdItem: NewsItem;
        if (res && res.ok) {
          createdItem = await res.json();
        } else {
          createdItem = {
            id: 'news-' + Date.now(),
            views: 1,
            isPublished: true,
            date: new Date().toLocaleDateString('ru-RU'),
            author: 'Пресс-служба портала Спортивный Город 54',
            summary: itemData.summary || itemData.content?.slice(0, 120) + '...',
            preview: itemData.summary || itemData.content?.slice(0, 120) + '...',
            ...itemData
          } as NewsItem;
        }

        const nextList = [createdItem, ...newsList];
        setNewsList(nextList);
        try { localStorage.setItem('nsk_sport54_news', JSON.stringify(nextList)); } catch {}
      }
      onDataChanged();
      setEditingNews(null);
      setIsNewsModalOpen(false);
    } catch (err) {
      console.error('Failed to save news:', err);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту новость?')) return;
    try {
      await fetch(`/api/news/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => null);

      const nextList = newsList.filter(n => n.id !== id);
      setNewsList(nextList);
      try { localStorage.setItem('nsk_sport54_news', JSON.stringify(nextList)); } catch {}
      onDataChanged();
    } catch (err) {
      console.error('Failed to delete news:', err);
    }
  };

  const handleTogglePublishNews = async (item: NewsItem) => {
    try {
      const newStatus = !item.isPublished;
      await fetch(`/api/news/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: newStatus })
      }).catch(() => null);

      const nextList = newsList.map(n => n.id === item.id ? { ...n, isPublished: newStatus } : n);
      setNewsList(nextList);
      try { localStorage.setItem('nsk_sport54_news', JSON.stringify(nextList)); } catch {}
      onDataChanged();
    } catch (err) {
      console.error('Failed to toggle news status:', err);
    }
  };

  // ==========================================
  // SCHEDULE CRUD ACTIONS
  // ==========================================
  const handleSaveSchedule = async (scheduleData: Partial<ScheduleItem>) => {
    try {
      const isNew = !scheduleData.id;
      const url = isNew ? '/api/schedules' : `/api/schedules/${scheduleData.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(scheduleData)
      });

      if (res.ok) {
        setIsEditScheduleOpen(false);
        setEditingSchedule(null);
        await refreshAdminData();
        onDataChanged();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка при сохранении данных занятия');
      }
    } catch (err: any) {
      alert(`Ошибка сохранения: ${err.message}`);
      throw err;
    }
  };

  const handleSaveScheduleChanges = async (updatedSchedule: ScheduleItem) => {
    try {
      const res = await fetch(`/api/schedules/${updatedSchedule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedSchedule)
      });

      if (res.ok) {
        setIsChangesModalOpen(false);
        setScheduleForChanges(null);
        await refreshAdminData();
        onDataChanged();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка сохранения оперативных изменений');
      }
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
      throw err;
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это занятие?')) return;
    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await refreshAdminData();
        onDataChanged();
      }
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedScheduleIds.length === 0) return;
    try {
      const res = await fetch('/api/schedules/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedScheduleIds })
      });
      if (res.ok) {
        setSelectedScheduleIds([]);
        setConfirmBulkDeleteOpen(false);
        await refreshAdminData();
        onDataChanged();
      }
    } catch (err: any) {
      alert(`Ошибка массового удаления: ${err.message}`);
    }
  };

  // Filtered schedules for admin table
  const adminFilteredSchedules = schedules.filter(s => {
    if (scheduleFilterDistrict !== 'Все' && s.district !== scheduleFilterDistrict) return false;
    if (scheduleSearch) {
      const q = scheduleSearch.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.instructor.toLowerCase().includes(q) ||
        s.sport.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ==========================================
  // IMPORT ENGINE ACTIONS
  // ==========================================
  const handleFileUpload = async (file: File) => {
    setIsImportLoading(true);
    setImportError(null);
    setImportFile(file);
    setImportFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    const isWord = file.name.endsWith('.docx');
    const endpoint = isWord ? '/api/import/word' : '/api/import/excel';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка анализа файла');
      }

      const data = await res.json();
      setImportPreview(data.preview);
      setImportStep(2); // Move to recognition / column mapping step
    } catch (err: any) {
      setImportError(err.message);
    } finally {
      setIsImportLoading(false);
    }
  };

  const handleDownloadSampleExcel = async (e?: React.MouseEvent, type: 'sample' | 'empty' = 'sample') => {
    if (e) e.preventDefault();
    try {
      const endpoint = type === 'empty' ? '/api/import/template-empty.xlsx' : '/api/import/sample-excel.xlsx';
      const fileName = type === 'empty' ? 'Shablon_raspisaniya_Novosibirsk.xlsx' : 'Obrazets_raspisaniya_Novosibirsk.xlsx';
      
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Ошибка загрузки файла с сервера');
      const blob = await res.blob();
      
      // Explicit Excel MIME type
      const excelBlob = new Blob([blob], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const downloadUrl = window.URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 2000);
    } catch (err: any) {
      window.open(type === 'empty' ? '/api/import/template-empty.xlsx' : '/api/import/sample-excel.xlsx', '_blank');
    }
  };

  const handleExportSchedulesExcel = async () => {
    try {
      const res = await fetch('/api/schedules/export.xlsx');
      if (!res.ok) throw new Error('Ошибка формирования файла экспорта');
      const blob = await res.blob();
      const excelBlob = new Blob([blob], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const downloadUrl = window.URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const today = new Date().toISOString().slice(0, 10);
      link.download = `Raspisanie_Novosibirsk_${today}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 2000);
    } catch (err: any) {
      window.open('/api/schedules/export.xlsx', '_blank');
    }
  };

  const handleTestSampleExcel = async () => {
    setIsImportLoading(true);
    try {
      const res = await fetch('/api/import/sample-excel.xlsx');
      const blob = await res.blob();
      const file = new File([blob], 'Obrazets_raspisaniya_Novosibirsk.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      await handleFileUpload(file);
    } catch (e: any) {
      setImportError(`Ошибка загрузки образца: ${e.message}`);
      setIsImportLoading(false);
    }
  };

  const handlePublishImport = async () => {
    if (!importPreview) return;
    setIsImportLoading(true);

    try {
      const res = await fetch('/api/import/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rows: importPreview.rows,
          filename: importFileName
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка публикации');
      }

      const result = await res.json();
      setImportStep(5);
      setImportSuccessMessage(`Успешно опубликовано ${result.publishedCount} занятий на портале!`);
      await refreshAdminData();
      onDataChanged();
    } catch (err: any) {
      setImportError(`Ошибка публикации: ${err.message}`);
    } finally {
      setIsImportLoading(false);
    }
  };

  const handleRollback = async (historyId: string) => {
    if (!confirm('Вы действительно хотите вернуть расписание к состоянию этого снимка? Текущие занятия будут заменены.')) {
      return;
    }

    try {
      const res = await fetch(`/api/import/rollback/${historyId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка отката');
      }

      alert('Расписание успешно возвращено к выбранной версии!');
      await refreshAdminData();
      onDataChanged();
    } catch (err: any) {
      alert(`Ошибка отката: ${err.message}`);
    }
  };

  // ==========================================
  // MEDIA UPLOADS & ZIP PROCESSING
  // ==========================================
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    setMediaMessage(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setMediaMessage(`Загружено изображений: ${data.count}. Файлы автоматически распределены по папкам.`);
        await refreshAdminData();
      }
    } catch (err: any) {
      alert(`Ошибка загрузки: ${err.message}`);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    setMediaMessage(null);

    const formData = new FormData();
    formData.append('zip', file);

    try {
      const res = await fetch('/api/media/zip', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setMediaMessage(data.message || `ZIP успешно распакован! Добавлено ${data.count} изображений.`);
        await refreshAdminData();
      }
    } catch (err: any) {
      alert(`Ошибка распаковки: ${err.message}`);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col animate-fade-in overflow-hidden">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">
            54
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight">Панель управления</h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                Администратор
              </span>
            </div>
            <span className="text-xs text-slate-400">СПОРТИВНЫЙ ГОРОД 54 • Новосибирск</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            ← Вернуться на сайт
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Выйти</span>
          </button>
        </div>
      </header>

      {/* Main Layout: Sidebar Tabs + Content Area */}
      <div className="flex-1 flex overflow-hidden bg-slate-100">
        {/* Sidebar Nav */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Управление порталом
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('schedules')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'schedules'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Расписание занятий</span>
              <span className={`ml-auto text-[11px] px-2 py-0.5 rounded-full ${
                activeTab === 'schedules' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {schedules.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('import')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'import'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Upload className="w-4 h-4 text-emerald-500" />
              <span>Импорт Excel / Word</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                NEW
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Медиатека и ZIP</span>
              <span className="ml-auto text-[11px] text-slate-400">
                {mediaList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('venues')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'venues'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Спортивные объекты</span>
              <span className="ml-auto text-[11px] text-slate-400">
                {venues.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('districts')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'districts'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>10 Районов города</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('news')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>Новости и события</span>
              <span className="ml-auto text-[11px] text-slate-400">
                {newsList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Настройки портала</span>
            </button>
          </div>

          {/* Bottom Quick Metrics */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div className="font-bold text-slate-700">Статистика портала</div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Занятий:</span>
              <strong className="text-slate-900">{stats.schedulesCount}</strong>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Районов:</span>
              <strong className="text-slate-900">10 из 10</strong>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Обновление:</span>
              <strong className="text-blue-600">{stats.lastUpdate}</strong>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* ======================================================== */}
          {/* TAB 1: SCHEDULES MANAGEMENT                              */}
          {/* ======================================================== */}
          {activeTab === 'schedules' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Расписание занятий</h2>
                  <p className="text-xs text-slate-500">
                    Управление тренировками во всех районах Новосибирска. Всего: {schedules.length}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleExportSchedulesExcel}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-all cursor-pointer shadow-xs"
                    title="Выгрузить все текущие занятия базы в таблицу Excel (.xlsx)"
                  >
                    <Download className="w-4 h-4" />
                    <span>Экспорт в Excel (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={e => handleDownloadSampleExcel(e, 'sample')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200 transition-all cursor-pointer shadow-xs"
                    title="Скачать эталонный образец таблицы с примерами занятий в формате Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Образец Excel (.xlsx)</span>
                  </button>

                  {selectedScheduleIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setConfirmBulkDeleteOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Удалить выбранные ({selectedScheduleIds.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingSchedule({
                        title: '',
                        sport: 'Йога',
                        district: 'Центральный',
                        location: 'Парк культуры',
                        address: 'Красный проспект, 1',
                        instructor: 'Иванов И.И.',
                        date: '2026-09-08',
                        dayOfWeek: 'ВТ',
                        time: '10:00',
                        ageGroup: 'Все возраста',
                        format: 'outdoor',
                        photo: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
                        price: 'Бесплатно'
                      });
                      setIsEditScheduleOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Добавить занятие</span>
                  </button>
                </div>
              </div>

              {/* Summary Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">Всего занятий</span>
                    <span className="text-xl font-black text-slate-900">{schedules.length}</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">С фотографиями</span>
                    <span className="text-xl font-black text-slate-900">
                      {schedules.filter(s => Boolean(s.photo)).length}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">С изменениями</span>
                    <span className="text-xl font-black text-amber-600">
                      {schedules.filter(s => Boolean(s.changeNote) || (s.status && s.status !== 'active')).length}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">Районов охвата</span>
                    <span className="text-xl font-black text-slate-900">10 из 10</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Filters & Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    id="input-admin-search-schedules"
                    type="text"
                    value={scheduleSearch}
                    onChange={e => setScheduleSearch(e.target.value)}
                    placeholder="Поиск по названию, тренеру, спорту, адресу..."
                    className="w-full text-xs font-medium bg-transparent focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Район:</span>
                    <select
                      id="select-admin-filter-district"
                      value={scheduleFilterDistrict}
                      onChange={e => setScheduleFilterDistrict(e.target.value)}
                      className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 focus:outline-none"
                    >
                      <option value="Все">Все 10 районов</option>
                      {districts.map(d => (
                        <option key={d.id} value={d.name}>{d.name} район</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedScheduleIds.length > 0 && selectedScheduleIds.length === adminFilteredSchedules.length}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedScheduleIds(adminFilteredSchedules.map(s => s.id));
                              } else {
                                setSelectedScheduleIds([]);
                              }
                            }}
                          />
                        </th>
                        <th className="py-3 px-3 w-14">Фото</th>
                        <th className="py-3 px-4 whitespace-nowrap">Время / День</th>
                        <th className="py-3 px-4">Занятие</th>
                        <th className="py-3 px-4">Спорт</th>
                        <th className="py-3 px-4">Локация / Адрес</th>
                        <th className="py-3 px-4">Инструктор</th>
                        <th className="py-3 px-4">Статус и изменения</th>
                        <th className="py-3 px-4 text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminFilteredSchedules.map(item => {
                        const isCancelled = item.status === 'cancelled';
                        const isRescheduled = item.status === 'rescheduled';
                        const isIndoorMoved = item.status === 'moved_indoor';

                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isCancelled ? 'bg-rose-50/30' : isRescheduled ? 'bg-amber-50/20' : ''
                            }`}
                          >
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedScheduleIds.includes(item.id)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedScheduleIds([...selectedScheduleIds, item.id]);
                                  } else {
                                    setSelectedScheduleIds(selectedScheduleIds.filter(id => id !== item.id));
                                  }
                                }}
                              />
                            </td>

                            {/* Photo Thumbnail */}
                            <td className="py-3 px-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSchedule(item);
                                  setIsEditScheduleOpen(true);
                                }}
                                className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group shrink-0 cursor-pointer block"
                                title="Кликните, чтобы изменить фото"
                              >
                                {item.photo ? (
                                  <img
                                    src={item.photo}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <ImageIcon className="w-5 h-5" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Camera className="w-3.5 h-3.5" />
                                </div>
                              </button>
                            </td>

                            {/* Time & Day */}
                            <td className="py-3 px-4 font-bold text-blue-600 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                <span>{item.time}</span>
                              </div>
                              <span className="text-[11px] font-semibold text-slate-500 pl-5 block">
                                {item.dayOfWeek}, {item.durationMinutes || 60} мин
                              </span>
                            </td>

                            {/* Title & Age */}
                            <td className="py-3 px-4 max-w-xs">
                              <div className="font-bold text-slate-900 leading-snug line-clamp-2">
                                {item.title}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  item.format === 'outdoor' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {item.format === 'outdoor' ? 'Улица' : 'Зал'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {item.ageGroup}
                                </span>
                              </div>
                            </td>

                            {/* Sport */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-100">
                                {item.sport}
                              </span>
                            </td>

                            {/* District & Location */}
                            <td className="py-3 px-4 text-slate-600 max-w-xs">
                              <div className="font-bold text-slate-900">
                                {item.district} р-н
                              </div>
                              <div className="text-[11px] text-slate-500 truncate" title={`${item.location} (${item.address})`}>
                                {item.location} • {item.address}
                              </div>
                            </td>

                            {/* Instructor */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-semibold text-slate-800">{item.instructor}</div>
                              {item.instructorPhone && (
                                <div className="text-[10px] text-slate-400">{item.instructorPhone}</div>
                              )}
                            </td>

                            {/* Status & Operational Notice */}
                            <td className="py-3 px-4 max-w-xs">
                              <div className="space-y-1">
                                {isCancelled ? (
                                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px] uppercase inline-block">
                                    🔴 Отменено
                                  </span>
                                ) : isRescheduled ? (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] uppercase inline-block">
                                    🟡 Перенесено
                                  </span>
                                ) : isIndoorMoved ? (
                                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px] uppercase inline-block">
                                    🔵 В зал
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px] inline-block">
                                    🟢 По графику
                                  </span>
                                )}

                                {item.changeNote && (
                                  <div
                                    className="text-[10px] font-semibold text-amber-900 bg-amber-50/90 border border-amber-200/80 p-1.5 rounded-lg flex items-start gap-1 leading-tight line-clamp-2"
                                    title={item.changeNote}
                                  >
                                    <Zap className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                                    <span>{item.changeNote}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Row Actions */}
                            <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                              {/* Quick Change button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setScheduleForChanges(item);
                                  setIsChangesModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                                title="Внести оперативное изменение в это занятие"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-600" />
                                <span>Изменение</span>
                              </button>

                              {/* Full Edit button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSchedule(item);
                                  setIsEditScheduleOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                                title="Редактировать данные и загрузить фото"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Правка</span>
                              </button>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteSchedule(item.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
                                title="Удалить занятие"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: IMPORT ENGINE (Excel & Word)                      */}
          {/* ======================================================== */}
          {activeTab === 'import' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Импорт расписания (Excel и Word)</h2>
                <p className="text-xs text-slate-500">
                  Загружайте файлы расписаний от инструкторов без необходимости ручного ввода. Система автоматически распознает колонки, нормализует названия и подсветит ошибки.
                </p>
              </div>

              {/* 5-Step Stepper Header */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 grid grid-cols-5 gap-2 text-center text-xs font-bold">
                {[
                  { num: 1, title: 'Загрузка файла' },
                  { num: 2, title: 'Распознавание колонок' },
                  { num: 3, title: 'Валидация ошибок' },
                  { num: 4, title: 'Предпросмотр (Diff)' },
                  { num: 5, title: 'Публикация' }
                ].map(step => (
                  <div
                    key={step.num}
                    className={`py-2 px-1 rounded-xl transition-colors ${
                      importStep === step.num
                        ? 'bg-blue-600 text-white'
                        : importStep > step.num
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-400 bg-slate-50'
                    }`}
                  >
                    <span className="block text-sm font-black">{step.num}</span>
                    <span className="truncate block">{step.title}</span>
                  </div>
                ))}
              </div>

              {/* STEP 1: Upload Zone */}
              {importStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors text-center relative group">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.docx"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Перетащите сюда файл Excel (.xlsx, .xls) или Word (.docx)
                      </h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Поддерживаются любые стандартные таблицы расписания. Колонки будут автоматически сопоставлены.
                      </p>
                      <div className="pt-2">
                        <span className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md">
                          Выбрать файл на компьютере
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Test Download (.xlsx) & Direct Load */}
                  <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-emerald-50 border border-sky-200/90 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                    <div className="flex items-start gap-3.5 max-w-xl">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-sky-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">Готовый образец таблицы Excel (.xlsx)</h4>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                            .XLSX
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Содержит корректные колонки и реальные примеры занятий (йога, футбол, волейбол, плавание) по всем 10 районам Новосибирска. Скачайте для заполнения своих данных или проверки.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                      <a
                        href="/api/import/sample-excel.xlsx"
                        download="Obrazets_raspisaniya_Novosibirsk.xlsx"
                        onClick={e => handleDownloadSampleExcel(e, 'sample')}
                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-slate-400 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                        title="Скачать файл с примерами в формате Microsoft Excel (.xlsx)"
                      >
                        <Download className="w-4 h-4 text-emerald-600" />
                        <span>Скачать образец (.xlsx)</span>
                      </a>

                      <a
                        href="/api/import/template-empty.xlsx"
                        download="Shablon_raspisaniya_Novosibirsk.xlsx"
                        onClick={e => handleDownloadSampleExcel(e, 'empty')}
                        className="px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200 text-slate-600 hover:bg-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        title="Скачать чистую таблицу с заголовками колонок (.xlsx)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                        <span>Чистый шаблон (.xlsx)</span>
                      </a>

                      <button
                        type="button"
                        onClick={handleTestSampleExcel}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all"
                      >
                        <span>Загрузить в 1 клик</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {importError && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{importError}</span>
                    </div>
                  )}

                  {/* Import History / Rollback section */}
                  {importHistory.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-blue-600" />
                        <span>История импортов и функция отката (Rollback)</span>
                      </h4>
                      <div className="divide-y divide-slate-100">
                        {importHistory.slice(0, 5).map(item => (
                          <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                            <div>
                              <div className="font-bold text-slate-900">{item.filename}</div>
                              <div className="text-slate-400">
                                {new Date(item.timestamp).toLocaleString('ru')} • Автор: {item.author} • Добавлено: {item.rowsCount} занятий
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRollback(item.id)}
                              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 transition-colors cursor-pointer"
                            >
                              Откатить к этой версии
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Recognition & Column Mapping */}
              {importStep === 2 && importPreview && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Распознавание колонок: {importFileName}</h3>
                      <p className="text-xs text-slate-500">
                        Проверьте правильность сопоставления колонок из файла со структурой базы данных.
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold">
                      Строк в файле: {importPreview.totalRows}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {importPreview.columnsFound.map(col => (
                      <div key={col} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Колонка в файле:</span>
                        <div className="font-bold text-sm text-slate-900 truncate">{col}</div>
                        <div className="pt-1">
                          <span className="text-[10px] text-slate-400 block mb-0.5">Привязана к полю:</span>
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">
                            {importPreview.columnMapping[col] || 'Не распознано'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setImportStep(1)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      ← Назад к загрузке
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportStep(3)}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Перейти к проверке ошибок</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Error Highlighting & Validation */}
              {importStep === 3 && importPreview && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Проверка валидности строк</h3>
                      <p className="text-xs text-slate-500">
                        Красным подсвечены критические ошибки (отсутствует дата/время), оранжевым — предупреждения (нестандартный район или спорт).
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                        Корректных: {importPreview.validRows}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800">
                        Ошибок: {importPreview.errorRows}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800">
                        Предупреждений: {importPreview.warningRows}
                      </span>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {importPreview.rows.map((row, idx) => {
                      const hasError = row.errors.some(e => e.severity === 'error');
                      const hasWarning = row.errors.some(e => e.severity === 'warning');

                      return (
                        <div
                          key={row.id}
                          className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            hasError
                              ? 'bg-rose-50/60 border-rose-200'
                              : hasWarning
                              ? 'bg-amber-50/60 border-amber-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-500">#{idx + 1}</span>
                              <span className="font-extrabold text-blue-600">{row.normalized.time || '—'}</span>
                              <span className="font-bold text-slate-900">{row.normalized.title}</span>
                              <span className="px-2 py-0.5 rounded bg-white text-slate-700 font-semibold text-[11px]">
                                {row.normalized.sport}
                              </span>
                              <span className="text-slate-500">({row.normalized.district || 'Район не указан'})</span>
                            </div>

                            {/* Errors list */}
                            {row.errors.length > 0 && (
                              <div className="space-y-0.5 pt-1">
                                {row.errors.map((err, eIdx) => (
                                  <div
                                    key={eIdx}
                                    className={`flex items-center gap-1 font-semibold text-[11px] ${
                                      err.severity === 'error' ? 'text-rose-600' : 'text-amber-700'
                                    }`}
                                  >
                                    {err.severity === 'error' ? (
                                      <AlertCircle className="w-3 h-3 shrink-0" />
                                    ) : (
                                      <AlertTriangle className="w-3 h-3 shrink-0" />
                                    )}
                                    <span>{err.message}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {hasError ? (
                              <button
                                type="button"
                                onClick={() => {
                                  // Auto-fix row by supplying current date and default time
                                  row.normalized.date = row.normalized.date || '2026-09-08';
                                  row.normalized.time = row.normalized.time || '10:00';
                                  row.errors = [];
                                  row.isValid = true;
                                  setImportPreview({ ...importPreview });
                                }}
                                className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700"
                              >
                                Исправить авто
                              </button>
                            ) : (
                              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Готово
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setImportStep(2)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      ← Назад
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportStep(4)}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Предпросмотр Diff</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Diff Preview */}
              {importStep === 4 && importPreview && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-bold text-slate-900">Предпросмотр изменений в базе (Diff)</h3>
                    <p className="text-xs text-slate-500">
                      Перед публикацией проверьте баланс изменений в расписании.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <span className="text-xs uppercase font-bold text-emerald-700 block">Будет добавлено</span>
                      <span className="text-3xl font-black">{importPreview.diff.added}</span>
                      <span className="text-xs block text-emerald-600 mt-1">Новых занятий в расписании</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900">
                      <span className="text-xs uppercase font-bold text-blue-700 block">Будет обновлено</span>
                      <span className="text-3xl font-black">{importPreview.diff.updated}</span>
                      <span className="text-xs block text-blue-600 mt-1">Существующих занятий</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800">
                      <span className="text-xs uppercase font-bold text-slate-500 block">Точка отката</span>
                      <span className="text-sm font-bold block mt-1">Автоматический снимок</span>
                      <span className="text-xs block text-slate-400">Сохраняется для отката в 1 клик</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setImportStep(3)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      ← Назад
                    </button>
                    <button
                      type="button"
                      onClick={handlePublishImport}
                      disabled={isImportLoading}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>🚀 ОПУБЛИКОВАТЬ РАСПИСАНИЕ</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Success Message */}
              {importStep === 5 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Расписание успешно обновлено!</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    {importSuccessMessage || 'Данные опубликованы и сразу видны жителям Новосибирска на главной странице.'}
                  </p>
                  <div className="pt-4 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setImportStep(1);
                        setImportFile(null);
                        setImportPreview(null);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                    >
                      Загрузить другой файл
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('schedules')}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700"
                    >
                      Смотреть список занятий
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: MEDIA LIBRARY & ZIP                               */}
          {/* ======================================================== */}
          {activeTab === 'media' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Медиатека портала</h2>
                  <p className="text-xs text-slate-500">
                    Загрузка отдельных фото или целого ZIP архива. Авто-распаковка и распознавание видов спорта и районов по названиям файлов.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Upload Images Button */}
                  <label className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-slate-50 cursor-pointer">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Загрузить фото (JPG/PNG)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Upload ZIP Button */}
                  <label className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer">
                    <Archive className="w-4 h-4" />
                    <span>Загрузить ZIP архив</span>
                    <input
                      type="file"
                      accept=".zip"
                      onChange={handleZipUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {mediaMessage && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{mediaMessage}</span>
                </div>
              )}

              {/* Media Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaList.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group">
                    <div className="relative h-36 bg-slate-900 overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-sm">
                        {item.folder}
                      </div>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="font-bold text-xs text-slate-800 truncate" title={item.fileName}>
                          {item.fileName}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.detectedSport && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                              {item.detectedSport}
                            </span>
                          )}
                          {item.detectedDistrict && (
                            <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold">
                              {item.detectedDistrict}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{(item.sizeBytes / 1024).toFixed(0)} КБ</span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-bold"
                        >
                          Открыть
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: VENUES MANAGEMENT                                 */}
          {/* ======================================================== */}
          {activeTab === 'venues' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Спортивные объекты Новосибирска</h2>
                  <p className="text-xs text-slate-500">Стадионы, манежи, бассейны и парковые площадки. Всего: {venues.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues.map(venue => (
                  <div key={venue.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="relative h-40 bg-slate-900">
                      <img src={venue.photo} alt={venue.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] font-bold">
                        {venue.district}
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-slate-900 text-base">{venue.name}</h4>
                      <p className="text-xs text-slate-500">{venue.address}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {venue.sports.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: DISTRICTS MANAGEMENT                              */}
          {/* ======================================================== */}
          {activeTab === 'districts' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">10 Районов Новосибирска</h2>
                <p className="text-xs text-slate-500">
                  Описания, ключевые площадки и количество активных тренировок в каждом районе.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {districts.map(d => (
                  <div key={d.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4">
                    <img src={d.photo} alt={d.name} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-base">{d.name}</h4>
                        <span className="text-xs font-bold text-blue-600">{d.schedulesCount} занятий</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{d.description}</p>
                      <div className="text-[11px] text-slate-400">
                        Локации: {d.keyVenues.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: NEWS MANAGEMENT                                   */}
          {/* ======================================================== */}
          {activeTab === 'news' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Новости и события спорта</h2>
                  <p className="text-xs text-slate-500">Публикация городских новостей, анонсов соревнований, фестивалей и мастер-классов.</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddNews}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer self-start sm:self-auto transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить новость</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newsSearch}
                    onChange={e => setNewsSearch(e.target.value)}
                    placeholder="Поиск по заголовку, категории или автору..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-500 outline-hidden"
                  />
                  {newsSearch && (
                    <button
                      type="button"
                      onClick={() => setNewsSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={newsFilterCategory}
                    onChange={e => setNewsFilterCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white outline-hidden cursor-pointer"
                  >
                    <option value="Все">Все рубрики</option>
                    <option value="Городской спорт">Городской спорт</option>
                    <option value="Инфраструктура">Инфраструктура</option>
                    <option value="Соревнования">Соревнования</option>
                    <option value="Детский спорт">Детский спорт</option>
                    <option value="Воркаут & ЗОЖ">Воркаут & ЗОЖ</option>
                    <option value="Анонсы мероприятий">Анонсы мероприятий</option>
                  </select>
                </div>
              </div>

              {/* News Items List */}
              {(() => {
                const filtered = newsList.filter(item => {
                  const matchesSearch = !newsSearch || 
                    item.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
                    item.summary?.toLowerCase().includes(newsSearch.toLowerCase()) ||
                    item.author?.toLowerCase().includes(newsSearch.toLowerCase()) ||
                    item.category?.toLowerCase().includes(newsSearch.toLowerCase());
                  
                  const matchesCategory = newsFilterCategory === 'Все' || item.category === newsFilterCategory;
                  return matchesSearch && matchesCategory;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                        <Newspaper className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">Новости не найдены</h4>
                      <p className="text-xs text-slate-500 mb-4">Попробуйте изменить параметры поиска или добавьте первую публикацию.</p>
                      <button
                        type="button"
                        onClick={handleOpenAddNews}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs inline-flex items-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Добавить новость</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filtered.map(item => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-colors shadow-xs"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <img
                            src={item.photo}
                            alt={item.title}
                            className="w-24 h-20 rounded-xl object-cover shrink-0 bg-slate-100"
                          />
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="font-bold text-blue-600 uppercase tracking-wide">
                                {item.category || 'Городской спорт'}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500 font-medium">{item.date}</span>
                              {item.district && item.district !== 'Все районы' && (
                                <>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-600 font-medium">{item.district}</span>
                                </>
                              )}
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {item.summary || item.preview || item.content?.slice(0, 140)}
                            </p>
                            {item.author && (
                              <div className="text-[11px] text-slate-400 pt-0.5">
                                Автор: {item.author}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          {/* Publish status toggle */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublishNews(item)}
                            title="Нажмите, чтобы изменить статус публикации"
                            className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                              item.isPublished !== false
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                          >
                            {item.isPublished !== false ? 'Опубликовано' : 'Черновик'}
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditNews(item)}
                            title="Редактировать новость"
                            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteNews(item.id)}
                            title="Удалить новость"
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: SETTINGS                                          */}
          {/* ======================================================== */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Настройки городского портала</h2>
                <p className="text-xs text-slate-500">Параметры интеграций, контакты и сезон расписания.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Название портала</label>
                  <input
                    type="text"
                    value={settings.portalName}
                    onChange={e => setSettings({ ...settings, portalName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Город</label>
                  <input
                    type="text"
                    value={settings.city}
                    onChange={e => setSettings({ ...settings, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Телефон горячей линии</label>
                  <input
                    type="text"
                    value={settings.contactPhone}
                    onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Контактный Email</label>
                  <input
                    type="text"
                    value={settings.contactEmail}
                    onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => alert('Настройки успешно сохранены!')}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold cursor-pointer hover:bg-blue-700"
                >
                  Сохранить настройки
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT SCHEDULE (Full Data & Photo Upload)    */}
      {/* ======================================================== */}
      {isEditScheduleOpen && editingSchedule && (
        <ScheduleEditModal
          schedule={editingSchedule}
          districts={districts}
          token={token}
          isOpen={isEditScheduleOpen}
          onClose={() => {
            setIsEditScheduleOpen(false);
            setEditingSchedule(null);
          }}
          onSave={handleSaveSchedule}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL: OPERATIONAL CHANGE TO SCHEDULE                    */}
      {/* ======================================================== */}
      {isChangesModalOpen && scheduleForChanges && (
        <ScheduleChangeModal
          schedule={scheduleForChanges}
          isOpen={isChangesModalOpen}
          onClose={() => {
            setIsChangesModalOpen(false);
            setScheduleForChanges(null);
          }}
          onSave={handleSaveScheduleChanges}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRM BULK DELETE                               */}
      {/* ======================================================== */}
      {confirmBulkDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Вы уверены?</h3>
            <p className="text-xs text-slate-600">
              Это действие безвозвратно удалит <strong>{selectedScheduleIds.length}</strong> выбранных занятий из базы данных.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmBulkDeleteOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Да, удалить
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ======================================================== */}
      {/* MODAL: NEWS EDIT / CREATE                                */}
      {/* ======================================================== */}
      {isNewsModalOpen && (
        <NewsEditModal
          isOpen={isNewsModalOpen}
          newsItem={editingNews}
          onClose={() => {
            setIsNewsModalOpen(false);
            setEditingNews(null);
          }}
          onSave={handleSaveNews}
        />
      )}
    </div>
  );
};
