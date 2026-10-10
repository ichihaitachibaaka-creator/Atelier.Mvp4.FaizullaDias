import { Instagram, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-cream-dark/60 border-t border-stone-light pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1.5fr_1fr_1fr] gap-12 mb-16">
          <div>
            <a href="#" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center">
                <span className="font-display text-cream text-lg font-bold leading-none">
                  A
                </span>
              </div>
              <span className="font-display text-xl font-semibold tracking-tight text-ink">
                Atelier
              </span>
            </a>
            <p className="text-ink-muted leading-relaxed text-[15px] max-w-xs">
              Параметрический генератор лекал. Точный математический расчёт
              выкроек по вашим меркам.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:87475393205"
                  className="flex items-center gap-2.5 text-[15px] text-ink-muted hover:text-clay transition-colors duration-200"
                >
                  <Phone size={16} className="text-ink-muted/60" />
                  87475393205
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/neemmui"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-[15px] text-ink-muted hover:text-clay transition-colors duration-200"
                >
                  <Instagram size={16} className="text-ink-muted/60" />
                  @neemmui
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink mb-4">Навигация</h4>
            <ul className="space-y-3">
              <li>
                <a href="#how-it-works" className="text-[15px] text-ink-muted hover:text-clay transition-colors duration-200">
                  Как это работает
                </a>
              </li>
              <li>
                <a href="#feature" className="text-[15px] text-ink-muted hover:text-clay transition-colors duration-200">
                  Возможности
                </a>
              </li>
              <li>
                <a href="#benefits" className="text-[15px] text-ink-muted hover:text-clay transition-colors duration-200">
                  Преимущества
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-light flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ink-muted">
            &copy; 2026 Atelier. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-ink-muted hover:text-ink transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-ink-muted hover:text-ink transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
