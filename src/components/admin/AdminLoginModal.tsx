import React, { useState, useEffect } from 'react';
import { Lock, User, Key, X, AlertCircle, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setError(null);
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Verification against required credentials: admins / 24genat1970 (also accept admin)
    const isDirectMatch = (cleanUser === 'admins' || cleanUser === 'admin') && cleanPass === '24genat1970';

    if (!isDirectMatch) {
      // Check if server accepts different credentials
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUser, password: cleanPass }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.token) {
            setSuccess(true);
            setTimeout(() => {
              onLoginSuccess(data.token);
              onClose();
            }, 300);
            return;
          }
        }
      } catch {
        // Continue to error display
      }

      setError('Неверный логин или пароль. Пожалуйста, проверьте введённые данные.');
      setLoading(false);
      return;
    }

    // Direct match succeeded! Generate session and try server sync
    let token = `admin-token-${Date.now()}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.token) {
          token = data.token;
        }
      }
    } catch {
      // Backend offline or static host (GitHub Pages) - token is already generated
    }

    if (rememberMe) {
      try {
        localStorage.setItem('nsk_sport54_admin_username', cleanUser);
      } catch {}
    }

    setSuccess(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(token);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-scale-up space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Form Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Вход в панель управления
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Авторизация для управления расписанием, объектами, новостями и медиафайлами
          </p>
        </div>

        {/* The Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Логин администратора
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-username-input"
                name="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Введите логин"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Пароль администратора
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium cursor-pointer"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Скрыть</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Показать</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password-input"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Введите пароль"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember option */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Запомнить сессию</span>
            </label>
            <span className="text-[11px] text-slate-400">Безопасное соединение</span>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success state */}
          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">Авторизация успешна! Открываем панель...</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="btn-admin-submit-login"
            type="submit"
            disabled={loading || success}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Проверка доступа...
              </span>
            ) : (
              <>
                <span>Войти в панель управления</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

