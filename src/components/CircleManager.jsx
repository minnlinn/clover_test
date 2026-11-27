import { useState } from 'react';
import { personKey } from '../data/circle';
import CircleUpdates from './CircleUpdates';

export default function CircleManager({ circles, onSave, profile, appointments }) {
  const [selectedId, setSelectedId] = useState(circles[0]?.id);
  const [creating, setCreating] = useState(circles.length === 0);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const active = circles.find(circle => circle.id === selectedId) ?? circles[0];

  function create(event) {
    event.preventDefault();
    const title = name.trim();
    if (!title) return;
    if (circles.some(circle => personKey(circle.name) === personKey(title))) {
      setMessage('You already have a circle with that name.');
      return;
    }
    const circle = { id: crypto.randomUUID(), name: title, members: [] };
    try {
      onSave([...circles, circle]);
      setSelectedId(circle.id);
      setCreating(false);
      setName('');
      setMessage('');
    } catch {
      setMessage('This browser could not save your circle.');
    }
  }

  return (
    <div className="circle-updates">
      <p className="circle-help">Circle updates are saved in this browser.</p>
      {active && (
        <div className="circle-toolbar">
          <label>Circle
            <select value={active.id} onChange={event => {
              setSelectedId(event.target.value);
              setCreating(false);
              setMessage('');
            }}>
              {circles.map(circle => <option key={circle.id} value={circle.id}>{circle.name}</option>)}
            </select>
          </label>
          <button type="button" className="game-secondary" onClick={() => {
            setCreating(value => !value);
            setMessage('');
          }}>{creating ? 'Cancel' : 'Create another circle'}</button>
        </div>
      )}
      {creating && (
        <form className="form-card" onSubmit={create}>
          <label>Circle name
            <input value={name} maxLength={48} required placeholder="e.g. Cousins"
              onChange={event => setName(event.target.value)} />
          </label>
          <button type="submit" className="primary" disabled={!name.trim()}>Create circle</button>
          {message && <p role="status">{message}</p>}
        </form>
      )}
      {active && !creating && (
        <CircleUpdates key={active.id} circleId={active.id} members={active.members} profile={profile}
          appointments={appointments}
          onSave={members => onSave(circles.map(circle => circle.id === active.id ? { ...circle, members } : circle))} />
      )}
    </div>
  );
}
