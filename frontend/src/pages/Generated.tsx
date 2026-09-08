import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGeneration } from '@/hooks/useGeneration';
import { useProjects } from '@/hooks/useProjects';
import { GeneratedContent } from '@/types';
import {
  Copy,
  RefreshCw,
  Edit3,
  Download,
  Share2,
  BookOpen,
  Lightbulb,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

export const Generated = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { content, loading, error, generate, reset } = useGeneration();
  const { fetchProject, currentProject } = useProjects();
  const [activeTab, setActiveTab] = useState('titles');

  useEffect(() => {
    if (projectId) {
      fetchProject(parseInt(projectId));
    }
  }, [projectId, fetchProject]);

  useEffect(() => {
    if (projectId && currentProject) {
      generate(parseInt(projectId));
    }
  }, [projectId, currentProject, generate]);

  const handleRegenerate = () => {
    if (projectId) {
      generate(parseInt(projectId), true);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Generated Content</h1>
        <ErrorState message={error} onRetry={() => projectId && generate(parseInt(projectId))} />
      </div>
    );
  }

  if (!content && !loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Generated Content</h1>
        <EmptyState
          icon={BookOpen}
          title="No content generated"
          description="Analyze a topic first to generate content."
          action={
            <Button onClick={() => navigate('/')}>
              Go to Home
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Generated Content</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRegenerate} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button onClick={() => navigate(`/chat/${projectId}`)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat About This
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="titles">Titles</TabsTrigger>
          <TabsTrigger value="hooks">Hooks</TabsTrigger>
          <TabsTrigger value="script">Script</TabsTrigger>
          <TabsTrigger value="caption">Caption</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
          <TabsTrigger value="cta">CTA</TabsTrigger>
          <TabsTrigger value="angles">Angles</TabsTrigger>
          <TabsTrigger value="future">Future Ideas</TabsTrigger>
          <TabsTrigger value="repurposing">Repurposing</TabsTrigger>
        </TabsList>

        <TabsContent value="titles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Titles</CardTitle>
            </CardHeader>
            <CardContent>
              {content?.titles ? (
                <div className="space-y-2">
                  {content.titles.map((title, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-lg border p-3">
                      <span className="text-sm font-medium">{index + 1}.</span>
                      <span className="flex-1 text-sm">{title}</span>
                      <CopyButton text={title} />
                    </div>
                  ))}
                </div>
              ) : (
                <LoadingSpinner />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Hooks</CardTitle>
            </CardHeader>
            <CardContent>
              {content?.hooks ? (
                <div className="space-y-2">
                  {content.hooks.map((hook, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-lg border p-3">
                      <span className="text-sm font-medium">{index + 1}.</span>
                      <span className="flex-1 text-sm">{hook}</span>
                      <CopyButton text={hook} />
                    </div>
                  ))}
                </div>
              ) : (
                <LoadingSpinner />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="script" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Script</CardTitle>
            </CardHeader>
            <CardContent>
              {content?.script ? (
                <div className="space-y-4">
                  <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
                    {content.script}
                  </pre>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleCopy(content.script)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Script
                    </Button>
                  </div>
                </div>
              ) : (
                <LoadingSpinner />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Caption / Description</CardTitle>
            </CardHeader>
            <CardContent>
              {content?.caption ? (
                <div className="space-y-4">
                  <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
                    {content.caption}
                  </pre>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleCopy(content.caption)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Caption
                    </Button>
                  </div>
                </div>
              ) : (
                <LoadingSpinner />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hashtags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hashtags</CardTitle>
            </CardHeader>
            <CardContent>
              {content?.hashtags ? (
                <div className="flex flex-wrap gap-2">
                  {content.hashtags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <LoadingSpinner />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call to Action</CardTitle>
            </CardHeader>
            <CardContent>
              {content?.cta ? (
                <div className="rounded-lg border p-4">
                  <p className="text-lg font-medium">{content.cta}</p>
                </div>
              ) : (
                <LoadingSpinner />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="angles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alternative Content Angles</CardTitle>
            </CardHeader>
            <CardContent>
              {content?.alternative_angles ? (
                <div className="space-y-4">
                  {content.alternative_angles.map((angle, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <h4 className="font-medium">{angle.name}</h4>
                      <p className="text-sm text-muted-foreground">{angle.concept}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Why it could work: {angle.why_it_could_work}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <LoadingSpinner />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="future" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Future Content Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              {content?.future_ideas ? (
                <div className="space-y-2">
                  {content.future_ideas.map((idea, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-lg border p-3">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <span className="text-sm">{idea}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <LoadingSpinner />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repurposing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Repurposing Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              {content?.repurposing_suggestions ? (
                <div className="space-y-4">
                  {Object.entries(content.repurposing_suggestions).map(([platform, suggestions]) => (
                    <div key={platform}>
                      <h4 className="font-medium capitalize">{platform.replace('_', ' ')}</h4>
                      <ul className="mt-2 space-y-1">
                        {suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <LoadingSpinner />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};