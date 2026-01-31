import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Thomas Müller',
    role: 'CEO, TechStart GmbH',
    image: null,
    content: 'FlowCRM hat unsere Operations um 300% effizienter gemacht. Die KI automatisiert repetitive Tasks und wir können uns auf das Wesentliche konzentrieren.',
    rating: 5,
  },
  {
    name: 'Sarah Schmidt',
    role: 'Sales Director, B2B Solutions',
    image: null,
    content: 'Endlich eine Plattform, die CRM, Automation und AI vereint. Keine Tool-Silos mehr, alles in einem System.',
    rating: 5,
  },
  {
    name: 'Michael Weber',
    role: 'Founder, WebAgency Pro',
    image: null,
    content: 'Unsere Prozesse laufen jetzt automatisch. Wir sparen 20 Stunden pro Woche und haben trotzdem bessere Kundenbetreuung.',
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="über-uns" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Kundenstimmen
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Was unsere Kunden
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> sagen</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Über 500 Unternehmen vertrauen auf FlowCRM für ihre Prozessautomatisierung.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
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
              <div className="h-full glass-card p-8 relative overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Quote Icon */}
                <Quote className="absolute top-4 right-4 w-10 h-10 text-primary/10 group-hover:text-primary/20 transition-colors" />

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Logos Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <p className="text-sm text-muted-foreground mb-8">
            Vertraut von führenden Unternehmen
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {['TechCorp', 'InnovateCo', 'GlobalTech', 'FutureLabs', 'NextGen'].map((company, i) => (
              <div key={i} className="text-2xl font-bold text-muted-foreground/50">
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
