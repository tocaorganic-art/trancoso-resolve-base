import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

// Depoimentos só entram aqui quando vierem de avaliações reais de clientes
// (ex.: entidade de avaliação), passados pela prop `testimonials`.
// Nunca usar texto fixo no código nem avatar de banco de imagem: sem
// depoimento real, a seção não é exibida.

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5" aria-label={`${rating} de 5`}>
    {Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
      />
    ))}
  </div>
);

const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export default function Testimonials({ testimonials = [] }) {
  const { t } = useApp();
  const reais = Array.isArray(testimonials)
    ? testimonials.filter((item) => item?.name && item?.comment)
    : [];

  if (reais.length === 0) return null;

  return (
    <section className="bg-slate-100 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 drop-shadow-xs">{t('testimonials.title')}</h2>
          <p className="text-slate-700 mt-2 font-medium text-lg">{t('testimonials.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reais.map((testimonial, index) => (
            <Card key={testimonial.id || index} className="border-none shadow-lg bg-white">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="grow mb-4">
                  {typeof testimonial.rating === 'number' && <StarRating rating={testimonial.rating} />}
                  <p className="text-slate-800 mt-4 italic leading-relaxed text-base">"{testimonial.comment}"</p>
                </div>
                <div className="flex items-center mt-auto">
                  <div
                    aria-hidden="true"
                    className="w-12 h-12 rounded-full mr-4 bg-orange-100 text-orange-700 font-bold flex items-center justify-center"
                  >
                    {initials(testimonial.name)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-base">{testimonial.name}</p>
                    {testimonial.role && <p className="text-sm font-medium text-slate-700">{testimonial.role}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
