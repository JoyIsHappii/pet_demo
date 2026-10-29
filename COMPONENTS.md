# Avancado — Component List

This lists every UI component in the prototype, where it appears, and the order to build them.

- **Build order:** start at **P1** and work down. Each level only uses pieces from the levels above it, so feature teams can start as soon as P1–P2 are ready.
- **"Used" counts** are how many times the piece appears in the prototype code. A bigger number means more screens are blocked without it.
- **Where in code:** the file in `src/` where it lives today. Styles are in `src/index.css` under the same class name.
- **Design tokens** (colours, fonts, radii, shadows) are already defined at the top of `src/index.css` and in `HANDOFF.md` §2. Every component below should use them, never hard-coded values.

---

## Priority at a glance

| Level | What | Why first | Count |
|---|---|---|---|
| **P1 — Foundations** | Buttons, form fields, modal, badges/tags, avatar, icons | Used on almost every screen; everything else is built from these | 7 |
| **P2 — Shell & navigation** | Side nav, top bar, mobile tabs, menus, tabs, chips, search, toast, empty state | The frame every feature page sits in | 13 |
| **P3 — Shared building blocks** | Cards, rating, report/confirm/success dialogs, upload, toggles | Shared by two or more features | 13 |
| **P4 — Feature components** | One set per feature (Community, Sitters, Messages, Map, My Pets, Profile, Auth) | Build together with each feature team | 7 groups |
| **P5 — Later** | Admin console, legal pages, Home extras | Internal or low traffic | 3 groups |

---

## P1 — Foundations (build first)

| # | Component | What it is | Variants / states | Where it's used | Where in code | Used |
|---|---|---|---|---|---|---|
| 1.1 | **Button** | The main action control | Primary (Avocado fill), Secondary (outline), Text link button, Danger (coral), Icon-only (round). Default, hover, pressed, disabled, loading. Pill shape | Every page and every modal | `.primary-button`, `.secondary-button`, `.text-button`, `.danger-button`, `.icon-button` | 100+ |
| 1.2 | **Form field** | Label + input, with hint and error | Text, email, password, number, date, time, textarea, select. Required (`*`), hint text, error text, disabled. Full-width and 2-column grid layout | Login, sign up, every create/edit modal, settings, reviews | `<label>` + `.full-field`, `.form-grid`, `.field-hint`, `.form-error`, `.req` | ~60 |
| 1.3 | **Modal (dialog)** | Overlay window for forms and confirmations | Standard, wide, centred (small confirm). Title, lead text (`.modal-lead`), body, action row (`.modal-actions`). Close (×), Escape to close, page behind doesn't scroll. Full screen on phones | All create/edit/confirm flows | `Modal` in `ui.tsx` | 26 |
| 1.4 | **Badge / Tag** | Small coloured label | Tones: green (verified, done), amber (pending, sponsored), blue (info), red (lost, error), slate (neutral). Also: Sponsored tag, Vaccinated / Not yet tag, category label | Requests, posts, profiles, admin tables, map | `Badge` in `ui.tsx`, `.sponsored-tag`, `VaxTag` in `Sitters.tsx`, `.place-category` | 26+ |
| 1.5 | **Avatar** | Round person photo or initials | Sizes sm / md / lg. Photo or initials fallback. Optional verified tick | Posts, messages, applicants, top bar, profiles | `Avatar`, `PersonAvatar` in `ui.tsx` | 23 |
| 1.6 | **Eyebrow / section label** | Small uppercase label above a title | One style | Cards, modals, side panels | `.eyebrow` | 31 |
| 1.7 | **Icon set** | Line icons | lucide-react, 15–20px, inherits text colour | Everywhere | `lucide-react` imports | — |

---

## P2 — App shell & navigation

