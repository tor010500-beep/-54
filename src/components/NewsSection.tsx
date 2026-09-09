import React, { useState } from 'react';
import { Calendar, Tag, ChevronRight, X, Eye, Share2 } from 'lucide-react';
import { NewsItem } from '../types/index.ts';
import { CardTilt } from './CardTilt.tsx';

interface NewsSectionProps {
  news: NewsItem[];
  id?: string;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ news, id = 'news' }) => {
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);

  return (
    <section id={id} className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Спортивная жизнь Новосибирска</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              НОВОСТИ И СОБЫТИЯ
            </h2>
            <p className="text-slate-600 mt-2 text-base max-w-xl">
              Открытие новых площадок, городские фестивали ГТО, марафоны и изменения в расписании.
            </p>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.map(item => (
            <CardTilt
              key={item.id}
              id={`news-card-${item.id}`}
              onClick={() => setActiveNews(item)}
              className="h-full"
            >
              <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col h-full hover:border-blue-400 transition-colors">
                {/* Photo banner */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={item.photo}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold shadow-sm uppercase">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-slate-400 gap-1.5 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.preview}
                    </p>
                  </div>

                  {/* Read more button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNews(item);
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Читать новость</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </CardTilt>
          ))}
        </div>

        {/* Read News Modal */}
        {activeNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-scale-up"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-64 w-full bg-slate-900">
                <img
                  src={activeNews.photo}
                  alt={activeNews.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <button
                  type="button"
                  onClick={() => setActiveNews(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-6 right-6">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                    {activeNews.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {activeNews.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
                <div className="flex items-center gap-4 text-xs text-slate-500 pb-3 border-b border-slate-100">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {activeNews.date}
                  </span>
                  <span>г. Новосибирск</span>
                </div>

                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3">
                  <p className="font-semibold text-slate-900 text-base">{activeNews.preview}</p>
                  <p>{activeNews.content}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setActiveNews(null)}
                  className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
