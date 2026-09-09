import React, { useState, useEffect } from 'react';
import { AccessibilityBar } from './components/AccessibilityBar.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Hero3D } from './components/Hero3D.tsx';
import { ScheduleSection } from './components/ScheduleSection.tsx';
import { EventsSection } from './components/EventsSection.tsx';
import { DistrictsSection } from './components/DistrictsSection.tsx';
import { InteractiveMap } from './components/InteractiveMap.tsx';
import { NewsSection } from './components/NewsSection.tsx';
import { AboutAndContacts } from './components/AboutAndContacts.tsx';
import { Footer } from './components/Footer.tsx';
import { AdminLoginModal } from './components/admin/AdminLoginModal.tsx';
import { AdminPortal } from './components/admin/AdminPortal.tsx';
import { ScheduleItem, District, SportsVenue, NewsItem, SportEventItem } from './types/index.ts';
import {
  INITIAL_SCHEDULES,
  INITIAL_DISTRICTS,
  INITIAL_LOCATIONS,
  INITIAL_NEWS,
  INITIAL_EVENTS
} from './data/initialData.ts';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

export default function App() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('nsk_sport54_schedules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_SCHEDULES;
  });

  const [events, setEvents] = useState<SportEventItem[]>(() => {
    try {
      const saved = localStorage.getItem('nsk_sport54_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_EVENTS;
  });

  const [districts, setDistricts] = useState<District[]>(() => {
    try {
      const saved = localStorage.getItem('nsk_sport54_districts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_DISTRICTS;
  });

  const [venues, setVenues] = useState<SportsVenue[]>(() => {
    try {
      const saved = localStorage.getItem('nsk_sport54_venues');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_LOCATIONS;
  });

  const [news, setNews] = useState<NewsItem[]>(() => {
    try {
      const saved = localStorage.getItem('nsk_sport54_news');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_NEWS;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Filter state for schedules & events
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Все районы');
  const [selectedEventDistrict, setSelectedEventDistrict] = useState<string>('Все районы');

  // Admin state - requires login each time 'Панель управления' is clicked
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);

  // Load public data with resilient fallback for static hosts (GitHub Pages)
  const fetchData = async () => {
    try {
      const [schRes, evRes, distRes, venRes, newsRes] = await Promise.allSettled([
        fetch('/api/schedules'),
        fetch('/api/events'),
        fetch('/api/districts'),
        fetch('/api/locations'),
        fetch('/api/news')
      ]);

      if (schRes.status === 'fulfilled' && schRes.value.ok) {
        const data = await schRes.value.json().catch(() => null);
        if (Array.isArray(data) && data.length > 0) {
          setSchedules(data);
          try { localStorage.setItem('nsk_sport54_schedules', JSON.stringify(data)); } catch {}
        }
      }

      if (evRes.status === 'fulfilled' && evRes.value.ok) {
        const data = await evRes.value.json().catch(() => null);
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data);
          try { localStorage.setItem('nsk_sport54_events', JSON.stringify(data)); } catch {}
        }
      }

      if (distRes.status === 'fulfilled' && distRes.value.ok) {
        const data = await distRes.value.json().catch(() => null);
        if (Array.isArray(data) && data.length > 0) {
          setDistricts(data);
          try { localStorage.setItem('nsk_sport54_districts', JSON.stringify(data)); } catch {}
        }
      }

      if (venRes.status === 'fulfilled' && venRes.value.ok) {
        const data = await venRes.value.json().catch(() => null);
        if (Array.isArray(data) && data.length > 0) {
          setVenues(data);
          try { localStorage.setItem('nsk_sport54_venues', JSON.stringify(data)); } catch {}
        }
      }

      if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
        const data = await newsRes.value.json().catch(() => null);
        if (Array.isArray(data) && data.length > 0) {
          setNews(data);
          try { localStorage.setItem('nsk_sport54_news', JSON.stringify(data)); } catch {}
        }
      }
    } catch (err) {
      console.warn('API fetch note: using local resilient cache / initial dataset (static hosting mode)', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check if URL specifies admin or hash changes to #admin - always require login first
    const checkAdminRoute = () => {
      if (window.location.hash === '#admin' || window.location.pathname.endsWith('/admin')) {
        setIsAdminModalOpen(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, []);

  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    try {
      localStorage.setItem('nsk_sport54_admin_token', token);
    } catch {}
    setIsAdminModalOpen(false);
    setIsAdminPortalOpen(true);
  };

  const handleLogout = () => {
    setAdminToken(null);
    try {
      localStorage.removeItem('nsk_sport54_admin_token');
    } catch {}
    setIsAdminPortalOpen(false);
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDistrictSelect = (districtName: string) => {
    setSelectedDistrict(districtName);
    setSelectedEventDistrict(districtName);
    handleNavigate('schedule');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* 1. Accessibility toolbar (GOST compliant) */}
      <AccessibilityBar />

      {/* 2. Sticky Header Navbar */}
      <Navbar
        onNavigate={handleNavigate}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* 3. Main Content Container */}
      <ErrorBoundary>
        <main className="flex-1">
          {/* Hero Section with 3D Three.js "54", floating cards, and large typography */}
          <Hero3D
            onScrollToSchedule={() => handleNavigate('schedule')}
            onExploreDistricts={() => handleNavigate('districts')}
            onScrollToEvents={() => handleNavigate('events')}
          />

          {/* Schedule Section: 3D Cards / Table / Day Timeline / Week View with full filters */}
          <ScheduleSection
            schedules={schedules}
            selectedDistrict={selectedDistrict}
            onDistrictSelect={setSelectedDistrict}
            id="schedule"
          />

          {/* Events Schedule Section: 3D Cards / Table / Day Timeline / Week View with separate filters */}
          <EventsSection
            events={events}
            selectedDistrict={selectedEventDistrict}
            onDistrictSelect={setSelectedEventDistrict}
            id="events"
          />

          {/* 10 Districts Section: "Спорт во всех районах" */}
          <DistrictsSection
            districts={districts}
            onSelectDistrict={handleDistrictSelect}
            id="districts"
          />

          {/* Interactive Sports Venues Map of Novosibirsk with coordinates & Ob river */}
          <InteractiveMap
            venues={venues}
            onSelectVenueSchedule={handleDistrictSelect}
            id="map"
          />

          {/* Sports News & Events */}
          <NewsSection
            news={news}
            id="news"
          />

          {/* About Initiative & Hotlines */}
          <AboutAndContacts
            id="contacts"
          />
        </main>
      </ErrorBoundary>

      {/* 4. Footer */}
      <Footer
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigate={handleNavigate}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Full-Screen Control Panel */}
      {isAdminPortalOpen && adminToken && (
        <AdminPortal
          token={adminToken}
          onClose={handleLogout}
          onLogout={handleLogout}
          onDataChanged={fetchData}
        />
      )}
    </div>
  );
}
