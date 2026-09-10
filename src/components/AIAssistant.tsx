import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot } from 'lucide-react';
import { useTask } from '@/contexts/TaskContext';
import { askAssistant } from '@/lib/ai';
import { todayString } from '@/lib/date';
import type { PlannedPeriod } from '@/types';


interface Message {
  role: 'user' | 'assistant';
  text: string;
}


const QUICK_PROMPTS = [
  'O que eu devo fazer hoje?',
  'Quais tarefas devo priorizar?',
  'Quais tarefas estão atrasadas?',
  'Organize meu dia.',
  'Há conflitos de prazo?',
  'Dicas de produtividade',
];


export function AIAssistant({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tasks, createTask, categories } = useTask();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Olá! Sou seu assistente de produtividade. Posso analisar suas tarefas, sugerir prioridades, organizar seu dia e muito mais.\n\nDica: você pode escrever seu planejamento assim:\n\nDia:\nManhã: Academia + estudos\nTarde: Reunião + relatório\nNoite: Jantar com a família\n\n...e eu adiciono tudo automaticamente!' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);


  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');


    setTimeout(async () => {
      const response = askAssistant(text, tasks);
      setMessages((prev) => [...prev, { role: 'assistant', text: response.text }]);


      if (response.parsedDayTasks && response.parsedDayTasks.length > 0) {
        const today = todayString();
        let created = 0;
        for (const pt of response.parsedDayTasks) {
          const cat = pt.category ? categories.find((c) => c.name === pt.category) : null;
          await createTask({
            title: pt.title,
            priority: 'media',
            due_date: today,
            planned_period: pt.period as PlannedPeriod,
            category_id: cat?.id ?? null,
            status: 'pendente',
          });
          created++;
        }
        if (created > 0) {
          setMessages((prev) => [...prev, {
            role: 'assistant',
            text: `Pronto! ${created} tarefa(s) adicionada(s) ao seu planejador de hoje. Você pode vê-las na página "Meu Dia".`,