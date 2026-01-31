import { motion } from 'framer-motion';
import { 
  Workflow, 
  Inbox, 
  Users, 
  BarChart3,
  Zap,
  Globe,
  Lock
} from 'lucide-react';

const features = [
  {
    icon: Workflow,
    title: 'Workflow Automation',
    description: 'Automatisiere wiederkehrende Prozesse mit KI. Vom Lead-Qualifizieren bis zu Follow-ups.',
    color: 'from-primary to-primary/50',
  },
  {
    icon: Inbox,
    title: 'Unified Inbox',
    description: 'Alle Kanäle an einem Ort: Voice, E-Mail und Chat in einer übersichtlichen Inbox.',
    color: 'from-accent to-accent/50',
  },
  {
    icon: Users,
    title: 'CRM',
    description: 'Verwalte Kontakte, Aufgaben und Lead-Daten ohne zusätzliche Tools.',
    color: 'from-success to-success/50',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Erhalte detaillierte Einblicke in die Performance und optimiere Deine Prozesse.',
    color: 'from-warning to-warning/50',
  },
];

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Alles, was du brauchst für
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> automatisierte Prozesse</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Eine Plattform für Sales, Support und Operations. Automatisiere alles, was sich wiederholt.
          </p>
        </motion.div>

        {/* Features Grid - 4 cards in 2x2 layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="h-full glass-card p-8 hover:shadow-xl transition-all duration-300 border-transparent hover:border-primary/20 text-center">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 glass-panel p-8 md:p-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Zap, value: '< 1s', label: 'Latenz', desc: 'Echtzeit-Reaktionen' },
              { icon: Globe, value: '20+', label: 'Sprachen', desc: 'Weltweit einsetzbar' },
              { icon: Lock, value: '100%', label: 'DSGVO', desc: 'Vollständig konform' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
