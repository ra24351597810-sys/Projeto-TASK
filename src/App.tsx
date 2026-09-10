import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { TaskProvider, useTask as useTaskFromContext } from '@/contexts/TaskContext';
import { AuthScreen } from '@/components/AuthScreen';
import { Sidebar, type Page } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { AIAssistant, FloatingAssistantButton } from '@/components/AIAssistant';
import { TaskForm } from '@/components/TaskForm';
import { Spinner } from '@/components/ui';
import { Dashboard } from '@/pages/Dashboard';
import { TaskList } from '@/pages/TaskList';
import { MyDay } from '@/pages/MyDay';
import { Calendar } from '@/pages/Calendar';
import { Analytics } from '@/pages/Analytics';
import { Categories } from '@/pages/Categories';
import { Notifications } from '@/pages/Notifications';
import { Settings } from '@/pages/Settings';
import type { Task } from '@/types';
import { X } from 'lucide-react';


const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Visão Geral',
  myday: 'Meu Dia',
  tasks: 'Tarefas',
  calendar: 'Calendário',
  analytics: 'Análises',
  categories: 'Categorias',
  notifications: 'Notificações',
  settings: 'Configurações',
};


function AppContent() {
  const { user, loading, passwordRecovery } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);


  const handleNewTask = useCallback(() => {
    setEditingTask(null);
    setTaskFormOpen(true);
  }, []);


  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  }, []);


  const handleNavigate = useCallback((p: Page) => {
    setPage(p);
    setMobileSidebarOpen(false);
  }, []);


  // Keyboard shortcuts
  useEffect(() => {
    if (!user) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setAssistantOpen(true);
      }
      if (e.key === 'n' && !taskFormOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {