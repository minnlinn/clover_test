import { localDateKey } from './dates';

export function getMomentKind(entry) {
  if (entry.image || entry.type === 'photo') return 'photo';
  if (entry.audio || entry.type === 'voice') return 'voice';
  return 'text';
}

export function getWeeklySharedEntries(entries, start, end) {
  const firstDay = localDateKey(start);
  const lastDay = localDateKey(end);

  return entries
    .filter(entry =>
      entry.visibility === 'shared' &&
      typeof entry.date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
      entry.date >= firstDay && entry.date <= lastDay
    )
    .sort((first, second) => second.date.localeCompare(first.date));
}
