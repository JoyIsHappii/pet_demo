# Avancado — Developer Handoff

Avancado is a clickable front-end prototype of a Vancouver pet community: Community feed, Sitter Board, Pet-Friendly Map, My Pets, Messages, Notifications, member profiles, and an Admin Console.

**What this prototype is:** the agreed UX and visual design, fully clickable with demo data.
**What it is not:** there is no backend. All data lives in browser memory and resets on refresh.

---

## 1. Run it

```bash
npm install
npm run dev        # http://localhost:5173 (or --port 8443)
npm run build      # production build
```

Node 22 (see `.mise.toml`).

| Account | Email | Password |
|---|---|---|
| Demo member (Maya) | `maya@avancado.ca` | `Pets2025!` |
| Admin | `admin@avancado.ca` | `Avancado2025!` |

Identity verification is **optional**. Every logged-in member can use every feature; verifying only adds a badge.

Maya starts **Not verified**. To see the verified badge appear:
1. Submit verification from My Profile.
2. Approve it in Admin → User Management.

---

## 2. Code map

| File | What it holds |
|---|---|
| `src/data.ts` | Types and all seed data (people, posts, requests, conversations, places, reports, notifications). **This is the data model to turn into API schemas.** |
| `src/store.tsx` | One React context with all state and every user action (`apply`, `matchSitter`, `markFound`, `addReport`, …). **Each action maps to a future API call.** |
| `src/Rail.tsx` | Right-hand side panel used on Home and Community |
| `src/ui.tsx` | Shared pieces: `Modal`, `ReportModal`, `PersonAvatar`, `Badge`, `StarRating`, `EmptyState` |
| `src/App.tsx` | App shell, header, notifications, Home, profiles, verification, login/signup, legal pages |
| `src/Community.tsx` | Feed, post card, composer, lost & found |
| `src/Sitters.tsx` | Sitter board, request detail, choose match, apply, reviews, create/delete request |
| `src/Pets.tsx` | My Pets: pet profile form, health cards, and the log editor (one config per ERD log table) |
| `src/Messages.tsx` | Conversations, thread, context panel, archive |
| `src/MapPage.tsx` | Map canvas, place detail, reviews, place reports |
| `src/Admin.tsx` | Admin login, dashboard, moderation tables, spots, user management |
| `src/index.css` | The whole design system: tokens at the top, then components, pages, and responsive rules |

### Design tokens (top of `src/index.css`)

| Token | Value | Use |
|---|---|---|
| `--olive` / `--olive-deep` | `#568203` Avocado | Brand: primary buttons (white text 4.6:1), active nav, selected states, brand icons |
| `--olive-dark` / `--olive-deep-hover` | `#354F05` Deep Avocado | Hover/pressed, and green text such as links and badge text (7.6:1 on Pale Sage) |
| `--avocado-soft` | `#8EAD4B` Soft Avocado | Decorative icons, chart fills, story rings. Never use it for text |
| `--sage-soft` / `--sage-faint` / `--sage` | `#E5EDCF` Pale Sage + tints | Subtle backgrounds, selected cards, brand badges |
| `--ivory` | `#FAF8F0` Warm Cream | Page background |
| `--brown` / `--brown-2` / `--muted` | `#3A2D20` Warm Brown + 2 lighter steps | Headings, body text, secondary text (all AA) |
| `--white` | `#FFFFFF` | Cards and forms |
| `--peach` (+ `-soft`, `-ink`) | `#FFD8C2` | Likes: paw reactions, review hearts |
| `--butter` (+ `-soft`, `-ink`) | `#FFE399` | Unread notifications, Sponsored, Pending (warning) |
| `--sky` (+ `-soft`, `-ink`) | `#B7E0FF` | Info notes, contact log, map water, chart series |
| `--lavender` (+ `-ink`) | `#E8D7FF` | Category tags (the “Sitting” chat tag) |
| `--success` (+ `-soft`, `-line`) | `#1E7046` | Completed, verified identity, found pets. Kept distinct from the brand green |
| `--coral` (+ `-soft`, `-line`) | `#B84536` | Errors, destructive actions, lost pets |

