import { Calendar, Clock, Tag, Repeat, ChevronDown, ChevronRight, CheckCircle2, Circle, Trash2, Copy, CalendarClock, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { PriorityBadge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui';
import { useTask } from '@/contexts/TaskContext';
import { useToast } from '@/contexts/ToastContext';
import { formatDateShort, formatTime, formatDuration, relativeDate, isOverdue } from '@/lib/date';
import type { Task } from '@/types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';


interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  compact?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}


export function TaskCard({ task, onEdit, compact, draggable, onDragStart, onDragEnd }: TaskCardProps) {
  const { toggleTaskComplete, duplicateTask, deleteTask, toggleSubtask, deleteSubtask, postponeTask } = useTask();
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);


  const overdue = isOverdue(task);
  const completed = task.status === 'concluida';
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;


  const handleDuplicate = async () => {
    await duplicateTask(task);
    showToast('Tarefa duplicada com sucesso!', 'success');
    setShowMenu(false);
  };


  const handlePostpone = async (days: number) => {
    if (!task.due_date) {
      showToast('Esta tarefa não tem data de vencimento.', 'warning');
      return;
    }
    await postponeTask(task, days);
    showToast(`Tarefa adiada em ${days} dia(s).`, 'success');
    setShowMenu(false);
  };


  return (
    <>
      <div
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={() => onEdit?.(task)}
        className={`group card p-4 hover:shadow-md hover:border-slate-300 dark:hover:border-[#303030] transition-all cursor-pointer ${completed ? 'opacity-60' : ''} ${overdue ? 'border-l-4 border-l-red-500' : ''}`}
      >
        <div className="flex items-start gap-3">
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={completed} onChange={() => toggleTaskComplete(task)} />
          </div>


          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">