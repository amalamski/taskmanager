import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskStatus, User, Tag, FilterOptions, FreestyleNote } from '../types';
import { tasksApi, tagsApi, Task as ApiTask } from '../lib/api.js';
import { useAuth } from './AuthContext.js';

// Transform API task to frontend task format
const transformApiTask = (apiTask: ApiTask): Task => ({
  id: apiTask.id,
  title: apiTask.title,
  description: apiTask.description || '',
  status: apiTask.status,
  priority: apiTask.priority,
  startDate: new Date(apiTask.startDate),
  endDate: new Date(apiTask.endDate),
  color: apiTask.color,
  completedAt: apiTask.completedAt ? new Date(apiTask.completedAt) : undefined,
  createdAt: new Date(apiTask.createdAt),
  assignee: undefined, // Will be populated from user context
  tags: apiTask.tags || [],
});

interface TaskContextType {
  tasks: Task[];
  users: User[];
  tags: Tag[];
  freestyleNotes: FreestyleNote[];
  filters: FilterOptions;
  isLoading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  setFilters: (filters: FilterOptions) => void;
  clearFilters: () => void;
  addFreestyleNote: (note: Omit<FreestyleNote, 'id' | 'createdAt'>) => void;
  updateFreestyleNote: (id: string, updates: Partial<FreestyleNote>) => void;
  deleteFreestyleNote: (id: string) => void;
  getFilteredTasks: () => Task[];
  refreshTasks: () => Promise<void>;
}

const defaultFilters: FilterOptions = {
  status: [],
  priority: [],
  assignee: [],
  tags: [],
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [freestyleNotes, setFreestyleNotes] = useState<FreestyleNote[]>([]);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);

  // Fetch tasks when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshTasks();
      loadTags();
    }
  }, [isAuthenticated]);

  const loadTags = async () => {
    try {
      const apiTags = await tagsApi.getAll();
      setTags(apiTags);
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  const refreshTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiTasks = await tasksApi.getAll();
      const transformedTasks = apiTasks.map(transformApiTask);
      setTasks(transformedTasks);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    try {
      const newTask = await tasksApi.create({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        startDate: taskData.startDate.toISOString(),
        endDate: taskData.endDate.toISOString(),
        color: taskData.color,
        tagIds: taskData.tags.map(t => t.id),
      });
      setTasks(prev => [...prev, transformApiTask(newTask)]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create task');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    setIsLoading(true);
    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.startDate !== undefined) updateData.startDate = updates.startDate.toISOString();
      if (updates.endDate !== undefined) updateData.endDate = updates.endDate.toISOString();
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.tags !== undefined) updateData.tagIds = updates.tags.map(t => t.id);

      const updatedTask = await tasksApi.update(id, updateData);
      setTasks(prev =>
        prev.map(task => {
          if (task.id === id) {
            return transformApiTask(updatedTask);
          }
          return task;
        })
      );
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update task');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await tasksApi.delete(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete task');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const moveTask = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  }, [updateTask]);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const addFreestyleNote = useCallback((noteData: Omit<FreestyleNote, 'id' | 'createdAt'>) => {
    const newNote: FreestyleNote = {
      ...noteData,
      id: uuidv4(),
      createdAt: new Date(),
    };
    setFreestyleNotes(prev => [...prev, newNote]);
  }, []);

  const updateFreestyleNote = useCallback((id: string, updates: Partial<FreestyleNote>) => {
    setFreestyleNotes(prev =>
      prev.map(note => (note.id === id ? { ...note, ...updates } : note))
    );
  }, []);

  const deleteFreestyleNote = useCallback((id: string) => {
    setFreestyleNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  const getFilteredTasks = useCallback(() => {
    return tasks.filter(task => {
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }
      if (filters.assignee.length > 0 && (!task.assignee || !filters.assignee.includes(task.assignee.id))) {
        return false;
      }
      if (filters.tags.length > 0) {
        const taskTagIds = task.tags.map(t => t.id);
        if (!filters.tags.some(tagId => taskTagIds.includes(tagId))) {
          return false;
        }
      }
      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        if (task.endDate < start || task.startDate > end) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, filters]);

  // Create user object from auth context
  const currentUser: User | undefined = user ? {
    id: user.id,
    name: user.name || user.email.split('@')[0],
    avatar: user.avatar || user.email.slice(0, 2).toUpperCase(),
    color: user.color,
  } : undefined;

  return (
    <TaskContext.Provider
      value={{
        tasks,
        users: currentUser ? [currentUser] : [],
        tags,
        freestyleNotes,
        filters,
        isLoading,
        error,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        setFilters,
        clearFilters,
        addFreestyleNote,
        updateFreestyleNote,
        deleteFreestyleNote,
        getFilteredTasks,
        refreshTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
