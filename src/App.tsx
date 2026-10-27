import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, Award, BellRing, Camera, Cat, Check, ChevronDown, ChevronRight, CircleCheckBig, Clock, Dog, Edit3, Flag, Footprints,
  HeartPulse, Home, LockKeyhole, LogOut, UserRound, Mail, MapPin, MessageCircle, MessagesSquare, PawPrint, Phone, Plus, Settings, ShieldCheck, Syringe, UserPlus, UsersRound, Utensils, Weight,
} from "lucide-react";
import { findPerson, firstName, ME, Notice, photos, UserPage } from "./data";
import { DEMO_MEMBER, StoreProvider, useStore } from "./store";
import { Avatar, Badge, Brand, EmptyState, Modal, PersonAvatar, StarRating } from "./ui";
import SideRail from "./Rail";
import CommunityPage, { PostCard } from "./Community";
import SittersPage from "./Sitters";
import MessagesPage from "./Messages";
import MapPage from "./MapPage";
import { AdminApp, AdminLogin } from "./Admin";

// ---------- Header ----------

const noticeIcons: Record<Notice["icon"], typeof BellRing> = { applicant: UserPlus, verify: ShieldCheck, report: Flag, match: CircleCheckBig, lost: PawPrint, message: MessageCircle };

function NotificationsMenu() {
  const { notices, markNoticesRead, setPage } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notices.filter((n) => !n.read).length;
  const close = () => { setOpen(false); markNoticesRead(); };
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) close(); };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);
  return (
    <div className="notifications-wrap" ref={ref}>
      <button className={open ? "notification-button active" : "notification-button"} onClick={() => (open ? close() : setOpen(true))} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} aria-expanded={open} title="Notifications"><BellRing size={19} />{unread > 0 && <span>{unread}</span>}</button>
      {open && <div className="notifications-panel">
        <div className="notifications-head"><strong>Notifications</strong>{unread > 0 && <button onClick={markNoticesRead}>Mark all as read</button>}</div>
        {notices.length ? notices.map((n) => { const Icon = noticeIcons[n.icon]; return <button key={n.id} className={n.read ? "notice" : "notice unread"} onClick={() => { close(); if (n.page) setPage(n.page); }}><span className={`notice-icon ${n.icon}`}><Icon size={15} /></span><span><p>{n.text}</p><small>{n.time}</small></span></button>; })
          : <p className="muted notifications-empty">You’re all caught up.</p>}
      </div>}
    </div>
  );
}

function AccountMenu() {
  const { page, setPage, logout } = useStore();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("mousedown", onClick); window.removeEventListener("keydown", onKey); };
  }, [open]);
  const go = (next: UserPage) => { setOpen(false); setPage(next); };
  return (
    <div className="account-wrap" ref={ref}>
      <button className={open || page === "profile" ? "profile-button active" : "profile-button"} onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open}>
        <PersonAvatar name={ME} size="sm" /><span className="profile-name">{firstName(ME)}</span><ChevronDown size={16} className="profile-caret" />
      </button>
      {open && <div className="account-menu" role="menu">
        <div className="account-menu-head"><PersonAvatar name={ME} /><div><strong>{ME}</strong><small>{DEMO_MEMBER.email}</small></div></div>
        <button role="menuitem" onClick={() => go("profile")}><UserRound size={17} /> View profile</button>
        <button role="menuitem" onClick={() => go("pets")}><PawPrint size={17} /> My pets</button>
        <button role="menuitem" onClick={() => { setOpen(false); setSettingsOpen(true); }}><Settings size={17} /> Account settings</button>
        <hr />
        <button role="menuitem" className="danger" onClick={() => { setOpen(false); logout(); }}><LogOut size={17} /> Log out</button>
      </div>}
      {settingsOpen && <AccountSettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

/** Top bar: logo on phones; messages, notifications and the account menu on every screen size. */
function UserHeader() {
  const { page, setPage, authenticated, setMode, conversations } = useStore();
  const unreadMessages = conversations.filter((c) => !c.archived).reduce((sum, c) => sum + c.unread, 0);
  return (
    <header className="user-header">
      <div className="user-header-inner">
        <button className="logo-button" onClick={() => setPage("home")} aria-label="Avancado home"><Brand /></button>
        <div className="header-actions">
          {authenticated ? <>
            <button className={page === "messages" ? "notification-button active" : "notification-button"} onClick={() => setPage("messages")} aria-label={`Messages${unreadMessages ? `, ${unreadMessages} unread` : ""}`} title="Messages"><MessageCircle size={19} />{unreadMessages > 0 && <span>{unreadMessages}</span>}</button>
            <NotificationsMenu />
            <AccountMenu />
          </> : <div className="guest-actions"><button className="header-login" onClick={() => setMode("userLogin")}>Log in</button><button className="primary-button header-signup" onClick={() => setMode("signup")}>Sign up</button></div>}
        </div>
      </div>
    </header>
  );
}

/** Sidebar (desktop): the places you can go. Account actions live in the top bar. */
function SideNav() {
  const { page, setPage, setMode } = useStore();
  const items: { id: UserPage; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "community", label: "Community", icon: UsersRound },
    { id: "sitters", label: "Sitter board", icon: Dog },
    { id: "map", label: "Pet-friendly map", icon: MapPin },
    { id: "pets", label: "My pets", icon: PawPrint },
  ];
  return (
    <aside className="side-nav">
      <button className="logo-button" onClick={() => setPage("home")} aria-label="Avancado home"><Brand /></button>
      <nav>
        {items.map((item) => { const Icon = item.icon; return <button key={item.id} className={page === item.id ? "side-link active" : "side-link"} onClick={() => setPage(item.id)} title={item.label} aria-label={item.label}><span className="side-icon"><Icon size={21} /></span><span>{item.label}</span></button>; })}
      </nav>
      <div className="side-nav-bottom">
        <div className="side-legal"><button onClick={() => setPage("terms")}>Terms</button><button onClick={() => setPage("safety")}>Safety</button><button onClick={() => setPage("privacy")}>Privacy</button><button onClick={() => setMode("adminLogin")}>Admin</button></div>
      </div>
    </aside>
  );
}

