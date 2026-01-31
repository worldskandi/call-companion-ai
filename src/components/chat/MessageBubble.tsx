import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/hooks/useOpenClawChat';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-primary/10'
            : 'bg-gradient-to-br from-accent to-primary'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      <div
        className={cn(
          'max-w-[80%] px-4 py-2 rounded-2xl',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-md'
            : 'bg-muted/50 rounded-tl-md'
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
            <ReactMarkdown
              components={{
                pre: ({ children }) => (
                  <pre className="bg-background/50 rounded-lg p-3 overflow-x-auto my-2 text-xs">
                    {children}
                  </pre>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs">
                      {children}
                    </code>
                  ) : (
                    <code className={className}>{children}</code>
                  );
                },
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
