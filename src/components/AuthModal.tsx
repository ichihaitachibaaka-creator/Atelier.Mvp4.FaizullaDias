import { useState } from 'react';
import { X, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ open, onClose, initialMode = 'login' }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Заполните все поля.');
      return;
    }
    if (mode === 'signup' && password !== confirm) {
      setError('Пароли не совпадают.');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов.');
      return;
    }

    setLoading(true);
    const fn = mode === 'login' ? signIn : signUp;
    const { error: err } = await fn(email, password);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-cream-light rounded-2xl shadow-2xl w-full max-w-md p-8 border border-stone-light animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-ink/5 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X size={20} className="text-ink-muted" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-ink flex items-center justify-center mx-auto mb-4">
            <span className="font-display text-cream text-xl font-bold leading-none">A</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-ink">
            {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
          </h2>
          <p className="text-sm text-ink-muted mt-1.5">
            {mode === 'login'
              ? 'Войдите, чтобы сохранять свои лекала'
              : 'Создайте аккаунт для доступа к истории генераций'}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-clay/5 border border-clay-soft/40">
            <AlertCircle size={18} className="text-clay flex-shrink-0 mt-0.5" />
            <p className="text-sm text-clay-dark">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-muted mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full bg-cream border border-stone-light rounded-xl pl-11 pr-4 py-3 text-sm text-ink font-medium focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-muted mb-1.5 block">Пароль</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cream border border-stone-light rounded-xl pl-11 pr-4 py-3 text-sm text-ink font-medium focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay/20 transition-all"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">Подтвердите пароль</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted/60" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-cream border border-stone-light rounded-xl pl-11 pr-4 py-3 text-sm text-ink font-medium focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay/20 transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2.5 bg-ink text-cream px-6 py-3.5 rounded-full font-semibold text-sm hover:bg-clay transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {mode === 'login' ? 'Вход...' : 'Регистрация...'}
              </>
            ) : (
              mode === 'login' ? 'Войти' : 'Зарегистрироваться'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-5">
          {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            className="text-clay font-medium hover:text-clay-dark transition-colors"
          >
            {mode === 'login' ? 'Регистрация' : 'Войти'}
          </button>
        </p>
      </div>
    </div>
  );
}
