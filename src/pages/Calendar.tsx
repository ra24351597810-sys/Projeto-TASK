import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react';
import { useTask } from '@/contexts/TaskContext';
import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/ui';
import {
  getMonthName, getWeekdaysShort, getDaysInMonth, getWeekDays,
  dateToISO, todayString, formatDate, isToday as isTodayFn,
} from '@/lib/date';
import type { Task } from '@/types';


type View = 'month' | 'week' | 'day';


interface CalendarProps {
  onEditTask: (task: Task) => void;
  onNewTask: () => void;
}


export function Calendar({ onEditTask, onNewTask }: CalendarProps) {
  const { tasks } = useTask();
  const [view, setView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayString());


  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((t) => {
      if (t.due_date) {
        const arr = map.get(t.due_date) ?? [];
        arr.push(t);
        map.set(t.due_date, arr);
      }
    });
    return map;
  }, [tasks]);


  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else {
      d.setDate(d.getDate() + dir);
      setSelectedDate(dateToISO(d));
    }
    setCurrentDate(d);
  };


  const headerLabel = useMemo(() => {
    if (view === 'month') return `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`;
    if (view === 'week') {
      const days = getWeekDays(currentDate);
      return `${days[0].getDate()} - ${days[6].getDate()} ${getMonthName(days[6].getMonth())}`;
    }
    return formatDate(selectedDate);
  }, [view, currentDate, selectedDate]);


  const selectedTasks = tasksByDate.get(selectedDate) ?? [];


  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto pb-24 lg:pb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Calendário</h2>
        <button onClick={onNewTask} className="btn-primary">
          <Plus className="h-4 w-4" /> Nova
        </button>
      </div>


      {/* Controls */}
      <div className="flex items-center justify-between mb-4">