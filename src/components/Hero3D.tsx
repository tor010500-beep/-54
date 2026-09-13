import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowDown,
  ChevronRight,
  Flame,
  Heart,
  Repeat,
  RotateCcw,
  Play,
  Pause,
  Zap,
  Dumbbell,
  Trophy
} from 'lucide-react';
import { AthleteScene } from './3d/AthleteScene.tsx';
import { WorkoutMode } from './3d/AthleteModel.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';

interface Hero3DProps {
  onScrollToSchedule: () => void;
  onExploreDistricts: () => void;
  onScrollToEvents?: () => void;
}

const WORKOUT_MODES: {
  id: WorkoutMode;
  label: string;
  heartRateBase: number;
  description: string;
  badge: string;
}[] = [
  {
    id: 'cardio',
    label: 'Кардио-драйв',
    heartRateBase: 148,
    description: 'Интервальная выносливость и аэробный ритм',
    badge: 'Жиросжигание'
  },
  {
    id: 'curls',
    label: 'Подъём гантелей',
    heartRateBase: 132,
    description: 'Укрепление бицепсов, плеч и осанки',
    badge: 'Рельеф & Тонус'
  },
  {
    id: 'squats',
    label: 'Приседания',
    heartRateBase: 140,
    description: 'Глубокие приседы для силы ног и кора',
    badge: 'Сила & Баланс'
  },
  {
    id: 'warmup',
    label: 'Разминка',
    heartRateBase: 110,
    description: 'Мягкая мобильность суставов и дыхание',
    badge: 'Каждое утро'
  }
];

