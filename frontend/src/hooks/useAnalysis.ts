import { useState, useCallback } from 'react';
import { analyzeTopic } from '@/services/api';
import { TopicAnalysis } from '@/types';

interface UseAnalysisReturn {
  analysis: TopicAnalysis | null;
  loading: boolean;
  error: string | null;
  analyze: (topic: string, projectId?: number) => Promise<TopicAnalysis | null>;
  reset: () => void;
}

export const useAnalysis = (): UseAnalysisReturn => {
  const [analysis, setAnalysis] = useState<TopicAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (topic: string, projectId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const result: TopicAnalysis = await analyzeTopic(topic, projectId);
      setAnalysis(result);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Analysis failed. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setLoading(false);
  }, []);

  return { analysis, loading, error, analyze, reset };
};