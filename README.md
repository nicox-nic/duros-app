# Duros Property Concierge+

Apple-inspired property management app for condominiums and mixed-use developments,
with a parallel Home AI experience for residents. This is an interactive prototype
built with Next.js 14, TypeScript, Tailwind CSS, and Zustand.

The prototype walks through the full operational loop — a resident files a request,
the request appears in the staff queue in real time, staff assigns and updates the
ticket, and the resident sees the status change reflected back in their app — all
with no backend.

## Getting Started

```bash
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:3000 in your browser. The app routes to `/staff/dashboard`
by default because the dev switcher pre-selects Alex Mendoza (Property Manager).
Use the **dev switcher** pill in the bottom-right corner of every screen to
switch between staff and resident accounts.

Build for production:

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 14.2** with the App Router and React Server Components
- **React 18.3** and **TypeScript 5**
- **Tailwind CSS** for styling, with a custom design token system
- **Zustand** for state management (with `useShallow` for selector stability)
- **Framer Motion** for transitions
- **Lucide React** for icons
- **React Hook Form** and **Zod** for forms and validation
- **Inter** and **Fraunces** loaded via `next/font/google`

## Design System

Defined in `tailwind.config.ts`.

- **Colors** — ivory `#faf7f2`, ivory-deep `#f5f0e8`, charcoal `#1f1d1a`, champagne `#c9a978`, plus success / warning / danger / info families with bg variants for tinted backgrounds
- **Typography** — Fraunces serif for display, Inter for UI
- **Radii** — small `0.75rem`, medium `1.25rem`, large `2rem`, phone shell `2.5rem`
- **Shadows** — `soft-sm`, `soft-md`, `soft-lg`, plus a `champagne` glow for emphasized actions
- **Custom keyframes** — `pulse`, `load-sweep` for skeleton states and notification dots

Reusable UI primitives live in `src/components/`:

- `BrandMark` — the logo + wordmark
- `StatusBar` — iOS-style 9:41 status bar for mobile shells
- `BottomNav` — phone tab bar with FAB
- `Sidebar` — desktop sidebar with grouped navigation
- `PhoneShell` — phone frame wrapper used in mobile preview contexts
- `PageHeader` — shared mobile top bar / desktop title block
- `Form` — `FieldLabel`, `TextInput`, `Textarea`, `Select`
- `Sheet` — bottom sheet on mobile, centered modal on desktop
- `ui` — `Card`, `Badge`, `Button`, `StatusDot`, `IconBox`

## Architecture

Two parallel route trees in `src/app/`:

```
app/
├── page.tsx                       Splash → routes by role
├── login/                         Sign In
├── signup/                        Create Account
│
├── staff/                         Property staff app
│   ├── dashboard/                 Greeting, stats, dept cards, AI insights
│   ├── tickets/                   List, detail, new
│   ├── inbox/                     Messages + thread detail
│   ├── insights/                  Full AI insights grid with filters
│   ├── announcements/             List + compose
│   ├── billing/                   SOA list + generate SOA
│   ├── permits/
│   │   ├── work/                  Work permits with approval chain
│   │   ├── gate/                  Gate pass with QR
│   │   └── special/               Special permits (amenity, pet, moving)
│   ├── team/                      Staff & roles
│   └── reports/                   AI reports
│
└── home/                          Resident "Home AI" app
    ├── page.tsx                   Resident dashboard
    ├── requests/                  My requests, detail, new
    ├── messages/                  Resident inbox
    ├── announcements/             Resident feed
    └── billing/                   My SOAs and payment
```

The app uses route segments rather than role-gated middleware so the two
experiences feel like separate apps despite sharing the same store and design system.

### State

A single Zustand store in `src/lib/store.ts` holds everything: properties,
users, tickets, announcements, work permits, gate passes, special permits,
billing statements, messages, AI insights, and AI reports. The store exposes
action methods like `createTicket`, `assignTicket`, `updateTicketStatus`,
`addTicketUpdate`, `pushMessage`, `markMessageRead`, `tickRealtime`,
`setCurrentUser`, and `setCurrentProperty`.