// ---------- Home ----------

function HomePage() {
  const { setPage, setMode, authenticated, posts, requests, places, hiddenNames, pawed } = useStore();
  const visiblePosts = posts.filter((p) => !p.hidden && !hiddenNames.includes(p.author));
  const open = requests.filter((r) => r.status === "Open" && !r.hidden);
  const spots = places.filter((p) => !p.hidden).slice(0, 6);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const petName = (pet: string) => pet.split(",")[0] || firstName(ME);
  return (
    <div className="page-section page-with-rail">
      <div className="home-feed">
        <section className="home-welcome">
          {authenticated
            ? <><h1>{greeting}, {firstName(ME)}</h1><p>Here’s what’s happening with pets around your neighbourhood.</p></>
            : <><h1>Happy pets, better neighbourhoods.</h1><p>Find trusted local sitters, share everyday moments, and help bring lost pets home.</p><div className="welcome-actions"><button className="primary-button" onClick={() => setMode("signup")}>Join Avancado</button><button className="secondary-button" onClick={() => setPage("community")}>Browse the community</button></div></>}
        </section>

        <div className="stories-row" aria-label="Recent stories">
          {visiblePosts.map((p) => (
            <button key={p.id} className={p.status === "lost" ? "story lost" : "story"} onClick={() => setPage("community")}>
              <span className="story-ring"><img loading="lazy" src={p.image} alt="" /></span>
              <span className="story-name">{p.status === "lost" ? `Lost: ${petName(p.pet)}` : firstName(p.author)}</span>
            </button>
          ))}
        </div>

        <section className="home-block">
          <header className="block-head"><h2>Pets needing a sitter</h2><button onClick={() => setPage("sitters")}>See all</button></header>
          <div className="h-scroll">{open.map((r) => (
            <button key={r.id} className="mini-request" onClick={() => setPage("sitters", { requestId: r.id })}>
              <span className="mini-photo"><img loading="lazy" src={r.image} alt="" /><em>{r.date}</em></span>
              <strong>{r.pet} <small>· {r.breed}</small></strong>
              <span>{r.title}</span>
              <span className="mini-meta"><MapPin size={13} /> {r.area} · {r.time.split("–")[0].trim()}</span>
            </button>
          ))}</div>
        </section>

        <section className="home-block">
          <header className="block-head"><h2>From the community</h2><button onClick={() => setPage("community")}>See all</button></header>
          <div className="explore-grid">{visiblePosts.slice(0, 6).map((p) => (
            <button key={p.id} onClick={() => setPage("community")} aria-label={p.caption}>
              <img loading="lazy" src={p.image} alt="" />
              {p.status === "lost" && <em>Lost pet</em>}
              <span><PawPrint size={14} /> {p.likes + (pawed.includes(p.id) ? 1 : 0)}</span>
            </button>
          ))}</div>
        </section>

        <section className="home-block">
          <header className="block-head"><h2>Places to go</h2><button onClick={() => setPage("map")}>Open map</button></header>
          <div className="h-scroll">{spots.map((spot) => (
            <button key={spot.id} className="mini-place" onClick={() => setPage("map", { placeId: spot.id })}>
              <img loading="lazy" src={spot.image} alt="" />
              <strong>{spot.name}</strong>
              <span>{spot.category}</span>
            </button>
          ))}</div>
        </section>
      </div>
      <SideRail />
    </div>
  );
}

// ---------- Profiles ----------

const sampleReviews = [
  { author: "Emily Carter", rating: 5, date: "May 2026", text: "Thoughtful, punctual, and sent the best updates. Charlie was completely relaxed when we got home." },
  { author: "Noah Williams", rating: 5, date: "April 2026", text: "Milo had a wonderful afternoon. Understood his energy and kept his routine perfectly." },
  { author: "Sophia Lee", rating: 4, date: "March 2026", text: "Reliable, kind, and very attentive to Coco’s care instructions." },
];