Each soft accent has an `-ink` partner for its text; all of these pairs pass WCAG AA.
Map category colours live in `mapCategories` (`src/MapPage.tsx`) and all keep at least 3:1 against white.

- **Fonts:** Plus Jakarta Sans (`--display`) for headings; Inter 400–700 for all interface text.
- **Layout:** a social-app shell.
  - **Desktop:** a left sidebar (`SideNav` in `App.tsx`) holds the five destinations and the legal and admin links. A top bar (`UserHeader`) holds messages, notifications, and the avatar menu (`AccountMenu`: profile, My pets, account settings, log out). Phones use the same top bar.
  - **1240px and below:** the sidebar collapses to icons, with tooltips.
  - **900px and below:** the mobile top bar and bottom tabs take over.
  - **Home and Community:** both use a centred feed column plus a right-hand panel (`src/Rail.tsx`: lost pets nearby, trusted sitters). The panel hides below 1240px.
- **Home:** a welcome card, a stories row (lost pets get a coral ring), swipeable sitter-request cards, a 3-column community photo grid, and places to go.
- **Radii:** 10 / 12 / 16 / 20px; buttons, tabs and chips are pills (tabs are a segmented control).
- **Shadows:** `--shadow-xs` to `--shadow-lg`.
- **Breakpoints:** 1120px, 900px (mobile nav appears), 480px.
- **Motion:** respects `prefers-reduced-motion`.

---

## 3. Flow status (verified end to end in the prototype)

| Flow | Status |
|---|---|
| Guest browsing; member-only actions send guests to login and back | ✅ |
| Login (with error), sign up → email verification → resend → activated, forgot password | ✅ |
| Community: post, edit, delete, paw, report, lost pet, “send message” → chat, mark as found → chat archived | ✅ |
| Optional identity verification → admin approve/reject → badge + notification | ✅ |
| Sitter (owner): create request, choose match, confirm, congratulations, cancel match, mark done + star review, delete with reason | ✅ |
| Sitter (applicant): apply (no verification needed) with availability check, withdraw, Applied/Matched/Done, review owner | ✅ |
| Messages: send, filters, search, archive/unarchive, context card, mobile list/thread | ✅ |
| Map: categories, pins, use my location, zoom/drag, place detail, write review + photo, like review, report place | ✅ |
| Notifications: unread count, mark all read, deep links | ✅ |
| Admin: dashboard counts, hide/unhide/delete posts and requests, place reports (reject/edit/delete), add/edit/delete spots, verify/hide/delete users | ✅ |
| My Pets: add / edit pets; add, edit, delete entries in every health log and emergency contacts | ✅ |

---

## 4. Not designed yet (buttons are visible but do nothing)

Design these, or hide them before launch:

| Screen | Control | Needed |
|---|---|---|
| Edit profile (member) | **Save changes** | Shows a toast but doesn’t store anything; needs real fields and validation |
| Login | **Keep me signed in** | Session-length decision |
| Messages | Attachments | Not in scope? Confirm |

---

### My Pets vs. the ERD (needs a decision from the database team)

- **Species:** the UI needs dog vs. cat (Walking is dog-only), but `Pet` has no species column. The prototype adds `species`; the scope doc already lists it as an open item.
- **Birth date (decided):** the app stores `birthDate` and shows the age worked out from it, so it stays correct every year. Replace the ERD’s `age int` column with `birthDate date`.
- **Care notes on requests (new, no schema change):** the request page shows the pet’s `notes` by joining `SitterRequest.petId → Pet`. Pet profiles stay private; only the notes, gender and neutered status of the pet on a posted request are shown. A per-request opt-out (`shareCareNotes`) was considered and left for later.
- **Vaccination status (new):** add `isVaccinated boolean` to `Pet` (owner sets Vaccinated / Not yet). Sitter requests show it to sitters; either join it from `Pet` via `SitterRequest.petId` or copy it onto the request when it’s posted.
- **EmergencyContact:** the ERD has `clinicName, phone, address, notes`; the scope doc lists only `clinicName, phone` and says exact addresses aren't stored. The prototype keeps `address` optional.
- **Vaccine status** (`COMPLETED` / `UPCOMING` in the scope doc) isn't a column; the prototype derives it from `administeredOn` and `nextDueOn`.
- **Gender enum values** aren't listed; the prototype uses Female / Male.

