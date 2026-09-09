import React, { useState, useEffect } from 'react';
import { AccessibilityBar } from './components/AccessibilityBar.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Hero3D } from './components/Hero3D.tsx';
import { ScheduleSection } from './components/ScheduleSection.tsx';
import { DistrictsSection } from './components/DistrictsSection.tsx';
import { InteractiveMap } from './components/InteractiveMap.tsx';
import { NewsSection } from './components/NewsSection.tsx';
import { AboutAndContacts } from './components/AboutAndContacts.tsx';
import { Footer } from './components/Footer.tsx';
import { AdminLoginModal } from './components/admin/AdminLoginModal.tsx';
import { AdminPortal } from './components/admin/AdminPortal.tsx';
import { ScheduleItem, District, SportsVenue, NewsItem } from './types/index.ts';

export default function App() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [venues, setVenues] = useState<SportsVenue[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state for schedules
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Все районы');

  // Admin state
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('nsk_sport54_admin_token');
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);

  // Load public data
  const fetchData = async () => {
    try {
      const [schRes, distRes, venRes, newsRes] = await Promise.all([
        fetch('/api/schedules'),
        fetch('/api/districts'),
        fetch('/api/locations'),
        fetch('/api/news')
      ]);

      if (schRes.ok) setSchedules(await schRes.json());
      if (distRes.ok) setDistricts(await distRes.json());
      if (venRes.ok) setVenues(await venRes.json());
      if (newsRes.ok) setNews(await newsRes.json());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check if URL specifies admin
    if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
      if (adminToken) {
        setIsAdminPortalOpen(true);
      } else {
        setIsAdminModalOpen(true);
      }
    }
  }, []);

  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('nsk_sport54_admin_token', token);
    setIsAdminPortalOpen(true);
  };

  const handleLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('nsk_sport54_admin_token');
    setIsAdminPortalOpen(false);
  };

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDistrictSelect = (districtName: string) => {
    setSelectedDistrict(districtName);
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
        isAdminLoggedIn={!!adminToken}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
      />

      {/* 3. Main Content Container */}
      <main className="flex-1">
        {/* Hero Section with 3D Three.js "54", floating cards, and large typography */}
        <Hero3D
          onScrollToSchedule={() => handleNavigate('schedule')}
          onExploreDistricts={() => handleNavigate('districts')}
        />

        {/* Schedule Section: 3D Cards / Table / Day Timeline / Week View with full filters */}
        <ScheduleSection
          schedules={schedules}
          selectedDistrict={selectedDistrict}
          onDistrictSelect={setSelectedDistrict}
          id="schedule"
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

      {/* 4. Footer */}
      <Footer
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigate={handleNavigate}
        onOpenAdminModal={() => {
          if (adminToken) {
            setIsAdminPortalOpen(true);
          } else {
            setIsAdminModalOpen(true);
          }
        }}
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
          onClose={() => setIsAdminPortalOpen(false)}
          onLogout={handleLogout}
          onDataChanged={fetchData}
        />
      )}
    </div>
  );
}
