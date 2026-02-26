app.use(cors({
  origin: process.env.FRONTEND_URL, // Взима адреса от настройките в Render
  credentials: true,                // Позволява изпращане на Cookies/Tokens
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: Date;
  endDate: Date;
  assignee?: User;
  tags: Tag[];
  color: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface FilterOptions {
  status: TaskStatus[];
  priority: TaskPriority[];
  assignee: string[];
  tags: string[];
  dateRange?: { start: Date; end: Date };
}

export interface FreestyleNote {
  id: string;
  content: string;
  color: string;
  position: { x: number; y: number };
  createdAt: Date;
}
