import { useState } from 'react';
import { Moon, Sun, Bell, LogOut, User, Keyboard, Globe } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';


export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const [confirmLogout, setConfirmLogout] = useState(false);


  const handleLogout = async () => {
    await signOut();
    showToast('Sessão encerrada. Até logo!', 'success');
  };


  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto pb-24 lg:pb-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações</h2>


      {/* Profile */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <User className="h-4 w-4" /> Perfil
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center text-white text-xl font-bold">
            {(user?.user_metadata?.name ?? user?.email ?? 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.user_metadata?.name ?? user?.email ?? 'Usuário'}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Conta pessoal</p>
          </div>
        </div>
      </div>


      {/* Appearance */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Sun className="h-4 w-4" /> Aparência
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'light' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-green-400" />}
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Tema</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{theme === 'light' ? 'Modo claro' : 'Modo escuro'}</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-green-600' : 'bg-slate-300'}`}