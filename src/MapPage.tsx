import { useState } from "react";
import { ArrowLeft, ArrowRight, Beer, ChevronRight, Clock, Coffee, Compass, Flag, Heart, HeartPulse, Hotel, ImagePlus, MapPin, Mountain, MoreVertical, Plus, Star, Store, Trees, X } from "lucide-react";
import { Place, SpotCategory } from "./data";
import { useStore } from "./store";
import { PersonAvatar, ReportModal, StarRating } from "./ui";

export const mapCategories: { name: SpotCategory; color: string; icon: typeof Trees }[] = [
  // Earthy, avocado-led set. Each colour keeps at least 3:1 against white for map pins.
  { name: "Parks & Off-Leash", color: "#568203", icon: Trees },
  { name: "Cafes & Restaurants", color: "#B7791F", icon: Coffee },
  { name: "Pubs & Breweries", color: "#8A5A2B", icon: Beer },
  { name: "Retail & Shops", color: "#B8664A", icon: Store },
  { name: "Pet Services", color: "#3B7DB5", icon: HeartPulse },
  { name: "Hotels", color: "#7A5BB0", icon: Hotel },
  { name: "Hiking Trails", color: "#354F05", icon: Mountain },
];
export const categoryColor = (name: string) => mapCategories.find((c) => c.name === name)?.color || "#568203";
const average = (place: Place) => (place.reviews.length ? place.reviews.reduce((sum, r) => sum + r.rating, 0) / place.reviews.length : place.rating);

export function MapCanvas({ places, selected, onSelect, onDetails, showPopup = true }: { places: Place[]; selected?: Place; onSelect: (place: Place) => void; onDetails?: (place: Place) => void; showPopup?: boolean }) {
  const [zoom, setZoom] = useState(1);
  const [located, setLocated] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const useLocation = () => {
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(() => setLocated(true), () => setLocated(true));
    else setLocated(true);
  };
  return (
    <div className="map-canvas interactive-map" onPointerDown={(event) => { if ((event.target as HTMLElement).closest("button")) return; event.currentTarget.setPointerCapture(event.pointerId); setDragStart({ x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }); }} onPointerMove={(event) => { if (dragStart) setPan({ x: dragStart.panX + event.clientX - dragStart.x, y: dragStart.panY + event.clientY - dragStart.y }); }} onPointerUp={() => setDragStart(null)}>
      <div className="map-stage" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
        <div className="map-water"></div><div className="road road-one"></div><div className="road road-two"></div><div className="road road-three"></div><div className="park-shape"></div>
        <span className="map-label label-downtown">DOWNTOWN</span><span className="map-label label-park">STANLEY PARK</span><span className="map-label label-harbour">COAL HARBOUR</span>
        {places.map((place) => { const color = categoryColor(place.category); const active = selected?.id === place.id; return <button key={place.id} className={active ? "map-pin active" : "map-pin"} style={{ left: `${place.x}%`, top: `${place.y}%`, color: active ? "white" : color, background: active ? color : "white" }} onClick={() => onSelect(place)} aria-label={place.name}><MapPin size={21} fill="currentColor" />{place.sponsored && <i className="pin-ad">AD</i>}</button>; })}
        {located && <div className="user-location-pin"><span></span></div>}
      </div>
      <div className="map-controls"><button className="location-control" onClick={useLocation}><Compass size={17} /> {located ? "Location on" : "Use my location"}</button><div><button onClick={() => setZoom((value) => Math.min(1.6, value + 0.1))} aria-label="Zoom in"><Plus /></button><span>{Math.round(zoom * 100)}%</span><button onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))} aria-label="Zoom out">−</button></div></div>
      <div className="map-hint">Drag to move · Use controls to zoom</div>
      {showPopup && selected && <div className="map-popup place-popup">
        <img loading="lazy" src={selected.image} alt="" />
        <div>
          <div className="place-badges">{selected.sponsored && <span className="sponsored-tag">Sponsored</span>}<span className="place-category" style={{ color: categoryColor(selected.category) }}>{selected.category}</span></div>
          <h3>{selected.name}</h3><p>{selected.address}</p>
          <div className="place-rating"><Star size={13} fill="currentColor" /> <strong>{average(selected).toFixed(1)}</strong> <span>({selected.reviews.length} review{selected.reviews.length === 1 ? "" : "s"})</span></div>
          <div className="place-hours"><i></i>{selected.hours}</div>
          {onDetails && <button className="text-button" onClick={() => onDetails(selected)}>View place details <ArrowRight size={15} /></button>}
        </div>
      </div>}
    </div>
  );
}