function ExperiencePanels({ name, editable, onEdit }: { name: string; editable?: boolean; onEdit?: () => void }) {
  const person = findPerson(name);
  return <>
    <section className="profile-panel"><div className="panel-title"><div><h2>Petsitting experience</h2><p>{editable ? "Credentials shown on your public profile." : "Experience and verified credentials"}</p></div>{editable && <button className="text-button" onClick={onEdit}>Edit</button>}</div>
      <div className="credential-list"><div><span><Award /></span><div><strong>Pet First Aid Certified</strong><small>St. John Ambulance · Expires Aug 2027</small></div><Badge tone="green">Verified</Badge></div><div><span><Dog /></span><div><strong>Dog care</strong><small>Small, medium, and large breeds</small></div></div><div><span><Cat /></span><div><strong>Cat care experience</strong><small>Feeding, medication, and overnight stays</small></div></div></div>
    </section>
    <section className="profile-panel"><div className="panel-title"><div><h2>Reviews</h2><p>{person.reviews ? `${person.rating} average from ${person.reviews} completed sittings` : "No completed sittings yet"}</p></div></div>
      {person.reviews ? <div className="all-reviews">{sampleReviews.filter((r) => r.author !== name).map((r) => <div className="review-card" key={r.author}><div><Avatar name={r.author} size="sm" src={findPerson(r.author).avatar} /><span><strong>{r.author}</strong><small><StarRating value={r.rating} size={11} /> {r.date}</small></span></div><p>“{r.text}”</p></div>)}</div> : <p className="muted">Reviews appear after the first completed sitting.</p>}
    </section>
  </>;
}

function PublicProfilePage() {
  const { profileName, profileReturn, setPage, posts, hiddenNames, isVerified } = useStore();
  const [tab, setTab] = useState<"community" | "experience">("community");
  const person = findPerson(profileName);
  const verified = isVerified(profileName);
  const theirPosts = posts.filter((p) => p.author === profileName && !p.hidden);
  const hidden = hiddenNames.includes(profileName);
  return <section className="page-section public-profile-page">
    <button className="back-link" onClick={() => setPage(profileReturn)}><ArrowLeft size={17} /> Back</button>
    {hidden ? <EmptyState icon={<UsersRound size={24} />} title="Profile unavailable" text="This member’s profile is not visible right now." /> :
    <div className="profile-layout">
      <aside className="profile-summary-card">
        <div className="profile-avatar-wrap"><PersonAvatar name={profileName} size="lg" large /></div>
        <h1>{profileName}</h1><p>Avancado member since {person.since}</p><span><MapPin size={15} /> {person.location}</span>
        {verified ? <Badge tone="green"><ShieldCheck size={13} /> Identity verified</Badge> : <Badge tone="slate">Not verified</Badge>}
        <div className="public-profile-quick-stats"><div><strong>{person.sits}</strong><span>Completed sits</span></div><div><strong>{person.rating || "–"}</strong><span>Sitter rating</span></div></div>
      </aside>
      <div className="profile-content">
        <div className="profile-content-tabs"><button className={tab === "community" ? "active" : ""} onClick={() => setTab("community")}><UsersRound size={16} /> Community</button><button className={tab === "experience" ? "active" : ""} onClick={() => setTab("experience")}><Award size={16} /> Sitting experience</button></div>
        {tab === "community" ? <>
          <section className="profile-panel"><div className="panel-title"><div><h2>About {firstName(profileName)}</h2><p>Public profile introduction</p></div></div><p className="profile-bio">{person.bio}</p><div className="profile-stat-grid"><div><strong>{theirPosts.length}</strong><span>Community posts</span></div><div><strong>{theirPosts.reduce((s, p) => s + p.likes, 0)}</strong><span>Post reactions</span></div><div><strong>{person.sits}</strong><span>Completed sits</span></div><div><strong>{person.rating || "–"}</strong><span>Sitter rating</span></div></div></section>
          <section className="profile-panel"><div className="panel-title"><div><h2>Community posts</h2><p>Everything {firstName(profileName)} has shared publicly.</p></div></div>{theirPosts.length ? <div className="profile-community-feed">{theirPosts.map((post) => <PostCard key={post.id} post={post} />)}</div> : <p className="muted">No public posts yet.</p>}</section>
        </> : <ExperiencePanels name={profileName} />}
      </div>
    </div>}
  </section>;
}

function AccountSettingsModal({ onClose }: { onClose: () => void }) {
  const { notify } = useStore();
  const [tab, setTab] = useState<"password" | "notifications" | "privacy">("password");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [prefs, setPrefs] = useState({ applicants: true, messages: true, lost: true, email: false, publicProfile: true, showLocation: true });
  const toggle = (key: keyof typeof prefs) => setPrefs({ ...prefs, [key]: !prefs[key] });
  const savePassword = () => {
    if (!pw.current) return setError("Enter your current password.");
    if (pw.next.length < 8) return setError("New password must be at least 8 characters.");
    if (pw.next !== pw.confirm) return setError("New passwords do not match.");
    notify("Password updated."); onClose();
  };
  const Toggle = ({ k, label, hint }: { k: keyof typeof prefs; label: string; hint: string }) => <label className="toggle-row"><span><strong>{label}</strong><small>{hint}</small></span><input type="checkbox" checked={prefs[k]} onChange={() => toggle(k)} /><i></i></label>;
  return <Modal onClose={onClose} wide>
    <span className="eyebrow">Account settings</span><h2>Settings</h2>
    <div className="settings-tabs">{(["password", "notifications", "privacy"] as const).map((t) => <button key={t} className={tab === t ? "active" : ""} onClick={() => { setTab(t); setError(""); }}>{t === "password" ? <><LockKeyhole size={15} /> Password</> : t === "notifications" ? <><BellRing size={15} /> Notifications</> : <><ShieldCheck size={15} /> Privacy</>}</button>)}</div>
    {tab === "password" && <div className="form-grid"><label className="full-field">Current password<input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></label><label>New password<input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} placeholder="At least 8 characters" /></label><label>Confirm new password<input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></label></div>}
    {tab === "notifications" && <div className="toggle-list"><Toggle k="applicants" label="Sitter applicants & matches" hint="When someone applies or picks you" /><Toggle k="messages" label="New messages" hint="Conversations with sitters and owners" /><Toggle k="lost" label="Lost pet alerts nearby" hint="Alerts posted in your neighbourhood" /><Toggle k="email" label="Email summaries" hint="A weekly digest to your inbox" /></div>}
    {tab === "privacy" && <div className="toggle-list"><Toggle k="publicProfile" label="Public profile" hint="Let visitors see your posts and sitting experience" /><Toggle k="showLocation" label="Show neighbourhood" hint="Display your neighbourhood on your profile" /></div>}
    {error && <div className="form-error">{error}</div>}
    <div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={() => (tab === "password" ? savePassword() : (notify("Preferences saved."), onClose()))}>Save</button></div>
  </Modal>;
}