| # | Component | What it is | Variants / states | Where it's used | Where in code |
|---|---|---|---|---|---|
| 2.1 | **Logo (Brand)** | Avocado mark + "Avancado" | Light and dark | Side nav, auth pages, admin | `Brand` in `ui.tsx` |
| 2.2 | **Side navigation** | Left menu on desktop | Full (with labels), collapsed to icons with tooltips at ≤1240px. Active item. Footer links (Terms, Safety, Privacy, Admin) | All member pages (desktop) | `SideNav` in `App.tsx` |
| 2.3 | **Top bar** | Messages, notifications, avatar | Logged-in (icons + avatar) and guest (Log in / Sign up). Unread dot | All member pages | `UserHeader` in `App.tsx` |
| 2.4 | **Mobile bottom tabs** | 5 destinations on phones | Active tab; shown at ≤900px | All member pages (phone) | `.mobile-bottom-nav` in `App.tsx` |
| 2.5 | **Account menu** | Dropdown from the avatar | Profile, My pets, Account settings, Log out | Top bar | `AccountMenu` in `App.tsx` |
| 2.6 | **Notifications menu** | Dropdown list of notifications | Unread (butter background) and read, "Mark all read", empty | Top bar | `NotificationsMenu` in `App.tsx` |
| 2.7 | **Tabs / Segmented control** | Switch between views | Segmented pill (e.g. Applied / Matched / Done), underline tabs (profile content, settings) | Sitter board, Community, Messages, Profile, Settings, Admin | `.segmented`, `.board-tabs`, `.profile-content-tabs`, `.settings-tabs` |
| 2.8 | **Filter chips** | One scrolling row of pill filters | Default, selected | Map categories, Community, Messages filters | `.map-category-list`, `.message-filters` |
| 2.9 | **Search field** | Input with search icon | Empty, typing, with clear (×) | Map, Messages, Admin tables | `.search-field`, `.map-search` |
| 2.10 | **Overflow menu (⋯)** | Small action menu on a card | Edit, Delete, Report | Posts, requests | `.post-menu`, `.post-menu-button` |
| 2.11 | **Back link** | "← Back to …" | One style | Request detail, place detail, profiles, legal | `.back-link` |
| 2.12 | **Toast** | Short confirmation message at the bottom | Success (tick icon); disappears on its own | After saves, sends, deletes | `.toast` in `App.tsx` |
| 2.13 | **Empty state** | Icon, title, text, optional button | With and without action | Empty lists everywhere (no requests, no messages, no pets, no places) | `EmptyState` in `ui.tsx` |

---

## P3 — Shared building blocks

| # | Component | What it is | Where it's used | Where in code |
|---|---|---|---|---|
| 3.1 | **Post card** | Author row, photo, caption, paw (like), menu; lost/found states (coral / green) | Community, Home, Profile | `PostCard` in `Community.tsx` |
| 3.2 | **Sitter request card** | Pet photo, title, area, date/time, status, applicant count | Sitter board, Home (swipe row), Profile | `RequestCard` in `Sitters.tsx` |
| 3.3 | **Place row / place card** | Photo, name, category · rating · area, chevron | Map list, Home "places to go" | `.map-place-card` in `MapPage.tsx` |
| 3.4 | **Person card (applicant / sitter)** | Avatar, name, verified, rating, short note, action | Request detail ("Choose the best match"), side rail | `ApplicantCard`, `SitterMini` in `Sitters.tsx` |
| 3.5 | **Star rating** | 5 stars; read-only or tap-to-rate | Reviews (sitter, owner, place), cards | `StarRating` in `ui.tsx` |
| 3.6 | **Report dialog** | Pick a reason, add details, submit | Posts, places, people | `ReportModal` in `ui.tsx` |
| 3.7 | **Confirm-delete dialog** | "Are you sure?" with reason (optional) and a danger button | Delete post, delete request, delete pet log, admin | `DeleteRequestModal` (`Sitters.tsx`), `ConfirmDelete` (`Admin.tsx`) |
| 3.8 | **Success / congrats dialog** | Two-step: confirm → celebration | Mark pet found, match confirmed | `FoundPetModal` in `Community.tsx`, `.congrats-icon` |
| 3.9 | **Photo upload** | Pick a photo, show a preview, remove | Post composer, pet form, review, verification | `.upload-field`, `.upload-preview`, `.identity-upload` |
| 3.10 | **Toggle / choice row** | On/off switch rows and choice pills (e.g. Dog / Cat, Vaccinated / Not yet) | Pet form, account settings, create request | `.toggle-list`, `.toggle-row`, `.pet-choice`, `.outline-pill` |
| 3.11 | **Story ring** | Round photo with a coloured ring (coral = lost) | Home stories row | `.story`, `.story-ring` in `App.tsx` |
| 3.12 | **Info row (facts)** | Icon + label pairs in a row or grid | Request detail, place detail, pet profile | `Facts` in `Sitters.tsx`, `.place-meta`, `.detail-grid` |
| 3.13 | **Notice strip** | Coloured note with an icon and optional link | "Info may be out of date", status notes on requests | `.place-stale-note`, `StatusNote` in `Sitters.tsx` |

