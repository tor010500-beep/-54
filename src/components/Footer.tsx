import React from 'react';
import { Activity, Heart, ArrowUp, Send } from 'lucide-react';

interface FooterProps {
  onScrollToTop: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenAdminModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToTop, onNavigate, onOpenAdminModal }) => {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1 & 2: Branding & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight">СПОРТИВНЫЙ ГОРОД 54</span>
                <span className="text-[11px] text-slate-400 block font-medium">Новосибирск • Единый портал</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Информационный сервис мэрии города Новосибирска и спортивных клубов районов. Все занятия проводятся бесплатно для зарегистрированных жителей города.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://vk.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
                title="ВКонтакте"
              >
                VK
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
                title="Telegram"
              >
                TG
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
                title="YouTube"
              >
                YT
              </a>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Навигация</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button type="button" onClick={() => onNavigate('hero-section')} className="hover:text-sky-400 transition-colors cursor-pointer">
                  Главная
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('schedule')} className="hover:text-sky-400 transition-colors cursor-pointer">
                  Спортивный календарь
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('events')} className="hover:text-sky-400 transition-colors cursor-pointer">
                  Расписание мероприятий
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('districts')} className="hover:text-sky-400 transition-colors cursor-pointer">
                  Районы Новосибирска
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('map')} className="hover:text-sky-400 transition-colors cursor-pointer">
                  Карта спортивных площадок
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('news')} className="hover:text-sky-400 transition-colors cursor-pointer">
                  Новости и события
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Districts Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Районы</h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li><button type="button" onClick={() => onNavigate('districts')} className="hover:text-sky-400">Центральный</button></li>
              <li><button type="button" onClick={() => onNavigate('districts')} className="hover:text-sky-400">Заельцовский</button></li>
              <li><button type="button" onClick={() => onNavigate('districts')} className="hover:text-sky-400">Ленинский</button></li>
              <li><button type="button" onClick={() => onNavigate('districts')} className="hover:text-sky-400">Советский (Академгородок)</button></li>
              <li><button type="button" onClick={() => onNavigate('districts')} className="hover:text-sky-400">Октябрьский</button></li>
              <li><button type="button" onClick={() => onNavigate('districts')} className="hover:text-sky-400">Калининский</button></li>
            </ul>
          </div>

          {/* Col 5: Documents & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Служебное</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <a href="#rules" className="hover:text-sky-400">Правила посещения</a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-sky-400">Политика конфиденциальности</a>
              </li>
              <li>
                <a href="#gost" className="hover:text-sky-400">Доступность (ГОСТ)</a>
              </li>
              <li className="pt-2">
                <button
                  type="button"
                  onClick={onOpenAdminModal}
                  className="text-slate-500 hover:text-sky-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Вход в панель управления</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 Муниципальный портал «СПОРТИВНЫЙ ГОРОД 54». Город Новосибирск. Все права защищены.
          </div>

          <button
            type="button"
            onClick={onScrollToTop}
            aria-label="Наверх"
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>Наверх</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
