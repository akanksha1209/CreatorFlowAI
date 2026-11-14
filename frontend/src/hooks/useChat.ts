import { useState, useCallback } from 'react';
import { getProjectHistory, sendChatMessage } from '@/services/api';
import { ChatMessage } from '@/types';

interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (projectId: number, message: string, context?: any) => Promise<void>;
  loadMessages: (projectId: number) => Promise<void>;
  reset: () => void;
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (projectId: number, message: string, context?: any) => {
    setLoading(true);
    setError(null);
    try {
      // Add user message immediately
      const userMsg: ChatMessage = {
        id: Date.now(),
        message_type: 'user',
        content: message,
        created_at: new Date().toISOString(),
      };
      setMessages((prev: ChatMessage[]) => [...prev, userMsg]);

      const result = await sendChatMessage(projectId, message, context);
      
      // Add AI response
      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        message_type: 'ai',
        content: result.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev: ChatMessage[]) => [...prev, aiMsg]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Chat failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (projectId: number) => {
    setLoading(true);
    setError(null);
    try {
      const history = await getProjectHistory(projectId);
      setMessages(history.chat_messages || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load chat history.');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setLoading(false);
  }, []);

  return { messages, loading, error, sendMessage, loadMessages, reset };
};