import { createContext, ReactNode, useContext, useState } from "react";
import {
  ME, isoDay, nowTime, petAge, seedApplications, seedConversations, seedNotices, seedPetLogs, seedPets, seedPlaces, seedPosts, seedReports, seedRequests,
  LogKind, Pet, PetLogs,
  CommunityPost, Conversation, MyApplication, Notice, Place, PlaceReview, Report, SitterRequest, UserPage, VerificationStatus,
} from "./data";

export type AppMode = "user" | "userLogin" | "signup" | "adminLogin" | "admin";
export type ManagedUser = { name: string; email: string; verification: VerificationStatus; joined: string; hidden: boolean; document?: string };

const seedUsers: ManagedUser[] = [
  { name: "Maya Thompson", email: "maya@avancado.ca", verification: "unverified", joined: "May 18, 2025", hidden: false },
  { name: "Daniel Kim", email: "daniel@example.com", verification: "verified", joined: "May 17, 2025", hidden: false },
  { name: "Ava Brooks", email: "ava@example.com", verification: "verified", joined: "May 16, 2025", hidden: false },
  { name: "Olivia Brown", email: "olivia@example.com", verification: "pending", joined: "May 16, 2025", hidden: false, document: "Passport" },
  { name: "Marcus Chen", email: "marcus@example.com", verification: "verified", joined: "May 15, 2025", hidden: false },
  { name: "Liam Nguyen", email: "liam@example.com", verification: "verified", joined: "May 15, 2025", hidden: false },
  { name: "Ethan Wilson", email: "ethan@example.com", verification: "unverified", joined: "May 14, 2025", hidden: false },
];

export const DEMO_MEMBER = { email: "maya@avancado.ca", password: "Pets2025!" };

