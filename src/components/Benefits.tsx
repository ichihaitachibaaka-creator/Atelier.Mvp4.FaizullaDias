import { Zap, Layers, Repeat, Ruler, Shield, Target } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

export default function Benefits() {
  const ref = useReveal<HTMLDivElement>();

  const benefits = [
    {
      icon: Zap,
      title: 'Мгновенный расчёт',
      desc: 'Весь процесс от ввода мерок до готового чертежа занимает доли секунды. Без ожидания и задержек.',
    },
    {
      icon: Layers,
      title: 'Полный комплект деталей',
      desc: 'Полочка, спинка, рукав и воротник — всё рассчитывается автоматически и выводится на один лист.',
    },
    {
      icon: Repeat,
      title: 'Неограниченные варианты',
      desc: 'Меняйте мерки и тип изделия сколько угодно — каждый раз получаете новое точное лекало.',
    },
    {
      icon: Ruler,
      title: 'Посадка по фигуре',
      desc: 'Формулы учитывают обхваты, рост и прибавки на свободу облегания для каждого типа изделия.',
    },
    {
      icon: Shield,
      title: 'Ваши данные остаются вашими',
      desc: 'Все расчёты выполняются локально. Ваши мерки не передаются третьим лицам.',
    },
    {
      icon: Target,
      title: '100% точность',
      desc: 'Детерминированные математические формулы гарантируют одинаковый результат при одних и тех же меркх.',
    },
  ];

  return (
    <section id="benefits" className="py-28 lg:py-36">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="reveal max-w-2xl mb-16">
          <span className="text-xs font-semibold tracking-widest-plus uppercase text-clay">
            Почему выбирают Atelier
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-ink mt-4 leading-tight">
            Всё необходимое.
            <br />
            <span className="italic gradient-text">Ничего лишнего.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-light rounded-2xl overflow-hidden border border-stone-light">
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className={`reveal reveal-delay-${(i % 3) + 1} bg-cream-light p-8 lg:p-10 hover:bg-cream transition-colors duration-300 group`}
            >
              <div className="w-12 h-12 rounded-xl bg-ink/5 border border-stone-light flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-ink group-hover:border-ink">
                <b.icon
                  size={22}
                  className="text-ink-muted transition-colors duration-300 group-hover:text-cream"
                />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink mb-2.5">
                {b.title}
              </h3>
              <p className="text-ink-muted leading-relaxed text-[15px]">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
