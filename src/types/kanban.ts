export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate?: string;
  category?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface KanbanBoard {
  id: string;
  title: string;
  description?: string;
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  priority?: Priority;
  category?: string;
  dueDateOrder?: 'asc' | 'desc';
  priorityOrder?: 'asc' | 'desc';
}