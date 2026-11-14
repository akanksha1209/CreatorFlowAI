import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Brain, Target, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalysis } from '@/hooks/useAnalysis';
import { LoadingStages } from '@/components/ui/LoadingStages';
import { ErrorState } from '@/components/ui/ErrorState';

const features = [
  { icon: Brain, label: 'AI-Powered Analysis', description: 'Smart topic analysis' },
  { icon: Target, label: 'Audience Insights', description: 'Target audience identification' },
  { icon: TrendingUp, label: 'Viral Potential', description: 'Score and insights' },
  { icon: Zap, label: 'Content Generation', description: 'Complete content package' },
];

export const Home = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const { analysis, loading, error, analyze, reset } = useAnalysis();
  const [currentStage, setCurrentStage] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    // Simulate stage progression
    const stageInterval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev >= 6) {
          clearInterval(stageInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    await analyze(topic);
    clearInterval(stageInterval);
    setCurrentStage(0);
  };

  const handleNewAnalysis = () => {
    reset();
    setTopic('');
  };

  const handleViewResults = () => {
    if (analysis?.id) navigate(`/analysis/${analysis.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          AI-Powered Content Strategy
        </div>
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          What's your next content idea?
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Turn one idea into a complete content strategy.
        </p>
      </div>

      {/* Topic Input */}
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

      {/* Loading Stages */}
      {loading && <LoadingStages currentStage={currentStage} />}

      {/* Error State */}
      {error && (
        <ErrorState message={error} onRetry={() => analyze(topic)} />
      )}

      {/* Analysis Results */}
      {analysis && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Analysis Results</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleNewAnalysis}>
                New Analysis
              </Button>
              <Button onClick={handleViewResults}>
                View Full Results
              </Button>
            </div>
          </div>

          {/* Viral Potential Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Viral Potential Estimate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {analysis.viral_potential_score}/100
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This is an AI-generated estimate based on topic characteristics, audience appeal, content patterns, and available trend signals. It does not guarantee actual performance.
                  </p>
                </div>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-1000"
                      style={{ width: `${analysis.viral_potential_score}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {analysis.viral_potential_reasoning}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Platform</p>
                    <p className="text-lg capitalize">{analysis.best_platform}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {analysis.platform_reasoning}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Format</p>
                    <p className="text-lg capitalize">{analysis.best_format?.replace('_', ' ')}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {analysis.format_reasoning}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Brain className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Intent</p>
                    <p className="text-lg capitalize">{analysis.content_intent}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {analysis.topic_potential}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Target Audience */}
          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{analysis.target_audience}</p>
              <p className="text-sm text-muted-foreground">{analysis.audience_reasoning}</p>
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

      {/* Features Grid */}
      {!analysis && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm">{feature.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};