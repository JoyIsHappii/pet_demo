import { useEffect, useState } from "react";
import { Check, CircleCheckBig, Edit3, Flag, ImagePlus, MapPin, MessageCircle, MoreVertical, PawPrint, Plus, Send, Trash2 } from "lucide-react";
import { CommunityPost, firstName, ME, photos } from "./data";
import { useStore } from "./store";
import { EmptyState, Modal, PersonAvatar, ReportModal } from "./ui";
import SideRail from "./Rail";

/** Mark as found: one pop-up that asks first, then celebrates in place. Used in Community and Messages. */
export function FoundPetModal({ post, onClose }: { post: CommunityPost; onClose: () => void }) {
  const { markFound, pets, conversations } = useStore();
  const [step, setStep] = useState<"confirm" | "done">("confirm");
  const petName = post.pet.split(",")[0].trim() || "your pet";
  const profile = pets.find((p) => p.owner === post.author && p.name === petName);
  const pronoun = profile ? (profile.gender === "Female" ? "she’s" : "he’s") : "they’re";
  const helpers = [...new Set(conversations.filter((c) => c.context === "lost" && c.ref === String(post.id)).map((c) => firstName(c.with)))];
  const thanks = helpers.length > 1 ? `${helpers.slice(0, -1).join(", ")} and ${helpers[helpers.length - 1]}` : helpers[0];

  if (step === "done") return (
    <Modal onClose={onClose}>
      <div className="center-modal found-modal">
        <span className="found-photo"><img src={post.image} alt="" /><i><Check size={16} /></i></span>
        <h2>Welcome home, {petName}!</h2>
        <p className="modal-lead">{thanks ? `Thank you to ${thanks} for helping ${petName} get home.` : `Thank you to every neighbour who kept an eye out for ${petName}.`} Your alert now shows <strong>Pet found</strong>.</p>
        <button className="primary-button" onClick={onClose}>Done</button>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose}>
      <div className="center-modal found-modal">
        <span className="found-photo"><img src={post.image} alt="" /></span>
        <h2>Is {petName} home safe?</h2>
        <ul className="found-effects">
          <li><CircleCheckBig size={16} /> The alert changes to <strong>Pet found</strong></li>
          <li><Flag size={16} /> It leaves the Lost and Found tab</li>
          <li><MessageCircle size={16} /> Chats about it move to Archive</li>
        </ul>
        <div className="modal-actions center"><button className="secondary-button" onClick={onClose}>Not yet</button><button className="primary-button" onClick={() => { markFound(post.id); setStep("done"); }}>Yes, {pronoun} home</button></div>
      </div>
    </Modal>
  );
}

export function PostCard({ post, compact = false }: { post: CommunityPost; compact?: boolean }) {
  const { authenticated, pawed, togglePaw, requireAuth, openProfile, openConversation, deletePost, notify } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [foundOpen, setFoundOpen] = useState(false);
  const mine = authenticated && post.author === ME;
  const hasPaw = pawed.includes(post.id);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuOpen]);

  const cardClass = post.status === "lost" ? "post-card lost-post" : post.status === "found" ? "post-card found-post" : "post-card";
  return (
    <article className={cardClass}>
      {post.status === "lost" && <div className="lost-alert"><span><Flag size={14} /> {mine ? "Lost pet alert" : "Lost and found alert"}</span>{mine && <button onClick={() => setFoundOpen(true)}><Check size={13} /> Mark as found</button>}</div>}
      {post.status === "found" && <div className="lost-alert found-alert"><span><CircleCheckBig size={14} /> Pet found · Reunited</span></div>}
      <div className="post-author featured-post-author">
        <button className="avatar-link" onClick={() => openProfile(post.author)} aria-label={`Open ${post.author}’s profile`}><PersonAvatar name={post.author} /></button>
        <div><button className="author-link" onClick={() => openProfile(post.author)}>{firstName(post.author)}</button><span>{post.location} · {post.date}</span></div>
        {!compact && <div className="post-menu-wrap">
          <button className="post-menu-button" onClick={(event) => { event.stopPropagation(); setMenuOpen(!menuOpen); }} aria-label="Post actions"><MoreVertical size={17} /></button>
          {menuOpen && <div className="post-menu" onClick={(event) => event.stopPropagation()}>
            {mine
              ? <><button onClick={() => { setEditing(true); setMenuOpen(false); }}><Edit3 size={14} /> Edit</button><button className="danger" onClick={() => { setConfirmDelete(true); setMenuOpen(false); }}><Trash2 size={14} /> Delete</button></>
              : <button onClick={() => { setMenuOpen(false); if (requireAuth()) setReporting(true); }}><Flag size={14} /> Report</button>}
          </div>}
        </div>}
      </div>
      <img loading="lazy" className="post-image featured-post-image" src={post.image} alt={post.caption} />
      <div className="post-body featured-post-body">
        <div className="post-paws-row">
          <button className={hasPaw ? "paw-action selected" : "paw-action"} aria-pressed={hasPaw} aria-label="React with a paw" onClick={() => { if (requireAuth()) togglePaw(post.id); }}><PawPrint size={18} fill={hasPaw ? "currentColor" : "none"} /></button>
          <span><strong>{post.likes + (hasPaw ? 1 : 0)}</strong> Paws</span>
        </div>
        <p className="featured-post-caption"><strong>{firstName(post.author)}</strong> {post.caption}</p>
        {post.status === "lost" && !mine && <button className="primary-button full found-pet-button" onClick={() => openConversation(post.author, "lost", String(post.id), `Hi ${firstName(post.author)}! I think send message. `)}><Send size={16} /> send message</button>}
      </div>
      {foundOpen && <FoundPetModal post={post} onClose={() => setFoundOpen(false)} />}
      {reporting && <ReportModal target="post" targetId={String(post.id)} subject={`${post.author}’s post`} title="Report post" onClose={() => setReporting(false)} />}
      {editing && <PostComposer existing={post} onClose={() => setEditing(false)} />}
      {confirmDelete && <Modal onClose={() => setConfirmDelete(false)}>
        <span className="eyebrow">Delete post</span>
        <h2>Delete this post?</h2>
        <p className="modal-lead">It will be removed from Community and your profile. This cannot be undone.</p>
        <div className="modal-actions"><button className="secondary-button" onClick={() => setConfirmDelete(false)}>Keep post</button><button className="danger-button" onClick={() => { deletePost(post.id); setConfirmDelete(false); notify("Your post was deleted."); }}><Trash2 size={16} /> Delete</button></div>
      </Modal>}
    </article>
  );
}

