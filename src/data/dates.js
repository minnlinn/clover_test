export function localDateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function getWeekRange(date, offset = 0) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const daysSinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday + offset * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}

export function getMonthWeeks(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1, 12);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0, 12).getDate();

  return Array.from({ length: Math.ceil((offset + days) / 7) }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const day = week * 7 + weekday + 1 - offset;
      return day > 0 && day <= days ? new Date(year, month, day, 12) : null;
    })
  );
}
