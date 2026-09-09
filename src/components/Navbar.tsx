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
  isAdminLoggedIn: boolean;
  onOpenAdminPortal: () => void;
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
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('hero-section')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                  СПОРТИВНЫЙ ГОРОД
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white font-black text-xs">
                  54
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 tracking-wide block mt-0.5">
                Городской спортивный портал Новосибирска
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-7">
            <button
              type="button"
              onClick={() => handleNavClick('hero-section')}
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Главная
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('schedule')}
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Расписание
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('districts')}
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Районы
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('map')}
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Спортивные объекты
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('news')}
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Новости
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('contacts')}
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Контакты
            </button>
          </nav>

          {/* Right Action: Admin Entry Button */}
          <div className="hidden sm:flex items-center gap-3">
            {isAdminLoggedIn ? (
              <button
                id="btn-nav-admin-portal"
                type="button"
                onClick={onOpenAdminPortal}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Панель управления</span>
              </button>
            ) : (
              <button
                id="btn-nav-admin-login"
                type="button"
                onClick={onOpenAdminModal}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>Вход для администратора</span>
              </button>
            )}
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
            {isAdminLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  onOpenAdminPortal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Панель управления</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onOpenAdminModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-sky-400" />
                <span>Вход для администратора</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
