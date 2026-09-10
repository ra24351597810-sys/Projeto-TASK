import { useMemo } from 'react';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Sun, ArrowRight, Sparkles, Calendar } from 'lucide-react';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, greeting, todayString, isOverdue, relativeDate } from '@/lib/date';
import { TaskCard } from '@/components/TaskCard';
import { ProductivityChart } from '@/components/ProductivityChart';
import { ProgressBar } from '@/components/ui';
import { PriorityBadge } from '@/components/ui/Badge';
import { suggestTaskOrder } from '@/lib/ai';
import type { Page } from '@/components/layout/Sidebar';
import type { Task } from '@/types';


interface DashboardProps {
  onNavigate: (page: Page) => void;
  onEditTask: (task: Task) => void;
  onNewTask: () => void;
  onOpenAssistant: () => void;
}


export function Dashboard({ onNavigate, onEditTask, onNewTask, onOpenAssistant }: DashboardProps) {
  const { tasks } = useTask();
  const { user } = useAuth();
  const today = todayString();


  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'concluida').length;
    const pending = tasks.filter((t) => t.status === 'pendente').length;
    const overdue = tasks.filter((t) => isOverdue(t)).length;
    const todayTasks = tasks.filter((t) => t.due_date === today && t.status === 'pendente');
    const highPriority = tasks.filter((t) => (t.priority === 'alta' || t.priority === 'urgente') && t.status === 'pendente');
    const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, overdue, todayTasks, highPriority, productivity };
  }, [tasks, today]);


  const recentActivity = useMemo(() => {
    return [...tasks]
      .sort((a, b) => (b.completed_at ?? b.created_at).localeCompare(a.completed_at ?? a.created_at))
      .slice(0, 5);
  }, [tasks]);


  const insights = useMemo(() => {
    const result: { icon: typeof TrendingUp; text: string; color: string }[] = [];
    if (stats.overdue > 0) {
      result.push({ icon: AlertTriangle, text: `Você tem ${stats.overdue} tarefa(s) atrasada(s). Priorize concluí-las hoje.`, color: 'text-red-600 dark:text-red-400' });
    }
    if (stats.todayTasks.length > 0) {
      result.push({ icon: Sun, text: `${stats.todayTasks.length} tarefa(s) para hoje. Mantenha o foco!`, color: 'text-green-600 dark:text-green-400' });
    }
    if (stats.productivity >= 70) {
      result.push({ icon: TrendingUp, text: `Excelente! Sua produtividade está em ${stats.productivity}%.`, color: 'text-emerald-600 dark:text-emerald-400' });
    } else if (stats.total > 0) {
      result.push({ icon: TrendingUp, text: `Sua produtividade está em ${stats.productivity}%. Continue!`, color: 'text-amber-600 dark:text-amber-400' });