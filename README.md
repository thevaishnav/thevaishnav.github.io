# itsdevlogger.github.io

Portfolio site for editor-only Unity tools. Static HTML/CSS/JS — no build step.
Served by GitHub Pages from `main` at the repo root, so **file paths are public URLs**.

## Pages

| File                                  | URL                        | Purpose                                 |
| ------------------------------------- | -------------------------- | --------------------------------------- |
| `index.html`                          | `/`                        | Landing page; tool cards render from JS |
| `tools/pivot/index.html`              | `/tools/pivot/`            | Pivot++ scrollytelling showcase         |
| `tools/pivot/user-manual/index.html`  | `/tools/pivot/user-manual/`| Pivot++ user manual                     |
| `tools/unity-cli/index.html`          | `/tools/unity-cli/`        | Unity CLI skill landing page            |
| `tools/quick-access/index.html`       | `/tools/quick-access/`     | Quick Access landing page               |

Contact is not a page. It is a popup that opens over whatever page you are on,
available site-wide from the nav — see below.

**Every page is an `index.html` inside a folder named for its URL.** That is what
keeps the URLs clean: a request for `/tools/unity-cli/` is served the `index.html`
in that folder, so no visitor ever sees a `.html` extension. A tool with more than
one page nests them (`tools/pivot/` is the showcase, `tools/pivot/user-manual/` sits
inside it), which makes the URL read as the hierarchy it actually is.

Page URLs are linked from external listings (Unity Asset Store, GitHub). Renaming
or moving one breaks those links, and GitHub Pages has no redirect engine — so the
old paths under `pages/` are kept as one-line stubs that `<meta refresh>` to the new
URL. Do the same for any future move; do not delete the existing stubs.

## Layout

```
index.html
tools/
  unity-cli/index.html
  quick-access/index.html
  pivot/
    index.html           the showcase — /tools/pivot/
    pivot-showcase.css   the showcase's own styles, next to the page
    pivot-showcase.js
    user-manual/index.html
pages/                   redirect stubs only, at the pre-2026 URLs — see above
assets/
  css/            The shared design system, split by concern. Pages link only
                  style.css; it @imports the rest, and the import order is the
                  cascade order, so it is deliberate rather than alphabetical:
                    style.css     entry point — the import list, no rules
                    tokens.css    colours, --nav-h, --gutter
                    base.css      reset, page shell, type scale, .wrap, focus
                    nav.css       the sticky site header
                    buttons.css   .btn and the action rows
                    cards.css     tool cards, ghost card, featured card + glow
                    hero.css      landing hero, gizmo, subpage intros
                    content.css   figures, splits, meta strip, CTA, code, tables
                    doc.css       manual layout: sticky TOC + prose column
                    contact.css   the contact <dialog>
  img/pivot/      Pivot++ screenshots and icons
scripts/
  site-header.js    The shared top nav — every page renders its header from here,
                    and it also loads the two contact scripts below
  tools.js          TOOLS_DATA — the content source for the landing page
  render-tools.js   Renders TOOLS_DATA into index.html
  contact.js        CONTACT_DATA — every way to reach me, in one place
  render-contact.js Builds the contact popup; on every page, opened by #contact
```

## Contact details

`scripts/contact.js` holds `CONTACT_DATA` — email, LinkedIn, phone and the
Asset Store publisher page. It is the only file with those values in it, so
changing one there changes it everywhere. Adding a channel means one entry in
`CONTACT_DATA.channels` plus an icon in `ICONS` in `render-contact.js`; no HTML
needs to change.

These render into a popup rather than a page: `scripts/render-contact.js` builds
a `<dialog>` and appends it to every page, and `site-header.js` loads both
scripts so no page has to. The open state lives in the URL as `#contact`, which
makes the nav entry a plain hash link, makes any page's `#contact` URL
shareable, and makes Back close the popup instead of leaving the page.

There is no `.env` here, and this data could not live in one: the site is
static with no build step, so anything the page reads is fetched by the
browser and public by definition. Never put a secret (an API key, a token) in
this file or anywhere else in the repo — treat everything committed here as
published.

## The header

Every page carries a placeholder plus the shared script instead of its own nav
markup:

```html
<div id="site-header"></div>
<script src="/scripts/site-header.js"></script>
```

The header is the same on every page — same brand, same links, same order.
There is no per-page variation, by design: `LINKS` in
`scripts/site-header.js` is the entire site navigation, so putting a page in
the nav is one entry there and it shows up everywhere at once.

There is no per-page value in that snippet, and that is deliberate: the header is
identical everywhere, so it can be copied between pages unchanged. The link
matching the current page gets `.is-current` — marked, not removed, so the nav
keeps the same shape everywhere.

**Write every internal path from the site root** — `/assets/css/style.css`,
`/scripts/site-header.js`, `/tools/pivot/`. Never `../assets/...`. Pages now sit at
several different depths, and a root-absolute path is the same string at all of
them, so moving a page never breaks its links. This works because the site is a
user site served at the root of `itsdevlogger.github.io`; it would need a prefix on
a project site served from a subfolder.

Two exceptions, both correct as-is: `@import` inside `assets/css/style.css` is
relative to that file and stays bare (`tokens.css`), and `tools/pivot/index.html`
loads its own neighbouring `pivot-showcase.css` / `.js` the same way.

## Adding a tool to the landing page

Edit `TOOLS_DATA` in `scripts/tools.js`. `highlight` is the single featured
tool; `tools` is the card grid. No other file needs to change.

## Local preview

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>. Opening the HTML files directly via `file://`
works too, but relative paths behave better over HTTP.
