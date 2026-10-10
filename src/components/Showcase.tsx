import { ArrowUpRight } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

export default function Showcase() {
  const ref = useReveal<HTMLDivElement>();

  const items = [
    {
      img: 'https://images.pexels.com/photos/1066171/pexels-photo-1066171.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      title: 'Editorial Gown',
      category: 'Eveningwear',
      span: 'lg:row-span-2',
      height: 'h-full',
    },
    {
      img: 'https://images.pexels.com/photos/32628116/pexels-photo-32628116.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      title: 'Sculpted Silhouette',
      category: 'Avant-garde',
      span: '',
      height: 'h-64',
    },
    {
      img: 'https://images.pexels.com/photos/17393964/pexels-photo-17393964.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      title: 'Modern Minimalism',
      category: 'Ready-to-wear',
      span: '',
      height: 'h-64',
    },
    {
      img: 'https://images.pexels.com/photos/7147849/pexels-photo-7147849.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      title: 'Atelier Process',
      category: 'Behind the scenes',
      span: '',
      height: 'h-64',
    },
    {
      img: 'https://images.pexels.com/photos/39282822/pexels-photo-39282822.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      title: 'Structured Form',
      category: 'Tailoring',
      span: '',
      height: 'h-64',
    },
  ];

  return (
    <section id="showcase" className="py-28 lg:py-36 bg-cream-dark/50">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <span className="text-xs font-semibold tracking-widest-plus uppercase text-clay">
              The Showcase
            </span>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-ink mt-4 leading-tight">
              Designs born from
              <span className="italic gradient-text"> sketches.</span>
            </h2>
          </div>
          <p className="text-ink-muted max-w-sm leading-relaxed">
            A curated selection of pieces that started as hand-drawn sketches
            and were transformed through Atelier.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:auto-rows-fr">
          {items.map((item, i) => (
            <div
              key={item.title}
              className={`reveal reveal-delay-${(i % 3) + 1} group relative overflow-hidden rounded-2xl ${item.span}`}
            >
              <div className={`relative ${item.height} overflow-hidden`}>
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                <div className="transform transition-transform duration-500">
                  <span className="text-xs font-medium tracking-widest-plus uppercase text-cream/70 block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-cream">
                    {item.title}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-cream/10 backdrop-blur-md border border-cream/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-x-0 translate-x-3">
                  <ArrowUpRight size={18} className="text-cream" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
