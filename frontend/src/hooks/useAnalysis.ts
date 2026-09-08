import { useState, useCallback } from 'react';
import { analyzeTopic } from '@/services/api';
import { TopicAnalysis } from '@/types';

interface UseAnalysisReturn {
  analysis: TopicAnalysis | null;
  loading: boolean;
  error: string | null;
  analyze: (topic: string) => Promise<void>;
  reset: () => void;
}

export const useAnalysis = (): UseAnalysisReturn => {
  const [analysis, setAnalysis] = useState<TopicAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (topic: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeTopic(topic);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
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