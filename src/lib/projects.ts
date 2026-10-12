export interface CaseStudy {
  /** The real-world problem, and who had it. */
  problem: string;
  /** The hardest engineering problem on the project, and how it got solved. */
  challenge: string;
  /** The stack and how it fits together — the "why", not just a list. */
  architecture: string;
  /** Specific, concrete decisions worth calling out on their own. */
  decisions: string[];
  /** An honest limitation, bug, or known gap. Omit rather than invent one. */
  whatWentWrong?: string;
  /** What building it actually taught — technical or otherwise. */
  lessons: string;
}

export interface Project {
  slug: string;
  kicker: string;
  title: string;
  description: string;
  /** Short lede shown above the case study. */
  summary: string;
  image: string;
  year: string;
  /** Badges shown under the title. Plain strings — not every tool here has an icon. */
  stack: string[];
  /** Omit a key (or the whole object) rather than link to a URL that doesn't exist yet. */
  links?: { demo?: string; github?: string };
  /** Hardware built for fun. Listed in its own section under the main grid. */
  hobby?: boolean;
  caseStudy: CaseStudy;
}

/**
 * Everything on the projects index. The grid is uniform, so adding an entry
 * here is all it takes — no layout changes, and the stagger re-derives itself
 * from DOM order.
 */
