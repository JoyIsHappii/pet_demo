import { useEffect, useRef, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, CalendarDays, Check, ChevronRight, CircleCheckBig, Clock, Flag, Heart, MapPin,
  MessageCircle, Plus, Search, ShieldCheck, Smile, Frown, Star, Trash2, UsersRound, X,
} from "lucide-react";
import { Applicant, dateParts, findPerson, firstName, ME, petAge, SitterRequest } from "./data";
import { useStore } from "./store";
import { Badge, EmptyState, Modal, PersonAvatar, ReportModal, StarRating } from "./ui";

type Tab = "all" | "mine" | "applied";

function Facts({ request }: { request: SitterRequest }) {
  return <div className="meta-row"><span><CalendarDays size={15} /> {request.date}</span><span><Clock size={15} /> {request.time}</span><span><Activity size={15} /> {request.duration}</span><span><MapPin size={15} /> {request.area}</span></div>;
}

function SitterMini({ name, label, tone = "blue", action }: { name: string; label: string; tone?: "blue" | "green"; action?: React.ReactNode }) {
  const person = findPerson(name);
  return (
    <div className={tone === "green" ? "sitter-mini completed" : "sitter-mini"}>
      <PersonAvatar name={name} />
      <div><small>{label}</small><strong>{name}</strong><em>{person.sits} completed sits · {person.rating} stars</em></div>
      {action}
    </div>
  );
}

function StatusNote({ tone, icon, title, text, action }: { tone: "blue" | "green" | "red"; icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }) {
  return <div className={`status-note ${tone}`}><span>{icon}</span><div><strong>{title}</strong><small>{text}</small></div>{action}</div>;
}

/** Small "Vaccinated / Not vaccinated yet" tag so sitters can see it at a glance. */
function VaxTag({ vaccinated }: { vaccinated: boolean }) {
  return <span className={vaccinated ? "vax-tag yes" : "vax-tag no"}><ShieldCheck size={12} /> {vaccinated ? "Vaccinated" : "Not vaccinated yet"}</span>;
}

// ---------- Modals ----------

function ApplyModal({ request, onClose }: { request: SitterRequest; onClose: () => void }) {
  const { apply, notify, addNotice } = useStore();
  const [note, setNote] = useState("");
  const [available, setAvailable] = useState(false);
  return (
    <Modal onClose={onClose}>
      <span className="eyebrow">Pet sitting request</span>
      <h2>Apply to sit {request.pet}</h2>
      {request.vaccinated !== undefined && <p className={request.vaccinated ? "vax-note yes" : "vax-note no"}><ShieldCheck size={15} /> {request.vaccinated ? `${request.pet} is vaccinated.` : `${request.pet} is not vaccinated yet. Ask the owner in Messages if that matters for your own pets.`}</p>}
      <label className="composer-text"><span>Message to the owner</span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={`Hi! I’d love to look after ${request.pet} because...`} /></label>
      <div className="confirm-block"><span>Please confirm</span><label><input type="checkbox" checked={available} onChange={(event) => setAvailable(event.target.checked)} /> <span>I’m available <strong>{request.date} from {request.time}</strong> and can arrive in {request.area} on time.</span></label></div>
      <button className="primary-button full" disabled={!note.trim() || !available} onClick={() => { apply(request.id, note.trim()); addNotice({ text: `Your application for ${request.pet} was sent to ${firstName(request.owner)}.`, page: "sitters", icon: "applicant" }); notify("Application sent. Track it under Applied."); onClose(); }}>Submit application</button>
      <p className="modal-footnote">The owner will see your profile and message, and you can chat in Messages.</p>
    </Modal>
  );
}

