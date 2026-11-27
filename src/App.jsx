import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import CloverWordmark from './components/CloverWordmark';
import Shell from './components/Shell';
import meadowWallpaper from './assets/clover-meadow.jpg';
import { initialEntries, initialAppointments } from './data/mockData';
import { loadCircle, saveCircle, uniquePeople } from './data/circle';
import Calendar from './pages/Calendar';
import CareCircle from './pages/CareCircle';
import CareGames from './pages/CareGames';
import Highlights from './pages/Highlights';
import { AIPreview, Auth, Capture, Diary, Groups, Home, ProfileSetup, Settings, Welcome } from './pages/Pages';

const demoSessionKey = 'clover-demo-session';

export default function App() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const previousPath = useRef(pathname);
  const [arrival, setArrival] = useState(0);
  const [signedIn, setSignedIn] = useState(() => sessionStorage.getItem(demoSessionKey) === 'active');
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('clover-entries')) || initialEntries);
  const [appointments, setAppointments] = useState(() => JSON.parse(localStorage.getItem('clover-appts')) || initialAppointments);
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem('clover-profile')) || { name: 'Mia', color: '#f49ab5' });
  const [largeText, setLargeText] = useState(() => localStorage.getItem('clover-large-text') === 'true');
  const [circles, setCircles] = useState(loadCircle);
  const circleMembers = uniquePeople(circles.flatMap(circle => circle.members));

  useEffect(() => localStorage.setItem('clover-entries', JSON.stringify(entries)), [entries]);
  useEffect(() => localStorage.setItem('clover-appts', JSON.stringify(appointments)), [appointments]);
  useEffect(() => localStorage.setItem('clover-profile', JSON.stringify(profile)), [profile]);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('large-text', largeText);
    localStorage.setItem('clover-large-text', String(largeText));
    return () => document.documentElement.classList.remove('large-text');
  }, [largeText]);

  useLayoutEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
    } else if (previousPath.current !== pathname && navigationType !== 'POP') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    previousPath.current = pathname;
  }, [hash, navigationType, pathname]);

  function enterDemo() {
    sessionStorage.setItem(demoSessionKey, 'active');
    setSignedIn(true);
    setArrival(current => current + 1);
  }

  function leaveDemo() {
    sessionStorage.removeItem(demoSessionKey);
    setSignedIn(false);
    navigate('/', { replace: true });
  }

  function updateCircle(next) {
    saveCircle(next);
    setCircles(next);
  }

  const pageData = { entries, setEntries, appointments, setAppointments, profile, setProfile };
  const theme = pathname.split('/')[1] || (signedIn ? 'home' : 'welcome');
  const landing = pathname === '/'
    ? <Welcome />
    : <Navigate to="/" replace state={{ from: pathname + search + hash }} />;

  return (
    <div className="clover-site" data-theme={theme}>
      <div className="clover-wallpaper" aria-hidden="true">
        <img src={meadowWallpaper} alt="" fetchPriority="high" />
      </div>
      <div className="clover-content">
      <Routes>
        <Route path="/welcome" element={<Navigate to="/" replace />} />
        <Route path="/auth" element={signedIn ? <Navigate to="/" replace /> : <Auth onEnter={enterDemo} />} />
        <Route path="/setup" element={signedIn ? <ProfileSetup {...pageData} /> : <Navigate to="/" replace />} />
        <Route path="*" element={signedIn ? (
          <Shell onLogout={leaveDemo}>
            <Routes>
              <Route path="/" element={<Home {...pageData} />} />
              <Route path="/diary" element={<Diary {...pageData} />} />
              <Route path="/highlights" element={<Highlights entries={entries} />} />
              <Route path="/groups" element={<Groups {...pageData} />} />
              <Route path="/capture" element={<Capture {...pageData} />} />
              <Route path="/calendar" element={<Calendar appointments={appointments} setAppointments={setAppointments} profile={profile} circleMembers={circleMembers} />} />
              <Route path="/care" element={<CareCircle entries={entries} appointments={appointments} profile={profile} circles={circles} circleMembers={circleMembers} onSaveCircle={updateCircle} />} />
              <Route path="/care/games" element={<CareGames profile={profile} />} />
              <Route path="/ai-preview" element={<AIPreview {...pageData} />} />
              <Route path="/settings" element={<Settings profile={profile} setProfile={setProfile} largeText={largeText} setLargeText={setLargeText} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Shell>
        ) : landing} />
      </Routes>
      </div>
      <div className="clover-arrival" key={arrival} aria-hidden="true">
        <CloverWordmark className="arrival-wordmark" />
      </div>
    </div>
  );
}
