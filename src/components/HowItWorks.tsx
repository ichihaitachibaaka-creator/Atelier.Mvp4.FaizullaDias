import { Ruler, Calculator, FileDown } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

export default function HowItWorks() {
  const ref = useReveal<HTMLDivElement>();

  const steps = [
    {
      icon: Ruler,
      title: 'Введите мерки',
      desc: 'Укажите рост, обхваты груди, талии и бёдер. Выберите тип изделия — оверсайз, поло, обычный или слим-фит.',
      num: '01',
    },
    {
      icon: Calculator,
      title: 'Математический расчёт',
      desc: 'Алгоритм применяет формулы конструирования: рассчитывает горловину, пройму, плечо, рукав и воротник с точностью до миллиметра.',
      num: '02',
    },
    {
      icon: FileDown,
      title: 'Готовый чертёж',
      desc: 'Получите векторный SVG-чертёж лекала с размерными линиями, который можно скачать и использовать для раскроя.',
      num: '03',
    },
  ];

  return (
    <section id="how-it-works" className="py-28 lg:py-36 bg-cream-dark/50">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="reveal max-w-2xl mb-20">
          <span className="text-xs font-semibold tracking-widest-plus uppercase text-clay">
            Процесс
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-ink mt-4 leading-tight">
            Три шага от мерок
            <span className="italic gradient-text"> до лекала.</span>
          </h2>
          <p className="text-lg text-ink-muted mt-5 leading-relaxed">
            Никакого программного обучения. Никаких сложных инструментов.
            Просто введите параметры и получите точный чертёж.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-6 relative">
          <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-stone to-transparent" />

          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`reveal reveal-delay-${i + 1} relative`}
            >
              <div className="relative bg-cream-light border border-stone-light rounded-2xl p-8 h-full hover:shadow-xl hover:shadow-ink/5 hover:-translate-y-1 transition-all duration-400">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-ink flex items-center justify-center relative z-10">
                    <step.icon size={24} className="text-cream" />
                  </div>
                  <span className="font-display text-5xl font-bold text-stone-light leading-none">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-ink mb-3">
                  {step.title}
                </h3>
                <p className="text-ink-muted leading-relaxed text-[15px]">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
