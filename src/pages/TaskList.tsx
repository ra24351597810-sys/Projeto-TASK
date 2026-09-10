import { useMemo, useState } from 'react';
import { Search, Filter, ArrowUpDown, Plus, ListTodo, X } from 'lucide-react';
import { useTask } from '@/contexts/TaskContext';
import { TaskCard } from '@/components/TaskCard';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui';
import { todayString, isOverdue, isUpcoming } from '@/lib/date';
import type { Task, Priority } from '@/types';


type Tab = 'all' | 'today' | 'upcoming' | 'completed' | 'overdue';
type SortBy = 'priority' | 'date' | 'created' | 'title';


interface TaskListProps {
  onEditTask: (task: Task) => void;
  onNewTask: () => void;
}


const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'today', label: 'Hoje' },
  { id: 'upcoming', label: 'Próximas' },
  { id: 'completed', label: 'Concluídas' },
  { id: 'overdue', label: 'Atrasadas' },
];


export function TaskList({ onEditTask, onNewTask }: TaskListProps) {
  const { tasks, categories } = useTask();
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const [showFilters, setShowFilters] = useState(false);


  const filtered = useMemo(() => {
    let result = [...tasks];
    const today = todayString();


    switch (tab) {
      case 'today': result = result.filter((t) => t.due_date === today && t.status === 'pendente'); break;
      case 'upcoming': result = result.filter((t) => isUpcoming(t.due_date) && t.status === 'pendente'); break;
      case 'completed': result = result.filter((t) => t.status === 'concluida'); break;
      case 'overdue': result = result.filter((t) => isOverdue(t)); break;
    }


    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }


    if (filterCategory) result = result.filter((t) => t.category_id === filterCategory);
    if (filterPriority) result = result.filter((t) => t.priority === filterPriority);
    if (filterStatus === 'pendente') result = result.filter((t) => t.status === 'pendente');
    if (filterStatus === 'concluida') result = result.filter((t) => t.status === 'concluida');