function VerificationModal({ onClose }: { onClose: () => void }) {
  const { setVerification, notify } = useStore();
  const [form, setForm] = useState({ first: "", last: "", dob: "", phone: "", email: "", doc: "BCID" });
  const [file, setFile] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setForm({ ...form, [k]: e.target.value }); setError(""); };
  const submit = () => {
    if (!form.first.trim() || !form.last.trim() || !form.dob) return setError("Enter your legal name and date of birth as shown on your ID.");
    if (!file) return setError("Upload a photo or PDF of your government-issued ID.");
    if (!consent) return setError("Please confirm your details and consent to verification.");
    setVerification(ME, "pending", form.doc);
    notify("Verification submitted and waiting for admin approval.");
    onClose();
  };
  const step = !form.first || !form.last || !form.dob ? 1 : !file ? 2 : 3;
  return <Modal onClose={onClose} wide>
    <span className="eyebrow">Identity verification</span><h2>Verify your identity</h2>
    <p className="modal-lead">Optional. Verifying adds a badge to your profile so neighbours know your identity has been checked. Your document is reviewed by an Avancado administrator and is never shown publicly.</p>
    <div className="verification-steps"><span className={step >= 1 ? "active" : ""}>1. Personal details</span><i></i><span className={step >= 2 ? "active" : ""}>2. Identity document</span><i></i><span className={step >= 3 ? "active" : ""}>3. Admin review</span></div>
    <div className="form-grid">
      <label>Legal first name<input value={form.first} onChange={set("first")} placeholder="As shown on your ID" /></label>
      <label>Legal last name<input value={form.last} onChange={set("last")} placeholder="As shown on your ID" /></label>
      <label>Date of birth<input type="date" value={form.dob} onChange={set("dob")} /></label>
      <label>Phone number<input value={form.phone} onChange={set("phone")} placeholder="+1 604 555 0142" /></label>
      <label className="full-field">Email address<input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" /></label>
      <label className="full-field">Government-issued document<select value={form.doc} onChange={set("doc")}><option>BCID</option><option>Passport</option><option>Work permit</option><option>Study permit</option></select></label>
      <label className="full-field">Upload identity document<div className={file ? "identity-upload uploaded" : "identity-upload"}>{file ? <CircleCheckBig size={23} /> : <Camera size={23} />}<strong>{file || "Upload a clear photo"}</strong><span>{file ? "Click to replace" : "BCID, passport, work permit, or study permit · JPG, PNG or PDF"}</span><input type="file" accept="image/*,.pdf" onChange={(e) => { setFile(e.target.files?.[0]?.name || ""); setError(""); }} /></div></label>
    </div>
    <label className="verification-consent"><input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setError(""); }} /> I confirm these details are accurate and consent to identity verification.</label>
    {error && <div className="form-error">{error}</div>}
    <div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={submit}><ShieldCheck size={16} /> Submit for admin review</button></div>
  </Modal>;
}

