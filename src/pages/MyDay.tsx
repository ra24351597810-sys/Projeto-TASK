import { useMemo, useState } from 'react';
import { Sun, Moon, Coffee, Plus, GripVertical } from 'lucide-react';
import { useTask } from '@/contexts/TaskContext';
import { TaskCard } from '@/components/TaskCard';
import { ProgressBar, EmptyState } from '@/components/ui';
import { formatDuration, todayString } from '@/lib/date';
import type { Task, PlannedPeriod } from '@/types';


interface MyDayProps {
  onEditTask: (task: Task) => void;
  onNewTask: () => void;
}


const PERIODS: { id: PlannedPeriod; label: string; icon: typeof Sun; time: string; gradient: string }[] = [
  { id: 'manha', label: 'Manhã', icon: Sun, time: '06:00 - 12:00', gradient: 'from-amber-400 to-orange-400' },
  { id: 'tarde', label: 'Tarde', icon: Coffee, time: '12:00 - 18:00', gradient: 'from-green-400 to-cyan-400' },
  { id: 'noite', label: 'Noite', icon: Moon, time: '18:00 - 23:00', gradient: 'from-emerald-400 to-teal-500' },
];


export function MyDay({ onEditTask, onNewTask }: MyDayProps) {
  const { tasks, updateTask } = useTask();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverPeriod, setDragOverPeriod] = useState<PlannedPeriod | null>(null);


  const today = todayString();


  const tasksByPeriod = useMemo(() => {
    const result: Record<PlannedPeriod, Task[]> = { manha: [], tarde: [], noite: [] };
    const todayTasks = tasks.filter((t) =>
      t.status === 'pendente' && (t.due_date === today || t.planned_period)
    );
    todayTasks.forEach((task) => {
      const period = task.planned_period ?? 'manha';
      if (result[period]) result[period].push(task);
    });
    Object.values(result).forEach((arr) => arr.sort((a, b) => a.sort_order - b.sort_order));
    return result;
  }, [tasks, today]);


  const totalEstimated = useMemo(() => {
    return Object.values(tasksByPeriod).flat().reduce((sum, t) => sum + (t.estimated_time ?? 0), 0);
  }, [tasksByPeriod]);


  const completedToday = useMemo(() => {
    return tasks.filter((t) => t.status === 'concluida' && t.completed_at?.startsWith(today)).length;
  }, [tasks, today]);


  const totalToday = useMemo(() => Object.values(tasksByPeriod).flat().length, [tasksByPeriod]);


  const handleDrop = async (period: PlannedPeriod) => {
    if (!draggedId) return;
    const task = tasks.find((t) => t.id === draggedId);
    if (task && task.planned_period !== period) {
      await updateTask(task.id, { planned_period: period, due_date: today });
    }
    setDraggedId(null);
    setDragOverPeriod(null);
  };


  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto pb-24 lg:pb-6">