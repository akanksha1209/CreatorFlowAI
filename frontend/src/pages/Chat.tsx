import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useChat } from '@/hooks/useChat';
import { useProjects } from '@/hooks/useProjects';
import { getProject } from '@/services/api';

export const Chat = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projectTopic, setProjectTopic] = useState('');
  const [projectError, setProjectError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, loading, error, sendMessage, loadMessages, reset } = useChat();
  const { projects, fetchProjects, loading: projectsLoading, error: projectsError } = useProjects();

  useEffect(() => {
    if (!projectId) {
      fetchProjects();
      return;
    }
    const id = Number(projectId);
    if (!Number.isInteger(id) || id < 1) {
      setProjectError('Invalid project. Choose a project from your history.');
      return;
    }
    setProjectError(null);
    setProjectTopic('');
    reset();
    getProject(id)
      .then(project => setProjectTopic(project.topic))
      .catch(err => setProjectError(err.response?.data?.detail || 'Could not load this project.'));
    loadMessages(id);
  }, [projectId, fetchProjects, loadMessages, reset]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = String(new FormData(form).get('message') || '').trim();
    if (!message || !projectId || loading) return;
    form.reset();
    await sendMessage(Number(projectId), message);
  };

  if (!projectId) {
    return <div className="space-y-6"><div><h1 className="text-2xl font-bold">AI Chat</h1><p className="mt-1 text-sm text-muted-foreground">Choose a project to continue its saved conversation.</p></div>{projectsLoading ? <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div> : projectsError ? <ErrorState message={projectsError} onRetry={() => fetchProjects()} /> : projects.length ? <div className="grid gap-4 md:grid-cols-2">{projects.map(project => <Card key={project.id}><CardContent className="flex items-center justify-between gap-4 p-4"><div><h2 className="font-semibold">{project.topic}</h2><p className="text-sm text-muted-foreground">{project.summary || 'Continue brainstorming for this topic.'}</p></div><Button onClick={() => navigate(`/chat/${project.id}`)}>Open chat</Button></CardContent></Card>)}</div> : <EmptyState icon={MessageSquare} title="No projects yet" description="Create a content project first to start chatting." action={<Button onClick={() => navigate('/new')}>Create a project</Button>} />}</div>;
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[420px] flex-col rounded-lg border bg-card">
      <div className="flex items-center gap-4 border-b px-4 py-3">
        <Button variant="ghost" size="icon" aria-label="Back to project list" onClick={() => navigate('/chat')}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1"><h3 className="font-semibold">AI Assistant</h3><p className="text-xs text-muted-foreground">{projectTopic || 'Loading project…'}</p></div>
        <Badge variant="secondary">Context Aware</Badge>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {!messages.length && !loading ? <EmptyState icon={MessageSquare} title="Start a conversation" description="Ask questions about your content, request changes, or get suggestions." /> : messages.map(message => <div key={message.id} className={`flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}><Card className={`max-w-[80%] ${message.message_type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}><CardContent className="p-3"><p className="whitespace-pre-wrap text-sm">{message.content}</p></CardContent></Card></div>)}
        {loading && <div className="flex justify-start"><Card className="bg-muted"><CardContent className="p-3"><LoadingSpinner size="sm" /></CardContent></Card></div>}
        <div ref={messagesEndRef} />
      </div>
      {(error || projectError) && <div role="alert" className="border-t p-3"><p className="text-sm text-red-500">{projectError || error}</p></div>}
      <form onSubmit={handleSend} className="border-t p-4"><div className="flex gap-2"><Input name="message" placeholder="Ask about your content..." disabled={loading || Boolean(projectError)} className="flex-1" /><Button type="submit" aria-label="Send message" disabled={loading || Boolean(projectError)}><Send className="h-4 w-4" /></Button></div></form>
    </div>
  );
};
