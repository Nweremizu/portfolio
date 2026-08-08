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
    description: "Cinematic screen recorder",
    summary:
      "Quiro is a desktop screen recorder and editor for people who need a polished product demo without hiring a video editor — recording, cursor-aware zoom, captions, and an AI editing agent in one app, with native capture pipelines for Windows and macOS.",
    image: "/images/quiro.png",
    year: "2025",
    stack: [
      "Electron",
      "React",
      "TypeScript",
      "PixiJS",
      "FFmpeg",
      "Swift",
      "C++",
      "Claude",
    ],
    links: { github: "https://github.com/Nweremizu/quiro" },
    caseStudy: {
      problem:
        "Making a polished product demo video usually means either paying for a subscription tool or paying a video editor. Both cost money and time most people don't have on hand. I wanted a recorder that did the work a video editor would — smooth cursor motion, intentional zoom, clean framing — automatically.",
      challenge:
        "Neither Windows nor macOS exposes cursor state the same way, so \"track the cursor\" turned out to be two different engineering problems, not one. On Windows, the OS hands you the cursor's identity directly — a native helper just polls it and matches it against the small set of stock system cursors. On macOS there's no equivalent API: I had to render each candidate system cursor to a bitmap and score the live cursor against them by shape, with an Accessibility-API fallback that inspects the currently focused UI element when the bitmap match is inconclusive. Two genuinely different native implementations, one for each platform, to produce what looks like the same feature.",
      architecture:
        'Electron for the app shell, React and TypeScript for the editor UI, PixiJS as the real-time compositor for cursor, webcam, captions, and annotation layers, and FFmpeg for encoding and export. Capture itself drops down to native code per platform — a Windows Graphics Capture pipeline in C++, and a ScreenCaptureKit pipeline in Swift for macOS — because Electron alone can\'t get the frame rate, GPU access, or system-audio capture a screen recorder actually needs. The AI editing agent runs as a tool-calling loop against Claude (with a MiniMax fallback provider): a lightweight "Recording Brain" fuses the caption transcript and cursor telemetry into a compact summary, the model reasons over eight defined editing tools — auto-zoom on clicks, remove silences and filler words, generate captions, add annotations, and more — and every run is wrapped in a single undo step.',
      decisions: [
        "Went fully native for capture on each platform (WGC + C++ on Windows, ScreenCaptureKit + Swift on macOS) rather than relying on Electron's built-in screen-capture APIs, because neither the frame rate nor system-audio capture were good enough through the generic path.",
        'Built a small "Recording Brain" summary layer instead of feeding the AI agent raw transcript and cursor data — keeps token usage bounded even on long recordings.',
        "Gave the agent a fixed, explicit tool contract (eight named tools with JSON schemas) instead of open-ended free-form edits, and added a safety net that disables a tool for the rest of a run after it fails twice, so the agent can't get stuck retrying something that can't succeed.",
        "Kept the whole agent run inside one undo step rather than one undo step per edit, so a bad AI pass is always a single keystroke away from gone.",
      ],
      whatWentWrong:
        "The AI agent currently applies its edits directly — there's no preview or plain-language summary before changes land, and undo is the only way back if a run goes wrong. That's a deliberate, acknowledged gap in the current roadmap, not an oversight: trust-building features like edit previews and per-change revert are planned but not built yet. Linux support is the other honest limitation — there's no native capture helper for it yet, so it falls back to generic behavior rather than the tuned pipeline Windows and macOS get.",
      lessons:
        'Architecture has to come first, especially once AI is generating a meaningful share of the code — get the structure wrong early and every feature after it costs more than it should. The cursor-tracking work also taught me that "the same feature" on two operating systems can mean two genuinely different implementations under the hood, and that\'s fine as long as the seam between them is clean.',
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
    caseStudy: {
      problem:
        "My dad's business was paying a premium subscription for an invoicing tool with a dated interface and thin inventory features. He already knew I could build software, so instead of paying for a tool built for someone else's workflow, I built one for his — quoting, invoicing, and stock tracking in a single flow, on a UI that feels like 2025 rather than 2015.",
      challenge:
        "This app has to work for a small business owner who doesn't always have a reliable connection. So invoicing, quoting, and payments can't just fail offline — they have to queue. I built an offline write-queue on top of the app's data layer: mutations made while offline pause, show as \"syncing\" in the UI, and replay automatically once the connection comes back, surviving even a full app restart in between.",
      architecture:
        "React Native through Expo, with Supabase as the entire backend — Postgres, auth, and file storage — so I didn't have to build and host a separate API just to ship the product. TanStack Query does double duty as both the server-state cache and the offline mutation queue, backed by local storage for persistence and a network-status listener that knows the moment connectivity returns. Invoices export as real PDFs, generated from an HTML template and shared straight from the device.",
      decisions: [
        "Built the offline queue on the data-fetching layer already in the app (TanStack Query) instead of adding a separate local database — one less moving part, one less thing to keep in sync.",
        "Tied inventory to invoicing directly: issuing an invoice decrements stock on the server and fires a low-stock warning in the same action, instead of treating stock levels as a separate screen someone has to remember to check.",
        "Used the phone's own contacts via expo-contacts for adding clients, so entering a customer doesn't mean retyping a number that's already saved.",
        "Chose Supabase over a custom backend specifically so the project's engineering time went into the actual product, not into hosting and maintaining an API.",
      ],
      whatWentWrong:
        "The offline queue works end to end, but I know of one real edge case that isn't fully handled yet: converting a quote into an invoice while offline involves a read followed by a write, and that sequence isn't as airtight offline as the simpler create/update paths are. It's documented, not hidden, and it's the next thing to close out.",
      lessons:
        "For a tool built for someone who might not have a great connection, offline can't be a feature added later — it has to be part of the data layer from the first design decision, or it never quite fits right. Tying inventory and invoicing into one action instead of two separate screens also confirmed something I keep coming back to: the best interface decisions usually come from watching how someone actually works, not from how the data happens to be modeled.",
    },
  },
  {
    slug: "ekklesia",
    kicker: "Web App",
    title: "Ekklesia",
    description: "Church operating system",
    summary:
      "Ekklesia is church operations software for African congregations — membership, groups, attendance, visitor follow-up, and team access in one multi-tenant platform, built to replace the pile of spreadsheets most churches run on.",
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
    caseStudy: {
      problem:
        "It started narrow: my own church needed a way to track attendance instead of a paper register. But attendance turned out to be the smallest part of what a growing congregation actually needs to run — membership records, groups, visitor follow-up, and who on the team can see or change what. Those were all still living on scattered spreadsheets, so the real problem was operational, not just a missing feature.",
      challenge:
        "Attendance had to feel casual in the moment — someone marking a roster during a service shouldn't be fighting a form — but also become a trustworthy record afterward. I solved that by letting rosters stay editable during and right after a service, then locking them once the service is finalized, with an explicit override path for the rare correction. Provisional while it's happening, immutable once it's not, correctable when it has to be — that's a harder balance than either \"always editable\" or \"always locked.\"",
      architecture:
        "Laravel on the backend, Inertia.js bridging to a React and TypeScript frontend, so I get one codebase instead of maintaining a separate API and SPA. Every table — churches, members, services, attendance, groups, follow-ups — is scoped to a church_id, which means the platform was built multi-tenant from day one, even though the first real user was my own church. A dashboard built on Recharts turns raw attendance and membership data into something leadership can actually read at a glance: trends, at-risk members, recent joiners, birthdays.",
      decisions: [
        "Multi-tenant from the start (every model scoped by church_id), so the same codebase can serve more than one congregation without a rewrite.",
        "Attendance locking with an explicit override, instead of either permanently-editable rosters or a hard, no-exceptions lock.",
        "Visitors get their own pipeline — stage, priority, due dates, an assigned follow-up owner — rather than being folded into the general member list where they'd get lost.",
        "Dashboard analytics (attendance trends, at-risk members, recent joiners) as a first-class feature, not an afterthought bolted on once data existed.",
      ],
      whatWentWrong:
        "The attendance and analytics UX needed real iteration, because there was no existing workflow to model it against — I had to design it, watch it fail to fit how a real service actually runs, and adjust. The visitor pipeline is the clearest evidence of that: it didn't exist in the first version. It got added once a flat member list stopped being enough to actually track someone from first visit to follow-up to membership.",
      lessons:
        "Good software here is as much about understanding how a church actually operates on a Sunday as it is about writing code. And letting the data model grow only when a real gap shows up — attendance first, then visitors and follow-ups once that gap was obvious — kept the system from being over-built around problems that didn't exist yet.",
    },
  },
];