export const projects: Project[] = [
  {
    slug: "quiro",
    kicker: "Desktop App",
    title: "Quiro",
    description: "Native screen studio",
    summary:
      "Quiro is a native screen recorder and editor for Windows, macOS, and Linux: screen, camera, microphone, and system audio captured together, then zooms, backgrounds, captions, and annotations composed locally and exported as a file you own. No account, no upload step.",
    image: "/images/quiro.png",
    year: "2026",
    stack: [
      "Tauri",
      "Rust",
      "React",
      "TypeScript",
      "wgpu",
      "FFmpeg",
      "Next.js",
      "Cloudflare R2",
    ],
    links: {
      demo: "https://quiro.app",
      github: "https://github.com/Nweremizu/quiro",
    },
    caseStudy: {
      problem:
        "Making a polished product demo usually means paying for a subscription tool or paying a video editor, and most of those tools want your recordings in their cloud. I wanted a recorder that does a video editor's framing work for you: intentional zoom, cursor emphasis, clean composition, while every recording stays a plain file on your own machine.",
      challenge:
        "Annotations were second-class citizens. The editor drew them twice: as SVG on screen and as Canvas2D when exporting a screenshot, and the Rust video renderer didn't know they existed, so an arrow or a text callout could never appear in an exported video. There were even two parallel systems for the same idea: timed, GPU-drawn text and mask segments on the timeline, and untimed, pixel-space annotations in the canvas. I unified them into one model with real timing, normalized coordinates, and anchors, moved shapes, arrows, text, masks, and focus effects into the native wgpu renderer, and made export a single native pass. The on-screen SVG layer now only draws selection chrome, so what you see in the editor and what lands in the file come from the same renderer.",
      architecture:
        "A Tauri v2 shell with a React and TypeScript editor UI over a Rust workspace of around forty crates. Capture is native per platform: Windows Graphics Capture through Direct3D, ScreenCaptureKit on macOS, and X11 (XComposite per-window capture) or Wayland on Linux, alongside dedicated camera crates for Media Foundation, DirectShow, and AVFoundation. A wgpu renderer composites backgrounds, padding, shadows, perspective, zoom, and annotations, and encoding runs through FFmpeg plus the hardware encoders each OS provides. Rust types are exported to TypeScript with specta, so the UI and the engine can't drift apart. The marketing site at quiro.app is Next.js, and releases ship through a Cloudflare R2 bucket that feeds a signed auto-updater.",
      decisions: [
        "Rebuilt on top of the open-source Cap project's Rust capture and encoding stack instead of writing native capture from scratch a second time. The first version of Quiro was Electron with hand-written C++ and Swift capture helpers; forking a proven core let the effort go into the editor instead.",
        "One renderer for everything: annotations, masks, and text moved into the native wgpu pipeline, so preview and export can't disagree.",
        "Release files are immutable, versioned folders cached forever, while only the small updater and download manifests are served uncached, so a new release reaches every installed copy within minutes without ever invalidating an installer.",
        "Crash and camera diagnostics through PostHog report the failure stage, OS, app version, and hardware vendor/product IDs, but never device serial numbers.",
        "Linux went from a generic fallback to a first-class download and auto-update target, with real per-window capture on X11 and output enumeration on Wayland.",
      ],
      whatWentWrong:
        "Forking a large, mature codebase means inheriting what you don't understand yet. The out-of-process muxer binary was dropped during the fork and had to be ported back after the fact. macOS builds were briefly reported by Gatekeeper as \"damaged\" for anyone who downloaded them, which I fixed with ad-hoc signing; full Apple notarization is still outstanding. And the AI editing agent from the Electron version didn't survive the rebuild; it's not in the current app.",
      lessons:
        "Knowing when not to write something yourself is an engineering skill. Building capture by hand the first time taught me how it works, and that's exactly what made it possible to read, trust, and extend someone else's far more complete version. The annotation work taught the other half: the real fracture is usually one layer below where it feels like it is: the canvas wasn't the problem, the annotation model was.",
    },
  },
  {
    slug: "trackar",
    kicker: "SaaS Platform",
    title: "Trackar",
    description: "Workspace access control",
    summary:
      "Trackar controls who may enter a workspace, records every entry and exit, and gives operators a live picture of who is on site, for standalone offices, shared-building operators, and the tenant companies inside them, all from one deployment. I built it for a Lagos-based client as one of two engineers: sole author of the front end and primary author of the backend.",
    image: "/images/trackar.png",
    year: "2025–26",
    stack: [
      "Django",
      "Django REST Framework",
      "PostgreSQL",
      "React",
      "TypeScript",
      "TanStack Query",
      "Tailwind CSS",
      "Render",
    ],
    links: { demo: "https://trackar.site" },
    caseStudy: {
      problem:
        "Most buildings still run their front desk on a paper logbook: no way to know who is inside right now, no approval step before a visitor turns up, and no audit trail when something goes wrong. Shared buildings make it harder: the operator needs to see everyone, but each company renting space must never see its neighbours.",
      challenge:
        "Tenancy has three shapes, not one. A Workspace Hub operates a building and sees its own activity plus every tenant's; a Tenant Company inside that hub is fully isolated and can never see the hub or a sibling; a Standalone Organization is neither. Rather than filter by organization in each view (where one forgotten filter leaks one customer's people and movements to another), isolation is enforced in the data layer, by an organization-scoped model manager applied at query time across all 13 models. A hub reads across its tenants only by deliberately widening that scope, which is why hub and tenant admins see different data on the same screens.",
      architecture:
        "A Django and Django REST Framework API on PostgreSQL: 97 endpoints across 8 feature modules, refactored from a single monolithic app into feature slices over shared core, business, and infrastructure layers, with business rules in service functions instead of HTTP views. A separate scheduler worker auto-checks-out stale visits, isolated as its own service so scheduled work never competes with API traffic. The React 19 and TypeScript front end (177 components and 35 routes, split into 72 lazy-loaded chunks) covers role-aware dashboards, an entry kiosk with live camera QR scanning, a drag-and-drop ID-card designer with PNG export, and occupancy analytics. It runs on Render (API, worker, Postgres) and Vercel, with Sentry, PostHog, Cloudinary, and Resend around it, and 775 automated tests across both halves.",
      decisions: [
        "Members and visitors are two separate identities with their own credentials and login endpoints, not one table with a role column: staff sign in with a four-digit PIN scoped to their organization, while visitors self-register with email and password and belong to no organization.",
        "A ranked five-tier role system (Super Admin → Admin → Manager → Staff → Badge Holder) with weight-based checks, so no one can grant a role at or above their own.",
        "Rate limits on credential endpoints live in a shared database cache, so a four-digit PIN's 10,000 combinations stay throttled at the real limit across all four Gunicorn workers instead of quietly multiplying by four.",
        "The visitor lifecycle is an explicit state machine: request, host approval, single-use QR token, staffed check-in and check-out, then an immutable access log.",
        "Attendance is modelled separately from access logs: recurring schedules with a stable public link, used to integrate church attendance capture from ChurchTeck without bending the access model to fit.",
      ],
      whatWentWrong:
        "Putting isolation in the data layer only protects the queries that go through it. A pre-launch audit I ran still turned up a few cross-organization access gaps in code paths that sat outside that layer, plus a race condition in check-in. Each was a small, targeted fix and now has a regression test, but they had made it into code that looked correct and had passed review.",
      lessons:
        'Security boundaries have to live somewhere no one can forget them, and then you still have to go looking for the places that route around them. The audit taught me to treat "most queries are scoped" as a finding, not a reassurance: the one unscoped path is the whole story.',
    },
  },
  {
    slug: "watcher",
    kicker: "Developer Tool",
    title: "Watcher",
    description: "Design tools for live React apps",
    summary:
      "Watcher opens a running React app like a design file: rulers and guides, live style editing, a free canvas, responsive previews, an SVG editor, design-system extraction, and a profiler, all on top of the real page. Edits write back into your JSX as Tailwind classes, and production builds ship none of it.",
    image: "/images/watcher.png",
    year: "2026",
    stack: [
      "React",
      "TypeScript",
      "Vite",
      "Babel",
      "Tailwind CSS",
      "Web Extensions",
    ],
    links: {
      demo: "https://www.npmjs.com/package/@nweremizu/watcher-ui",
      github: "https://github.com/Nweremizu/watcher",
    },
    caseStudy: {
      problem:
        "Polishing UI means bouncing between three places: a design tool that isn't the real app, browser devtools whose edits vanish on reload, and the code where you retype every value by hand. I wanted to tune spacing, type, and colour directly on the running app and have those edits land in the source.",
      challenge:
        "Writing edits back to code safely. A Vite plugin stamps every JSX element with its source line and column before React's own transform runs, so a click on the page maps to an exact spot in a file. Write-back then parses that file with Babel and edits it with magic-string (never regex on code), turning each CSS change into the matching Tailwind utility on the scale (padding-top: 44px → pt-11) or an arbitrary value when nothing fits. It replaces only the class for the same property, leaves md: and hover: variants alone, and an edit made in the 820px preview is written as md:. When it can't edit safely (a fully computed className, or an element rendered by .map() that would change every copy), it says so instead of guessing.",
      architecture:
        "The overlay is a React app mounted in its own shadow root and React root, so the host app's CSS can't reach it and it never re-renders the host's tree. Before it's opened it costs under 1 kB gzipped; the ~103 kB overlay chunk is fetched while the browser is idle. A production export condition resolves the package to an empty module, so Vite and webpack builds ship zero bytes. The Vite plugin only runs on the dev server, only accepts same-origin requests, and only writes .jsx/.tsx files inside the project. A Chrome and Firefox extension runs the same overlay on any website, minus write-back.",
      decisions: [
        "Dev-only by construction: an export condition and a NODE_ENV guard instead of asking people to wrap it in an if.",
        "Shadow-root isolation in both directions: the app's styles can't break the tool, and the tool can't restyle the app.",
        "Responsive previews are real viewports, so media queries and vw units respond as they would on a device, and inspecting inside a preview shares one undo history with the main page.",
        "Your editor's git diff is the review step: write-back makes ordinary source edits rather than keeping a hidden layer of overrides.",
        "Shipped 0.1 with the unfinished Animate tab hidden behind a flag rather than released half-done.",
      ],
      whatWentWrong:
        "Write-back only speaks Tailwind for now; other styling approaches get live editing and Copy CSS but no save-to-code. The animation timeline isn't finished, which is why it's flagged off. And the overlay grew fast: most of its UI still lives in one very large component file that needs splitting before the next round of features.",
      lessons:
        "Developer tools live or die on trust. People will only let a tool rewrite their source if every write is predictable, reviewable, and refuses loudly when it's unsure, so the guardrails ended up being more work than the edits themselves, and they're the part that matters most.",
    },
  },
  {
    slug: "keipy",
    kicker: "Mobile App",
    title: "Keipy",
    description: "Invoicing redefined",
    summary:
      "Keipy is a mobile invoicing and inventory app I built for my dad's business, to replace an expensive invoicing platform with something cheaper, better-designed, and built to keep working when the connection drops.",
    image: "/images/keipy.png",
    year: "2026",
    stack: [
      "React Native",
      "Expo",
      "TypeScript",
      "Supabase",
      "TanStack Query",
      "NativeWind",
    ],
    links: { demo: "https://keipy.xyz" },
    caseStudy: {
      problem:
        "My dad's business was paying a premium subscription for an invoicing tool with a dated interface and thin inventory features. He already knew I could build software, so instead of paying for a tool built for someone else's workflow, I built one for his: quoting, invoicing, and stock tracking in a single flow, on a UI that feels like 2025 rather than 2015.",
      challenge:
        "This app has to work for a small business owner who doesn't always have a reliable connection. So invoicing, quoting, and payments can't just fail offline; they have to queue. I built an offline write-queue on top of the app's data layer: mutations made while offline pause, show as \"syncing\" in the UI, and replay automatically once the connection comes back, surviving even a full app restart in between.",
      architecture:
        "React Native through Expo, with Supabase as the entire backend (Postgres, auth, and file storage), so I didn't have to build and host a separate API just to ship the product. TanStack Query does double duty as both the server-state cache and the offline mutation queue, backed by local storage for persistence and a network-status listener that knows the moment connectivity returns. Invoices export as real PDFs, generated from an HTML template and shared straight from the device.",
      decisions: [
        "Built the offline queue on the data-fetching layer already in the app (TanStack Query) instead of adding a separate local database: one less moving part, one less thing to keep in sync.",
        "Tied inventory to invoicing directly: issuing an invoice decrements stock on the server and fires a low-stock warning in the same action, instead of treating stock levels as a separate screen someone has to remember to check.",
        "Used the phone's own contacts via expo-contacts for adding clients, so entering a customer doesn't mean retyping a number that's already saved.",
        "Chose Supabase over a custom backend specifically so the project's engineering time went into the actual product, not into hosting and maintaining an API.",
      ],
      whatWentWrong:
        "The offline queue works end to end, but I know of one real edge case that isn't fully handled yet: converting a quote into an invoice while offline involves a read followed by a write, and that sequence isn't as airtight offline as the simpler create/update paths are. It's documented, not hidden, and it's the next thing to close out.",
      lessons:
        "For a tool built for someone who might not have a great connection, offline can't be a feature added later; it has to be part of the data layer from the first design decision, or it never quite fits right. Tying inventory and invoicing into one action instead of two separate screens also confirmed something I keep coming back to: the best interface decisions usually come from watching how someone actually works, not from how the data happens to be modeled.",
    },
  },
  {
    slug: "ekklesia",
    kicker: "Web App",
    title: "Ekklesia",
    description: "Church operating system",
    summary:
      "Ekklesia is church operations software for African congregations: membership, groups, attendance, visitor follow-up, and team access in one multi-tenant platform, built to replace the pile of spreadsheets most churches run on.",
    image: "/images/ekklesia.png",
    year: "2026",
    stack: [
      "Laravel",
      "Inertia.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Recharts",
    ],
    links: { github: "https://github.com/Nweremizu/ekklesia" },
    caseStudy: {
      problem:
        "It started narrow: my own church needed a way to track attendance instead of a paper register. But attendance turned out to be the smallest part of what a growing congregation actually needs to run: membership records, groups, visitor follow-up, and who on the team can see or change what. Those were all still living on scattered spreadsheets, so the real problem was operational, not just a missing feature.",
      challenge:
        "Attendance had to feel casual in the moment (someone marking a roster during a service shouldn't be fighting a form), but also become a trustworthy record afterward. I solved that by letting rosters stay editable during and right after a service, then locking them once the service is finalized, with an explicit override path for the rare correction. Provisional while it's happening, immutable once it's not, correctable when it has to be: that's a harder balance than either \"always editable\" or \"always locked.\"",
      architecture:
        "Laravel on the backend, Inertia.js bridging to a React and TypeScript frontend, so I get one codebase instead of maintaining a separate API and SPA. Every table (churches, members, services, attendance, groups, follow-ups) is scoped to a church_id, which means the platform was built multi-tenant from day one, even though the first real user was my own church. A dashboard built on Recharts turns raw attendance and membership data into something leadership can actually read at a glance: trends, at-risk members, recent joiners, birthdays.",
      decisions: [
        "Multi-tenant from the start (every model scoped by church_id), so the same codebase can serve more than one congregation without a rewrite.",
        "Attendance locking with an explicit override, instead of either permanently-editable rosters or a hard, no-exceptions lock.",
        "Visitors get their own pipeline (stage, priority, due dates, an assigned follow-up owner) rather than being folded into the general member list where they'd get lost.",
        "Dashboard analytics (attendance trends, at-risk members, recent joiners) as a first-class feature, not an afterthought bolted on once data existed.",
      ],
      whatWentWrong:
        "The attendance and analytics UX needed real iteration, because there was no existing workflow to model it against: I had to design it, watch it fail to fit how a real service actually runs, and adjust. The visitor pipeline is the clearest evidence of that: it didn't exist in the first version. It got added once a flat member list stopped being enough to actually track someone from first visit to follow-up to membership.",
      lessons:
        "Good software here is as much about understanding how a church actually operates on a Sunday as it is about writing code. And letting the data model grow only when a real gap shows up (attendance first, then visitors and follow-ups once that gap was obvious) kept the system from being over-built around problems that didn't exist yet.",
    },
  },
  {
    slug: "network-manager",
    kicker: "Hardware",
    title: "Network Manager",
    description: "ESP32-S3 household router",
    summary:
      "A small router built on an ESP32-S3 that sits between the house and the ISP router: per-device download tracking, daily quotas, speed caps, a dashboard served from the board itself, a 128×64 status LCD with a mascot that reacts to what the network is doing, and a cloud archive of daily usage.",
    image: "/images/network-manager.png",
    year: "2026",
    stack: [
      "ESP32-S3",
      "C",
      "ESP-IDF",
      "lwIP",
      "FreeRTOS",
      "React",
      "Cloudflare Workers",
      "D1",
    ],
    hobby: true,
    caseStudy: {
      problem:
        "Our home internet is a capped mobile data plan shared by a laptop, a phone, and a smart TV. When the data ran out early there was no way to tell which device had used it, and no way to stop one device from eating everyone else's share. Off-the-shelf routers with per-device quotas exist, but I wanted to understand the whole path a packet takes, so I built one.",
      challenge:
        "Counting and limiting traffic per device on a microcontroller with no room for a packet-inspection layer. The board runs as a Wi-Fi client to the ISP router and as an access point for the house, with lwIP's built-in NAT between them. I wrapped the access point's link-output function, the last stop before a frame goes out over the air, and read the destination MAC address straight from the Ethernet header. That one hook attributes every downloaded byte to a device and polices it with a per-device token bucket: frames over budget are dropped, and TCP backs off on its own. Replies the board itself sends, like the dashboard and DNS, are skipped so they never count against anyone's quota.",
      architecture:
        "Firmware is about 5,000 lines of C on ESP-IDF and FreeRTOS. Usage counters live in RAM and are written to flash every five minutes, not on every packet, to protect the flash's write lifespan; daily totals reset at NTP-synced local midnight. On first boot a captive portal collects the upstream Wi-Fi details, tests the connection before saving it, and rolls back if it fails. The dashboard is a React, Vite, and Tailwind app built to fixed filenames, gzipped, and served from the board's own flash, with one-second live updates over a WebSocket. A Cloudflare Worker with a D1 database archives daily usage per device, and the status screen is a KS0108 LCD driven through an MCP23017 I/O expander over I2C.",
      decisions: [
        "Over quota means throttled, not blocked: a device that hits its daily limit drops to a slow fixed speed instead of losing the connection, and an always-on per-device speed cap applies alongside it, whichever is lower.",
        "Cloud uploads are safe to retry because a repeated snapshot can only ever increase the stored total for a device and day.",
        "The board keeps the cloud token private and proxies analytics requests itself, so the browser never sees a credential and the Worker never exposes the local dashboard.",
        "Cloud requests run in a bounded background worker, one at a time, so a slow upstream can never block the board's web server.",
        "The LCD only sends the parts of the screen that changed, streamed as a single I2C transfer, and a host-side renderer draws every screen and mood to an image so the UI can be checked without flashing the board.",
      ],
      whatWentWrong:
        "Software NAT on an ESP32-S3 tops out at roughly 2 to 8 Mbps. That's fine for browsing and messaging, not for a house that streams 4K, and it's an accepted limit of the hardware rather than something to fix. Devices are identified by MAC address, so a phone using a private, randomised address shows up as a new device, which I haven't solved. And the latency targets for the dashboard have so far only been checked against a desktop mock; measuring them on the real board with seven devices connected is still on the list.",
      lessons:
        "Embedded work rewards finding the one place everything already passes through. A single hook at the right layer replaced what would otherwise have been packet parsing, connection tracking, and a lot more code. It also taught me to respect the hardware's limits up front: flash has a write budget, the NAT has a ceiling, and the design is better for saying so in the spec instead of discovering it later.",
    },
  },
];
