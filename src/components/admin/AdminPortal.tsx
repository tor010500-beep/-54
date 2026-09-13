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
  Clock,
  Trophy,
  Award,
  Sparkles,
  MessageSquare,
  Phone,
  Mail,
  Send,
  UserCheck,
  UserX,
  Menu
} from 'lucide-react';
import {
  ScheduleItem,
  SportsVenue,
  District,
  NewsItem,
  MediaItem,
  ImportHistoryItem,
  ImportPreviewResult,
  ImportRow,
  SportEventItem,
  ParticipantRegistration,
  RegistrationStatus
} from '../../types/index.ts';
import { ScheduleEditModal } from './ScheduleEditModal.tsx';
import { ScheduleChangeModal } from './ScheduleChangeModal.tsx';
import { NewsEditModal } from './NewsEditModal.tsx';
import { EventEditModal } from './EventEditModal.tsx';
import { ViewAttendeesModal } from '../ViewAttendeesModal.tsx';
import { ContactParticipantModal } from '../ContactParticipantModal.tsx';
import { INITIAL_NEWS, INITIAL_SCHEDULES, INITIAL_LOCATIONS, INITIAL_DISTRICTS, INITIAL_EVENTS, INITIAL_REGISTRATIONS } from '../../data/initialData.ts';

interface AdminPortalProps {
  onClose: () => void;
  token: string;
  onLogout: () => void;
  onDataChanged: () => void;
}

