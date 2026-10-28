import { FormEvent, useEffect, useRef, useState } from "react";
import { Activity, Archive, ArchiveRestore, ArrowLeft, CalendarDays, Check, CircleCheckBig, Clock, Flag, Heart, MapPin, MessagesSquare, Search, Send, ShieldCheck } from "lucide-react";
import { Conversation, firstName, ME } from "./data";
import { useStore } from "./store";
import { Badge, EmptyState, PersonAvatar } from "./ui";
import { FoundPetModal } from "./Community";

type Filter = "all" | "sitting" | "lost" | "archived";
const filterLabels: Record<Filter, string> = { all: "All", sitting: "Sitting", lost: "Lost and Found", archived: "Archive" };

function ContextPanel({ conversation }: { conversation: Conversation }) {
  const { posts, requests, setPage } = useStore();
  const [foundOpen, setFoundOpen] = useState(false);
  if (conversation.context === "lost") {
    const post = posts.find((p) => String(p.id) === conversation.ref);
    if (!post) return <aside className="message-context-panel"><p>This post is no longer available.</p></aside>;
    const mine = post.author === ME;
    return (
      <aside className="message-context-panel">
        <span className={post.status === "found" ? "context-label found" : "context-label lost"}>{post.status === "found" ? <><CircleCheckBig size={13} /> Pet found</> : <><Flag size={13} /> Lost pet alert</>}</span>
        <div className="context-author"><PersonAvatar name={post.author} size="sm" /><div><strong>{firstName(post.author)}</strong><small>{post.location} · {post.date}</small></div></div>
        <img loading="lazy" src={post.image} alt={post.pet || "Lost pet"} />
        <p>{post.caption}</p>
        {mine && post.status === "lost" && <button className="primary-button full" onClick={() => setFoundOpen(true)}><Check size={15} /> Mark as found</button>}
        <button className="secondary-button full" onClick={() => setPage("community")}>View in Community</button>
        {foundOpen && <FoundPetModal post={post} onClose={() => setFoundOpen(false)} />}
      </aside>
    );
  }
  const request = requests.find((r) => r.id === conversation.ref);
  if (!request) return <aside className="message-context-panel"><p>This sitter request was removed.</p></aside>;
  return (
    <aside className="message-context-panel">
      <img loading="lazy" src={request.image} alt={request.pet} />
      <div className="context-request-top"><span className="community-help-label"><Heart size={12} /> {request.owner === ME ? "Your request" : "Help requested"}</span><Badge tone={request.status === "Done" ? "green" : "blue"}>{request.status}</Badge></div>
      <h2>{request.title}</h2>
      <p className="pet-line"><strong>{request.pet}</strong> · {request.breed} · Posted by {request.owner === ME ? "you" : request.owner}</p>
      <div className="context-facts"><span><CalendarDays size={14} /> {request.date}</span><span><Clock size={14} /> {request.time}</span><span><Activity size={14} /> {request.duration}</span><span><MapPin size={14} /> {request.area}</span></div>
      <button className="secondary-button full" onClick={() => setPage("sitters", { requestId: request.id })}>View details</button>
    </aside>
  );
}