function ProfilePage() {
  const { verification, posts, notices } = useStore();
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [tab, setTab] = useState<"community" | "experience">("community");
  const verified = verification === "verified";
  const rejected = verification === "unverified" && notices.some((n) => n.icon === "verify" && n.text.includes("not approved"));
  const myPosts = posts.filter((p) => p.author === ME);
  return (
    <section className="page-section">
      <div className="profile-layout">
        <aside className="profile-summary-card"><div className="profile-avatar-wrap"><PersonAvatar name={ME} size="lg" large /><button onClick={() => setEditOpen(true)} aria-label="Change photo"><Camera size={15} /></button></div><h1>{ME}</h1><p>{DEMO_MEMBER.email}</p><span><MapPin size={15} /> Kitsilano, Vancouver</span>{verified ? <Badge tone="green"><ShieldCheck size={13} /> Identity verified</Badge> : verification === "pending" ? <Badge tone="amber"><Clock size={13} /> Approval pending</Badge> : <Badge tone="amber"><ShieldCheck size={13} /> Not verified</Badge>}<button className="primary-button full" onClick={() => setEditOpen(true)}><Edit3 size={16} /> Edit profile</button><button className="secondary-button full" onClick={() => setSettingsOpen(true)}><Settings size={16} /> Account settings</button></aside>
        <div className="profile-content">
          <section className={verified ? "profile-panel verification-panel verified" : verification === "pending" ? "profile-panel verification-panel pending" : "profile-panel verification-panel"}><div className="verification-icon"><ShieldCheck /></div><div><h2>{verified ? "Identity verified" : verification === "pending" ? "Verification under review" : rejected ? "Verification not approved" : "Get a verified badge (optional)"}</h2><p>{verified ? "Your profile shows a verified badge, so neighbours know your identity has been checked." : verification === "pending" ? "Your documents were submitted. You’ll get your verified badge once an Avancado administrator approves them. Everything in the app stays open to you in the meantime." : rejected ? "We couldn’t confirm your document. You can upload a clear, valid ID and try again whenever you like." : "Verification is optional. Everything in Avancado is open to you either way, but a verified badge helps neighbours trust you when you post or offer to sit."}</p></div>{verified ? <Badge tone="green"><Check size={13} /> Verified</Badge> : verification === "pending" ? <Badge tone="amber"><Clock size={13} /> Pending approval</Badge> : <button className="secondary-button" onClick={() => setVerifyOpen(true)}>{rejected ? "Try again" : "Get verified"}</button>}</section>
          <div className="profile-content-tabs"><button className={tab === "community" ? "active" : ""} onClick={() => setTab("community")}><UsersRound size={16} /> Community</button><button className={tab === "experience" ? "active" : ""} onClick={() => setTab("experience")}><Award size={16} /> Sitting experience</button></div>
          {tab === "community" ? <>
            <section className="profile-panel"><div className="panel-title"><div><h2>About me</h2><p>Visible on your public profile.</p></div><button className="text-button" onClick={() => setEditOpen(true)}>Edit</button></div><p className="profile-bio">{findPerson(ME).bio}</p><div className="profile-stat-grid"><div><strong>{myPosts.length}</strong><span>Community posts</span></div><div><strong>{myPosts.reduce((s, p) => s + p.likes, 0)}</strong><span>Post reactions</span></div><div><strong>18</strong><span>Completed sits</span></div><div><strong>4.9</strong><span>Sitter rating</span></div></div></section>
            <section className="profile-panel"><div className="panel-title"><div><h2>My community posts</h2><p>Everything you have shared with the community.</p></div></div>{myPosts.length ? <div className="profile-community-feed">{myPosts.map((post) => <PostCard key={post.id} post={post} />)}</div> : <p className="muted">You haven’t posted yet.</p>}</section>
          </> : <ExperiencePanels name={ME} editable onEdit={() => setEditOpen(true)} />}
        </div>
      </div>
      {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
      {settingsOpen && <AccountSettingsModal onClose={() => setSettingsOpen(false)} />}
      {verifyOpen && <VerificationModal onClose={() => setVerifyOpen(false)} />}
    </section>
  );
}

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { notify } = useStore();
  const [cert, setCert] = useState("");
  return <Modal onClose={onClose}><span className="eyebrow">Edit profile</span><h2>Update your public details</h2><label className="composer-photo-main"><Camera size={27} /><strong>Change profile photo</strong><span>Upload a clear JPG or PNG</span><input type="file" accept="image/*" /></label><div className="form-grid"><label className="full-field">Display name<input defaultValue={ME} /></label><label className="full-field">Petsitting experience<textarea defaultValue="5 years caring for dogs and cats of all sizes." /></label><label className="full-field">Certificate name<input defaultValue="Pet First Aid Certified" /></label><label className="full-field">Upload certificate<div className="identity-upload"><Award size={22} /><strong>{cert || "Add certificate file"}</strong><input type="file" onChange={(e) => setCert(e.target.files?.[0]?.name || "")} /></div></label></div><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={() => { notify("Profile saved."); onClose(); }}>Save changes</button></div></Modal>;
}

// ---------- Member auth ----------

const registered: { email: string; password: string }[] = [DEMO_MEMBER];

