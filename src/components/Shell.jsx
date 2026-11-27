import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Accessibility, BookOpen, CalendarDays, Camera, ChevronDown, HeartHandshake,
  House, Images, LogOut, Settings, Sparkles, UserRound,
} from 'lucide-react';
import CloverWordmark from './CloverWordmark';
import tearyClover from '../assets/clover-teary.svg';

const links = [
  ['/', House, 'Home'],
  ['/diary', BookOpen, 'Diary'],
  ['/highlights', Images, 'Highlights'],
  ['/calendar', CalendarDays, 'Calendar'],
  ['/care', HeartHandshake, 'Care'],
  ['/ai-preview', Sparkles, 'AI preview'],
  ['/settings', Settings, 'Settings'],
  ['/capture', Camera, 'Capture'],
];

const accountLinks = [
  ['/settings', UserRound, 'Your Account'],
  ['/settings#care-preferences', HeartHandshake, 'Care preferences'],
  ['/settings#accessibility', Accessibility, 'Accessibility'],
];

export default function Shell({ children, onLogout }) {
  const { pathname, hash } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const account = useRef(null);
  const trigger = useRef(null);
  const logoutDialog = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOutside(event) {
      if (!account.current?.contains(event.target)) setMenuOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        trigger.current?.focus();
      }
    }

    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="account-control" ref={account} onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
        }}>
          <button className="brand account-toggle" type="button" ref={trigger}
            aria-label="Clover account options" aria-expanded={menuOpen} aria-controls="clover-account"
            onClick={() => setMenuOpen(current => !current)}>
            <CloverWordmark />
            <ChevronDown className="account-chevron" size={17} aria-hidden="true" />
          </button>
          <div className="account-menu" id="clover-account" hidden={!menuOpen}>
            {accountLinks.map(([to, Icon, label]) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}>
                <Icon size={19} aria-hidden="true" /> {label}
              </Link>
            ))}
            <button type="button" onClick={() => logoutDialog.current.showModal()}><LogOut size={19} aria-hidden="true" /> Log out</button>
          </div>
        </div>
      </header>
      <dialog className="logout-dialog" ref={logoutDialog} aria-labelledby="logout-title" onClose={() => trigger.current?.focus()}>
        <img src={tearyClover} width="76" height="80" alt="" />
        <h2 id="logout-title">Are you sure you want to log out?</h2>
        <form method="dialog" className="logout-actions">
          <button className="game-secondary" value="cancel" autoFocus>Stay signed in</button>
          <button className="primary" type="button" onClick={() => {
            logoutDialog.current.close();
            onLogout();
          }}>Log out</button>
        </form>
      </dialog>
      <nav className="bottom-nav" aria-label="Main navigation">
        {links.map(([to, Icon, label]) => (
          <NavLink key={to} to={to} end={to !== '/care'} className={to === '/highlights' ? 'nav-highlights' : to === '/capture' ? 'nav-capture' : undefined}>
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <main className="route-stage" key={pathname}>{children}</main>
    </div>
  );
}
