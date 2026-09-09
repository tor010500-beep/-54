import React from 'react';
import { Phone, Mail, MapPin, Clock, ShieldCheck, HeartHandshake, Award } from 'lucide-react';

interface AboutAndContactsProps {
  id?: string;
}

export const AboutAndContacts: React.FC<AboutAndContactsProps> = ({ id = 'contacts' }) => {
  return (
    <section id={id} className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* About Initiative */}
        <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-sky-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl mb-16 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-blue-500/30 text-sky-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30 inline-block">
              Официальный городской проект
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              «СПОРТИВНЫЙ ГОРОД 54» — доступный массовый спорт в Новосибирске
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Городской портал создан в рамках муниципальной программы популяризации физической культуры и здорового образа жизни. Ежедневно в 10 районах города проводятся бесплатные занятия с профессиональными тренерами: от оздоровительной гимнастики и скандинавской ходьбы до футбольных турниров и плавания.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-sky-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-sm">Квалифицированные тренеры</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Все инструкторы имеют профильное высшее образование и сертификаты.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HeartHandshake className="w-6 h-6 text-lime-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-sm">Бесплатно для всех</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Занятия финансируются городским бюджетом Новосибирска.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-sm">Любой уровень</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Группы для новичков, любителей, детей и старшего поколения 55+.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contacts & Hotlines */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                КОНТАКТЫ И ГОРЯЧАЯ ЛИНИЯ
              </h3>
              <p className="text-slate-600 mt-2 text-sm">
                По вопросам расписания, записи в спортивные секции и предложений по открытию новых площадок в вашем дворе:
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Единая справочная служба спорта</span>
                  <div className="text-lg font-extrabold text-slate-900">+7 (383) 227-40-00</div>
                  <span className="text-xs text-slate-500">Бесплатно для жителей Новосибирска • Пн-Пт 08:30–17:30</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Электронная почта</span>
                  <div className="text-base font-bold text-slate-900">sport54@novo-sibirsk.ru</div>
                  <span className="text-xs text-slate-500">Ответ в течение 1 рабочего дня</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Центральный офис</span>
                  <div className="text-base font-bold text-slate-900">г. Новосибирск, Красный проспект, 34</div>
                  <span className="text-xs text-slate-500">Департамент физической культуры и спорта мэрии г. Новосибирска</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Question Card */}
          <div className="lg:col-span-6 bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-slate-900">Есть вопрос или предложение по площадке?</h4>
              <p className="text-xs sm:text-sm text-slate-600">
                Напишите нам, если вы хотите организовать тренировку в своем дворе или сообщить о состоянии спортивного объекта.
              </p>

              <form onSubmit={(e) => { e.preventDefault(); alert('Спасибо! Ваше обращение принято и передано специалистам.'); }} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ваше имя</label>
                  <input
                    type="text"
                    required
                    placeholder="Алексей"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Телефон</label>
                    <input
                      type="tel"
                      required
                      placeholder="+7 (999) 000-00-00"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Район</label>
                    <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                      <option>Центральный</option>
                      <option>Железнодорожный</option>
                      <option>Заельцовский</option>
                      <option>Октябрьский</option>
                      <option>Дзержинский</option>
                      <option>Кировский</option>
                      <option>Калининский</option>
                      <option>Ленинский</option>
                      <option>Первомайский</option>
                      <option>Советский</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Сообщение</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Напишите вопрос или предложение..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  Отправить обращение
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
