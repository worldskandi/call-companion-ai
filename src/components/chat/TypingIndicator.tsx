import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-start gap-3"
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-muted/50">
        <motion.div
          className="w-2 h-2 rounded-full bg-primary/60"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-primary/60"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-primary/60"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
        />
        <span className="ml-2 text-sm text-muted-foreground">OpenClaw denkt nach...</span>
      </div>
    </motion.div>
  );
}