## 5. Docs out of date with the final design

`VANWALKIES_FLOWS.md` and `VANWALKIES_SITEMAP.md` predate the final designs. Update them, and consider renaming them `FLOWS.md` / `SITEMAP.md`:

- **§8.3 Apply:** the final design uses a message + “I’m available” confirmation, not contact methods.
- **§8.6 View applicants:** now an inline “Choose the best match” section on the request page, not a modal.
- **§8.7 Cancel match:** the request returns to **Open** with a “match cancelled” note. There is no separate *Cancelled* status.
- **§8.10 Applied:** the filters are **Applied / Matched / Done**.
- **§4.6 Lost pet:** two flow diagrams disagreed. The prototype keeps the resolved post visible (green, “Pet found”), removes it from the Lost and Found tab, and archives related chats.
- **Missing sections:**
  - Messages (both sitter and lost & found flows)
  - Map reviews and map reports (including the admin side)
  - Sign-up email verification
  - Forgot password
  - Notifications content

---

## 6. What engineering needs to build

From FLOWS §20, plus gaps found in this review:

1. **Routing.** URLs never change today, so refresh, back button, and share links don't work. Add a router; the sitemap gives the routes.
2. **Auth and sessions.** Member and admin roles are separate. Add email verification, password reset, and rate limiting.
3. **Database and API** for every entity in `src/data.ts` and every action in `src/store.tsx`. Replace the hard-coded current user (`ME`).
4. **Identity verification:**
   - private document storage
   - admin-only access
   - review history and audit log
   - retention policy
5. **Sitter request state machine:** Open → Matched → Done, with cancel back to Open. There is no preferred-contact step; owners and sitters coordinate only through in-app messaging, so no phone numbers or emails are collected for requests. Message history should be encrypted at rest.
6. **Messaging:** real-time or polling, unread counts, auto-archive rules (sitting done, pet found), plus abuse reporting.
7. **Moderation:**
   - persisted report queue
   - soft-delete (Hide) vs. hard-delete with confirmation
   - an admin audit log
8. **Uploads:** image/PDF validation, resizing, and malware scanning.
9. **Map:** a real map provider (Mapbox/Google/Leaflet), geocoding, and geolocation consent. Swap the drawn map in `MapCanvas`.
10. **Notifications:** an in-app feed, plus email/push as set in Account settings.
11. **Accessibility:**
    - Escape closes dialogs and the page behind them stops scrolling.
    - Still needed: focus trapping inside dialogs, ARIA tab roles on tab bars, and a keyboard pass on the map.
12. **Images:** the photos are Unsplash hot-links. Replace them with licensed or owned images served from your CDN.

---

## 7. Repo housekeeping before handoff

- [ ] Put the project under git (`git init`) and push to the team’s repo. It's not a git repository yet.
- [ ] Keep **one** lockfile. Both `package-lock.json` and `pnpm-lock.yaml` exist; `.mise.toml` pins pnpm.
- [ ] Rename the `package.json` name from `figma-make-app` to `avancado`.
- [ ] Add a linter (ESLint) and tests. Only a formatter (`oxfmt`) is set up.
- [ ] Decide whether `.figma/` (17 MB of Figma Make metadata and images) should be committed.
- [ ] Attach the Figma file link, the style guide (colors and typography), the ERD, and the Project Scope Document to the ticket.
