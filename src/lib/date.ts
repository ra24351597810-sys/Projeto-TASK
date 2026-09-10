const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];


const MONTHS_SHORT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];


const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];


export function formatDate(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}


export function formatDateShort(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}


export function formatWeekday(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return WEEKDAYS[d.getDay()];
}


export function getWeekdayShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return WEEKDAYS_SHORT[d.getDay()];
}


export function getMonthName(month: number): string {
  return MONTHS[month];
}


export function getMonthShort(month: number): string {
  return MONTHS_SHORT[month];
}


export function getWeekdaysShort(): string[] {
  return WEEKDAYS_SHORT;
}


export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}


export function isToday(date: string | null): boolean {
  if (!date) return false;
  return date === todayString();
}


export function isOverdue(task: { due_date: string | null; status: string }): boolean {
  if (!task.due_date || task.status === 'concluida') return false;