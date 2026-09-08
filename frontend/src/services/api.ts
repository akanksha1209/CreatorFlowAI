import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Topic Analysis
export const analyzeTopic = async (topic: string) => {
  const response = await api.post('/api/analyze/', { topic });
  return response.data;
};

// Content Generation
export const generateContent = async (projectId: number, regenerateAll = false, specificSections?: string[]) => {
  const response = await api.post('/api/generate/', {
    project_id: projectId,
    regenerate_all: regenerateAll,
    specific_sections: specificSections,
  });
  return response.data;
};

// Chat
export const sendChatMessage = async (projectId: number, message: string, context?: any) => {
  const response = await api.post('/api/chat/', {
    project_id: projectId,
    message,
    context,
  });
  return response.data;
};

// Projects
export const getProjects = async (skip = 0, limit = 10, search?: string) => {
  const params: any = { skip, limit };
  if (search) params.search = search;
  const response = await api.get('/api/projects/', { params });
  return response.data;
};

export const getProject = async (projectId: number) => {
  const response = await api.get(`/api/projects/${projectId}`);
  return response.data;
};

export const createProject = async (projectData: any) => {
  const response = await api.post('/api/projects/', projectData);
  return response.data;
};

export const updateProject = async (projectId: number, projectData: any) => {
  const response = await api.put(`/api/projects/${projectId}`, projectData);
  return response.data;
};

export const deleteProject = async (projectId: number) => {
  const response = await api.delete(`/api/projects/${projectId}`);
  return response.data;
};

export const saveProject = async (projectId: number) => {
  const response = await api.post(`/api/projects/${projectId}/save`);
  return response.data;
};

export const getProjectHistory = async (projectId: number) => {
  const response = await api.get(`/api/projects/${projectId}/history`);
  return response.data;
};