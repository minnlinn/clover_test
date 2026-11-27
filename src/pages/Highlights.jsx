import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import InkDrawing from '../components/InkDrawing';
import { getWeekRange } from '../data/dates';
import { getMomentKind, getWeeklySharedEntries } from '../data/journal';

const weekFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric' });

const folders = [
  { kind: 'photo', title: 'Photo memories', accent: 'vase', empty: 'No photos shared this week.' },
  { kind: 'voice', title: 'Voice notes', accent: 'cup', empty: 'No voice notes shared this week.' },
  { kind: 'text', title: 'Written updates', accent: 'letter', empty: 'No written updates shared this week.' },
];

function HighlightPicture({ entry, kind }) {
  const [unavailable, setUnavailable] = useState('');

  if (entry?.image && entry.image !== unavailable) {
    return <img className="highlight-photo" src={entry.image} alt={`From ${entry.title}`} onError={() => setUnavailable(entry.image)} />;
  }

  return <InkDrawing name={kind} />;
}

export default function Highlights({ entries }) {
  const [week, setWeek] = useState(0);
  const { start, end } = getWeekRange(new Date(), week);
  const shared = getWeeklySharedEntries(entries, start, end);

  return (
    <section className="weekly-highlights" aria-labelledby="highlights-title">
      <header className="highlights-header">
        <p className="highlights-dates">{weekFormat.formatRange(start, end)}</p>
        <h1 id="highlights-title">{week === 0 ? 'This week’s' : 'Weekly'} <em>highlights</em></h1>
        <p>Shared memories from your Clover diary.</p>
        <div className="week-navigation" aria-label="Choose a week">
          <button type="button" onClick={() => setWeek(current => current - 1)}>
            <ChevronLeft size={18} aria-hidden="true" /> Previous
          </button>
          <button type="button" disabled={week === 0} onClick={() => setWeek(current => Math.min(0, current + 1))}>
            Next <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </header>
      <div className="highlight-folders">
        {folders.map(({ kind, title, accent, empty }) => {
          const listed = shared.filter(entry => getMomentKind(entry) === kind).slice(0, 3);
          const featured = listed[0];
          return (
            <section className="highlight-folder" key={kind}>
              <div className="folder-collage">
                <div className="folder-paper" aria-hidden="true" />
                <div className="folder-print">
                  <HighlightPicture entry={featured} kind={kind} />
                </div>
                <div className="folder-stamp"><InkDrawing name={accent} /></div>
              </div>
              <h2>{title}</h2>
              {listed.length > 0 ? (
                <ul>
                  {listed.map(entry => (
                    <li key={entry.id}>
                      <time dateTime={entry.date}>{dayFormat.format(new Date(`${entry.date}T12:00:00`))}</time>
                      <h3>{entry.title}</h3>
                      {entry.caption && <p>{entry.caption}</p>}
                      {entry.audio && (
                        <audio controls preload="none" src={entry.audio} aria-label={`Play ${entry.title}`} />
                      )}
                    </li>
                  ))}
                </ul>
              ) : <p className="highlight-empty">{empty}</p>}
            </section>
          );
        })}
      </div>
      <Link className="highlights-diary-link" to="/diary">Open diary <ChevronRight size={18} aria-hidden="true" /></Link>
    </section>
  );
}
