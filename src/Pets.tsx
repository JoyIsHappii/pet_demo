import { ReactNode, useState } from "react";
import { Activity, Camera, ChevronRight, Edit3, Footprints, HeartPulse, PawPrint, Phone, Plus, Syringe, Trash2, Utensils, Weight } from "lucide-react";
import { isoDay, LogKind, ME, Pet, petAge, PetLogs } from "./data";
import { useStore } from "./store";
import { Badge, EmptyState, Modal } from "./ui";

// ---------- formatting ----------

const toDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00` : iso);
const fmtDate = (iso: string) => (iso ? toDate(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : "");
const fmtTime = (iso: string) => toDate(iso).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
const relDay = (iso: string) => { const day = iso.slice(0, 10); return day === isoDay(0) ? "Today" : day === isoDay(-1) ? "Yesterday" : toDate(day).toLocaleDateString("en-CA", { month: "short", day: "numeric" }); };
const fmtDateTime = (iso: string) => `${relDay(iso)} · ${fmtTime(iso)}`;
const nowLocal = () => { const d = new Date(); return `${isoDay(0)}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const minutesLabel = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// ---------- log definitions: one per ERD table ----------

type Row = Record<string, string | number>;
type Field = { key: string; label: string; type: "text" | "number" | "date" | "datetime-local" | "textarea" | "select"; options?: string[]; required?: boolean; step?: string; placeholder?: string; full?: boolean };
type LogDef = {
  title: string; singular: string; icon: ReactNode; tone: string;
  fields: Field[];
  blank: () => Row;
  sortKey: (r: Row) => string;
  summary: (r: Row) => { title: string; meta: string; note?: string };
  validate?: (r: Row) => string | null;
};

