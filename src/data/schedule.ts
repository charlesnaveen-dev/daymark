import { ScheduleBlock, WeeklyFocusItem } from '../types';

export const DAILY_SCHEDULE: ScheduleBlock[] = [
  {
    id: 'agency-tech',
    startTime: '10:00',
    endTime: '12:30',
    timeLabel: '10:00 AM – 12:30 PM',
    title: 'AGENCY — TECHNICAL DEVELOPMENT',
    category: 'Agency',
    subBlocks: [
      { timeRange: '10:00–10:15', title: "Review today's goals." },
      { timeRange: '10:15–11:15', title: 'Technical learning.' },
      { timeRange: '11:15–12:30', title: 'Build real projects.' },
    ],
  },
  {
    id: 'break-lunch',
    startTime: '12:30',
    endTime: '14:30',
    timeLabel: '12:30 PM – 2:30 PM',
    title: 'BREAK',
    category: 'Break',
    description: 'Lunch, rest and personal time.',
  },
  {
    id: 'agency-biz',
    startTime: '14:30',
    endTime: '17:00',
    timeLabel: '2:30 PM – 5:00 PM',
    title: 'AGENCY — BUSINESS DEVELOPMENT',
    category: 'Agency',
    subBlocks: [
      { timeRange: '2:30–3:15', title: 'Lead generation.' },
      { timeRange: '3:15–4:00', title: 'Client outreach.' },
      { timeRange: '4:00–4:45', title: 'Portfolio and marketing.' },
      { timeRange: '4:45–5:00', title: 'Follow-ups.' },
    ],
  },
  {
    id: 'break-exercise',
    startTime: '17:00',
    endTime: '18:00',
    timeLabel: '5:00 PM – 6:00 PM',
    title: 'BREAK / EXERCISE',
    category: 'Break',
    description: 'Exercise, refresh and snack.',
  },
  {
    id: 'music-musicianship',
    startTime: '18:00',
    endTime: '19:30',
    timeLabel: '6:00 PM – 7:30 PM',
    title: 'MUSIC — MUSICIANSHIP',
    category: 'Music',
    subBlocks: [
      { timeRange: '6:00–6:30', title: 'Keyboard practice.' },
      { timeRange: '6:30–7:00', title: 'Ear training and harmony.' },
      { timeRange: '7:00–7:30', title: 'Reference-song analysis.' },
    ],
  },
  {
    id: 'break-dinner',
    startTime: '19:30',
    endTime: '21:00',
    timeLabel: '7:30 PM – 9:00 PM',
    title: 'BREAK',
    category: 'Break',
    description: 'Dinner, relaxation and personal time.',
  },
  {
    id: 'music-production',
    startTime: '21:00',
    endTime: '23:00',
    timeLabel: '9:00 PM – 11:00 PM',
    title: 'MUSIC — PRODUCTION',
    category: 'Music',
    subBlocks: [
      { timeRange: '9:00–9:30', title: 'Sound design.' },
      { timeRange: '9:30–10:15', title: 'Arrangement and programming.' },
      { timeRange: '10:15–11:00', title: 'Original music production.' },
    ],
  },
  {
    id: 'daily-review',
    startTime: '23:00',
    endTime: '23:15',
    timeLabel: '11:00 PM – 11:15 PM',
    title: 'DAILY REVIEW',
    category: 'Other',
    description: 'Review completed tasks and plan tomorrow.',
  },
];

export const WEEKLY_FOCUS_ROTATION: WeeklyFocusItem[] = [
  {
    dayIndex: 1,
    dayName: 'Monday',
    agencyFocus: 'React / Next.js',
    musicFocus: 'Chords & harmony',
  },
  {
    dayIndex: 2,
    dayName: 'Tuesday',
    agencyFocus: 'Backend / SQL',
    musicFocus: 'Sound design',
  },
  {
    dayIndex: 3,
    dayName: 'Wednesday',
    agencyFocus: 'Web development',
    musicFocus: 'Arrangement',
  },
  {
    dayIndex: 4,
    dayName: 'Thursday',
    agencyFocus: 'AI integrations',
    musicFocus: 'Synthesizers',
  },
  {
    dayIndex: 5,
    dayName: 'Friday',
    agencyFocus: 'CRM / custom software',
    musicFocus: 'Ear candy & FX',
  },
  {
    dayIndex: 6,
    dayName: 'Saturday',
    agencyFocus: 'App development / SEO',
    musicFocus: 'Complete song production',
  },
  {
    dayIndex: 0,
    dayName: 'Sunday',
    agencyFocus: 'Review & planning',
    musicFocus: 'Listening / light practice',
  },
];

export function getFocusForDay(dayIndex: number): WeeklyFocusItem {
  return (
    WEEKLY_FOCUS_ROTATION.find((item) => item.dayIndex === dayIndex) ??
    WEEKLY_FOCUS_ROTATION[0]
  );
}
