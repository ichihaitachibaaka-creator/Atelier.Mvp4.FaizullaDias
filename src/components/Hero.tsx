import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, Ruler, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden hero-grid-bg">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-clay-soft/40 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-gold-soft/30 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 w-full">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink/5 border border-stone-light mb-8">
              <Calculator size={14} className="text-clay" />
              <span className="text-xs font-medium tracking-widest-plus uppercase text-ink-muted">
                Параметрический генератор лекал
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-ink text-balance">
              Точный расчёт
              <br />
              <span className="gradient-text italic">по вашим меркам.</span>
            </h1>

            <p className="mt-7 text-lg text-ink-muted leading-relaxed max-w-md">
              Введите свои мерки — получите готовое лекало с точными
              математическими координатами. Алгоритмическое конструирование
              за доли секунды.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to="/workspace"
                className="group inline-flex items-center gap-2.5 bg-ink text-cream px-7 py-4 rounded-full font-semibold text-sm hover:bg-clay transition-all duration-300 hover:shadow-xl hover:shadow-clay/30 hover:-translate-y-0.5"
              >
                Начать конструирование
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-2 text-ink font-medium text-sm hover:text-clay transition-colors duration-200"
              >
                <span className="relative">
                  Как это работает
                  <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-ink/20 group-hover:bg-clay transition-colors duration-300" />
                </span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-y-0.5"
                />
              </a>
            </div>

            <div className="mt-14 flex items-center gap-8">
              <div className="flex items-center gap-2.5">
                <Zap size={20} className="text-clay" />
                <div>
                  <div className="text-sm font-semibold text-ink">Мгновенный расчёт</div>
                </div>
              </div>
              <div className="w-px h-12 bg-stone" />
              <div className="flex items-center gap-2.5">
                <Ruler size={20} className="text-clay" />
                <div>
                  <div className="text-sm font-semibold text-ink">Посадка по фигуре</div>
                </div>
              </div>
              <div className="w-px h-12 bg-stone hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2.5">
                <Calculator size={20} className="text-clay" />
                <div>
                  <div className="text-sm font-semibold text-ink">100% точность</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in animation-delay-300">
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl shadow-xl shadow-ink/10 group">
                  <img
                    src="https://images.pexels.com/photos/7257234/pexels-photo-7257234.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Швейное производство"
                    className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-xl shadow-ink/10 group">
                  <img
                    src="https://images.pexels.com/photos/7147456/pexels-photo-7147456.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Раскрой ткани"
                    className="w-full h-44 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-10">
                <div className="overflow-hidden rounded-2xl shadow-xl shadow-ink/10 group">
                  <img
                    src="https://images.pexels.com/photos/1066171/pexels-photo-1066171.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Готовое изделие"
                    className="w-full h-44 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-xl shadow-ink/10 group">
                  <img
                    src="https://images.pexels.com/photos/9849320/pexels-photo-9849320.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Конструирование лекал"
                    className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-cream-light border border-stone-light rounded-2xl px-5 py-4 shadow-2xl shadow-ink/15 flex items-center gap-3 animate-float">
              <div className="w-10 h-10 rounded-full bg-clay/10 flex items-center justify-center">
                <Calculator size={18} className="text-clay" />
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">Точный расчёт</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-ink/30" />
        <span className="text-xs text-ink-muted tracking-widest-plus uppercase">
          Scroll
        </span>
      </div>
    </section>
  );
}
