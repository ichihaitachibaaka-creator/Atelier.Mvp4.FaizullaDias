import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

export default function CTA() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="cta" className="py-28 lg:py-36">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="reveal relative bg-ink rounded-3xl overflow-hidden px-8 py-20 lg:px-20 lg:py-28 text-center grain-overlay">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-clay/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <span className="text-xs font-semibold tracking-widest-plus uppercase text-clay-light">
              Начните сегодня
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-cream mt-5 leading-tight max-w-2xl mx-auto text-balance">
              Ваше следующее лекало
              <br />
              начинается с <span className="italic gradient-text">мерок.</span>
            </h2>
            <p className="text-cream/60 text-lg mt-6 max-w-md mx-auto leading-relaxed">
              Введите параметры и получите точный чертёж за доли секунды.
              Без сложных программ и ручных расчётов.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/workspace"
                className="group inline-flex items-center gap-2.5 bg-cream text-ink px-8 py-4 rounded-full font-semibold text-sm hover:bg-clay hover:text-cream transition-all duration-300 hover:shadow-xl hover:shadow-clay/40 hover:-translate-y-0.5"
              >
                Построить лекало
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
