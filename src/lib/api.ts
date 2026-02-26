import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
// ПРАВИЛНО:
const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, FormData);
// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface ApiErrorResponse {
  error: string;
  field?: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  color: string;
  role: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  endDate: string;
  color: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export interface TaskInput {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  endDate: string;
  color: string;
  tagIds: string[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

// Auth API
export const authApi = {
  login: async (data: LoginInput) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterInput) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Tasks API
export const tasksApi = {
  getAll: async (filters?: { status?: string; priority?: string; search?: string }) => {
    const response = await api.get('/tasks', { params: filters });
    return response.data.tasks as Task[];
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data.task as Task;
  },
  
  create: async (data: TaskInput) => {
    const response = await api.post('/tasks', {
      ...data,
      status: data.status.toUpperCase().replace('-', '_'),
      priority: data.priority.toUpperCase(),
    });
    return response.data.task as Task;
  },
  
  update: async (id: string, data: Partial<TaskInput>) => {
    const payload: any = { ...data };
    if (data.status) {
      payload.status = data.status.toUpperCase().replace('-', '_');
    }
    if (data.priority) {
      payload.priority = data.priority.toUpperCase();
    }
    const response = await api.patch(`/tasks/${id}`, payload);
    return response.data.task as Task;
  },
  
  delete: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  },
};

// Tags API
export const tagsApi = {
  getAll: async () => {
    // Tags are embedded in tasks, so we return a predefined list
    return [
      { id: '1', name: 'Frontend', color: '#3B82F6' },
      { id: '2', name: 'Backend', color: '#10B981' },
      { id: '3', name: 'Design', color: '#F59E0B' },
      { id: '4', name: 'Bug', color: '#EF4444' },
      { id: '5', name: 'Feature', color: '#8B5CF6' },
      { id: '6', name: 'Documentation', color: '#6B7280' },
      { id: '7', name: 'Testing', color: '#EC4899' },
      { id: '8', name: 'DevOps', color: '#06B6D4' },
    ] as Tag[];
  },
};