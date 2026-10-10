import { Crosshair, Layers, Download, ArrowRight } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

export default function FeatureSection() {
  const ref = useReveal<HTMLDivElement>();

  const features = [
    {
      icon: Crosshair,
      title: 'Точные координаты',
      desc: 'Каждая точка лекала рассчитывается по строгим математическим формулам — никаких погрешностей и приближений.',
    },
    {
      icon: Layers,
      title: 'Полный комплект деталей',
      desc: 'Полочка, спинка, рукав и воротник — всё на одном чертеже с размерными линиями и контрольными точками.',
    },
    {
      icon: Download,
      title: 'Готовый SVG-файл',
      desc: 'Скачайте векторный чертёж в формате SVG для печати в натуральную величину или импорта в CAD-систему.',
    },
  ];

  return (
    <section id="feature" className="py-28 lg:py-36">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div className="reveal relative order-2 lg:order-1">
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-2xl shadow-ink/15">
                <img
                  src="https://images.pexels.com/photos/7147537/pexels-photo-7147537.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Конструирование лекал"
                  className="w-full h-[560px] object-cover"
                />
              </div>

              <div className="absolute -top-5 -right-5 bg-ink text-cream rounded-2xl px-5 py-4 shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-clay-light animate-shimmer" />
                  <span className="text-xs font-medium tracking-wide">
                    Расчёт
                  </span>
                </div>
                <span className="text-sm font-semibold">Формулы конструирования</span>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-cream-light border border-stone-light rounded-2xl p-5 shadow-xl max-w-[220px]">
                <div className="text-xs text-ink-muted mb-2">Параметры</div>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-medium text-ink">
                  <span>ШИ: 54.5 см</span>
                  <span>Ди: 73 см</span>
                  <span>Гпр: 22 см</span>
                  <span>Шп: 13 см</span>
                </div>
              </div>
            </div>
          </div>

          <div className="reveal reveal-delay-2 order-1 lg:order-2">
            <span className="text-xs font-semibold tracking-widest-plus uppercase text-clay">
              Алгоритмическое конструирование
            </span>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-ink mt-4 leading-tight">
              Математика
              <br />
              <span className="italic gradient-text">вместо догадок.</span>
            </h2>
            <p className="text-lg text-ink-muted mt-5 leading-relaxed">
              Каждое лекало строится по детерминированным формулам
              конструирования одежды — с прибавками на свободу облегания,
              правильной кривизной проймы и точной геометрией рукава.
            </p>

            <div className="mt-10 space-y-6">
              {features.map((f) => (
                <div key={f.title} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-ink/5 border border-stone-light flex items-center justify-center transition-colors duration-300 group-hover:bg-clay group-hover:border-clay">
                    <f.icon
                      size={20}
                      className="text-ink-muted transition-colors duration-300 group-hover:text-cream"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink mb-1">{f.title}</h3>
                    <p className="text-ink-muted leading-relaxed text-[15px]">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="#cta"
              className="group inline-flex items-center gap-2 mt-10 text-sm font-semibold text-ink hover:text-clay transition-colors"
            >
              Попробовать с вашими мерками
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
