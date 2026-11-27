import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { demoPeople, personKey } from '../data/circle';
import { localDateKey } from '../data/dates';
import { locationShareKey, mapUrl, readLocationShare } from '../data/locationShare';

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

export default function CircleUpdates({ circleId, members, onSave, profile, appointments }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [now, setNow] = useState(Date.now);
  const today = localDateKey(new Date(now));
  const self = profile.name.trim() || 'Me';
  const people = [self, ...members.filter(member => personKey(member) !== personKey(self))];
  const peopleKeys = new Set(people.map(personKey));
  const todayPlans = appointments.filter(appointment => appointment.date === today &&
    peopleKeys.has(personKey(appointment.forName)))
    .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  const suggestions = demoPeople.filter(person => !peopleKeys.has(personKey(person)));

  useEffect(() => {
    function updateDay() { setNow(Date.now()); }
    function updateLocations(event) {
      if (event.key === null || event.key.startsWith(locationShareKey)) updateDay();
    }
    const timer = window.setInterval(updateDay, 30_000);
    window.addEventListener('focus', updateDay);
    window.addEventListener('storage', updateLocations);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', updateDay);
      window.removeEventListener('storage', updateLocations);
    };
  }, []);

  function save(next, success) {
    try {
      onSave(next);
      setMessage(success);
      return true;
    } catch {
      setMessage('This browser couldn’t save your circle.');
      return false;
    }
  }

  function add(event) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (peopleKeys.has(personKey(trimmed))) {
      setMessage('That person is already in your circle.');
      return;
    }
    if (save([...members, trimmed], trimmed + ' added.')) setName('');
  }

  return (
    <div className="circle-updates">
      <form className="form-card" onSubmit={add}>
        <label>
          Member name
          <input value={name} onChange={event => setName(event.target.value)}
            list="circle-names" autoComplete="off" maxLength={48} required />
        </label>
        <datalist id="circle-names">
          {suggestions.map(person => <option value={person} key={person} />)}
        </datalist>
        <button className="primary" type="submit" disabled={!name.trim()}>Add member</button>
        <p role="status">{message}</p>
      </form>
      {members.length > 0 && (
        <div className="circle-summary">
          <section aria-labelledby="circle-today">
            <h3 id="circle-today">Today at a glance</h3>
            <ul className="circle-list">
              {people.map((person, index) => {
                const plans = todayPlans.filter(plan => personKey(plan.forName) === personKey(person));
                const location = readLocationShare(circleId, person, now);
                const schedule = '/calendar?' + new URLSearchParams({ member: person });
                return (
                  <li key={personKey(person)}>
                    <div>
                      <strong>{person}{index === 0 ? ' (you)' : ''}</strong>
                      {plans.length ? plans.map(plan => (
                        <small key={plan.id}>{plan.time ? plan.time + ' · ' : ''}{plan.title}{plan.location && ' · Venue: ' + plan.location}</small>
                      )) : <small>No plans scheduled today</small>}
                      {location ? (
                        <small><a href={mapUrl(location)} target="_blank" rel="noreferrer">Last shared location</a> · {timeFormat.format(new Date(location.timestamp))}</small>
                      ) : <small>Location not shared</small>}
                      <Link className="text-btn" to={schedule}>View appointments<span className="visually-hidden"> for {person}</span></Link>
                    </div>
                    {index !== 0 && <button type="button" className="text-btn" aria-label={'Remove ' + person}
                      onClick={() => save(members.filter(member => member !== person), person + ' removed.')}>Remove</button>}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
