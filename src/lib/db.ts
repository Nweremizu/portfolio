import { createClient } from "@libsql/client";

/**
 * Points at a local file by default so the app works out of the box in dev.
 * Swap DATABASE_URL (+ DATABASE_AUTH_TOKEN) for a Turso connection string to
 * move onto a real server — same client, same SQL, no code changes.
 */
const client = createClient({
  url: process.env.DATABASE_URL ?? "file:./local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export interface Post {
  id: number;
  slug: string;
  title: string;
  date: string;
  body: string;
  coverImage: string;
  coverCreditName: string;
  coverCreditUrl: string;
}

const POST_COLUMNS =
  "id, slug, title, date, body, coverImage, coverCreditName, coverCreditUrl";

/** libsql rows aren't always plain objects — normalize before they cross a Server->Client Component boundary. */
function toPost(row: Record<string, unknown>): Post {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    date: String(row.date),
    body: String(row.body),
    coverImage: String(row.coverImage),
    coverCreditName: String(row.coverCreditName),
    coverCreditUrl: String(row.coverCreditUrl),
  };
}

let initialized: Promise<void> | null = null;

/** Creates the table (if needed) and seeds it (only if it's empty), once per process. */
function ready() {
  if (!initialized) {
    initialized = init();
  }
  return initialized;
}

async function init() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      body TEXT NOT NULL,
      coverImage TEXT NOT NULL,
      coverCreditName TEXT NOT NULL,
      coverCreditUrl TEXT NOT NULL
    )
  `);

  const { rows } = await client.execute("SELECT COUNT(*) as count FROM posts");
  if (Number(rows[0].count) === 0) {
    for (const post of seedPosts) {
      await client.execute({
        sql: "INSERT INTO posts (slug, title, date, body, coverImage, coverCreditName, coverCreditUrl) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [
          post.slug,
          post.title,
          post.date,
          post.body,
          post.coverImage,
          post.coverCreditName,
          post.coverCreditUrl,
        ],
      });
    }
  }
}

export async function getAllPosts(): Promise<Post[]> {
  await ready();
  const { rows } = await client.execute(
    `SELECT ${POST_COLUMNS} FROM posts ORDER BY date DESC`,
  );
  return rows.map(toPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  await ready();
  const { rows } = await client.execute({
    sql: `SELECT ${POST_COLUMNS} FROM posts WHERE slug = ?`,
    args: [slug],
  });
  return rows[0] ? toPost(rows[0]) : null;
}

export async function getPostById(id: number): Promise<Post | null> {
  await ready();
  const { rows } = await client.execute({
    sql: `SELECT ${POST_COLUMNS} FROM posts WHERE id = ?`,
    args: [id],
  });
  return rows[0] ? toPost(rows[0]) : null;
}

export async function createPost(post: Omit<Post, "id">): Promise<void> {
  await ready();
  await client.execute({
    sql: "INSERT INTO posts (slug, title, date, body, coverImage, coverCreditName, coverCreditUrl) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [
      post.slug,
      post.title,
      post.date,
      post.body,
      post.coverImage,
      post.coverCreditName,
      post.coverCreditUrl,
    ],
  });
}

export async function updatePost(
  id: number,
  post: Omit<Post, "id">,
): Promise<void> {
  await ready();
  await client.execute({
    sql: "UPDATE posts SET slug = ?, title = ?, date = ?, body = ?, coverImage = ?, coverCreditName = ?, coverCreditUrl = ? WHERE id = ?",
    args: [
      post.slug,
      post.title,
      post.date,
      post.body,
      post.coverImage,
      post.coverCreditName,
      post.coverCreditUrl,
      id,
    ],
  });
}

export async function deletePost(id: number): Promise<void> {
  await ready();
  await client.execute({ sql: "DELETE FROM posts WHERE id = ?", args: [id] });
}

/** images.unsplash.com hotlink, cropped to a consistent width — no local asset to manage. */
function unsplash(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?q=80&w=1600&auto=format&fit=crop`;
}

