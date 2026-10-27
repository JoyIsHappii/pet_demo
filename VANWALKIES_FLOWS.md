# Avancado Product Flows

This document describes the current user-facing and administrator flows represented by the Avancado interactive prototype.

> **Prototype note:** The current app uses local UI state and mock data. Authentication, document verification, uploads, messaging, notifications, maps, and record changes are demonstrations rather than persisted server operations.

> **Demo member login:** `maya@avancado.ca` / `Pets2025!` (or use **Use demo login** on the Login page). Guests can browse only; posting, reacting, reporting, messaging, applying, and creating requests send the visitor to Login and return them afterwards. Maya starts **Not Verified** but can use every feature; verification is optional and only adds a badge.

## 1. Product Areas

### User-facing areas

1. Public Home
2. Community
3. Sitter Board
4. Pet-Friendly Map
5. My Pets
6. My Profile
7. Public User Profile
8. Notifications

### Administrator areas

1. Admin Login
2. Dashboard Overview
3. Community Moderation
4. Sitter Requests Moderation
5. Pet-Friendly Spots Management
6. User Management and Verification

---

## 2. Navigation Flow

### Desktop

- The Avancado logo returns to Home.
- Primary navigation opens:
  - Community
  - Sitter Board
  - Pet-Friendly Map
  - My Pets
- The notification button opens the notification entry point.
- The profile image opens My Profile.
- A small Admin Console link is available in the footer.

### Mobile

The persistent bottom navigation contains:

1. Home
2. Community
3. Sitter
4. Map
5. My Pets

The profile image remains available in the top header.

---

## 3. Public Home Flow

### Goal

Allow visitors to discover Avancado without logging in.

### Flow

1. User opens the site.
2. Home displays a compact community introduction.
3. User can browse:
   - Recent community stories
   - Current sitter requests
   - Nearby pet-friendly places
4. Selecting a community story opens Community.
5. Selecting a sitter request opens Sitter Board.
6. Selecting a place opens Pet-Friendly Map.
7. “View all” actions open the corresponding full feature.

### Access rules

- No login is required to view public content.
- Community browsing is available to everyone.
- Map browsing is available to everyone.
- Sitter request browsing is available to everyone.

---

## 4. Community Flow

## 4.1 Browse Community Posts

1. User opens Community.
2. Posts display in a responsive masonry-style feed.
3. Each post shows:
   - Author image
   - Verified symbol when applicable
   - Author name
   - Location
   - Relative date or posted date
   - Image
   - Post text
   - Paw reaction and count
   - Report action
4. User selects the author image or name to open the author’s public profile.

## 4.2 React to a Post

1. User selects the Paw action.
2. The Paw action becomes selected.
3. Reaction count increases by one.
4. Selecting it again removes the reaction.

### Access rules

- All users can react.
- Identity verification is not required.

## 4.3 Report a Community Post

1. User selects Report.
2. The app confirms that the report was received.
3. The report enters the administrator moderation workflow.

## 4.4 Filter Lost Pets

1. User opens Community.
2. User selects Lost Pets.
3. The feed displays lost-pet posts.
4. User can return to Latest Posts.

## 4.5 Create a Community Post

1. User selects Create Post.
2. Create Post modal opens.
3. User adds a photo.
4. User writes post text.
5. User adds a location.
6. User chooses:
   - Normal
   - Lost Pet
7. User selects Post.
8. The app publishes the mock post and shows confirmation.

### Validation

- A post type must be selected.
- Lost Pet is a compact option in the standard post flow.

### Access rules

- All users can create community posts.
- Identity verification is not required.

## 4.6 Mark a Lost Pet as Found

1. Owner views their Lost Pet post.
2. Owner selects Mark as Found.
3. Status changes from Lost Pet Alert to Pet Found.
4. Red alert styling changes to green resolved styling.
5. The post remains visible as a resolved community update.

---

## 5. Public Profile Flow

### Entry points

- Community author image
- Community author name
- Sitter request owner card
- Applicant public-profile action

### Layout

The public profile follows the same visual system as My Profile but excludes private controls.

### Community tab

Displays:

- Public introduction
- Community post count
- Reaction count
- Completed sitting count
- Sitter rating
- All public community posts

### Sitting Experience tab

Displays:

- Dog-care experience
- Cat-care experience
- Verified certificates
- Completed sitting reviews
- Reviewer name
- Star rating
- Review date
- Review note

### Privacy

Public profiles do not expose:

- Email address
- Phone number
- Account settings
- Password controls
- Identity documents
- Private verification data

---

## 6. My Profile Flow

## 6.1 View My Profile

