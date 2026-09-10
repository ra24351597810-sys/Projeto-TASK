import type { Priority, Task, PlannedPeriod } from '@/types';
import { daysUntil, isOverdue, todayString } from '@/lib/date';


export interface AISuggestion {
  priority?: Priority;
  dueDate?: string;
  estimatedTime?: number;
  subtasks?: string[];
  category?: string;
  explanation: string;
}


const DAY_MAP: Record<string, number> = {
  'domingo': 0, 'dom': 0,
  'segunda': 1, 'segunda-feira': 1, 'seg': 1,
  'terça': 2, 'terça-feira': 2, 'ter': 2,
  'quarta': 3, 'quarta-feira': 3, 'qua': 3,
  'quinta': 4, 'quinta-feira': 4, 'qui': 4,
  'sexta': 5, 'sexta-feira': 5, 'sex': 5,
  'sábado': 6, 'sabado': 6, 'sáb': 6,
};


function nextWeekday(target: number): string {
  const today = new Date();
  const current = today.getDay();
  let diff = target - current;
  if (diff <= 0) diff += 7;
  today.setDate(today.getDate() + diff);
  return today.toISOString().split('T')[0];
}


function parseDate(text: string): string | undefined {
  const lower = text.toLowerCase();


  if (lower.includes('hoje')) return todayString();
  if (lower.includes('amanhã') || lower.includes('amanha')) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  if (lower.includes('próxima semana') || lower.includes('proxima semana')) {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }


  for (const [word, dayNum] of Object.entries(DAY_MAP)) {
    if (lower.includes(`próxima ${word}`) || lower.includes(`proxima ${word}`) || lower.includes(word)) {
      return nextWeekday(dayNum);
    }
  }


  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  for (let i = 0; i < months.length; i++) {
    const regex = new RegExp(`(\\d{1,2})\\s+de\\s+${months[i]}`, 'i');
    const match = lower.match(regex);
    if (match) {
      const day = parseInt(match[1]);
      const year = new Date().getFullYear();
      return new Date(year, i, day).toISOString().split('T')[0];
    }
  }


  return undefined;
}


function parsePriority(text: string): Priority | undefined {
  const lower = text.toLowerCase();
  if (lower.includes('urgente') || lower.includes('emergência') || lower.includes('emergencia')) return 'urgente';