import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CalendarDays, ChevronDown, ChevronRight, CircleCheck, Images, MapPin, Puzzle } from 'lucide-react';
import CareCheckIn from '../components/CareCheckIn';
import CareLocation from '../components/CareLocation';
import CircleManager from '../components/CircleManager';
import InkDrawing from '../components/InkDrawing';
import { localDateKey } from '../data/dates';
import { getMomentKind } from '../data/journal';

const sections = [
  { id: 'check-in', title: 'Daily check-in', Icon: CircleCheck },
  { id: 'reminders', title: 'Reminders', Icon: Bell },
  { id: 'games', title: 'Brain games', Icon: Puzzle, to: '/care/games' },
  { id: 'location', title: 'Location sharing', Icon: MapPin },
  { id: 'moments', title: 'Shared moments', Icon: Images, family: true },
  { id: 'appointments', title: 'Appointments', Icon: CalendarDays, family: true },
];

function CareReminders() {
  const storageKey = `clover-sample-reminder.${localDateKey(new Date())}`;
  const [done, setDone] = useState(() => localStorage.getItem(storageKey) === 'done');

  function toggleReminder() {
    if (done) localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, 'done');
    setDone(!done);
  }

  return (
    <section className="card care-detail">
      <h2>Reminders</h2>
      <div className="care-detail-row">
        <div>
          <h3>Evening vitamins</h3>
          <p>8:00 PM · Sample reminder</p>
        </div>
        <button type="button" className={done ? 'game-secondary' : 'primary'} onClick={toggleReminder}>
          {done ? 'Undo completion' : 'Mark done'}
        </button>
      </div>
      <p className="care-status" aria-live="polite">{done && 'Marked done today.'}</p>
      <Link className="text-btn" to="/calendar">See appointment reminders</Link>
    </section>
  );
}

function CareMoments({ entries }) {
  const shared = entries.filter(entry => entry.visibility === 'shared').slice(0, 2);

  return (
    <section className="card care-detail">
      <h2>Shared moments</h2>
      {shared.map(entry => (
        <div className="care-detail-row" key={entry.id}>
          <InkDrawing name={getMomentKind(entry)} className="entry-illustration" />
          <div><h3>{entry.title}</h3><p>{entry.caption}</p></div>
        </div>
      ))}
      {shared.length === 0 && <p>No shared moments yet.</p>}
      <Link className="text-btn" to="/highlights">View this week’s highlights</Link>
    </section>
  );
}

function CareAppointments({ appointments }) {
  const today = localDateKey(new Date());
  const upcoming = appointments.filter(appointment => appointment.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 2);

  return (
    <section className="card care-detail">
      <h2>Appointments</h2>
      {upcoming.map(appointment => (
        <div className="care-detail-row" key={appointment.id}>
          <CalendarDays size={25} aria-hidden="true" />
          <div>
            <h3>{appointment.title}</h3>
            {appointment.forName && <p>For {appointment.forName}</p>}
            <p>{new Date(appointment.date + 'T12:00').toLocaleDateString(undefined, { dateStyle: 'long' })}{appointment.time && ` · ${appointment.time}`}</p>
          </div>
        </div>
      ))}
      {upcoming.length === 0 && <p>No upcoming appointments.</p>}
      <Link className="text-btn" to="/calendar">Open calendar</Link>
    </section>
  );
}

export default function CareCircle({ entries, appointments, profile, circles = [], circleMembers = [], onSaveCircle }) {
  const [openSection, setOpenSection] = useState(null);
  const options = sections.filter(section => !section.family || profile.careView === 'family');

  useEffect(() => {
    if (openSection && window.matchMedia('(max-width: 660px)').matches) {
      const detailsId = openSection === 'circle' ? 'circle-details' : 'care-details';
      document.getElementById(detailsId)?.scrollIntoView({ block: 'nearest' });
    }
  }, [openSection]);

  return (
    <div className="care-circle">
      <header className="page-head care-circle-heading">
        <h1>Care Circle</h1>
        <Link className="text-btn" to="/settings#care-preferences">Care preferences</Link>
      </header>
      <div className="care-options">
        {options.map(({ id, title, Icon, to }) => to ? (
          <Link key={id} className="card care-option care-option-link" to={to}>
            <span className="care-option-icon care-option-icon--games"><Icon size={26} aria-hidden="true" /></span>
            <span>{title}</span>
            <ChevronRight className="care-option-chevron" size={21} aria-hidden="true" />
          </Link>
        ) : (
          <button key={id} className="card care-option" type="button" aria-expanded={openSection === id}
            aria-controls="care-details" onClick={() => setOpenSection(current => current === id ? null : id)}>
            <span className={`care-option-icon care-option-icon--${id}`}><Icon size={26} aria-hidden="true" /></span>
            <span>{title}</span>
            <ChevronDown className="care-option-chevron" size={21} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div id="care-details" className="care-details" hidden={!openSection || openSection === 'circle'}>
        {openSection === 'check-in' && <CareCheckIn profile={profile} circleMembers={circleMembers} />}
        {openSection === 'reminders' && <CareReminders />}
        {openSection === 'location' && <CareLocation circles={circles} profile={profile} />}
        {openSection === 'moments' && <CareMoments entries={entries} />}
        {openSection === 'appointments' && <CareAppointments appointments={appointments} />}
      </div>
      <section className="card circle-card">
        <button className="primary" type="button" aria-expanded={openSection === 'circle'} aria-controls="circle-details"
          onClick={() => setOpenSection(current => current === 'circle' ? null : 'circle')}>
          {circles.length ? 'My circles' : 'Create a circle'}
        </button>
        <div id="circle-details" hidden={openSection !== 'circle'}>
          {openSection === 'circle' && (
            <CircleManager circles={circles} onSave={onSaveCircle} profile={profile}
              appointments={appointments} />
          )}
        </div>
      </section>
    </div>
  );
}