1. User selects their profile image.
2. My Profile opens.
3. The summary displays:
   - Profile image
   - Verification symbol when approved
   - Name
   - Email
   - Location
   - Verification status

## 6.2 Community Tab

Displays:

- About Me
- Community post count
- Reaction count
- Completed sitting count
- Sitter rating
- All community posts using Community card styling

## 6.3 Sitting Experience Tab

Displays:

- Experience
- Certificates
- All reviews
- Account settings

## 6.4 Edit Profile

1. User selects Edit Profile or the image edit control.
2. Edit Profile modal opens.
3. User can update:
   - Profile image
   - Display name
   - Petsitting experience
   - Certificate name
   - Certificate file
4. User selects Save Changes.
5. Modal closes.

## 6.5 Account Settings

Available settings:

- Change password
- Notification preferences
- Privacy and profile visibility

---

## 7. Identity Verification Flow

### Verification is optional

Identity verification is **optional**. Every member can use every feature without it: posting, reacting, reporting, messaging, creating sitter requests, and applying to care for a pet.

Verifying adds a **verified badge** (a shield on the profile photo and an "Identity verified" label) so neighbours know the person's identity has been checked. Members who are not verified see a gentle, dismissible prompt suggesting it; nothing is ever locked behind it.

## 7.1 Start Verification

1. User opens My Profile.
2. User finds the Verification card.
3. User selects Start Verification.
4. Verification modal opens.

## 7.2 Submit Identity Details

User provides:

- Legal first name
- Legal last name
- Phone number
- Email address
- Document type:
  - BCID
  - Passport
  - Work permit
  - Study permit
- Identity document image or PDF
- Verification consent

## 7.3 Pending Review

1. User selects Submit for Review.
2. Verification status changes to Pending Approval.
3. All features stay available while the review is pending.
4. The verification request appears in Admin User Management.

## 7.4 Admin Approval

1. Admin opens User Management.
2. Admin reviews Waiting for Verification.
3. Admin selects Review.
4. Admin chooses:
   - Approve
   - Reject
5. Approve changes user status to Verified.
6. Reject returns user status to Not Verified.

## 7.5 Approved State

- Profile shows Identity Verified.
- Profile image displays a verified symbol.
- Trusted-sitter suggestions can include the member.
- No features change. Verification only adds trust signals.

---

## 8. Sitter Board Flow

### Purpose

Pet owners request help from neighbours. The feature encourages community help rather than paid transactions.

### Tabs

1. All Requests
2. My Requests
3. Applied

---

## 8.1 All Requests

### Content

All Requests displays only current Open requests.

Each vertical request card shows:

- Pet image at the top
- Current request label
- Posted date
- Request title
- Pet name
- Pet type or breed when applicable
- Owner name
- Request date
- Start and end time
- Duration
- Location
- Applicant count
- View Details action

### Flow

1. User browses current requests.
2. User selects View Details.
3. Full request details open.

---

## 8.2 Request Detail

Displays:

- Full pet image
- Request title
- Owner profile card
- Request date
- Time
- Duration
- Location
- Full care instructions
- Pet age
- Pet weight
- Applicant count
- Report action

### Owner profile

1. User selects the owner profile card.
2. Public profile opens.

### Report request

1. User selects Report This Request.
2. App confirms submission.
3. Report enters admin moderation.

---

## 8.3 Apply to Help

### Eligibility

- Any logged-in member can apply. Identity verification is optional; verified members show a badge that owners can see.

### Flow

1. User selects Apply.
2. Application modal opens.
3. User enters a note to the owner.
4. User confirms they are available at the requested time.
5. User selects Submit Application.
6. Request appears in Applied.
7. Apply action changes to Withdraw Offer.

### Withdraw

1. Applicant opens the request.
2. Applicant selects Withdraw Application.
3. Application is removed from Applied.

---

## 8.4 Create a Sitter Request

1. User selects Request a Sitter.
2. Create Request modal opens over the Sitter Board.
3. User chooses a pet from My Pets.
4. User enters:
   - Date
   - Start time
   - End time
   - Duration
   - Location
   - Request title
   - Care description
5. User selects Post Sitter Request.
6. Completion screen appears.
8. User can:
   - Return to board
   - View My Request

## 8.5 Contacting each other

There is no preferred-contact step. Owners and sitters talk through in-app **Messages**:

- An owner can message any applicant from their applicant card, before or after choosing.
- After a match, both people see a Send message action on the request.
- Personal phone numbers and emails are never collected or shown by the sitter board.

---

## 8.6 My Requests

### Filters

- Open
- Matched
- Done

