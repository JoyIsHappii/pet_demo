import { ChevronRight, Star } from "lucide-react";
import { firstName, people } from "./data";
import { useStore } from "./store";
import { PersonAvatar } from "./ui";

/** Right-hand panel shown next to feeds on wide screens: lost pets nearby and trusted sitters. */
export default function SideRail() {
  const { posts, hiddenNames, setPage, openProfile, isVerified } = useStore();
  const lost = posts.filter((p) => p.status === "lost" && !p.hidden && !hiddenNames.includes(p.author));
  const sitters = people.filter((p) => p.sits >= 5 && isVerified(p.name) && !hiddenNames.includes(p.name)).sort((a, b) => b.rating - a.rating).slice(0, 3);
  return (
    <aside className="side-rail">
      {lost.length > 0 && <section className="rail-card">
        <header><h3>Lost pets nearby</h3><button onClick={() => setPage("community")}>See all</button></header>
        {lost.map((p) => (
          <button key={p.id} className="rail-row" onClick={() => setPage("community")}>
            <img loading="lazy" src={p.image} alt="" />
            <span><strong>{p.pet.split(",")[0] || "A neighbour’s pet"}</strong><small>Last seen near {p.location}</small></span>
            <em className="rail-tag">Lost</em>
          </button>
        ))}
      </section>}
      <section className="rail-card">
        <header><h3>Trusted sitters</h3><button onClick={() => setPage("sitters")}>Board</button></header>
        {sitters.map((p) => (
          <button key={p.name} className="rail-row" onClick={() => openProfile(p.name)}>
            <PersonAvatar name={p.name} />
            <span><strong>{firstName(p.name)} {p.name.split(" ")[1]?.charAt(0)}.</strong><small><Star size={11} fill="currentColor" /> {p.rating} · {p.sits} sits · {p.location.split(",")[0]}</small></span>
            <ChevronRight size={16} />
          </button>
        ))}
      </section>
      <p className="rail-legal">Avancado · Made for Vancouver’s pets and their people.</p>
    </aside>
  );
}
