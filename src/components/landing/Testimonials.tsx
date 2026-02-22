import { motion } from 'framer-motion';
import { Star, Quote, MessageSquare } from 'lucide-react';

const testimonials = [
  {
    name: 'Thomas Müller',
    role: 'CEO, TechStart GmbH',
    content: 'Beavy hat unsere Operations um 300% effizienter gemacht. Die KI automatisiert repetitive Tasks und wir können uns auf das Wesentliche konzentrieren.',
    rating: 5,
  },
  {
    name: 'Sarah Schmidt',
    role: 'Sales Director, B2B Solutions',
    content: 'Endlich eine Plattform, die CRM, Automation und AI vereint. Keine Tool-Silos mehr, alles in einem System.',
    rating: 5,
  },
  {
    name: 'Michael Weber',
    role: 'Founder, WebAgency Pro',
    content: 'Unsere Prozesse laufen jetzt automatisch. Wir sparen 20 Stunden pro Woche und haben trotzdem bessere Kundenbetreuung.',
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="über-uns" className="py-16 relative bg-gradient-to-b from-[#172338] via-[#1c2a44] to-[#152136]">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#3B82F6]/12 rounded-full blur-[120px]" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[#3B82F6] text-sm font-medium mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            Kundenstimmen
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#F8FAFC]">
            Was unsere Kunden
            <span className="text-[#3B82F6]"> sagen</span>
          </h2>
          <p className="text-lg text-[#F8FAFC]/50 max-w-2xl mx-auto">
            Über 500 Unternehmen vertrauen auf Beavy für ihre Prozessautomatisierung.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full p-8 relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/8 hover:border-white/20 transition-all duration-300">
                <Quote className="absolute top-4 right-4 w-10 h-10 text-white/5 group-hover:text-[#3B82F6]/10 transition-colors" />

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-[#F8FAFC]/80 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-[#F8FAFC]">{testimonial.name}</div>
                    <div className="text-sm text-[#F8FAFC]/40">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-[#F8FAFC]/30 mb-8">
            Vertraut von führenden Unternehmen
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {['TechCorp', 'InnovateCo', 'GlobalTech', 'FutureLabs', 'NextGen'].map((company, i) => (
              <div key={i} className="text-2xl font-bold text-white/10">
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