### Open state

Owner can:

- View request details
- View applicants
- Delete the request

### View applicants

1. Owner selects View Applicants.
2. A vertically scrollable applicant modal opens.
3. Applicant cards show:
   - Profile image
   - Verification symbol
   - Name
   - Completed sitting count
   - Rating
   - Experience
   - Message from the applicant
   - Send message action
4. Owner selects a card.
5. Selected card receives a checkmark.
6. Owner can open a public applicant profile.
7. Owner selects Confirm Sitter.
8. Request status changes to Matched.
9. Owner and sitter continue planning in Messages.

### Unlimited applicants

- Applicant cards use a vertical scrolling list.
- Modal remains within the viewport.
- Additional applicants can be appended without changing the layout.

---

## 8.7 Matched Request

Matched card shows:

- Selected sitter
- Verification symbol
- Rating
- Completed sittings
- Send message action
- Matched status

Owner actions:

- Cancel Match
- Mark Done
- View Details

### Cancel Match

1. Owner selects Cancel Match.
2. Status changes to Cancelled.
3. Owner can return to applicants and choose another sitter.

### Mark Done

1. Owner selects Mark Done.
2. Review modal opens.
3. Owner chooses a 1–5 star rating.
4. Owner optionally writes a note.
5. Owner selects Submit Review.
6. Request status changes to Done.

---

## 8.8 Done Request

Done card uses a green completed style and shows:

- Completed With
- Selected sitter
- Verification symbol
- Rating
- Completed sitting count
- Review action
- Completed status

View Applicants is not available after completion.

---

## 8.9 Delete My Request

### Entry

Delete My Request appears only on request details owned by the current user.

### Flow

1. Owner selects Delete My Request.
2. Confirmation modal opens.
3. Owner chooses a reason:
   - No longer need a sitter
   - Plans changed
   - Found help elsewhere
   - Posted by mistake
4. Owner selects Delete Request.
5. Request is removed.
6. Tab counts update.
7. User returns to My Requests.

---

## 8.10 Applied

### Filters

- Matched
- Done

### Matched

Applicant sees requests where the owner selected them.

### Done

Applicant sees completed sitting history and can review the owner using the future mutual-review flow.

---

## 9. My Pets Flow

## 9.1 Select a Pet

1. User opens My Pets.
2. Pet selector displays Sunny, Luna, and Add Another Pet.
3. On mobile and tablet, pet cards swipe horizontally.
4. User selects a pet.
5. Selected pet details and dashboards update.

## 9.2 Pet Summary

Displays:

- Large pet image
- Name
- Breed
- Age
- Weight
- Last updated date
- Health status
- Natural-language description
- Compact Edit Profile action

## 9.3 Health Dashboards

### Poop and Pee

- Seven-day number chart
- Daily poop count
- Daily pee count
- Log entry point

### Food Log

- Date or time
- Menu
- Amount given
- Amount eaten
- Scheduled meal

### Weight

- Current weight
- Healthy range status
- Weight trend
- Target range
- Last update

### Vaccines

- Vaccine name
- Date
- Clinic
- Completed or upcoming status

### Vet Visits

- Date
- Time
- Visit reason or symptoms
- Outcome

### Emergency Contact

- Clinic name
- Phone number
- Address
- Call Clinic action

### Walking

Dog-only dashboard showing:

- Day
- Duration
- Distance
- Warning state
- Walk log entry point

## 9.4 Add Another Pet

1. User swipes to Add Another Pet.
2. User selects the action.
3. Future production flow will collect:
   - Dog or cat
   - Photo
   - Name
   - Breed
   - Age
   - Weight
   - Vaccination status
   - Care notes

---

## 10. Pet-Friendly Map Flow

### Access

- Map is read-only for standard users.
- User can browse without logging in.

### Categories

- Parks and Off-Leash Areas
- Cafes and Restaurants
- Pubs and Breweries
- Retail and Shops
- Pet Services
- Hotels
- Hiking Trails

Each category uses a distinct map color.

### Use My Location

1. User selects Use My Location.
2. Browser requests location permission.
3. Current-location marker appears.

### Map interaction

- Drag to move
- Zoom in
- Zoom out
- Select a pin to view a place
- Select a list card to focus the corresponding pin

### Place preview

Displays:

- Photo
- Category
- Name
- Address
- View Details action

---

## 11. Notifications Flow

1. User sees unread count in the header.
2. Notification entry point is available from all user pages.
3. Prototype notifications include:
   - New sitter applicant
   - Verification update
   - Community report confirmation
   - Sitter match update
   - Lost pet status update

---