The store is the single source of truth for the demo flow. When the resident
calls `createTicket()`, the ticket appears in the staff queue on the next render —
there's no network request to wait for. When staff calls `assignTicket()`, the
action also pushes a message into the resident's inbox via `pushMessage()`, so
the demo's notification arrows happen automatically.

**Important pattern:** any selector that returns a filtered array must use
`useShallow` from `zustand/react/shallow` to prevent infinite re-renders, because
every render produces a new array reference. Example:

```ts
const myTickets = useAppStore(
  useShallow((s) => s.tickets.filter((t) => t.resident.id === user?.id))
);
```

### Realtime simulation

`src/lib/useRealtimeSimulation.ts` ticks every second to drive SLA countdowns,
nudges workload values every 45 seconds, and emits message pings every 60
seconds. The hook is mounted globally via `RealtimeProvider` in `layout.tsx`.

### Mock data

`src/lib/mock/everything.ts` seeds the store with:

- 2 properties (Duros Prime Residences in BGC; Duros Skyview Ortigas)
- 9 users — Alex Mendoza (Property Manager), Mike Bautista (Maintenance), Jenny Reyes (Accounting), Ramon Cruz (Engineer), Carlos Tan (Security), Pedro Garcia (Utility, offline), John Doe (resident, Unit 1203), Maria Santos (resident, Unit 1502), Robert Lee (resident, Unit 901)
- 4 tickets, including the urgent water-leak ticket `tkt-001` that drives the demo
- 3 announcements, 3 work permits, 3 gate passes, 2 special permits, 2 SOAs, 6 messages, 5 AI insights, 4 AI reports

## Demo Flow — End-to-End

The single scenario that proves the round trip works:

1. Open the dev switcher and select **John Doe** (resident)
2. Go to `/home/requests/new`
3. Fill out the form (title, department, priority, description) and submit
4. Open the dev switcher and select **Alex Mendoza** (property manager)
5. Go to `/staff/tickets` — the new request appears in the queue
6. Open the ticket and click **Assign Staff** in the right-column Actions card
7. Select any team member — the timeline gets a new "Assigned to X" entry and
   the **sidebar Inbox badge increments** because the assignment auto-pushed
   a notification to the resident
8. Click **Update Status** → **Completed**, type a note, and Confirm
9. The status badge flips green and the timeline gets the completion note
10. Switch back to John Doe and open `/home/requests` — the ticket shows
    **Resolved** with the staff note visible in the activity timeline

All ten steps happen against the same in-memory store, with `useShallow`-backed
selectors making sure every screen subscribed to a slice of changing data
re-renders correctly.

## Screen Inventory

### Resident ("Home AI")

| Route | Description | Interactive |
|---|---|---|
| `/home` | Dashboard — greeting, property pill, quick actions, active requests, outstanding balance hero, latest announcements | ✓ |
| `/home/requests/new` | New request form — type chips, title, department, priority, description, photo placeholders, urgent warning, success overlay. Has an AI chatbot hook at the top with a clear extension point comment. | ✓ |
| `/home/requests` | My requests with Active / Completed tabs and live SLA countdowns | ✓ |
| `/home/requests/[id]` | Read-only ticket detail with friendly SLA wording and a reply box that pushes back to staff | ✓ |
| `/home/announcements` | Resident-facing announcements feed | ✓ |
| `/home/billing` | Outstanding balance hero with **Pay Now** flow, expandable SOA cards with PDF download per statement | ✓ |
| `/home/permits` | Resident permits hub — quick-access tiles for work permit, gate pass, special permit, plus list of active/recent permits across all three types | ✓ |
| `/home/permits/work/new` | Resident-submitted work permit — pre-filled from current user, scope chips, contractor, workers, documents | ✓ |
| `/home/permits/gate/new` | Resident-requested gate pass — 8 pass types, visitor info, expiry chips, auto-host from current user | ✓ |
| `/home/permits/special/new` | Resident special permit application — 11 types, datetime range, details | ✓ |
| `/home/messages` | Resident inbox — taps through to related tickets | ✓ |

### Staff (Concierge+)

