import { useState, useEffect } from 'react';
import { CheckSquare, Mail, Lock, User, ArrowRight, Sparkles, Calendar, BarChart3, Bot, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Spinner } from '@/components/ui';
import DotField from './DotField.jsx';


type Mode = 'login' | 'signup' | 'verify' | 'reset' | 'newpassword';


export function AuthScreen() {
  const { signIn, signUp, resetPassword, sendOtp, verifyOtp, updatePassword, passwordRecovery, clearPasswordRecovery } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    if (passwordRecovery) {
      setMode('newpassword');
    }
  }, [passwordRecovery]);


  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'signup' && !name.trim()) e.name = 'Nome é obrigatório';
    if (mode !== 'verify' && mode !== 'newpassword') {
      if (!email) e.email = 'E-mail é obrigatório';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido';
    }
    if (mode === 'login' || mode === 'signup') {
      if (!password) e.password = 'Senha é obrigatória';
      else if (password.length < 6) e.password = 'Mínimo de 6 caracteres';
    }
    if (mode === 'verify') {
      if (!code.trim()) e.code = 'Código é obrigatório';
      else if (!/^\d{6}$/.test(code.trim())) e.code = 'Digite os 6 dígitos';
    }
    if (mode === 'newpassword') {
      if (!newPassword) e.newPassword = 'Senha é obrigatória';
      else if (newPassword.length < 6) e.newPassword = 'Mínimo de 6 caracteres';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };


  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          showToast(error, 'error');
        } else {
          showToast('Bem-vindo de volta!', 'success');
        }
      } else if (mode === 'signup') {