function useAppState() {
  // ----- session & navigation -----
  const [mode, setMode] = useState<AppMode>("user");
  const [authenticated, setAuthenticated] = useState(false);
  const [page, setPageRaw] = useState<UserPage>("home");
  const [pendingPage, setPendingPage] = useState<UserPage | null>(null);
  const [profileName, setProfileName] = useState(ME);
  const [profileReturn, setProfileReturn] = useState<UserPage>("community");
  const [toast, setToast] = useState("");
  const [focus, setFocus] = useState<{ requestId?: string; placeId?: number; boardTab?: "all" | "mine" | "applied"; boardStatus?: string } | null>(null);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast((current) => (current === message ? "" : current)), 3400); };
  const setPage = (next: UserPage, nextFocus: typeof focus = null) => {
    if (!authenticated && ["pets", "profile", "messages"].includes(next)) { setPendingPage(next); setMode("userLogin"); return; }
    setFocus(nextFocus);
    setPageRaw(next);
    window.scrollTo({ top: 0 });
  };
  /** Returns true when the visitor is signed in. Otherwise sends them to login and returns them here afterwards. */
  const requireAuth = () => {
    if (authenticated) return true;
    setPendingPage(page);
    setMode("userLogin");
    return false;
  };
  const completeLogin = () => {
    setAuthenticated(true);
    setMode("user");
    if (pendingPage) { setPageRaw(pendingPage); setPendingPage(null); }
  };
  const logout = () => { setAuthenticated(false); setPageRaw("home"); notify("You have been logged out."); };
  const openProfile = (name: string) => {
    if (page !== "publicProfile") setProfileReturn(page);
    setProfileName(name);
    setPage(name === ME && authenticated ? "profile" : "publicProfile");
  };

  // ----- users & verification -----
  const [users, setUsers] = useState<ManagedUser[]>(seedUsers);
  const verification = users.find((u) => u.name === ME)?.verification || "unverified";
  const setVerification = (name: string, status: VerificationStatus, document?: string) => {
    setUsers((list) => list.map((u) => (u.name === name ? { ...u, verification: status, document: document || u.document } : u)));
    if (name === ME && status === "verified") addNotice({ text: "Your identity was verified. A verified badge now shows on your profile.", page: "profile", icon: "verify" });
    if (name === ME && status === "unverified") addNotice({ text: "Your verification was not approved. You can submit a clearer document any time.", page: "profile", icon: "verify" });
  };
  const toggleUserHidden = (name: string) => setUsers((list) => list.map((u) => (u.name === name ? { ...u, hidden: !u.hidden } : u)));
  const deleteUser = (name: string) => setUsers((list) => list.filter((u) => u.name !== name));
  const hiddenNames = users.filter((u) => u.hidden).map((u) => u.name);
  const isVerified = (name: string) => users.find((u) => u.name === name)?.verification === "verified";

  // ----- notifications -----
  const [notices, setNotices] = useState<Notice[]>(seedNotices);
  const addNotice = (notice: Omit<Notice, "id" | "time" | "read">) => setNotices((list) => [{ ...notice, id: Date.now() + Math.random(), time: "Just now", read: false }, ...list]);
  const markNoticesRead = () => setNotices((list) => list.map((n) => ({ ...n, read: true })));

  // ----- reports -----
  const [reports, setReports] = useState<Report[]>(seedReports);
  const addReport = (report: Omit<Report, "id" | "date" | "status">) => {
    setReports((list) => [{ ...report, id: Date.now(), date: "Just now", status: "open" }, ...list]);
    addNotice({ text: `Your report about “${report.subject}” was received. Our moderators will review it.`, icon: "report" });
  };
  const resolveReport = (id: number) => setReports((list) => list.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)));
  const resolveReportsFor = (target: Report["target"], targetId: string) => setReports((list) => list.map((r) => (r.target === target && r.targetId === targetId ? { ...r, status: "resolved" } : r)));

  // ----- community -----
  const [posts, setPosts] = useState<CommunityPost[]>(seedPosts);
  const [pawed, setPawed] = useState<number[]>([]);
  const addPost = (post: Omit<CommunityPost, "id" | "likes" | "date" | "author">) => setPosts((list) => [{ ...post, id: Date.now(), likes: 0, date: "Just now", author: ME }, ...list]);
  const updatePost = (id: number, changes: Partial<CommunityPost>) => setPosts((list) => list.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  const deletePost = (id: number) => setPosts((list) => list.filter((p) => p.id !== id));
  const togglePaw = (id: number) => setPawed((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  const markFound = (id: number) => {
    updatePost(id, { status: "found" });
    // Lost & found flow: once the pet is home, related chats move to the archive.
    setConversations((list) => list.map((c) => (c.context === "lost" && c.ref === String(id) ? { ...c, archived: true } : c)));
  };

  // ----- sitter board -----
  const [requests, setRequests] = useState<SitterRequest[]>(seedRequests);
  const [applications, setApplications] = useState<Record<string, MyApplication>>(seedApplications);
  const updateRequest = (id: string, changes: Partial<SitterRequest>) => setRequests((list) => list.map((r) => (r.id === id ? { ...r, ...changes } : r)));
  const addRequest = (request: SitterRequest) => setRequests((list) => [request, ...list]);
  const deleteRequest = (id: string) => setRequests((list) => list.filter((r) => r.id !== id));
  const apply = (id: string, note: string) => {
    setApplications((apps) => ({ ...apps, [id]: { status: "Applied", note } }));
    setRequests((list) => list.map((r) => (r.id === id ? { ...r, applicants: [...r.applicants.filter((a) => a.name !== ME), { name: ME, note, applied: "Applied today" }] } : r)));
  };
  const withdraw = (id: string) => {
    setApplications((apps) => { const next = { ...apps }; delete next[id]; return next; });
    setRequests((list) => list.map((r) => (r.id === id ? { ...r, applicants: r.applicants.filter((a) => a.name !== ME) } : r)));
  };
  const matchSitter = (id: string, sitter: string) => updateRequest(id, { status: "Matched", matched: sitter, cancelled: undefined });
  const cancelMatch = (id: string) => {
    const req = requests.find((r) => r.id === id);
    updateRequest(id, { status: "Open", matched: undefined, cancelled: req?.matched });
  };
  const markDone = (id: string, rating: number) => {
    updateRequest(id, { status: "Done", ownerRating: rating });
    // Sitter flow: once sitting is done, the conversation moves to the archive.
    setConversations((list) => list.map((c) => (c.context === "sitting" && c.ref === id ? { ...c, archived: true } : c)));
  };
  const reviewOwner = (id: string, mood: "good" | "bad") => setApplications((apps) => ({ ...apps, [id]: { ...apps[id], ownerReview: mood } }));

  // ----- messages -----
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const openConversation = (withName: string, context: Conversation["context"], ref: string, draftText = "") => {
    if (!requireAuth()) return;
    const existing = conversations.find((c) => c.with === withName && c.ref === ref);
    let id = existing?.id;
    if (existing) setConversations((list) => list.map((c) => (c.id === existing.id ? { ...c, archived: false } : c)));
    else {
      id = `c${Date.now()}`;
      setConversations((list) => [{ id: id!, with: withName, context, ref, archived: false, unread: 0, date: "Today", messages: [] }, ...list]);
    }
    setActiveConversation(id!);
    setDraft(draftText);
    setPage("messages");
  };
  const sendMessage = (id: string, text: string) => setConversations((list) => {
    const target = list.find((c) => c.id === id);
    if (!target) return list;
    const updated = { ...target, date: "Today", messages: [...target.messages, { from: "me" as const, text, time: nowTime() }] };
    return [updated, ...list.filter((c) => c.id !== id)];
  });
  const markConversationRead = (id: string) => setConversations((list) => list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  const toggleArchive = (id: string) => setConversations((list) => list.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c)));

  // ----- places -----
  const [places, setPlaces] = useState<Place[]>(seedPlaces);
  const [likedReviews, setLikedReviews] = useState<string[]>([]);
  const addPlaceReview = (placeId: number, review: Omit<PlaceReview, "id" | "date" | "likes" | "author">) => setPlaces((list) => list.map((p) => (p.id === placeId ? { ...p, reviews: [{ ...review, id: Date.now(), author: ME, date: "Just now", likes: 0 }, ...p.reviews] } : p)));
  const toggleReviewLike = (placeId: number, reviewId: number) => {
    const key = `${placeId}-${reviewId}`;
    const liked = likedReviews.includes(key);
    setLikedReviews((list) => (liked ? list.filter((k) => k !== key) : [...list, key]));
    setPlaces((list) => list.map((p) => (p.id === placeId ? { ...p, reviews: p.reviews.map((r) => (r.id === reviewId ? { ...r, likes: r.likes + (liked ? -1 : 1) } : r)) } : p)));
  };
  const savePlace = (place: Place) => setPlaces((list) => (list.some((p) => p.id === place.id) ? list.map((p) => (p.id === place.id ? place : p)) : [...list, place]));
  const deletePlace = (id: number) => { setPlaces((list) => list.filter((p) => p.id !== id)); resolveReportsFor("place", String(id)); };

  // ----- my pets (Pet + per-type log tables, as in the ERD) -----
  const [pets, setPets] = useState<Pet[]>(seedPets);
  const [petLogs, setPetLogs] = useState<PetLogs>(seedPetLogs);
  const touchPet = (petId: string) => setPets((list) => list.map((p) => (p.id === petId ? { ...p, updatedAt: isoDay(0) } : p)));
  /** Creates the pet when its id is new, otherwise updates it. */
  const savePet = (pet: Pet) => {
    const previous = pets.find((p) => p.id === pet.id);
    setPets((list) => (previous ? list.map((p) => (p.id === pet.id ? { ...pet, updatedAt: isoDay(0) } : p)) : [...list, { ...pet, updatedAt: isoDay(0) }]));
    // Sitter requests for this pet show the latest profile (vaccination, age, weight…)
    if (previous) setRequests((list) => list.map((r) => (r.petId === pet.id || (r.owner === ME && r.pet === previous.name) ? { ...r, petId: pet.id, pet: pet.name, breed: pet.breed || r.breed, age: petAge(pet.birthDate), weight: `${pet.weight} kg`, vaccinated: pet.isVaccinated, image: pet.imageUrl || r.image } : r)));
  };
  /** Adds or updates one row in a log table (matched by id). */
  const saveLog = <K extends LogKind>(kind: K, row: PetLogs[K][number]) => {
    setPetLogs((logs) => {
      const rows = logs[kind] as PetLogs[K][number][];
      const next = rows.some((r) => r.id === row.id) ? rows.map((r) => (r.id === row.id ? row : r)) : [...rows, row];
      return { ...logs, [kind]: next };
    });
    touchPet(row.petId);
  };
  const deleteLog = (kind: LogKind, id: string) => setPetLogs((logs) => ({ ...logs, [kind]: (logs[kind] as { id: string }[]).filter((r) => r.id !== id) }));

  return {
    pets, petLogs, savePet, saveLog, deleteLog,
    mode, setMode, authenticated, page, setPage, focus, requireAuth, completeLogin, logout, profileName, profileReturn, openProfile, toast, notify,
    users, verification, setVerification, toggleUserHidden, deleteUser, hiddenNames, isVerified,
    notices, addNotice, markNoticesRead,
    reports, addReport, resolveReport, resolveReportsFor,
    posts, pawed, addPost, updatePost, deletePost, togglePaw, markFound,
    requests, applications, updateRequest, addRequest, deleteRequest, apply, withdraw, matchSitter, cancelMatch, markDone, reviewOwner,
    conversations, activeConversation, setActiveConversation, draft, setDraft, openConversation, sendMessage, markConversationRead, toggleArchive,
    places, likedReviews, addPlaceReview, toggleReviewLike, savePlace, deletePlace,
  };
}

export type AppStore = ReturnType<typeof useAppState>;
const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useAppState();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}
