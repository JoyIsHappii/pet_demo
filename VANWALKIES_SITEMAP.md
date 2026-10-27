# Avancado Sitemap

This sitemap describes the intended information architecture for the Avancado user experience and administrator console. Route names are conceptual because the current prototype uses local UI state rather than URL routing.

## Access Legend

- **Public:** Available without a Avancado account.
- **Guest only:** Available when the user is signed out.
- **Member:** Requires a logged-in user account.
- **Verified member (optional badge):** A member whose identity an administrator has approved. Verification never gates features; it only adds a badge.
- **Admin:** Requires a separate administrator login.

## User Experience

```text
Avancado
├── Home (Public)
│   ├── Recent Community Stories
│   ├── Current Sitter Requests
│   └── Nearby Pet-Friendly Places
│
├── Login (Guest only)
│   ├── Email
│   ├── Password
│   ├── Forgot Password
│   └── Link to Sign Up
│
├── Sign Up (Guest only)
│   ├── Account Details
│   ├── Profile Details
│   ├── Accept Community Terms
│   └── Link to Login
│
├── Community (Public browsing)
│   ├── Latest Posts
│   ├── Lost Pets
│   ├── Create Post (Member)
│   ├── Post Detail
│   ├── Report Post (Member)
│   └── Public User Profile
│       ├── Community
│       └── Sitting Experience
│
├── Sitter Board (Public browsing)
│   ├── All Requests
│   ├── Request Detail
│   │   ├── Request Owner Profile
│   │   ├── Apply to Help (Member)
│   │   └── Report Request (Member)
│   ├── Create Request (Member)
│   ├── My Requests (Member)
│   │   ├── Open
│   │   ├── Matched
│   │   ├── Done
│   │   ├── Applicants
│   │   └── Delete My Request
│   └── Applied (Member)
│       ├── Applied
│       ├── Matched
│       └── Done
│
├── Pet-Friendly Map (Public)
│   ├── All Places
│   ├── Parks
│   ├── Beaches
│   ├── Trails
│   ├── Cafes
│   ├── Use My Location
│   └── Place Preview
│
├── My Pets (Member)
│   ├── Pet Selector
│   ├── Pet Summary
│   ├── Poop and Pee
│   ├── Food Log
│   ├── Weight
│   ├── Vaccines
│   ├── Vet Visits
│   ├── Emergency Contact
│   ├── Walking
│   └── Add Another Pet
│
├── My Profile (Member)
│   ├── Community
│   ├── Sitting Experience
│   ├── Edit Profile
│   ├── Account Settings
│   ├── Identity Verification (optional)
│   │   ├── Start Verification
│   │   ├── Submit Identity Details
│   │   ├── Pending Review
│   │   └── Approved
│   └── Log Out
│
└── Notifications (Member)
```

## User Authentication Paths

```text
Signed-out visitor
├── Login ── successful login ──> Home or originally requested page
└── Sign Up ── successful registration ──> My Profile
                                           └── Optional Identity Verification

Protected member action while signed out
└── Login
    ├── successful login ──> Return to requested action
    └── Sign Up ── successful registration ──> Return to requested action
```

User Login and Sign Up are separate from administrator authentication. Creating a user account does not grant administrator access or automatically approve identity verification.

## Administrator Console

```text
Admin Console
├── Admin Login (Admin)
└── Authenticated Console
    ├── Dashboard Overview
    ├── Community Moderation
    ├── Sitter Requests Moderation
    ├── Pet-Friendly Spots
    └── User Management
        ├── Verification Queue
        ├── Approve or Reject Verification
        ├── Hide User
        └── Permanently Delete User
```