| Route | Description | Interactive |
|---|---|---|
| `/staff/dashboard` | 10 stat cards, 5 live department cards, AI insights panel | ✓ |
| `/staff/tickets` | List with type tabs (Repair / Complaints / Suggestions / Incidents) and status filter chips | ✓ |
| `/staff/tickets/[id]` | Full detail — status badge, SLA banner, photos, sub-tabs (Updates / Notes / Chat), timeline, Assign Staff sheet, Update Status sheet | ✓ |
| `/staff/tickets/new` | Staff-created ticket form, can attribute to any resident | ✓ |
| `/staff/inbox` | Message list with category tabs (All / Tickets / Billing / Alerts / Home AI) | ✓ |
| `/staff/inbox/[threadId]` | Conversation detail with reply form, marks message read, links to related ticket | ✓ |
| `/staff/announcements` | List of published and scheduled announcements with type icons | ✓ |
| `/staff/announcements/new` | Compose form — title, 10 type chips, 8 audience checkboxes, message body, schedule / push / Home AI toggles | ✓ |
| `/staff/insights` | Full AI insights grid with severity filter chips | ✓ |
| `/staff/billing` | SOA list with collected / outstanding / drafts summary cards, per-row PDF download | ✓ |
| `/staff/billing/new` | Generate SOA — resident select, photo capture for water/electric meters with simulated AI reading extraction, editable charges, AI billing alert when water delta exceeds threshold, preview modal, and PDF download | ✓ |
| `/staff/permits/work` | Work permits list with status tabs and approval chain (Engineer / Manager / Security) chips — each card is a link to its detail page | ✓ |
| `/staff/permits/work/new` | Compose work permit — scope chips, contractor, dates, dynamic worker list, document attachments | ✓ |
| `/staff/permits/work/[id]` | Work permit detail with full approval chain UI (engineer / manager / security) and approve/reject actions gated by role | ✓ |
| `/staff/permits/gate` | Gate pass with active pass QR display and entry list | ✓ |
| `/staff/permits/gate/new` | Issue gate pass — 8 pass types, host unit, visitor info, plate, expiry chips | ✓ |
| `/staff/permits/special` | 11-type grid (each opens form pre-selected) and recent applications list | ✓ |
| `/staff/permits/special/new` | Special permit application — 11 types, start/end datetimes, details (accepts `?type=` query) | ✓ |
| `/staff/team` | Staff roster grouped by department, online status, workload bars | ✓ |
| `/staff/team/new` | Add staff member — role, department auto-derived, approval status | ✓ |
| `/staff/reports` | AI reports — 4 example reports with summaries and stats | display-only |

### Shared

| Route | Description |
|---|---|
| `/` | Splash with logo, wordmark, tagline; routes by role if user is set |
| `/login` | Sign in with username, password, Remember me, Forgot link, Face ID button |
| `/signup` | Create account — name, email, mobile, role, property, approval code, employee ID, passwords, T&C, with a "Pending Admin Approval" success screen |

## The AI Chatbot Hook

`/home/requests/new` includes an "Describe your issue with AI" card at the top
of the form. Right now it's a placeholder that shows an alert. When you're ready
to add the chatbot, the implementation path is:

1. Replace the alert handler with a modal/sheet that opens an AI conversation
2. The chatbot collects the same fields as the form below (type, title,
   department, priority, description, photos)
3. The chatbot's final step calls the same `createTicket()` action with the
   same payload shape

A comment in the source marks the extension point clearly.

## Known Issues

- **Photo thumbnails appear blank in sandbox preview screenshots** because the
  Unsplash CDN is blocked there. They load fine on your local machine.
- **Hydration warning in dev mode** shows as a small "1 error" pill in the
  bottom-left during `npm run dev`. Production builds (`npm run build &&
  npm start`) suppress it. The root cause is most likely the realtime tick
  advancing between server-rendered HTML and client hydration. Use the
  `useMounted()` hook in `src/lib/useMounted.ts` for new time-dependent
  components to avoid this.

## Full Spec Coverage

This build is feature-complete against the original spec:

