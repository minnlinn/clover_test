import { personKey } from './circle';

export const locationShareKey = 'clover-circle-location.';
export const shareDuration = 60 * 60 * 1000;

function storageKey(circleId, person) {
  return locationShareKey + JSON.stringify([circleId, personKey(person)]);
}

export function mapUrl(position) {
  return 'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(position.latitude + ',' + position.longitude);
}

export function readLocationShare(circleId, person, now) {
  try {
    const record = JSON.parse(localStorage.getItem(storageKey(circleId, person)));
    return record && Number.isFinite(record.latitude) && Number.isFinite(record.longitude) &&
      Number.isFinite(record.timestamp) && record.timestamp <= now &&
      now < record.timestamp + shareDuration ? record : null;
  } catch {
    return null;
  }
}

export function saveLocationShare(circleId, person, position) {
  localStorage.setItem(storageKey(circleId, person), JSON.stringify(position));
}

export function stopLocationShare(circleId, person) {
  localStorage.removeItem(storageKey(circleId, person));
}