function PlaceDetail({ place, back }: { place: Place; back: () => void }) {
  const { authenticated, requireAuth, addPlaceReview, toggleReviewLike, likedReviews, notify } = useStore();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const avg = average(place);
  const counts = [5, 4, 3, 2, 1].map((star) => place.reviews.filter((r) => r.rating === star).length);
  const submit = () => {
    if (!requireAuth()) return;
    addPlaceReview(place.id, { rating, text: text.trim(), photo: photo || undefined });
    setRating(0); setText(""); setPhoto("");
    notify("Thanks! Your review was posted.");
  };
  return (
    <section className="page-section place-detail-page">
      <button className="back-link" onClick={back}><ArrowLeft size={17} /> Back to map</button>
      <div className="place-detail-layout">
        <div className="place-detail-main">
          <img loading="lazy" className="place-hero" src={place.image} alt={place.name} />
          <div className="place-title-row">
            <div>
              <div className="place-badges">{place.sponsored && <span className="sponsored-tag">Sponsored</span>}<span className="place-category" style={{ color: categoryColor(place.category) }}>{place.category}</span></div>
              <h1>{place.name}</h1>
              <p className="place-address"><MapPin size={15} /> {place.address}</p>
            </div>
            <div className="post-menu-wrap">
              <p className="post-date">Last updated 2 hours ago</p>
              {/* <button className="post-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Place actions"><MoreVertical size={18} /></button> */}
              {/* {menuOpen && <div className="post-menu"><button onClick={() => { setMenuOpen(false); if (requireAuth()) setReporting(true); }}><Flag size={14} /> Report this place</button></div>} */}
            </div>
          </div>
          <div className="place-meta"><span><Star size={15} fill="currentColor" /> <strong>{avg.toFixed(1)}</strong> ({place.reviews.length} reviews)</span><span><Clock size={15} /> {place.hours}</span></div>
          <p className="long-description">{place.description}</p>

          <section className="place-reviews">
            <h2>Pet parents reviews</h2>
            <div className="rating-summary">
              <div><strong>{avg.toFixed(1)}</strong><StarRating value={Math.round(avg)} size={14} /><span>{place.reviews.length} review{place.reviews.length === 1 ? "" : "s"}</span></div>
              <div className="rating-bars">{[5, 4, 3, 2, 1].map((star, i) => { const pct = place.reviews.length ? Math.round((counts[i] / place.reviews.length) * 100) : 0; return <div key={star}><span>{star} <Star size={11} /></span><i><b style={{ width: `${pct}%` }}></b></i><em>{pct}%</em></div>; })}</div>
            </div>

            <div className="write-review">
              <strong>Write a review</strong>
              <StarRating value={rating} onChange={(value) => { if (requireAuth()) setRating(value); }} />
              <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Share your experience..." disabled={!authenticated} />
              {photo && <div className="review-photo-preview"><img loading="lazy" src={photo} alt="Your upload" /><button onClick={() => setPhoto("")} aria-label="Remove photo"><X size={13} /></button></div>}
              <div className="write-review-actions">
                <label className={authenticated ? "add-photo" : "add-photo disabled"}><ImagePlus size={15} /> Add photo<input type="file" accept="image/*" disabled={!authenticated} onChange={(event) => { const file = event.target.files?.[0]; if (file) setPhoto(URL.createObjectURL(file)); }} /></label>
                {authenticated
                  ? <button className="primary-button small" disabled={!rating || !text.trim()} onClick={submit}>Post review</button>
                  : <button className="primary-button small" onClick={() => requireAuth()}>Sign in to review</button>}
              </div>
            </div>

            <div className="place-review-list">
              {place.reviews.length ? place.reviews.map((review) => { const liked = likedReviews.includes(`${place.id}-${review.id}`); return (
                <article key={review.id}>
                  <div className="place-review-head"><PersonAvatar name={review.author} size="sm" /><div><strong>{review.author}</strong><StarRating value={review.rating} size={12} /></div><span>{review.date}</span></div>
                  <p>{review.text}</p>
                  {review.photo && <img loading="lazy" src={review.photo} alt="Review" />}
                  <button className={liked ? "review-like liked" : "review-like"} onClick={() => { if (requireAuth()) toggleReviewLike(place.id, review.id); }} aria-pressed={liked}><Heart size={14} fill={liked ? "currentColor" : "none"} /> {review.likes}</button>
                </article>
              ); }) : <p className="muted">No reviews yet. Be the first to share how pet-friendly it is.</p>}
            </div>
          </section>
        </div>
        <aside className="place-detail-aside">
          <MapCanvas places={[place]} selected={place} onSelect={() => undefined} showPopup={false} />
          <div className="place-aside-card"><span className="eyebrow">Getting there</span><strong>{place.address}</strong><span>{place.hours}</span><button className="report-button" onClick={() => { if (requireAuth()) setReporting(true); }}><Flag size={15} /> Report incorrect info</button></div>
        </aside>
      </div>
      {reporting && <ReportModal target="place" targetId={String(place.id)} subject={place.name} title="Report this place" onClose={() => setReporting(false)} />}
    </section>
  );
}

