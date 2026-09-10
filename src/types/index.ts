export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';
export type TaskStatus = 'pendente' | 'concluida';
export type PlannedPeriod = 'manha' | 'tarde' | 'noite';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly';
export type NotificationType = 'prazo' | 'atrasada' | 'importante' | 'lembrete' | 'agendada';


export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  is_default: boolean;
  created_at: string;
}


export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  sort_order: number;
  created_at: string;
}


export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  priority: Priority;
  category_id: string | null;
  tags: string[] | null;
  estimated_time: number;
  is_recurring: boolean;
  recurrence_pattern: RecurrencePattern | null;
  notes: string | null;
  status: TaskStatus;
  planned_period: PlannedPeriod | null;
  sort_order: number;
  created_at: string;
  completed_at: string | null;
  subtasks?: Subtask[];
  category?: Category | null;
}


export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: NotificationType;
  read: boolean;
  task_id: string | null;
  created_at: string;
}


export interface TaskInput {
  title: string;
  description?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  priority: Priority;
  category_id?: string | null;
  tags?: string[];
  estimated_time?: number;
  is_recurring?: boolean;