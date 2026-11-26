export const DAILY_MOTIVATION_QUOTES: string[] = [
  'Small progress is still progress.',
  'Your future is built by what you do today.',
  "Don't chase perfection. Complete the work.",
  'One focused day at a time.',
  'Show up today. Your future self will thank you.',
  'Consistency compounds quietly.',
  'Protect your deep work blocks.',
  'Every finished session builds momentum.',
  'Clarity comes from action, not overthinking.',
  'Build the craft. Trust the process.',
];

export const ACHIEVEMENT_MESSAGES: string[] = [
  'Another day invested in your future.',
  "You're building consistency.",
  'Your skills are growing one session at a time.',
  'Steady execution wins the long game.',
];

export function getDailyMotivation(dateStr: string): string {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return DAILY_MOTIVATION_QUOTES[hash % DAILY_MOTIVATION_QUOTES.length];
}

export function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