function UserAuth() {
  const { mode, setMode, completeLogin } = useStore();
  const signup = mode === "signup";
  const [showPassword, setShowPassword] = useState(false);
  const [stage, setStage] = useState<"form" | "emailSent" | "activated">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const switchMode = () => { setMode(signup ? "userLogin" : "signup"); setError(""); setStage("form"); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (signup) {
      if (registered.some((a) => a.email.toLowerCase() === email.trim().toLowerCase())) return setError("An account with this email already exists. Try logging in instead.");
      if (password.length < 8) return setError("Password must be at least 8 characters.");
      registered.push({ email: email.trim(), password });
      setStage("emailSent");
    } else {
      const ok = registered.some((a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password);
      if (!ok) return setError("The email or password is incorrect. Please try again.");
      completeLogin();
    }
  };
  return <div className="member-auth-page">
    <section className="member-auth-story">
      <button className="back-link light" onClick={() => setMode("user")}><ArrowLeft size={17} /> Back to Avancado</button>
      <div><Brand dark /><span className="admin-kicker">Vancouver’s pet community</span><h1>{signup ? "Join neighbours who care." : "Welcome back to your pack."}</h1><p>{signup ? "Create your profile, add your pets, and find trusted help close to home." : "Pick up your conversations, pet care, and community updates where you left off."}</p><div className="auth-trust-list"><span><ShieldCheck size={18} /> Community-first safety tools</span><span><MessagesSquare size={18} /> Private neighbour messaging</span><span><PawPrint size={18} /> One home for every pet</span></div></div>
      <small>Built for Vancouver pets and their people.</small>
    </section>
    <section className="member-auth-form-wrap">
      {signup && stage !== "form" ? <div className="email-verification-card">
        <span className={stage === "activated" ? "email-status-icon complete" : "email-status-icon"}>{stage === "activated" ? <CircleCheckBig size={30} /> : <Mail size={30} />}</span>
        <span className="eyebrow">{stage === "activated" ? "Account ready" : "Verify your email"}</span>
        <h2>{stage === "activated" ? "Your account is activated" : "Check your inbox"}</h2>
        <p>{stage === "activated" ? "Your email has been verified. Continue to Avancado and set up your profile." : <>We sent a verification link to <strong>{email}</strong>. Open the link to activate your account.</>}</p>
        {stage === "emailSent" ? <><button className="primary-button full" onClick={() => setStage("activated")}>Open demo verification link <ArrowRight size={17} /></button><button className="resend-email" onClick={() => setResent(true)}>{resent ? "Verification email sent again ✓" : "Didn’t receive it? Resend verification email"}</button></> : <button className="primary-button full" onClick={completeLogin}>Continue to Avancado <ArrowRight size={17} /></button>}
      </div> : <form className="member-auth-form" onSubmit={submit}>
        <span className="eyebrow">{signup ? "Create your account" : "Member login"}</span>
        <h2>{signup ? "Let’s get you started" : "Good to see you again"}</h2>
        <p>{signup ? "It only takes a minute to join Avancado." : "Log in to post, react, message, and help with pet care."}</p>
        {signup && <div className="auth-name-grid"><label>First name<input required placeholder="Maya" /></label><label>Last name<input required placeholder="Thompson" /></label></div>}
        <label>Email address<input required type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="you@example.com" /></label>
        <label>Password<div className="password-field"><input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder={signup ? "At least 8 characters" : "Enter your password"} /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></div></label>
        {!signup && <div className="auth-options"><label><input type="checkbox" /> Keep me signed in</label><button type="button" onClick={() => { setResetEmail(email); setResetSent(false); setResetOpen(true); }}>Forgot password?</button></div>}
        {signup && <label className="auth-consent"><input required type="checkbox" /> <span>I agree to the Terms & Conditions and acknowledge the Privacy Policy.</span></label>}
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="primary-button full auth-submit" type="submit">{signup ? "Create account" : "Log in"} <ArrowRight size={17} /></button>
        {!signup && <><button className="demo-button" type="button" onClick={() => { setEmail(DEMO_MEMBER.email); setPassword(DEMO_MEMBER.password); setError(""); }}>Use demo login</button><div className="demo-note"><strong>Demo member</strong><span>{DEMO_MEMBER.email}</span><span>{DEMO_MEMBER.password}</span></div></>}
        <div className="auth-switch"><span>{signup ? "Already have an account?" : "New to Avancado?"}</span><button type="button" onClick={switchMode}>{signup ? "Log in" : "Create an account"}</button></div>
      </form>}
    </section>
    {resetOpen && <Modal onClose={() => setResetOpen(false)}>
      {resetSent ? <div className="center-modal">
        <span className="congrats-icon"><Mail size={28} /></span>
        <h2>Check your inbox</h2>
        <p className="modal-lead">If an account exists for <strong>{resetEmail}</strong>, we’ve sent a link to reset your password. The link expires in 30 minutes.</p>
        <button className="primary-button" onClick={() => setResetOpen(false)}>Back to log in</button>
      </div> : <form onSubmit={(event) => { event.preventDefault(); if (resetEmail.includes("@")) setResetSent(true); }}>
        <span className="eyebrow">Reset password</span>
        <h2>Forgot your password?</h2>
        <p className="modal-lead">Enter the email you use for Avancado and we’ll send you a reset link.</p>
        <label className="composer-text">Email address<input type="email" required value={resetEmail} onChange={(event) => setResetEmail(event.target.value)} placeholder="you@example.com" /></label>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setResetOpen(false)}>Cancel</button><button type="submit" className="primary-button">Send reset link</button></div>
      </form>}
    </Modal>}
  </div>;
}

