import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, Beer, ChevronLeft, ChevronRight, BellRing, CalendarDays, Check, Clock, Coffee, Compass, Dog, Edit3, Eye, EyeOff, FileText, Flag, Heart,
  HeartPulse, Hotel, LayoutDashboard, LockKeyhole, LogOut, MapPin, Menu, MessageCircle, Mountain, Plus, Search, ShieldCheck, Store, Trash2, Trees, UserRound, UsersRound,
} from "lucide-react";
import { isoDay, photos, Place, Report, SpotCategory } from "./data";
import { MapCanvas, mapCategories } from "./MapPage";
import { useStore } from "./store";
import { Avatar, Badge, Brand, Modal } from "./ui";

type AdminPage = "dashboard" | "requests" | "community" | "spots" | "users";

export function AdminLogin({ onLogin, back }: { onLogin: () => void; back: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (email === "admin@avancado.ca" && password === "Avancado2025!") onLogin();
    else setError("The email or password does not match the demo admin account.");
  };
  return (
    <div className="login-page">
      <div className="login-brand-panel"><button className="back-link light" onClick={back}><ArrowLeft size={17} /> Back to Avancado</button><div className="login-brand-copy"><Brand dark /><span className="admin-kicker">Operations Console</span><h1>Care for the community behind every walk.</h1><p>Review content, manage local places, and keep Avancado safe and welcoming.</p></div><p className="login-quote">Trusted tools for a trusted pet community.</p></div>
      <div className="login-form-panel"><form className="login-form" onSubmit={submit}><div className="login-icon"><LockKeyhole size={24} /></div><span className="eyebrow">Secure admin access</span><h2>Welcome back</h2><p>Sign in with your administrator account to continue.</p><label>Email address<input value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} type="email" placeholder="admin@avancado.ca" /></label><label>Password<input value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} type="password" placeholder="Enter password" /></label>{error && <div className="form-error">{error}</div>}<button className="primary-button full" type="submit">Sign in to console <ArrowRight size={17} /></button><button className="demo-button" type="button" onClick={() => { setEmail("admin@avancado.ca"); setPassword("Avancado2025!"); setError(""); }}>Use demo login</button><div className="demo-note"><strong>Demo credentials</strong><span>admin@avancado.ca</span><span>Avancado2025!</span></div></form></div>
    </div>
  );
}

const adminNav: { id: AdminPage; label: string; icon: typeof UserRound }[] = [
  { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
  { id: "community", label: "Community Moderation", icon: UsersRound },
  { id: "requests", label: "Sitter Requests", icon: Dog },
  { id: "spots", label: "Pet-Friendly Spots", icon: MapPin },
  { id: "users", label: "User Management", icon: UserRound },
];

function AdminSidebar({ page, setPage, exit, counts }: { page: AdminPage; setPage: (page: AdminPage) => void; exit: () => void; counts: Partial<Record<AdminPage, number>> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="admin-menu-button" onClick={() => setOpen(!open)} aria-label="Open admin menu"><Menu /></button>
      <aside className={open ? "admin-sidebar open" : "admin-sidebar"}><div className="admin-brand"><Brand dark /><span>Admin Console</span></div><nav>{adminNav.map((item) => { const Icon = item.icon; return <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => { setPage(item.id); setOpen(false); }}><Icon size={19} /><span>{item.label}</span>{counts[item.id] ? <b className="nav-count">{counts[item.id]}</b> : null}</button>; })}</nav><div className="admin-sidebar-bottom"><button onClick={exit}><ArrowLeft size={18} /> Back to user site</button><div className="admin-mini-profile"><span className="admin-avatar">DA</span><div><strong>Demo Admin</strong><span>Administrator</span></div><LogOut size={17} /></div></div></aside>
    </>
  );
}

