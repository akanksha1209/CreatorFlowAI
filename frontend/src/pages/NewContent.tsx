import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingStages } from '@/components/ui/LoadingStages';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useProjects } from '@/hooks/useProjects';
import { analyzeTopic } from '@/services/api';

export const NewContent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get('topic') || '';
  
  const [topic, setTopic] = useState(initialTopic);
  const { analysis, loading, error, analyze, reset } = useAnalysis();
  const { addProject } = useProjects();
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (initialTopic) {
      handleAnalyze(initialTopic);
    }
  }, []);

  const handleAnalyze = async (topicValue: string) => {
    const stageInterval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev >= 6) {
          clearInterval(stageInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    await analyze(topicValue);
    clearInterval(stageInterval);
    setCurrentStage(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    await handleAnalyze(topic);
  };

  const handleSaveProject = async () => {
    if (analysis) {
      const projectData = {
        topic: analysis.topic,
        summary: analysis.summary,
        content_intent: analysis.content_intent,
        target_audience: analysis.target_audience,
        audience_reasoning: analysis.audience_reasoning,
        best_platform: analysis.best_platform,
        platform_reasoning: analysis.platform_reasoning,
        best_format: analysis.best_format,
        format_reasoning: analysis.format_reasoning,
        topic_potential: analysis.topic_potential,
        viral_potential_score: analysis.viral_potential_score,
        viral_potential_reasoning: analysis.viral_potential_reasoning,
        trend_relevance: analysis.trend_relevance,
        trend_reasoning: analysis.trend_reasoning,
        competition_level: analysis.competition_level,
        content_gap: analysis.content_gap,
        differentiation_strategy: analysis.differentiation_strategy,
        recommended_tone: analysis.recommended_tone,
        recommended_length: analysis.recommended_length,
        key_points: analysis.key_points,
        things_to_avoid: analysis.things_to_avoid,
      };
      
      await addProject(projectData);
      navigate(`/analysis/${analysis.topic}`);
    }
  };

  const handleNewAnalysis = () => {
    reset();
    setTopic('');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          New Content Project
        </div>
        <h1 className="text-3xl font-bold">Create New Content</h1>
        <p className="text-muted-foreground">
          Enter your topic and get a complete content strategy
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter any topic, idea, trend, product, story, tutorial, opinion, etc."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="h-14 text-lg"
            disabled={loading}
          />
          <Button
            type="submit"
            size="lg"
            className="absolute right-2 top-2 h-10 px-6"
            disabled={loading || !topic.trim()}
          >
            {loading ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                Analyze & Create
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      {loading && <LoadingStages currentStage={currentStage} />}

      {error && (
        <ErrorState message={error} onRetry={() => analyze(topic)} />
      )}

      {analysis && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Analysis Complete</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleNewAnalysis}>
                New Analysis
              </Button>
              <Button onClick={handleSaveProject}>
                Save Project
              </Button>
            </div>
          </div>

          {/* Viral Potential */}
          <Card>
            <CardHeader>
              <CardTitle>Viral Potential</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-primary">
                  {analysis.viral_potential_score}/100
                </div>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-1000"
                      style={{ width: `${analysis.viral_potential_score}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {analysis.viral_potential_reasoning}
              </p>
            </CardContent>
          </Card>

          {/* Platform & Format */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="default" className="capitalize text-lg px-3 py-1">
                  {analysis.best_platform}
                </Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  {analysis.platform_reasoning}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Format</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="capitalize text-lg px-3 py-1">
                  {analysis.best_format?.replace('_', ' ')}
                </Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  {analysis.format_reasoning}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Audience */}
          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{analysis.target_audience}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {analysis.audience_reasoning}
              </p>
            </CardContent>
          </Card>

          {/* Key Points */}
          <Card>
            <CardHeader>
              <CardTitle>Key Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.key_points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Things to Avoid */}
          <Card>
            <CardHeader>
              <CardTitle>Things to Avoid</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.things_to_avoid.map((thing, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span className="text-sm">{thing}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};