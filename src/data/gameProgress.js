import { localDateKey } from './dates';

export const gameLevels = Object.fromEntries(Array.from({ length: 10 }, (_, index) => {
  const level = index + 1;
  return [level, { label: `Level ${level}`, points: level * 10, pairs: level + 3 }];
}));

const legacyPoints = { easy: 10, medium: 20, hard: 30 };

function pointsForDifficulty(difficulty) {
  if (Object.hasOwn(gameLevels, difficulty)) return gameLevels[difficulty].points;
  if (Object.hasOwn(legacyPoints, difficulty)) return legacyPoints[difficulty];
  return 0;
}

export const gameStoragePrefix = 'clover-care-games.';

export function makeGameId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function loadGameProgress() {
  const players = [];
  const wins = [];

  try {
    const storage = globalThis.localStorage;
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (!key?.startsWith(gameStoragePrefix)) continue;

      let record;
      try {
        record = JSON.parse(storage.getItem(key));
      } catch {
        continue;
      }
      if (typeof record?.id !== 'string') continue;

      if (key === `${gameStoragePrefix}player.${record.id}` && record.id !== 'self' && typeof record.name === 'string') {
        players.push(record);
      } else if (
        key === `${gameStoragePrefix}win.${record.id}` &&
        typeof record.playerId === 'string' &&
        pointsForDifficulty(record.difficulty) > 0 &&
        typeof record.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(record.day)
      ) {
        wins.push(record);
      }
    }
  } catch {
    // The games can still be played if storage is unavailable.
  }

  return { players, wins };
}

export function storeGameRecord(kind, record) {
  try {
    const key = `${gameStoragePrefix}${kind}.${record.id}`;
    globalThis.localStorage.setItem(key, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function getGameStreak(days, today = new Date()) {
  const completedDays = new Set(days);
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  if (!completedDays.has(localDateKey(day))) {
    day.setDate(day.getDate() - 1);
  }

  let streak = 0;
  while (completedDays.has(localDateKey(day))) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

export function getGameStandings(players, wins, today = new Date()) {
  return players.map(player => {
    const completed = wins.filter(win => win.playerId === player.id);
    return {
      ...player,
      points: completed.reduce((total, win) => total + pointsForDifficulty(win.difficulty), 0),
      streak: getGameStreak(completed.map(win => win.day), today),
    };
  }).sort((first, second) => second.points - first.points || second.streak - first.streak || first.name.localeCompare(second.name));
}
