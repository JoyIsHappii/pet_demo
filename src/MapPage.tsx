import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Beer, ChevronRight, Clock, Coffee, Flag, Heart, HeartPulse, Hotel, ImagePlus, LocateFixed, MapPin, Minus, Mountain, MoreVertical, Plus, Search, Star, Store, Trees, X, History, AlertTriangle } from "lucide-react";
import { isoDay, Place, SpotCategory } from "./data";
import { useStore } from "./store";
import { PersonAvatar, ReportModal, StarRating } from "./ui";

/** Categories with the short labels used on chips, list rows and pins. */
export const mapCategories: { name: SpotCategory; label: string; icon: typeof Trees }[] = [
  { name: "Parks & Off-Leash", label: "Parks", icon: Trees },
  { name: "Cafes & Restaurants", label: "Cafés", icon: Coffee },
  { name: "Pubs & Breweries", label: "Pubs", icon: Beer },
  { name: "Retail & Shops", label: "Shops", icon: Store },
  { name: "Pet Services", label: "Pet services", icon: HeartPulse },
  { name: "Hotels", label: "Stays", icon: Hotel },
  { name: "Hiking Trails", label: "Trails", icon: Mountain },
];
const categoryOf = (name: string) => mapCategories.find((c) => c.name === name) || mapCategories[0];
/** All categories share the brand colour; the icon tells them apart. */
export const categoryColor = (_name: string) => "var(--olive-dark)";
const average = (place: Place) => (place.reviews.length ? place.reviews.reduce((sum, r) => sum + r.rating, 0) / place.reviews.length : place.rating);

/* ---------------------------------------------------------------------------
   MOCK MAP — design mock-up only.
   A static picture made from Esri "Light Gray Canvas" tiles (base + labels,
   no API key) at zoom 13, with pins placed from each place's real
   latitude / longitude. Production must use a properly licensed provider
   chosen by development (Esri basemaps need an ArcGIS account in production).
   Development replaces this one component with the real map (e.g. Leaflet).
   Keep: the same props, the pin design (see .map-pin in index.css), the
   tap-to-select behaviour, gliding to the selected place, the location and
   zoom controls, the place popup, and the attribution line.
   See "Map spec" in HANDOFF.md.
--------------------------------------------------------------------------- */
const TILE = 256;
const Z = 13;
const WORLD = TILE * 2 ** Z;
const lngToX = (lng: number) => ((lng + 180) / 360) * WORLD;
const latToY = (lat: number) => { const r = (lat * Math.PI) / 180; return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * WORLD; };
// Area covered by the mock picture: Point Grey / UBC to Commercial Drive, False Creek to Coal Harbour.
const BOUNDS = { west: -123.245, east: -123.045, north: 49.302, south: 49.238 };
const X0 = Math.floor(lngToX(BOUNDS.west) / TILE), X1 = Math.floor(lngToX(BOUNDS.east) / TILE);
const Y0 = Math.floor(latToY(BOUNDS.north) / TILE), Y1 = Math.floor(latToY(BOUNDS.south) / TILE);
const TILES = Array.from({ length: (X1 - X0 + 1) * (Y1 - Y0 + 1) }, (_, i) => ({ x: X0 + (i % (X1 - X0 + 1)), y: Y0 + Math.floor(i / (X1 - X0 + 1)) }));
const W = (X1 - X0 + 1) * TILE, H = (Y1 - Y0 + 1) * TILE;
/** Position of a lat/lng inside the mock picture, in pixels at zoom 1. */
const toWorld = (lat: number, lng: number) => ({ x: lngToX(lng) - X0 * TILE, y: latToY(lat) - Y0 * TILE });
const ZOOMS = [0.75, 1, 1.25, 1.5];
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas";
const MY_LOCATION = { lat: 49.2685, lng: -123.1555 }; // mock "you are here" in Kitsilano