export function PostComposer({ existing, onClose }: { existing?: CommunityPost; onClose: () => void }) {
  const { addPost, updatePost, notify } = useStore();
  const [image, setImage] = useState(existing?.image || "");
  const [caption, setCaption] = useState(existing?.caption || "");
  const [location, setLocation] = useState(existing?.location || "");
  const [type, setType] = useState<"normal" | "lost" | null>(existing ? (existing.status === "lost" ? "lost" : "normal") : null);
  const [error, setError] = useState("");
  const submit = () => {
    if (!type) return setError("Choose Normal or Lost pet before posting.");
    if (!caption.trim()) return setError("Write a few words about your photo.");
    const status = type === "lost" ? "lost" : existing?.status === "found" ? "found" : "normal";
    if (existing) {
      updatePost(existing.id, { image: image || existing.image, caption, location, status });
      notify("Your post was updated.");
    } else {
      addPost({ image: image || photos.dog2, caption, location: location || "Vancouver", status, pet: "" });
      notify(type === "lost" ? "Lost pet alert published to the community." : "Your post is now live.");
    }
    onClose();
  };
  return (
    <Modal onClose={onClose} wide>
      <span className="eyebrow">{existing ? "Edit post" : "New community post"}</span>
      <h2>{existing ? "Update your post" : "Share with your neighbours"}</h2>
      <div className="post-composer-user"><PersonAvatar name={ME} /><div><strong>{ME}</strong><span>Posting to Avancado Community</span></div></div>
      <label className={image ? "composer-photo-main has-image" : "composer-photo-main"}>
        {image ? <img loading="lazy" src={image} alt="Selected" /> : <><ImagePlus size={30} /><strong>Add a photo</strong><span>Choose a clear JPG or PNG from your device</span></>}
        <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) setImage(URL.createObjectURL(file)); }} />
      </label>
      <label className="composer-text"><textarea value={caption} onChange={(event) => { setCaption(event.target.value); setError(""); }} placeholder="Write something about this photo..." /></label>
      <div className="composer-fields"><label><MapPin size={17} /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Add location" /></label></div>
      <div className="compact-post-type"><span>Post as</span>
        <button className={type === "normal" ? "active" : ""} onClick={() => { setType("normal"); setError(""); }}><MessageCircle size={14} /> Community Post</button>
        <button className={type === "lost" ? "active lost" : "lost"} onClick={() => { setType("lost"); setError(""); }}><Flag size={14} /> Lost and Found</button>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={submit}><Send size={17} /> {existing ? "Save" : "Post"}</button></div>
    </Modal>
  );
}

export default function CommunityPage() {
  const { posts, hiddenNames, requireAuth, authenticated } = useStore();
  const [filter, setFilter] = useState<"all" | "lost">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const visible = posts.filter((post) => !post.hidden && !hiddenNames.includes(post.author));
  const lost = visible.filter((post) => post.status === "lost");
  const shown = filter === "lost" ? lost : visible;
  return (
    <section className="page-section page-with-rail">
      <div className="feed-column">
        <div className="feed-head"><h1>Community</h1><p>Everyday moments, local tips, and lost pet alerts from your neighbours.</p></div>
        <button className="composer-prompt" onClick={() => { if (requireAuth()) setCreateOpen(true); }}>
          {authenticated ? <PersonAvatar name={ME} /> : <span className="composer-prompt-icon"><ImagePlus size={18} /></span>}
          <span>Share a moment or a lost pet alert…</span>
          <span className="primary-button small"><Plus size={16} /> Create post</span>
        </button>
        <div className="community-filters">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Latest <span>{visible.length}</span></button>
          <button className={filter === "lost" ? "active lost" : "lost"} onClick={() => setFilter("lost")}><Flag size={15} /> Lost and Found <span>{lost.length}</span></button>
        </div>
        {shown.length
          ? <div className="feed-grid">{shown.map((post) => <PostCard key={post.id} post={post} />)}</div>
          : <EmptyState icon={<PawPrint size={24} />} title={filter === "lost" ? "No lost pets right now" : "No posts yet"} text={filter === "lost" ? "Every pet in the neighbourhood is accounted for. Fingers crossed it stays that way!" : "Be the first to share a moment with your neighbours."} />}
      </div>
      <SideRail />
      {createOpen && <PostComposer onClose={() => setCreateOpen(false)} />}
    </section>
  );
}
