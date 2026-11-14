import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/CopyButton';
import { ScoreIndicator } from '@/components/ui/ScoreIndicator';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useGeneration } from '@/hooks/useGeneration';
import { useProjects } from '@/hooks/useProjects';
import { analyzeTopic } from '@/services/api';
import { generateContent } from '@/services/api';
import { TopicAnalysis, GeneratedContent } from '@/types';
import {
  Brain,
  Target,
  TrendingUp,
  Zap,
  Copy,
  RefreshCw,
  Edit3,
  Download,
  Share2,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  History,
  Bookmark,
} from 'lucide-react';

export const Analysis = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { analysis: sessionAnalysis, loading, error, analyze } = useAnalysis();
  const { content, loading: generating, generate } = useGeneration();
  const { projects, fetchProjects, fetchProject, currentProject, error: projectError, loading: projectLoading } = useProjects();
  const analysis = projectId
    ? (currentProject?.id === Number(projectId) ? currentProject : null)
    : currentProject || sessionAnalysis;
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (projectId) {
      const id = Number(projectId);
      if (Number.isInteger(id) && id > 0) fetchProject(id);
    } else {
      fetchProjects();
    }
  }, [projectId, fetchProject, fetchProjects]);

  const handleAnalyze = async (topic: string) => {
    await analyze(topic);
  };

  const handleGenerate = async () => {
    if (currentProject) {
      const result = await generate(currentProject.id);
      if (result) navigate(`/generated/${currentProject.id}`);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleRegenerate = async () => {
    if (!analysis?.topic) return;
    const result = await analyze(analysis.topic, currentProject?.id);
    if (result && currentProject) await fetchProject(currentProject.id);
  };

  if (error || projectError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Analysis</h1>
        <ErrorState message={error || projectError || 'Unable to load this project.'} onRetry={() => projectId ? fetchProject(Number(projectId)) : fetchProjects()} />
      </div>
    );
  }

  if (projectId && (!Number.isInteger(Number(projectId)) || Number(projectId) < 1)) {
    return <EmptyState icon={Brain} title="Project not found" description="The project ID in this link is invalid." action={<Button onClick={() => navigate('/analysis')}>Browse projects</Button>} />;
  }

  if (projectId && !analysis && projectLoading) {
    return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>;
  }

  if (!analysis && !loading && !projectId) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Content Analysis</h1><p className="mt-1 text-sm text-muted-foreground">Choose a saved topic or start a fresh analysis.</p></div>
        {projectLoading ? <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div> : projects.length ? <div className="grid gap-4 md:grid-cols-2">{projects.map(project => <Card key={project.id}><CardHeader><CardTitle>{project.topic}</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-muted-foreground">{project.summary || 'No summary yet'}</p><Button onClick={() => navigate(`/analysis/${project.id}`)}>Open analysis</Button></CardContent></Card>)}</div> : <EmptyState icon={Brain} title="No analysis yet" description="Enter a topic to create your first content strategy." action={<Button onClick={() => navigate('/')}>Go to Home</Button>} />}
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content Analysis</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRegenerate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Generating...
              </>
            ) : (
              'Generate Content'
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="viral">Viral Potential</TabsTrigger>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="format">Format</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="opportunity">Opportunity</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="titles">Titles</TabsTrigger>
          <TabsTrigger value="hooks">Hooks</TabsTrigger>
          <TabsTrigger value="script">Script</TabsTrigger>
          <TabsTrigger value="caption">Caption</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
          <TabsTrigger value="angles">Angles</TabsTrigger>
          <TabsTrigger value="future">Future Ideas</TabsTrigger>
          <TabsTrigger value="repurposing">Repurposing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Topic Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{analysis.summary}</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Content Intent</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="default" className="capitalize">
                  {analysis.content_intent}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recommended Tone</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="capitalize">
                  {analysis.recommended_tone}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recommended Length</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{analysis.recommended_length}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Competition Level</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={analysis.competition_level === 'high' ? 'danger' : analysis.competition_level === 'medium' ? 'warning' : 'success'}>
                  {analysis.competition_level}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(analysis.key_points || []).map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Things to Avoid</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(analysis.things_to_avoid || []).map((thing, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-red-500" />
                    <span className="text-sm">{thing}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="viral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Viral Potential Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <ScoreIndicator score={analysis.viral_potential_score ?? 0} size="lg" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {analysis.viral_potential_reasoning}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    This is an AI-generated estimate based on topic characteristics, audience appeal, content patterns, and available trend signals. It does not guarantee actual performance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platform" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="default" className="capitalize text-lg px-3 py-1">
                  {analysis.best_platform}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{analysis.platform_reasoning}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="format" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="capitalize text-lg px-3 py-1">
                  {analysis.best_format?.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{analysis.format_reasoning}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{analysis.target_audience}</p>
              <p className="text-sm text-muted-foreground">{analysis.audience_reasoning}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Opportunity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Content Gap</h4>
                  <p className="text-sm text-muted-foreground">{analysis.content_gap}</p>
                </div>
                <div>
                  <h4 className="font-medium">Differentiation Strategy</h4>
                  <p className="text-sm text-muted-foreground">{analysis.differentiation_strategy}</p>
                </div>
                <div>
                  <h4 className="font-medium">Topic Potential</h4>
                  <p className="text-sm text-muted-foreground">{analysis.topic_potential}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Trend Relevance</h4>
                  <p className="text-sm text-muted-foreground">{analysis.trend_relevance}</p>
                </div>
                <div>
                  <h4 className="font-medium">Trend Reasoning</h4>
                  <p className="text-sm text-muted-foreground">{analysis.trend_reasoning}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                <p className="text-sm text-muted-foreground">Generate content to see titles</p>
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
                <p className="text-sm text-muted-foreground">Generate content to see hooks</p>
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
                <p className="text-sm text-muted-foreground">Generate content to see script</p>
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
                <p className="text-sm text-muted-foreground">Generate content to see caption</p>
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
                <p className="text-sm text-muted-foreground">Generate content to see hashtags</p>
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
                <p className="text-sm text-muted-foreground">Generate content to see angles</p>
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
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm">{idea}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Generate content to see future ideas</p>
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
                <p className="text-sm text-muted-foreground">Generate content to see repurposing suggestions</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};