function MyPetsWorkspace() {
  const [pet, setPet] = useState<"dog" | "cat">("cat");
  const catImage = photos.cat3;
  const current = pet === "dog"
    ? { name: "Sunny", breed: "Golden Retriever", age: "4 years", weight: "29 kg", image: photos.dog1, description: "Playful, friendly, and happiest on long neighbourhood walks. Sunny loves people, gentle dogs, and a good game of fetch." }
    : { name: "Luna", breed: "Domestic Shorthair", age: "3 years", weight: "4.6 kg", image: catImage, description: "Gentle and cuddly once she feels comfortable. Luna is an indoor cat who enjoys quiet company and short play sessions." };
  return <section className="page-section pets-workspace-page">
    <div className="pets-workspace-heading"><span className="eyebrow">Pet care workspace</span><h1>My pets</h1><p>Keep every detail a sitter needs in one place.</p></div>
    <div className="pets-workspace">
      <aside className="pet-workspace-sidebar"><span className="sidebar-label">Your pets</span><div className="pet-actions-row"><div className="workspace-pet-list"><button className={pet === "dog" ? "active" : ""} onClick={() => setPet("dog")}><img loading="lazy" src={photos.dog1} alt="" /><span><strong>Sunny</strong><small>Golden Retriever</small></span><ChevronRight size={20} /></button><button className={pet === "cat" ? "active" : ""} onClick={() => setPet("cat")}><img loading="lazy" src={catImage} alt="" /><span><strong>Luna</strong><small>Domestic Shorthair</small></span><ChevronRight size={20} /></button></div><button className="add-pet-dashed"><Plus size={17} /> Add another pet</button></div></aside>
      <main className="pet-workspace-main">
        <section className="pet-feature-card"><img loading="lazy" src={current.image} alt={current.name} /><div><div className="pet-feature-name"><h2>{current.name}</h2><Badge tone="green">Looking healthy</Badge></div><p>{current.breed} · {current.age} · {current.weight} · Last updated today</p><p className="pet-summary-description">{current.description}</p></div><button className="secondary-button pet-edit-button"><Edit3 size={15} /> Edit profile</button></section>
        <div className="pet-section-heading health-heading"><div><span className="eyebrow">Health report</span><h2>Health & activity</h2></div><button className="secondary-button health-range-button">Last 7 days <ChevronDown size={16} /></button></div>
        <div className="health-dashboard-grid">
          <article className="health-card poop-chart-card"><div className="health-card-title"><span className="health-icon blue"><Activity /></span><div><h3>Poop & pee</h3><p>Daily count · Last 7 days</p></div><button>View log <ChevronRight /></button></div><div className="number-chart">{[["Mon",2,4],["Tue",2,3],["Wed",3,4],["Thu",2,4],["Fri",2,3],["Sat",3,4],["Sun",2,3]].map(([day, poop, pee]) => <div key={day}><span><i style={{ height: `${Number(poop) * 14}px` }}></i><b>{poop}</b></span><span><i style={{ height: `${Number(pee) * 10}px` }}></i><b>{pee}</b></span><small>{day}</small></div>)}</div><div className="chart-legend"><span><i className="poop"></i>Poop</span><span><i className="pee"></i>Pee</span></div></article>
          <article className="health-card"><div className="health-card-title"><span className="health-icon orange"><Utensils /></span><div><h3>Food log</h3><p>Today</p></div><button>View log <ChevronRight /></button></div><div className="meal-list"><div><span>8:00 AM</span><strong>{pet === "dog" ? "Salmon kibble" : "Sensitive formula"}</strong><em>Full serving eaten</em></div><div><span>6:00 PM</span><strong>Evening meal</strong><em>Scheduled</em></div></div></article>
          <article className="health-card"><div className="health-card-title"><span className="health-icon purple"><Weight /></span><div><h3>Weight</h3><p>Monthly trend</p></div><button>View log <ChevronRight /></button></div><div className="weight-summary"><strong>{pet === "dog" ? "29.0" : "4.6"} <small>kg</small></strong><Badge tone="green">Healthy range</Badge></div><div className="weight-line"><i></i><i></i><i></i><i></i><i></i></div><p className="health-note">Target range: {pet === "dog" ? "27–30 kg" : "4.2–4.8 kg"} · Updated May 21</p></article>
          <article className="health-card"><div className="health-card-title"><span className="health-icon green"><Syringe /></span><div><h3>Vaccines</h3><p>Protection record</p></div><button>View all <ChevronRight /></button></div><div className="record-list"><div><span>Oct 14, 2025</span><strong>{pet === "dog" ? "DHPP booster" : "FVRCP booster"}</strong><em>Completed · Harbour Pet Clinic</em></div><div><span>Oct 14, 2026</span><strong>Annual booster</strong><em>Upcoming</em></div></div></article>
          <article className="health-card"><div className="health-card-title"><span className="health-icon purple"><HeartPulse /></span><div><h3>Vet visits</h3><p>Recent appointments</p></div><button>View all <ChevronRight /></button></div><div className="record-list"><div><span>May 21 · 10:30 AM</span><strong>Annual wellness exam</strong><em>Routine checkup and weight review</em></div><div><span>Feb 8 · 2:15 PM</span><strong>{pet === "dog" ? "Itchy skin and paws" : "Reduced appetite"}</strong><em>Symptoms resolved</em></div></div></article>
          <article className="health-card emergency-dashboard-card"><div className="health-card-title"><span className="health-icon red"><Phone /></span><div><h3>Emergency contact</h3><p>Primary clinic</p></div></div><div className="emergency-details"><strong>Harbour Pet Clinic</strong><a href="tel:+16045550188">+1 604 555 0188</a><span>1285 W Pender Street<br />Vancouver, BC V6E 2V2</span><a className="secondary-button" href="tel:+16045550188"><Phone size={15} /> Call clinic</a></div></article>
          {pet === "dog" && <article className="health-card"><div className="health-card-title"><span className="health-icon green"><Footprints /></span><div><h3>Walking</h3><p>This week</p></div><button>View log <ChevronRight /></button></div><div className="walk-bars">{[32,45,28,58,42,64,22].map((height, i) => <div key={i}><i className={i === 6 ? "warning" : ""} style={{ height: `${height}px` }}></i><small>{["M","T","W","T","F","S","S"][i]}</small></div>)}</div><div className="walk-summary"><span><strong>4h 51m</strong> total</span><span><strong>22.4 km</strong> distance</span></div></article>}
        </div>
      </main>
    </div>
  </section>;
}