function OwnerReviewModal({ request, onClose }: { request: SitterRequest; onClose: () => void }) {
  const { markDone, notify, updateRequest } = useStore();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const sitter = request.matched || "";
  const finishing = request.status === "Matched";
  return (
    <Modal onClose={onClose}>
      <span className="eyebrow">Complete sitter request</span>
      <h2>How was your experience with {firstName(sitter)}?</h2>
      <p className="modal-lead">Your review helps neighbours choose trusted pet sitters.</p>
      <div className="review-sitter-summary"><PersonAvatar name={sitter} size="lg" /><div><strong>{sitter}</strong><span>Sat {request.pet} on {request.date} · {request.duration}</span></div></div>
      <div className="review-rating"><span>Your rating</span><StarRating value={rating} onChange={setRating} size={25} /></div>
      <label className="composer-text"><span>Review note</span><textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Share what went well and anything other pet owners should know..." /></label>
      <div className="modal-actions">
        <button className="secondary-button" onClick={onClose}>Not now</button>
        <button className="primary-button" disabled={!rating} onClick={() => {
          if (finishing) markDone(request.id, rating); else updateRequest(request.id, { ownerRating: rating });
          notify(finishing ? "Sitting marked as done and your review was posted." : "Thanks! Your review was posted.");
          onClose();
        }}>Submit review</button>
      </div>
    </Modal>
  );
}

function SitterReviewModal({ request, onClose }: { request: SitterRequest; onClose: () => void }) {
  const { reviewOwner, notify } = useStore();
  const [mood, setMood] = useState<"good" | "bad" | null>(null);
  return (
    <Modal onClose={onClose}>
      <span className="eyebrow">Complete sitter request</span>
      <h2>How was your experience with {request.pet}?</h2>
      <p className="modal-lead">Your feedback about {firstName(request.owner)} helps neighbours trust each other.</p>
      <div className="mood-choice">
        <button className={mood === "good" ? "active" : ""} onClick={() => setMood("good")} aria-label="Good experience"><Smile strokeWidth={1.6} />Good</button>
        <button className={mood === "bad" ? "active bad" : ""} onClick={() => setMood("bad")} aria-label="Not a good experience"><Frown strokeWidth={1.6} />Not great</button>
      </div>
      <div className="modal-actions"><button className="secondary-button" onClick={onClose}>Not now</button><button className="primary-button" disabled={!mood} onClick={() => { reviewOwner(request.id, mood!); notify("Thanks for your feedback!"); onClose(); }}>Submit review</button></div>
    </Modal>
  );
}

function DeleteRequestModal({ request, onClose, onDeleted }: { request: SitterRequest; onClose: () => void; onDeleted: () => void }) {
  const { deleteRequest, notify } = useStore();
  const [reason, setReason] = useState("");
  return (
    <Modal onClose={onClose}>
      <span className="eyebrow">Delete request</span>
      <h2>Delete this sitter request?</h2>
      <p className="modal-lead">This removes “{request.title}” and closes {request.applicants.length ? `all ${request.applicants.length} applications` : "the request"}.</p>
      <div className="delete-reason-list"><span>Why are you deleting it?</span>{["No longer need a sitter", "Plans changed", "Found help elsewhere", "Posted by mistake"].map((item) => <button key={item} className={reason === item ? "selected" : ""} onClick={() => setReason(item)}>{reason === item ? <Check size={15} /> : <span></span>}{item}</button>)}</div>
      <div className="modal-actions"><button className="secondary-button" onClick={onClose}>Keep request</button><button className="danger-button" disabled={!reason} onClick={() => { deleteRequest(request.id); notify("Your sitter request was deleted."); onDeleted(); }}><Trash2 size={16} /> Delete request</button></div>
    </Modal>
  );
}

// ---------- Card ----------

