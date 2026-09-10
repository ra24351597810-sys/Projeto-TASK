import { useMemo } from 'react';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Calendar, Award, BarChart3 } from 'lucide-react';
import { useTask } from '@/contexts/TaskContext';
import { ProgressBar } from '@/components/ui';
import { getWeekdaysShort, isOverdue } from '@/lib/date';
import type { Priority } from '@/types';


export function Analytics() {
  const { tasks, categories } = useTask();


  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'concluida');
    const created = tasks;
    const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    const overdue = tasks.filter((t) => isOverdue(t));
    const overdueRate = total > 0 ? Math.round((overdue.length / total) * 100) : 0;


    const completionTimes = completed
      .filter((t) => t.completed_at)
      .map((t) => {
        const created = new Date(t.created_at).getTime();
        const done = new Date(t.completed_at!).getTime();
        return Math.max(0, (done - created) / (1000 * 60));
      });
    const avgCompletionTime = completionTimes.length > 0
      ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
      : 0;


    const dayCount = new Array(7).fill(0);
    completed.forEach((t) => {
      if (t.completed_at) {
        const day = new Date(t.completed_at).getDay();
        dayCount[day]++;
      }
    });
    const mostProductiveDay = dayCount.indexOf(Math.max(...dayCount));


    const hourCount = new Array(24).fill(0);
    completed.forEach((t) => {
      if (t.completed_at) {
        const hour = new Date(t.completed_at).getHours();
        hourCount[hour]++;
      }
    });
    const mostProductiveHour = hourCount.indexOf(Math.max(...hourCount));


    const byPriority: Record<Priority, { total: number; completed: number }> = {
      baixa: { total: 0, completed: 0 },
      media: { total: 0, completed: 0 },
      alta: { total: 0, completed: 0 },
      urgente: { total: 0, completed: 0 },
    };
    tasks.forEach((t) => {
      byPriority[t.priority].total++;
      if (t.status === 'concluida') byPriority[t.priority].completed++;
    });


    const byCategory = categories.map((cat) => {
      const catTasks = tasks.filter((t) => t.category_id === cat.id);
      return {
        name: cat.name,
        color: cat.color,
        total: catTasks.length,
        completed: catTasks.filter((t) => t.status === 'concluida').length,
      };
    }).filter((c) => c.total > 0);


    return {
      total, completed: completed.length, completionRate, overdue: overdue.length, overdueRate,