export function MapCanvas({ places, selected, onSelect, onDetails, showPopup = true }: { places: Place[]; selected?: Place; onSelect: (place: Place) => void; onDetails?: (place: Place) => void; showPopup?: boolean }) {
  const [zoomIndex, setZoomIndex] = useState(showPopup ? 0 : 1); // full map starts zoomed out to show every place
  const zoom = ZOOMS[zoomIndex];
  const [located, setLocated] = useState(false);
  // Start on the selected place when the map is a small preview, otherwise frame all places.
  const [center, setCenter] = useState(() => {
    if (selected && !showPopup) return toWorld(selected.latitude, selected.longitude);
    const pts = places.map((p) => toWorld(p.latitude, p.longitude));
    if (!pts.length) return { x: W / 2, y: H / 2 };
    return { x: (Math.min(...pts.map((p) => p.x)) + Math.max(...pts.map((p) => p.x))) / 2, y: (Math.min(...pts.map((p) => p.y)) + Math.max(...pts.map((p) => p.y))) / 2 };
  });
  const [drag, setDrag] = useState<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 800, h: 500 });
  useEffect(() => {
    const el = boxRef.current; if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  // Never scroll past the edge of the mock picture.
  const clamp = (c: { x: number; y: number }) => {
    const hw = box.w / 2 / zoom, hh = box.h / 2 / zoom;
    return { x: W <= hw * 2 ? W / 2 : Math.min(W - hw, Math.max(hw, c.x)), y: H <= hh * 2 ? H / 2 : Math.min(H - hh, Math.max(hh, c.y)) };
  };
  const view = clamp(center);
  // Glide to a newly selected place, like a real map focusing a result.
  const lastSelected = useRef(selected?.id);
  useEffect(() => {
    if (selected?.id === lastSelected.current) return;
    lastSelected.current = selected?.id;
    if (selected) setCenter(toWorld(selected.latitude, selected.longitude));
  }, [selected?.id]);
  const useLocation = () => {
    const go = () => { setLocated(true); setCenter(toWorld(MY_LOCATION.lat, MY_LOCATION.lng)); };
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(go, go); else go();
  };
  const screen = (lat: number, lng: number) => { const p = toWorld(lat, lng); return { left: (p.x - view.x) * zoom, top: (p.y - view.y) * zoom }; };
  const me = screen(MY_LOCATION.lat, MY_LOCATION.lng);
  return (
    <div ref={boxRef} className={drag ? "map-canvas is-dragging" : "map-canvas"}
      onPointerDown={(e) => { if ((e.target as HTMLElement).closest("button, a, .map-popup")) return; e.currentTarget.setPointerCapture(e.pointerId); setDrag({ x: e.clientX, y: e.clientY, cx: view.x, cy: view.y }); }}
      onPointerMove={(e) => { if (!drag) return; setCenter(clamp({ x: drag.cx - (e.clientX - drag.x) / zoom, y: drag.cy - (e.clientY - drag.y) / zoom })); }}
      onPointerUp={() => setDrag(null)}>
      <div className="map-tiles" style={{ width: W, height: H, transform: `translate(${-view.x * zoom}px, ${-view.y * zoom}px) scale(${zoom})` }} aria-hidden="true">
        {TILES.map((t) => <img key={`b${t.x}-${t.y}`} src={`${ESRI}/World_Light_Gray_Base/MapServer/tile/${Z}/${t.y}/${t.x}`} alt="" draggable={false} style={{ left: (t.x - X0) * TILE, top: (t.y - Y0) * TILE }} />)}
        {TILES.map((t) => <img key={`l${t.x}-${t.y}`} className="map-labels" src={`${ESRI}/World_Light_Gray_Reference/MapServer/tile/${Z}/${t.y}/${t.x}`} alt="" draggable={false} style={{ left: (t.x - X0) * TILE, top: (t.y - Y0) * TILE }} />)}
      </div>
      <div className="map-pins">
        {places.map((place) => { const Icon = categoryOf(place.category).icon; const active = selected?.id === place.id; return (
          <button key={place.id} className={active ? "map-pin active" : "map-pin"} style={screen(place.latitude, place.longitude)} onClick={() => onSelect(place)} aria-label={`${place.name}, ${categoryOf(place.category).label}`} aria-pressed={active} title={place.name}>
            <span><Icon size={active ? 18 : 15} /></span>{place.sponsored && <i className="pin-sponsored" aria-hidden="true"></i>}
          </button>
        ); })}
        {located && <div className="user-location-pin" style={me}><span></span></div>}
      </div>
      <div className="map-controls">
        <button className={located ? "map-ctrl active" : "map-ctrl"} onClick={useLocation} aria-label="Use my location" title="Use my location"><LocateFixed size={18} /></button>
        <div className="map-zoom"><button className="map-ctrl" onClick={() => setZoomIndex((i) => Math.min(ZOOMS.length - 1, i + 1))} disabled={zoomIndex === ZOOMS.length - 1} aria-label="Zoom in"><Plus size={18} /></button><button className="map-ctrl" onClick={() => setZoomIndex((i) => Math.max(0, i - 1))} disabled={zoomIndex === 0} aria-label="Zoom out"><Minus size={18} /></button></div>
      </div>
      <div className="map-attribution">Mock map · Tiles © <a href="https://www.esri.com" target="_blank" rel="noreferrer">Esri</a> — Esri, HERE, Garmin, © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors</div>
      {showPopup && selected && <div className="map-popup place-popup">
        <img loading="lazy" src={selected.image} alt="" />
        <div>
          <div className="place-badges">{selected.sponsored && <span className="sponsored-tag">Sponsored</span>}<span className="place-category">{categoryOf(selected.category).label}</span></div>
          <h3>{selected.name}</h3><p>{selected.address}</p>
          <div className="place-rating"><Star size={13} fill="currentColor" /> <strong>{average(selected).toFixed(1)}</strong> <span>({selected.reviews.length} review{selected.reviews.length === 1 ? "" : "s"})</span></div>
          <div className="place-hours"><i></i>{selected.hours}</div>
          {onDetails && <button className="text-button" onClick={() => onDetails(selected)}>View place details <ArrowRight size={15} /></button>}
        </div>
      </div>}
    </div>
  );
}

// "today", "yesterday", "5 days ago", then a date like "Aug 27, 2026"
const daysSince = (iso: string) => Math.round((new Date(isoDay(0)).getTime() - new Date(iso.slice(0, 10)).getTime()) / 86400000);
const STALE_DAYS = 180; // older than ~6 months → show the "may be out of date" note
const updatedLabel = (iso: string) => {
  const days = daysSince(iso);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  return new Date(`${iso.slice(0, 10)}T12:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
};

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
              {/* <button className="post-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Place actions"><MoreVertical size={18} /></button> */}
              {/* {menuOpen && <div className="post-menu"><button onClick={() => { setMenuOpen(false); if (requireAuth()) setReporting(true); }}><Flag size={14} /> Report this place</button></div>} */}
            </div>
          </div>
          <div className="place-meta"><span><Star size={15} fill="currentColor" /> <strong>{avg.toFixed(1)}</strong> ({place.reviews.length} reviews)</span><span><Clock size={15} /> {place.hours}</span><span className="place-updated"><History size={15} /> Updated {updatedLabel(place.updatedAt)}</span></div>
          {daysSince(place.updatedAt) > STALE_DAYS && <div className="place-stale-note" role="note"><AlertTriangle size={16} /><span>Info may be out of date. Hours or dog rules could have changed.</span><button onClick={() => { if (requireAuth()) setReporting(true); }}>Report incorrect info</button></div>}
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
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(focus?.placeId || visible[0]?.id);
  const [detailId, setDetailId] = useState<number | null>(focus?.placeId ?? null);
  const q = query.trim().toLowerCase();
  const filtered = visible.filter((p) => (category === "All" || p.category === category) && (!q || `${p.name} ${p.address} ${categoryOf(p.category).label}`.toLowerCase().includes(q)));
  const selected = filtered.find((p) => p.id === selectedId) || filtered[0];
  const detail = visible.find((p) => p.id === detailId);
  if (detail) return <PlaceDetail place={detail} back={() => setDetailId(null)} />;
  const chooseCategory = (name: "All" | SpotCategory) => { setCategory(name); const first = visible.find((p) => name === "All" || p.category === name); if (first) setSelectedId(first.id); };
  const openDetails = (place: Place) => { setDetailId(place.id); window.scrollTo({ top: 0 }); };
  return (
    <section className="map-page">
      <div className="map-list-panel">
        <div className="map-list-header">
          <h1>Pet-friendly map</h1>
          <label className="search-field map-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search places" aria-label="Search places" />{query && <button className="map-search-clear" onClick={() => setQuery("")} aria-label="Clear search"><X size={15} /></button>}</label>
          <div className="map-category-list" role="tablist" aria-label="Categories">
            <button role="tab" aria-selected={category === "All"} className={category === "All" ? "active" : ""} onClick={() => chooseCategory("All")}>All</button>
            {mapCategories.map((c) => <button role="tab" aria-selected={category === c.name} key={c.name} className={category === c.name ? "active" : ""} onClick={() => chooseCategory(c.name)}>{c.label}</button>)}
          </div>
        </div>
        <div className="map-place-list">
          {filtered.length ? filtered.map((spot) => <div className={selected?.id === spot.id ? "map-place-card selected" : "map-place-card"} key={spot.id} onClick={() => setSelectedId(spot.id)} role="button" tabIndex={0} aria-pressed={selected?.id === spot.id} onKeyDown={(event) => { if (event.key === "Enter") setSelectedId(spot.id); }}>
            <img loading="lazy" src={spot.image} alt="" />
            <div><h3>{spot.name}{spot.sponsored && <span className="sponsored-dot" title="Sponsored" aria-label="Sponsored"></span>}</h3><p className="place-meta-line">{categoryOf(spot.category).label} · <Star size={11} fill="currentColor" /> {average(spot).toFixed(1)} · {spot.address.split(",")[0]}</p></div>
            <button className="icon-button" onClick={(event) => { event.stopPropagation(); openDetails(spot); }} aria-label={`Open ${spot.name} details`}><ChevronRight size={18} /></button>
          </div>) : <div className="map-empty"><MapPin size={20} /><strong>No places found</strong><span>{q ? `Nothing matches “${query}”.` : "No places in this category yet."} Try another category or search.</span></div>}
        </div>
      </div>
      <MapCanvas places={filtered} selected={selected} onSelect={(p) => setSelectedId(p.id)} onDetails={openDetails} />
    </section>
  );
}