const LOGS: Record<LogKind, LogDef> = {
  toilet: {
    title: "Poop & pee", singular: "bathroom entry", icon: <Activity />, tone: "blue",
    fields: [
      { key: "type", label: "Type", type: "select", options: ["Poop", "Pee"], required: true },
      { key: "loggedAt", label: "Date and time", type: "datetime-local", required: true },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Anything unusual? Colour, consistency, accidents…", full: true },
    ],
    blank: () => ({ type: "Poop", loggedAt: nowLocal(), notes: "" }),
    sortKey: (r) => String(r.loggedAt),
    summary: (r) => ({ title: String(r.type), meta: fmtDateTime(String(r.loggedAt)), note: String(r.notes || "") }),
  },
  food: {
    title: "Food log", singular: "meal", icon: <Utensils />, tone: "orange",
    fields: [
      { key: "foodName", label: "Food", type: "text", required: true, placeholder: "e.g. Salmon kibble", full: true },
      { key: "amount", label: "Amount", type: "number", required: true, step: "0.1" },
      { key: "unit", label: "Unit", type: "select", options: ["cups", "g", "cans", "pouches", "treats", "pieces"], required: true },
      { key: "eatenAt", label: "Date and time", type: "datetime-local", required: true, full: true },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Did they finish it?", full: true },
    ],
    blank: () => ({ foodName: "", amount: 1, unit: "cups", eatenAt: nowLocal(), notes: "" }),
    sortKey: (r) => String(r.eatenAt),
    summary: (r) => ({ title: String(r.foodName), meta: `${r.amount} ${r.unit} · ${fmtDateTime(String(r.eatenAt))}`, note: String(r.notes || "") }),
  },
  weight: {
    title: "Weight", singular: "weigh-in", icon: <Weight />, tone: "purple",
    fields: [
      { key: "weight", label: "Weight (kg)", type: "number", required: true, step: "0.1" },
      { key: "measuredOn", label: "Measured on", type: "date", required: true },
    ],
    blank: () => ({ weight: "", measuredOn: isoDay(0) }),
    sortKey: (r) => String(r.measuredOn),
    summary: (r) => ({ title: `${Number(r.weight).toFixed(1)} kg`, meta: fmtDate(String(r.measuredOn)) }),
    validate: (r) => (Number(r.weight) > 0 ? null : "Enter a weight above 0 kg."),
  },
  vaccine: {
    title: "Vaccines", singular: "vaccine", icon: <Syringe />, tone: "green",
    fields: [
      { key: "vaccineName", label: "Vaccine", type: "text", required: true, placeholder: "e.g. Rabies, DHPP, FVRCP", full: true },
      { key: "administeredOn", label: "Given on", type: "date" },
      { key: "nextDueOn", label: "Next due", type: "date" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Clinic, batch number, reactions…", full: true },
    ],
    blank: () => ({ vaccineName: "", administeredOn: isoDay(0), nextDueOn: "", notes: "" }),
    sortKey: (r) => String(r.nextDueOn || r.administeredOn),
    summary: (r) => ({ title: String(r.vaccineName), meta: [r.administeredOn ? `Given ${fmtDate(String(r.administeredOn))}` : "Not given yet", r.nextDueOn ? `Next due ${fmtDate(String(r.nextDueOn))}` : ""].filter(Boolean).join(" · "), note: String(r.notes || "") }),
    validate: (r) => (r.administeredOn || r.nextDueOn ? null : "Add the date it was given, the next due date, or both."),
  },
  vet: {
    title: "Vet visits", singular: "vet visit", icon: <HeartPulse />, tone: "purple",
    fields: [
      { key: "visitedOn", label: "Visit date", type: "date", required: true },
      { key: "clinicName", label: "Clinic", type: "text", required: true, placeholder: "e.g. Harbour Pet Clinic" },
      { key: "reason", label: "Reason or symptoms", type: "text", required: true, full: true },
      { key: "notes", label: "Outcome / notes", type: "textarea", full: true },
    ],
    blank: () => ({ visitedOn: isoDay(0), clinicName: "", reason: "", notes: "" }),
    sortKey: (r) => String(r.visitedOn),
    summary: (r) => ({ title: String(r.reason), meta: `${fmtDate(String(r.visitedOn))} · ${r.clinicName}`, note: String(r.notes || "") }),
  },
  walk: {
    title: "Walking", singular: "walk", icon: <Footprints />, tone: "green",
    fields: [
      { key: "startedAt", label: "Started at", type: "datetime-local", required: true, full: true },
      { key: "durationMinutes", label: "Duration (minutes)", type: "number", required: true, step: "1" },
      { key: "distanceKm", label: "Distance (km)", type: "number", step: "0.1" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Route, mood, anything to remember…", full: true },
    ],
    blank: () => ({ startedAt: nowLocal(), durationMinutes: 30, distanceKm: "", notes: "" }),
    sortKey: (r) => String(r.startedAt),
    summary: (r) => ({ title: `${minutesLabel(Number(r.durationMinutes))}${r.distanceKm ? ` · ${r.distanceKm} km` : ""}`, meta: fmtDateTime(String(r.startedAt)), note: String(r.notes || "") }),
    validate: (r) => (Number(r.durationMinutes) > 0 ? null : "Enter how many minutes the walk lasted."),
  },
  emergency: {
    title: "Emergency contacts", singular: "emergency contact", icon: <Phone />, tone: "red",
    fields: [
      { key: "clinicName", label: "Clinic or contact name", type: "text", required: true, full: true },
      { key: "phone", label: "Phone", type: "text", required: true, placeholder: "+1 604 555 0188" },
      { key: "address", label: "Address", type: "text" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "e.g. Regular vet, 24-hour ER", full: true },
    ],
    blank: () => ({ clinicName: "", phone: "", address: "", notes: "" }),
    sortKey: (r) => String(r.clinicName),
    summary: (r) => ({ title: String(r.clinicName), meta: [r.phone, r.address].filter(Boolean).join(" · "), note: String(r.notes || "") }),
  },
};

// ---------- log editor modal ----------

function LogModal({ kind, pet, startWith, onClose }: { kind: LogKind; pet: Pet; startWith: "list" | "add"; onClose: () => void }) {
  const { petLogs, saveLog, deleteLog, notify } = useStore();
  const def = LOGS[kind];
  const rows = (petLogs[kind] as unknown as Row[]).filter((r) => r.petId === pet.id).sort((a, b) => (kind === "emergency" ? def.sortKey(a).localeCompare(def.sortKey(b)) : def.sortKey(b).localeCompare(def.sortKey(a))));
  const [draft, setDraft] = useState<Row | null>(startWith === "add" ? { ...def.blank(), id: "", petId: pet.id } : null);
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState("");

  const save = () => {
    if (!draft) return;
    const missing = def.fields.find((f) => f.required && String(draft[f.key] ?? "").trim() === "");
    if (missing) return setError(`Please fill in “${missing.label}”.`);
    const problem = def.validate?.(draft);
    if (problem) return setError(problem);
    const row: Row = { ...draft, id: draft.id || newId(kind) };
    def.fields.forEach((f) => { if (f.type === "number" && row[f.key] !== "") row[f.key] = Number(row[f.key]); });
    saveLog(kind, row as never);
    notify(draft.id ? `${def.singular[0].toUpperCase()}${def.singular.slice(1)} updated.` : `${def.singular[0].toUpperCase()}${def.singular.slice(1)} added for ${pet.name}.`);
    if (startWith === "add" && !draft.id) { onClose(); return; }
    setDraft(null); setError("");
  };

  if (draft) return (
    <Modal onClose={onClose} className="log-modal">
      <span className="eyebrow">{pet.name} · {def.title}</span>
      <h2>{draft.id ? `Edit ${def.singular}` : `Add ${def.singular}`}</h2>
      <div className="form-grid log-form">
        {def.fields.map((f) => {
          const value = String(draft[f.key] ?? "");
          const onChange = (v: string) => { setDraft((current) => (current ? { ...current, [f.key]: v } : current)); setError(""); };
          return <label key={f.key} className={f.full || f.type === "textarea" ? "full-field" : ""}><span>{f.label}{f.required && <span className="req" aria-hidden="true"> *</span>}</span>
            {f.type === "textarea" ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} rows={3} />
              : f.type === "select" ? <select value={value} onChange={(e) => onChange(e.target.value)}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>
                : <input type={f.type} value={value} step={f.step} min={f.type === "number" ? 0 : undefined} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />}
          </label>;
        })}
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="modal-actions">
        <button className="secondary-button" onClick={() => (startWith === "add" && !draft.id ? onClose() : (setDraft(null), setError("")))}>Cancel</button>
        <button className="primary-button" onClick={save}>{draft.id ? "Save changes" : `Add ${def.singular}`}</button>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose} wide className="log-modal">
      <span className="eyebrow">{pet.name}</span>
      <div className="log-modal-head"><h2>{def.title}</h2><button className="primary-button small" onClick={() => setDraft({ ...def.blank(), id: "", petId: pet.id })}><Plus size={15} /> Add {def.singular}</button></div>
      {rows.length ? <ul className="log-list">{rows.map((r) => { const sum = def.summary(r); const id = String(r.id); return (
        <li key={id} className={confirmId === id ? "log-row confirming" : "log-row"}>
          <div className="log-row-main"><strong>{sum.title}</strong><span>{sum.meta}</span>{sum.note && <small>{sum.note}</small>}</div>
          {confirmId === id
            ? <div className="log-row-actions"><span className="log-confirm-text">Delete this entry?</span><button className="secondary-button small" onClick={() => setConfirmId("")}>Keep</button><button className="danger-button small" onClick={() => { deleteLog(kind, id); setConfirmId(""); notify("Entry deleted."); }}>Delete</button></div>
            : <div className="log-row-actions"><button className="icon-button" onClick={() => setDraft({ ...r })} aria-label={`Edit ${sum.title}`} title="Edit"><Edit3 size={16} /></button><button className="icon-button danger" onClick={() => setConfirmId(id)} aria-label={`Delete ${sum.title}`} title="Delete"><Trash2 size={16} /></button></div>}
        </li>
      ); })}</ul> : <EmptyState icon={def.icon} title={`No ${def.title.toLowerCase()} yet`} text={`Add the first ${def.singular} for ${pet.name}.`} />}
      <div className="modal-actions"><button className="secondary-button" onClick={onClose}>Done</button></div>
    </Modal>
  );
}

