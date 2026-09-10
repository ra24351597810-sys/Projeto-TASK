import { useEffect, useState } from 'react';
import { Sparkles, Plus, X, Repeat, Tag, ListChecks } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTask } from '@/contexts/TaskContext';
import { useToast } from '@/contexts/ToastContext';
import { analyzeTaskText, type AISuggestion } from '@/lib/ai';
import { todayString } from '@/lib/date';
import type { Priority, RecurrencePattern, Task, TaskInput } from '@/types';


interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  editingTask?: Task | null;
  defaultDate?: string;
  defaultPeriod?: 'manha' | 'tarde' | 'noite';
}


const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];


export function TaskForm({ open, onClose, editingTask, defaultDate, defaultPeriod }: TaskFormProps) {
  const { categories, createTask, updateTask, addSubtask } = useTask();
  const { showToast } = useToast();


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('weekly');
  const [notes, setNotes] = useState('');
  const [plannedPeriod, setPlannedPeriod] = useState<'manha' | 'tarde' | 'noite' | ''>('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    if (open) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description ?? '');