---

## P4 — Feature components (build with each feature team)

### Community — `src/Community.tsx`
| Component | What it is |
|---|---|
| `PostComposer` | Write a post, add a photo, mark as lost pet |
| `PostCard` (lost & found states) | See P3.1 |
| `FoundPetModal` | Confirm found → congrats (see P3.8) |
| Lost-pet alert | `.lost-alert` banner |

### Sitter board — `src/Sitters.tsx`
| Component | What it is |
|---|---|
| `CreateRequestModal` | Choose a pet, date/time, area, description |
| `RequestDetail` | Full request page with "About {pet}" care notes, vaccination tag, applicant section |
| `ApplyModal` | Message + "I'm available" confirmation |
| `SitterReviewModal` / `OwnerReviewModal` | Star rating + review after a sitting |
| `StatusNote` | Open / Matched / Done / match cancelled notes |

### Messages — `src/Messages.tsx`
| Component | What it is |
|---|---|
| Conversation list | Search, filters, unread, archived |
| Message thread | Bubbles (mine / theirs), composer, send |
| `ContextPanel` | The request or lost-pet post the chat is about |

### Map — `src/MapPage.tsx` (see "Map spec" in `HANDOFF.md`)
| Component | What it is |
|---|---|
| `MapCanvas` | Map with pins, popup, location and zoom controls (swap for the real map) |
| Map pin | Normal 34px, selected 46px, sponsored dot |
| Map popup | Desktop card / phone compact strip |
| `PlaceDetail` | Hero photo, info row, last updated, out-of-date note, reviews, write review |

### My Pets — `src/Pets.tsx`
| Component | What it is |
|---|---|
| `PetFormModal` | Add / edit pet: species, birth date, vaccinated, care notes |
| Health card (`CardHead`) | One card per log type (toilet, food, weight, vaccine, vet, walk, emergency) |
| `LogModal` | Add / edit one log entry; fields change by log type |
| `PetPhoto` | Pet photo with fallback |

### Profile & account — `src/App.tsx`
| Component | What it is |
|---|---|
| `ProfilePage` / `PublicProfilePage` | My profile and other members' profiles |
| `EditProfileModal` | Edit name, bio, photo |
| `AccountSettingsModal` | Notification and account settings |
| `VerificationModal` | Optional identity verification upload |

### Sign in — `src/App.tsx`
| Component | What it is |
|---|---|
| `UserAuth` | Login, sign up, email check, forgot password screens |

### Side panel — `src/Rail.tsx`
| Component | What it is |
|---|---|
| `SideRail` | Lost pets nearby + trusted sitters (Home and Community, desktop only) |

---

## P5 — Later

| Component | What it is | Where in code |
|---|---|---|
| **Admin console** | `AdminLogin`, `AdminSidebar`, `Dashboard` (counts), data tables (`.table-shell`), `TimeRangeFilter`, `ReportFlag`, `SpotForm`, user management | `src/Admin.tsx` |
| **Legal page** | Terms / Safety / Privacy layout | `LegalPage` in `src/App.tsx` |
| **Home extras** | Welcome card, `ExperiencePanels`, photo grid | `HomePage` in `src/App.tsx` |

---

## Checklist for each component

Before handing a component to a feature team, make sure it has:

- [ ] All variants and states from the table (including hover, focus, disabled, error, empty)
- [ ] Desktop and phone (≤900px) versions
- [ ] Only design tokens for colour, type, radius and shadow
- [ ] Visible keyboard focus, and text contrast that passes WCAG AA
- [ ] A matching name in Figma and in code (use the names in this file)