export default function MapPage() {
  const { places, focus } = useStore();
  const visible = places.filter((p) => !p.hidden);
  const [category, setCategory] = useState<"All" | SpotCategory>("All");
  const [selectedId, setSelectedId] = useState(focus?.placeId || visible[0]?.id);
  const [detailId, setDetailId] = useState<number | null>(focus?.placeId ?? null);
  const filtered = category === "All" ? visible : visible.filter((p) => p.category === category);
  const selected = filtered.find((p) => p.id === selectedId) || filtered[0];
  const detail = visible.find((p) => p.id === detailId);
  if (detail) return <PlaceDetail place={detail} back={() => setDetailId(null)} />;
  const chooseCategory = (name: "All" | SpotCategory) => { setCategory(name); const first = name === "All" ? visible[0] : visible.find((p) => p.category === name); if (first) setSelectedId(first.id); };
  const openDetails = (place: Place) => { setDetailId(place.id); window.scrollTo({ top: 0 }); };
  return (
    <section className="map-page">
      <div className="map-list-panel">
        <div className="map-list-header">
          <span className="eyebrow">Pet-friendly Vancouver</span><h1>Places for every adventure</h1><p>Select a category or a place to locate it on the map.</p>
          <div className="map-category-list">
            <button className={category === "All" ? "active" : ""} onClick={() => chooseCategory("All")}><Compass size={16} /><span>All places</span><strong>{visible.length}</strong></button>
            {mapCategories.map((item) => { const Icon = item.icon; return <button className={category === item.name ? "active" : ""} key={item.name} onClick={() => chooseCategory(item.name)}><span className="category-dot" style={{ background: item.color }}><Icon size={14} /></span><span>{item.name}</span><strong>{visible.filter((p) => p.category === item.name).length}</strong></button>; })}
          </div>
        </div>
        <div className="map-place-list">
          {filtered.length ? filtered.map((spot) => <div className={selected?.id === spot.id ? "map-place-card selected" : "map-place-card"} key={spot.id} onClick={() => setSelectedId(spot.id)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") setSelectedId(spot.id); }}>
            <img loading="lazy" src={spot.image} alt="" />
            <div><span className="place-category" style={{ color: categoryColor(spot.category) }}>{spot.category}</span><h3>{spot.name}</h3><p>{spot.address}</p><span className="place-rating small"><Star size={11} fill="currentColor" /> {average(spot).toFixed(1)} · {spot.reviews.length} reviews</span></div>
            <button className="icon-button" onClick={(event) => { event.stopPropagation(); openDetails(spot); }} aria-label={`Open ${spot.name} details`}><ChevronRight size={18} /></button>
          </div>) : <p className="muted map-empty">No places in this category yet.</p>}
        </div>
      </div>
      <MapCanvas places={filtered} selected={selected} onSelect={(p) => setSelectedId(p.id)} onDetails={openDetails} />
    </section>
  );
}