type AdminTab = 'schedules' | 'events' | 'registrations' | 'import' | 'media' | 'venues' | 'districts' | 'news' | 'users' | 'settings';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onClose,
  token,
  onLogout,
  onDataChanged
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('schedules');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mainViewMode, setMainViewMode] = useState<'auto' | 'cards' | 'table'>('auto');
  const [stats, setStats] = useState({
    schedulesCount: 0,
    districtsCount: 10,
    venuesCount: 0,
    mediaCount: 0,
    lastUpdate: '08.09.2026'
  });

  // Data collections
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [eventsList, setEventsList] = useState<SportEventItem[]>([]);
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

  // Modals state for schedules
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Partial<ScheduleItem> | null>(null);
  const [scheduleForChanges, setScheduleForChanges] = useState<ScheduleItem | null>(null);
  const [isChangesModalOpen, setIsChangesModalOpen] = useState(false);
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);

  // Events management state
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [eventSearch, setEventSearch] = useState('');
  const [eventFilterDistrict, setEventFilterDistrict] = useState('Все');
  const [eventFilterStatus, setEventFilterStatus] = useState('Все');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<SportEventItem> | null>(null);
  const [confirmBulkDeleteEventsOpen, setConfirmBulkDeleteEventsOpen] = useState(false);

  // News management state
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsSearch, setNewsSearch] = useState('');
  const [newsFilterCategory, setNewsFilterCategory] = useState('Все');

  // Registrations management state (Учет записавшихся)
  const [registrationsList, setRegistrationsList] = useState<ParticipantRegistration[]>([]);
  const [regSearch, setRegSearch] = useState('');
  const [regFilterType, setRegFilterType] = useState<'all' | 'schedule' | 'event'>('all');
  const [regFilterDistrict, setRegFilterDistrict] = useState('Все');
  const [regFilterStatus, setRegFilterStatus] = useState('all');
  const [selectedRegIds, setSelectedRegIds] = useState<string[]>([]);
  const [confirmBulkDeleteRegsOpen, setConfirmBulkDeleteRegsOpen] = useState(false);

  // Modal for viewing attendees of a single schedule or event
  const [viewingAttendeesFor, setViewingAttendeesFor] = useState<{
    targetType: 'schedule' | 'event';
    targetId: string;
    targetTitle: string;
    targetDate: string;
    targetTime: string;
    targetLocation: string;
    targetDistrict: string;
    targetSport?: string;
    capacity?: number;
  } | null>(null);

  // Modal for contacting participant
  const [contactingRegistration, setContactingRegistration] = useState<ParticipantRegistration | null>(null);

  // Manual registration dialog
  const [isManualAddRegOpen, setIsManualAddRegOpen] = useState(false);
  const [manualRegData, setManualRegData] = useState({
    targetType: 'schedule' as 'schedule' | 'event',
    targetId: '',
    fullName: '',
    phone: '',
    email: '',
    participantsCount: 1,
    comment: ''
  });

  // Import Engine State
  const [importTarget, setImportTarget] = useState<'schedules' | 'events'>('schedules');
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
      const [schRes, venRes, distRes, newsRes, medRes, histRes, stRes, setRes, evRes, regRes] = await Promise.allSettled([
        fetch('/api/schedules'),
        fetch('/api/locations'),
        fetch('/api/districts'),
        fetch('/api/news?all=true'),
        fetch('/api/media'),
        fetch('/api/import/history', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/stats'),
        fetch('/api/settings'),
        fetch('/api/events'),
        fetch('/api/registrations')
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
      if (evRes.status === 'fulfilled' && evRes.value.ok) {
        const d = await evRes.value.json().catch(() => null);
        if (d && Array.isArray(d)) {
          setEventsList(d);
          try { localStorage.setItem('nsk_sport54_events', JSON.stringify(d)); } catch {}
        }
      } else {
        try {
          const saved = localStorage.getItem('nsk_sport54_events');
          if (saved) setEventsList(JSON.parse(saved));
          else setEventsList(INITIAL_EVENTS);
        } catch {
          setEventsList(INITIAL_EVENTS);
        }
      }

      if (regRes.status === 'fulfilled' && regRes.value.ok) {
        const d = await regRes.value.json().catch(() => null);
        if (d && Array.isArray(d)) {
          setRegistrationsList(d);
          try { localStorage.setItem('nsk_sport54_registrations', JSON.stringify(d)); } catch {}
        }
      } else {
        try {
          const saved = localStorage.getItem('nsk_sport54_registrations');
          if (saved) setRegistrationsList(JSON.parse(saved));
          else setRegistrationsList(INITIAL_REGISTRATIONS);
        } catch {
          setRegistrationsList(INITIAL_REGISTRATIONS);
        }
      }
    } catch (e) {
      console.warn('Note: using local cached data for admin', e);
    }
  };

  // Filtered registrations for admin view
  const adminFilteredRegistrations = registrationsList.filter(reg => {
    if (regFilterType !== 'all' && reg.targetType !== regFilterType) return false;
    if (regFilterDistrict !== 'Все' && reg.targetDistrict !== regFilterDistrict) return false;
    if (regFilterStatus !== 'all' && reg.status !== regFilterStatus) return false;
    if (regSearch.trim()) {
      const q = regSearch.toLowerCase().trim();
      const match =
        reg.fullName.toLowerCase().includes(q) ||
        reg.phone.toLowerCase().includes(q) ||
        (reg.email && reg.email.toLowerCase().includes(q)) ||
        reg.targetTitle.toLowerCase().includes(q) ||
        (reg.targetLocation && reg.targetLocation.toLowerCase().includes(q)) ||
        (reg.comment && reg.comment.toLowerCase().includes(q)) ||
        (reg.contactNotes && reg.contactNotes.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleUpdateRegStatus = async (id: string, status: RegistrationStatus) => {
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setRegistrationsList(prev => prev.map(r => r.id === id ? updated : r));
      } else {
        setRegistrationsList(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      }
    } catch {
      setRegistrationsList(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    if (!window.confirm('Вы действительно хотите удалить эту запись жителя?')) return;
    try {
      await fetch(`/api/registrations/${id}`, { method: 'DELETE' });
      setRegistrationsList(prev => prev.filter(r => r.id !== id));
      setSelectedRegIds(prev => prev.filter(x => x !== id));
      refreshAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkDeleteRegistrations = async () => {
    if (selectedRegIds.length === 0) return;
    try {
      await fetch('/api/registrations/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedRegIds })
      });
      setRegistrationsList(prev => prev.filter(r => !selectedRegIds.includes(r.id)));
      setSelectedRegIds([]);
      setConfirmBulkDeleteRegsOpen(false);
      refreshAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkUpdateStatus = async (status: RegistrationStatus) => {
    if (selectedRegIds.length === 0) return;
    try {
      await Promise.all(
        selectedRegIds.map(id =>
          fetch(`/api/registrations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          })
        )
      );
      setRegistrationsList(prev =>
        prev.map(r => selectedRegIds.includes(r.id) ? { ...r, status } : r)
      );
      setSelectedRegIds([]);
      refreshAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRegistrations = refreshAdminData;

  const handleExportRegistrationsExcel = () => {
    const url = `/api/registrations/export.xlsx?targetType=${regFilterType}&status=${regFilterStatus}&district=${encodeURIComponent(regFilterDistrict)}&search=${encodeURIComponent(regSearch)}`;
    window.open(url, '_blank');
  };

  const handleSaveManualRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRegData.fullName.trim() || !manualRegData.phone.trim() || !manualRegData.targetId) {
      alert('Пожалуйста, выберите занятие или мероприятие и укажите имя и телефон');
      return;
    }

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(manualRegData)
      });

      if (res.ok) {
        const created = await res.json();
        setRegistrationsList(prev => [created, ...prev]);
        setIsManualAddRegOpen(false);
        setManualRegData({
          targetType: 'schedule',
          targetId: '',
          fullName: '',
          phone: '',
          email: '',
          participantsCount: 1,
          comment: ''
        });
        refreshAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualAddRegistration = handleSaveManualRegistration;

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

  // Filtered events for admin table
  const adminFilteredEvents = eventsList.filter(ev => {
    if (eventFilterDistrict !== 'Все' && ev.district !== eventFilterDistrict) return false;
    if (eventFilterStatus !== 'Все' && ev.status !== eventFilterStatus) return false;
    if (eventSearch) {
      const q = eventSearch.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.sport.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q) ||
        (ev.organizer && ev.organizer.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // ==========================================
  // EVENTS CRUD ACTIONS
  // ==========================================
  const handleOpenAddEvent = () => {
    setEditingEvent({
      title: '',
      eventType: 'Соревнование',
      sport: 'Легкая атлетика',
      district: 'Центральный',
      location: 'Стадион «Спартак»',
      address: 'ул. Мичурина, 10',
      organizer: 'МАУ «Стадион» и УФКиС мэрии г. Новосибирска',
      organizerPhone: '+7 (383) 227-40-00',
      organizerEmail: 'sport54@novo-sibirsk.ru',
      date: '2026-09-20',
      dayOfWeek: 'ВС',
      time: '10:00',
      durationHours: 3,
      ageGroup: 'Все возраста',
      targetCategory: 'Все',
      format: 'outdoor',
      photo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
      expectedParticipants: 200,
      registeredCount: 0,
      description: 'Городское спортивное событие в Новосибирске.',
      prizes: 'Медали, дипломы и памятные призы победителям',
      registrationDeadline: '2026-09-19',
      status: 'registration_open',
      statusLabel: 'Регистрация открыта',
      price: 'Бесплатно',
      isFeatured: false,
      requirements: 'Спортивная форма и обувь по погоде'
    });
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (item: SportEventItem) => {
    setEditingEvent(item);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (eventData: Partial<SportEventItem>) => {
    try {
      if (editingEvent?.id) {
        // Edit existing
        const res = await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(eventData)
        }).catch(() => null);

        let updatedItem: SportEventItem;
        if (res && res.ok) {
          updatedItem = await res.json();
        } else {
          updatedItem = { ...(editingEvent as SportEventItem), ...eventData } as SportEventItem;
        }

        const nextList = eventsList.map(ev => ev.id === updatedItem.id ? updatedItem : ev);
        setEventsList(nextList);
        try { localStorage.setItem('nsk_sport54_events', JSON.stringify(nextList)); } catch {}
      } else {
        // Create new
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(eventData)
        }).catch(() => null);

        let createdItem: SportEventItem;
        if (res && res.ok) {
          createdItem = await res.json();
        } else {
          createdItem = {
            id: 'ev-' + Date.now(),
            title: eventData.title || 'Спортивное мероприятие',
            eventType: eventData.eventType || 'Соревнование',
            sport: eventData.sport || 'Легкая атлетика',
            district: eventData.district || 'Центральный',
            location: eventData.location || 'Стадион «Спартак»',
            address: eventData.address || 'ул. Мичурина, 10',
            organizer: eventData.organizer || 'Управление физической культуры и спорта мэрии г. Новосибирска',
            organizerPhone: eventData.organizerPhone || '+7 (383) 227-40-00',
            organizerEmail: eventData.organizerEmail || 'sport54@novo-sibirsk.ru',
            date: eventData.date || '2026-09-20',
            dayOfWeek: eventData.dayOfWeek || 'ВС',
            time: eventData.time || '10:00',
            durationHours: eventData.durationHours || 3,
            ageGroup: eventData.ageGroup || 'Все возраста',
            targetCategory: eventData.targetCategory || 'Все',
            format: eventData.format || 'outdoor',
            photo: eventData.photo || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
            expectedParticipants: eventData.expectedParticipants || 200,
            registeredCount: eventData.registeredCount || 0,
            description: eventData.description || 'Городское спортивное событие в Новосибирске.',
            prizes: eventData.prizes || 'Медали, дипломы и памятные призы победителям',
            registrationDeadline: eventData.registrationDeadline || '2026-09-19',
            status: eventData.status || 'registration_open',
            statusLabel: eventData.statusLabel || 'Регистрация открыта',
            price: eventData.price || 'Бесплатно',
            isFeatured: !!eventData.isFeatured,
            requirements: eventData.requirements || 'Спортивная форма и обувь по погоде'
          } as SportEventItem;
        }

        const nextList = [createdItem, ...eventsList];
        setEventsList(nextList);
        try { localStorage.setItem('nsk_sport54_events', JSON.stringify(nextList)); } catch {}
      }
      onDataChanged();
      setEditingEvent(null);
      setIsEventModalOpen(false);
    } catch (err) {
      console.error('Failed to save event:', err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить это мероприятие?')) return;
    try {
      await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => null);

      const nextList = eventsList.filter(ev => ev.id !== id);
      setEventsList(nextList);
      setSelectedEventIds(prev => prev.filter(x => x !== id));
      try { localStorage.setItem('nsk_sport54_events', JSON.stringify(nextList)); } catch {}
      onDataChanged();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const handleBulkDeleteEvents = async () => {
    if (selectedEventIds.length === 0) return;
    try {
      await fetch('/api/events/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedEventIds })
      }).catch(() => null);

      const nextList = eventsList.filter(ev => !selectedEventIds.includes(ev.id));
      setEventsList(nextList);
      setSelectedEventIds([]);
      setConfirmBulkDeleteEventsOpen(false);
      try { localStorage.setItem('nsk_sport54_events', JSON.stringify(nextList)); } catch {}
      onDataChanged();
    } catch (err) {
      console.error('Failed to bulk delete events:', err);
    }
  };

  const handleExportEventsExcel = async () => {
    try {
      const res = await fetch('/api/events/export.xlsx');
      if (!res.ok) throw new Error('Ошибка формирования файла экспорта');
      const blob = await res.blob();
      const excelBlob = new Blob([blob], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const downloadUrl = window.URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const today = new Date().toISOString().slice(0, 10);
      link.download = `Meropriyatiya_Novosibirsk_${today}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 2000);
    } catch (err: any) {
      window.open('/api/events/export.xlsx', '_blank');
    }
  };

  const handleGoToImportEvents = () => {
    setImportTarget('events');
    setActiveTab('import');
    setImportStep(1);
    setImportError(null);
  };

  // ==========================================
  // IMPORT ENGINE ACTIONS
  // ==========================================
  const handleFileUpload = async (file: File, targetOverride?: 'schedules' | 'events') => {
    setIsImportLoading(true);
    setImportError(null);
    setImportFile(file);
    setImportFileName(file.name);

    const currentTarget = targetOverride || importTarget;
    const formData = new FormData();
    formData.append('file', file);

    const isWord = file.name.endsWith('.docx');
    const endpoint = `${isWord ? '/api/import/word' : '/api/import/excel'}?target=${currentTarget}`;

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

  const handleDownloadSampleExcel = async (e?: React.MouseEvent, type: 'sample' | 'empty' = 'sample', target: 'schedules' | 'events' = importTarget) => {
    if (e) e.preventDefault();
    try {
      let endpoint = '';
      let fileName = '';
      if (target === 'events') {
        endpoint = type === 'empty' ? '/api/import/events-template.xlsx' : '/api/import/events-sample.xlsx';
        fileName = type === 'empty' ? 'Shablon_meropriyatiy_Novosibirsk.xlsx' : 'Obrazets_meropriyatiy_Novosibirsk.xlsx';
      } else {
        endpoint = type === 'empty' ? '/api/import/template-empty.xlsx' : '/api/import/sample-excel.xlsx';
        fileName = type === 'empty' ? 'Shablon_raspisaniya_Novosibirsk.xlsx' : 'Obrazets_raspisaniya_Novosibirsk.xlsx';
      }
      
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
      const fallbackUrl = target === 'events'
        ? (type === 'empty' ? '/api/import/events-template.xlsx' : '/api/import/events-sample.xlsx')
        : (type === 'empty' ? '/api/import/template-empty.xlsx' : '/api/import/sample-excel.xlsx');
      window.open(fallbackUrl, '_blank');
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
      const endpoint = importTarget === 'events' ? '/api/import/events-sample.xlsx' : '/api/import/sample-excel.xlsx';
      const sampleName = importTarget === 'events' ? 'Obrazets_meropriyatiy_Novosibirsk.xlsx' : 'Obrazets_raspisaniya_Novosibirsk.xlsx';
      const res = await fetch(endpoint);
      const blob = await res.blob();
      const file = new File([blob], sampleName, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      await handleFileUpload(file, importTarget);
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
          filename: importFileName,
          target: importTarget
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка публикации');
      }

      const result = await res.json();
      setImportStep(5);
      const label = importTarget === 'events' ? 'мероприятий' : 'занятий';
      setImportSuccessMessage(`Успешно опубликовано ${result.publishedCount} ${label} на портале!`);
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
      <header className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer shrink-0"
            title={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню разделов'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xs sm:text-sm shrink-0">
            54
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-lg font-bold tracking-tight truncate">Панель управления</h1>
              <span className="hidden xs:inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-semibold border border-emerald-500/30 shrink-0">
                Админ
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-400 truncate block">СПОРТИВНЫЙ ГОРОД 54</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="hidden sm:inline">← Вернуться на сайт</span>
            <span className="sm:hidden">← На сайт</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </header>

      {/* Main Layout: Sidebar Tabs + Content Area */}
      <div className="flex-1 flex overflow-hidden bg-slate-100 relative">
        {/* Mobile Backdrop when Sidebar Drawer is open */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Nav: Responsive drawer on mobile, regular flex sidebar on desktop */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-50 md:z-auto
            w-72 md:w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 overflow-y-auto
            transition-transform duration-200 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Управление порталом
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setActiveTab('schedules'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'schedules'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Спортивный календарь</span>
              <span className={`ml-auto text-[11px] px-2 py-0.5 rounded-full ${
                activeTab === 'schedules' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {schedules.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('events'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Мероприятия</span>
              <span className="ml-auto flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold uppercase tracking-wide">
                  NEW
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                  activeTab === 'events' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {eventsList.length}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('registrations'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'registrations'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-purple-600" />
              <span>Заявки и участники</span>
              <span className="ml-auto flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-extrabold uppercase tracking-wide">
                  NEW
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                  activeTab === 'registrations' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {registrationsList.length}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('import'); setMobileMenuOpen(false); }}
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
              onClick={() => { setActiveTab('media'); setMobileMenuOpen(false); }}
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
              onClick={() => { setActiveTab('venues'); setMobileMenuOpen(false); }}
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
              onClick={() => { setActiveTab('districts'); setMobileMenuOpen(false); }}
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
              onClick={() => { setActiveTab('news'); setMobileMenuOpen(false); }}
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
              onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
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
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 mt-4">
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

        {/* Content Area (Responsive Main Field) */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 min-w-0">
          {/* Mobile Horizontal Quick-Nav Ribbon */}
          <div className="md:hidden mb-3.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'schedules', label: 'Занятия', count: schedules.length },
                { id: 'events', label: 'События', count: eventsList.length },
                { id: 'registrations', label: 'Заявки', count: registrationsList.length },
                { id: 'import', label: 'Импорт' },
                { id: 'media', label: 'Медиа', count: mediaList.length },
                { id: 'venues', label: 'Объекты', count: venues.length },
                { id: 'districts', label: 'Районы' },
                { id: 'news', label: 'Новости', count: newsList.length },
                { id: 'settings', label: 'Настройки' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === tab.id ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* ======================================================== */}
          {/* TAB 1: SCHEDULES MANAGEMENT                              */}
          {/* ======================================================== */}
          {activeTab === 'schedules' && (
            <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Спортивный календарь</h2>
                  <p className="text-xs text-slate-500">
                    Управление тренировками во всех районах Новосибирска. Всего: {schedules.length}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={handleExportSchedulesExcel}
                    className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-all cursor-pointer shadow-xs shrink-0"
                    title="Выгрузить все текущие занятия базы в таблицу Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>Экспорт в Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={e => handleDownloadSampleExcel(e, 'sample')}
                    className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200 transition-all cursor-pointer shadow-xs shrink-0"
                    title="Скачать эталонный образец таблицы с примерами занятий в формате Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                    <span>Образец Excel</span>
                  </button>

                  {selectedScheduleIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setConfirmBulkDeleteOpen(true)}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-rose-700 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span>Удалить ({selectedScheduleIds.length})</span>
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
                    className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>Добавить занятие</span>
                  </button>
                </div>
              </div>

              {/* Summary Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
                <div id="stat-schedules-total" className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase block truncate">Всего занятий</span>
                    <span className="text-xl font-black text-slate-900">{schedules.length}</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div
                  id="stat-schedules-registered"
                  onClick={() => setActiveTab('registrations')}
                  title="Всего участников, записавшихся на занятия. Нажмите для перехода в реестр заявок"
                  className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-2 min-w-0 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-blue-600 uppercase block truncate transition-colors">
                      Зарегистрировано
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-blue-600">
                        {schedules.reduce((acc, s) => acc + (s.enrolled || 0), 0)}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        / {schedules.reduce((acc, s) => acc + (s.capacity || 0), 0)}
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center font-bold shrink-0 transition-all">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div id="stat-schedules-photo" className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase block truncate">С фото</span>
                    <span className="text-xl font-black text-slate-900">
                      {schedules.filter(s => Boolean(s.photo)).length}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                </div>

                <div id="stat-schedules-changes" className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase block truncate">С изменениями</span>
                    <span className="text-xl font-black text-amber-600">
                      {schedules.filter(s => Boolean(s.changeNote) || (s.status && s.status !== 'active')).length}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                </div>

                <div id="stat-schedules-districts" className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-2 min-w-0 col-span-2 sm:col-span-1">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase block truncate">Районов охвата</span>
                    <span className="text-xl font-black text-slate-900">
                      {new Set(schedules.map(s => s.district)).size} из 10
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Filters & Search Bar */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 flex-1 min-w-0 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    id="input-admin-search-schedules"
                    type="text"
                    value={scheduleSearch}
                    onChange={e => setScheduleSearch(e.target.value)}
                    placeholder="Поиск по названию, тренеру, спорту, адресу..."
                    className="w-full text-xs font-medium bg-transparent focus:outline-none placeholder:text-slate-400 min-w-0"
                  />
                  {scheduleSearch && (
                    <button
                      type="button"
                      onClick={() => setScheduleSearch('')}
                      className="text-xs text-slate-400 hover:text-slate-600 shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
                  <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Район:</span>
                    <select
                      id="select-admin-filter-district"
                      value={scheduleFilterDistrict}
                      onChange={e => setScheduleFilterDistrict(e.target.value)}
                      className="w-full sm:w-auto text-xs font-semibold border border-slate-200 rounded-xl px-2.5 sm:px-3 py-1.5 bg-slate-50 focus:outline-none"
                    >
                      <option value="Все">Все 10 районов</option>
                      {districts.map(d => (
                        <option key={d.id} value={d.name}>{d.name} район</option>
                      ))}
                    </select>
                  </div>

                  {/* Responsive View Mode Switcher: Table vs Cards */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => setMainViewMode(mainViewMode === 'table' ? 'auto' : 'table')}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                        mainViewMode === 'table'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Режим классической таблицы"
                    >
                      Таблица
                    </button>
                    <button
                      type="button"
                      onClick={() => setMainViewMode(mainViewMode === 'cards' ? 'auto' : 'cards')}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                        mainViewMode === 'cards'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Режим карточек (удобно на смартфонах)"
                    >
                      Карточки
                    </button>
                  </div>
                </div>
              </div>

              {/* Table (with auto/toggle responsive visibility) */}
              <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm w-full min-w-0 ${
                mainViewMode === 'cards' ? 'hidden' : mainViewMode === 'table' ? 'block' : 'hidden md:block'
              }`}>
                <div className="overflow-x-auto w-full min-w-0">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-2.5 w-9 text-center">
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
                        <th className="py-2.5 px-2.5 w-28 whitespace-nowrap">Время / Фото</th>
                        <th className="py-2.5 px-3">Занятие и спорт</th>
                        <th className="py-2.5 px-3">Локация / Адрес</th>
                        <th className="py-2.5 px-3 hidden lg:table-cell">Инструктор</th>
                        <th className="py-2.5 px-2.5 text-center whitespace-nowrap">Записались</th>
                        <th className="py-2.5 px-2.5 whitespace-nowrap">Статус</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">Действия</th>
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
                            <td className="py-2.5 px-2.5 text-center w-9">
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

                            {/* Photo Thumbnail + Time & Day */}
                            <td className="py-2.5 px-2.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSchedule(item);
                                    setIsEditScheduleOpen(true);
                                  }}
                                  className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group shrink-0 cursor-pointer block"
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
                                      <ImageIcon className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <Camera className="w-3 h-3" />
                                  </div>
                                </button>
                                <div className="min-w-0">
                                  <div className="font-bold text-blue-600 text-xs">{item.time}</div>
                                  <div className="text-[10px] text-slate-500 font-medium">{item.dayOfWeek}, {item.durationMinutes || 60}м</div>
                                </div>
                              </div>
                            </td>

                            {/* Title & Sport & Age */}
                            <td className="py-2.5 px-3 max-w-xs">
                              <div className="font-bold text-slate-900 leading-snug line-clamp-2 text-xs">
                                {item.title}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100 shrink-0">
                                  {item.sport}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                  item.format === 'outdoor' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {item.format === 'outdoor' ? 'Улица' : 'Зал'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                  {item.ageGroup}
                                </span>
                              </div>
                            </td>

                            {/* District & Location */}
                            <td className="py-2.5 px-3 text-slate-600 max-w-[200px]">
                              <div className="font-bold text-slate-900 text-xs truncate">
                                {item.district} р-н
                              </div>
                              <div className="text-[11px] text-slate-500 truncate" title={`${item.location} (${item.address})`}>
                                {item.location} • {item.address}
                              </div>
                              <div className="text-[10px] text-slate-400 lg:hidden mt-0.5 truncate">
                                Тренер: <span className="text-slate-700 font-medium">{item.instructor}</span>
                              </div>
                            </td>

                            {/* Instructor (visible on lg+) */}
                            <td className="py-2.5 px-3 whitespace-nowrap hidden lg:table-cell">
                              <div className="font-semibold text-slate-800 text-xs">{item.instructor}</div>
                              {item.instructorPhone && (
                                <div className="text-[10px] text-slate-400">{item.instructorPhone}</div>
                              )}
                            </td>

                            {/* Enrolled participants counter */}
                            <td className="py-2.5 px-2.5 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={() => setViewingAttendeesFor({
                                  targetType: 'schedule',
                                  targetId: item.id,
                                  targetTitle: item.title,
                                  targetDate: item.date || item.dayOfWeek,
                                  targetTime: item.time,
                                  targetLocation: item.location,
                                  targetDistrict: item.district,
                                  targetSport: item.sport,
                                  capacity: item.capacity || 20
                                })}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200/80 transition-colors cursor-pointer"
                                title="Посмотреть список записавшихся участников"
                              >
                                <Users className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span>{item.enrolled || 0}/{item.capacity || 20}</span>
                              </button>
                            </td>

                            {/* Status & Operational Notice */}
                            <td className="py-2.5 px-2.5 whitespace-nowrap">
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
                                    className="text-[10px] font-semibold text-amber-900 bg-amber-50/90 border border-amber-200/80 p-1 rounded-md flex items-start gap-1 leading-tight max-w-[140px] truncate"
                                    title={item.changeNote}
                                  >
                                    <Zap className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                                    <span className="truncate">{item.changeNote}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Row Actions */}
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1">
                                {/* Quick Change button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setScheduleForChanges(item);
                                    setIsChangesModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 p-1.5 sm:px-2 sm:py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg font-bold text-xs cursor-pointer transition-colors"
                                  title="Внести оперативное изменение в это занятие"
                                >
                                  <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span className="hidden xl:inline">Изменение</span>
                                </button>

                                {/* Full Edit button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSchedule(item);
                                    setIsEditScheduleOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 p-1.5 sm:px-2 sm:py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg font-bold text-xs cursor-pointer transition-colors"
                                  title="Редактировать данные и загрузить фото"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <span className="hidden xl:inline">Правка</span>
                                </button>

                                {/* Delete button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSchedule(item.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                  title="Удалить занятие"
                                >
                                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
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

              {/* Responsive Cards View (Touch-optimized for mobile or when Cards mode is toggled) */}
              <div className={`space-y-3 w-full min-w-0 ${
                mainViewMode === 'table' ? 'hidden' : mainViewMode === 'cards' ? 'block' : 'block md:hidden'
              }`}>
                {/* Mobile batch selector */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-bold shadow-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
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
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Выбрать все ({adminFilteredSchedules.length})</span>
                  </label>
                  <span className="text-slate-400 font-medium text-[11px]">
                    Найдено: {adminFilteredSchedules.length}
                  </span>
                </div>

                {adminFilteredSchedules.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                    Занятия по выбранным фильтрам не найдены
                  </div>
                ) : (
                  adminFilteredSchedules.map(item => {
                    const isCancelled = item.status === 'cancelled';
                    const isRescheduled = item.status === 'rescheduled';
                    const isIndoorMoved = item.status === 'moved_indoor';

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl border p-3.5 sm:p-4 space-y-3 transition-all shadow-xs ${
                          isCancelled
                            ? 'bg-rose-50/40 border-rose-200'
                            : isRescheduled
                            ? 'bg-amber-50/30 border-amber-200'
                            : selectedScheduleIds.includes(item.id)
                            ? 'border-blue-300 ring-1 ring-blue-200'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
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
                              className="rounded text-blue-600 focus:ring-blue-500 mr-1"
                            />
                            <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                              {item.sport}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.format === 'outdoor' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.format === 'outdoor' ? 'Улица' : 'Зал'}
                            </span>
                          </div>

                          {/* Status badge */}
                          {isCancelled ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px] uppercase shrink-0">
                              🔴 Отменено
                            </span>
                          ) : isRescheduled ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] uppercase shrink-0">
                              🟡 Перенесено
                            </span>
                          ) : isIndoorMoved ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px] uppercase shrink-0">
                              🔵 В зал
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px] shrink-0">
                              🟢 По графику
                            </span>
                          )}
                        </div>

                        <div className="flex items-start gap-3">
                          {item.photo ? (
                            <img
                              src={item.photo}
                              alt={item.title}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1 space-y-1">
                            <h4 className="font-bold text-slate-900 text-sm leading-snug">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span>{item.dayOfWeek}, {item.time} ({item.durationMinutes || 60} мин)</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{item.district} р-н • {item.location}</span>
                            </div>
                          </div>
                        </div>

                        {item.changeNote && (
                          <div className="text-[11px] font-semibold text-amber-900 bg-amber-50/90 border border-amber-200/80 p-2 rounded-xl flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>{item.changeNote}</span>
                          </div>
                        )}

                        {/* Instructor & Attendees row */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="text-slate-600 text-[11px]">
                            <span className="text-slate-400">Инструктор: </span>
                            <span className="font-semibold text-slate-800">{item.instructor}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setViewingAttendeesFor({
                              targetType: 'schedule',
                              targetId: item.id,
                              targetTitle: item.title,
                              targetDate: item.date || item.dayOfWeek,
                              targetTime: item.time,
                              targetLocation: item.location,
                              targetDistrict: item.district,
                              targetSport: item.sport,
                              capacity: item.capacity || 20
                            })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200/80 cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5 text-purple-600" />
                            <span>Записались ({item.enrolled || 0}/{item.capacity || 20})</span>
                          </button>
                        </div>

                        {/* Action buttons row */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-1">
                            <button
                              type="button"
                              onClick={() => {
                                setScheduleForChanges(item);
                                setIsChangesModalOpen(true);
                              }}
                              className="flex-1 py-2 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <Zap className="w-3.5 h-3.5 text-amber-600" />
                              <span>Изменение</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingSchedule(item);
                                setIsEditScheduleOpen(true);
                              }}
                              className="flex-1 py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>Правка</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteSchedule(item.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-100 shrink-0 cursor-pointer"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: EVENTS MANAGEMENT (NEW)                             */}
          {/* ======================================================== */}
          {activeTab === 'events' && (
            <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
              {/* Header with Title & Action Buttons */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Расписание мероприятий</h2>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wide shrink-0">
                      NEW
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Управление турнирами, кубками, эстафетами и фестивалями Новосибирска. Всего: {eventsList.length}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={handleExportEventsExcel}
                    className="px-3 sm:px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    title="Выгрузить все текущие мероприятия в файл Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Экспорт</span>
                  </button>

                  <button
                    type="button"
                    onClick={e => handleDownloadSampleExcel(e, 'sample', 'events')}
                    className="px-3 sm:px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    title="Скачать образец таблицы мероприятий с примерами турниров (.xlsx)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Образец Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={e => handleDownloadSampleExcel(e, 'empty', 'events')}
                    className="px-2.5 sm:px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    title="Скачать пустой шаблон со структурой колонок (.xlsx)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Шаблон</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoToImportEvents}
                    className="px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
                    title="Импорт мероприятий из файла Excel или Word"
                  >
                    <Upload className="w-3.5 h-3.5 shrink-0" />
                    <span>Импорт</span>
                  </button>

                  {selectedEventIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setConfirmBulkDeleteEventsOpen(true)}
                      className="px-3 sm:px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Удалить ({selectedEventIds.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleOpenAddEvent}
                    className="px-3.5 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Добавить мероприятие</span>
                  </button>
                </div>
              </div>

              {/* Event Metrics summary cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Всего событий</div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{eventsList.length}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">В базе данных портала</div>
                </div>
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Открыта запись</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
                    {eventsList.filter(e => e.status === 'registration_open').length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">Принимают участников</div>
                </div>
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Зарегистрировано</div>
                  <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1">
                    {eventsList.reduce((acc, e) => acc + (e.registeredCount || 0), 0)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">Спортсменов и жителей</div>
                </div>
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Главные события</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
                    {eventsList.filter(e => e.isFeatured).length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">В топе на главной странице</div>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Поиск по названию, виду спорта, месту..."
                    value={eventSearch}
                    onChange={e => setEventSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none transition-colors"
                  />
                  {eventSearch && (
                    <button
                      type="button"
                      onClick={() => setEventSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
                  <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                    <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
                    <select
                      value={eventFilterDistrict}
                      onChange={e => setEventFilterDistrict(e.target.value)}
                      className="w-full sm:w-auto py-2 px-2.5 sm:px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="Все">Все районы ({eventsList.length})</option>
                      {districts.map(d => (
                        <option key={d.id} value={d.name}>
                          {d.name} район ({eventsList.filter(ev => ev.district === d.name).length})
                        </option>
                      ))}
                    </select>

                    <select
                      value={eventFilterStatus}
                      onChange={e => setEventFilterStatus(e.target.value)}
                      className="w-full sm:w-auto py-2 px-2.5 sm:px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="Все">Все статусы</option>
                      <option value="registration_open">Регистрация открыта</option>
                      <option value="upcoming">Скоро</option>
                      <option value="ongoing">Идет сейчас</option>
                      <option value="finished">Завершено</option>
                      <option value="rescheduled">Перенесено</option>
                    </select>
                  </div>

                  {/* Responsive View Mode Switcher: Table vs Cards */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => setMainViewMode(mainViewMode === 'table' ? 'auto' : 'table')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        mainViewMode === 'table'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Режим таблицы"
                    >
                      Таблица
                    </button>
                    <button
                      type="button"
                      onClick={() => setMainViewMode(mainViewMode === 'cards' ? 'auto' : 'cards')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        mainViewMode === 'cards'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Режим карточек (адаптировано для мобильных)"
                    >
                      Карточки
                    </button>
                  </div>
                </div>
              </div>

              {/* Events Table (Responsive with scroll and mode toggle) */}
              <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs ${
                mainViewMode === 'cards' ? 'hidden' : mainViewMode === 'table' ? 'block' : 'hidden md:block'
              }`}>
                <div className="overflow-x-auto w-full min-w-0">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase">
                        <th className="py-2.5 px-2.5 w-9 text-center">
                          <input
                            type="checkbox"
                            checked={
                              adminFilteredEvents.length > 0 &&
                              adminFilteredEvents.every(ev => selectedEventIds.includes(ev.id))
                            }
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedEventIds(Array.from(new Set([...selectedEventIds, ...adminFilteredEvents.map(ev => ev.id)])));
                              } else {
                                const idsToRemove = new Set(adminFilteredEvents.map(ev => ev.id));
                                setSelectedEventIds(selectedEventIds.filter(id => !idsToRemove.has(id)));
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                          />
                        </th>
                        <th className="py-2.5 px-2.5 w-14">Афиша</th>
                        <th className="py-2.5 px-3">Мероприятие и спорт</th>
                        <th className="py-2.5 px-3">Район и Место</th>
                        <th className="py-2.5 px-2.5 whitespace-nowrap">Дата и Время</th>
                        <th className="py-2.5 px-2.5 whitespace-nowrap">Участники</th>
                        <th className="py-2.5 px-2.5 whitespace-nowrap">Статус</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminFilteredEvents.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-12 text-center text-slate-400">
                            <Trophy className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <div className="font-semibold">Мероприятия не найдены</div>
                            <div className="text-[11px] mt-1">Попробуйте изменить параметры поиска или добавьте новое мероприятие</div>
                          </td>
                        </tr>
                      ) : (
                        adminFilteredEvents.map(item => {
                          const isChecked = selectedEventIds.includes(item.id);
                          const participantsRatio = item.expectedParticipants
                            ? Math.min(100, Math.round(((item.registeredCount || 0) / item.expectedParticipants) * 100))
                            : 0;

                          return (
                            <tr
                              key={item.id}
                              className={`hover:bg-blue-50/30 transition-colors ${isChecked ? 'bg-blue-50/50' : ''}`}
                            >
                              <td className="py-2.5 px-2.5 text-center w-9">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setSelectedEventIds(prev =>
                                      prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id]
                                    );
                                  }}
                                  className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                                />
                              </td>
                              <td className="py-2.5 px-2.5 w-14">
                                {item.photo ? (
                                  <img
                                    src={item.photo}
                                    alt={item.title}
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 object-cover rounded-xl border border-slate-200 shadow-2xs"
                                    onError={e => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold text-sm">
                                    <Trophy className="w-4 h-4" />
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 max-w-xs">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 line-clamp-1 text-xs">{item.title}</span>
                                  {item.isFeatured && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                      Топ
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <span className="font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-[10px]">
                                    {item.sport}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                    {item.eventType || 'Событие'}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {item.format === 'outdoor' ? 'На улице' : 'В зале'} • {item.price || 'Бесплатно'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 max-w-[180px]">
                                <div className="font-bold text-slate-900 text-xs truncate">{item.location}</div>
                                <div className="text-[11px] text-slate-500 truncate">{item.district} р-н • {item.address}</div>
                              </td>
                              <td className="py-2.5 px-2.5 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold text-[10px]">
                                    {item.dayOfWeek || 'ДЕНЬ'}
                                  </span>
                                  <span className="font-bold text-slate-800 text-xs">{item.date}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">{item.time} ({item.durationHours || 2} ч.)</div>
                              </td>
                              <td className="py-2.5 px-2.5 whitespace-nowrap min-w-[120px]">
                                <button
                                  type="button"
                                  onClick={() => setViewingAttendeesFor({
                                    targetType: 'event',
                                    targetId: item.id,
                                    targetTitle: item.title,
                                    targetDate: item.date,
                                    targetTime: item.time,
                                    targetLocation: item.location,
                                    targetDistrict: item.district,
                                    targetSport: item.sport,
                                    capacity: item.expectedParticipants || 100
                                  })}
                                  className="w-full text-left p-1 rounded-lg hover:bg-purple-50 transition-colors group/att cursor-pointer"
                                  title="Посмотреть список записавшихся участников"
                                >
                                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 group-hover/att:text-purple-700">
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3 h-3 text-purple-600" />
                                      <strong>{item.registeredCount || 0}</strong> / {item.expectedParticipants || '—'}
                                    </span>
                                    <span className="text-slate-400 group-hover/att:text-purple-600 font-bold text-[10px]">{participantsRatio}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        participantsRatio >= 90 ? 'bg-rose-500' : participantsRatio >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                      }`}
                                      style={{ width: `${participantsRatio}%` }}
                                    />
                                  </div>
                                </button>
                              </td>
                              <td className="py-2.5 px-2.5 whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    item.status === 'registration_open'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : item.status === 'ongoing'
                                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                                      : item.status === 'upcoming'
                                      ? 'bg-amber-100 text-amber-800'
                                      : item.status === 'rescheduled'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {item.statusLabel || (
                                    item.status === 'registration_open' ? 'Регистрация' :
                                    item.status === 'ongoing' ? 'Идет сейчас' :
                                    item.status === 'upcoming' ? 'Скоро' :
                                    item.status === 'rescheduled' ? 'Перенесено' : 'Завершено'
                                  )}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditEvent(item)}
                                    className="inline-flex items-center gap-1 p-1.5 sm:px-2 sm:py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg font-bold text-xs cursor-pointer transition-colors"
                                    title="Редактировать мероприятие"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    <span className="hidden xl:inline">Правка</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEvent(item.id)}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                    title="Удалить мероприятие"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Responsive Cards View for Events (Optimized for mobile or when Cards mode is selected) */}
              <div className={`space-y-3 ${
                mainViewMode === 'table' ? 'hidden' : mainViewMode === 'cards' ? 'block' : 'block md:hidden'
              }`}>
                {/* Mobile batch selector */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-bold shadow-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={
                        adminFilteredEvents.length > 0 &&
                        adminFilteredEvents.every(ev => selectedEventIds.includes(ev.id))
                      }
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedEventIds(Array.from(new Set([...selectedEventIds, ...adminFilteredEvents.map(ev => ev.id)])));
                        } else {
                          const idsToRemove = new Set(adminFilteredEvents.map(ev => ev.id));
                          setSelectedEventIds(selectedEventIds.filter(id => !idsToRemove.has(id)));
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Выбрать все ({adminFilteredEvents.length})</span>
                  </label>
                  <span className="text-slate-400 font-medium text-[11px]">
                    Найдено: {adminFilteredEvents.length}
                  </span>
                </div>

                {adminFilteredEvents.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <div className="font-semibold">Мероприятия по выбранным параметрам не найдены</div>
                    <div className="text-[11px] mt-1 text-slate-400">Попробуйте изменить поисковый запрос или фильтры</div>
                  </div>
                ) : (
                  adminFilteredEvents.map(item => {
                    const isChecked = selectedEventIds.includes(item.id);
                    const participantsRatio = item.expectedParticipants
                      ? Math.min(100, Math.round(((item.registeredCount || 0) / item.expectedParticipants) * 100))
                      : 0;

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl border p-3.5 sm:p-4 space-y-3 transition-all shadow-xs ${
                          isChecked ? 'border-blue-300 ring-1 ring-blue-200 bg-blue-50/20' : 'border-slate-200'
                        }`}
                      >
                        {/* Badges Top Bar */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedEventIds(prev =>
                                  prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id]
                                );
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500 mr-1 cursor-pointer"
                            />
                            <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                              {item.sport}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                              {item.eventType || 'Событие'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.format === 'outdoor' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.format === 'outdoor' ? 'Улица' : 'Зал'}
                            </span>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              item.status === 'registration_open'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'ongoing'
                                ? 'bg-blue-100 text-blue-800 animate-pulse'
                                : item.status === 'upcoming'
                                ? 'bg-amber-100 text-amber-800'
                                : item.status === 'rescheduled'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.statusLabel || (
                              item.status === 'registration_open' ? '🟢 Регистрация' :
                              item.status === 'ongoing' ? '🔵 Идет сейчас' :
                              item.status === 'upcoming' ? '🟡 Скоро' :
                              item.status === 'rescheduled' ? '🟣 Перенесено' : '⚪ Завершено'
                            )}
                          </span>
                        </div>

                        {/* Event Photo & Details */}
                        <div className="flex items-start gap-3">
                          {item.photo ? (
                            <img
                              src={item.photo}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
                              onError={e => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold shrink-0">
                              <Trophy className="w-6 h-6" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-sm leading-snug">
                                {item.title}
                              </h4>
                              {item.isFeatured && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                  Топ
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                              <Calendar className="w-3.5 h-3.5 shrink-0" />
                              <span>{item.date} ({item.dayOfWeek}), {item.time} ({item.durationHours || 2} ч.)</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{item.district} р-н • {item.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Participants ratio progress */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 font-medium flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-purple-600" />
                              <span>Участники: <strong>{item.registeredCount || 0}</strong> / {item.expectedParticipants || '—'}</span>
                            </span>
                            <span className="text-slate-600 font-bold text-[11px]">{participantsRatio}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                participantsRatio >= 90 ? 'bg-rose-500' : participantsRatio >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${participantsRatio}%` }}
                            />
                          </div>
                        </div>

                        {/* Action buttons row */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingAttendeesFor({
                              targetType: 'event',
                              targetId: item.id,
                              targetTitle: item.title,
                              targetDate: item.date,
                              targetTime: item.time,
                              targetLocation: item.location,
                              targetDistrict: item.district,
                              targetSport: item.sport,
                              capacity: item.expectedParticipants || 100
                            })}
                            className="flex-1 py-2 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200/80 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Users className="w-3.5 h-3.5 text-purple-600" />
                            <span>Записались ({item.registeredCount || 0})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditEvent(item)}
                            className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200/80 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Правка</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(item.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-100 shrink-0 cursor-pointer"
                            title="Удалить мероприятие"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: REGISTRATIONS MANAGEMENT (УЧЕТ ЗАПИСАВШИХСЯ)        */}
          {/* ======================================================== */}
          {activeTab === 'registrations' && (
            <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
              {/* Top Banner & Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm shadow-md shadow-purple-600/20 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <span>Учет записавшихся участников</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Сквозной реестр граждан, записавшихся на бесплатные тренировки с инструкторами и городские спортивные мероприятия. Быстрая связь (звонок, WhatsApp, Telegram, SMS, Email) и экспорт.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsManualAddRegOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить запись вручную</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportRegistrationsExcel}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    title="Выгрузить весь реестр в файл Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Экспорт в Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={fetchRegistrations}
                    className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                    title="Обновить данные"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Stat Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Всего заявок</span>
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{registrationsList.length}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Все занятия и события</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Подтверждено</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {registrationsList.filter(r => r.status === 'confirmed').length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Готовы к участию</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Ожидают связи</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {registrationsList.filter(r => r.status === 'pending').length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Требуют уточнения</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Посетили</span>
                    <Award className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {registrationsList.filter(r => r.status === 'attended').length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Фактически пришли</div>
                </div>
              </div>

              {/* Filters and Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={regSearch}
                      onChange={e => setRegSearch(e.target.value)}
                      placeholder="Поиск по ФИО, телефону, email, коду бронирования, занятию..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
                    />
                    {regSearch && (
                      <button
                        type="button"
                        onClick={() => setRegSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                    {/* Target Type Filter */}
                    <select
                      value={regFilterType}
                      onChange={e => setRegFilterType(e.target.value as any)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none"
                    >
                      <option value="all">Все типы (занятия и события)</option>
                      <option value="schedule">Только занятия (расписание)</option>
                      <option value="event">Только мероприятия</option>
                    </select>

                    {/* Status Filter */}
                    <select
                      value={regFilterStatus}
                      onChange={e => setRegFilterStatus(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none"
                    >
                      <option value="all">Все статусы</option>
                      <option value="confirmed">Подтверждено</option>
                      <option value="pending">Ожидает</option>
                      <option value="attended">Посетил</option>
                      <option value="cancelled">Отменено</option>
                    </select>

                    {/* District Filter */}
                    <select
                      value={regFilterDistrict}
                      onChange={e => setRegFilterDistrict(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none"
                    >
                      <option value="Все">Все районы (10)</option>
                      {districts.map(d => (
                        <option key={d.id} value={d.name}>{d.name} р-н</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Batch Actions Bar */}
                {selectedRegIds.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-slate-700">
                      Выбрано записей: <span className="text-purple-600">{selectedRegIds.length}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleBulkUpdateStatus('confirmed')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 cursor-pointer"
                      >
                        Подтвердить
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkUpdateStatus('attended')}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 cursor-pointer"
                      >
                        Отметить «Посетил»
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmBulkDeleteRegsOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 cursor-pointer"
                      >
                        Удалить выбранные
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Table of Registrations */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-3 text-center w-10">
                          <input
                            type="checkbox"
                            checked={
                              adminFilteredRegistrations.length > 0 &&
                              selectedRegIds.length === adminFilteredRegistrations.length
                            }
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedRegIds(adminFilteredRegistrations.map(r => r.id));
                              } else {
                                setSelectedRegIds([]);
                              }
                            }}
                          />
                        </th>
                        <th className="py-3 px-3 whitespace-nowrap">Код</th>
                        <th className="py-3 px-4">Участник и контакты</th>
                        <th className="py-3 px-4">Занятие / Мероприятие</th>
                        <th className="py-3 px-4">Локация / Район</th>
                        <th className="py-3 px-3 text-center whitespace-nowrap">Чел.</th>
                        <th className="py-3 px-4 whitespace-nowrap">Статус</th>
                        <th className="py-3 px-4 whitespace-nowrap">Дата записи</th>
                        <th className="py-3 px-4 text-right whitespace-nowrap">Связь и действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminFilteredRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-400">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                              <Users className="w-6 h-6" />
                            </div>
                            <div className="font-bold text-slate-600 text-sm">Записей не найдено</div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              Попробуйте изменить параметры поиска или добавить запись вручную
                            </div>
                          </td>
                        </tr>
                      ) : (
                        adminFilteredRegistrations.map(reg => {
                          const isSchedule = reg.targetType === 'schedule';
                          return (
                            <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedRegIds.includes(reg.id)}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setSelectedRegIds([...selectedRegIds, reg.id]);
                                    } else {
                                      setSelectedRegIds(selectedRegIds.filter(i => i !== reg.id));
                                    }
                                  }}
                                />
                              </td>

                              {/* Booking Code */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                  {reg.bookingCode || `#${reg.id.slice(-5)}`}
                                </span>
                              </td>

                              {/* Participant & Contacts */}
                              <td className="py-3 px-4 max-w-xs">
                                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                  <span>{reg.fullName}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 flex-wrap">
                                  <a
                                    href={`tel:${reg.phone}`}
                                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                                    title="Позвонить"
                                  >
                                    <Phone className="w-3 h-3 text-blue-500" />
                                    <span>{reg.phone}</span>
                                  </a>
                                  {reg.email && (
                                    <a
                                      href={`mailto:${reg.email}`}
                                      className="text-slate-400 hover:text-slate-700 flex items-center gap-1 truncate max-w-[140px]"
                                      title={reg.email}
                                    >
                                      <Mail className="w-3 h-3" />
                                      <span>{reg.email}</span>
                                    </a>
                                  )}
                                </div>
                                {reg.comment && (
                                  <div className="mt-1 text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 line-clamp-2">
                                    Примечание: {reg.comment}
                                  </div>
                                )}
                              </td>

                              {/* Target details */}
                              <td className="py-3 px-4 max-w-xs">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase ${
                                      isSchedule
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-purple-100 text-purple-800'
                                    }`}
                                  >
                                    {isSchedule ? 'Занятие' : 'Мероприятие'}
                                  </span>
                                  {reg.targetSport && (
                                    <span className="text-[10px] font-semibold text-slate-500">
                                      • {reg.targetSport}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewingAttendeesFor({
                                      targetType: reg.targetType,
                                      targetId: reg.targetId,
                                      targetTitle: reg.targetTitle,
                                      targetDate: reg.targetDate,
                                      targetTime: reg.targetTime,
                                      targetLocation: reg.targetLocation,
                                      targetDistrict: reg.targetDistrict,
                                      targetSport: reg.targetSport
                                    })
                                  }
                                  className="font-bold text-slate-900 hover:text-purple-600 transition-colors text-left line-clamp-1 cursor-pointer"
                                  title="Посмотреть всех записавшихся на это занятие/мероприятие"
                                >
                                  {reg.targetTitle}
                                </button>
                                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{reg.targetDate} в {reg.targetTime}</span>
                                </div>
                              </td>

                              {/* Location */}
                              <td className="py-3 px-4 text-slate-600 max-w-xs">
                                <div className="font-bold text-slate-900">{reg.targetDistrict} р-н</div>
                                <div className="text-[11px] text-slate-500 truncate" title={reg.targetLocation}>
                                  {reg.targetLocation}
                                </div>
                              </td>

                              {/* Number of attendees */}
                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold font-mono">
                                  {reg.participantsCount || 1}
                                </span>
                              </td>

                              {/* Status select */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <select
                                  value={reg.status}
                                  onChange={e => handleUpdateRegStatus(reg.id, e.target.value as any)}
                                  className={`px-2 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                    reg.status === 'confirmed'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : reg.status === 'attended'
                                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                                      : reg.status === 'cancelled'
                                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                                      : 'bg-amber-50 text-amber-800 border-amber-300'
                                  }`}
                                >
                                  <option value="confirmed">🟢 Подтверждена</option>
                                  <option value="pending">🟡 Ожидает связи</option>
                                  <option value="attended">🔵 Посетил(а)</option>
                                  <option value="cancelled">🔴 Отменена</option>
                                </select>
                              </td>

                              {/* Created At */}
                              <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-400">
                                {new Date(reg.createdAt).toLocaleDateString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                                {/* Direct Contact Button (WhatsApp, Phone, Telegram, SMS, Email) */}
                                <button
                                  type="button"
                                  onClick={() => setContactingRegistration(reg)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer mr-1"
                                  title="Быстрая связь с участником (звонок, WhatsApp, Telegram, SMS, Email)"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>Связаться</span>
                                </button>

                                {/* View Attendees for target */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewingAttendeesFor({
                                      targetType: reg.targetType,
                                      targetId: reg.targetId,
                                      targetTitle: reg.targetTitle,
                                      targetDate: reg.targetDate,
                                      targetTime: reg.targetTime,
                                      targetLocation: reg.targetLocation,
                                      targetDistrict: reg.targetDistrict,
                                      targetSport: reg.targetSport
                                    })
                                  }
                                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-xl cursor-pointer transition-colors"
                                  title="Посмотреть всех записавшихся на данное занятие"
                                >
                                  <Users className="w-4 h-4" />
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRegistration(reg.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
                                  title="Удалить запись"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
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
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Импорт {importTarget === 'events' ? 'мероприятий' : 'расписания'} (Excel и Word)
                </h2>
                <p className="text-xs text-slate-500">
                  {importTarget === 'events'
                    ? 'Загружайте списки городских соревнований, турниров и кубков. Система автоматически распознает даты, локации, квоты участников и организаторов.'
                    : 'Загружайте файлы расписаний от инструкторов без необходимости ручного ввода. Система автоматически распознает колонки, нормализует названия и подсветит ошибки.'}
                </p>
              </div>

              {/* Target Selector Switch (Schedules vs Events) */}
              <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex items-center gap-2 shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    setImportTarget('schedules');
                    setImportStep(1);
                    setImportPreview(null);
                    setImportError(null);
                  }}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    importTarget === 'schedules'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Импорт расписания занятий</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImportTarget('events');
                    setImportStep(1);
                    setImportPreview(null);
                    setImportError(null);
                  }}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    importTarget === 'events'
                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-amber-200" />
                  <span>Импорт мероприятий и турниров</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/40 text-white text-[10px] font-extrabold">
                    NEW
                  </span>
                </button>
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
                        {importTarget === 'events'
                          ? 'Перетащите сюда файл со списком мероприятий (.xlsx, .xls, .docx)'
                          : 'Перетащите сюда файл расписания занятий (.xlsx, .xls, .docx)'}
                      </h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        {importTarget === 'events'
                          ? 'Поддерживаются любые стандартные таблицы соревнований, турниров и кубков. Колонки будут автоматически сопоставлены.'
                          : 'Поддерживаются любые стандартные таблицы расписания. Колонки будут автоматически сопоставлены.'}
                      </p>
                      <div className="pt-2">
                        <span className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md ${
                          importTarget === 'events' ? 'bg-amber-600' : 'bg-blue-600'
                        }`}>
                          Выбрать файл на компьютере
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Test Download (.xlsx) & Direct Load */}
                  <div className={`border rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 ${
                    importTarget === 'events'
                      ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 border-amber-200'
                      : 'bg-gradient-to-r from-sky-50 via-blue-50 to-emerald-50 border-sky-200/90'
                  }`}>
                    <div className="flex items-start gap-3.5 max-w-xl">
                      <div className={`w-12 h-12 rounded-2xl bg-white border flex items-center justify-center shrink-0 shadow-xs ${
                        importTarget === 'events' ? 'border-amber-200 text-amber-600' : 'border-sky-200 text-emerald-600'
                      }`}>
                        {importTarget === 'events' ? <Trophy className="w-6 h-6" /> : <FileSpreadsheet className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {importTarget === 'events'
                              ? 'Готовый образец мероприятий Excel (.xlsx)'
                              : 'Готовый образец таблицы Excel (.xlsx)'}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                            importTarget === 'events'
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {importTarget === 'events' ? '.XLSX NEW' : '.XLSX'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {importTarget === 'events'
                            ? 'Содержит корректные колонки и реальные примеры городских турниров (Кубок мэра по мини-футболу, Легкоатлетический кросс, Первенство по волейболу). Скачайте для быстрого старта.'
                            : 'Содержит корректные колонки и реальные примеры занятий (йога, футбол, волейбол, плавание) по всем 10 районам Новосибирска. Скачайте для заполнения своих данных или проверки.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                      <a
                        href={importTarget === 'events' ? '/api/import/events-sample.xlsx' : '/api/import/sample-excel.xlsx'}
                        download={importTarget === 'events' ? 'Obrazets_meropriyatiy_Novosibirsk.xlsx' : 'Obrazets_raspisaniya_Novosibirsk.xlsx'}
                        onClick={e => handleDownloadSampleExcel(e, 'sample', importTarget)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-slate-400 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                        title="Скачать файл с примерами в формате Microsoft Excel (.xlsx)"
                      >
                        <Download className={`w-4 h-4 ${importTarget === 'events' ? 'text-amber-600' : 'text-emerald-600'}`} />
                        <span>Скачать образец (.xlsx)</span>
                      </a>

                      <a
                        href={importTarget === 'events' ? '/api/import/events-template.xlsx' : '/api/import/template-empty.xlsx'}
                        download={importTarget === 'events' ? 'Shablon_meropriyatiy_Novosibirsk.xlsx' : 'Shablon_raspisaniya_Novosibirsk.xlsx'}
                        onClick={e => handleDownloadSampleExcel(e, 'empty', importTarget)}
                        className="px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200 text-slate-600 hover:bg-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        title="Скачать чистую таблицу со структурой колонок (.xlsx)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                        <span>Чистый шаблон (.xlsx)</span>
                      </a>

                      <button
                        type="button"
                        onClick={handleTestSampleExcel}
                        className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all ${
                          importTarget === 'events'
                            ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                        }`}
                      >
                        <span>Загрузить образец в 1 клик</span>
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
                    <h3 className="text-lg font-bold text-slate-900">
                      Предпросмотр изменений в базе (Diff)
                    </h3>
                    <p className="text-xs text-slate-500">
                      {importTarget === 'events'
                        ? 'Перед публикацией проверьте баланс изменений в списке мероприятий.'
                        : 'Перед публикацией проверьте баланс изменений в расписании.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <span className="text-xs uppercase font-bold text-emerald-700 block">Будет добавлено</span>
                      <span className="text-3xl font-black">{importPreview.diff.added}</span>
                      <span className="text-xs block text-emerald-600 mt-1">
                        {importTarget === 'events' ? 'Новых мероприятий в афише' : 'Новых занятий в расписании'}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900">
                      <span className="text-xs uppercase font-bold text-blue-700 block">Будет обновлено</span>
                      <span className="text-3xl font-black">{importPreview.diff.updated}</span>
                      <span className="text-xs block text-blue-600 mt-1">
                        {importTarget === 'events' ? 'Существующих мероприятий' : 'Существующих занятий'}
                      </span>
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
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-50 transition-colors"
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
                      <span>
                        {importTarget === 'events' ? '🚀 ОПУБЛИКОВАТЬ МЕРОПРИЯТИЯ' : '🚀 ОПУБЛИКОВАТЬ РАСПИСАНИЕ'}
                      </span>
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
      {/* MODAL: EVENT EDIT / CREATE (Full Data & Photo Upload)    */}
      {/* ======================================================== */}
      {isEventModalOpen && editingEvent && (
        <EventEditModal
          isOpen={isEventModalOpen}
          event={editingEvent}
          districts={districts}
          token={token}
          onClose={() => {
            setIsEventModalOpen(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRM BULK DELETE EVENTS                        */}
      {/* ======================================================== */}
      {confirmBulkDeleteEventsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Удалить выбранные мероприятия?</h3>
            <p className="text-xs text-slate-600">
              Это действие безвозвратно удалит <strong>{selectedEventIds.length}</strong> выбранных мероприятий из базы данных.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmBulkDeleteEventsOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteEvents}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                Да, удалить
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* ======================================================== */}
      {/* MODAL: CONTACT PARTICIPANT (Phone, WhatsApp, TG, SMS, Mail) */}
      {/* ======================================================== */}
      {contactingRegistration && (
        <ContactParticipantModal
          registration={contactingRegistration}
          onClose={() => setContactingRegistration(null)}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL: VIEW ALL ATTENDEES FOR SCHEDULE OR EVENT          */}
      {/* ======================================================== */}
      {viewingAttendeesFor && (
        <ViewAttendeesModal
          targetType={viewingAttendeesFor.targetType}
          targetId={viewingAttendeesFor.targetId}
          targetTitle={viewingAttendeesFor.targetTitle}
          targetDate={viewingAttendeesFor.targetDate}
          targetTime={viewingAttendeesFor.targetTime}
          targetLocation={viewingAttendeesFor.targetLocation}
          targetDistrict={viewingAttendeesFor.targetDistrict}
          targetSport={viewingAttendeesFor.targetSport}
          capacity={viewingAttendeesFor.capacity}
          token={token}
          onClose={() => setViewingAttendeesFor(null)}
          onAttendeeCountChanged={(newCount) => {
            if (viewingAttendeesFor.targetType === 'schedule') {
              setSchedules(prev => prev.map(s => s.id === viewingAttendeesFor.targetId ? { ...s, enrolled: newCount } : s));
            } else {
              setEventsList(prev => prev.map(e => e.id === viewingAttendeesFor.targetId ? { ...e, registeredCount: newCount } : e));
            }
          }}
          onRegistrationChanged={() => {
            refreshAdminData();
            fetchRegistrations();
            onDataChanged();
          }}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRM BULK DELETE REGISTRATIONS                 */}
      {/* ======================================================== */}
      {confirmBulkDeleteRegsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Удалить выбранные записи?</h3>
            <p className="text-xs text-slate-600">
              Это действие безвозвратно удалит <strong>{selectedRegIds.length}</strong> выбранных заявок на участие.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmBulkDeleteRegsOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteRegistrations}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                Да, удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: MANUAL ADD REGISTRATION                           */}
      {/* ======================================================== */}
      {isManualAddRegOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Внести запись участника вручную</h3>
                  <p className="text-xs text-slate-500">Регистрация по телефонному звонку или личному обращению</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualAddRegOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAddRegistration} className="space-y-4 text-xs">
              {/* Target Type Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Тип активности</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualRegData({
                        ...manualRegData,
                        targetType: 'schedule',
                        targetId: schedules[0]?.id || ''
                      });
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                      manualRegData.targetType === 'schedule'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Занятие в расписании
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualRegData({
                        ...manualRegData,
                        targetType: 'event',
                        targetId: eventsList[0]?.id || ''
                      });
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                      manualRegData.targetType === 'event'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Спортивное мероприятие
                  </button>
                </div>
              </div>

              {/* Activity Dropdown */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Выберите {manualRegData.targetType === 'schedule' ? 'занятие' : 'мероприятие'} *
                </label>
                <select
                  value={manualRegData.targetId}
                  onChange={e => setManualRegData({ ...manualRegData, targetId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  required
                >
                  <option value="">-- Выберите из списка --</option>
                  {manualRegData.targetType === 'schedule' ? (
                    schedules.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.district} р-н, {s.sport}, {s.dayOfWeek} {s.time})
                      </option>
                    ))
                  ) : (
                    eventsList.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.date} {ev.time}, {ev.district} р-н, {ev.sport})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">ФИО участника *</label>
                <input
                  type="text"
                  required
                  placeholder="Иванов Иван Иванович"
                  value={manualRegData.fullName}
                  onChange={e => setManualRegData({ ...manualRegData, fullName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Телефон для связи *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+7 (999) 000-00-00"
                    value={manualRegData.phone}
                    onChange={e => setManualRegData({ ...manualRegData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Email (опционально)</label>
                  <input
                    type="email"
                    placeholder="ivanov@mail.ru"
                    value={manualRegData.email}
                    onChange={e => setManualRegData({ ...manualRegData, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Number of participants */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Количество человек</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setManualRegData({ ...manualRegData, participantsCount: n })}
                      className={`w-10 h-10 rounded-xl font-bold border transition-all cursor-pointer ${
                        manualRegData.participantsCount === n
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Примечание / комментарий</label>
                <textarea
                  rows={2}
                  placeholder="Записался по телефону, уточнял расписание..."
                  value={manualRegData.comment}
                  onChange={e => setManualRegData({ ...manualRegData, comment: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualAddRegOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/20 cursor-pointer transition-all"
                >
                  Сохранить запись
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