function RequestCard({ request, tab, open }: { request: SitterRequest; tab: Tab; open: (id: string, scrollToApplicants?: boolean) => void }) {
  const { applications, openConversation, cancelMatch, notify } = useStore();
  const [reviewing, setReviewing] = useState<"owner" | "sitter" | null>(null);
  const app = applications[request.id];
  const label = tab === "all"
    ? <span className="community-help-label"><Heart size={12} /> Help requested</span>
    : <Badge tone={(tab === "applied" ? app?.status : request.status) === "Done" ? "green" : "blue"}>{tab === "applied" ? app?.status : request.status}</Badge>;
  return (
    <article className="request-card">
      <div className="request-card-photo"><img loading="lazy" src={request.image} alt={request.pet} /><span className="date-tab"><small>{dateParts(request.date)[0]}</small><strong>{dateParts(request.date)[1]}</strong></span></div>
      <div className="request-card-main">
        <div className="request-card-top">{label}<span>{request.posted}</span></div>
        <h3>{request.title}</h3>
        <p className="pet-line"><strong>{request.pet}</strong> · {request.breed} · Posted by {request.owner === ME ? "you" : request.owner}</p>
        {request.vaccinated !== undefined && <VaxTag vaccinated={request.vaccinated} />}
        {tab === "applied" && <p className="request-intro">{request.description.slice(0, 110)}…</p>}
        <Facts request={request} />

        {tab === "mine" && request.status === "Open" && request.cancelled && <StatusNote tone="red" icon={<X size={15} />} title={`Match with ${firstName(request.cancelled)} was cancelled`} text="Your request is open again. Choose another applicant." />}
        {tab === "mine" && request.status === "Matched" && request.matched && <SitterMini name={request.matched} label="Selected sitter" action={<button className="outline-pill" onClick={() => openConversation(request.matched!, "sitting", request.id)}><MessageCircle size={14} /> Send message</button>} />}
        {tab === "mine" && request.status === "Done" && request.matched && <SitterMini name={request.matched} label="Completed with" tone="green" action={request.ownerRating ? <span className="rated-pill"><Star size={13} fill="currentColor" /> You rated {request.ownerRating}</span> : <button className="primary-button small" onClick={() => setReviewing("owner")}><Check size={14} /> Review</button>} />}
        {tab === "applied" && app?.status === "Applied" && <StatusNote tone="blue" icon={<UsersRound size={15} />} title="Application sent" text="The owner will select the applicant." />}
        {tab === "applied" && app?.status === "Matched" && <StatusNote tone="blue" icon={<UsersRound size={15} />} title="Matched with a neighbour" text="You can chat with the owner in Messages." action={<button className="primary-button small" onClick={() => openConversation(request.owner, "sitting", request.id)}><Check size={14} /> Send message</button>} />}
        {tab === "applied" && app?.status === "Done" && <StatusNote tone="green" icon={<CircleCheckBig size={15} />} title="Care completed" text={app.ownerReview ? "Thanks for reviewing this sitting." : "This request is ready for mutual reviews."} action={app.ownerReview ? <span className="rated-pill">{app.ownerReview === "good" ? <Smile size={15} /> : <Frown size={15} />} Reviewed</span> : <button className="primary-button small" onClick={() => setReviewing("sitter")}><Check size={14} /> Review</button>} />}

        <div className="card-footer">
          <span>{tab !== "applied" || app?.status === "Done" ? <><strong>{request.applicants.length}</strong> applicant{request.applicants.length === 1 ? "" : "s"}</> : null}</span>
          <div>
            {tab === "mine" && request.status === "Open" && <button className="secondary-button small" onClick={() => open(request.id, true)}>View applicants</button>}
            <button className="secondary-button small" onClick={() => open(request.id)}>View details</button>
          </div>
        </div>
        {tab === "mine" && request.status === "Matched" && <div className="match-actions"><button className="secondary-button small cancel-match-button" onClick={() => { cancelMatch(request.id); notify(`The match with ${firstName(request.matched || "")} was cancelled. You can choose another sitter.`); }}>Cancel match</button><button className="primary-button small" onClick={() => setReviewing("owner")}><Check size={14} /> Mark done</button></div>}
      </div>
      {reviewing === "owner" && <OwnerReviewModal request={request} onClose={() => setReviewing(null)} />}
      {reviewing === "sitter" && <SitterReviewModal request={request} onClose={() => setReviewing(null)} />}
    </article>
  );
}

