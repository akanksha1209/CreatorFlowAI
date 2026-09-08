import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Send, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useChat } from '@/hooks/useChat';
import { getProject } from '@/services/api';
import { ChatMessage } from '@/types';

export const Chat = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projectTopic, setProjectTopic] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, loading, error, sendMessage } = useChat();

  useEffect(() => {
    if (projectId) {
      getProject(parseInt(projectId)).then((project) => {
        setProjectTopic(project.topic);
      });
    }
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get('message') as string;
    
    if (!message.trim() || !projectId) return;
    
    await sendMessage(parseInt(projectId), message);
    e.currentTarget.reset();
  };

  if (!projectId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">AI Chat</h1>
        <EmptyState
          icon={MessageSquare}
          title="No project selected"
          description="Select a project from history or analysis to start chatting."
          action={
            <Button onClick={() => navigate('/history')}>
              View History
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-lg border bg-card">
      {/* Chat Header */}
      <div className="flex items-center gap-4 border-b px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h3 className="font-semibold">AI Assistant</h3>
          <p className="text-xs text-muted-foreground">{projectTopic}</p>
        </div>
        <Badge variant="secondary">Context Aware</Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Start a conversation"
            description="Ask questions about your content, request changes, or get suggestions."
          />
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] ${
                  message.message_type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <CardContent className="p-3">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </CardContent>
              </Card>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <Card className="bg-muted">
              <CardContent className="p-3">
                <LoadingSpinner size="sm" />
              </CardContent>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="border-t p-3">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            name="message"
            placeholder="Ask about your content..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};