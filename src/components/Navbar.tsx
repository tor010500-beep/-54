import React, { useState } from 'react';
import {
  Activity,
  Menu,
  X,
  Search,
  Lock,
  Calendar,
  MapPin,
  Building2,
  Newspaper,
  PhoneCall,
  User,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  onOpenAdminModal: () => void;
  isAdminLoggedIn?: boolean;
  onOpenAdminPortal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onOpenAdminModal,
  isAdminLoggedIn,
  onOpenAdminPortal
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-[35px] z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 lg:gap-4 xl:gap-6 h-18 min-w-0">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('hero-section')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg xl:text-xl tracking-tight text-slate-900 leading-none whitespace-nowrap">
                  СПОРТИВНЫЙ ГОРОД
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white font-black text-xs shrink-0">
                  54
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 tracking-wide hidden xl:block mt-0.5 truncate">
                Городской спортивный портал Новосибирска
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 2xl:gap-6 shrink-0">
            <button
              id="nav-link-home"
              type="button"
              onClick={() => handleNavClick('hero-section')}
              className="text-xs xl:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Главная
            </button>
            <button
              id="nav-link-schedule"
              type="button"
              onClick={() => handleNavClick('schedule')}
              className="text-xs xl:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Расписание</span>
              <span className="hidden xl:inline"> занятий</span>
            </button>
            <button
              id="nav-link-events"
              type="button"
              onClick={() => handleNavClick('events')}
              className="text-xs xl:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>Мероприятия</span>
              <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse shrink-0" />
            </button>
            <button
              id="nav-link-districts"
              type="button"
              onClick={() => handleNavClick('districts')}
              className="text-xs xl:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Районы
            </button>
            <button
              id="nav-link-map"
              type="button"
              onClick={() => handleNavClick('map')}
              className="text-xs xl:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="hidden xl:inline">Спортивные </span>
              <span>объекты</span>
            </button>
            <button
              id="nav-link-news"
              type="button"
              onClick={() => handleNavClick('news')}
              className="text-xs xl:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Новости
            </button>
            <button
              id="nav-link-contacts"
              type="button"
              onClick={() => handleNavClick('contacts')}
              className="text-xs xl:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Контакты
            </button>
          </nav>

          {/* Right Action: Admin Entry Button */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-3 shrink-0">
            <button
              id="btn-nav-admin-portal"
              type="button"
              onClick={onOpenAdminModal}
              className="px-3 xl:px-4 py-2 xl:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-sm hover:shadow-md flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Lock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="whitespace-nowrap">Панель управления</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Открыть меню"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-fade-in shadow-xl">
          <button
            type="button"
            onClick={() => handleNavClick('hero-section')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Главная
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('schedule')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Расписание занятий
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('events')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center justify-between"
          >
            <span>Расписание мероприятий</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">События</span>
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('districts')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Районы города
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('map')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Спортивные объекты на карте
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('news')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Новости спорта
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('contacts')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Контакты
          </button>

          <div className="pt-3 border-t border-slate-100">
            <button
              id="btn-mobile-admin-portal"
              type="button"
              onClick={() => {
                onOpenAdminModal();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-slate-900 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4 text-sky-400" />
              <span>Панель управления</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