// ---------- Detail ----------

function ApplicantCard({ applicant, request, selected, dimmed, onSelect, onChoose }: { applicant: Applicant; request: SitterRequest; selected: boolean; dimmed: boolean; onSelect: () => void; onChoose: () => void }) {
  const { openProfile, openConversation } = useStore();
  const person = findPerson(applicant.name);
  const wasCancelled = request.cancelled === applicant.name;
  return (
    <div className={`applicant-tile${selected ? " selected" : ""}${dimmed ? " dimmed" : ""}`} onClick={onSelect} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") onSelect(); }}>
      <div className="applicant-tile-top">
        <PersonAvatar name={applicant.name} size="md" />
        <div><strong>{applicant.name}</strong><small><Star size={11} fill="currentColor" /> {person.rating} stars ({person.reviews} reviews) · {person.sits} completed sits</small><small>{applicant.applied}{wasCancelled ? " · Match cancelled" : ""}</small><button className="applicant-profile-link" onClick={(event) => { event.stopPropagation(); openProfile(applicant.name); }}>View profile →</button></div>
        {selected && <span className="applicant-check"><Check size={14} /></span>}
      </div>
      <span className="applicant-note-label">Message from {firstName(applicant.name)}</span>
      <div className="applicant-message">{applicant.note}</div>
      <div className="applicant-actions">
        <button className="secondary-button small" onClick={(event) => { event.stopPropagation(); openConversation(applicant.name, "sitting", request.id); }}>Send message</button>
        <button className="primary-button small" disabled={wasCancelled} onClick={(event) => { event.stopPropagation(); onChoose(); }}>Select this sitter</button>
      </div>
    </div>
  );
}

