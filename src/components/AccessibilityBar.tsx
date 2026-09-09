import React, { useState, useEffect } from 'react';
import { Eye, Type, Sun, Volume2, RotateCcw } from 'lucide-react';

interface AccessibilitySettings {
  contrast: 'normal' | 'high' | 'yellow';
  textSize: 'normal' | 'large' | 'xlarge';
  noAnimations: boolean;
}

export const AccessibilityBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    contrast: 'normal',
    textSize: 'normal',
    noAnimations: false
  });

  useEffect(() => {
    // Apply classes to body
    const body = document.body;
    body.classList.remove(
      'accessibility-high-contrast',
      'accessibility-large-text',
      'accessibility-xlarge-text',
      'accessibility-no-animations'
    );

    if (settings.contrast === 'high') {
      body.classList.add('accessibility-high-contrast');
    }
    if (settings.textSize === 'large') {
      body.classList.add('accessibility-large-text');
    } else if (settings.textSize === 'xlarge') {
      body.classList.add('accessibility-xlarge-text');
    }
    if (settings.noAnimations) {
      body.classList.add('accessibility-no-animations');
    }
  }, [settings]);

  const resetSettings = () => {
    setSettings({
      contrast: 'normal',
      textSize: 'normal',
      noAnimations: false
    });
  };

  return (
    <div id="accessibility-toolbar" className="bg-slate-900 text-white border-b border-slate-800 text-xs py-1.5 px-4 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" aria-hidden="true" />
          <span className="font-semibold tracking-wide">Версия для слабовидящих</span>
          <span className="text-slate-400 hidden sm:inline">| ГОСТ Р 52872-2019</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Text Size */}
          <div className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 mr-1">Шрифт:</span>
            <button
              id="btn-font-normal"
              type="button"
              aria-label="Обычный размер шрифта"
              onClick={() => setSettings(s => ({ ...s, textSize: 'normal' }))}
              className={`px-2 py-0.5 rounded font-medium ${settings.textSize === 'normal' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
            >
              A
            </button>
            <button
              id="btn-font-large"
              type="button"
              aria-label="Увеличенный шрифт"
              onClick={() => setSettings(s => ({ ...s, textSize: 'large' }))}
              className={`px-2 py-0.5 rounded text-sm font-semibold ${settings.textSize === 'large' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
            >
              A+
            </button>
            <button
              id="btn-font-xlarge"
              type="button"
              aria-label="Максимальный шрифт"
              onClick={() => setSettings(s => ({ ...s, textSize: 'xlarge' }))}
              className={`px-2 py-0.5 rounded text-base font-bold ${settings.textSize === 'xlarge' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
            >
              A++
            </button>
          </div>

          {/* Contrast Mode */}
          <div className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 mr-1">Контраст:</span>
            <button
              id="btn-contrast-normal"
              type="button"
              aria-label="Стандартная цветовая схема"
              onClick={() => setSettings(s => ({ ...s, contrast: 'normal' }))}
              className={`px-2 py-0.5 rounded ${settings.contrast === 'normal' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
            >
              Стандарт
            </button>
            <button
              id="btn-contrast-high"
              type="button"
              aria-label="Черно-белый высокий контраст"
              onClick={() => setSettings(s => ({ ...s, contrast: 'high' }))}
              className={`px-2 py-0.5 rounded ${settings.contrast === 'high' ? 'bg-white text-black font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
            >
              Ч/Б
            </button>
          </div>

          {/* Animations */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-toggle-animations"
              type="button"
              aria-label="Переключить анимации"
              onClick={() => setSettings(s => ({ ...s, noAnimations: !s.noAnimations }))}
              className={`px-2 py-0.5 rounded ${settings.noAnimations ? 'bg-amber-400 text-slate-950 font-semibold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
            >
              {settings.noAnimations ? 'Анимация: Выкл' : 'Анимация: Вкл'}
            </button>
          </div>

          {/* Reset */}
          <button
            id="btn-reset-accessibility"
            type="button"
            onClick={resetSettings}
            aria-label="Сбросить настройки для слабовидящих"
            className="text-slate-400 hover:text-white flex items-center gap-1 ml-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Сброс</span>
          </button>
        </div>
      </div>
    </div>
  );
};
