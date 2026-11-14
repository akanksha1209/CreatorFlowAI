import { useState, useCallback } from 'react';
import { generateContent, getProjectHistory } from '@/services/api';
import { GeneratedContent } from '@/types';

interface UseGenerationReturn {
  content: GeneratedContent | null;
  loading: boolean;
  error: string | null;
  generate: (projectId: number, regenerateAll?: boolean, specificSections?: string[]) => Promise<GeneratedContent | null>;
  loadLatest: (projectId: number) => Promise<void>;
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
      const result: GeneratedContent = await generateContent(projectId, regenerateAll, specificSections);
      setContent(result);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Generation failed. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLatest = useCallback(async (projectId: number) => {
    setContent(null);
    setLoading(true);
    setError(null);
    try {
      const history = await getProjectHistory(projectId);
      const latest = history.versions?.[0];
      setContent(latest ? { ...latest, project_id: projectId } : null);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load generated content.');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setContent(null);
    setError(null);
    setLoading(false);
  }, []);

  return { content, loading, error, generate, loadLatest, reset };
};