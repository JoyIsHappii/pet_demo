import { ReactNode, useEffect, useState } from "react";
import { Ban, Check, CircleCheckBig, Flag, ShieldCheck, Star, X } from "lucide-react";
import { findPerson, reportReasons, ReportTarget } from "./data";
import { useStore } from "./store";

export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <div className="brand">
      <span className={dark ? "brand-mark brand-mark-dark" : "brand-mark"}><img src="/avancado-mark.png" alt="" /></span>
      <span className={dark ? "brand-name brand-name-dark" : "brand-name"}>Avancado</span>
    </div>
  );
}

export function Avatar({ src, name, size = "md" }: { src?: string; name: string; size?: "sm" | "md" | "lg" }) {
  return src ? <img className={`avatar avatar-${size}`} src={src} alt={name} /> : <span className={`avatar avatar-${size} avatar-fallback`}>{name.charAt(0)}</span>;
}

/** Avatar for a known community member, with the verified shield when their identity is approved. */
export function PersonAvatar({ name, size = "md", large = false }: { name: string; size?: "sm" | "md" | "lg"; large?: boolean }) {
  const { isVerified } = useStore();
  const person = findPerson(name);
  return <span className={large ? "verified-avatar large" : "verified-avatar"}><Avatar src={person.avatar} name={name} size={size} />{isVerified(name) && <ShieldCheck size={12} />}</span>;
}

export function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "amber" | "slate" | "red" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Modal({ children, onClose, wide = false, className = "" }: { children: ReactNode; onClose: () => void; wide?: boolean; className?: string }) {
  // Escape closes the dialog; the page behind it stops scrolling while it is open.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={`modal ${wide ? "modal-wide" : ""} ${className}`} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close"><X size={19} /></button>
        {children}
      </div>
    </div>
  );
}

export function StarRating({ value, onChange, size = 22 }: { value: number; onChange?: (value: number) => void; size?: number }) {
  return (
    <div className="star-input" role={onChange ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((star) => onChange
        ? <button type="button" key={star} className={value >= star ? "active" : ""} onClick={() => onChange(star)} aria-label={`${star} star${star > 1 ? "s" : ""}`}><Star size={size} fill={value >= star ? "currentColor" : "none"} /></button>
        : <Star key={star} size={size} className={value >= star ? "active" : ""} fill={value >= star ? "currentColor" : "none"} />)}
    </div>
  );
}

/** Report flow: choose a reason → submit → thank-you screen. The report lands in the admin queue. */
export function ReportModal({ target, targetId, subject, title, onClose }: { target: ReportTarget; targetId: string; subject: string; title: string; onClose: () => void }) {
  const { addReport } = useStore();
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <Modal onClose={onClose}>
      <div className="report-success">
        <span><CircleCheckBig size={30} /></span>
        <h2>Thanks for your report</h2>
        <p>Our moderation team will review it against the Avancado community guidelines. Reports are private, so the author will not know who sent it.</p>
        <button className="primary-button" onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
  return (
    <Modal onClose={onClose}>
      <span className="eyebrow">Community safety</span>
      <h2>{title}</h2>
      <p className="modal-lead">Select the reason that best describes your concern. Your report stays private.</p>
      <div className="report-reason-grid">
        {reportReasons[target].map(([name, description]) => (
          <button key={name} className={reason === name ? "selected" : ""} onClick={() => setReason(name)}>
            <span className="report-radio">{reason === name && <Check size={11} />}</span>
            <span><strong><Ban size={13} /> {name}</strong><small>{description}</small></span>
          </button>
        ))}
      </div>
      <div className="modal-actions">
        <button className="secondary-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" disabled={!reason} onClick={() => { addReport({ target, targetId, subject, reason }); setSubmitted(true); }}><Flag size={16} /> Report</button>
      </div>
    </Modal>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return <div className="empty-state"><span>{icon}</span><strong>{title}</strong><p>{text}</p>{action}</div>;
}
