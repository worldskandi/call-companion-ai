import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pageContext?: string;
}

interface DbConversation {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface DbMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  page_context: string | null;
  created_at: string;
}

const CHAT_URL = 'https://dwuelcsawiudvihxeddc.supabase.co/functions/v1/openclaw-chat';
const CONVERSATION_STORAGE_KEY = 'openclaw_conversation_id';

export function useOpenClawChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const location = useLocation();
  const { user } = useAuth();

  // Get current page context from route
  const pageContext = location.pathname;

  // Get friendly page name for display
  const getPageName = useCallback((path: string): string => {
    const pageNames: Record<string, string> = {
      '/app': 'Dashboard',
      '/app/leads': 'Leads',
      '/app/campaigns': 'Kampagnen',
      '/app/calls': 'Anrufe',
      '/app/analytics': 'Analytics',
      '/app/settings': 'Einstellungen',
      '/app/meetings': 'Meetings',
      '/app/phone-numbers': 'Telefonnummern',
    };
    return pageNames[path] || path.replace('/app/', '').replace('/', ' ');
  }, []);

  const pageName = getPageName(pageContext);

  // Initialize conversation on mount
  useEffect(() => {
    if (!user) {
      setIsInitializing(false);
      return;
    }

    const initConversation = async () => {
      try {
        // Try to restore conversation from localStorage
        const storedConversationId = localStorage.getItem(CONVERSATION_STORAGE_KEY);
        
        if (storedConversationId) {
          // Verify conversation exists and belongs to user
          const { data: conversation, error: convError } = await supabase
            .from('chat_conversations')
            .select('*')
            .eq('id', storedConversationId)
            .single();

          if (!convError && conversation) {
            // Load messages for this conversation
            const { data: dbMessages } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('conversation_id', storedConversationId)
              .order('created_at', { ascending: true });

            if (dbMessages && dbMessages.length > 0) {
              const loadedMessages: ChatMessage[] = (dbMessages as DbMessage[]).map((m) => ({
                id: m.id,
                role: m.role as 'user' | 'assistant',
                content: m.content,
                timestamp: new Date(m.created_at),
                pageContext: m.page_context || undefined,
              }));
              setMessages(loadedMessages);
            }
            setConversationId(storedConversationId);
            setIsInitializing(false);
            return;
          }
        }

        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('chat_conversations')
          .insert({ user_id: user.id, title: null })
          .select()
          .single();

        if (createError) {
          console.error('Failed to create conversation:', createError);
        } else if (newConv) {
          const conv = newConv as DbConversation;
          setConversationId(conv.id);
          localStorage.setItem(CONVERSATION_STORAGE_KEY, conv.id);
        }
      } catch (err) {
        console.error('Error initializing conversation:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initConversation();
  }, [user]);

  // Save message to database
  const saveMessageToDb = useCallback(async (
    role: 'user' | 'assistant',
    content: string,
    context?: string
  ): Promise<string | null> => {
    if (!conversationId) return null;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role,
          content,
          page_context: context || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to save message:', error);
        return null;
      }

      // Update conversation title if first user message
      if (role === 'user') {
        const { data: msgCount } = await supabase
          .from('chat_messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conversationId);

        if (msgCount === null || (typeof msgCount === 'number' && msgCount <= 1)) {
          const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
          await supabase
            .from('chat_conversations')
            .update({ title, updated_at: new Date().toISOString() })
            .eq('id', conversationId);
        }
      }

      return (data as DbMessage)?.id || null;
    } catch (err) {
      console.error('Error saving message:', err);
      return null;
    }
  }, [conversationId]);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return;

    setError(null);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      pageContext,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Save user message to DB
    saveMessageToDb('user', userMessage.content, pageContext);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    let assistantContent = '';
    let assistantMessageId: string | null = null;

    const upsertAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date(),
          },
        ];
      });
    };

    try {
      // Build messages array for API (only role + content)
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: apiMessages,
          pageContext,
          conversationId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${resp.status}`);
      }

      if (!resp.body) {
        throw new Error('No response body');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            // Incomplete JSON, put it back and wait for more
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            /* ignore partial leftovers */
          }
        }
      }

      // Save assistant message to DB after streaming completes
      if (assistantContent) {
        saveMessageToDb('assistant', assistantContent);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled
        return;
      }
      console.error('OpenClaw chat error:', err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, isLoading, pageContext, conversationId, saveMessageToDb]);

  const startNewConversation = useCallback(async () => {
    if (!user) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      const { data: newConv, error: createError } = await supabase
        .from('chat_conversations')
        .insert({ user_id: user.id, title: null })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create new conversation:', createError);
        return;
      }

      if (newConv) {
        const conv = newConv as DbConversation;
        setConversationId(conv.id);
        localStorage.setItem(CONVERSATION_STORAGE_KEY, conv.id);
        setMessages([]);
        setError(null);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error creating new conversation:', err);
    }
  }, [user]);

  const clearChat = useCallback(() => {
    startNewConversation();
  }, [startNewConversation]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    isInitializing,
    error,
    sendMessage,
    clearChat,
    cancelRequest,
    startNewConversation,
    pageContext,
    pageName,
    conversationId,
  };
}