// ---------- add / edit pet ----------

function PetFormModal({ existing, onClose, onSaved }: { existing?: Pet; onClose: () => void; onSaved: (id: string) => void }) {
  const { savePet, notify } = useStore();
  const [pet, setPet] = useState<Pet>(existing || { id: "", owner: ME, species: "dog", name: "", breed: "", birthDate: "", weight: 0, gender: "Female", isNeutered: false, isVaccinated: false, notes: "", imageUrl: "", updatedAt: isoDay(0) });
  const [weightText, setWeightText] = useState(existing ? String(existing.weight) : "");
  const [error, setError] = useState("");
  const set = <K extends keyof Pet>(key: K, value: Pet[K]) => { setPet((current) => ({ ...current, [key]: value })); setError(""); };
  const submit = () => {
    if (!pet.name.trim()) return setError("Please enter your pet’s name.");
    const weight = Number(weightText);
    if (!pet.birthDate) return setError("Enter your pet’s birthday. If you’re not sure, an estimate is fine.");
    if (pet.birthDate > isoDay(0)) return setError("The birthday can’t be in the future.");
    if (!(weight > 0)) return setError("Enter a weight above 0 kg.");
    const id = pet.id || newId("pet");
    savePet({ ...pet, id, name: pet.name.trim(), breed: pet.breed.trim(), notes: pet.notes.trim(), weight });
    notify(existing ? `${pet.name.trim()}’s profile was updated.` : `${pet.name.trim()} was added to your pets.`);
    onSaved(id);
  };
  const neuterLabel = pet.gender === "Female" ? "Spayed" : "Neutered";
  return (
    <Modal onClose={onClose} wide className="pet-form-modal">
      <span className="eyebrow">{existing ? "Edit pet profile" : "Add another pet"}</span>
      <h2>{existing ? `Update ${existing.name}’s profile` : "Tell us about your pet"}</h2>
      <div className="pet-form-top">
        <label className={pet.imageUrl ? "pet-photo-field has-image" : "pet-photo-field"}>
          {pet.imageUrl ? <img src={pet.imageUrl} alt="" /> : <span><PawPrint size={28} /></span>}
          <em><Camera size={14} /> {pet.imageUrl ? "Change photo" : "Add photo"}</em>
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) set("imageUrl", URL.createObjectURL(f)); }} />
        </label>
        <div className="pet-form-basics">
          <div className="segmented" role="radiogroup" aria-label="Species">
            {(["dog", "cat"] as const).map((sp) => <button key={sp} type="button" role="radio" aria-checked={pet.species === sp} className={pet.species === sp ? "active" : ""} onClick={() => set("species", sp)}>{sp === "dog" ? "Dog" : "Cat"}</button>)}
          </div>
          <label><span>Name<span className="req" aria-hidden="true"> *</span></span><input value={pet.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Sunny" /></label>
          <label>Breed<input value={pet.breed} onChange={(e) => set("breed", e.target.value)} placeholder={pet.species === "dog" ? "e.g. Golden Retriever" : "e.g. Domestic Shorthair"} /></label>
        </div>
      </div>
      <div className="form-grid">
        <label><span>Birthday<span className="req" aria-hidden="true"> *</span></span><input type="date" max={isoDay(0)} value={pet.birthDate} onChange={(e) => set("birthDate", e.target.value)} />{pet.birthDate && pet.birthDate <= isoDay(0) && <small className="field-hint">{petAge(pet.birthDate)} old</small>}</label>
        <label><span>Weight (kg)<span className="req" aria-hidden="true"> *</span></span><input type="number" min={0} step={0.1} value={weightText} onChange={(e) => { setWeightText(e.target.value); setError(""); }} /></label>
        <label>Gender<select value={pet.gender} onChange={(e) => set("gender", e.target.value as Pet["gender"])}><option>Female</option><option>Male</option></select></label>
        <label className="check-field"><input type="checkbox" checked={pet.isNeutered} onChange={(e) => set("isNeutered", e.target.checked)} /> {neuterLabel}</label>
        <div className="full-field vax-field">
          <span className="vax-field-label">Vaccinations<span className="req" aria-hidden="true"> *</span></span>
          <div className="segmented" role="radiogroup" aria-label="Vaccination status">
            <button type="button" role="radio" aria-checked={pet.isVaccinated} className={pet.isVaccinated ? "active" : ""} onClick={() => set("isVaccinated", true)}>Vaccinated</button>
            <button type="button" role="radio" aria-checked={!pet.isVaccinated} className={!pet.isVaccinated ? "active" : ""} onClick={() => set("isVaccinated", false)}>Not yet</button>
          </div>
          <small className="field-hint">Shown to sitters on your sitter requests. Add details in the Vaccines card.</small>
        </div>
        <label className="full-field"><span>Care notes for sitters</span><textarea value={pet.notes} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Personality, routines, allergies, medication, anything a sitter should know…" /><small className="field-hint">Private to you until you post a sitter request. Then sitters on that request can read these notes.</small></label>
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={submit}>{existing ? "Save changes" : "Add pet"}</button></div>
    </Modal>
  );
}

