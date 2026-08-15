# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Plain static HTML/CSS/JS, no build step. Data lives in hand-edited `.js` files
(`scripts/tools.js`, `scripts/contributions.js`, `scripts/contact.js`) that
renderer scripts draw from. Deployed by pushing to GitHub Pages.

Stack choice was **delegated** to Impeccable and resolved as: keep it plain
static. The site is a handful of pages whose content layer is already separated
into data files; a framework and build pipeline would add a deploy step and a
toolchain without buying leverage this project needs. Revisit only if the page
count or content model outgrows hand-edited data files.

## Users

**Primary: hiring managers, technical leads, and recruiters filling senior or
lead Unity roles — remote or outside India.** They arrive from a LinkedIn
profile link, often on a phone, and are deciding in roughly thirty seconds
whether this person is worth a conversation. Critically, they have *not* heard
of ForeExcel, EDIIIE, Sinverse, or Frolic Frog — company names carry no weight
with this audience, so the work itself has to do all the arguing.

**Secondary: Unity developers evaluating the editor tools.** They arrive at a
tool page directly (GitHub, Asset Store, a shared link) wanting to know what the
tool does and whether to install it. They are not the audience the landing page
is tuned for, but the tool pages are theirs.

## Product Purpose

A personal site for Vaishnav Chincholkar, senior Unity developer, that gets him
taken seriously for senior/lead Unity roles in an international market.

Success is a hiring manager who lands from a profile link and, within one
screen, believes the depth claim — then has somewhere concrete to go and verify
it. The tools, shipped titles, and timeline exist to make that belief checkable
rather than asserted.

## Positioning

Depth at scale, demonstrated rather than described. The distinguishing claim is
not "Unity developer with 4 years" — it is that specific, verifiable, hard
things were built and shipped: a 20-player Battle Royale end to end including
matchmaking and disconnect recovery; 81,521 physics props held in one
multiplayer scene; rope physics written from scratch for a store-listed title;
a 6-person team led across 4 client projects.

The editor tools are a second, different kind of proof: they show taste and
judgment about developer workflow, not just the ability to execute a spec. Each
one deliberately fixes exactly one problem ("One Tool == One Job").

## Operating Context

- **Dominant entry path:** a LinkedIn profile link, frequently on mobile. The
  share card is therefore seen by more people than the page itself — Open Graph
  metadata is functional surface, not an afterthought.
- **Reading pattern:** a fast skim under time pressure, comparing against other
  candidates. Anything requiring assembly from scattered evidence goes unread.
  Both `/experience/` and the landing page already answer first, then support.
- **Secondary paths:** GitHub repos, the Unity Asset Store publisher page, and
  direct links to individual tool pages and manuals.
- **Authoring:** the owner edits data files and HTML directly and deploys by
  pushing. There is no CMS, staging environment, or review step.

## Capabilities and Constraints

- **Hard constraint: GitHub Pages hosting.** Static files only. No server-side
  logic, no databases, no server-rendered routes. Paths are written from the
  repo root (`/assets/…`, `/tools/…`) because the site is served at a domain
  root.
- **Canonical domain: `thevaishnav.github.io`.** The `og:url` and
  `<link rel="canonical">` on `/experience/` currently declare
  `itsdevlogger.github.io` — that is stale and wrong, and should be corrected
  wherever it appears.
- **Surfaces that exist:** landing page (intro + tools), `/experience/`
  (dated timeline), `/contributions/` (filterable project list), per-tool pages
  under `/tools/`, and a user manual for Pivot++. A contact popup is available
  site-wide via `#contact`.
- **Content model:** adding a tool, contribution, or contact channel is a single
  edit to the relevant data file; renderers handle the rest. New tags in
  `contributions.js` automatically become filters.
- **Constraint explicitly released by the owner:** the long explanatory code
  comments throughout the HTML and JS are *not* a commitment and may be removed
  or trimmed.
- **Pivot++ is currently disabled** — its entry in `scripts/tools.js` is
  commented out, though its pages, assets, and manual remain in the repo. Its
  status is undecided; do not treat it as shipped or as removed.
- **Not established:** whether the site must remain usable with JavaScript
  disabled. The current code writes fallback values into the HTML and degrades
  gracefully, but this was not confirmed as a requirement.

## Brand Commitments

- **Name:** Vaishnav Chincholkar. The handle `itsdevlogger` appears in GitHub
  org paths and the owner's email; the site itself is under the personal name.
- **Existing marks:** `assets/img/logo-256.png` (also the share-card image),
  `assets/img/logo-64.png`, and `assets/img/pivot/icon.png` (favicon).
- **Voice, as written today:** plain, specific, unhyped. States what was built
  rather than what it was. Explicitly disclaims proximity — "every claim on this
  page is something I built or led rather than sat near."
- **Tone rule the copy already keeps:** figures are floors, not totals ("More
  than 4 years", "More than 7 contributions").

## Evidence on Hand

Real and linkable:

- **Video demonstrations** (YouTube) of the Battle Royale mode, virtual estate
  system, and character customization.
- **Live store listings:** Free the Girl and Balls to Cup on the App Store.
- **Open-source repositories:** `itsdevlogger/quick-access-window`,
  `itsdevlogger/unity-cli-skill`.
- **Unity Asset Store publisher page:** publisher 105229.
- **A LinkedIn write-up** on the 81,521-props problem.
- **Screenshots and cover art** under `assets/img/`, including annotated Quick
  Access captures and Pivot++ overlay comparisons.
- **Contact channels:** email, LinkedIn, Asset Store, phone.

Deliberately absent — **do not fabricate these**: testimonials, client quotes,
named references, download or install counts, revenue or pricing figures,
performance benchmarks beyond those already stated, and any employer or client
name not already in the timeline.

## Product Principles

1. **Every claim is checkable on the same page.** A number, badge, or status
   only appears when a link beside it proves it. This is already enforced in the
   contributions data model and must not erode.
2. **Answer before the scroll.** The audience decides in seconds under
   comparison pressure. State the conclusion first; the long form supports it.
   Never require a reader to assemble the headline themselves.
3. **The work argues, not the logos.** The primary audience does not recognize
   the studios. Lead with what was built and at what scale.
4. **Two pages, one truth.** `/experience/` and `/contributions/` describe the
   same work from opposite ends. They must never drift apart.
5. **One tool, one job.** The product philosophy behind the tools is also the
   editorial one — say the single thing, well, rather than everything.

## Accessibility & Inclusion

No product-specific standard was established. The dominant entry path is mobile
from a social link, so mobile-first legibility and touch targets are functional
requirements rather than accessibility extras.
