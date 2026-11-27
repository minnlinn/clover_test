import { useRef, useState } from 'react';
import { mapUrl, readLocationShare, saveLocationShare, shareDuration, stopLocationShare } from '../data/locationShare';

export default function CareLocation({ circles, profile }) {
  const [position, setPosition] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const linkField = useRef(null);
  const [circleId, setCircleId] = useState(circles[0]?.id ?? '');
  const [, refreshShare] = useState(0);
  const person = profile.name.trim() || 'Me';
  const currentShare = circleId && readLocationShare(circleId, person, Date.now());
  const mapLink = position ? mapUrl(position) : '';

  function updateCircleShare(enabled) {
    if (enabled && (!position || Date.now() >= position.timestamp + shareDuration)) {
      setMessage('Get a fresh location before sharing it.');
      return;
    }
    try {
      if (enabled) saveLocationShare(circleId, person, position);
      else stopLocationShare(circleId, person);
      refreshShare(value => value + 1);
      setMessage(enabled ? 'Location shared in this circle for up to one hour on this browser.' : 'Circle location sharing stopped.');
    } catch {
      setMessage('This browser could not update location sharing.');
    }
  }

  function locate() {
    if (!window.isSecureContext || !navigator.geolocation) {
      setMessage('Location works on HTTPS or localhost in a browser with location access.');
      return;
    }
    setPosition(null);
    setBusy(true);
    setMessage('Finding your location…');
    navigator.geolocation.getCurrentPosition(({ coords, timestamp }) => {
      setPosition({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy, timestamp });
      setBusy(false);
      setMessage('');
    }, error => {
      setMessage(error.code === 1
        ? 'Location access was denied. You can enable it in your browser settings.'
        : 'Your location is unavailable right now. Try again.');
      setBusy(false);
    }, { timeout: 15000, maximumAge: 0 });
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My current location', url: mapLink });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(mapLink);
      setMessage('Link copied. Paste it into a message to the person you choose.');
    } catch {
      linkField.current?.select();
      setMessage('Copy the selected link and send it to the person you choose.');
    }
  }

  return (
    <section className="card care-detail">
      <h2>Share your location</h2>
      <p>Send a one-time map link to a partner or family member. They can share their own location the same way.</p>
      <button className="primary" type="button" disabled={busy} onClick={locate}>
        {position ? 'Update my location' : 'Get my location'}
      </button>
      <p role="status">{message}</p>
      {circles.length > 0 && (
        <div className="care-location-result">
          <label>Circle
            <select value={circleId} onChange={event => { setCircleId(event.target.value); setMessage(''); }}>
              {circles.map(circle => <option key={circle.id} value={circle.id}>{circle.name}</option>)}
            </select>
          </label>
          <p>Sharing adds a location snapshot to this circle on this browser for up to one hour.</p>
          <div className="care-photo-controls">
            <button className="game-secondary" type="button" disabled={!position}
              onClick={() => updateCircleShare(true)}>{currentShare ? 'Update circle location' : 'Share location with circle'}</button>
            {currentShare && <button className="text-btn" type="button" onClick={() => updateCircleShare(false)}>Stop circle sharing</button>}
          </div>
        </div>
      )}
      {position && (
        <div className="care-location-result">
          <p>Updated at {new Date(position.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}. Approximate accuracy {Math.round(position.accuracy)} m.</p>
          <label>Map link<input ref={linkField} readOnly value={mapLink} /></label>
          <div className="care-photo-controls">
            <button className="primary" type="button" onClick={share}>Share map link</button>
            <a className="text-btn" href={mapLink} target="_blank" rel="noreferrer">Open map</a>
            <button className="text-btn" type="button" onClick={() => { setPosition(null); setMessage(''); }}>Clear location</button>
          </div>
        </div>
      )}
    </section>
  );
}
