import { useMemo, useState } from 'react';
import { Plus, Trash2, Briefcase, GraduationCap, User, Rocket, Dumbbell, Wallet, Folder } from 'lucide-react';
import { useTask } from '@/contexts/TaskContext';
import { useToast } from '@/contexts/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { todayString } from '@/lib/date';


const ICONS: Record<string, typeof Briefcase> = {
  Briefcase, GraduationCap, User, Rocket, Dumbbell, Wallet, Folder,
};


const COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6',
  '#ec4899', '#6366f1', '#f97316', '#06b6d4', '#84cc16', '#a855f7',
];


export function Categories() {
  const { categories, tasks, createCategory, deleteCategory } = useTask();
  const { showToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState('Folder');
  const [deleteId, setDeleteId] = useState<string | null>(null);


  const taskCount = useMemo(() => {
    const counts = new Map<string, number>();
    tasks.forEach((t) => {
      if (t.category_id) counts.set(t.category_id, (counts.get(t.category_id) ?? 0) + 1);
    });
    return counts;
  }, [tasks]);


  const handleCreate = async () => {
    if (!name.trim()) {
      showToast('Nome da categoria é obrigatório.', 'error');
      return;
    }
    await createCategory(name.trim(), color, icon);
    showToast('Categoria criada!', 'success');
    setName('');
    setColor(COLORS[0]);
    setIcon('Folder');
    setShowCreate(false);
  };


  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteCategory(deleteId);
    showToast('Categoria excluída.', 'success');
    setDeleteId(null);
  };


  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto pb-24 lg:pb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Categorias</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Organize suas tarefas por categoria</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Nova