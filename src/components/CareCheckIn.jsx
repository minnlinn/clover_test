import { useEffect, useState } from 'react';
import InkDrawing from './InkDrawing';
import { localDateKey } from '../data/dates';
import { demoPeople, personKey } from '../data/circle';

const selectionKey = 'clover-care-check-in.person';
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

function readPreference(key) {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function checkInKey(day, selected) {
  return `clover-care-check-in.${day}.${selected ? 'member.' + personKey(selected) : 'self'}`;
}

function readCheckIn(key) {
  const saved = readPreference(key);
  if (!saved) return null;
  if (!Number.isNaN(Date.parse(saved))) return { at: saved, place: '' };
  try {
    const record = JSON.parse(saved);
    return record && !Number.isNaN(Date.parse(record.at)) ? record : null;
  } catch {
    return null;
  }
}

export function getMemberCheckIn(day, person, profileName) {
  return readCheckIn(checkInKey(day, personKey(person) === personKey(profileName) ? '' : person));
}

export default function CareCheckIn({ profile, circleMembers = [] }) {
  const profileName = profile.name.trim();
  const [selected, setSelected] = useState(() => readPreference(selectionKey));
  const [day, setDay] = useState(() => localDateKey(new Date()));
  const [latest, setLatest] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');
  const [place, setPlace] = useState('');

  const person = selected || profileName;
  const storageKey = checkInKey(day, selected);
  const checkIn = latest?.key === storageKey ? latest.record : readCheckIn(storageKey);
  const names = [...new Set([profileName, ...(circleMembers.length ? circleMembers : demoPeople)].filter(Boolean))];

  useEffect(() => {
    const updateDay = () => setDay(localDateKey(new Date()));
    const refresh = event => {
      if (event.key === null || event.key === storageKey) {
        setLatest({ key: storageKey, record: readCheckIn(storageKey) });
      }
      if (event.key === null || event.key === selectionKey) {
        setSelected(readPreference(selectionKey));
      }
    };
    const timer = window.setInterval(updateDay, 30_000);
    window.addEventListener('focus', updateDay);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', updateDay);
      window.removeEventListener('storage', refresh);
    };
  }, [storageKey]);

  function changePerson(event) {
    event.preventDefault();
    const choice = draft.trim();
    if (!choice) {
      setMessage('Enter the name of the person checking in.');
      return;
    }
    const next = personKey(choice) === personKey(profileName) ? '' : choice;
    try {
      localStorage.setItem(selectionKey, next);
    } catch {
      setMessage('The browser couldn’t save the check-in person.');
      return;
    }
    setSelected(next);
    setPlace('');
    setEditing(false);
    setMessage('');
  }

  function updateCheckIn() {
    const now = new Date();
    const today = localDateKey(now);
    const key = checkInKey(today, selected);
    const record = readCheckIn(key) ? null : { at: now.toISOString(), place: place.trim() };

    try {
      if (record) localStorage.setItem(key, JSON.stringify(record));
      else localStorage.removeItem(key);
    } catch {
      setMessage('The browser couldn’t save this check-in.');
      return;
    }

    setDay(today);
    setLatest({ key, record });
    setPlace('');
    setMessage('');
  }

  return (
    <section className="card care-check" aria-labelledby="daily-check-in">
      <div className="check-in-heading">
        <InkDrawing name="cup" />
        <div>
          <h2 id="daily-check-in">Daily check-in</h2>
          <p aria-live="polite">
            {checkIn
              ? `${person || 'You'} checked in at ${timeFormat.format(new Date(checkIn.at))}.`
              : person ? `Has ${person} checked in today?` : 'Have you checked in today?'}
          </p>
          {checkIn?.place && <p>Location: {checkIn.place}</p>}
        </div>
      </div>
      {!checkIn && (
        <label className="check-in-place">Location (optional)
          <input value={place} maxLength={80} placeholder="e.g. Home" onChange={event => setPlace(event.target.value)} />
        </label>
      )}
      <div className="check-in-actions">
        <button type="button" className={checkIn ? 'game-secondary' : 'primary'} onClick={updateCheckIn}>
          {checkIn ? 'Undo check-in' : 'Mark checked in'}
        </button>
        <button type="button" className="text-btn" aria-expanded={editing} onClick={() => {
          setDraft(person);
          setMessage('');
          setEditing(current => !current);
        }}>
          {editing ? 'Cancel' : 'Change person'}
        </button>
      </div>
      {editing && (
        <form className="check-in-form" onSubmit={changePerson}>
          <label>
            Person checking in
            <input value={draft} list="clover-check-in-names" maxLength={48} autoComplete="off"
              onChange={event => setDraft(event.target.value)} required />
          </label>
          <datalist id="clover-check-in-names">
            {names.map(name => <option value={name} key={name} />)}
          </datalist>
          <button className="primary" type="submit">Set person</button>
        </form>
      )}
      {message && <p className="check-in-error" role="alert">{message}</p>}
    </section>
  );
}
