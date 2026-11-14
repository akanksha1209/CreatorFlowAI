import axios from 'axios';

// Keep requests same-origin by default so Vite can proxy /api locally and a
// deployed frontend can use a configured API origin without hard-coded hosts.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
  // AI analysis/generation can take longer than a regular API request.
  timeout: 180_000,
});

export const analyzeTopic = async (topic: string, projectId?: number) => (await api.post('/api/analyze/', { topic, project_id: projectId })).data;
export const generateContent = async (projectId: number, regenerateAll = false, specificSections?: string[]) =>
  (await api.post('/api/generate/', { project_id: projectId, regenerate_all: regenerateAll, specific_sections: specificSections })).data;
export const sendChatMessage = async (projectId: number, message: string, context?: unknown) =>
  (await api.post('/api/chat/', { project_id: projectId, message, context })).data;
export const getProjects = async (skip = 0, limit = 50, search?: string, savedOnly = false) => {
  const params: Record<string, unknown> = { skip, limit };
  if (search) params.search = search;
  if (savedOnly) params.saved_only = true;
  return (await api.get('/api/projects/', { params })).data;
};
export const getProject = async (projectId: number) => (await api.get(`/api/projects/${projectId}`)).data;
export const createProject = async (projectData: unknown) => (await api.post('/api/projects/', projectData)).data;
export const updateProject = async (projectId: number, projectData: unknown) => (await api.put(`/api/projects/${projectId}`, projectData)).data;
export const deleteProject = async (projectId: number) => (await api.delete(`/api/projects/${projectId}`)).data;
export const saveProject = async (projectId: number) => (await api.post(`/api/projects/${projectId}/save`)).data;
export const getProjectHistory = async (projectId: number) => (await api.get(`/api/projects/${projectId}/history`)).data;
export const getSavedProjects = async () => getProjects(0, 100, undefined, true);
export const getApiHealth = async () => (await api.get('/health')).data;
