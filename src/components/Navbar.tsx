import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface NavbarProps {
  onAuthClick: () => void;
}

export default function Navbar({ onAuthClick }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const links = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Features', href: '#feature' },
    { label: 'Showcase', href: '#showcase' },
    { label: 'Benefits', href: '#benefits' },
  ];

  const userEmail = user?.email ?? '';
  const initials = userEmail.charAt(0).toUpperCase() || 'U';

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    setOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-cream/85 backdrop-blur-xl border-b border-stone-light/60 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <span className="font-display text-cream text-lg font-bold leading-none">A</span>
          </div>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Atelier
          </span>
        </a>

        <div className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-muted hover:text-ink transition-colors duration-200 relative group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-clay transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-full hover:bg-ink/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center">
                  <span className="text-sm font-bold text-cream">{initials}</span>
                </div>
                <span className="text-sm font-medium text-ink max-w-[120px] truncate">
                  {userEmail.split('@')[0]}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-cream-light border border-stone-light rounded-xl shadow-xl py-2 animate-fade-up">
                  <div className="px-4 py-2 border-b border-stone-light">
                    <p className="text-xs font-medium text-ink-muted truncate">{userEmail}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink hover:bg-ink/5 transition-colors"
                  >
                    <LayoutDashboard size={16} className="text-ink-muted" />
                    Личный кабинет
                  </Link>
                  <Link
                    to="/workspace"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink hover:bg-ink/5 transition-colors"
                  >
                    <User size={16} className="text-ink-muted" />
                    Генератор
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-clay-dark hover:bg-clay/5 transition-colors"
                  >
                    <LogOut size={16} />
                    Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={onAuthClick}
                className="text-sm font-medium text-ink-muted hover:text-ink transition-colors px-4 py-2"
              >
                Войти / Регистрация
              </button>
            </>
          )}
          <Link
            to="/workspace"
            className="text-sm font-semibold text-cream bg-ink px-5 py-2.5 rounded-full hover:bg-clay transition-all duration-300 hover:shadow-lg hover:shadow-clay/30"
          >
            Начать
          </Link>
        </div>

        <button
          className="md:hidden p-2 -mr-2 text-ink"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-cream border-t border-stone-light/60 mt-3">
          <div className="px-6 py-6 flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-ink-muted hover:text-ink transition-colors"
              >
                {l.label}
              </a>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-ink"
                >
                  Личный кабинет
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-left text-base font-medium text-clay-dark"
                >
                  Выйти
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  onAuthClick();
                }}
                className="text-left text-base font-medium text-ink"
              >
                Войти / Регистрация
              </button>
            )}
            <Link
              to="/workspace"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-cream bg-ink px-5 py-3 rounded-full text-center mt-2"
            >
              Начать
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