/* ---------- Time range: same labels on every admin page ---------- */
type RangeKind = "all" | "week" | "month" | "custom";
type TimeRange = { kind: RangeKind; from?: string; to?: string };
const RANGE_NAMES: Record<Exclude<RangeKind, "custom">, string> = { all: "All time", week: "Last 7 days", month: "Last 30 days" };
const shortDate = (iso: string) => new Date(`${iso}T12:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
export const rangeLabel = (range: TimeRange) => range.kind === "custom" && range.from && range.to ? `${shortDate(range.from)} – ${shortDate(range.to)}` : RANGE_NAMES[range.kind as Exclude<RangeKind, "custom">] || "Custom";

// Turns the prototype's display dates ("38 minutes ago", "Yesterday", "May 19", "May 18, 2025") into a day count.
function daysAgo(label: string) {
  const text = label.toLowerCase();
  if (/minute|hour|today|just now/.test(text)) return 0;
  if (text.includes("yesterday")) return 1;
  const n = text.match(/(\d+)\s+days? ago/);
  if (n) return Number(n[1]);
  const today = new Date(`${isoDay(0)}T12:00`);
  let date = new Date(/\d{4}/.test(label) ? `${label} 12:00` : `${label}, ${today.getFullYear()} 12:00`);
  if (Number.isNaN(date.getTime())) return 0;
  if (date > today) date = new Date(date.setFullYear(date.getFullYear() - 1));
  return Math.round((today.getTime() - date.getTime()) / 86400000);
}
function inRange(label: string, range: TimeRange) {
  const age = daysAgo(label);
  if (range.kind === "week") return age <= 7;
  if (range.kind === "month") return age <= 30;
  if (range.kind === "custom" && range.from && range.to) {
    const day = isoDay(-age);
    return day >= range.from && day <= range.to;
  }
  return true;
}

function TimeRangeFilter({ value, onChange, allowAll = false }: { value: TimeRange; onChange: (range: TimeRange) => void; allowAll?: boolean }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(value.from || isoDay(-14));
  const [to, setTo] = useState(value.to || isoDay(0));
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => { if (event instanceof KeyboardEvent ? event.key === "Escape" : !wrap.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);
  const kinds: Exclude<RangeKind, "custom">[] = allowAll ? ["all", "week", "month"] : ["week", "month"];
  const valid = from && to && from <= to;
  return (
    <div className="time-range-wrap" ref={wrap}>
      <div className="time-range-filter" role="group" aria-label="Time range">
        {kinds.map((kind) => <button key={kind} className={value.kind === kind ? "active" : ""} aria-pressed={value.kind === kind} onClick={() => { onChange({ kind }); setOpen(false); }}>{RANGE_NAMES[kind]}</button>)}
        <button className={value.kind === "custom" ? "active" : ""} aria-pressed={value.kind === "custom"} aria-expanded={open} onClick={() => setOpen(!open)}><CalendarDays size={13} />{value.kind === "custom" ? rangeLabel(value) : "Custom"}</button>
      </div>
      {open && <div className="range-popover" role="dialog" aria-label="Custom date range">
        <strong>Custom range</strong>
        <div className="range-fields"><label>From<input type="date" value={from} max={to || isoDay(0)} onChange={(event) => setFrom(event.target.value)} /></label><label>To<input type="date" value={to} min={from} max={isoDay(0)} onChange={(event) => setTo(event.target.value)} /></label></div>
        {!valid && <p className="form-error">Start date must be before the end date.</p>}
        <div className="range-actions"><button className="secondary-button small" onClick={() => setOpen(false)}>Cancel</button><button className="primary-button small" disabled={!valid} onClick={() => { onChange({ kind: "custom", from, to }); setOpen(false); }}>Apply</button></div>
      </div>}
    </div>
  );
}

/* ---------- Table tools: search, filter chips, pagination ---------- */
type Chip<T> = { label: string; match: (row: T) => boolean; tone?: "coral" };
function useAdminTable<T>(rows: T[], { text, chips, date }: { text: (row: T) => string; chips: Chip<T>[]; date?: (row: T) => string }) {
  const [query, setQueryState] = useState("");
  const [chip, setChipState] = useState("All");
  const [range, setRangeState] = useState<TimeRange>({ kind: "all" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(5);
  const reset = () => setPage(1);
  const q = query.trim().toLowerCase();
  const byText = rows.filter((row) => (!q || text(row).toLowerCase().includes(q)) && (!date || inRange(date(row), range)));
  const active = chips.find((c) => c.label === chip);
  const filtered = active ? byText.filter(active.match) : byText;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  return {
    query, setQuery: (v: string) => { setQueryState(v); reset(); },
    chip, setChip: (v: string) => { setChipState(v); reset(); },
    range, setRange: (v: TimeRange) => { setRangeState(v); reset(); },
    chipCounts: [{ label: "All", count: byText.length }, ...chips.map((c) => ({ label: c.label, count: byText.filter(c.match).length, tone: c.tone }))],
    filtered, rows: filtered.slice((current - 1) * pageSize, current * pageSize),
    page: current, setPage, pageCount, pageSize, setPageSize: (n: number) => { setPageSizeState(n); reset(); },
    isFiltered: Boolean(q) || chip !== "All" || range.kind !== "all",
    clear: () => { setQueryState(""); setChipState("All"); setRangeState({ kind: "all" }); reset(); },
  };
}
type AdminTable = ReturnType<typeof useAdminTable<unknown>>;

function TableToolbar({ table, placeholder }: { table: AdminTable; placeholder: string }) {
  return (
    <div className="admin-toolbar">
      <div className="search-field"><Search size={16} /><input value={table.query} onChange={(event) => table.setQuery(event.target.value)} placeholder={placeholder} aria-label={placeholder} />{table.query && <button className="search-clear" onClick={() => table.setQuery("")} aria-label="Clear search">×</button>}</div>
      <div className="admin-chips" role="group" aria-label="Filter">
        {table.chipCounts.map((c) => <button key={c.label} className={[table.chip === c.label ? "active" : "", "tone" in c && c.tone ? c.tone : ""].join(" ").trim()} aria-pressed={table.chip === c.label} onClick={() => table.setChip(c.label)}>{c.label}<span>{c.count}</span></button>)}
      </div>
    </div>
  );
}

function NoResults({ columns, what, table }: { columns: number; what: string; table: AdminTable }) {
  return <tr className="no-hover"><td colSpan={columns}><div className="table-empty"><span><Search size={20} /></span><strong>No {what} match these filters</strong><p>Try another search word or time range.</p>{table.isFiltered && <button className="secondary-button small" onClick={table.clear}>Clear filters</button>}</div></td></tr>;
}

function TableFooter({ table, what }: { table: AdminTable; what: string }) {
  const total = table.filtered.length;
  const start = total ? (table.page - 1) * table.pageSize + 1 : 0;
  const end = Math.min(table.page * table.pageSize, total);
  return (
    <div className="table-footer">
      <span>{total ? <>Showing <strong>{start}–{end}</strong> of <strong>{total}</strong> {what}</> : <><strong>0</strong> {what}</>}</span>
      <div className="table-footer-right">
        <label className="rows-select">Rows per page<select value={table.pageSize} onChange={(event) => table.setPageSize(Number(event.target.value))}>{[5, 10, 25].map((n) => <option key={n}>{n}</option>)}</select></label>
        <nav className="pager" aria-label="Pages">
          <button disabled={table.page === 1} onClick={() => table.setPage(table.page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
          {Array.from({ length: table.pageCount }, (_, i) => i + 1).map((n) => <button key={n} className={n === table.page ? "active" : ""} aria-current={n === table.page ? "page" : undefined} onClick={() => table.setPage(n)}>{n}</button>)}
          <button disabled={table.page === table.pageCount} onClick={() => table.setPage(table.page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
        </nav>
      </div>
    </div>
  );
}

function PageTitle({ title, lead, children }: { title: string; lead: string; children?: ReactNode }) {
  return <div className="admin-page-title"><div><h1>{title}</h1><p>{lead}</p></div>{children}</div>;
}

function ReportFlag({ reports }: { reports: Report[] }) {
  if (!reports.length) return null;
  return <span className="report-flag" title={reports.map((r) => r.reason).join(", ")}><Flag size={12} /> {reports.length} report{reports.length > 1 ? "s" : ""} · {reports[0].reason}</span>;
}

function ConfirmDelete({ what, onCancel, onConfirm }: { what: string; onCancel: () => void; onConfirm: () => void }) {
  return <Modal onClose={onCancel}><span className="eyebrow">Permanent action</span><h2>Delete {what}?</h2><p className="modal-lead">This permanently removes it from Avancado and cannot be undone. Use Hide if you might want to restore it later.</p><div className="modal-actions"><button className="secondary-button" onClick={onCancel}>Cancel</button><button className="danger-button" onClick={onConfirm}><Trash2 size={16} /> Delete permanently</button></div></Modal>;
}

function Dashboard({ go }: { go: (page: AdminPage) => void }) {
  const { reports, places, users, posts, requests } = useStore();
  const open = reports.filter((r) => r.status === "open");
  const [range, setRange] = useState<TimeRange>({ kind: "week" });
  const label = rangeLabel(range);
  // Mock numbers for each range. The real build counts them in the database.
  const period = range.kind === "month" ? { growth: "+12%", newMembers: "86", chart: [28, 41, 66, 92, 78, 56, 35] } : range.kind === "custom" ? { growth: "+7%", newMembers: "43", chart: [24, 38, 61, 85, 80, 52, 30] } : { growth: "+3%", newMembers: "21", chart: [20, 34, 58, 88, 71, 49, 26] };
  const metrics: [string, string, string, typeof UsersRound][] = [
    ["Active members", "2,486", `${period.growth} · ${label}`, UsersRound],
    ["New members", period.newMembers, label, UserRound],
    ["Reported posts", String(open.filter((r) => r.target === "post").length), `Open now · ${posts.length} posts live`, MessageCircle],
    ["Reported sitter events", String(open.filter((r) => r.target === "request").length), `Open now · ${requests.length} requests`, Flag],
    ["Pet-friendly places", String(places.length), `${open.filter((r) => r.target === "place").length} open place report${open.filter((r) => r.target === "place").length === 1 ? "" : "s"}`, MapPin],
    ["Waiting verification", String(users.filter((u) => u.verification === "pending").length), "Open now · identity reviews", ShieldCheck],
  ];
  const targetPage: Record<Report["target"], AdminPage> = { post: "community", request: "requests", place: "spots" };
  return (
    <div className="admin-page-inner">
      <div className="admin-page-title"><div><span className="eyebrow">{new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })}</span><h1>Good morning, Demo Admin</h1><p>Here is what is happening across Avancado today.</p></div><TimeRangeFilter value={range} onChange={setRange} /></div>
      <div className="metric-grid">{metrics.map(([label, value, note, Icon]) => <article className="metric-card" key={label}><span className="metric-icon"><Icon size={21} /></span><p>{label}</p><h2>{value}</h2><span>{note}</span></article>)}</div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel"><div className="panel-heading"><div><h2>Popular posting times</h2><p>Community posts and sitter events · {label}</p></div></div><div className="chart"><div className="chart-lines"></div>{period.chart.map((height, index) => <div className="chart-bar-wrap" key={index}><div className="chart-bar" style={{ height: `${height}%` }}></div><span>{["6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM", "12 AM"][index]}</span></div>)}</div></section>
        <section className="admin-panel"><div className="panel-heading"><div><h2>Needs review</h2><p>Priority moderation queue</p></div><Badge tone="amber">{open.length} open</Badge></div><div className="review-list">
          {open.length ? open.slice(0, 5).map((r) => <div className="review-item" key={r.id}><span className="review-icon">{r.target === "place" ? <MapPin size={17} /> : r.target === "post" ? <MessageCircle size={17} /> : <Flag size={17} />}</span><div><strong>{r.subject}</strong><span>{r.reason} · {r.date}</span></div><button className="secondary-button small" onClick={() => go(targetPage[r.target])}>Review</button></div>)
            : <div className="empty-queue"><Check size={18} /> The moderation queue is clear.</div>}
          {users.some((u) => u.verification === "pending") && <div className="review-item"><span className="review-icon"><BellRing size={17} /></span><div><strong>Identity verification waiting</strong><span>User management</span></div><button className="secondary-button small" onClick={() => go("users")}>Review</button></div>}
        </div></section>
      </div>
    </div>
  );
}

function RequestsAdmin() {
  const { requests, updateRequest, deleteRequest, reports, resolveReportsFor, notify } = useStore();
  const [selectedId, setSelectedId] = useState("");
  const [deleting, setDeleting] = useState("");
  const selected = requests.find((r) => r.id === selectedId);
  const reportsFor = (id: string) => reports.filter((r) => r.status === "open" && r.target === "request" && r.targetId === id);
  const table = useAdminTable(requests, {
    text: (r) => `${r.id} ${r.owner} ${r.title} ${r.area} ${r.pet}`,
    date: (r) => r.posted,
    chips: [
      { label: "Reported", match: (r) => reportsFor(r.id).length > 0, tone: "coral" },
      { label: "Open", match: (r) => !r.hidden && r.status === "Open" },
      { label: "Matched", match: (r) => !r.hidden && r.status === "Matched" },
      { label: "Done", match: (r) => !r.hidden && r.status === "Done" },
      { label: "Hidden", match: (r) => Boolean(r.hidden) },
    ],
  });
  const toggleHide = (id: string, hidden?: boolean) => { updateRequest(id, { hidden: !hidden }); if (!hidden) resolveReportsFor("request", id); notify(hidden ? "Request is visible again." : "Request hidden from the sitter board."); };
  return (
    <div className="admin-page-inner">
      <PageTitle title="Sitter Requests Moderation" lead="Review and manage sitter request posts."><TimeRangeFilter value={table.range} onChange={table.setRange} allowAll /></PageTitle>
      <TableToolbar table={table} placeholder="Search by title, owner, area or ID" />
      <div className="table-shell"><table><thead><tr><th>Post ID</th><th>Author / Pet Owner</th><th>Title</th><th>Posted</th><th>Sitting date</th><th>Status</th><th>Actions</th></tr></thead><tbody>{!table.rows.length && <NoResults columns={7} what="requests" table={table} />}{table.rows.map((row) => <tr key={row.id} className={row.hidden ? "soft-deleted-row" : ""}><td><strong>{row.id}</strong></td><td><div className="table-user"><Avatar name={row.owner} size="sm" /><span>{row.owner}</span></div></td><td className="table-title">{row.title}<ReportFlag reports={reportsFor(row.id)} /></td><td className="muted">{row.posted}</td><td>{row.date}</td><td>{row.hidden ? <Badge tone="amber">Hidden</Badge> : <Badge tone={row.status === "Open" ? "green" : row.status === "Matched" ? "blue" : "slate"}>{row.status}</Badge>}</td><td><div className="row-actions"><button onClick={() => setSelectedId(row.id)}><Eye size={15} /> View</button><button onClick={() => toggleHide(row.id, row.hidden)}>{row.hidden ? <><Eye size={15} /> Unhide</> : <><EyeOff size={15} /> Hide</>}</button><button className="danger" onClick={() => setDeleting(row.id)}><Trash2 size={15} /> Delete</button></div></td></tr>)}</tbody></table></div><TableFooter table={table} what="requests" />
      {selected && <Modal wide onClose={() => setSelectedId("")}><span className="eyebrow">Request details</span><h2>Match & contact log</h2><p className="modal-lead">{selected.title}</p><div className="detail-grid"><div><span>Pet owner</span><strong>{selected.owner}</strong></div><div><span>Selected sitter</span><strong>{selected.matched || "Not selected"}</strong></div><div><span>Current status</span><Badge tone="green">{selected.status}</Badge></div><div><span>Post ID</span><strong>{selected.id}</strong></div><div><span>Applicants</span><strong>{selected.applicants.length}</strong></div></div>{reportsFor(selected.id).length > 0 && <div className="report-box"><Flag size={16} /><div><strong>Open reports</strong>{reportsFor(selected.id).map((r) => <span key={r.id}>{r.reason} · {r.date}</span>)}</div></div>}<div className="contact-log"><LockKeyhole size={20} /><div><strong>Contact log is protected</strong><p>Private contact information is only unlocked when a dispute report requires investigation.</p></div></div><div className="modal-actions"><button className="secondary-button" onClick={() => { toggleHide(selected.id, selected.hidden); setSelectedId(""); }}>{selected.hidden ? "Unhide" : "Hide request"}</button><button className="danger-button" onClick={() => { setDeleting(selected.id); setSelectedId(""); }}><Trash2 size={16} /> Delete</button></div></Modal>}
      {deleting && <ConfirmDelete what="this sitter request" onCancel={() => setDeleting("")} onConfirm={() => { deleteRequest(deleting); resolveReportsFor("request", deleting); setDeleting(""); notify("Request permanently deleted."); }} />}
    </div>
  );
}

function CommunityAdmin() {
  const { posts, updatePost, deletePost, reports, resolveReportsFor, notify } = useStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const selected = posts.find((p) => p.id === selectedId);
  const reportsFor = (id: number) => reports.filter((r) => r.status === "open" && r.target === "post" && r.targetId === String(id));
  const table = useAdminTable(posts, {
    text: (p) => `${p.author} ${p.pet} ${p.caption} ${p.location}`,
    date: (p) => p.date,
    chips: [
      { label: "Reported", match: (p) => reportsFor(p.id).length > 0, tone: "coral" },
      { label: "Lost pets", match: (p) => p.status === "lost" },
      { label: "Hidden", match: (p) => Boolean(p.hidden) },
    ],
  });
  const toggleHide = (id: number, hidden?: boolean) => { updatePost(id, { hidden: !hidden }); if (!hidden) resolveReportsFor("post", String(id)); notify(hidden ? "Post is visible again." : "Post hidden from Community."); };
  return (
    <div className="admin-page-inner"><PageTitle title="Community Moderation" lead="Review photos and lost-pet alerts shared by the community."><TimeRangeFilter value={table.range} onChange={table.setRange} allowAll /></PageTitle>
      <TableToolbar table={table} placeholder="Search by author, pet, caption or place" />
      <div className="table-shell"><table><thead><tr><th>Thumbnail</th><th>Author / Pet</th><th>Caption</th><th>Paws</th><th>Posted</th><th>Actions</th></tr></thead><tbody>{!table.rows.length && <NoResults columns={6} what="posts" table={table} />}{table.rows.map((row) => <tr key={row.id} className={row.hidden ? "soft-deleted-row" : ""}><td><img loading="lazy" className="table-thumb" src={row.image} alt="" /></td><td><strong>{row.author}</strong><br /><span className="muted">{row.pet || (row.status === "lost" ? "Lost pet alert" : "Community post")}</span></td><td className="table-title">{row.caption}<ReportFlag reports={reportsFor(row.id)} /></td><td><span className="likes-cell"><Heart size={15} fill="currentColor" /> {row.likes}</span></td><td>{row.date}{row.hidden && <><br /><Badge tone="amber">Hidden</Badge></>}</td><td><div className="row-actions"><button onClick={() => setSelectedId(row.id)}><Eye size={15} /> View</button><button onClick={() => toggleHide(row.id, row.hidden)}>{row.hidden ? <><Eye size={15} /> Unhide</> : <><EyeOff size={15} /> Hide</>}</button><button className="danger" onClick={() => setDeleting(row.id)}><Trash2 size={15} /> Delete</button></div></td></tr>)}</tbody></table></div><TableFooter table={table} what="posts" />
      {selected && <Modal onClose={() => setSelectedId(null)}><img loading="lazy" className="modal-large-image" src={selected.image} alt={selected.caption} /><span className="eyebrow">{selected.status === "lost" ? "Lost pet alert" : "Community post"}</span><h2>{selected.author}</h2><p className="modal-lead">{selected.caption}</p><div className="detail-grid"><div><span>Location</span><strong>{selected.location}</strong></div><div><span>Paws</span><strong>{selected.likes}</strong></div><div><span>Posted</span><strong>{selected.date}</strong></div></div>{reportsFor(selected.id).length > 0 && <div className="report-box"><Flag size={16} /><div><strong>Open reports</strong>{reportsFor(selected.id).map((r) => <span key={r.id}>{r.reason} · {r.date}</span>)}</div></div>}<div className="modal-actions"><button className="secondary-button" onClick={() => { toggleHide(selected.id, selected.hidden); setSelectedId(null); }}>{selected.hidden ? "Unhide post" : "Hide post"}</button><button className="danger-button" onClick={() => { setDeleting(selected.id); setSelectedId(null); }}><Trash2 size={16} /> Delete</button></div></Modal>}
      {deleting !== null && <ConfirmDelete what="this post" onCancel={() => setDeleting(null)} onConfirm={() => { deletePost(deleting); resolveReportsFor("post", String(deleting)); setDeleting(null); notify("Post permanently deleted."); }} />}
    </div>
  );
}

function SpotForm({ existing, onClose }: { existing: Place | "new"; onClose: () => void }) {
  const { savePlace, notify } = useStore();
  const base = existing === "new" ? null : existing;
  const [name, setName] = useState(base?.name || "");
  const [category, setCategory] = useState<SpotCategory>(base?.category || "Parks & Off-Leash");
  const [address, setAddress] = useState(base?.address || "");
  const [phone, setPhone] = useState(base?.phone || "");
  const [hours, setHours] = useState(base?.hours === "Hours not listed" ? "" : base?.hours || "");
  const [description, setDescription] = useState(base?.description || "");
  const [sponsored, setSponsored] = useState(Boolean(base?.sponsored));
  const [image, setImage] = useState(base?.image || "");
  const [error, setError] = useState("");
  const MAX = 600;
  const save = () => {
    if (!name.trim() || !address.trim() || !description.trim()) return setError("Spot name, address and description are required.");
    const details = { name: name.trim(), category, address: address.trim(), phone: phone.trim() || undefined, hours: hours.trim() || "Hours not listed", description: description.trim(), sponsored, updatedAt: isoDay(0) };
    savePlace(base ? { ...base, ...details, image: image || base.image } : { id: Date.now(), ...details, image: image || photos.spot1, latitude: 49.262 + Math.random() * 0.024, longitude: -123.17 + Math.random() * 0.09, /* mock: a real build geocodes the address */ rating: 0, reviews: [] });
    notify(base ? "Spot updated." : "Spot added to the map.");
    onClose();
  };
  return <Modal wide onClose={onClose}><span className="eyebrow">{base ? "Edit place" : "New place"}</span><h2>{base ? "Update spot details" : "Add a pet-friendly spot"}</h2>
    <div className="form-grid">
      <label><span>Spot name<span className="req" aria-hidden="true"> *</span></span><input value={name} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="e.g. Spanish Banks Off-Leash" /></label>
      <label><span>Category<span className="req" aria-hidden="true"> *</span></span><select value={category} onChange={(event) => setCategory(event.target.value as SpotCategory)}>{mapCategories.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
      <label className="full-field"><span>Address<span className="req" aria-hidden="true"> *</span></span><input value={address} onChange={(event) => { setAddress(event.target.value); setError(""); }} placeholder="Street address, Vancouver, BC" /><small className="field-hint">The map pin is placed from this address.</small></label>
      <label><span>Opening hours</span><input value={hours} onChange={(event) => setHours(event.target.value)} placeholder="e.g. Open 6 AM – 10 PM" /><small className="field-hint">Leave empty to show “Hours not listed”.</small></label>
      <label><span>Phone</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="e.g. 604-555-0123" /><small className="field-hint">Optional. Shown on the place page.</small></label>
      <label className="full-field"><span>Description<span className="req" aria-hidden="true"> *</span></span><textarea rows={4} maxLength={MAX} value={description} onChange={(event) => { setDescription(event.target.value); setError(""); }} placeholder="What makes it pet-friendly? Off-leash rules, water bowls, patio, parking…" /><small className="field-hint field-count">{description.length}/{MAX}</small></label>
      <label className="full-field"><span>Photo</span><div className="upload-field">{image ? <img loading="lazy" src={image} alt="" className="upload-preview" /> : <Plus size={20} />}<span>{image ? "Change photo" : "Choose a photo"}</span><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) setImage(URL.createObjectURL(file)); }} /></div></label>
      <div className="full-field toggle-list spot-toggles"><label className="toggle-row"><span><strong>Sponsored spot</strong><small>Adds a Sponsored tag and a gold dot on the map pin.</small></span><input type="checkbox" checked={sponsored} onChange={() => setSponsored(!sponsored)} /><i></i></label></div>
    </div>
    {error && <div className="form-error">{error}</div>}
    <div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={save}>{base ? "Save changes" : "Add spot"}</button></div></Modal>;
}

function SpotsAdmin() {
  const { places, savePlace, deletePlace, reports, resolveReport, notify } = useStore();
  const toggleHidden = (spot: Place) => { savePlace({ ...spot, hidden: !spot.hidden }); notify(spot.hidden ? `${spot.name} is back on the map.` : `${spot.name} is hidden from the map.`); };
  const [category, setCategory] = useState<"All" | SpotCategory>("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(places[0]?.id);
  const [editing, setEditing] = useState<Place | "new" | null>(null);
  const [deleting, setDeleting] = useState<Place | null>(null);
  const filtered = useMemo(() => places.filter((spot) => (category === "All" || spot.category === category) && `${spot.name} ${spot.address}`.toLowerCase().includes(search.toLowerCase())), [places, category, search]);
  const placeReports = reports.filter((r) => r.target === "place" && r.status === "open");
  const categories: { name: "All" | SpotCategory; icon: typeof Compass }[] = [{ name: "All", icon: Compass }, { name: "Parks & Off-Leash", icon: Trees }, { name: "Cafes & Restaurants", icon: Coffee }, { name: "Pubs & Breweries", icon: Beer }, { name: "Retail & Shops", icon: Store }, { name: "Pet Services", icon: HeartPulse }, { name: "Hotels", icon: Hotel }, { name: "Hiking Trails", icon: Mountain }];
  const selected = filtered.find((s) => s.id === selectedId) || filtered[0];
  return (
    <div className="spots-admin">
      <div className="spots-left"><div className="spots-left-top"><div><h1>Pet-Friendly Spots Management</h1><p>Manage trusted places across Vancouver.</p></div>
        {placeReports.length > 0 && <section className="place-report-queue"><div className="panel-heading"><div><h2>Place reports</h2><p>Reports from members about map listings</p></div><Badge tone="amber">{placeReports.length} open</Badge></div>
          {placeReports.map((r) => { const place = places.find((p) => String(p.id) === r.targetId); return <article key={r.id}><div><strong>{r.subject}</strong><span><Flag size={12} /> {r.reason} · {r.date}</span></div><div className="row-actions"><button onClick={() => { resolveReport(r.id); notify("Report rejected. The place was not changed."); }}>Reject report</button>{place && <button onClick={() => { setEditing(place); resolveReport(r.id); }}><Edit3 size={14} /> Edit place</button>}{place && <button className="danger" onClick={() => setDeleting(place)}><Trash2 size={14} /> Delete place</button>}</div></article>; })}
        </section>}
        <div className="category-tabs">{categories.map((item) => { const Icon = item.icon; return <button className={category === item.name ? "active" : ""} key={item.name} onClick={() => setCategory(item.name)}><Icon size={16} /> {item.name}</button>; })}</div>
        <div className="spots-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search places..." /></div><button className="primary-button" onClick={() => setEditing("new")}><Plus size={17} /> Add Spot</button></div></div>
        <div className="admin-spot-list">{filtered.map((spot) => <article className={["admin-spot-card", selected?.id === spot.id ? "selected" : "", spot.hidden ? "is-hidden" : ""].join(" ").trim()} key={spot.id} onClick={() => setSelectedId(spot.id)}><img loading="lazy" src={spot.image} alt="" /><div><div className="spot-card-badges"><Badge tone="blue">{spot.category}</Badge>{spot.sponsored && <Badge tone="amber">Sponsored</Badge>}{spot.hidden && <Badge tone="slate"><EyeOff size={11} /> Hidden</Badge>}{placeReports.some((r) => r.targetId === String(spot.id)) && <Badge tone="red"><Flag size={11} /> Reported</Badge>}</div><h3>{spot.name}</h3><p><MapPin size={14} /> {spot.address}</p><div className="row-actions"><button onClick={(event) => { event.stopPropagation(); setEditing(spot); }}><Edit3 size={15} /> Edit</button><button onClick={(event) => { event.stopPropagation(); toggleHidden(spot); }}>{spot.hidden ? <><Eye size={15} /> Unhide</> : <><EyeOff size={15} /> Hide</>}</button><button className="danger" onClick={(event) => { event.stopPropagation(); setDeleting(spot); }}><Trash2 size={15} /> Delete</button></div></div></article>)}{!filtered.length && <p className="muted">No spots match this filter.</p>}</div></div>
      <div className="spots-map-sticky"><MapCanvas places={filtered} selected={selected} onSelect={(p) => setSelectedId(p.id)} /></div>
      {editing && <SpotForm existing={editing} onClose={() => setEditing(null)} />}
      {deleting && <ConfirmDelete what={`“${deleting.name}”`} onCancel={() => setDeleting(null)} onConfirm={() => { deletePlace(deleting.id); setDeleting(null); notify("Place deleted from the map."); }} />}
    </div>
  );
}

function UsersAdmin() {
  const { users, setVerification, toggleUserHidden, deleteUser, notify } = useStore();
  const [reviewing, setReviewing] = useState("");
  const [deleting, setDeleting] = useState("");
  const pending = users.filter((u) => u.verification === "pending");
  const table = useAdminTable(users, {
    text: (u) => `${u.name} ${u.email}`,
    chips: [
      { label: "Pending", match: (u) => u.verification === "pending" },
      { label: "Verified", match: (u) => u.verification === "verified" },
      { label: "Not verified", match: (u) => u.verification === "unverified" },
      { label: "Hidden", match: (u) => u.hidden },
    ],
  });
  const reviewUser = users.find((u) => u.name === reviewing);
  const approve = (name: string) => { setVerification(name, "verified"); setReviewing(""); notify(`${name} is now verified.`); };
  const reject = (name: string) => { setVerification(name, "unverified"); setReviewing(""); notify(`${name}’s verification was rejected. They can submit again.`); };
  return <div className="admin-page-inner">
    <div className="admin-page-title"><div><h1>User Management</h1><p>Review identity requests, manage visibility, or permanently delete accounts.</p></div></div>
    <section className="verification-queue"><div className="panel-heading"><div><h2>Waiting for verification</h2><p>{pending.length} identity request{pending.length === 1 ? "" : "s"} need admin review</p></div><Badge tone="amber">{pending.length} pending</Badge></div>{pending.length ? <div className="verification-request-list">{pending.map((user) => <article key={user.email}><div className="table-user"><Avatar name={user.name} size="md" /><span><strong>{user.name}</strong><small>{user.email} · Submitted today</small></span></div><div className="document-pill"><FileText size={15} /><span><strong>{user.document || "BCID"}</strong><small>Identity document</small></span></div><div className="row-actions"><button onClick={() => setReviewing(user.name)}><Eye size={15} /> Review</button><button onClick={() => reject(user.name)}>Reject</button><button className="approve" onClick={() => approve(user.name)}><Check size={15} /> Approve</button></div></article>)}</div> : <div className="empty-queue"><Check size={18} /> All verification requests have been reviewed.</div>}</section>
    <TableToolbar table={table} placeholder="Search by name or email" />
    <div className="table-shell"><table><thead><tr><th>User</th><th>Email</th><th>Verification</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>{!table.rows.length && <NoResults columns={6} what="members" table={table} />}{table.rows.map((user) => <tr key={user.email} className={user.hidden ? "soft-deleted-row" : ""}><td><div className="table-user"><span className="verified-avatar"><Avatar name={user.name} size="sm" />{user.verification === "verified" && <ShieldCheck size={11} />}</span><strong>{user.name}</strong></div></td><td>{user.email}</td><td>{user.verification === "verified" ? <Badge tone="blue"><ShieldCheck size={12} /> Verified</Badge> : user.verification === "pending" ? <Badge tone="amber"><Clock size={12} /> Pending</Badge> : <Badge tone="slate">Not verified</Badge>}</td><td>{user.hidden ? <Badge tone="amber">Hidden</Badge> : <Badge tone="green">Active</Badge>}</td><td>{user.joined}</td><td><div className="row-actions"><button onClick={() => { toggleUserHidden(user.name); notify(user.hidden ? `${user.name} is visible again.` : `${user.name} and their posts are hidden from public pages.`); }}>{user.hidden ? <><Eye size={15} /> Unhide</> : <><EyeOff size={15} /> Hide</>}</button><button className="danger" onClick={() => setDeleting(user.name)}><Trash2 size={15} /> Delete</button></div></td></tr>)}</tbody></table></div><TableFooter table={table} what="members" />
    {reviewUser && <Modal onClose={() => setReviewing("")}><span className="eyebrow">Identity review</span><h2>{reviewUser.name}</h2><p className="modal-lead">Compare the legal name and photo on the document with the account details. Documents are never shown publicly.</p><div className="detail-grid"><div><span>Email</span><strong>{reviewUser.email}</strong></div><div><span>Document</span><strong>{reviewUser.document || "BCID"}</strong></div><div><span>Submitted</span><strong>Today</strong></div></div><div className="document-preview"><FileText size={34} /><span>{reviewUser.document || "BCID"} · document image (demo)</span></div><div className="modal-actions"><button className="secondary-button" onClick={() => reject(reviewUser.name)}>Reject</button><button className="primary-button" onClick={() => approve(reviewUser.name)}><Check size={16} /> Approve</button></div></Modal>}
    {deleting && <ConfirmDelete what={`${deleting}’s account`} onCancel={() => setDeleting("")} onConfirm={() => { deleteUser(deleting); setDeleting(""); notify("User permanently deleted."); }} />}
  </div>;
}

export function AdminApp({ exit }: { exit: () => void }) {
  const { reports, users } = useStore();
  const [page, setPage] = useState<AdminPage>("dashboard");
  const title = adminNav.find((item) => item.id === page)?.label || "Admin";
  const open = reports.filter((r) => r.status === "open");
  const counts = { community: open.filter((r) => r.target === "post").length, requests: open.filter((r) => r.target === "request").length, spots: open.filter((r) => r.target === "place").length, users: users.filter((u) => u.verification === "pending").length };
  return <div className="admin-app"><AdminSidebar page={page} setPage={setPage} exit={exit} counts={counts} /><div className="admin-main"><header className="admin-header"><div><span>Avancado / Admin</span><strong>{title}</strong></div><div className="admin-profile"><span className="admin-avatar">DA</span><div><strong>Demo Admin</strong><span>Administrator</span></div></div></header>{page === "dashboard" && <Dashboard go={setPage} />}{page === "requests" && <RequestsAdmin />}{page === "community" && <CommunityAdmin />}{page === "spots" && <SpotsAdmin />}{page === "users" && <UsersAdmin />}</div></div>;
}