## 12. Admin Login Flow

### Entry

1. Admin selects Admin Console from the footer.
2. Admin Login opens.

### Demo credentials

- Email: `admin@avancado.ca`
- Password: `Avancado2025!`

### Flow

1. Admin enters credentials or selects Use Demo Login.
2. Valid credentials open Dashboard Overview.
3. Invalid credentials display an error.

---

## 13. Admin Navigation

1. Dashboard Overview
2. Community Moderation
3. Sitter Requests
4. Pet-Friendly Spots
5. User Management

Admin can return to the user site from the sidebar.

---

## 14. Admin Dashboard Flow

Displays:

- Active members
- New members
- Reported posts
- Reported sitter events
- Pet-friendly places
- Verified members
- Popular posting times
- Priority moderation queue

### Date range

Admin can choose:

- Week
- Month
- Custom

---

## 15. Community Moderation Flow

### Table

Displays:

- Thumbnail
- Author and pet name
- Caption
- Paw or reaction count
- Date
- Actions

### Actions

- View
- Hide
- Delete

### View

1. Admin selects View.
2. Modal opens with larger image and details.
3. Admin can Hide or Delete.

### Date range

- Week
- Month
- Custom

---

## 16. Sitter Request Moderation Flow

### Table

Displays:

- Post ID
- Author or pet owner
- Title
- Date
- Status
- Actions

### Actions

- View
- Hide
- Delete

### Detail modal

Displays:

- Owner
- Applicant
- Current status
- Post ID
- Protected contact log

### Contact log

Private contact details remain protected unless an investigation requires access.

### Date range

- Week
- Month
- Custom

---

## 17. Pet-Friendly Spots Admin Flow

### Layout

- Left: category filters, search, add action, and scrollable cards
- Right: one persistent interactive map

### Shared data

User and admin views use the same:

- Place names
- Categories
- Addresses
- Photos
- Coordinates

### Filters

- All
- Parks and Off-Leash
- Cafes and Restaurants
- Pubs and Breweries
- Retail and Shops
- Pet Services
- Hotels
- Hiking Trails

### Add a spot

1. Admin selects Add Spot.
2. Modal opens.
3. Admin enters:
   - Spot name
   - Category
   - Address
   - Photo
4. Admin selects Save Spot.

### Edit a spot

1. Admin selects Edit.
2. Existing data populates the modal.
3. Admin updates data.
4. Admin saves.

### Delete a spot

1. Admin selects Delete.
2. Prototype performs the visual management action.

---

## 18. User Management Flow

### Verification queue

Displays users waiting for identity review.

Each request includes:

- User
- Email
- Submission date
- Document type
- Review action
- Reject action
- Approve action

### Approve

1. Admin selects Approve.
2. User becomes Verified.
3. User profile displays the verified symbol.
4. Protected sitter actions unlock.

### Reject

1. Admin selects Reject.
2. User returns to Not Verified.
3. User can submit verification again.

### User table

Displays:

- User
- Email
- Verification status
- Active or Hidden status
- Joined date
- Actions

### Hide user

Hide is the soft-delete flow.

1. Admin selects Hide.
2. User becomes Hidden.
3. User and their posts are removed from public surfaces.
4. Admin can select Unhide.

### Delete user

Delete is the hard-delete flow.

1. Admin selects Delete.
2. User is permanently removed from the management table.
3. Production implementation must require confirmation and server authorization.

---

## 19. Core Status Definitions

### Sitter request

- **Open:** Accepting applicants.
- **Matched:** Owner selected a sitter; they plan the details in Messages.
- **Cancelled:** Match was cancelled; owner can choose another sitter.
- **Done:** Sitting completed and reviews are available.

### Verification

- **Not Verified:** User has not submitted or was rejected.
- **Pending Approval:** Documents are awaiting admin review.
- **Verified:** Admin approved the user.

### Lost pet

- **Lost Pet Alert:** Pet is still missing.
- **Pet Found:** Owner marked the alert resolved.

### User management

- **Active:** User is visible and can use available features.
- **Hidden:** Soft-deleted; can be restored.
- **Deleted:** Permanently removed.

---

## 20. Production Requirements

The following require backend implementation before production:

- Authentication and sessions
- Authorization and role checks
- Database persistence
- Image and document storage
- Private identity-document handling
- Admin audit logs
- Verification review history
- Contact-detail encryption
- Report queues
- Real notifications
- Real maps and geolocation services
- Permanent and soft deletion
- Review persistence
- Sitter request state transitions
- Lost-pet status updates
- Upload validation and malware scanning
- Rate limiting and abuse prevention
