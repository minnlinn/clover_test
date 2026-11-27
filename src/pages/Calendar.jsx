import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Edit3, Plus, Trash2 } from 'lucide-react';
import { getMonthWeeks, localDateKey } from '../data/dates';
import { demoPeople, personKey } from '../data/circle';

const weekdays = [
  ['Mon', 'Monday'], ['Tue', 'Tuesday'], ['Wed', 'Wednesday'], ['Thu', 'Thursday'],
  ['Fri', 'Friday'], ['Sat', 'Saturday'], ['Sun', 'Sunday'],
];

const monthArt = [
  'winter', 'winter', 'spring', 'spring', 'spring', 'summer',
  'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter',
];

const monthName = new Intl.DateTimeFormat(undefined, { month: 'long' });
const fullDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' });
const shortDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

function appointmentDate(key) {
  const date = new Date(key + 'T12:00:00');
  return Number.isNaN(date.getTime()) ? null : date;
}

function CalendarSheet({ selected, today, counts, onSelect }) {
  const month = selected.getMonth();
  const year = selected.getFullYear();
  const selectedKey = localDateKey(selected);

  return (
    <section className="card calendar-sheet" data-season={monthArt[month]} aria-labelledby="calendar-month">
      <header className="calendar-month-heading">
        <button className="calendar-today" type="button" onClick={() => onSelect(today)}>Today</button>
        <div className="calendar-controls">
          <button className="icon-btn" type="button" aria-label="Previous month"
            onClick={() => onSelect(new Date(year, month - 1, 1, 12))}>
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <h2 id="calendar-month">
            {monthName.format(selected)} <span>{year}</span>
          </h2>
          <button className="icon-btn" type="button" aria-label="Next month"
            onClick={() => onSelect(new Date(year, month + 1, 1, 12))}>
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </div>
      </header>
      <table className="calendar-table" aria-labelledby="calendar-month">
        <thead>
          <tr>
            {weekdays.map(([short, day]) => (
              <th key={day} scope="col" aria-label={day}><span>{short}</span></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {getMonthWeeks(selected).map((week, index) => (
            <tr key={index}>
              {week.map((date, weekday) => {
                if (!date) return <td key={weekday} className="calendar-empty-day" />;

                const key = localDateKey(date);
                const count = counts.get(key) || 0;
                const description = count ? `, ${count} appointment${count === 1 ? '' : 's'}` : '';
                return (
                  <td key={weekday}>
                    <button className="calendar-day" type="button" aria-pressed={key === selectedKey}
                      aria-current={key === localDateKey(today) ? 'date' : undefined}
                      aria-label={fullDate.format(date) + description} onClick={() => onSelect(date)}>
                      <span>{date.getDate()}</span>
                      {count > 0 && <span className="calendar-event-dot" aria-hidden="true" />}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function AppointmentForm({ appointment, date, self, members, onSave, onCancel }) {
  const [draft, setDraft] = useState({
    ...appointment,
    date: appointment.date || date,
    forName: appointment.forName ?? '',
  });
  const others = [...new Map([...members, appointment.forName].filter(Boolean)
    .filter(name => personKey(name) !== personKey(self)).map(name => [personKey(name), name])).values()];

  function change(event) {
    const { name, value } = event.target;
    setDraft(current => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    const title = draft.title.trim();
    if (title) onSave({ ...draft, title });
  }

  return (
    <form className="card form-card appointment-form" onSubmit={submit}>
      <h2>{appointment.id == null ? 'New appointment' : 'Edit appointment'}</h2>
      <label>Appointment<input name="title" value={draft.title} onChange={change} autoFocus required /></label>
      <label>Appointment for
        <select name="forName" value={draft.forName} onChange={change}>
          {appointment.id != null && !appointment.forName && <option value="">Unassigned</option>}
          <option value={self}>{self === 'Me' ? 'Me' : `Me (${self})`}</option>
          {others.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
      <label>With whom or where<input name="with" value={draft.with ?? ''} onChange={change} /></label>
      <label>Appointment location<input name="location" value={draft.location ?? ''} onChange={change} /></label>
      <div className="appointment-fields">
        <label>Date<input type="date" name="date" value={draft.date} onChange={change} required /></label>
        <label>Time<input type="time" name="time" value={draft.time ?? ''} onChange={change} /></label>
      </div>
      <label>Reminder
        <select name="reminder" value={draft.reminder ?? '1 day before'} onChange={change}>
          <option>30 minutes before</option>
          <option>1 day before</option>
          <option>1 week before</option>
        </select>
      </label>
      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button className="primary" type="submit" disabled={!draft.title.trim()}>Save appointment</button>
      </div>
    </form>
  );
}

function DayAgenda({ selected, appointments, onEdit, onRemove }) {
  return (
    <section className="card calendar-agenda" aria-labelledby="agenda-date">
      <h2 id="agenda-date" aria-live="polite">{fullDate.format(selected)}</h2>
      {appointments.length ? (
        <ul className="calendar-appointments">
          {appointments.map(appointment => (
            <li key={appointment.id}>
              <div className="appointment-info">
                <h3>{appointment.title}</h3>
                {appointment.forName && <p><b>For {appointment.forName}</b></p>}
                {appointment.location && <p>Location: {appointment.location}</p>}
                <p>{[appointment.time, appointment.with].filter(Boolean).join(' · ')}</p>
                {appointment.reminder && <small>Reminder {appointment.reminder}</small>}
                {appointment.addedBy && appointment.addedBy !== appointment.forName && (
                  <small>Added by {appointment.addedBy}</small>
                )}
              </div>
              <div className="appointment-actions">
                <button className="icon-btn" type="button" aria-label={`Edit ${appointment.title}`}
                  onClick={() => onEdit(appointment)}><Edit3 size={18} aria-hidden="true" /></button>
                <button className="icon-btn" type="button" aria-label={`Delete ${appointment.title}`}
                  onClick={() => onRemove(appointment)}><Trash2 size={18} aria-hidden="true" /></button>
              </div>
            </li>
          ))}
        </ul>
      ) : <p>No appointments for this day.</p>}
    </section>
  );
}

export default function Calendar({ appointments, setAppointments, profile, circleMembers = [] }) {
  const [params] = useSearchParams();
  const member = params.get('member')?.trim();
  const today = new Date();
  const [selected, setSelected] = useState(today);
  const [draft, setDraft] = useState(null);
  const selectedKey = localDateKey(selected);
  const todayKey = localDateKey(today);
  const name = profile.name.trim() || 'Me';
  const members = [...(circleMembers.length ? circleMembers : demoPeople), member].filter(Boolean);
  const self = demoPeople.find(member => personKey(member) === personKey(name)) ?? name;

  const sorted = appointments.filter(appointment => !member || personKey(appointment.forName) === personKey(member)).sort((a, b) =>
    `${a.date ?? ''} ${a.time ?? ''}`.localeCompare(`${b.date ?? ''} ${b.time ?? ''}`)
  );
  const selectedAppointments = sorted.filter(appointment => appointment.date === selectedKey);
  const counts = new Map();
  for (const { date } of sorted) counts.set(date, (counts.get(date) || 0) + 1);
  const upcoming = sorted.filter(appointment => appointment.date >= todayKey && appointment.date !== selectedKey);
  const unscheduled = sorted.filter(appointment => !appointmentDate(appointment.date));

  function addAppointment() {
    const forName = personKey(member) === personKey(self) ? self : member || self;
    setDraft({ title: '', forName, date: selectedKey, time: '10:00', with: '', location: '', reminder: '1 day before' });
  }

  function saveAppointment(appointment) {
    if (appointment.id == null) {
      const created = { ...appointment, id: Date.now(), addedBy: self };
      setAppointments(current => [...current, created]);
    } else {
      setAppointments(current => current.map(item => item.id === appointment.id ? appointment : item));
    }
    setSelected(appointmentDate(appointment.date) || selected);
    setDraft(null);
  }

  function removeAppointment(appointment) {
    if (window.confirm(`Delete ${appointment.title}?`)) {
      setAppointments(current => current.filter(item => item.id !== appointment.id));
      setDraft(current => current?.id === appointment.id ? null : current);
    }
  }

  return (
    <div className="calendar-page">
      <header className="page-head calendar-heading">
        <h1>Calendar</h1>
        <button className="primary" type="button" onClick={addAppointment}>
          <Plus size={18} aria-hidden="true" /> Add appointment
        </button>
      </header>
      {member && <p className="card"><strong>Appointments for {member}</strong> · <Link className="text-btn" to="/calendar">Show all</Link></p>}
      {draft && (
        <AppointmentForm key={draft.id ?? 'new'} appointment={draft} date={selectedKey} self={self} members={members}
          onCancel={() => setDraft(null)} onSave={saveAppointment} />
      )}
      <div className="calendar-layout">
        <CalendarSheet selected={selected} today={today} counts={counts} onSelect={setSelected} />
        <div className="calendar-side">
          <DayAgenda selected={selected} appointments={selectedAppointments} onEdit={setDraft} onRemove={removeAppointment} />
          {(member || upcoming.length > 0 || unscheduled.length > 0) && (
            <section className="card calendar-upcoming" aria-labelledby="calendar-upcoming">
              <h2 id="calendar-upcoming">{member ? 'Member schedule' : 'Upcoming'}</h2>
              {member && !sorted.length && <p>No appointments for {member}.</p>}
              <ul className="calendar-appointments">
                {(member ? sorted : [...upcoming, ...unscheduled]).map(appointment => {
                  const date = appointmentDate(appointment.date);
                  return (
                    <li key={appointment.id}>
                      <button type="button" className="calendar-jump" onClick={() => date ? setSelected(date) : setDraft(appointment)}>
                        <Clock size={19} aria-hidden="true" />
                        <span>
                          <b>{appointment.title}</b>
                          <small>{date ? shortDate.format(date) : 'Choose a date'}</small>
                          {appointment.forName && <small>For {appointment.forName}</small>}
                          {appointment.location && <small>Location: {appointment.location}</small>}
                          {member && appointment.with && <small>{appointment.with}</small>}
                          {member && appointment.time && <small>{appointment.time}</small>}
                          {member && appointment.reminder && <small>Reminder {appointment.reminder}</small>}
                        </span>
                        <ChevronRight size={18} aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
