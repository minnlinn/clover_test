import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Check, ChevronRight, Clock, Edit3, Lock, Plus, Share2, Trash2, Users, Volume2,
} from 'lucide-react';
import CloverWordmark from '../components/CloverWordmark';
import InkDrawing from '../components/InkDrawing';
import ProfilePhoto from '../components/ProfilePhoto';
import { resizePhoto } from '../data/photo';
import LeafGroup, { MemberLeaf } from '../components/LeafGroup';
import { getMomentKind } from '../data/journal';
import { groups } from '../data/mockData';
import { leafColour, leafPalette } from '../data/leafColours';
const Card=({children,className='',id})=><section className={'card '+className} id={id}>{children}</section>; const fmt=d=>new Date(d+'T12:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
export function Welcome() {
  const { state } = useLocation();

  return (
    <main className="welcome route-stage">
      <div className="welcome-copy">
        <h1 className="welcome-wordmark">
          <CloverWordmark />
        </h1>
        <p className="tagline">Every Leaf Has a Story.</p>
        <small>Clover is a demo. Your entries are saved in this browser.</small>
        <nav className="welcome-actions" aria-label="Account">
          <Link className="welcome-login" to="/auth" state={state}>Log in</Link>
          <Link className="primary" to="/auth?mode=signup" state={state}>Sign up</Link>
        </nav>
      </div>
    </main>
  );
}

export function Auth({ onEnter }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const signingUp = searchParams.get('mode') === 'signup';
  const returnPath = typeof state?.from === 'string' && /^\/(?![/\\])/.test(state.from) ? state.from : '/';

  function enterClover(event) {
    event.preventDefault();
    onEnter();
    navigate(signingUp ? '/setup' : returnPath, { replace: true });
  }

  return (
    <main className="auth-page auth-entry route-stage">
      <Link className="brand" aria-label="Clover home" to="/" state={state}>
        <CloverWordmark />
      </Link>
      <form className="card auth-form-card" onSubmit={enterClover} autoComplete="off">
        <div className="auth-intro">
          <h1>Our Space, Our Story</h1>
          <h2>{signingUp ? 'Sign up' : 'Log in'}</h2>
        </div>
        <label>Email<input placeholder="you@example.com" type="email" /></label>
        <label>Password<input placeholder="••••••••" type="password" /></label>
        <button className="primary" type="submit">
          {signingUp ? 'Create account (demo)' : 'Log in (demo)'}
        </button>
        <Link className="text-btn auth-switch" state={state} to={signingUp ? '/auth' : '/auth?mode=signup'}>
          {signingUp ? 'Already have an account? Log in' : 'New here? Create an account'}
        </Link>
        <p className="notice">You can try this demo without entering account details.</p>
      </form>
    </main>
  );
}
function LeafColourPicker({ colour, onSelect }) {
  const selected = leafColour(colour).value;
  return (
    <div className="swatches" role="group" aria-label="Leaf colour">
      {leafPalette.map(option => (
        <button type="button" key={option.value} aria-label={option.label} title={option.label}
          aria-pressed={selected === option.value}
          className={selected === option.value ? 'selected' : ''}
          style={{ background: option.value }}
          onClick={() => onSelect(option.value)}
        />
      ))}
    </div>
  );
}

export function ProfileSetup({ profile, setProfile }) {
  const navigate = useNavigate();
  return (
    <div className="auth-page route-stage">
      <Card>
        <p className="eyebrow">YOUR PERSONAL LEAF</p>
        <h1>Make it yours</h1>
        <label>Your name<input value={profile.name} onChange={event => setProfile({ ...profile, name: event.target.value })} /></label>
        <p>Choose a colour for your leaf</p>
        <LeafColourPicker colour={profile.color} onSelect={color => setProfile({ ...profile, color })} />
        <div className="profile-preview">
          <MemberLeaf name={profile.name} color={profile.color} showInitial={false} className="profile-leaf" />
          {profile.name || 'Your name'}
        </div>
        <button type="button" className="primary" onClick={() => navigate('/')}>Enter Clover</button>
      </Card>
    </div>
  );
}
const quickActions = [
  { kind: 'photo', label: 'Photo', to: '/capture' },
  { kind: 'voice', label: 'Voice note', to: '/capture' },
  { kind: 'write', label: 'Write', to: '/diary' },
];

export function Home({ entries, appointments, profile }) {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="home-spread">
      <section className="greeting">
        <div className="greeting-copy">
          <p className="eyebrow">{today}</p>
          <h1>Hello, {profile.name}</h1>
          <p>What would you like to remember today?</p>
        </div>
        <div className="greeting-art">
          <InkDrawing name="stillLife" />
        </div>
      </section>

      <div className="home-actions">
        <div className="quick-row">
          {quickActions.map(({ kind, label, to }) => (
            <Link className={`quick-action quick-action--${kind}`} key={kind} to={to}>
              <InkDrawing name={kind === 'write' ? 'text' : kind} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
        <Link className="highlights-teaser" to="/highlights">
          <InkDrawing name="letter" />
          <span><strong>This week’s highlights</strong><small>See what your family shared.</small></span>
          <ChevronRight size={20} aria-hidden="true" />
        </Link>
      </div>

      <section className="home-clovers" aria-labelledby="home-clovers-title">
        <h2 id="home-clovers-title">Your Clovers</h2>
        <div className="group-scroll">
          {groups.map(group => (
            <Card key={group.id} className="group-card">
              <LeafGroup members={group.members} interactive />
              <h3>{group.name}</h3>
              <p>{group.subtitle}</p>
              <button className="text-btn" onClick={() => navigate('/groups')}>Open shared diary</button>
            </Card>
          ))}
        </div>
      </section>

      <section className="home-moments" aria-labelledby="home-moments-title">
        <div className="section-title">
          <h2 id="home-moments-title">Recent moments</h2>
          <button onClick={() => navigate('/diary')}>View all</button>
        </div>
        <div className="moment-grid">
          {entries.slice(0, 3).map(entry => (
            <Card key={entry.id} className="moment">
              <InkDrawing name={getMomentKind(entry)} className="entry-illustration" />
              <small>{fmt(entry.date)}</small>
              <h3>{entry.title}</h3>
              <p>{entry.caption}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="home-schedule" aria-labelledby="home-schedule-title">
        <div className="section-title">
          <h2 id="home-schedule-title">Coming up</h2>
          <button onClick={() => navigate('/calendar')}>Calendar</button>
        </div>
        {appointments.slice(0, 2).map(appointment => (
          <Card key={appointment.id} className="appointment">
            <Clock />
            <div>
              <b>{appointment.title}</b>
              {appointment.forName && <p>For {appointment.forName}</p>}
              <p>{fmt(appointment.date)} · {appointment.time}</p>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
export function Diary({entries,setEntries}){const [filter,setFilter]=useState('all'),[editing,setEditing]=useState(null);const shown=entries.filter(e=>filter==='all'||e.visibility===filter);function del(id){if(confirm('Delete this diary entry?'))setEntries(entries.filter(e=>e.id!==id))}return <><div className="page-head"><div><p className="eyebrow">YOUR MEMORIES</p><h1>Diary</h1></div><button className="icon-btn" onClick={()=>setEditing({title:'',caption:'',visibility:'private',date:new Date().toISOString().slice(0,10),emoji:'📝'})}><Plus/></button></div><div className="filters">{[['all','All'],['private','Private'],['shared','Shared']].map(([v,l])=><button className={filter===v?'active':''} onClick={()=>setFilter(v)} key={v}>{l}</button>)}</div>{editing&&<EntryForm entry={editing} onCancel={()=>setEditing(null)} onSave={x=>{setEntries(editing.id?entries.map(e=>e.id===x.id?x:e):[{...x,id:Date.now(),type:'text'},...entries]);setEditing(null)}}/>}<div className="timeline">{shown.length?shown.map(e=><Card className="diary-entry" key={e.id}><InkDrawing name={getMomentKind(e)} className="entry-illustration" /><div className="entry-content"><small>{fmt(e.date)} · {e.visibility==='shared'?<><Share2 size={12}/> Shared</>:<><Lock size={12}/> Private</>}</small><h3>{e.title}</h3><p>{e.caption}</p>{e.image&&<img src={e.image} alt="Diary upload"/>}{e.audio&&<audio controls src={e.audio}/>}</div><div className="entry-actions"><button onClick={()=>setEditing(e)}><Edit3 size={16}/></button><button onClick={()=>del(e.id)}><Trash2 size={16}/></button></div></Card>):<Card className="empty"><BookOpen/> <h3>No moments here yet</h3><p>Capture a little part of your day.</p></Card>}</div></>}
function EntryForm({entry,onSave,onCancel}){const [v,setV]=useState(entry);return <Card className="form-card"><h2>{entry.id?'Edit moment':'New moment'}</h2><label>Title<input value={v.title} onChange={e=>setV({...v,title:e.target.value})}/></label><label>Caption<textarea value={v.caption} onChange={e=>setV({...v,caption:e.target.value})}/></label><label>Date<input type="date" value={v.date} onChange={e=>setV({...v,date:e.target.value})}/></label><div className="filters"><button className={v.visibility==='private'?'active':''} onClick={()=>setV({...v,visibility:'private'})}><Lock size={14}/> Private</button><button className={v.visibility==='shared'?'active':''} onClick={()=>setV({...v,visibility:'shared'})}><Share2 size={14}/> Shared</button></div><div className="form-actions"><button onClick={onCancel}>Cancel</button><button className="primary" disabled={!v.title.trim()} onClick={()=>onSave(v)}>Save moment</button></div></Card>}
export function Groups(){const [creating,setCreating]=useState(false),[name,setName]=useState('');return <><div className="page-head"><div><p className="eyebrow">TOGETHER</p><h1>Shared Clovers</h1></div><button className="icon-btn" onClick={()=>setCreating(!creating)}><Plus/></button></div>{creating&&<Card className="form-card"><h2>Create a Clover</h2><label>Group name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Sunday brunch club"/></label><label>Invite someone<input placeholder="Their email address (demo only)"/></label><button className="primary" onClick={()=>{alert(name?`${name} is ready to personalise (demo).`:'Give your Clover a name first.');setCreating(false)}}>Create group</button></Card>}<p className="soft-copy">The leaves in every Clover tell you who shares its memories.</p><div className="spread-two shared-groups">{groups.map(g=><Card key={g.id} className="shared-card"><LeafGroup members={g.members} interactive/><div><h2>{g.name}</h2><p>{g.members.map(m=>m.name).join(' · ')}</p><button className="primary small">Open shared diary</button></div></Card>)}</div><Card className="notice"><Users/><div><b>Invitees are mock only</b><p>Real invitations and access controls will come with the backend.</p></div></Card></>}
export function Capture({entries,setEntries}){const [image,setImage]=useState(null),[audio,setAudio]=useState(null),[caption,setCaption]=useState('');const [recording,setRecording]=useState(false);const rec=useRef();const [photoBusy,setPhotoBusy]=useState(false);const [photoError,setPhotoError]=useState('');async function addPhoto(event){const file=event.target.files[0];event.target.value='';if(!file)return;setPhotoBusy(true);setPhotoError('');try{setImage(await resizePhoto(file,960))}catch{setPhotoError('Could not open this photo. Try a JPEG or PNG.')}finally{setPhotoBusy(false)}}async function toggle(){if(recording){rec.current.stop();setRecording(false);return}try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});let chunks=[];const r=new MediaRecorder(stream);r.ondataavailable=e=>chunks.push(e.data);r.onstop=()=>{setAudio(URL.createObjectURL(new Blob(chunks,{type:'audio/webm'})));stream.getTracks().forEach(t=>t.stop())};r.start();rec.current=r;setRecording(true)}catch{alert('Microphone permission was unavailable. You can still add a photo or written moment.')}}function save(){if(!image&&!audio&&!caption.trim())return alert('Add a photo, voice note, or caption first.');const updated=[{id:Date.now(),date:new Date().toISOString().slice(0,10),title:caption.slice(0,36)||'A captured moment',caption,visibility:'private',type:image?'photo':audio?'voice':'text',emoji:image?'📷':audio?'🎙️':'📝',image,audio},...entries];try{localStorage.setItem('clover-entries',JSON.stringify(updated))}catch{setPhotoError('Browser storage is full or unavailable. This moment was not saved.');return}setEntries(updated);setImage(null);setPhotoError('');setAudio(null);setCaption('');alert('Saved in this browser only — no cloud sync yet.')}return <><div className="page-head"><div><p className="eyebrow">A LITTLE MOMENT</p><h1>Capture</h1></div></div><Card className="capture"><div className="spread-two capture-spread"><div><div className="capture-options"><label className="capture-option"><input type="file" accept="image/*" onChange={addPhoto} disabled={photoBusy}/><InkDrawing name="photo" /><b>Add photo</b><small>Choose from device</small></label><button className={'capture-option '+(recording?'recording':'')} onClick={toggle}><InkDrawing name="voice" /><b>{recording?'Stop recording':'Voice note'}</b><small>{recording?'Listening…':'Use your microphone'}</small></button></div>{image&&<img className="upload-preview" src={image} alt="Selected upload preview"/>}{audio&&<audio controls src={audio}/>}</div><div className="capture-editor"><label>Caption<textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="What made this moment special?"/></label><p role="status">{photoBusy ? 'Preparing photo…' : photoError}</p><div className="form-actions"><span className="notice-inline">Saved locally only</span><button className="primary" onClick={save} disabled={photoBusy}>Save moment</button></div></div></div></Card></>}
export function AIPreview({entries,setEntries,appointments,setAppointments}){const [state,setState]=useState({diary:false,appointment:false});const accept=t=>{if(t==='diary')setEntries([{id:Date.now(),date:'2026-12-15',title:'Clinic visit',caption:'Visited the clinic today. Next appointment is at 10 AM.',visibility:'private',type:'text',emoji:'🩺'},...entries]);else setAppointments([...appointments,{id:Date.now(),title:'Clinic follow-up',date:'2026-12-15',time:'10:00',with:'Community clinic',reminder:'1 day before'}]);setState({...state,[t]:true})};return <><div className="page-head"><div><p className="eyebrow">FUTURE FEATURE</p><h1>Moments to actions</h1></div><InkDrawing name="clover" className="entry-illustration" /></div><div className="spread-two ai-spread"><Card className="quote"><Volume2/><p>“I visited the clinic today. My next appointment is on 15 December at 10 AM.”</p><small>Example recording — no real AI interpretation is taking place.</small></Card><section className="ai-suggestions"><p className="soft-copy">Here’s how Clover may help organise a captured moment.</p><Suggestion drawing="text" title="Diary entry" text="Clinic visit · 15 December" accepted={state.diary} onAccept={()=>accept('diary')} onReject={()=>setState({...state,diary:'rejected'})}/><Suggestion drawing="candle" title="Appointment reminder" text="15 December · 10:00 AM · Community clinic" accepted={state.appointment} onAccept={()=>accept('appointment')} onReject={()=>setState({...state,appointment:'rejected'})}/></section></div></>}
function Suggestion({drawing,title,text,accepted,onAccept,onReject}){return <Card className="suggestion"><InkDrawing name={drawing} /><div><small>DEMONSTRATION SUGGESTION</small><h3>{title}</h3><p>{text}</p>{accepted===true?<p className="accepted"><Check/> Added to your local demo</p>:accepted==='rejected'?<p>Dismissed</p>:<div className="form-actions"><button onClick={onReject}>Reject</button><button className="primary small" onClick={onAccept}>Accept</button></div>}</div></Card>}
export function Settings({ profile, setProfile, largeText, setLargeText }) {
  return (
    <>
      <div className="page-head"><div><p className="eyebrow">YOUR CLOVER</p><h1>Settings</h1></div></div>
      <div className="spread-two settings-spread">
        <Card>
          <h2>Profile</h2>
          <ProfilePhoto />
          <label>Name<input value={profile.name} onChange={event => setProfile({ ...profile, name: event.target.value })} /></label>
          <p>Leaf colour</p>
          <LeafColourPicker colour={profile.color} onSelect={color => setProfile({ ...profile, color })} />
        </Card>
        <Card>
          <h2>Privacy</h2>
          <div className="setting-row"><div><b>Default diary visibility</b><p>New entries are private by default.</p></div><Lock /></div>
          <div className="setting-row"><div><b>Shared group access</b><p>Manage this after backend setup.</p></div><Users /></div>
        </Card>
        <Card id="care-preferences">
          <h2>Care preferences</h2>
          <label>Care Circle view
            <select value={profile.careView === 'family' ? 'family' : 'simple'}
              onChange={event => {
                const careView = event.target.value;
                setProfile(current => ({ ...current, careView }));
              }}>
              <option value="simple">Simple view</option>
              <option value="family">Family view</option>
            </select>
          </label>
          <p>Family view adds shared moments and appointments to Care Circle.</p>
        </Card>
        <Card id="accessibility">
          <h2>Accessibility</h2>
          <div className="setting-row">
            <div><b>Larger reading text</b><p>Increase text size across Clover.</p></div>
            <button type="button" className={largeText ? 'toggle on' : 'toggle'} aria-label="Larger reading text"
              aria-pressed={largeText} onClick={() => setLargeText(current => !current)}
            ><i /></button>
          </div>
        </Card>
        <Card>
          <h2>Account</h2>
          <button type="button" className="text-btn">Export demo data</button>
          <p className="notice">Account, sync and deletion actions need the future secure backend.</p>
        </Card>
      </div>
    </>
  );
}
