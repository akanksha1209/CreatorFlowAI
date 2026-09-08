import { useState, useCallback } from 'react';
import { generateContent } from '@/services/api';
import { GeneratedContent } from '@/types';

interface UseGenerationReturn {
  content: GeneratedContent | null;
  loading: boolean;
  error: string | null;
  generate: (projectId: number, regenerateAll?: boolean, specificSections?: string[]) => Promise<void>;
  reset: () => void;
}

export const useGeneration = (): UseGenerationReturn => {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (projectId: number, regenerateAll = false, specificSections?: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateContent(projectId, regenerateAll, specificSections);
      setContent(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setContent(null);
    setError(null);
    setLoading(false);
  }, []);

  return { content, loading, error, generate, reset };
};