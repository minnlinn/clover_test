import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { resizePhoto } from '../data/photo';

const photoKey = 'clover-profile-photo';

function readPhoto() {
  try { return localStorage.getItem(photoKey); }
  catch { return null; }
}

export default function ProfilePhoto() {
  const [photo, setPhoto] = useState(readPhoto);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function upload(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setMessage('');
    try {
      const next = await resizePhoto(file, 384);
      localStorage.setItem(photoKey, next);
      setPhoto(next);
      setMessage('Profile photo saved on this device.');
    } catch {
      setMessage('Could not save this photo. Try a smaller JPEG or PNG.');
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    try {
      localStorage.removeItem(photoKey);
      setPhoto(null);
      setMessage('Profile photo removed.');
    } catch {
      setMessage('Could not remove the profile photo.');
    }
  }

  return (
    <div className="profile-photo">
      <div className="profile-photo-preview">
        {photo ? <img src={photo} alt="Your profile photo" /> : <UserRound aria-hidden="true" />}
      </div>
      <div>
        <label>Profile photo<input type="file" accept="image/*" onChange={upload} disabled={busy} /></label>
        {photo && <button className="text-btn" type="button" disabled={busy} onClick={remove}>Remove photo</button>}
        <p role="status">{busy ? 'Saving photo…' : message}</p>
      </div>
    </div>
  );
}