// ---------- page ----------

function PetPhoto({ pet, className = "" }: { pet: Pet; className?: string }) {
  return pet.imageUrl ? <img loading="lazy" className={className} src={pet.imageUrl} alt={pet.name} /> : <span className={`pet-photo-fallback ${className}`} aria-label={pet.name}><PawPrint size={22} /></span>;
}

function CardHead({ def, sub, onAdd, onView, viewLabel = "View log" }: { def: LogDef; sub: string; onAdd: () => void; onView: () => void; viewLabel?: string }) {
  return (
    <div className="health-card-title">
      <span className={`health-icon ${def.tone}`}>{def.icon}</span>
      <div><h3>{def.title}</h3><p>{sub}</p></div>
      <div className="health-card-actions">
        <button className="card-add" onClick={onAdd} aria-label={`Add ${def.singular}`} title={`Add ${def.singular}`}><Plus size={16} /></button>
        <button onClick={onView}>{viewLabel} <ChevronRight /></button>
      </div>
    </div>
  );
}

function Empty({ text, onAdd }: { text: string; onAdd: () => void }) {
  return <p className="health-empty">{text} <button className="text-button inline" onClick={onAdd}>Add one</button></p>;
}

export default function MyPetsPage() {
  const { pets: allPets, petLogs } = useStore();
  const pets = allPets.filter((p) => p.owner === ME); // other owners’ pets exist only for their sitter requests
  const [selectedId, setSelectedId] = useState(pets[0]?.id || "");
  const [petForm, setPetForm] = useState<"add" | "edit" | null>(null);
  const [log, setLog] = useState<{ kind: LogKind; startWith: "list" | "add" } | null>(null);
  const pet = pets.find((p) => p.id === selectedId) || pets[0];
  const openLog = (kind: LogKind, startWith: "list" | "add" = "list") => setLog({ kind, startWith });
  const of = <K extends LogKind>(kind: K) => (pet ? (petLogs[kind] as PetLogs[K][number][]).filter((r) => r.petId === pet.id) : []);

  const page = (body: ReactNode) => (
    <section className="page-section pets-workspace-page">
      <div className="pets-workspace-heading"><span className="eyebrow">Pet care workspace</span><h1>My pets</h1><p>Keep every detail a sitter needs in one place.</p></div>
      {body}
      {petForm && <PetFormModal existing={petForm === "edit" ? pet : undefined} onClose={() => setPetForm(null)} onSaved={(id) => { setSelectedId(id); setPetForm(null); }} />}
      {log && pet && <LogModal key={`${log.kind}-${pet.id}`} kind={log.kind} pet={pet} startWith={log.startWith} onClose={() => setLog(null)} />}
    </section>
  );

  if (!pet) return page(<EmptyState icon={<PawPrint size={24} />} title="No pets yet" text="Add your first pet to start tracking meals, walks, vaccines, and more." action={<button className="primary-button" onClick={() => setPetForm("add")}><Plus size={17} /> Add a pet</button>} />);

  // last 7 days, oldest first
  const days = Array.from({ length: 7 }, (_, i) => isoDay(i - 6));
  const dayLabel = (d: string) => toDate(d).toLocaleDateString("en-CA", { weekday: "short" });
  const toilet = of("toilet");
  const toiletByDay = days.map((d) => ({ d, poop: toilet.filter((t) => t.type === "Poop" && t.loggedAt.startsWith(d)).length, pee: toilet.filter((t) => t.type === "Pee" && t.loggedAt.startsWith(d)).length }));
  const toiletMax = Math.max(1, ...toiletByDay.flatMap((x) => [x.poop, x.pee]));
  const food = of("food").sort((a, b) => b.eatenAt.localeCompare(a.eatenAt));
  const weights = of("weight").sort((a, b) => a.measuredOn.localeCompare(b.measuredOn));
  const latestW = weights[weights.length - 1], prevW = weights[weights.length - 2];
  const spark = weights.slice(-6);
  const sparkMin = Math.min(...spark.map((w) => w.weight)), sparkMax = Math.max(...spark.map((w) => w.weight));
  const today = isoDay(0);
  const vaccines = of("vaccine").map((v) => ({ v, upcoming: Boolean(v.nextDueOn && v.nextDueOn >= today) })).sort((a, b) => (a.upcoming === b.upcoming ? (a.upcoming ? a.v.nextDueOn.localeCompare(b.v.nextDueOn) : b.v.administeredOn.localeCompare(a.v.administeredOn)) : a.upcoming ? -1 : 1));
  const vets = of("vet").sort((a, b) => b.visitedOn.localeCompare(a.visitedOn));
  const contacts = of("emergency");
  const walks = of("walk");
  const walkByDay = days.map((d) => { const w = walks.filter((x) => x.startedAt.startsWith(d)); return { d, minutes: w.reduce((s, x) => s + x.durationMinutes, 0), km: w.reduce((s, x) => s + (Number(x.distanceKm) || 0), 0) }; });
  const walkMax = Math.max(1, ...walkByDay.map((x) => x.minutes));
  const weekMinutes = walkByDay.reduce((s, x) => s + x.minutes, 0), weekKm = walkByDay.reduce((s, x) => s + x.km, 0);

  return page(<>
    <div className="pets-workspace">
      <aside className="pet-workspace-sidebar">
        <span className="sidebar-label">Your pets</span>
        <div className="pet-actions-row">
          <div className="workspace-pet-list">{pets.map((p) => <button key={p.id} className={p.id === pet.id ? "active" : ""} onClick={() => setSelectedId(p.id)}><PetPhoto pet={p} /><span><strong>{p.name}</strong><small>{p.breed || (p.species === "dog" ? "Dog" : "Cat")}</small></span><ChevronRight size={20} /></button>)}</div>
          <button className="add-pet-dashed" onClick={() => setPetForm("add")}><Plus size={17} /> Add another pet</button>
        </div>
      </aside>
      <main className="pet-workspace-main">
        <section className="pet-feature-card">
          <PetPhoto pet={pet} />
          <div>
            <div className="pet-feature-name"><h2>{pet.name}</h2></div>
            <div className="pet-chips"><span>{pet.species === "dog" ? "Dog" : "Cat"}</span><span>{pet.gender}</span>{pet.isNeutered && <span>{pet.gender === "Female" ? "Spayed" : "Neutered"}</span>}<span className={pet.isVaccinated ? "vax yes" : "vax no"}>{pet.isVaccinated ? "Vaccinated" : "Not vaccinated yet"}</span></div>
            <p>{[pet.breed, petAge(pet.birthDate), `${pet.weight} kg`].filter(Boolean).join(" · ")} · Updated {relDay(pet.updatedAt).toLowerCase() === "today" ? "today" : relDay(pet.updatedAt)}</p>
            {pet.notes && <p className="pet-summary-description">{pet.notes}</p>}
          </div>
          <button className="secondary-button pet-edit-button" onClick={() => setPetForm("edit")}><Edit3 size={15} /> Edit profile</button>
        </section>

        <div className="pet-section-heading health-heading"><div><span className="eyebrow">Health report</span><h2>Health & activity</h2></div><span className="health-range-label">Charts show the last 7 days</span></div>

        <div className="health-dashboard-grid">
          <article className="health-card poop-chart-card">
            <CardHead def={LOGS.toilet} sub="Daily count · Last 7 days" onAdd={() => openLog("toilet", "add")} onView={() => openLog("toilet")} />
            {toilet.length ? <>
              <div className="number-chart">{toiletByDay.map(({ d, poop, pee }) => <div key={d}><span><i style={{ height: `${(poop / toiletMax) * 64}px` }}></i><b>{poop}</b></span><span><i style={{ height: `${(pee / toiletMax) * 64}px` }}></i><b>{pee}</b></span><small>{d === today ? "Today" : dayLabel(d)}</small></div>)}</div>
              <div className="chart-legend"><span><i className="poop"></i>Poop</span><span><i className="pee"></i>Pee</span></div>
            </> : <Empty text="No bathroom entries yet." onAdd={() => openLog("toilet", "add")} />}
          </article>

          <article className="health-card">
            <CardHead def={LOGS.food} sub="Latest meals" onAdd={() => openLog("food", "add")} onView={() => openLog("food")} />
            {food.length ? <div className="meal-list">{food.slice(0, 3).map((f) => <div key={f.id}><span>{fmtDateTime(f.eatenAt)}</span><strong>{f.foodName}</strong><em>{f.amount} {f.unit}{f.notes ? ` · ${f.notes}` : ""}</em></div>)}</div> : <Empty text="No meals logged yet." onAdd={() => openLog("food", "add")} />}
          </article>

          <article className="health-card">
            <CardHead def={LOGS.weight} sub="Weigh-in history" onAdd={() => openLog("weight", "add")} onView={() => openLog("weight")} />
            {latestW ? <>
              <div className="weight-summary"><strong>{latestW.weight.toFixed(1)} <small>kg</small></strong>{prevW && <Badge tone={latestW.weight === prevW.weight ? "slate" : "blue"}>{latestW.weight > prevW.weight ? "+" : latestW.weight < prevW.weight ? "−" : "±"}{Math.abs(latestW.weight - prevW.weight).toFixed(1)} kg</Badge>}</div>
              <div className="weight-line">{spark.map((w) => <i key={w.id} title={`${w.weight} kg · ${fmtDate(w.measuredOn)}`} style={{ marginBottom: `${sparkMax === sparkMin ? 20 : 6 + ((w.weight - sparkMin) / (sparkMax - sparkMin)) * 34}px` }}></i>)}</div>
              <p className="health-note">Last weighed {fmtDate(latestW.measuredOn)}{prevW ? ` · previous ${prevW.weight.toFixed(1)} kg` : ""}</p>
            </> : <Empty text="No weigh-ins yet." onAdd={() => openLog("weight", "add")} />}
          </article>

          <article className="health-card">
            <CardHead def={LOGS.vaccine} sub="Protection record" onAdd={() => openLog("vaccine", "add")} onView={() => openLog("vaccine")} viewLabel="View all" />
            {vaccines.length ? <div className="record-list">{vaccines.slice(0, 2).map(({ v, upcoming }) => <div key={v.id}><span>{upcoming ? `Due ${fmtDate(v.nextDueOn)}` : v.administeredOn ? `Given ${fmtDate(v.administeredOn)}` : "No date"}</span><strong>{v.vaccineName}</strong><em className={upcoming ? "status-upcoming" : "status-done"}>{upcoming ? "Upcoming" : "Completed"}{v.notes ? ` · ${v.notes}` : ""}</em></div>)}</div> : <Empty text="No vaccines recorded yet." onAdd={() => openLog("vaccine", "add")} />}
          </article>

          <article className="health-card">
            <CardHead def={LOGS.vet} sub="Recent appointments" onAdd={() => openLog("vet", "add")} onView={() => openLog("vet")} viewLabel="View all" />
            {vets.length ? <div className="record-list">{vets.slice(0, 2).map((v) => <div key={v.id}><span>{fmtDate(v.visitedOn)} · {v.clinicName}</span><strong>{v.reason}</strong>{v.notes && <em>{v.notes}</em>}</div>)}</div> : <Empty text="No vet visits yet." onAdd={() => openLog("vet", "add")} />}
          </article>

          <article className="health-card emergency-dashboard-card">
            <CardHead def={LOGS.emergency} sub={contacts.length > 1 ? `${contacts.length} contacts` : "Primary clinic"} onAdd={() => openLog("emergency", "add")} onView={() => openLog("emergency")} viewLabel="Manage" />
            {contacts.length ? <div className="emergency-list">{contacts.map((c, i) => <div key={c.id} className="emergency-details"><strong>{c.clinicName}</strong><a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>{c.phone}</a>{(c.address || c.notes) && <span>{[c.address, c.notes].filter(Boolean).join(" · ")}</span>}{i === 0 && <a className="secondary-button" href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}><Phone size={15} /> Call {c.clinicName.split(" (")[0]}</a>}</div>)}</div> : <Empty text="No emergency contact yet." onAdd={() => openLog("emergency", "add")} />}
          </article>

          {pet.species === "dog" && <article className="health-card">
            <CardHead def={LOGS.walk} sub="Minutes per day · Last 7 days" onAdd={() => openLog("walk", "add")} onView={() => openLog("walk")} />
            {walks.length ? <>
              <div className="walk-bars">{walkByDay.map(({ d, minutes }) => <div key={d} title={`${dayLabel(d)}: ${minutes} min`}><i className={minutes === 0 ? "warning" : ""} style={{ height: `${minutes === 0 ? 4 : 8 + (minutes / walkMax) * 56}px` }}></i><small>{d === today ? "Today" : dayLabel(d).slice(0, 1)}</small></div>)}</div>
              <div className="walk-summary"><span><strong>{minutesLabel(weekMinutes)}</strong> total</span><span><strong>{weekKm.toFixed(1)} km</strong> distance</span>{walkByDay.some((x) => x.minutes === 0) && <span className="walk-warning">{walkByDay.filter((x) => x.minutes === 0).length} day(s) without a walk</span>}</div>
            </> : <Empty text="No walks logged yet." onAdd={() => openLog("walk", "add")} />}
          </article>}
        </div>
      </main>
    </div>
  </>);
}