export const Hero3D: React.FC<Hero3DProps> = ({
  onScrollToSchedule,
  onExploreDistricts,
  onScrollToEvents
}) => {
  const [currentMode, setCurrentMode] = useState<WorkoutMode>('cardio');
  const [isAutoCycle, setIsAutoCycle] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [repsCount, setRepsCount] = useState<number>(24);
  const controlsRef = useRef<any>(null);

  // Computed heart rate based on mode and speed
  const activeModeData = WORKOUT_MODES.find((m) => m.id === currentMode) || WORKOUT_MODES[0];
  const heartRate = Math.round(activeModeData.heartRateBase * (speed === 1.5 ? 1.12 : speed === 1.25 ? 1.06 : 1.0));
  const caloriesBurned = Math.round(repsCount * 1.8 + 42);

  // Auto-cycle modes if user enabled it
  useEffect(() => {
    if (!isAutoCycle || !isPlaying) return;
    const timer = setInterval(() => {
      setCurrentMode((curr) => {
        const idx = WORKOUT_MODES.findIndex((m) => m.id === curr);
        const next = WORKOUT_MODES[(idx + 1) % WORKOUT_MODES.length];
        return next.id;
      });
    }, 12000);

    return () => clearInterval(timer);
  }, [isAutoCycle, isPlaying]);

  const handleRepUpdate = (newReps: number) => {
    setRepsCount(newReps);
  };

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <section
      id="hero-section"
      className="relative min-h-[94vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-100 via-sky-50/50 to-white pt-16 pb-20"
    >
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] bg-lime-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Typography & CTAs */}
        <div className="lg:col-span-5 text-center lg:text-left space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-semibold tracking-wide shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-lime-500 animate-ping inline-block" />
            <span className="font-bold text-slate-800">НОВОСИБИРСК 2026</span>
            <span className="text-slate-400">•</span>
            <span>Городской спортивный сервис</span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.05]">
              СПОРТИВНЫЙ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-600 to-teal-500">
                КАЛЕНДАРЬ
              </span>
            </h1>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center justify-center lg:justify-start gap-2">
              <span>Спорт рядом с вами</span>
              <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                10 районов
              </span>
            </p>
          </div>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
            Бесплатные тренировки с сертифицированными инструкторами во всех районах Новосибирска: от утренней гимнастики и йоги до волейбольных турниров и силового тренинга.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
            <button
              id="btn-hero-schedule"
              type="button"
              onClick={onScrollToSchedule}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-sky-500/25 hover:shadow-sky-500/35 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Спортивный календарь</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {onScrollToEvents && (
              <button
                id="btn-hero-events"
                type="button"
                onClick={onScrollToEvents}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Мероприятия</span>
              </button>
            )}

            <button
              id="btn-hero-districts"
              type="button"
              onClick={onExploreDistricts}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base border border-slate-200 shadow-sm hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Районы</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-5 border-t border-slate-200/80 max-w-md mx-auto lg:mx-0">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">240+</div>
              <div className="text-xs text-slate-500 font-medium">Занятий в неделю</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">10</div>
              <div className="text-xs text-slate-500 font-medium">Районов города</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-lime-600">100%</div>
              <div className="text-xs text-slate-500 font-medium">Бесплатно</div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Athlete Interactive Stage & Floating Cards */}
        <div className="lg:col-span-7 relative h-[560px] sm:h-[620px] lg:h-[680px] flex items-center justify-center">
          {/* Live HUD Header above 3D athlete */}
          <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-20 w-max max-w-[94%]">
            <div className="px-4 py-2 rounded-full bg-slate-900/90 backdrop-blur-md text-white border border-white/20 shadow-2xl flex items-center gap-2.5 sm:gap-3 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping inline-block shrink-0" />
              <span className="font-bold text-white truncate">{activeModeData.label}</span>
              <span className="text-slate-500 hidden sm:inline">•</span>

              <span className="flex items-center gap-1 text-rose-300 font-mono">
                <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse fill-rose-400 shrink-0" />
                <span>{heartRate} уд/мин</span>
              </span>

              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="flex items-center gap-1 text-lime-300 font-mono font-bold">
                <Flame className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                <span>{caloriesBurned} ккал</span>
              </span>

              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-sky-300 font-mono font-bold hidden sm:inline">
                {repsCount} повт.
              </span>
            </div>
          </div>

          {/* 3D Viewport Toolbar (Right side) */}
          <div className="absolute top-4 right-3 z-20 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={handleResetCamera}
              title="Сбросить ракурс камеры"
              className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 shadow-md border border-slate-200/80 backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Пауза анимации' : 'Возобновить упражнение'}
              className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-lime-600 shadow-md border border-slate-200/80 backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

          {/* Interactive React Three Fiber Canvas */}
          <div className="w-full h-full absolute inset-0 z-0">
            <ErrorBoundary
              fallback={
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white p-6 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-lime-500/20 text-lime-400 flex items-center justify-center mb-3">
                    <Dumbbell className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight mb-1">Спортивный Город 54</h3>
                  <p className="text-xs text-slate-300 max-w-xs">
                    Интерактивный 3D-тренер (для полного 3D включите аппаратное ускорение в браузере)
                  </p>
                </div>
              }
            >
              <AthleteScene
                currentMode={currentMode}
                speed={speed}
                isPlaying={isPlaying}
                onRepUpdate={handleRepUpdate}
                controlsRef={controlsRef}
              />
            </ErrorBoundary>
          </div>

          {/* 3D Rotation Interaction Hint */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-80 sm:opacity-90">
            <div className="px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-sm text-[11px] font-medium text-slate-200 border border-white/10 shadow-sm flex items-center gap-1.5">
              <span>↻ Вращайте 360° мышью или пальцем</span>
              <span className="hidden sm:inline text-slate-400">• Масштаб колёсиком</span>
            </div>
          </div>

          {/* CARD 1: «СЕГОДНЯ» — Floating Left */}
          <div
            id="hero-card-today"
            onClick={onScrollToSchedule}
            className="absolute left-2 sm:left-4 top-20 sm:top-28 z-20 w-56 sm:w-64 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group cursor-pointer"
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[11px] font-black tracking-wider uppercase shadow-sm shadow-blue-500/25">
                  СЕГОДНЯ
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="flex items-center text-xs font-bold text-blue-700 gap-1 bg-blue-50 px-2 py-0.5 rounded-md">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>18:00</span>
              </div>
            </div>

            {/* Workout Details */}
            <div className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
              Волейбол 6х6
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">
              Инструктор: Соколова Е.М.
            </div>

            <div className="flex items-center text-xs text-slate-500 gap-1 mt-2 pt-2 border-t border-slate-200/80">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">Советский р-н, Шлюз</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 mt-2 text-[10px] font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2 py-1 rounded-md">
              <Zap className="w-3 h-3 text-sky-500" />
              <span>Открытый набор • Свободные места</span>
            </div>
          </div>

          {/* CARD 2: «ЗАВТРА» — Floating Right */}
          <div
            id="hero-card-tomorrow"
            onClick={onScrollToSchedule}
            className="absolute right-2 sm:right-4 bottom-24 sm:bottom-28 z-20 w-56 sm:w-64 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group cursor-pointer"
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-lime-500 text-slate-950 text-[11px] font-black tracking-wider uppercase shadow-sm">
                  ЗАВТРА
                </span>
                <span className="w-2 h-2 rounded-full bg-lime-500 animate-ping" />
              </div>
              <div className="flex items-center text-xs font-bold text-emerald-800 gap-1 bg-lime-50 px-2 py-0.5 rounded-md">
                <Clock className="w-3.5 h-3.5 text-lime-600" />
                <span>08:30</span>
              </div>
            </div>

            {/* Workout Details */}
            <div className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
              Городская зарядка
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">
              Инструктор: Морозов А.В.
            </div>

            <div className="flex items-center text-xs text-slate-500 gap-1 mt-2 pt-2 border-t border-slate-200/80">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">Центральный парк культуры</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-lime-50/80 px-2 py-1 rounded-md">
              <Flame className="w-3 h-3 text-lime-600" />
              <span>Утренняя разминка</span>
            </div>
          </div>

          {/* Workout Coach Control Bar at bottom */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-3">
            <div className="p-2 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold text-slate-700">
              {/* Exercise Mode Pills */}
              <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {WORKOUT_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setCurrentMode(mode.id);
                      setIsAutoCycle(false);
                    }}
                    className={`flex-1 sm:flex-none py-1.5 px-3 rounded-xl transition-all whitespace-nowrap text-center cursor-pointer ${
                      currentMode === mode.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Speed & Auto-Cycle toggles */}
              <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                {/* Speed Multipliers */}
                {[1.0, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setSpeed(spd)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                      speed === spd
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setIsAutoCycle(!isAutoCycle)}
                  title={isAutoCycle ? 'Автосмена упражнений активна' : 'Включить автосмену'}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isAutoCycle
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Down arrow anchor */}
      <button
        id="btn-hero-scroll-down"
        type="button"
        onClick={onScrollToSchedule}
        aria-label="Прокрутить к расписанию"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-blue-600 shadow-md transition-all hover:scale-110 cursor-pointer"
      >
        <ArrowDown className="w-5 h-5 animate-bounce" />
      </button>
    </section>
  );
};