const legalContent = {
  terms: { eyebrow: "Community agreement", title: "Terms & Conditions", intro: "The rules that help Avancado remain a respectful, reliable community.", sections: [["Using Avancado", "Avancado helps neighbours connect around pet care and local community information. Members must provide accurate account information and use the service lawfully."], ["Community sitter requests", "Sitter Board posts coordinate voluntary community help. Avancado does not process pricing or payment and is not a party to arrangements between members."], ["Member responsibility", "Pet owners remain responsible for care instructions, emergency contacts, and choosing an appropriate helper. Sitters must follow the agreed care plan and communicate promptly."], ["Account action", "We may hide content, restrict features, or remove accounts when necessary to protect people, pets, or the community."]] },
  safety: { eyebrow: "Trust & care", title: "Safety Centre", intro: "Simple steps for safer conversations, meetups, and pet-care arrangements.", sections: [["Before you meet", "Review public profiles, verification status, experience, and community feedback. Arrange the first meeting in a public place when possible."], ["Protect your information", "Use Avancado messaging while getting to know another member. Only share the contact and home details required for confirmed care."], ["Plan pet care", "Discuss routines, behaviour, medication, emergency contacts, access instructions, and what to do if plans change."], ["Report a concern", "Use Report on a post or sitter request. Reports are private and reviewed by the moderation team. Contact emergency services when someone or a pet is in immediate danger."]] },
  privacy: { eyebrow: "Your information", title: "Privacy Policy", intro: "How Avancado handles profile, pet, messaging, and verification information.", sections: [["Information you provide", "We use account details, pet profiles, posts, messages, and care requests to provide the features you choose to use."], ["Identity verification", "Verification documents are restricted to authorized reviewers and are never displayed publicly. Public profiles show verification status only."], ["Visibility and contact", "Public posts and profiles are visible to visitors. Private messages and contact details are limited to their intended participants and authorized safety review when required."], ["Your choices", "You can update profile details, manage communication preferences, and request account deletion from Account Settings."]] },
} as const;

function LegalPage({ page, back }: { page: "terms" | "safety" | "privacy"; back: () => void }) {
  const content = legalContent[page];
  return <section className="legal-page"><div className="legal-hero"><button className="back-link" onClick={back}><ArrowLeft size={17} /> Back to Avancado</button><span className="eyebrow">{content.eyebrow}</span><h1>{content.title}</h1><p>{content.intro}</p><small>Last updated May 26, 2025</small></div><div className="legal-content">{content.sections.map(([title, body], index) => <section key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{body}</p></div></section>)}<aside><ShieldCheck size={24} /><div><strong>Need help or want to report a safety issue?</strong><p>Contact the Avancado moderation team through Messages or use the Report action where you see the concern.</p></div></aside></div></section>;
}

// ---------- App shell ----------

function UserApp() {
  const { page, setPage, setMode, toast } = useStore();
  const navItems: { id: UserPage; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Home", icon: Home }, { id: "community", label: "Community", icon: UsersRound }, { id: "sitters", label: "Sitter", icon: Dog }, { id: "map", label: "Map", icon: MapPin }, { id: "pets", label: "My pets", icon: PawPrint },
  ];
  return (
    <div className="user-app">
      <SideNav />
      <div className="app-main">
      <UserHeader />
      <main>
        {page === "home" && <HomePage />}
        {page === "sitters" && <SittersPage />}
        {page === "community" && <CommunityPage />}
        {page === "map" && <MapPage />}
        {page === "pets" && <MyPetsWorkspace />}
        {page === "profile" && <ProfilePage />}
        {page === "publicProfile" && <PublicProfilePage />}
        {page === "messages" && <MessagesPage />}
        {(["terms", "safety", "privacy"] as UserPage[]).includes(page) && <LegalPage page={page as "terms" | "safety" | "privacy"} back={() => setPage("home")} />}
      </main>
      {page !== "map" && <footer><nav className="footer-links"><button onClick={() => setPage("terms")}>Terms</button><button onClick={() => setPage("safety")}>Safety Centre</button><button onClick={() => setPage("privacy")}>Privacy</button><button className="admin-footer-link" onClick={() => setMode("adminLogin")}>Admin Console</button></nav><p>© 2026 Avancado · Made for Vancouver’s pets and their people</p></footer>}
      </div>
      <nav className="mobile-bottom-nav">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => setPage(item.id)}><Icon size={20} /><span>{item.label}</span></button>; })}</nav>
      {toast && <div className="toast" role="status"><Check size={18} /> {toast}</div>}
    </div>
  );
}

function Root() {
  const { mode, setMode, toast } = useStore();
  if (mode === "userLogin" || mode === "signup") return <UserAuth key={mode} />;
  if (mode === "adminLogin") return <AdminLogin onLogin={() => setMode("admin")} back={() => setMode("user")} />;
  if (mode === "admin") return <><AdminApp exit={() => setMode("user")} />{toast && <div className="toast" role="status"><Check size={18} /> {toast}</div>}</>;
  return <UserApp />;
}

export default function App() {
  return <StoreProvider><Root /></StoreProvider>;
}
