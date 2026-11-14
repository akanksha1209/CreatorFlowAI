import { useState, useCallback } from 'react';
import { getProjects, getProject, createProject, updateProject, deleteProject, saveProject, getProjectHistory } from '@/services/api';
import { Project, ProjectHistory } from '@/types';

interface UseProjectsReturn {
  projects: Project[];
  currentProject: Project | null;
  projectHistory: ProjectHistory | null;
  loading: boolean;
  error: string | null;
  fetchProjects: (search?: string, savedOnly?: boolean) => Promise<void>;
  fetchProject: (id: number) => Promise<void>;
  fetchProjectHistory: (id: number) => Promise<void>;
  addProject: (data: any) => Promise<void>;
  editProject: (id: number, data: any) => Promise<void>;
  removeProject: (id: number) => Promise<void>;
  toggleSave: (id: number) => Promise<void>;
  reset: () => void;
}

export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectHistory, setProjectHistory] = useState<ProjectHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (search?: string, savedOnly = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProjects(0, 100, search, savedOnly);
      setProjects(result.projects);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProject = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProject(id);
      setCurrentProject(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjectHistory = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProjectHistory(id);
      setProjectHistory(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch project history');
    } finally {
      setLoading(false);
    }
  }, []);

  const addProject = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createProject(data);
      setProjects(prev => [result, ...prev]);
      setCurrentProject(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  }, []);

  const editProject = useCallback(async (id: number, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateProject(id, data);
      setProjects(prev => prev.map(p => p.id === id ? result : p));
      setCurrentProject(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  }, []);

  const removeProject = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete project');
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  const toggleSave = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await saveProject(id);
      setProjects(prev => prev.map(project => project.id === id ? { ...project, is_saved: result.is_saved } : project));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setCurrentProject(null);
    setProjectHistory(null);
    setError(null);
  }, []);

  return {
    projects,
    currentProject,
    projectHistory,
    loading,
    error,
    fetchProjects,
    fetchProject,
    fetchProjectHistory,
    addProject,
    editProject,
    removeProject,
    toggleSave,
    reset,
  };
};