function RequestDetail({ request, back, scrollToApplicants, goToBoard }: { request: SitterRequest; back: () => void; scrollToApplicants: boolean; goToBoard: (tab: Tab, status: string) => void }) {
  const { authenticated, requireAuth, verification, applications, withdraw, openProfile, openConversation, matchSitter, setPage, notify, addNotice, pets } = useStore();
  const petProfile = pets.find((p) => p.id === request.petId); // joined live, like SitterRequest.petId → Pet
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [confirming, setConfirming] = useState("");
  const [congrats, setCongrats] = useState("");
  const [sort, setSort] = useState<"earliest" | "rating">("earliest");
  const applicantsRef = useRef<HTMLElement>(null);
  const mine = authenticated && request.owner === ME;
  const app = applications[request.id];
  useEffect(() => { if (scrollToApplicants) applicantsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [scrollToApplicants]);

  const applicants = [...request.applicants].sort((a, b) => (sort === "rating" ? findPerson(b.name).rating - findPerson(a.name).rating : 0));
  const startApply = () => { if (requireAuth()) setApplyOpen(true); };

  let action: React.ReactNode;
  if (mine) {
    action = request.status === "Open"
      ? <button className="primary-button full" onClick={() => applicantsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>Review applicants ({request.applicants.length})</button>
      : request.status === "Matched" && request.matched ? <button className="primary-button full" onClick={() => openConversation(request.matched!, "sitting", request.id)}><MessageCircle size={16} /> Message {firstName(request.matched)}</button>
        : <div className="aside-status done"><CircleCheckBig size={16} /> Sitting completed</div>;
  } else if (app?.status === "Applied") {
    action = <button className="primary-button full" onClick={() => { withdraw(request.id); notify("Your offer was withdrawn."); }}>Withdraw offer</button>;
  } else if (app?.status === "Matched") {
    action = <button className="primary-button full" onClick={() => openConversation(request.owner, "sitting", request.id)}><MessageCircle size={16} /> Send message</button>;
  } else if (app?.status === "Done" || request.status !== "Open") {
    action = <div className="aside-status">{request.status === "Done" ? "This sitting is complete" : "This request has been matched"}</div>;
  } else {
    action = <>
      <button className="primary-button full" onClick={startApply}>Apply</button>
      {authenticated && verification === "unverified" && <p className="privacy-note"><ShieldCheck size={15} /> Optional: owners often pick neighbours with a verified badge. <button className="text-button inline" onClick={() => setPage("profile")}>Get verified</button></p>}
      {!authenticated && <p className="privacy-note"><ShieldCheck size={15} /> Log in to offer your help.</p>}
    </>;
  }

  return (
    <section className="page-section">
      <button className="back-link" onClick={back}><ArrowLeft size={17} /> Back to sitter board</button>
      <div className="request-detail-layout">
        <div className="request-detail-column">
          <div className="request-detail-main">
            <img loading="lazy" className="request-detail-image" src={request.image} alt={request.pet} />
            <div className="request-detail-content">
              <div className="request-card-top"><span className="community-help-label"><Heart size={12} /> Community help request</span><span>Posted {request.posted}</span></div>
              <h1>{request.title}</h1>
              <div className="detail-facts">
                <div><CalendarDays /><span>Date<strong>{request.date}</strong></span></div>
                <div><Clock /><span>Time<strong>{request.time}</strong></span></div>
                <div><Activity /><span>Duration<strong>{request.duration}</strong></span></div>
                <div><MapPin /><span>Location<strong>{request.area}</strong></span></div>
              </div>
              <h2>About the care request</h2>
              <p className="long-description">{request.description}</p>
              {mine && request.status === "Matched" && request.matched && <div className="unlocked-contacts">
                <SitterMini name={request.matched} label="Selected sitter" action={<button className="outline-pill" onClick={() => openConversation(request.matched!, "sitting", request.id)}><MessageCircle size={14} /> Send message</button>} />
              </div>}
              <div className="request-detail-actions">
                {mine
                  ? <button className="delete-request-button" onClick={() => setDeleteOpen(true)}><Trash2 size={16} /> Delete my request</button>
                  : <button className="report-button" onClick={() => { if (requireAuth()) setReportOpen(true); }}><Flag size={16} /> Report this request</button>}
              </div>
            </div>
          </div>

          {mine && request.status === "Open" && <section className="choose-match" ref={applicantsRef}>
            <h2>Choose the best match for {request.pet}</h2>
            <p>Select an applicant card to review your choice. You can message any applicant before you decide.</p>
            <div className="choose-match-bar"><span className="eyebrow">{request.applicants.length} applicant{request.applicants.length === 1 ? "" : "s"}</span><label>Sort by: <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="earliest">Earliest application</option><option value="rating">Highest rating</option></select></label></div>
            {applicants.length
              ? <div className="applicant-tiles">{applicants.map((a) => <ApplicantCard key={a.name} applicant={a} request={request} selected={selected === a.name} dimmed={Boolean(selected) && selected !== a.name} onSelect={() => setSelected(selected === a.name ? "" : a.name)} onChoose={() => { setSelected(a.name); setConfirming(a.name); }} />)}</div>
              : <EmptyState icon={<UsersRound size={22} />} title="No applicants yet" text="We’ll notify you as soon as a neighbour offers to help." />}
          </section>}
        </div>

        <aside className="request-detail-aside">
          <div className="pet-summary"><img loading="lazy" src={request.image} alt="" /><div><span>Meet</span><h2>{request.pet}</h2><p>{request.petType}</p></div></div>
          <dl><div><dt>Breed</dt><dd>{request.breed}</dd></div><div><dt>Age</dt><dd>{request.age}</dd></div><div><dt>Weight</dt><dd>{request.weight}</dd></div>{request.vaccinated !== undefined && <div><dt>Vaccinated</dt><dd><VaxTag vaccinated={request.vaccinated} /></dd></div>}<div><dt>Applicants</dt><dd>{request.applicants.length} neighbour{request.applicants.length === 1 ? "" : "s"}</dd></div></dl>
          <div className="about-pet">
            <h3>About {request.pet}</h3>
            {petProfile && <p className="about-pet-facts">{petProfile.gender}{petProfile.isNeutered ? ` · ${petProfile.gender === "Female" ? "Spayed" : "Neutered"}` : ""}</p>}
            {petProfile?.notes ? <p>{petProfile.notes}</p> : <p className="muted">{mine ? "You haven’t added care notes yet." : `${firstName(request.owner)} hasn’t added care notes yet.`}</p>}
            {mine && <button className="text-button" onClick={() => setPage("pets")}>{petProfile?.notes ? "Edit care notes in My pets" : "Add care notes in My pets"}</button>}
          </div>
          <button className="owner-line owner-profile-link" onClick={() => openProfile(request.owner)}><PersonAvatar name={request.owner} size="sm" /><div><span>Posted by</span><strong>{mine ? `${request.owner} (you)` : request.owner}</strong></div><ChevronRight size={18} /></button>
          {action}
        </aside>
      </div>

      {applyOpen && <ApplyModal request={request} onClose={() => setApplyOpen(false)} />}
      {reportOpen && <ReportModal target="request" targetId={request.id} subject={request.title} title="Report this request" onClose={() => setReportOpen(false)} />}
      {deleteOpen && <DeleteRequestModal request={request} onClose={() => setDeleteOpen(false)} onDeleted={() => goToBoard("mine", "Open")} />}
      {confirming && <Modal onClose={() => setConfirming("")}>
        <div className="center-modal">
          <h2>Confirm matched</h2>
          <div className="matched-preview"><PersonAvatar name={confirming} size="lg" /><small>Selected sitter</small><strong>{confirming}</strong><em>{findPerson(confirming).sits} completed sits · {findPerson(confirming).rating} stars</em></div>
          <div className="modal-actions center"><button className="secondary-button" onClick={() => { setConfirming(""); setSelected(""); }}>Select other</button><button className="primary-button" onClick={() => { matchSitter(request.id, confirming); addNotice({ text: `${confirming} is confirmed to care for ${request.pet}.`, page: "sitters", icon: "match" }); setCongrats(confirming); setConfirming(""); }}>Confirm</button></div>
        </div>
      </Modal>}
      {congrats && <Modal onClose={() => { setCongrats(""); goToBoard("mine", "Matched"); }}>
        <div className="center-modal">
          <span className="congrats-icon"><CircleCheckBig size={30} /></span>
          <h2>Congratulations</h2>
          <p className="modal-lead">{congrats} will care for {request.pet} on {request.date}. You can plan the details together in Messages.</p>
          <div className="modal-actions center"><button className="secondary-button" onClick={() => openConversation(congrats, "sitting", request.id)}>Send message</button><button className="primary-button" onClick={() => goToBoard("mine", "Matched")}>Go to matched page</button></div>
        </div>
      </Modal>}
    </section>
  );
}

// ---------- Create ----------

/** "Request a sitter" form, shown in a modal over the sitter board. */
function CreateRequestModal({ onClose, viewMine }: { onClose: () => void; viewMine: (id: string) => void }) {
  const { addRequest, notify, pets: allPets } = useStore();
  const pets = allPets.filter((p) => p.owner === ME);
  const [petId, setPetId] = useState(pets[0]?.id || "");
  const [form, setForm] = useState({ date: "", start: "", end: "", duration: "1–2 hours", location: "", title: "", description: "" });
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState("");
  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { setForm({ ...form, [key]: event.target.value }); setError(""); };
  const fmtTime = (value: string) => { if (!value) return ""; const [h, m] = value.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
  const submit = () => {
    if (!form.date || !form.start || !form.end || !form.location.trim() || !form.title.trim() || !form.description.trim()) return setError("Please fill in the date, times, location, title, and care description.");
    const pet = pets.find((p) => p.id === petId);
    if (!pet) return setError("Add a pet in My pets first, then choose it here.");
    const id = `SR-${Date.now().toString().slice(-4)}`;
    addRequest({ id, owner: ME, petId: pet.id, pet: pet.name, petType: pet.species === "dog" ? "Dog" : "Cat", breed: pet.breed || (pet.species === "dog" ? "Dog" : "Cat"), age: petAge(pet.birthDate), vaccinated: pet.isVaccinated, weight: `${pet.weight} kg`, image: pet.imageUrl, title: form.title.trim(), area: form.location.trim(), date: new Date(`${form.date}T12:00`).toLocaleDateString("en-CA", { month: "long", day: "numeric" }), posted: "Just now", time: `${fmtTime(form.start)} – ${fmtTime(form.end)}`, duration: form.duration, description: form.description.trim(), status: "Open", applicants: [] });
    notify("Your sitter request is live.");
    setCreatedId(id);
  };
  if (createdId) return (
    <Modal onClose={onClose}>
      <div className="center-modal">
        <span className="congrats-icon"><CircleCheckBig size={30} /></span>
        <h2>Your sitter request is live</h2>
        <p className="modal-lead">Neighbours can now view your request and apply. We’ll notify you when someone offers to help.</p>
        <div className="modal-actions center"><button className="secondary-button" onClick={onClose}>Back to board</button><button className="primary-button" onClick={() => viewMine(createdId)}>View my request</button></div>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose} wide className="request-modal">
      <span className="eyebrow">New sitter request</span>
      <h2>Who can we care for?</h2>
      <p className="modal-lead">Share your pet’s routine and exactly what kind of help you need.</p>
      <div className="request-form-card in-modal">
        <fieldset><legend>1. Choose your pet</legend><div className="pet-choice">{pets.map((pet) => <button key={pet.id} className={petId === pet.id ? "active" : ""} onClick={() => setPetId(pet.id)}><img loading="lazy" src={pet.imageUrl} alt="" /><span><strong>{pet.name}</strong><small>{pet.breed} · {petAge(pet.birthDate)} · {pet.isVaccinated ? "Vaccinated" : "Not vaccinated yet"}</small></span>{petId === pet.id && <Check size={18} />}</button>)}</div></fieldset>
        <fieldset><legend>2. Date and time</legend><div className="form-grid"><label>Date<input type="date" value={form.date} onChange={set("date")} /></label><label>Duration<select value={form.duration} onChange={set("duration")}><option>Under 1 hour</option><option>1–2 hours</option><option>Half day</option><option>Full day</option><option>Overnight</option></select></label><label>Start time<input type="time" value={form.start} onChange={set("start")} /></label><label>End time<input type="time" value={form.end} onChange={set("end")} /></label></div></fieldset>
        <fieldset><legend>3. Care details</legend><div className="form-grid"><label className="full-field">Location<input value={form.location} onChange={set("location")} placeholder="Neighbourhood, e.g. Kitsilano" /></label><label className="full-field">Title<input value={form.title} onChange={set("title")} placeholder="A clear title for your request" /></label><label className="full-field">Description<textarea value={form.description} onChange={set("description")} placeholder="Care instructions, routines, medication, and what you would like the sitter to do..." /></label></div></fieldset>
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="modal-actions request-modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={submit}>Post sitter request <ArrowRight size={17} /></button></div>
    </Modal>
  );
}

// ---------- Page ----------

export default function SittersPage() {
  const { requests, applications, focus, requireAuth, hiddenNames } = useStore();
  const [view, setView] = useState<"board" | "detail">(focus?.requestId ? "detail" : "board");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState(focus?.requestId || "");
  const [scrollApplicants, setScrollApplicants] = useState(false);
  const [tab, setTab] = useState<Tab>(focus?.boardTab || "all");
  const [status, setStatus] = useState(focus?.boardStatus || "Open");
  const [search, setSearch] = useState("");

  const live = requests.filter((r) => !r.hidden && !hiddenNames.includes(r.owner));
  const allOpen = live.filter((r) => r.status === "Open");
  const mine = live.filter((r) => r.owner === ME);
  const applied = live.filter((r) => applications[r.id]);
  const goToBoard = (nextTab: Tab, nextStatus: string) => { setTab(nextTab); setStatus(nextStatus); setView("board"); window.scrollTo({ top: 0 }); };
  const open = (id: string, toApplicants = false) => { setDetailId(id); setScrollApplicants(toApplicants); setView("detail"); window.scrollTo({ top: 0 }); };

  const detail = requests.find((r) => r.id === detailId);
  if (view === "detail" && detail) return <RequestDetail key={detail.id} request={detail} back={() => setView("board")} scrollToApplicants={scrollApplicants} goToBoard={goToBoard} />;

  const base = tab === "all" ? allOpen : tab === "mine" ? mine.filter((r) => r.status === status) : applied.filter((r) => applications[r.id].status === status);
  const cards = base.filter((r) => `${r.pet} ${r.breed} ${r.area} ${r.title}`.toLowerCase().includes(search.toLowerCase()));
  const startCreate = () => { if (requireAuth()) setCreateOpen(true); };
  const emptyCopy: Record<string, [string, string]> = {
    all: ["No open requests", "Check back soon. New requests from neighbours appear here."],
    "mine-Open": ["No open requests", "Post a request and neighbours can offer to help."],
    "mine-Matched": ["No matched requests", "Requests move here after you confirm a sitter."],
    "mine-Done": ["No completed requests", "Finished sittings appear here so you can leave a review."],
    "applied-Applied": ["No pending applications", "Browse All requests to offer your help."],
    "applied-Matched": ["No matches yet", "When an owner picks you, the request appears here."],
    "applied-Done": ["No completed sittings", "Finished sittings appear here for mutual reviews."],
  };
  const [emptyTitle, emptyText] = emptyCopy[tab === "all" ? "all" : `${tab}-${status}`];

  return (
    <section className="page-section">
      <div className="page-title-row">
        <div><span className="eyebrow">Neighbourhood care network</span><h1>Sitter board</h1><p>Pet owners post care requests. Local sitters apply to help.</p></div>
        <button className="primary-button" onClick={startCreate}><Plus size={18} /> Request a sitter</button>
      </div>
      {createOpen && <CreateRequestModal onClose={() => setCreateOpen(false)} viewMine={(id) => { setCreateOpen(false); open(id); }} />}
      <div className="board-tabs">
        <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>All requests <span>{allOpen.length}</span></button>
        <button className={tab === "mine" ? "active" : ""} onClick={() => { if (!requireAuth()) return; setTab("mine"); setStatus("Open"); }}>My requests <span>{mine.length}</span></button>
        <button className={tab === "applied" ? "active" : ""} onClick={() => { if (!requireAuth()) return; setTab("applied"); setStatus("Applied"); }}>Applied <span>{applied.length}</span></button>
      </div>
      <div className="board-filter-row"><div className="search-field"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search sitter requests" placeholder="Search current requests by pet or neighbourhood..." /></div></div>
      {tab !== "all" && <div className="status-filter-row"><span>{tab === "mine" ? "Request status" : "Application status"}</span>{(tab === "mine" ? ["Open", "Matched", "Done"] : ["Applied", "Matched", "Done"]).map((s) => <button key={s} className={status === s ? "active" : ""} onClick={() => setStatus(s)}>{s}</button>)}</div>}
      {cards.length
        ? <div className="request-list board-request-list">{cards.map((r) => <RequestCard key={r.id} request={r} tab={tab} open={open} />)}</div>
        : <EmptyState icon={<Heart size={22} />} title={emptyTitle} text={emptyText} />}
    </section>
  );
}