- **Splash, Login, Signup** — including 3-step forgot-password flow at `/forgot-password`
- **Dashboard** — 10 overview cards, live staff status, AI insight panel, clickable property switcher modal
- **Tickets** — full ticket detail with working Updates / Internal Notes / Chat sub-tabs (notes are staff-only with warning banner; chat messages are routed to resident inbox), search and filter modals
- **Billing & SOA** — camera capture for water/electric meters with simulated AI extraction, editable charges, preview modal, PDF download (jsPDF, fully client-side), Pay Now flow on resident side, **billing dispute thread** that sends a complaint to accounting
- **Announcements** — 10 types, 8 audiences, scheduling, push toggle, Home AI delivery
- **Work Permits** — full creation form, detail page with **Engineer / Manager / Security approval chain** with role-gated actions
- **Gate Pass** — 8 pass types, QR code display, **QR scanner modal** with camera viewfinder simulation, **Check In / Check Out actions** that notify the host on arrival
- **Special Permits** — 11 permit types with deep-link form pre-selection
- **Inbox** — real-time messages with audio beep + slide-in toast, search modal, filter-by-department modal
- **Staff & Roles** — roster, add staff, **pending approvals section** with Approve/Reject buttons, **Set Permissions modal** with 8 toggleable permissions grouped into 4 categories
- **AI Reports** — 4 seeded reports plus a **Generate Custom Report** modal with report type, date range, custom title, and 8 toggleable section chips. Generation simulates AI synthesis and produces real stats from live store data.
- **Resident Home AI parity** — `/home/permits` hub plus 3 resident creation forms (work, gate, special)
- **FAB Quick Actions** popover — 8 actions for staff, 5 for residents, reachable from mobile FAB and desktop sidebar
- **AI Chatbot** — conversational ticket-filing assistant at `/home/requests/new` with keyword-based type/department/priority detection, draft preview, submits via `createTicket`

## Auto-Login for Testing

By design, the splash screen auto-routes to the staff dashboard after ~600ms
because the default `currentUserId` is set to Alex (property manager). To
sign in as a resident, use the dev switcher in the bottom-right corner.

The `/login` "Sign In" button now skips credential validation and goes
straight to the dashboard for demo purposes. To test the full forgot-password
flow, click "Forgot password?" on the login screen — any 6-digit code works.

## File Tree Reference

```
src/
├── app/
│   ├── layout.tsx                  Root layout with fonts and providers
│   ├── globals.css                 Global Tailwind imports
│   ├── page.tsx                    Splash
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── staff/
│   │   ├── layout.tsx              Sidebar + bottom nav shell
│   │   ├── dashboard/page.tsx
│   │   ├── tickets/{page,new/page,[id]/page}.tsx
│   │   ├── inbox/{page,[threadId]/page}.tsx
│   │   ├── insights/page.tsx
│   │   ├── announcements/{page,new/page}.tsx
│   │   ├── billing/{page,new/page}.tsx
│   │   ├── permits/{work,gate,special}/page.tsx
│   │   ├── team/page.tsx
│   │   └── reports/page.tsx
│   └── home/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── requests/{page,new/page,[id]/page}.tsx
│       ├── announcements/page.tsx
│       ├── billing/page.tsx
│       └── messages/page.tsx
│
├── components/
│   ├── BrandMark.tsx
│   ├── StatusBar.tsx
│   ├── BottomNav.tsx
│   ├── Sidebar.tsx
│   ├── PhoneShell.tsx
│   ├── PageHeader.tsx
│   ├── PlaceholderScreen.tsx
│   ├── DevSwitcher.tsx
│   ├── RealtimeProvider.tsx
│   ├── Sheet.tsx
│   ├── Form.tsx
│   └── ui.tsx
│
└── lib/
    ├── types.ts                    Domain types
    ├── store.ts                    Zustand store + actions
    ├── utils.ts                    cn, formatRelativeTime, formatTimeOfDay, formatDate, getSLATime, formatPeso, getGreeting
    ├── useRealtimeSimulation.ts
    ├── useMounted.ts
    └── mock/
        ├── properties.ts
        ├── users.ts
        ├── tickets.ts
        └── everything.ts
```

## License

Internal prototype. Not for distribution.
