import { groups } from './mockData';

const circleKey = 'clover-care-circle';
export const demoPeople = [...new Set(groups.flatMap(group => group.members.map(member => member.name)))];

export function personKey(name) {
  return typeof name === 'string' ? name.trim().normalize('NFKC').toLowerCase() : '';
}

export function loadCircle() {
  try {
    const saved = JSON.parse(localStorage.getItem(circleKey));
    if (!Array.isArray(saved) || !saved.length) return [];
    const validMembers = members => members.filter(name => personKey(name));
    return saved.filter(circle => circle && typeof circle.id === 'string' && personKey(circle.name) &&
      personKey(circle.name) !== 'my circle' && Array.isArray(circle.members))
      .map(circle => ({ ...circle, members: validMembers(circle.members) }));
  } catch {
    return [];
  }
}

export function saveCircle(circles) {
  localStorage.setItem(circleKey, JSON.stringify(circles));
}

export function uniquePeople(names) {
  return [...new Map(names.filter(personKey).map(name => [personKey(name), name])).values()];
}