export default function MessagesPage() {
  const { conversations, activeConversation, setActiveConversation, draft, setDraft, sendMessage, markConversationRead, toggleArchive, notify } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [mobileThread, setMobileThread] = useState(Boolean(activeConversation));
  const threadRef = useRef<HTMLDivElement>(null);

  const visible = conversations.filter((c) => (filter === "archived" ? c.archived : !c.archived && (filter === "all" || c.context === filter)))
    .filter((c) => `${c.with} ${c.messages.map((m) => m.text).join(" ")}`.toLowerCase().includes(search.toLowerCase()));
  const active = conversations.find((c) => c.id === activeConversation) || visible[0];

  useEffect(() => { if (active?.unread) markConversationRead(active.id); }, [active?.id]);
  useEffect(() => { threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight }); }, [active?.id, active?.messages.length]);
  // If the conversation we opened lives in another filter (e.g. archived), switch to it.
  useEffect(() => { if (active && !visible.some((c) => c.id === active.id) && activeConversation === active.id) setFilter(active.archived ? "archived" : "all"); }, [activeConversation]);

  const select = (id: string) => { setActiveConversation(id); setDraft(""); setMobileThread(true); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!active || !draft.trim()) return;
    sendMessage(active.id, draft.trim());
    setDraft("");
  };
  const preview = (c: Conversation) => { const last = c.messages[c.messages.length - 1]; return last ? `${last.from === "me" ? "You: " : ""}${last.text}` : "New conversation"; };

  return (
    <section className={mobileThread ? "page-section messages-page thread-open" : "page-section messages-page"}>
      <div className="messages-heading"><div><span className="eyebrow">Private conversations</span><h1>Messages</h1><p>Coordinate care and lost-pet tips without sharing personal contact details.</p></div><div className="message-safety-note"><ShieldCheck size={17} /><span><strong>Stay on Avancado</strong><small>Keep early conversations here for your safety.</small></span></div></div>
      <div className="messages-shell">
        <aside className="conversation-list">
          <div className="message-filters">{(Object.keys(filterLabels) as Filter[]).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}><Check size={12} /> {filterLabels[item]}</button>)}</div>
          <div className="conversation-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search messages" aria-label="Search messages" /></div>
          {visible.length ? visible.map((c) => (
            <button key={c.id} className={active?.id === c.id ? "active" : ""} onClick={() => select(c.id)}>
              <PersonAvatar name={c.with} />
              <span><strong>{c.with}</strong><small>{preview(c)}</small><i className={c.context === "lost" ? "conv-tag lost" : "conv-tag"}>{c.context === "lost" ? "Lost and Found" : "Sitting"}</i></span>
              <em>{c.date}{c.unread > 0 && <b>{c.unread}</b>}</em>
            </button>
          )) : <div className="empty-messages"><Archive size={22} /><strong>No conversations here</strong><span>{filter === "archived" ? "Finished sittings and found pets move here automatically." : "Messages from sitters and lost-pet helpers appear here."}</span></div>}
        </aside>
        {active ? <>
          <div className="conversation-panel">
            <header>
              <button className="icon-button thread-back" onClick={() => setMobileThread(false)} aria-label="Back to conversations"><ArrowLeft size={18} /></button>
              <PersonAvatar name={active.with} />
              <div><strong>{active.with}</strong><small>{active.context === "lost" ? "Lost and found conversation" : "Sitter conversation"}</small></div>
              <button className="archive-conversation" onClick={() => { toggleArchive(active.id); notify(active.archived ? "Conversation restored." : "Conversation archived."); }}>{active.archived ? <><ArchiveRestore size={15} /> Unarchive</> : <><Archive size={15} /> Archive</>}</button>
            </header>
            <div className="message-thread" ref={threadRef}>
              {active.messages.length ? <span className="thread-date">{active.date}</span> : <div className="thread-empty"><MessagesSquare size={22} /><span>Say hello to {firstName(active.with)}. Your contact details stay private until you choose to share them.</span></div>}
              {active.messages.map((m, i) => (
                <div key={i} className={m.from === "me" ? "message-row sent" : "message-row"}>
                  {m.from === "them" && <PersonAvatar name={active.with} size="sm" />}
                  <div className={m.from === "me" ? "message-bubble sent" : "message-bubble received"}>{m.text}<small>{m.time}</small></div>
                </div>
              ))}
            </div>
            {active.archived
              ? <div className="archived-note"><Archive size={15} /> This conversation is archived. Unarchive it to keep chatting.</div>
              : <form className="message-composer stacked" onSubmit={submit}>
                <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) submit(event); }} placeholder="Write your message" aria-label="Write your message" rows={2} />
                <button className="send-message-button" type="submit" disabled={!draft.trim()}><Send size={16} /> <span className="send-label">Send</span></button>
              </form>}
          </div>
          <ContextPanel conversation={active} />
        </> : <div className="conversation-panel"><EmptyState icon={<MessagesSquare size={24} />} title="No conversation selected" text="Choose a conversation to start chatting." /></div>}
      </div>
    </section>
  );
}
