import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_CATEGORIES, type Category, type Notification, type Subtask, type Task, type TaskInput } from '@/types';


interface TaskContextValue {
  tasks: Task[];
  categories: Category[];
  notifications: Notification[];
  loading: boolean;
  createTask: (input: TaskInput, subtasks?: { title: string }[]) => Promise<Task | null>;
  updateTask: (id: string, updates: Partial<TaskInput>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (task: Task) => Promise<void>;
  duplicateTask: (task: Task) => Promise<void>;
  postponeTask: (task: Task, days: number) => Promise<void>;
  createCategory: (name: string, color: string, icon: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (subtask: Subtask) => Promise<void>;
  deleteSubtask: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}


const TaskContext = createContext<TaskContextValue | undefined>(undefined);


export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);


  const ensureDefaultCategories = useCallback(async (userId: string) => {
    const { data: existing } = await supabase.from('categories').select('*').eq('user_id', userId);
    if (existing && existing.length > 0) return existing;


    const inserts = DEFAULT_CATEGORIES.map((c) => ({
      user_id: userId,
      name: c.name,
      color: c.color,
      icon: c.icon,
      is_default: true,
    }));


    const { data } = await supabase.from('categories').insert(inserts).select();