const seedPosts: Omit<Post, "id">[] = [
  {
    slug: "the-week-i-almost-let-ai-design-my-app",
    title: "The week I almost let AI design my whole app",
    date: "2025-10-14",
    coverImage: unsplash("1532622785990-d2c36a76f5a6"),
    coverCreditName: "Kaleidico",
    coverCreditUrl: "https://unsplash.com/@kaleidico",
    body: `There's a specific kind of embarrassment that comes from opening your own codebase two weeks after writing it and not recognizing it. Not because you forgot what you built — because you're not sure you're the one who built it.

That happened to me while I was putting together the early skeleton of Quiro's AI editing agent, the part of the app that watches a screen recording and decides what to zoom into, what silence to cut, where a caption should land. I remember the exact moment, actually. It was late, I'd been going back and forth with an AI coding assistant for maybe three hours straight, and I opened a file to fix a small bug and just... paused. There was a whole abstraction layer in there — a queue, a dispatcher, some kind of event bus — that I didn't remember deciding to build. It worked, technically. It also had nothing to do with the shape of the problem I was actually solving. It was there because at some point I'd asked for "a way to handle multiple edit requests" and the model had reached for the most generic, most textbook answer to that question, and I'd said "looks good" and kept moving.

I want to be honest about how that happens, because I don't think it's really about the AI being wrong. It's about a very specific trap that only exists once a tireless, endlessly agreeable collaborator is in the loop with you.

## The trap nobody warns you about

Here's the thing nobody tells you when you start pairing seriously with an AI coding tool: it will never get tired, it will never push back unless you ask it to, and it will produce *plausible* code at a speed that completely outpaces your ability to evaluate whether it's *right*. Plausible is the dangerous word. Plausible code compiles. Plausible code passes the obvious test case. Plausible code looks, at a skim, like something a competent engineer would write — because it's trained on a mountain of competent engineers' code. What plausible code does not reliably do is fit the actual shape of your actual problem, the one that only exists in your head and in the handful of decisions you've made so far that haven't been written down anywhere.

Normally, when you're coding alone, your own fatigue acts as a kind of governor. You get tired of typing boilerplate, so you go find the shortcut. You get tired of re-deriving the same logic in three places, so you extract a function. Friction, annoyingly, was doing some of your architectural thinking for you, just by making the lazy path and the good path the same path more often than you'd expect. Take the friction away — hand the typing to something that never tires — and that governor disappears. You can generate an entire subsystem in the time it used to take to write one function signature. Which means you *will*, whether or not that subsystem should exist yet.

I built and half-liked that queue-and-dispatcher thing for about two days before I admitted it was solving a problem I didn't have. Quiro's agent, at the time, needed to do one thing: take a recording, reason over what happened in it, and call a small number of well-defined tools — zoom here, cut this silence, add a caption there. It did not need a generic multi-consumer event architecture. It needed eight tools and a model that knew how to pick between them. I ripped the whole layer out. It felt like a waste of two days. It was actually the two days that taught me the lesson this whole post is about.

## Deciding the shape before asking for the fill

What I do differently now — and what I wish someone had just told me plainly instead of me having to embarrass myself into it — is decide the shape of a feature completely, on paper or in a plain comment block, *before* I open a chat window with any AI at all. Not a full spec. Just: what are the nouns, what are the verbs, where does state live, what's allowed to change what. For the editing agent, that meant sitting down and writing out, by hand, the exact list of things the agent is allowed to do to a recording. Auto-zoom on a click. Remove a silence. Remove a filler word. Generate captions. Add an annotation. A small number of named, boring, specific verbs — eight of them, in the end — each with a fixed JSON schema for its inputs. No open-ended "edit this recording however you see fit." A closed set of moves, decided by me, in a normal state of mind, before any model got involved.

Once that shape existed, working with an AI assistant on the implementation stopped being dangerous and started being genuinely wonderful. I could ask it to implement the "remove silence" tool and know, going in, exactly what the function's contract should look like, so I could tell in about four seconds whether what came back matched. The model wasn't deciding the architecture anymore. It was filling in a shape I'd already committed to. That's a completely different working relationship than the one I had during those two lost days, where I was essentially asking a very fast, very confident intern to also be the architect, and being surprised when the results didn't hold together.

I think this is the actual, unglamorous answer to "how do you use AI coding tools responsibly," and it's less exciting than most of the takes I see on it. It's not about which model, which IDE plugin, which prompt template. It's about whether you did the boring, slightly old-fashioned thing of deciding what you're building *before* you handed anyone — human or model — a blank page and asked them to start typing. The fastest way to convince yourself a design is finished is to let a tireless collaborator start producing convincing-looking output against it. The output will always look done. The only thing that tells you whether it's actually done is whether you knew the shape first.

## What I'd tell past-me

If I could go back to that night — the one where I opened my own file and didn't recognize it — I wouldn't tell myself to stop using AI tools. They're genuinely how I ship as much as I do now, and I'm not interested in pretending otherwise for the sake of sounding like a purist. I'd just tell myself: you're allowed to think first. Slower, on purpose, with nobody generating anything, for as long as it takes to know the eight verbs instead of zero. It costs you an evening. It saves you the two days I actually lost, and probably a few more I got lucky enough to avoid. Architecture doesn't get to be the thing you clean up after the fact anymore. It has to come first, because the thing that used to force it to come first — your own tiredness — isn't there to save you anymore.`,
  },
  {
    slug: "the-cursor-bug-that-humbled-me",
    title: "The cursor bug that humbled me",
    date: "2025-12-02",
    coverImage: unsplash("1607799279861-4dd421887fb3"),
    coverCreditName: "Mohammad Rahmani",
    coverCreditUrl: "https://unsplash.com/@afgprogrammer",
    body: `I want to tell you about the single most humbling week of building Quiro, and it wasn't caused by anything you'd expect — not the AI agent, not the video encoding pipeline, not the native capture code that everyone warns you is scary. It was the cursor. The little arrow. The thing that's been part of every computer interface since before I was born, and that I genuinely assumed would be the easy part of the whole project.

Quiro's whole pitch, if you don't know it, is that it should feel like you hired a video editor without actually hiring one — smooth cursor motion, an intentional zoom that follows what you're doing, clean framing that reacts to where your attention is on screen. All of that hinges on one basic capability: the app has to know, at every moment, what the cursor actually looks like. Is it the default arrow? A text-select I-beam? A resize handle? A hand, for a link? Because the zoom and framing logic behaves differently depending on the answer — you zoom into a click differently than you zoom into a text selection.

I budgeted about two days for "detect the current cursor shape." I want you to sit with how wrong that estimate turned out to be, because I think the story of why is more useful than any tidy lesson I could bolt onto the end of it.

## Windows first, because Windows is polite about this

On Windows, this problem is almost suspiciously easy. There's a proper system API that will just tell you, honestly and directly, which cursor is currently loaded — you ask, it answers, you're done. I wrote a small native helper in C++ that polls this, matches the result against the handful of stock system cursors, and reports back. It took about half a day, most of which was just getting comfortable with the API surface. I remember feeling genuinely pleased with myself. I thought: okay, this native-code stuff isn't so bad, two platforms, roughly symmetric effort, I'll have this whole feature done by the weekend.

Then I opened my Mac.

## macOS, and the day I learned to stop assuming symmetry

There is no equivalent API on macOS. I want to say that again because it took me an embarrassingly long time to accept it rather than keep searching for the API I was sure I was just failing to find: there is no built-in, ask-and-receive way to find out what the current system cursor looks like on macOS. The platform simply does not expose that fact the way Windows does. I spent the better part of a day convinced I was missing something obvious — reading old Stack Overflow threads from a decade ago, digging through Apple's documentation archaeology, trying deprecated Carbon-era APIs out of sheer desperation — before I accepted that the honest answer was "you have to figure this out yourself."

What I ended up building instead is, frankly, a little bit unhinged, and I say that with affection. I render every candidate system cursor — the arrow, the I-beam, the resize handles, all of them — to a bitmap ahead of time. Then, at runtime, I grab the live cursor image and score it against that whole set by shape, looking for the closest match. When that bitmap comparison comes back ambiguous — and it does, more than you'd hope — there's a fallback that reaches into the macOS Accessibility API to inspect whatever UI element currently has focus, and infers the likely cursor from that context instead. Two independent detection strategies, stitched together, to do the one thing Windows just tells you for free.

That took the better part of two weeks, not two days. Two genuinely different implementations, in two different native languages — C++ on one side, Swift on the other — solving what looks, from the outside, like exactly the same feature. A user moving their mouse around on a Mac has no idea any of this is happening. They just see the cursor tracked smoothly, same as on Windows. The seams are supposed to be invisible. That's the whole job.

## What I actually walked away with

My first instinct, once both were finally working, was to feel a little annoyed at the asymmetry — like I'd been cheated out of the tidy, symmetric solution I was owed. I even spent a day trying to design some kind of unified \`CursorProvider\` interface that would make both platforms look the same from the outside, as if hiding the difference in an abstraction would retroactively make the difference not exist. It was a waste of that day. Forcing artificial symmetry onto two platforms that are genuinely built differently just means you're designing to the lowest common denominator, which on this particular problem is exactly the capability macOS doesn't have.

The better use of my time — the thing I should have gone to immediately instead of after a wasted day — was accepting that the implementations were going to diverge, and putting all my design energy into making the *seam* between them clean instead. One small, simple interface that the rest of the app depends on — "what does the cursor look like right now" — with every bit of platform-specific weirdness fenced off behind it, invisible to everything downstream. The rest of Quiro doesn't know or care that one platform answers this question honestly and the other one requires a small act of forensic guesswork. It just asks the question and gets an answer.

I think about this one a lot, honestly, more than the estimate-blowing part of it. Not every difference between two platforms is a flaw in your abstraction that you failed to hide well enough. Sometimes it's just what the platforms actually are, underneath the parts we usually take for granted — and the humbling, useful skill isn't forcing them to look the same. It's knowing exactly where to draw the line so nobody else ever has to find out they're not.`,
  },
  {
    slug: "building-keipy-for-my-dads-shop",
    title:
      'Building Keipy for my dad\'s shop, and what "offline-first" actually means',
    date: "2026-02-18",
    coverImage: unsplash("1632152133952-98b268dc4b86"),
    coverCreditName: "2H Media",
    coverCreditUrl: "https://unsplash.com/@2hmedia",
    body: `My dad has run his own business for years, and for most of that time, he paid a monthly subscription for an invoicing tool that he mildly resented every single time he opened it. Dated interface, thin inventory features, the kind of software that clearly hadn't been touched by anyone who actually works in a shop in a long time. He knew I built software for a living. At some point, over dinner, he half-joked that I should just build him something better. I don't think he expected me to actually do it. I did it anyway, and it turned into Keipy — and it ended up teaching me one of the most stubborn lessons I've internalized as an engineer, one I now treat as close to a rule as I let myself have.

## The assumption I almost shipped with

When I started sketching Keipy, my first instinct — and I think this is most people's first instinct — was to build the "normal" version first. Quoting, invoicing, stock tracking, all talking straight to a server, all assuming a connection is just there, the way it basically always is on my own laptop, sitting in my own apartment, on my own reliable wifi. Get that working end to end, ship it, and then, once it's stable, go back and "add offline support" as a follow-up feature. That's the natural order of things. Build the happy path, then armor it.

The thing that stopped me was actually just watching my dad work for an afternoon. His shop's connection drops. Not dramatically, not as some rare edge case — casually, a few times a day, sometimes for a few seconds, sometimes for longer, the way an aging router and a not-great ISP conspire to do in a lot of small businesses that aren't going to spend real money fixing an internet connection that's "basically fine." He'd be mid-invoice, phone in hand, customer standing right there, and the spinner would just sit there. Watching that happen once was enough to kill the plan I'd already half-written in my head. If I shipped the "normal" version first, this exact moment — a customer standing at the counter while a screen hangs — was going to be the first bad experience real users had with something I built for my own father. I couldn't stomach that.

## Why bolting it on later doesn't actually work

Here's the part I want to really get across, because I don't think "make it work offline" sounds like a big deal until you've actually tried to retrofit it into something that wasn't built for it. Offline isn't a network problem. It's a *data modeling* problem, and it touches almost everything once you take it seriously. What does it mean for a write to be "pending"? How do you show a user the difference between "saved" and "saving, please wait, do not close the app"? What happens if two edits to the same invoice happen in different offline windows and then both try to sync? What happens if the app gets killed — not gracefully closed, actually killed, by the OS running low on memory, or the phone dying — mid-write? None of these are things you can duct-tape onto a data layer that was designed assuming the network is basically always there. I've watched other projects try, and the result is always the same flavor of miserable: a write that partially applies and leaves things in a weird half-state, a UI that genuinely cannot tell the user whether something saved or not, a sync queue that quietly forgets what it was doing the moment the app restarts.

So I made a decision early, and it was uncomfortable at the time because it slowed the whole first month of building down: every single mutation in Keipy — every invoice, every quote, every stock adjustment — goes through the exact same offline-aware queue, regardless of whether the network happens to be up in that particular instant. There is no "online path" and "offline path" as two different code branches that I'm hoping stay in sync with each other forever. There's one path. Online is just the state where the queue happens to drain almost instantly, so fast you never notice it's there. Offline is the state where it doesn't drain yet, and sits there patiently, clearly marked as "syncing" in the UI, until the connection comes back — surviving a full app restart in between if it has to, because my dad's phone restarts apps constantly and I was not going to build something that loses his work every time that happens.

Under the hood it's less exotic than it probably sounds: I leaned on the data-fetching layer already in the app to double as the offline mutation queue, backed by local storage for persistence, with a listener watching for the moment connectivity actually comes back. One less moving part than building a whole separate local database just for this. And because invoicing is tied directly to stock in the same action — issuing an invoice decrements inventory and can fire a low-stock warning in that same beat — I didn't want two separate systems for "the thing that happens online" and "the thing that queues offline." One flow, always.

## The gap I'm not going to pretend isn't there

I try to be honest on this blog about what's actually finished versus what's "working, with a known asterisk," and Keipy has one asterisk I think about often. Converting a quote into an invoice, offline, involves a read followed by a write — you're pulling up the quote's current state and then creating something new based on it — and that two-step sequence isn't quite as airtight offline as the simpler single-mutation paths like creating an invoice from scratch. It's a real gap. It's documented, not buried, and it's the next thing on my list to close properly rather than something I'm hoping nobody notices.

If there's a lesson underneath all of this that I keep coming back to, it's that for a tool built for someone who might not have a great connection, "offline" can't be a feature. It has to be a property of the data layer from the very first design decision, because the moment you treat it as something you'll add once the "real" version is stable, you've already built the thing that makes adding it properly nearly impossible. And honestly — the smaller, quieter lesson underneath that one is just: go watch the person you're building for actually try to use it, in their actual shop, on their actual internet. I would have shipped the wrong architecture entirely if I hadn't seen that spinner hang in front of an actual customer, in person, before I'd written more than a few weeks of code.`,
  },
  {
    slug: "from-one-church-to-many",
    title:
      "From one church to fifty: what Ekklesia taught me about staying humble",
    date: "2026-04-22",
    coverImage: unsplash("1682263556627-181761ed74b1"),
    coverCreditName: "Natalya Ukolova",
    coverCreditUrl: "https://unsplash.com/@ucolowa",
    body: `Ekklesia is, by a decent margin, the project I've been the most wrong about along the way — and I mean that as a compliment to how it turned out, not a complaint. It started as the smallest, most unambitious thing I could imagine building: a way for my own church to stop taking attendance with a paper register that someone had to manually tally after every service. That's it. That was the entire plan. I built it, my church used it, and I figured that would basically be the end of the story.

It was not the end of the story. And the way it kept not being the end of the story is what actually taught me something.

## The part I got right, mostly by instinct

Here's the one decision I'm genuinely proud of, and I want to be honest that it wasn't some brilliant foresight — it was closer to a gut feeling I'm glad I listened to. Even while I was building the very first version, the one meant for exactly one church with exactly zero ambition of ever serving a second one, I scoped every single table — churches, members, services, attendance records, groups, follow-ups, all of it — to a \`church_id\`. There was no second church. There was no plan for a second church. I did it anyway, mostly because something about hardcoding "there is only one church" into the shape of the data felt wrong in a way I couldn't fully articulate at the time.

I'm very glad I listened to that feeling, because I've since watched what happens when you don't. "One of something" and "many of something" are not the same schema with a filter clause bolted on afterward — they're a structural decision, and if you get it wrong at the start, fixing it later isn't a migration, it's closer to a rewrite wearing a migration's clothing. Multi-tenancy is one of the few things I now believe genuinely has to be right from day one, even — especially — when day one only has one tenant in it. It's cheap to add when nothing depends on its absence yet. It's brutally expensive once real data, real relationships, and real assumptions have calcified around "there's only ever one of these."

## The part where reality quietly proved me wrong

But the schema wasn't actually the humbling part of this story. The humbling part was the visitor pipeline, and it humbles me a little just retelling it.

In the first version of Ekklesia, there was no such thing as a "visitor." There was just the member list — one flat table of people who come to church. It seemed completely reasonable at the time. Someone shows up, you add them to the list, done. It worked fine for a good while, right up until the exact moment it very obviously didn't: a flat list of names has absolutely no concept that a particular person is three weeks into being gently followed up with, or that they specifically need one particular person from the care team checking in on them, or that "someone who has come twice and might be deciding whether this is their church" is a fundamentally different category of person from "a member who's been here eleven years." None of that distinction existed anywhere in the data. It couldn't, because I hadn't imagined it needed to — until real church leaders, using the real thing, on a real Sunday, ran straight into that wall and told me about it.

I want to sit with how uncomfortable that moment was, honestly, because I think the discomfort is the actual lesson, more than the fix itself. My instinct, in the moment, was almost defensive — I'd built this whole system, and it had a hole in it that I hadn't seen coming, and someone else had to point it out to me by hitting it face-first. That's a specific flavor of humbling that I don't think you can get any other way than by putting something real in front of real users and watching, a little wounded, as they find the thing you missed.

## What I chose not to do, which mattered just as much

Here's the part I think is actually the harder lesson, and the one I have to consciously remind myself of on every project since: I did not, in that first version, try to anticipate the visitor pipeline speculatively. I didn't sit down at the start and think "well, we'll probably need some kind of visitor-tracking thing eventually, let's build a flexible person-status system now just in case." I built the plain, boring member list, because that was the actual problem in front of me, and I let the visitor pipeline not exist until a real gap, hit by real people, made its shape obvious.

I think that restraint mattered every bit as much as the eventual fix did. If I'd guessed at the visitor pipeline up front, I would have guessed wrong in some way — designed it around what I imagined a church's follow-up process looked like instead of what it actually is, which I only learned by watching the flat list fail. The version that exists now — stage, priority, a due date, a specific assigned owner, a pipeline instead of a list — only looks obvious in hindsight. It absolutely was not obvious to me the day I sat down to build the first version, and I don't think it would have been, no matter how hard I'd tried to think ahead.

So the two lessons sit right next to each other, a little in tension, and I think that tension is the actual point: bake in the structural things — multi-tenancy, the stuff that's genuinely expensive to retrofit — from day one, even before you can picture the second customer who'll need it. But everything else, including the feature that feels completely obvious once a real user has shown you the gap it fills, earns its place only when that real gap actually shows up. Not a day before. Building it earlier doesn't make you look prescient. It mostly just means you built the wrong version of it, confidently, and now have to unbuild that too.`,
  },
  {
    slug: "confessions-ai-touched-production-code",
    title: "Confessions of someone who let an AI touch production code",
    date: "2026-07-10",
    coverImage: unsplash("1694903089438-bf28d4697d9a"),
    coverCreditName: "Igor Omilaev",
    coverCreditUrl: "https://unsplash.com/@omilaev",
    body: `I need to describe a sentence to you the way it actually sounded in my head the first time I let myself think about it plainly, because I think the plain version is more honest than any tidied-up explanation I could give afterward: Quiro's AI editing agent can reach directly into a real person's real screen recording — footage they might have spent an hour getting right — and cut it, zoom it, caption it, rearrange it, with no human clicking "approve" before any of it happens.

I sat with that sentence for longer than I'd like to admit before I let myself ship it. It felt reckless in a way that was hard to argue myself out of just by being a decent engineer. "Trust me, the code is good" doesn't actually address the feeling. What finally moved me past it wasn't a clever safety feature, exactly — it was slowly building an actual *contract* the agent operates under, piece by piece, each one added because I'd scared myself with a hypothetical failure mode and then gone and closed it. I want to walk through that contract honestly, including the parts that still make me a little uneasy, because I think the honest version is more useful than the confident one.

## Why I didn't just add a preview step

The obvious, "safe" answer here is the one every product person will suggest immediately: put a preview in front of it. Show the user what the agent wants to do, let them approve or reject each change, and nothing ships unreviewed. I actually agree that's the right long-term answer, and it's genuinely on the roadmap, not abandoned. But I made a real, considered choice not to start there, because a preview-first flow has its own cost that people underrate: it turns every single edit into a moment of friction, a decision the user has to make, over and over, on a tool whose entire pitch is that it should feel like you hired an editor and get to stop thinking about the editing. A tool that asks you to approve forty individual decisions isn't actually saving you the work of editing. It's just relocating the tedium from "doing the cuts" to "reviewing the cuts," and I wasn't convinced that trade was actually a win for the person using it.

So instead of leaning on human review as the safety net, I decided the safety had to live in the *contract*, before the agent ever touches a single frame.

## The contract, and why each piece of it exists

The agent doesn't get a blank prompt and a raw video file, the way you might picture an "AI agent" working if you'd only heard about it secondhand. It gets exactly eight named tools — auto-zoom on a click, remove a silence, remove a filler word, generate a caption, add an annotation, and a few others — each with a fixed JSON schema for its inputs, decided by me, in advance, sitting down with a notebook, not improvised in the moment by whatever the model felt like reaching for. That closed set of moves is the first and most important piece of the safety story, and it's the one I actually wrote about at length in an earlier post on this blog, because I think it's the single most load-bearing decision in the whole system.

The second piece exists because of a much smaller, dumber problem I ran into early: the agent, given raw transcripts and raw cursor telemetry from a long recording, would either blow through its context budget or start reasoning over noise instead of signal. So there's a lightweight internal layer — I call it, only half-jokingly, the "Recording Brain" — that fuses the transcript and the cursor movements into one compact summary before the agent ever sees any of it. It's not a safety feature in the dramatic sense. It's closer to giving the agent a well-organized fact sheet instead of a pile of raw notes, which, it turns out, also makes its decisions noticeably more sensible, almost as a side effect.

The third and fourth pieces are the ones I actually lose the least sleep over, because they're the ones that catch the failure modes I was most afraid of. If a specific tool fails twice within a single run, it gets disabled for the rest of that run — the agent physically cannot get stuck in a loop, retrying some edit that's structurally never going to succeed, burning through a recording's worth of edits on something that was broken from the first attempt. And every single run, no matter how many individual edits it makes across however many tools, gets wrapped in one single undo step. Not one undo per edit. One undo for the whole run. I remember deciding this after imagining, uncomfortably specifically, a bad pass where the agent makes nine reasonable-looking small mistakes in a row, each individually forgettable, that add up to something the user hates — and realizing that if undoing that meant clicking undo nine times, hoping you counted right, nobody would ever trust it after the first bad run. One keystroke, the whole run gone, full stop, is the version of "safe" I could actually stand behind.

## The part I'm still not fully at peace with

I want to end on the honest part rather than the tidy part. There's still no preview, still no plain-language summary of what's about to happen before it happens — undo is genuinely the only way back, and that's a real, current limitation, not a hypothetical one I'm being modest about. I think about it every time someone new tries Quiro's agent for the first time. It's a deliberate, acknowledged gap in the roadmap right now, not an oversight I haven't noticed — the trust-building features, the preview, the plain-language "here's what I'm about to do," are genuinely planned, not quietly abandoned. But "planned" doesn't mean "shipped," and I'd rather say that plainly here than pretend the current version is more finished than it is.

If there's a shape to all of this that I keep finding myself repeating, to myself and now to you, it's this: an agent given free rein over natural language, with nothing constraining what it's allowed to reach for, is a liability, full stop, no matter how good the underlying model is. But an agent given a small, fixed, genuinely well-scoped set of tools — with a cheap, reliable escape hatch for the moments it gets it wrong — can be trusted with something real. Not because it won't make mistakes. It will. But because the blast radius of any single mistake is bounded, understood, and one keystroke from gone. That's not the same thing as safe. It's the version of safe that was actually available to me, and I think it's more honest than pretending I'd solved the harder problem instead.`,
  },
];
